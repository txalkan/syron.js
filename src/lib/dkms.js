import { generateRandomBytes } from './crypto-util'
import Arweave from 'arweave'
import * as tyron from 'tyron'
const zcrypto = tyron.Util.default.Zcrypto()

export async function operationKeyPair({ arConnect, id, addr }) {
    const private_key = zcrypto.schnorr.generatePrivateKey()
    const public_key = '0x' + zcrypto.getPubKeyFromPrivateKey(private_key)
    let encrypted_key = ''
    if (arConnect !== null) {
        encrypted_key = await encryptKey(arConnect, private_key).catch(() => {
            console.log('AC issue')
        })
    }
    const verification_method = {
        id: id,
        key: public_key,
        encrypted: encrypted_key,
    }
    const doc_element = {
        constructor: tyron.DocumentModel.DocumentConstructor.VerificationMethod,
        action: tyron.DocumentModel.Action.Add,
        key: verification_method,
    }
    const doc_parameter = await tyron.TyronZil.default.documentParameter(
        addr,
        doc_element
    )

    return {
        element: doc_element,
        parameter: doc_parameter,
    }
}

export async function generatePublicEncryption(privKey) {
    let privateKey = Object.create(privKey)
    const algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }
    const keyData = {
        kty: 'RSA',
        e: 'AQAB',
        n: privateKey.n,
        alg: 'RSA-OAEP-256',
        ext: true,
    }
    const publicKey = await crypto.subtle.importKey(
        'jwk',
        keyData,
        algo,
        false,
        ['encrypt']
    )
    const keyBuf = await generateRandomBytes(256)
    const encryptedPublicKey = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        keyBuf
    )
    let publicEncryption = Arweave.utils.concatBuffers([
        encryptedPublicKey,
        keyBuf,
    ])
    publicEncryption = Arweave.utils.bufferTob64Url(publicEncryption)
    return publicEncryption
}

export async function generateSsiKeys(arweave) {
    const privateKey = await arweave.wallets.generate()
    const keyData = {
        kty: privateKey.kty,
        e: privateKey.e,
        n: privateKey.n,
        alg: 'RSA-OAEP-256',
        ext: true,
    }
    const algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }
    const publicKey = await crypto.subtle.importKey(
        'jwk',
        keyData,
        algo,
        false,
        ['encrypt']
    )
    const keyBuf = await generateRandomBytes(256)
    const encryptedPublicKey = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        keyBuf
    )
    let publicEncryption = Arweave.utils.concatBuffers([
        encryptedPublicKey,
        keyBuf,
    ])
    publicEncryption = Arweave.utils.bufferTob64Url(publicEncryption)

    return {
        privateKey: privateKey,
        publicEncryption: publicEncryption,
    }
}

export async function encryptKey(arConnect, key) {
    let encryptedKey = await arConnect.encrypt(key, {
        //(JSON.stringify(key), {
        algorithm: 'RSA-OAEP',
        hash: 'SHA-256',
    })
    encryptedKey = Arweave.utils.bufferTob64Url(encryptedKey)
    return encryptedKey
}

export async function decryptKey(arConnect, encryptedKey) {
    const encryptedArray = Arweave.utils.b64UrlToBuffer(encryptedKey)
    const decryptedKey = await arConnect.decrypt(encryptedArray, {
        algorithm: 'RSA-OAEP',
        hash: 'SHA-256',
    })
    return decryptedKey
}

export async function encryptData(data, publicEncryption) {
    const publicEnc = Arweave.utils.b64UrlToBuffer(publicEncryption)
    const encKey = new Uint8Array(publicEnc.slice(0, 512))
    const keyBuf = new Uint8Array(publicEnc.slice(512))

    const contentBuf = new TextEncoder().encode(JSON.stringify(data))

    const encryptedContent = await Arweave.crypto.encrypt(contentBuf, keyBuf)
    let encryptedData = Arweave.utils.concatBuffers([encKey, encryptedContent])
    encryptedData = Arweave.utils.bufferTob64Url(encryptedData)

    return encryptedData
}

export async function decryptData(data, decKey) {
    const encryptedArray = Arweave.utils.b64UrlToBuffer(data)
    let encryptedBuffer = encryptedArray.buffer
    const encKey = new Uint8Array(encryptedBuffer.slice(0, 512))
    const encryptedData = new Uint8Array(encryptedBuffer.slice(512))

    let key = Object.create(decKey)
    key.alg = 'RSA-OAEP-256'
    key.ext = true
    const algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }
    key = await crypto.subtle.importKey('jwk', key, algo, false, ['decrypt'])
    const symmetricKey = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        key,
        encKey
    )

    let decryptedData = await Arweave.crypto.decrypt(
        encryptedData,
        symmetricKey
    )
    decryptedData = Arweave.utils.bufferToString(decryptedData)
    return decryptedData
}
