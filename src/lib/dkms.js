import { generateRandomBytes } from './crypto-util';
import Arweave from 'arweave';

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

export async function encryptData(arConnect, data) {
    let encryptedData = await arConnect.encrypt(
        JSON.stringify(data),
        {
            algorithm: 'RSA-OAEP',
            hash: 'SHA-256'
        }
    );
    encryptedData = Arweave.utils.bufferTob64Url(encryptedData); 
    return encryptedData;
}

export async function decryptData(arConnect, encryptedData) {
    const encryptedArray = Arweave.utils.b64UrlToBuffer(encryptedData);
    const decryptedData = await arConnect.decrypt(
        encryptedArray,
        {
            algorithm: 'RSA-OAEP',
            hash: 'SHA-256'
        }
    );
    return decryptedData;
}
