import React, { useState } from 'react';
import * as tyron from 'tyron';
import styles from './styles.module.scss';
import { fetchAddr } from '../SearchBar/utils';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $wallet } from 'src/store/wallet';
import { updateLoggedIn } from 'src/store/loggedIn';
import * as zcrypto from '@zilliqa-js/crypto'

function Component() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [logIn, setLogIn] = useState('');
    const [input, setInput] = useState('')
    const [legend, setLegend] = useState('Save')
    const [button, setButton] = useState('button primary')

    const handleSave = async () => {
        setLegend('Saved');
        setButton('button');
    };

    const handleLogIn = (event: { target: { value: any; }; }) => {
        setError('');
        setLogIn(event.target.value);
    };
    
    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

    const handleSearchBar = ({
        currentTarget: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setInput(value.toLowerCase());
    };

    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            resolveUser();
        }
    };

    const resolveUser = async () => {
        setError(''); setLoading(true);
        await fetchAddr({ username: input, domain: 'did' })
        .then(async (addr) => {
            const init = new tyron.ZilliqaInit.default(tyron.DidScheme.NetworkNamespace.Testnet);
            const state = await init.API.blockchain.getSmartContractState(addr)
            const controller = state.result.controller;        
            const this_admin = zcrypto.toChecksumAddress(controller);
            const zil_address = $wallet.getState();
            if( this_admin !== zil_address?.base16 ){ throw error } else {
                updateLoggedIn({
                    username: input,
                    address: addr
                });
            }
        })
        .catch(() => setError('you do not own this wallet.'));
        setLoading(false); 
    };

    const handleInput = (event: { target: { value: any; }; }) => {
        setError(''); setInput('');
        setLegend('save'); setButton('button primary');
        let value = event.target.value;
        try {
            value = zcrypto.fromBech32Address(value);
            setInput(value);
        } catch (error) {
            try{
                value = zcrypto.toChecksumAddress(value);
                setInput(value);
            } catch{
                setError('wrong address.')
            }
        }
    };
    const handleInputOnKeyPress = async ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            resolveAddr();
        }
    };

    const resolveAddr = async () => {
        const zilpay = new ZilPayBase();
        if( error === '' ){
            await zilpay.getSubState(
                input,
                'controller'
            ).then( this_admin => {
                this_admin = zcrypto.toChecksumAddress(this_admin);
                const zil_address = $wallet.getState();
                if( this_admin !== zil_address?.base16 ){ throw error } else {
                    updateLoggedIn({
                        address: input
                    });
                    handleSave();
                }
            }).catch( () => { setError('you do not own this wallet.') });
        }
    };

    return (
        <div>
            <div className={ styles.containerInput }>
                <select onChange={ handleLogIn }>
                    <option value="">Log in with your Tyron self-sovereign account</option>
                    <option value="Username">NFT Username</option>
                    <option value="Address">DIDxWallet address</option>
                </select>
            </div>
            {
                logIn === 'Username' &&
                    <div className={styles.containerInput}>
                        <input
                            type="text"
                            className={styles.searchBar}
                            onChange={ handleSearchBar }
                            onKeyPress={ handleOnKeyPress }
                            placeholder="Type username"
                            autoFocus
                        />
                        <span className={styles.did}>.did</span>
                        <button onClick={ resolveUser } className={ styles.searchBtn }>
                            { loading ? spinner : <i className="fa fa-search"></i> }
                        </button>
                    </div>
            }
            {
                logIn === 'Address' &&
                    <div className={ styles.containerInput }>
                        <input
                            type="text"
                            placeholder="Type address"
                            onChange={ handleInput }
                            onKeyPress={ handleInputOnKeyPress }
                            autoFocus
                        />
                        <input style={{ marginLeft: '2%'}} type="button" className={button} value={ legend }
                            onClick={ () => {
                                resolveAddr();
                            }}
                        />
                    </div>
            }
            {
                error !== '' &&
                    <code>
                        Error: {error}
                    </code>
            }
        </div>
    );
}

export default Component;
