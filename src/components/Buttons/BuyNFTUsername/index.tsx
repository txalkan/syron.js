import React, { useState } from 'react';
import { $wallet } from 'src/store/wallet';
import { $net } from 'src/store/wallet-network';
import { Deploy } from 'src/components';


function BuyNFTUsername() {
    const [buy, setBuy] = useState(false);
    const [deploy, setDeploy] = useState(false);
    
    const handleBuy = () => {
        setBuy(true);
    };

    const address = $wallet.getState();
    const net = $net.getState();
    const handleDeploy = () => {
        if (address === null) {
            alert('Sign in with ZilPay.');
        } else {
            alert(
                `Network: ${net} & Admin address: ${address.base16}.`
            );
            setDeploy(true);
        }
    };

    return (
        <>
            {
                !buy &&
                <input
                    type="button"
                    className="button primary"
                    value={`Buy NFT username`}
                    onClick={handleBuy}
                />
            }
            {
                buy && !deploy &&
                <input
                    type="button"
                    className="button"
                    value={`Deploy`}
                    onClick={handleDeploy}
                />
            }
            {
                deploy && <Deploy/>
            }
        </>
    );
}

export default BuyNFTUsername;
