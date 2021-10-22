import * as tyron from 'tyron';
import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $user } from 'src/store/user';
import { $contract } from 'src/store/contract';
import { $arconnect } from 'src/store/arconnect';
import { operationKeyPair } from 'src/lib/dkms';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import styles from './styles.module.scss';
import { TyronDonate } from '..';
import { $donation, updateDonation } from 'src/store/donation';

function Component() {
    const [currency1, setCurrency1] = useState('');
    const [currency2, setCurrency2] = useState('');
    const [error, setError] = useState('');

    const handleOnChange1 = (event: { target: { value: any; }; }) => {
        setError('');
        setCurrency1(event.target.value);
    };
    const handleOnChange2 = (event: { target: { value: any; }; }) => {
        setError('');
        setCurrency2(event.target.value);
    };

    const zilpay = new ZilPayBase();
    const arConnect = useStore($arconnect);
    const user = useStore($user);
    const contract = useStore($contract);
    const [input, setInput] = useState('');
    const[button, setButton] = useState('button primary');
    const[legend, setLegend] = useState('Continue');
    const donation = useStore($donation);
    const[done, setDone] = useState('');
    const [hideDonation, setHideDonation] = useState(true);

    const handleInput = (event: { target: { value: any; }; }) => {
        setLegend('continue');
        setButton('button primary');
        const input_ = event.target.value;
        setInput(String(input_).toLowerCase());
        setHideDonation(true);
    };
    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setHideDonation(false),
            setButton('button'),
            setLegend('saved')
        }
    };

    const handleInit = async () => {
        if( arConnect === null ){
            alert('To continue, sign in with your SSI private key.')
        } else if ( contract !== null) {
            let addr;
            const result = await operationKeyPair(
                {
                    arConnect: arConnect,
                    id: 'swap',
                    addr: contract.addr
                }
            )
            const did_key = result.element.key.key;
            const encrypted = result.element.key.encrypted;
            const params = [];
            const addr_: tyron.TyronZil.TransitionParams = {
                vname: 'addr',
                type: 'ByStr20',
                value: addr,
                };
            params.push(addr_);
            const did_key_: tyron.TyronZil.TransitionParams = {
                vname: 'didKey',
                type: 'ByStr33',
                value: did_key,
            };
            params.push(did_key_);
            const encrypted_: tyron.TyronZil.TransitionParams = {
                vname: 'encrypted',
                type: 'String',
                value: encrypted,
            };
            params.push(encrypted_);
            const domain_: tyron.TyronZil.TransitionParams = {
                vname: 'domain',
                type: 'String',
                value: 'swap',
            };
            params.push(domain_);
            const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'Uint128', String(Number(donation)*1e12));
            const tyron__: tyron.TyronZil.TransitionParams = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: tyron_,
            };
            params.push(tyron__);
            const res = await zilpay.call({
                contractAddress: contract.addr,
                transition: 'Dns',
                params: params as unknown as Record<string, unknown>[],
                amount: String(donation) //@todo-ux would u like to top up your wallet as well?
            });
            setDone(
                `The transaction was successful! ID: ${res.ID}.
                Wait a little bit, and then search for ${user?.nft}.swap to access its features.`);
            updateDonation(null);
        }
    };

    return (
        <>
        <div className={ styles.container2 }>
            <code>Swap from:</code>
            <select onChange={ handleOnChange1 }>
                <option value="">choose currency</option>
                <option value="ZIL">$ZIL</option>
                <option value="XCAD">$XCAD</option>
                <option value="gZIL">$gZIL</option>
                <option value="XSGD">$SGD</option>
                <option value="Lunr">$Lunr</option>
                <option value="PORT">$PORT</option>
                <option value="ZWAP">$ZWAP</option>
                <option value="zUSDT">$USD</option>
                <option value="zETH">$ETH</option>
                <option value="zWBTC">$BTC</option>
                <option value="SCO">$SCO</option>
                <option value="TYRON">$TYRON</option>
            </select>
            <code>To:</code>
            <select onChange={ handleOnChange2 }>
                <option value="">choose currency</option>
                <option value="ZIL">$ZIL</option>
                <option value="XCAD">$XCAD</option>
                <option value="gZIL">$gZIL</option>
                <option value="XSGD">$SGD</option>
                <option value="Lunr">$Lunr</option>
                <option value="PORT">$PORT</option>
                <option value="ZWAP">$ZWAP</option>
                <option value="zUSDT">$USD</option>
                <option value="zETH">$ETH</option>
                <option value="zWBTC">$BTC</option>
                <option value="SCO">$SCO</option>
                <option value="TYRON">$TYRON</option>
            </select>
        </div>
        {
            currency1 !== '' && currency2 !== '' && currency1 !== currency2 &&
                <div className={ styles.container2 }>
                    <code>{currency1}</code>
                    <input 
                        style={{ width: '30%'}}
                        type="text"
                        placeholder="Type amount"
                        onChange={ handleInput }
                        onKeyPress={ handleOnKeyPress }
                        autoFocus
                    />
                    <code>= ... ${currency2}</code>
                    <input style={{ marginLeft: '2%'}} type="button" className={ button } value={ legend }
                        onClick={ () => {
                            setLegend('Saved');
                            setButton('button');
                            setHideDonation(false);
                        }}
                    />
                </div>
        }
        {
            !hideDonation && done === '' &&
                <TyronDonate />
        }
        {
            input !== '' && donation !== null &&
                <>
                <p style={{ marginTop: '6%' }}>Then, save your new domain into your DID<span style={{ textTransform: 'lowercase'}}>x</span>Wallet:</p>
                <input
                    type="button"
                    className="button primary"
                    value= { `Save ${input} as your swap domain` }
                    style={{ marginTop: '1%', marginBottom: '1%' }}
                    onClick={ handleInit }
                />
                </>
        }
        {
            done !== '' &&
                <code>
                    {done}
                </code>
        }
        {
            error !== '' &&
                <code>
                    Error: {error}
                </code>
        }
        </>
    );
}

export default Component;
