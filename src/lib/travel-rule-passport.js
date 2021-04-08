import Arweave from 'arweave';

export async function encryptTravelRulePassport(ivms101, encryptedPublicKey, keyBuf) {
    const contentEncoder = new TextEncoder();
    const contentBuf = contentEncoder.encode(JSON.stringify(ivms101));
    
    const encryptedContent = await Arweave.crypto.encrypt(contentBuf, keyBuf);
    
    const encryptedTrPassport = Arweave.utils.concatBuffers([encryptedPublicKey, encryptedContent]);
    return encryptedTrPassport;
}

export async function decryptTravelRulePassport(dataToDecrypt, decKey) {
    let key = Object.create(decKey);
    key.alg = 'RSA-OAEP-256';
    key.ext = true;
    const algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } };

    key = await crypto.subtle.importKey('jwk', key, algo, false, ['decrypt']);

    let encData = dataToDecrypt.buffer;
    const encKey = new Uint8Array(encData.slice(0, 512));
    const encryptedData = new Uint8Array(encData.slice(512))

    const symmetricKey = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, encKey)

    const decData = await Arweave.crypto.decrypt(encryptedData, symmetricKey);
    const decryptedTrPassport = Arweave.utils.bufferToString(decData);
    return decryptedTrPassport;
}
