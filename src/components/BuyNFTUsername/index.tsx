import React, { useState } from 'react';
import * as tyron from 'tyron';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $new_wallet, updateNewWallet } from 'src/store/new-wallet';
import { $user } from 'src/store/user';
import { LogIn } from '..';
import { $loggedIn } from 'src/store/loggedIn';
import { $net } from 'src/store/wallet-network';
import { $wallet } from 'src/store/wallet';

function Component() {
    const user = $user.getState();
    const zil_address = useStore($wallet);
    const new_wallet = useStore($new_wallet);
    const logged_in = useStore($loggedIn);
    const net = useStore($net);

    const [txID, setTxID] = useState('');

    const handleSubmit = async () => {
        alert(
            `You're about to buy ${user?.nft} as your username. The cost of an NFT Username is 10 TYRON. 
                Unless you're part of our SSI Community free list, you will have to wait until TYRON is available on ZilSwap.`
        );
        const zilpay = new ZilPayBase();
        let addr;
        if (new_wallet !== null) {
            addr = new_wallet;
            alert('You must wait a little bit until your contract address gets confirmed on the blockchain, or ZilPay will say the address is null.')
        } else {
            addr = logged_in?.address as string;
        }
        const id = "free";
        const username = user?.nft as string;
        const guardianship = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'ByStr20', addr);
        const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');


        const params = [];/*await tyron.TyronZil.default.BuyNFTUsername(
            username,
            guardianship,
            id,
            tyron_
        );*/
        const username_ = {
            vname: 'username',
            type: 'String',
            value: username,
        };
        params.push(username_);
        const guardianship_ = {
            vname: 'guardianship',
            type: 'Option ByStr20',
            value: guardianship,
        };
        params.push(guardianship_);
        const id_ = {
            vname: 'id',
            type: 'String',
            value: id,
        };
        params.push(id_);
        const amount_ = {
            vname: 'amount',
            type: 'Uint128',
            value: '0',   //@todo 0 because ID is tyron
        };
        params.push(amount_);
        const tyron__ = {
            vname: 'tyron',
            type: 'Option Uint128',
            value: tyron_,
        };
        params.push(tyron__);

        const res = await zilpay.call({
            contractAddress: addr,
            transition: 'BuyNFTUsername',
            params: params as unknown as Record<string, unknown>[],
            amount: String(0)
        });
        setTxID(res.ID)
        updateNewWallet(null);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '14%' }}>
            <h1 style={{ marginBottom: '7%' }}>
                Buy{' '}
                <span className={styles.username}>
                    {user?.nft}
                </span>
                {' '}NFT Username
            </h1>
            {
                zil_address === null &&
                <code>
                    This NFT Username is available. To buy it, connect to your Zilliqa externally owned account (ZilPay).
                </code>
            }
            {
                txID === '' && zil_address !== null &&
                <>
                    {
                        new_wallet === null && logged_in === null &&
                        <ul>
                            <li style={{ marginTop: '10%' }}>
                                <p>Buy this NFT Username with your Tyron self-sovereign account:</p>
                                <div style={{ textAlign: 'center' }}>
                                    <LogIn />
                                </div>
                            </li>
                        </ul>
                    }
                    {
                        new_wallet !== null && logged_in === null &&
                        //@todo-net wait until contract deployment got confirmed
                        <>
                            <h3>
                                You have a new self-sovereign account at this address:{' '}
                                <a
                                    href={`https://viewblock.io/zilliqa/address/${new_wallet}?network=${net}`}
                                    rel="noreferrer" target="_blank"
                                >
                                    <span className={styles.x}>
                                        {new_wallet}
                                    </span>
                                </a>
                            </h3>
                        </>
                    }
                    {
                        logged_in !== null && logged_in.username &&
                        <>
                            <h3>
                                You are logged in with{' '}
                                <span className={styles.x}
                                >
                                    {logged_in?.username}.did
                                </span>
                            </h3>
                        </>
                    }
                    {
                        logged_in !== null && !logged_in.username &&
                        <>
                            <h3>
                                You are logged in with{' '}
                                <a
                                    className={styles.x}
                                    href={`https://viewblock.io/zilliqa/address/${logged_in?.address}?network=${net}`}
                                    rel="noreferrer" target="_blank"
                                >
                                    {logged_in?.address}
                                </a>
                            </h3>
                        </>
                    }
                    {
                        (new_wallet !== null || logged_in !== null) &&
                        <div style={{ marginTop: '10%' }}>
                            <button className={styles.button} onClick={handleSubmit}>
                                Buy{' '}
                                <span className={styles.username}>
                                    {user?.nft}
                                </span>
                                {' '}NFT Username
                            </button>
                            <p className={styles.gascost}>
                                Gas: around 4.5 ZIL
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
        </div>
    );
}

export default Component;
