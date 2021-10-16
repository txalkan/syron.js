import { DidScheme, Resolver, DidDocument } from 'tyron';

export const isValidUsername = (username: string) =>
    /^[\w\d_]+$/.test(username) && username.length > 6 && username.length < 16;

const network = DidScheme.NetworkNamespace.Testnet;
export const initTyron = '0x25a7bb9d8b2a82ba073a3ceb3b24b04fb0a39260'; // @todo Resolver.InitTyron.Testnet vs env variable
    
export const fetchAddr = async ({
    username,
    domain
}: {
    username: string;
    domain: string;
}) => {
    const addr = await Resolver.default
        .resolveDns(network, initTyron, username, domain)
        .catch((err) => {
            throw err;
        });

    return addr;
};

export const resolve = async ({ addr }: { addr: string }) => {
    const did_doc: any[] = [];
    const resolution_input: DidDocument.ResolutionInput = {
        addr: addr,
        metadata: {
            accept: DidDocument.Accept.contentType //resolve it as DID Document
        }
    };
    alert("1")
    const doc = await DidDocument.default.resolution(network, resolution_input) as DidDocument.default;
    
    alert("12")
    const controller = doc.controller;
    alert(controller);
    did_doc.push(['Decentralized identifier', [doc.id]]);
    if (doc.services !== undefined) {
        const services = [];
        for (const service of doc.services) {
            const hash_index = service.id.lastIndexOf('#');
            const id = service.id.substring(hash_index + 1)+ ': ';
            if( service.address ){
                services.push([id, service.address])
            } else if ( service.uri ){
                services.push([id, service.uri]);
            }
        }
        did_doc.push(['DID services', services]);
    }
    if (doc.verificationMethods.socialRecovery !== undefined) {
        did_doc.push([
            'DID Social Recovery key: ',
            [doc.verificationMethods.socialRecovery.publicKeyBase58]
        ]);
    }
    if (doc.verificationMethods.publicKey) {
        did_doc.push([
            'General-purpose key',
            [doc.verificationMethods.publicKey.publicKeyBase58]
        ]);
    }
    if (doc.verificationMethods.authentication !== undefined) {
        did_doc.push([
            'Authentication key',
            [doc.verificationMethods.authentication.publicKeyBase58]
        ]);
    }
    if (doc.verificationMethods.assertionMethod !== undefined) {
        did_doc.push([
            'Assertion key',
            [doc.verificationMethods.assertionMethod.publicKeyBase58]
        ]);
    }
    if (doc.verificationMethods.capabilityDelegation !== undefined) {
        did_doc.push([
            'Delegation key',
            [doc.verificationMethods.capabilityDelegation.publicKeyBase58]
        ]);
    }
    if (doc.verificationMethods.capabilityInvocation !== undefined) {
        did_doc.push([
            'Invocation key',
            [doc.verificationMethods.capabilityInvocation.publicKeyBase58]
        ]);
    }
    if (doc.verificationMethods.keyAgreement !== undefined) {
        did_doc.push([
            'Agreement key: ',
            [doc.verificationMethods.keyAgreement.publicKeyBase58]
        ]);
    }

    return {
        controller: controller,
        doc: did_doc
    };
};
