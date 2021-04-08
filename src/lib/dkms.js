import { generateRandomBytes } from './crypto-util';

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
    
    return {
        privateKey: privateKey,
        encryptedPublicKey: encryptedPublicKey,
        keyBuf: keyBuf        
    }
}

export async function encryptData(arConnect, data) {
    const encryptedData = await arConnect.encrypt(
        JSON.stringify(data),
        {
            algorithm: 'RSA-OAEP',
            hash: 'SHA-256'
        }
    );
    return encryptedData;
}

export async function decryptData(arConnect, encryptedData) {
    const data = await arConnect.decrypt(
        encryptedData,
        {
            algorithm: 'RSA-OAEP',
            hash: 'SHA-256'
        }
    );
    return data;
}
