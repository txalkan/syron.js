import React from 'react';
import { ReactComponent as ZilpayIcon } from '../../assets/logos/lg_zilpay.svg';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { ZilPayBase } from './zilpay-base';
import { Block, Net } from '../../types/zil-pay';
import { $wallet, updateAddress, Wallet } from '../../store/wallet';
import {
    $transactions,
    updateTxList,
    clearTxList,
    writeNewList
} from '../../store/transactions';
import { $net, updateNet } from '../../store/wallet-network';
import { $connected, updateConnected } from 'src/store/connected';
import { $contract } from 'src/store/contract';
import { updateLoggedIn } from 'src/store/loggedIn';
import { updateNewWallet } from 'src/store/new-wallet';
import { updateIsAdmin } from 'src/store/admin';

let observer: any = null;
let observerNet: any = null;
let observerBlock: any = null;

export const ZilPay: React.FC = () => {
    const is_connected = useStore($connected);
    let zil_address = useStore($wallet);
    let net = useStore($net);
    const transactions = useStore($transactions);
    const contract = useStore($contract);

    const hanldeObserverState = React.useCallback(
        (zp) => {
            updateNet(zp.wallet.net);

            if (observerNet) {
                observerNet.unsubscribe();
            }
            if (observer) {
                observer.unsubscribe();
            }
            if (observerBlock) {
                observerBlock.unsubscribe();
            }

            observerNet = zp.wallet
                .observableNetwork()
                .subscribe((net: Net) => {
                    updateNet(net);
                });

            observer = zp.wallet
                .observableAccount()
                .subscribe((acc: Wallet) => {
                    zil_address = $wallet.getState();

                    if (zil_address?.base16 !== acc.base16) {
                        updateAddress(acc);
                    }

                    clearTxList();

                    const cache = window.localStorage.getItem(
                        String(zp.wallet.defaultAccount?.base16)
                    );

                    if (cache) {
                        updateTxList(JSON.parse(cache));
                    }
                });

            observerBlock = zp.wallet
                .observableBlock()
                .subscribe(async (block: Block) => {
                    let list = $transactions.getState();
                    for (
                        let index = 0;
                        index < block.TxHashes.length;
                        index++
                    ) {
                        const element = block.TxHashes[index];

                        for (let i = 0; i < list.length; i++) {
                            const tx = list[i];

                            if (tx.confirmed) {
                                continue;
                            }

                            if (element.includes(tx.hash)) {
                                try {
                                    const res =
                                        await zp.blockchain.getTransaction(
                                            tx.hash
                                        );
                                    if (
                                        res &&
                                        res.receipt &&
                                        res.receipt.errors
                                    ) {
                                        tx.error = true;
                                    }
                                    list[i].confirmed = true;
                                } catch {
                                    continue;
                                }
                            }
                        }
                    }
                    const listOrPromises = list.map(async (tx) => {
                        if (tx.confirmed) {
                            return tx;
                        }

                        try {
                            const res = await zp.blockchain.getTransaction(
                                tx.hash
                            );

                            if (res && res.receipt && res.receipt.errors) {
                                tx.error = true;
                            }

                            tx.confirmed = true;
                            return tx;
                        } catch {
                            return tx;
                        }
                    });

                    list = await Promise.all(listOrPromises);
                    writeNewList(list);
                });

            if (zp.wallet.defaultAccount) {
                updateAddress(zp.wallet.defaultAccount);
            }

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            );

            if (cache) {
                updateTxList(JSON.parse(cache));
            }
        },
        [transactions]
    );
    //@todo update when changing zilpay wallets
    const handleConnect = React.useCallback(async () => {
        //@todo configure spinner
        try {
            const wallet = new ZilPayBase();
            const zp = await wallet.zilpay();
            const connected = await zp.wallet.connect();

            updateNet(zp.wallet.net);
            net = $net.getState();
            if( net !== 'testnet' ){
                throw "alpha must be on Zilliqa testnet. Switch network on ZilPay settings."
                //@todo-ux add link to faucet: https://dev.zilliqa.com/docs/dev/dev-tools-faucet/
            }

            if( connected && zp.wallet.defaultAccount ){
                updateAddress(zp.wallet.defaultAccount);
                alert(
                    `ZilPay connected. Address: ${zp.wallet.defaultAccount.base16}`
                );
                updateConnected(true);
            }

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            );
            if (cache) {
                updateTxList(JSON.parse(cache));
            }
            zil_address = $wallet.getState();
            if( contract?.controller === zil_address?.base16.toLowerCase() ){
                updateIsAdmin({
                    verified: true,
                    hideWallet: true,
                    legend: 'access SSI wallet'
                })
            }
        } catch (err) {
            alert(`Connection error: ${err}`)
        }
    }, []);

    const handleDisconnect = React.useCallback(async () => {
        updateAddress(null);
        updateConnected(false);
        updateNewWallet(null);
        updateLoggedIn(null);
        updateNet(null);
        updateIsAdmin({
            verified: false,
            hideWallet: true,
            legend: 'access SSI wallet'
        });
        //@todo remove session data, clean state
    }, []);

    React.useEffect(() => {
        const wallet = new ZilPayBase();

        wallet
            .zilpay()
            .then((zp: any) => {
                hanldeObserverState(zp);
            })
            .catch((err: any) => {
                alert(`Wallet error. ${err}`);
            });

        return () => {
            if (observer) {
                observer.unsubscribe();
            }
            if (observerNet) {
                observerNet.unsubscribe();
            }
            if (observerBlock) {
                observerBlock.unsubscribe();
            }
        };
    }, []);

    return (
        <>
        { 
            !is_connected &&
                <button
                type="button"
                className={styles.button}
                onClick={() => handleConnect()}
                >
                    <ZilpayIcon className={styles.zilpayIcon} />
                    <p className={styles.buttonText}>ZilPay</p>
                </button>
        }
        { 
            is_connected &&
                <button
                type="button"
                className={styles.button}
                onClick={() => handleDisconnect()}
                >
                    <ZilpayIcon className={styles.zilpayIcon} />
                    <p className={styles.buttonText}>Disconnect ZilPay</p>
                </button>
        }
        </>
    );
};

export default ZilPay;
