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

    const [input, setInput] = useState('');   // the beneficiary address
    const [legend, setLegend] = useState('save')
    const [button, setButton] = useState('button primary')
    const [error, setError] = useState('');
    const [txID, setTxID] = useState('');

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

    const handleSubmit = async () => {
        if (contract !== null) {
            alert(`You're about to transfer the ${user?.nft} NFT Username.`);

            const zilpay = new ZilPayBase();
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
