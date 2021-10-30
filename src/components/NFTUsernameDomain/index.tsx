import * as zcrypto from '@zilliqa-js/crypto';
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

function Component({ domain }: { 
    domain: string;
}) {
    const zilpay = new ZilPayBase();
    const arConnect = useStore($arconnect);
    const user = useStore($user);
    const contract = useStore($contract);
    const [domainAddr, setDomainAddr] = useState('');
    const[legend, setLegend] = useState('Save');
    const[button, setButton] = useState('button primary');
    const donation = useStore($donation);
    const [deployed, setDeployed] = useState(false);
    const[done, setDone] = useState('');

    const handleAddress = (event: { target: { value: any; }; }) => {
        setLegend('Save');
        setButton('button primary');
        const input = event.target.value;
        setDomainAddr(String(input).toLowerCase());
    };
    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setLegend('Saved');
            setButton('button');
        }
    };

    const handleDeploy = async () => {
        if( contract !== null ){
            const deploy = await zilpay.deployDomain(domain, contract.addr);
            let addr = deploy[1].address;
            addr = zcrypto.toChecksumAddress(addr);
            setDomainAddr(addr);
        }
        setDeployed(true); 
    };

    const handleInit = async () => {
        if( arConnect === null ){
            alert('To continue, sign in with your SSI private key.')
        } else if ( contract !== null) {
            let addr;
            try {
                if( deployed === true ){
                    addr = zcrypto.toChecksumAddress(domainAddr);
                } else {
                    addr = zcrypto.fromBech32Address(domainAddr);
                }
            } catch (error) {
                alert('Error: wrong address.')
            } 
            const result = await operationKeyPair(
                {
                    arConnect: arConnect,
                    id: domain,
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
                value: domain,
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
                Wait a little bit, and then search for ${user?.nft}.${domain} to access its features.`);
            updateDonation(null);
        }
    };

    return (
        <div className={ styles.mainContainer }>
        {
            domainAddr === '' &&
                <input
                    type="button"
                    className="button primary"
                    value= { `Create new ${user?.nft}.${domain} domain` }
                    style={{ marginTop: '3%', marginBottom: '3%' }}
                    onClick={handleDeploy}
                />
        }
        {
            !deployed &&
            <>
                <div style={{  marginLeft: '-1%', marginTop: '5%'}}>
                    <code>Or type your {domain} domain address to update your DIDxWallet:</code>
                </div>
                <section className={ styles.container }>
                    <input 
                        style={{ width: '70%'}}
                        type="text"
                        placeholder="Type Bech32 address (zil009...)"
                        onChange={ handleAddress }
                        onKeyPress={ handleOnKeyPress }
                        autoFocus
                    />
                    <input style={{ marginLeft: '2%'}} type="button" className={ button } value={ legend }
                        onClick={ () => {
                            setLegend('Saved');
                            setButton('button');
                        }}
                    />
                </section>
            </>
        }
        {
            domainAddr !== '' && done === '' &&
                <TyronDonate />
        }
        {
            domainAddr !== '' && donation !== null &&
                <>
                <p style={{ marginTop: '6%' }}>Then, save your new domain into your DID<span style={{ textTransform: 'lowercase'}}>x</span>Wallet:</p>
                <input
                    type="button"
                    className="button primary"
                    value= { `Save ${domainAddr} as your ${domain} domain` }
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
        </div>
    );
}

export default Component;
