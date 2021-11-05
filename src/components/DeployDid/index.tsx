import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $wallet } from 'src/store/wallet';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import * as zcrypto from '@zilliqa-js/crypto'
import { updateNewWallet } from 'src/store/new-wallet';
import { $connected } from 'src/store/connected';
import { $net } from 'src/store/wallet-network';

function Component() {
    const zilpay = new ZilPayBase();
    const zil_address = useStore($wallet);
    const [legend, setLegend] = useState('Create DID smart contract wallet');
    const net = useStore($net);
    
    const handleDeploy = async () => {
        const is_connected = $connected.getState();
        if( is_connected && zil_address !== null ) {
            const deploy = await zilpay.deployDid(zil_address.base16);
            let new_wallet = deploy[1].address;
            new_wallet = zcrypto.toChecksumAddress(new_wallet);
            updateNewWallet(new_wallet);
            setLegend(new_wallet); 
        } else {
            alert('Sign in with ZilPay.');
        }
    };

    return (
        <>
            {
                legend === 'Create DID smart contract wallet' &&
                <div style={{ textAlign: 'center' }}>
                    <h3>
                        Create a new{' '}
                        <strong style={{ color: 'lightblue' }}>
                            Decentralized Identifier smart contract wallet
                        </strong>
                    </h3>
                    <input
                        type="button"
                        className="button primary"
                        value={ legend }
                        style={{ marginTop: '3%', marginBottom: '3%' }}
                        onClick={ handleDeploy }
                    />
                </div>
            }
            {
                legend !== 'Create DID smart contract wallet' &&
                    <div style={{  textAlign: 'center', marginLeft: '-1%' }}>
                        <code>
                            <p>
                                Save your new DIDxWallet address:{' '}
                                <a  
                                    style={{ color: 'yellow' }}
                                    href={`https://viewblock.io/zilliqa/address/${ legend }?network=${ net }`}
                                >
                                    { legend }
                                </a>
                            </p>
                            <p>
                                Next, search the NFT Username that you would like to buy for your DIDxWallet.
                            </p>                           
                        </code>
                    </div>
            }
        </>
    );
}

export default Component;
