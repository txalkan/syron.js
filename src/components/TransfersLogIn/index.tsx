import React, { useState } from 'react';
import * as tyron from 'tyron';
import styles from './styles.module.scss';
import { fetchAddr } from '../SearchBar/utils';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $wallet } from 'src/store/wallet';
import { updateLoggedIn } from 'src/store/loggedIn';
import * as zcrypto from '@zilliqa-js/crypto';
import { useStore } from 'effector-react';
import { $net } from 'src/store/wallet-network';

function Component() {
    const net = useStore($net);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [account, setAccount] = useState('');
    const [xwallet, setXwallet] = useState('');
    const [domain, setDomain] = useState('');
    const [input, setInput] = useState('')
    const [legend, setLegend] = useState('Save')
    const [button, setButton] = useState('button primary')

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

    const handleSave = async () => {
        setLegend('Saved');
        setButton('button');
    };

    const handleOnChange = (event: { target: { value: any; }; }) => {
        setError(''); setXwallet(''); setDomain('');
        const login_ = event.target.value;
        if( login_ === 'zilpay'){
            updateLoggedIn({
                address: 'zilpay'
            })
        }
        setAccount(event.target.value);
    };

    const handleOnChange2 = (event: { target: { value: any; }; }) => {
        setError(''); setDomain('');
        setXwallet(event.target.value);
    };

    const handleOnChange3 = (event: { target: { value: any; }; }) => {
        setError('');
        setDomain(event.target.value);
    };
    
    const handleInput = ({
        currentTarget: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setInput(value.toLowerCase());
    };

    const handleContinue = async () => {
        if( domain === '' ){
            setError('select a domain.')
        } else{
            resolveUser();
        }
    };
    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if( key === 'Enter' ){
            handleContinue();
        }
    };

    const resolveUser = async () => {
        setError(''); setLoading(true);
        if( domain === 'did' ){
            await fetchAddr({ net, username: input, domain: domain })
            .then(async (addr) => {
                addr = zcrypto.toChecksumAddress(addr);
                let init = new tyron.ZilliqaInit.default(tyron.DidScheme.NetworkNamespace.Testnet);      
                switch (net) {
                    case 'mainnet':
                        init = new tyron.ZilliqaInit.default(tyron.DidScheme.NetworkNamespace.Mainnet);
                }
                const state = await init.API.blockchain.getSmartContractState(addr)
                
                const controller = state.result.controller;        
                const controller_ = zcrypto.toChecksumAddress(controller);
                const zil_address = $wallet.getState();
                
                if( controller_ !== zil_address?.base16 ){ throw error } else {
                    updateLoggedIn({
                        username: input,
                        address: addr
                    });
                }
            })
            .catch(() => setError('you do not own this wallet.'));
        } else{
            alert("Coming soon!")
        }
        setLoading(false); 
    };

    const handleInput2 = (event: { target: { value: any; }; }) => {
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
    const handleOnKeyPress2 = async ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            resolveAddr();
        }
    };

    const resolveAddr = async () => {
        if( error === '' ){
            const zilpay = new ZilPayBase();
            await zilpay.getSubState(
                input,
                'controller'
            ).then( controller_ => {
                controller_ = zcrypto.toChecksumAddress(controller_);
                const zil_address = $wallet.getState();
                if( zil_address === null ){
                    alert('Connect to ZilPay to verify your EOA is the controller of this xWallet.')
                }
                if( controller_ !== zil_address?.base16 ){ throw error } else {
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
            <div className={ styles.container }>
                <select onChange={ handleOnChange }>
                    <option value="">Select</option>
                    <option value="xwallet">Tyron self-sovereign account</option>
                    <option value="zilpay">Externally owned account (EOA)</option>
                </select>
            </div>
            {
                account === 'xwallet' &&
                    <div className={ styles.container }>
                        <select onChange={ handleOnChange2 }>
                            <option value="">Select</option>
                            <option value="username">NFT Username</option>
                            <option value="address">Address</option>    
                        </select>
                    </div>
            }
            {
                xwallet === 'username' &&
                    <div className={styles.container}>
                        <input
                            type="text"
                            className={styles.searchBar}
                            onChange={ handleInput }
                            onKeyPress={ handleOnKeyPress }
                            placeholder="Type username"
                            autoFocus
                        />
                        <select onChange={ handleOnChange3 }>
                            <option value="">Select xWallet domain</option>
                            <option value="did">.did</option>
                            <option value="dex">.dex</option>
                            <option value="stake">.stake</option>
                        </select>
                        <button onClick={ handleContinue } className={ styles.searchBtn }>
                            { loading ? spinner : <i className="fa fa-search"></i> }
                        </button>
                    </div>
            }
            {
                xwallet === 'address' &&
                    <div className={ styles.container }>
                        <input
                            type="text"
                            placeholder="Type address"
                            onChange={ handleInput2 }
                            onKeyPress={ handleOnKeyPress2 }
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
                account === 'zilpay' &&
                    <div className={ styles.container }>
                        <select onChange={ handleOnChange2 }>
                            <option value="">Select</option>
                            <option value="username">NFT Username</option>
                            <option value="address">Address</option>    
                        </select>
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
