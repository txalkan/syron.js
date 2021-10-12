import React from 'react';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
//import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $new_wallet } from 'src/store/new-wallet';
import { $user } from 'src/store/user';
import { DeployDid, LogIn, TyronDonate } from '..';
import { $loggedIn } from 'src/store/loggedIn';
import { $connected } from 'src/store/connected';
import { $donation } from 'src/store/donation';

function BuyNFTUsername() {
    const user = useStore($user);
    const new_wallet = useStore($new_wallet);
    const is_connected = $connected.getState();
    const logged_in = useStore($loggedIn);
    const donation = useStore($donation);

    //const zilpay = new ZilPayBase();
    
    const handleBuy = async () => {
        let addr;
        if ( new_wallet !== null ){
            addr = new_wallet;
        } else {
            addr = logged_in?.address
            alert(addr)
        }
        alert(donation)

    };

    return (
        <>
            {
                !is_connected &&
                    <code>This NFT Username is available. To buy it, you must sign in with ZilPay.</code>
            }
            {
                is_connected && new_wallet !== null && logged_in === null &&
                    <h4>
                        You have a new DID<span className={styles.x}>x</span>Wallet at this address: <span className={styles.x}>{new_wallet}</span>
                    </h4>
            }
            {
                is_connected && logged_in !== null &&
                    <h4>
                        You have logged in as {logged_in.username}.did
                    </h4>
            }
            {
                is_connected && ( new_wallet !== null || logged_in !== null ) &&
                    <>
                        <TyronDonate />  
                        <div style={{ marginTop: '5%' }}>
                            <button className={styles.button} onClick={handleBuy}>
                                Buy{' '}
                                    <span className={styles.username}>
                                        {user?.nft}
                                    </span>
                                {' '}NFT Username
                            </button>
                        </div>
                    </>
            }
            {
                is_connected && new_wallet === null && logged_in === null &&
                    <div>
                        <h2>
                            Buy{' '}
                            <span className={styles.username}>
                                {user?.nft}
                            </span>
                            {' '}NFT Username
                        </h2>
                        <h3>First:</h3>
                        <ul>
                            <li>
                                <code>- Create a new DIDxWallet:</code>
                                <div className={ styles.container}>
                                    <DeployDid />
                                </div>
                            </li>
                            <li>
                                <code>- Or log in to one of your wallets:</code>
                                <div style={{ marginLeft: '8%' }}>
                                    <LogIn />
                                </div>
                            </li>
                            
                            
                        </ul>
                    </div>
            }
        </>
    );
}

export default BuyNFTUsername;
