import { useStore } from 'effector-react';
import React, { useState } from 'react';
import styles from './styles.module.scss';
import { $wallet } from 'src/store/wallet';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import * as zcrypto from '@zilliqa-js/crypto'
import { updateNewWallet } from 'src/store/new-wallet';
import { $net } from 'src/store/wallet-network';

function Component() {
    const zilpay = new ZilPayBase();
    const zil_address = useStore($wallet);
    const net = useStore($net);
    const [address, setAddress] = useState('');

    const handleDeploy = async () => {
        if( zil_address !== null ) {
            const deploy = await zilpay.deployDid(zil_address.base16);
            let new_wallet = deploy[1].address;
            new_wallet = zcrypto.toChecksumAddress(new_wallet);
            updateNewWallet(new_wallet);
            setAddress(new_wallet); 
        } else {
            alert('Sign in with ZilPay.');
        }
    };

    return (
        <>
            {
                address === '' &&
                <div style={{ textAlign: 'center', marginTop: '3%' }}>
                    <h3>
                        a brand new{' '}
                        <strong style={{ color: 'lightblue' }}>
                            tyron self-sovereign account
                        </strong>:
                    </h3>
                    <button
                        className={ styles.button }
                        onClick={ handleDeploy }
                    >
                        create <span className={ styles.x }>tyron account</span> <span className="label">&#9889;</span>
                    </button>
                </div>
            }
            {
                address !== '' &&
                    <div style={{  textAlign: 'center' }}>
                        <code>
                            <p>
                                Save your new self-sovereign account address:{' '}
                                <a  
                                    style={{ color: 'yellow' }}
                                    href={`https://viewblock.io/zilliqa/address/${ address }?network=${ net }`}
                                    rel="noreferrer" target="_blank"
                                >
                                    { address }
                                </a>
                            </p>
                            <p>
                                Next, search for the NFT Username that you would like to buy for your account.
                            </p>                           
                        </code>
                    </div>
            }
        </>
    );
}

export default Component;
