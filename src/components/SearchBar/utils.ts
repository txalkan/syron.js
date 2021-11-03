import * as tyron from 'tyron';

export const isValidUsername = (username: string) =>
    /^[\w\d_]+$/.test(username) && username.length > 6 && username.length < 16;

const network = tyron.DidScheme.NetworkNamespace.Testnet;
export const initTyron = '0xc85Bc1768CA028039Ceb733b881586D6293A1d4F'; // @todo Resolver.InitTyron.Testnet vs env variable
    
export const fetchAddr = async ({
    username,
    domain
}: {
    username: string;
    domain: string;
}) => {
    const addr = await tyron.Resolver.default
        .resolveDns(network, initTyron, username, domain)
        .catch((err) => {
            throw err;
        });

    return addr;
};

export const resolve = async ({ addr }: { addr: string }) => {
    const did_doc: any[] = [];
    const state = await tyron.State.default.fetch(network, addr);

    let did;
    if( state.did == ''){
        did = 'not created yet.'
    } else {
        did = state.did
    }
    did_doc.push(['Decentralized identifier', [did]]);
    
    const controller = state.controller;

    if( state.services_ && state.services_?.size !== 0 ) {
        
        const services = [];
        for( const id of state.services_.keys() ) {
            const result = state.services_.get(id);
            if( result && result[1] !== '' ){
                services.push([id, result[1]])
            }
        }
        did_doc.push(['DID services', services]);
    }
    
    if( state.verification_methods ){
        if ( state.verification_methods.get('socialRecovery') ) {
            did_doc.push([
                'DID Social Recovery key: ',
                [state.verification_methods.get('socialRecovery')]
            ]);
        }
        if ( state.verification_methods.get('general') ) {
            did_doc.push([
                'General-purpose key',
                [state.verification_methods.get('general')]
            ]);
        }
        if ( state.verification_methods.get('authentication') ) {
            did_doc.push([
                'Authentication key',
                [state.verification_methods.get('authentication')]
            ]);
        }
        if( state.verification_methods.get('assertion') ) {
            did_doc.push([
                'Assertion key',
                [state.verification_methods.get('assertion')]
            ]);
        }
        if( state.verification_methods.get('agreement') ) {
            did_doc.push([
                'Agreement key: ',
                [state.verification_methods.get('agreement')]
            ]);
        }
        if( state.verification_methods.get('invocation') ) {
            did_doc.push([
                'Invocation key',
                [state.verification_methods.get('invocation')]
            ]);
        }
        if( state.verification_methods.get('delegation') ) {
            did_doc.push([
                'Delegation key',
                [state.verification_methods.get('delegation')]
            ]);
        }
    }

    return {
        status: state.did_status,
        controller: controller,
        doc: did_doc,
        dkms: state.dkms
    };
};
