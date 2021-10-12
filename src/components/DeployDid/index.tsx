import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $wallet } from 'src/store/wallet';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import * as zcrypto from '@zilliqa-js/crypto'
import { updateNewWallet } from 'src/store/new-wallet';

function Deploy() {
    const zilpay = new ZilPayBase();
    const zil_address = useStore($wallet);
    
    const [legend, setLegend] = useState('Deploy DID smart contract wallet');

    const handleDeploy = async () => {
        if( zil_address !== null ) {
            const deploy = await zilpay.deployDid(zil_address.base16);
            let new_wallet = deploy[1].address;
            new_wallet = zcrypto.toChecksumAddress(new_wallet);
            updateNewWallet(new_wallet);
            setLegend(`Save your new DIDxWallet address: ${new_wallet}.
            Next, search the NFT username that you would like to buy for your DIDxWallet.`);
            //@todo add link to viewblock to view new contract 
        } else {
            alert('Sign in with ZilPay.');
        }
    };

    return (
        <>
            {
                legend === 'Deploy DID smart contract wallet' &&
                <div>
                    <input
                        type="button"
                        className="button primary"
                        value={legend}
                        style={{ marginTop: '3%', marginBottom: '3%' }}
                        onClick={handleDeploy}
                    />
                </div>
            }
            {
                legend !== 'Deploy DID smart contract wallet' &&
                <div>
                    <code>{legend}</code>
                </div>
            }
        </>
    );
}

export default Deploy;
