import React, { useState } from 'react';
import { useStore } from 'effector-react';
import * as tyron from 'tyron';
import { $donation, updateDonation } from 'src/store/donation';
import { $loggedIn } from 'src/store/loggedIn';
import { $user } from 'src/store/user';
import { TransfersLogIn, TyronDonate } from '..';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import styles from './styles.module.scss';
import { $net } from 'src/store/wallet-network';
import { $contract } from 'src/store/contract';

function Component() {
    const user = useStore($user);
    const contract = useStore($contract);
    const logged_in = useStore($loggedIn);
    const donation = useStore($donation);
    const net = useStore($net);

    const [error, setError] = useState('');
    const [currency, setCurrency] = useState('');
    const [input, setInput] = useState(0);   // the amount to transfer
    const [legend, setLegend] = useState('continue');
    const [button, setButton] = useState('button primary');
    
    const [hideDonation, setHideDonation] = useState(true);
    const [hideSubmit, setHideSubmit] = useState(true);
    const [txID, setTxID] = useState('');

    const handleOnChange = (event: { target: { value: any; }; }) => {
        setError('');
        setCurrency(event.target.value);
    };
    
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0); setHideSubmit(true);
        setLegend('continue');
        setButton('button primary');
        let input = event.target.value;
        const re = /,/gi; 
        input = input.replace(re, "."); 
        const input_ = Number(input);
        if( !isNaN(input_) ){
            setInput(input_);
        }
    }

    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    };
    const handleSave = async () => {
        if( input !== 0 ){
            setLegend('saved');
            setButton('button');
            setHideDonation(false);
            setHideSubmit(false);
        }
    };

    const handleSubmit = async () => {
        if( logged_in?.address !== undefined && donation !== null)    
    {
        switch (logged_in?.address) {
            case 'zilpay':
                alert("Coming soon!")
                break;
            default: {
                const zilpay = new ZilPayBase();
                const txID = 'Transfer';
                const addr = logged_in.address;
                const addr_name = currency.toLowerCase();
                const beneficiary = {
                    constructor: tyron.TyronZil.BeneficiaryConstructor.Recipient,
                    addr: contract?.addr
                };
                const amount = input*1e12;
                    
                let tyron_;
                const donation_= donation*1e12;
                switch (donation) {
                    case 0:
                        tyron_= await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');
                        break;
                    default:
                        tyron_= await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'Uint128', donation_);
                        break;
                } 
                const tx_params = await tyron.TyronZil.default.Transfer(
                    addr,
                    addr_name,
                    beneficiary,
                    String(amount),
                    tyron_
                );
                alert(`You're about to submit a transaction to transfer ${ input } ${ currency } to ${ user?.nft}.${user?.domain}. You're also donating ZIL ${donation} to Tyron.`);
                const _amount = String(donation);
                
                await zilpay.call({
                    contractAddress: logged_in.address,
                    transition: txID,
                    params: tx_params as unknown as Record<string, unknown>[],
                    amount: _amount   //@todo-ux would u like to top up your wallet as well?
                })
                .then( res => {
                    setTxID(res.ID);
                    updateDonation(null);
                })
                .catch( err => setError(err))
                break;
            }
        }
        
    }};
    
    return (
        <div style={{ marginTop: '7%' }}>
            {
                txID === '' &&
                    <>
                    {
                        logged_in === null &&
                            <>
                            <code>You can add funds from another xWallet or ZilPay externally owned account:</code>
                            <TransfersLogIn />
                            </>
                    }
                    {
                        logged_in?.username &&
                            <h3 style={{ marginTop: '5%', marginBottom: '5%' }}>
                                You have logged in with <span className={ styles.username }>{ logged_in?.username }.did</span>
                            </h3>
                    }
                    {
                        logged_in?.address &&
                            <>
                            <code>Send {user?.nft}.{user?.domain} a direct transfer or donation:</code>
                            <div className={ styles.container2 }>
                                <select style={{ width: '30%'}} onChange={ handleOnChange }>
                                    <option value="">Select coin</option>
                                    <option value="TYRON">TYRON</option>
                                    <option value="ZIL">ZIL</option>
                                    <option value="XCAD">XCAD</option>
                                    <option value="PORT">PORT</option>
                                    <option value="XSGD">SGD</option>
                                    <option value="gZIL">gZIL</option>
                                    <option value="Lunr">Lunr</option>
                                    <option value="ZWAP">ZWAP</option>
                                    <option value="zUSDT">USD</option>
                                    <option value="zETH">ETH</option>
                                    <option value="zWBTC">BTC</option>
                                    <option value="SCO">SCO</option>
                                </select>
                                {
                                    currency !== '' &&
                                        <>
                                            <code>{currency}</code>
                                            <input 
                                                style={{ width: '30%'}}
                                                type="text"
                                                placeholder="Type amount"
                                                onChange={ handleInput }
                                                onKeyPress={ handleOnKeyPress }
                                                autoFocus
                                            />
                                            <input style={{ marginLeft: '2%'}} type="button" className={ button } value={ legend }
                                                onClick={ () => {
                                                    handleSave();
                                                }}
                                            />
                                        </>
                                }
                            </div>
                            </>
                    }
                    {
                        !hideDonation &&
                            <TyronDonate />
                    }
                    {
                        !hideSubmit && donation !== null &&
                            <button className={ styles.button } onClick={ handleSubmit }>
                                Transfer{' '}
                                <span className={ styles.x }>
                                    {input}
                                </span>
                                {' '}{currency}{' '}
                                <span style={{ textTransform: 'lowercase'}}>
                                    to
                                </span>
                                {' '}
                                <span className={ styles.username }>
                                    {user?.nft}.{user?.domain}
                                </span>
                            </button>
                    }
                    </>
            }
            {
                txID !== '' &&
                    <div style={{  marginLeft: '-5%' }}>
                        <code>
                            Transaction ID:{' '}
                                <a
                                    href={`https://viewblock.io/zilliqa/tx/${ txID }?network=${ net }`}
                                    rel="noreferrer" target="_blank"
                                >
                                    { txID }
                                </a>
                        </code>
                    </div>
            }
            {
                error !== '' &&
                    <div style={{  marginLeft: '-1%' }}>
                        <code>
                            Error: {error}
                        </code>
                    </div>
            }
        </div>
    );
}

export default Component;
