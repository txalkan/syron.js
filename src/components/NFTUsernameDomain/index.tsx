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
import { $net } from 'src/store/wallet-network';

function Component({ domain }: {
    domain: string;
}) {
    const arConnect = useStore($arconnect);
    const user = useStore($user);
    const contract = useStore($contract);
    const donation = useStore($donation);
    const net = useStore($net);

    const [input, setInput] = useState('');   // the domain address
    const [legend, setLegend] = useState('Save');
    const [button, setButton] = useState('button primary');
    const [deployed, setDeployed] = useState(false);

    const [error, setError] = useState('');
    const [txID, setTxID] = useState('');

    const handleSave = async () => {
        setLegend('saved');
        setButton('button');
    };

    const handleInput = (event: { target: { value: any; }; }) => {
        setError(''); setTxID(''); updateDonation(null);
        setInput('');
        setLegend('save');
        setButton('button primary');
        let input = event.target.value;
        try {
            input = zcrypto.fromBech32Address(input);
            setInput(input); handleSave();
        } catch (error) {
            try {
                input = zcrypto.toChecksumAddress(input);
                setInput(input); handleSave();
            } catch {
                setError('wrong address.')
            }
        }
    };
    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSubmit
        }
    };

    const handleDeploy = async () => {
        if (contract !== null && net !== null) {
            const zilpay = new ZilPayBase();
            const deploy = await zilpay.deployDomain(net, domain, contract.addr);
            let addr = deploy[1].address;
            addr = zcrypto.toChecksumAddress(addr);
            setInput(addr);
            setDeployed(true);
        } else {
            setError('some data is missing.')
        }
    };

    const handleSubmit = async () => {
        if (arConnect === null) {
            alert('To continue, connect your SSI private key to encrypt/decrypt data.')
        } else if (contract !== null && donation !== null) {
            let addr;
            if (deployed === true) {
                addr = zcrypto.toChecksumAddress(input);
            } else {
                addr = input;
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
            const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'Uint128', String(Number(donation) * 1e12));
            const tyron__: tyron.TyronZil.TransitionParams = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: tyron_,
            };
            params.push(tyron__);

            const zilpay = new ZilPayBase();
            const res = await zilpay.call({
                contractAddress: contract.addr,
                transition: 'Dns',
                params: params as unknown as Record<string, unknown>[],
                amount: String(donation) //@todo-ux would u like to top up your wallet as well?
            });
            setTxID(res.ID)
            alert(`Wait a little bit, and then search for ${user?.nft}.${domain} to access its features.`);
            updateDonation(null);
        } else {
            setError('some data is missing.')
        }
    };

    return (
        <div className={styles.mainContainer}>
            {
                txID === '' &&
                <>
                    {
                        input === '' &&
                        <input
                            type="button"
                            className="button primary"
                            value={`Create new ${user?.nft}.${domain} domain`}
                            style={{ marginTop: '3%', marginBottom: '3%' }}
                            onClick={handleDeploy}
                        />
                    }
                    {
                        !deployed &&
                        <>
                            <div style={{ marginLeft: '-2%', marginTop: '5%' }}>
                                <code>Or type your {domain} domain address to save it in your account:</code>
                            </div>
                            <section className={styles.container}>
                                <input
                                    style={{ width: '70%' }}
                                    type="text"
                                    placeholder="Type domain address"
                                    onChange={handleInput}
                                    onKeyPress={handleOnKeyPress}
                                    autoFocus
                                />
                                <input style={{ marginLeft: '2%' }} type="button" className={button} value={legend}
                                    onClick={() => {
                                        handleSubmit;
                                    }}
                                />
                            </section>
                        </>
                    }
                    {
                        input !== '' &&
                        <TyronDonate />
                    }
                    {
                        input !== '' && donation !== null &&
                        <div style={{ marginTop: '6%' }}>
                            <button className={styles.button} onClick={handleSubmit}>
                                Save{' '}
                                <span className={styles.username}>
                                    {domain} domain
                                </span>
                            </button>
                        </div>
                    }
                </>
            }
            {
                txID !== '' &&
                <div style={{ marginLeft: '-1%' }}>
                    <code>
                        Transaction ID:{' '}
                        <a
                            href={`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`}
                            rel="noreferrer" target="_blank"
                        >
                            {txID}
                        </a>
                    </code>
                </div>
            }
            {
                error !== '' &&
                <div style={{ marginLeft: '-1%' }}>
                    <code>
                        Error: {error}
                    </code>
                </div>
            }
        </div>
    );
}

export default Component;
