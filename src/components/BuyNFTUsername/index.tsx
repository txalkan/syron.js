import React, { useState }from 'react';
import * as tyron from 'tyron';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $new_wallet, updateNewWallet } from 'src/store/new-wallet';
import { $user } from 'src/store/user';
import { DeployDid, LogIn } from '..';
import { $loggedIn } from 'src/store/loggedIn';
import { $connected } from 'src/store/connected';
import { $net } from 'src/store/wallet-network';

function Component() {
    const user = $user.getState();
    const new_wallet = useStore($new_wallet);
    const is_connected = useStore($connected);
    const logged_in = useStore($loggedIn);
    const net = useStore($net);
   
    const[txID, setTxID] = useState('');

    const handleSubmit = async () => {
            alert(`
                You're about to buy the ${user?.nft} NFT Username for TYRON 10. 
                Since your xWallet doesn't have any TYRON yet, you'll use ZIL to buy TYRON directly from ZilSwap and use them as payment.    
            `);
            const zilpay = new ZilPayBase();
            let addr;
            if ( new_wallet !== null ){
                addr = new_wallet;
                alert('You must wait a little bit until your contract address gets confirmed on the blockchain, or ZilPay will say the address is null.')
            } else {
                addr = logged_in?.address as string;
            }
            const id = "zil";
            const zilamount = 200;
            
            const username = user?.nft as string;
            const guardianship = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'ByStr20', addr);
            const tyron_= await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');
            
            const tx_params = await tyron.TyronZil.default.BuyNFTUsername(
                username,
                guardianship,
                id,
                tyron_
            );
        
            const res = await zilpay.call({
                contractAddress: addr,
                transition: 'BuyNFTUsername',
                params: tx_params as unknown as Record<string, unknown>[],
                amount: String(zilamount)
            });
            setTxID(res.ID)
            updateNewWallet(null);
    };

    return (
        <>
            <h1 style={{ textAlign: 'center', marginBottom: '6%' }}>
                Buy{' '}
                <span className={styles.username}>
                    {user?.nft}
                </span>
                {' '}NFT Username
            </h1>
            {
                txID === '' &&
                <>
                {
                    is_connected && new_wallet !== null && logged_in === null &&
                        //@todo-net wait until contract deployment got confirmed
                        <h4>
                            You have a new DID<span className={ styles.x }>x</span>Wallet at this address:{' '}
                            <a
                                href={`https://viewblock.io/zilliqa/address/${ new_wallet }?network=${ net }`}
                            >
                                <span className={ styles.x }>
                                    { new_wallet }
                                </span>
                            </a>
                        </h4>
                }
                {
                is_connected && logged_in  !== null && logged_in.username &&
                    <h3>
                        You have logged in with <span className={ styles.x }>{ logged_in?.username }.did</span>
                    </h3>
                }
                {
                    is_connected && logged_in  !== null && !logged_in.username &&
                        <h3>
                            You have logged in with{' '}
                            <a
                                className={ styles.x }
                                href={`https://viewblock.io/zilliqa/address/${ logged_in?.address }?network=${ net }`}
                            >
                                { logged_in?.address }
                            </a>
                        </h3>
                }
                {
                is_connected && ( new_wallet !== null || logged_in !== null ) &&
                    <div style={{ marginTop: '6%' }}>
                        <button className={ styles.button } onClick={ handleSubmit }>
                            Buy{' '}
                                <span className={styles.username}>
                                    {user?.nft}
                                </span>
                            {' '}NFT Username
                        </button>
                    </div>
                }
                {
                    is_connected && new_wallet === null && logged_in === null &&
                        <div>
                            <ul>
                                <li className={ styles.container }>
                                    <DeployDid />
                                </li>
                                <li>
                                    <code>Or log in to one of your wallets:</code>
                                    <div style={{ textAlign: 'center' }}>
                                        <LogIn />
                                    </div>
                                </li>
                            </ul>
                        </div>
                }
                </>
            }
            {
                !is_connected &&
                    <code>This NFT Username is available. To buy it, you must sign in with ZilPay.</code>
            }            
            {
                txID !== '' &&
                    <code>
                        Transaction ID:{' '}
                            <a
                                href={`https://viewblock.io/zilliqa/tx/${ txID }?network=${ net }`}
                            >
                                { txID }
                            </a>
                    </code>
            }
        </>
    );
}

export default Component;
