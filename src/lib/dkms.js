import { generateRandomBytes } from './crypto-util';
import Arweave from 'arweave';
import * as SmartWeave from 'smartweave';

export async function generateSsiKeys(arweave) {
    const privateKey = await arweave.wallets.generate();
    const keyData = {
        kty: privateKey.kty,
        e: privateKey.e,
        n: privateKey.n,
        alg: 'RSA-OAEP-256',
        ext: true
    };
    const algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } };                                    
    const publicKey = await crypto.subtle.importKey('jwk', keyData, algo, false, ['encrypt']);
    const keyBuf = await generateRandomBytes(256);
    const encryptedPublicKey = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, keyBuf);
    let publicEncryption = Arweave.utils.concatBuffers([encryptedPublicKey, keyBuf]);
    publicEncryption = Arweave.utils.bufferTob64Url(publicEncryption);
    
    return {
        privateKey: privateKey,
        publicEncryption: publicEncryption      
    }
}

export async function encryptKey(arConnect, key) {
    let encryptedKey = await arConnect.encrypt(
        JSON.stringify(key),
        {
            algorithm: 'RSA-OAEP',
            hash: 'SHA-256'
        }
    );
    encryptedKey = Arweave.utils.bufferTob64Url(encryptedKey); 
    return encryptedKey;
}

export async function decryptKey(arConnect, encryptedKey) {
    const encryptedArray = Arweave.utils.b64UrlToBuffer(encryptedKey);
    const decryptedKey = await arConnect.decrypt(
        encryptedArray,
        {
            algorithm: 'RSA-OAEP',
            hash: 'SHA-256'
        }
    );
    return decryptedKey;
}

export async function createPermawallet(arweave, key, permawalletTemplateID, initState) {
    const permawalletID = await SmartWeave.createContractFromTx(
        arweave,
        key,
        permawalletTemplateID,
        JSON.stringify(initState)
    );
    return permawalletID;
}
