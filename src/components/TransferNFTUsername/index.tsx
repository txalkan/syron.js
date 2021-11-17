import React, { useState } from 'react';
import * as tyron from 'tyron';
import * as zcrypto from '@zilliqa-js/crypto';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $user } from 'src/store/user';
import { $contract } from 'src/store/contract';
import { $net } from 'src/store/wallet-network';

function Component() {
    const user = $user.getState();
    const contract = useStore($contract);
    const net = useStore($net);

    const [account, setAccount] = useState('');
    const [input, setInput] = useState('');   // the beneficiary address
    const [legend, setLegend] = useState('save')
    const [button, setButton] = useState('button primary')

    const [name, setName] = useState('');
    const [legend2, setLegend2] = useState('save')
    const [button2, setButton2] = useState('button primary')

    const [error, setError] = useState('');
    const [txID, setTxID] = useState('');

    const handleOnChange = (event: { target: { value: any; }; }) => {
        setError('');
        setInput(''), setLegend('save'); setButton('button primary');
        setName(''), setLegend2('save'); setButton2('button primary');
        setAccount(event.target.value);
    };

    const handleSave = async () => {
        setLegend('saved');
        setButton('button');
    };
    const handleInput = (event: { target: { value: any; }; }) => {
        setError('');
        setInput(''); setLegend('save'); setButton('button primary');
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
    const handleOnKeyPress = async ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    };

    const handleInput2 = (event: { target: { value: any; }; }) => {
        setError('');
        setName(''); setLegend2('save'); setButton2('button primary');
        const input = event.target.value;
        if (input !== '') {
            setName(input.toLowerCase())
        }
    };
    const handleOnKeyPress2 = async ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setLegend2('saved');
            setButton2('button')
        }
    };

    const handleSubmit = async () => {
        if (contract !== null) {
            alert(`You're about to transfer the ${user?.nft} NFT Username.`);

            const zilpay = new ZilPayBase();
            if (account === 'zilpay') {
                // first, increase allowance
                alert('From a ZilPay account, the order takes 2 transactions.')
                const paramsA = [];
                const spender = {
                    vname: 'spender',
                    type: 'ByStr20',
                    value: '0xb7058d5d8e4d41022e7a9066a24ff6316941726d',   // @todo initi
                };
                paramsA.push(spender);
                const amount = {
                    vname: 'amount',
                    type: 'Uint128',
                    value: '1',   // transfer cost in TYRON
                };
                paramsA.push(amount);
                await zilpay.call({
                    contractAddress: "0xfd86b2e2f20d396c1cc1d41a16c72753d5b41279",  // @todo tyron
                    transition: 'IncreaseAllowance',
                    params: paramsA,
                    amount: String(0)
                })
                    .then(res => {
                        setTxID(res.ID)
                    })

                const params = [];
                const username_ = {
                    vname: 'username',
                    type: 'String',
                    value: name,
                };
                params.push(username_);
                const addr_ = {
                    vname: 'newAddr',
                    type: 'ByStr20',
                    value: input,
                };
                params.push(addr_);
                const guardianship = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'ByStr20');
                const guardianship_ = {
                    vname: 'guardianship',
                    type: 'Option ByStr20',
                    value: guardianship,
                };
                params.push(guardianship_);
                await zilpay.call({
                    contractAddress: "0xc85bc1768ca028039ceb733b881586d6293a1d4f",  // @todo init
                    transition: 'TransferNFTUsername',
                    params: params,
                    amount: String(0)
                })
                    .then(res => {
                        setTxID(res.ID)
                    })

            } else {
                const username = user?.nft as string;
                const guardianship = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'ByStr20', input);
                const id = "tyron";
                const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');

                const tx_params = await tyron.TyronZil.default.TransferNFTUsername(username, input, guardianship, id, tyron_);
                await zilpay.call({
                    contractAddress: contract.addr,
                    transition: 'TransferNFTUsername',
                    params: tx_params as unknown as Record<string, unknown>[],
                    amount: String(0)
                })
                    .then(res => {
                        setTxID(res.ID)
                    })
            }
        } else {
            setError('some data is missing.')
        }
    };

    return (
        <>
            {
                txID === '' &&
                <>
                    <h4 style={{ marginBottom: '6%' }}>
                        Transfer{' '}
                        <span className={styles.username}>
                            {user?.nft}
                        </span>
                        {' '}NFT Username
                    </h4>
                    <div className={styles.container}>
                        <select onChange={handleOnChange}>
                            <option value="">Select where from</option>
                            <option value="xwallet">This Tyron self-sovereign account</option>
                            <option value="zilpay">Externally owned account (ZilPay)</option>
                        </select>
                    </div>
                    {
                        account === 'zilpay' &&
                        <div className={styles.container}>
                            <input
                                type="text"
                                style={{ width: '40%' }}
                                placeholder="Type username"
                                onChange={handleInput2}
                                onKeyPress={handleOnKeyPress2}
                                autoFocus
                            />
                            <input style={{ marginLeft: '2%' }} type="button" className={button2} value={legend2}
                                onClick={() => {
                                    setLegend2('saved');
                                    setButton2('button');
                                }}
                            />
                        </div>
                    }
                    {
                        (account === 'xwallet' || legend2 === 'saved') &&
                        <>
                            <p>Recipient:</p>
                            <div className={styles.containerInput}>
                                <input
                                    type="text"
                                    style={{ width: '70%' }}
                                    placeholder="Type beneficiary address"
                                    onChange={handleInput}
                                    onKeyPress={handleOnKeyPress}
                                    autoFocus
                                />
                                <input style={{ marginLeft: '2%' }} type="button" className={button} value={legend}
                                    onClick={() => {
                                        handleSave()
                                    }}
                                />
                            </div>
                        </>
                    }

                    {
                        input !== '' &&
                        <div style={{ marginTop: '10%' }}>
                            <button className={styles.button} onClick={handleSubmit}>
                                Transfer{' '}
                                <span className={styles.username}>
                                    {user?.nft}
                                </span>
                                {' '}NFT Username
                            </button>
                            <p className={styles.gascost}>
                                Gas cost: around 13 ZIL
                            </p>
                        </div>
                    }
                </>
            }
            {
                txID !== '' &&
                <code>
                    Transaction ID:{' '}
                    <a
                        href={`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`}
                        rel="noreferrer" target="_blank"
                    >
                        {txID.substr(0, 11)}...
                    </a>
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
