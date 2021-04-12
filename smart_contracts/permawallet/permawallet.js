export function handle( state, action ){
    const input = action.input;
    const id = input.id;
    const key = input.key;
    const message = input.trp.message;
    const trkey = input.trp.key;

    if( state.ssi !== action.caller ){
        throw new ContractError('Wrong caller.')
    }

    if( input.function === 'ssi' ){
        const addr = input.ssi;
        if( typeof addr !== 'string' ){
            throw new ContractError(`Invalid address: ${ addr }.`)
        }
        state.ssi = addr;

        return { state }
    }

    if( input.function === 'ssiComm' ){
        const ssicomm = input.ssicomm;
        if( typeof ssiComm !== 'string' ){
            throw new ContractError(`Invalid SSI Communication Public Encryption Key: ${ ssicomm }.`)
        }
        if( typeof key !== 'string' ){
            throw new ContractError(`Invalid key: ${ key }.`)
        }

        state.ssiComm = ssicomm;
        state.keys.ssiComm = key;

        return { state }
    }

    if( input.function === 'trp' ) {
        if( typeof message !== 'string' ){
            throw new ContractError(`Invalid Travel Rule message: ${ message }.`)
        }
        if( typeof trkey !== 'string' ){
            throw new ContractError(`Invalid Travel Rule SSI Key: ${ trkey }.`)
        }

        state.trp.message = message;
        state.trp.key = trkey;

        return { state }
    }

    if( input.function === 'registerKey' ){
        if( typeof id !== 'string' || id.length < 3) {
            throw new ContractError(`Invalid ID: ${ id }.`)
        }
    
        if( typeof key !== 'string' ){
            throw new ContractError(`Invalid key: ${ key }.`)
        }

        if( !state.keys[id] ){
            state.keys[id] = key;
        } else {
            throw new ContractError('Key ID already registered.')
        }

        return { state }
    }
  
    if( input.function === 'updateKey' ){
        if( typeof id !== 'string' || id < 3 ){
            throw new ContractError(`Invalid ID: ${ id }.`)
        }
    
        if( typeof key !== 'string'){
            throw new ContractError(`Invalid key: ${ key }.`)
        }

        if( !state.keys[id] ){
            throw new ContractError('Key ID not registered.')
        }

        state.keys[id] = key;
        
        return { state }
    }

    if( input.function === 'deleteKey' ){
        if( typeof id !== 'string' || id < 3 ){
            throw new ContractError(`Invalid ID: ${ id }.`)
        }
    
        if( typeof key !== 'string' ){
            throw new ContractError(`Invalid key: ${ key }.`)
        }

        if( !state.keys[id] ){
            throw new ContractError('Key ID not registered.')
        }

        delete state.keys[id];
        
        return { state }
    }

    throw new ContractError(`No function supplied or function not recognised: ${ input.function }`)
}
