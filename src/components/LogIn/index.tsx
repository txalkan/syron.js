import React, { useState } from 'react';
import * as tyron from 'tyron';
import styles from './styles.module.scss';
import { fetchAddr } from '../SearchBar/utils';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $wallet } from 'src/store/wallet';
import { updateLoggedIn } from 'src/store/loggedIn';
import * as zcrypto from '@zilliqa-js/crypto'

const zilpay = new ZilPayBase();

function Component() {
    const [logIn, setLogIn] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [value, setValue] = useState('');
    const[input, setInput] = useState('')
    const[legend, setLegend] = useState('Save')
    const[button, setButton] = useState('button primary')


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
        setValue(value.toLowerCase());
    };

    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        setError('');
        if (key === 'Enter') {
            resolveUser();
        }
    };

    const resolveUser = async () => {
        setLoading(true);
        await fetchAddr({ username: value, domain: 'did' })
        .then(async (addr) => {
            const init = new tyron.ZilliqaInit.default(tyron.DidScheme.NetworkNamespace.Testnet);
            const state = await init.API.blockchain.getSmartContractState(addr)
            const controller = state.result.controller;        
            const this_admin = zcrypto.toChecksumAddress(controller);
            const zil_address = $wallet.getState();
            if( this_admin !== zil_address?.base16 ){ throw error } else {
                updateLoggedIn({
                    username: value,
                    address: addr
                });
            }
        })
        .catch(() => setError('you do not own this wallet.'));
        setLoading(false); 
    };

    const handleInput = (event: { target: { value: any; }; }) => {
        setError('');
        setLegend('Save');
        setButton('button primary');
        setInput(event.target.value);
    };
    const handleInputOnKeyPress = async ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        setError('');
        if (key === 'Enter') {
            resolveAddr();
        }
    };

    const resolveAddr = async () => {
        try {
            const addr = zcrypto.fromBech32Address(input);
            await zilpay.getSubState(
                addr,
                'admin_'
            ).then( this_admin => {
                this_admin = zcrypto.toChecksumAddress(this_admin);
                const zil_address = $wallet.getState();
                if( this_admin !== zil_address?.base16 ){ throw error } else {
                    updateLoggedIn({
                        address: addr
                    });
                }
            }).catch((error) => { throw error });
            updateLoggedIn({
                address: addr
            })
            setLegend('Saved');
            setButton('button');
        } catch (error) {
            setError('you do not own this wallet.');
        }//@todo error handling
    };

    return (
        <div>
            <div className={ styles.container }>
                <select onChange={ handleLogIn }>
                    <option value="">Log in with username or address</option>
                    <option value="Username">NFT Username</option>
                    <option value="Address">DIDxWallet address</option>
                </select>
            </div>
            {
                logIn === 'Username' &&
                    <div className={styles.container}>
                        <input
                            type="text"
                            className={styles.searchBar}
                            onChange={handleSearchBar}
                            onKeyPress={handleOnKeyPress}
                            value={value}
                            placeholder="Type username"
                            autoFocus
                        />
                        <span className={styles.did}>.did</span>
                        <button onClick={resolveUser} className={styles.searchBtn}>
                            {loading ? spinner : <i className="fa fa-search"></i>}
                        </button>
                    </div>
            }
            {
                logIn === 'Address' &&
                    <div className={ styles.container }>
                        <input
                            style={{ width: '70%'}}
                            type="text"
                            placeholder="Type Bech32 address"
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
                <code>Error: {error}</code>
            }
        </div>
    );
}

export default Component;
