import Arweave from 'arweave';

export async function encryptTravelRulePassport(ivms101, publicEncryption) {
    const publicEnc = Arweave.utils.b64UrlToBuffer(publicEncryption);
    const encKey = new Uint8Array(publicEnc.slice(0, 512));
    const keyBuf = new Uint8Array(publicEnc.slice(512))

    const contentBuf = new TextEncoder().encode(JSON.stringify(ivms101));
    
    const encryptedContent = await Arweave.crypto.encrypt(contentBuf, keyBuf);
    let encryptedTrPassport = Arweave.utils.concatBuffers([encKey, encryptedContent]);
    encryptedTrPassport = Arweave.utils.bufferTob64Url(encryptedTrPassport);
    
    return encryptedTrPassport;
}

export async function decryptTravelRulePassport(encryptedPassport, decKey) {
    const encryptedArray = Arweave.utils.b64UrlToBuffer(encryptedPassport);
    let encryptedBuffer = encryptedArray.buffer;
    const encKey = new Uint8Array(encryptedBuffer.slice(0, 512));
    const encryptedData = new Uint8Array(encryptedBuffer.slice(512));

    let key = Object.create(decKey);
    key.alg = 'RSA-OAEP-256';
    key.ext = true;
    const algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } };
    key = await crypto.subtle.importKey('jwk', key, algo, false, ['decrypt']);
    const symmetricKey = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, encKey)

    const decryptedData = await Arweave.crypto.decrypt(encryptedData, symmetricKey);
    const decryptedPassport = Arweave.utils.bufferToString(decryptedData);
    return decryptedPassport;
}
