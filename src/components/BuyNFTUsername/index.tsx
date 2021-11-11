import React, { useState }from 'react';
import * as tyron from 'tyron';
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $new_wallet, updateNewWallet } from 'src/store/new-wallet';
import { $user } from 'src/store/user';
import { DeployDid, LogIn } from '..';
import { $loggedIn } from 'src/store/loggedIn';
import { $net } from 'src/store/wallet-network';
import { $wallet } from 'src/store/wallet';

function Component() {
    const user = $user.getState();
    const zil_address = useStore($wallet);
    const new_wallet = useStore($new_wallet);
    const logged_in = useStore($loggedIn);
    const net = useStore($net);
   
    const[txID, setTxID] = useState('');

    const handleSubmit = async () => {
            alert(
                `You're about to buy ${user?.nft} as your username. The cost of an NFT Username is 10 TYRON. 
                Unless you're part of our SSI Community free list, you will have to wait until TYRON is available on ZilSwap.`
            );
            const zilpay = new ZilPayBase();
            let addr;
            if ( new_wallet !== null ){
                addr = new_wallet;
                alert('You must wait a little bit until your contract address gets confirmed on the blockchain, or ZilPay will say the address is null.')
            } else {
                addr = logged_in?.address as string;
            }
            const id = "free";
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
                amount: String(0)
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
                txID === '' && zil_address !== null &&
                    <>
                    {
                        new_wallet === null && logged_in === null &&
                            <div>
                                <ul>
                                    <li className={ styles.container }>
                                        <DeployDid />
                                    </li>
                                    <li style={{ marginTop: '10%'}}>
                                        <p>Or alternatively:</p>
                                        <div style={{ textAlign: 'center' }}>
                                            <LogIn />
                                        </div>
                                    </li>
                                </ul>
                            </div>
                    }
                    {
                        new_wallet !== null && logged_in === null &&
                            //@todo-net wait until contract deployment got confirmed
                            <>
                            <h3>
                                You have a new self-sovereign account at this address:{' '}
                                <a
                                    href={`https://viewblock.io/zilliqa/address/${ new_wallet }?network=${ net }`}
                                    rel="noreferrer" target="_blank"
                                >
                                    <span className={ styles.x }>
                                        { new_wallet }
                                    </span>
                                </a>
                            </h3>
                            </>
                    }
                    {
                        logged_in !== null && logged_in.username &&
                            <>
                            <h3>
                                You have logged in with{' '}
                                <span className={ styles.x }
                                >
                                    { logged_in?.username }.did
                                </span>
                            </h3>
                            </>
                    }
                    {
                        logged_in !== null && !logged_in.username &&
                            <>
                            <h3>
                                You have logged in with{' '}
                                <a
                                    className={ styles.x }
                                    href={`https://viewblock.io/zilliqa/address/${ logged_in?.address }?network=${ net }`}
                                    rel="noreferrer" target="_blank"
                                >
                                    { logged_in?.address }
                                </a>
                            </h3>
                            </>
                    }
                    {
                        ( new_wallet !== null || logged_in !== null ) &&
                            <div style={{ marginTop: '7%' }}>
                                <button className={ styles.button } onClick={ handleSubmit }>
                                    Buy{' '}
                                        <span className={styles.username}>
                                            {user?.nft}
                                        </span>
                                    {' '}NFT Username
                                </button>
                                <code>
                                    Reference gas cost: 4.4 ZIL
                                </code>
                            </div>
                            
                    }
                    </>
            }
            {
                zil_address === null &&
                    <code>
                        This NFT Username is available. To buy it, connect to your externally owned account (ZilPay).
                    </code>
            }            
            {
                txID !== '' &&
                    <code>
                        Transaction ID:{' '}
                            <a
                                href={`https://viewblock.io/zilliqa/tx/${ txID }?network=${ net }`}
                                rel="noreferrer" target="_blank"
                            >
                                { txID }
                            </a>
                    </code>
            }
        </>
    );
}

export default Component;
