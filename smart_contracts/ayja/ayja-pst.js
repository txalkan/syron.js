export function handle( state, action ){
    const accounts = state.accounts;
    const input = action.input;
    const originator = action.caller;
    const username = input.username;

    if( input.function === 'transfer' ){
        if( accounts[username].ssi !== originator ){
            throw new ContractError(`Permission denied - wrong caller.`)
        }
        const beneficiary = input.busername;
        if( isNaN(input.qty) ){
            throw new ContractError(`Invalid amount.`)
        }

        const amount = Math.trunc(parseFloat(input.amount) * state.divisibility);

        if( !beneficiary || typeof beneficiary !== 'string' ){
            throw new ContractError(`Beneficiary is not specified or it has a wrong format.`)
        }

        if( amount <= 0 || username === beneficiary ){
            throw new ContractError('Invalid transfer.')
        }

        if( accounts[username].balance < amount ){
            throw new ContractError(`Originator's balance not high enough to make this transfer.`)
        }

        accounts[username].balance -= amount;

        if( beneficiary in accounts ){
            // Update beneficiary account
            accounts[beneficiary].balance += amount;

        } else {
            // Initialize beneficiary account
            accounts[beneficiary].ssi = input.baddr
            accounts[beneficiary].wallet = input.bwallet
            accounts[beneficiary].balance = amount
        }

        return { state }
    }

    if( input.function === 'updateSsi' ){
        if( accounts[username].ssi !== originator ){
            throw new ContractError(`Permission denied - wrong caller.`)
        }
        const addr = input.ssi;
        if( !addr || typeof addr !== 'string' ){
            throw new ContractError(`Invalid address: ${ addr }.`)
        }
        accounts[username].ssi = addr;
        
        return { state }
    }

    if( input.function === 'updateWallet' ){
        const wallet = input.owallet;
        if( accounts[username].ssi !== originator ){
            throw new ContractError(`Permission denied - wrong caller.`)
        }
        if( !wallet || typeof wallet !== 'string' ){
            throw new ContractError(`Originator's permawallet address not given or has a wrong format: ${ wallet }.`)
        }
        accounts[username].wallet = wallet;
        
        return { state }
    }

    if( input.function === 'dns' ){
        const ssi = input.dnsssi;
        const wallet = input.dnswallet;
        if( !username || typeof username !== 'string' || username.length < 5 || username.length > 15 ){
            throw new ContractError(`Invalid username: ${ username }.`)
        }
        if( !ssi || typeof ssi !== 'string' ){
            throw new ContractError(`Invalid SSI address: ${ ssi }.`)
        }
        if( !wallet || typeof wallet !== 'string' ){
            throw new ContractError(`Invalid permawallet address: ${ wallet }.`)
        }
        if( !accounts[username] ){
            accounts[username].ssi = ssi;
            accounts[username].wallet = wallet;
            accounts[username].balance = 1
        } else{
            throw new ContractError('Username already registered.')
        }
        
        return { state }
    }
      
    throw new ContractError(`No function supplied or function not recognised: ${ input.function }`)
}
