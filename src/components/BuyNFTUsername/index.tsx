import React from 'react';
import { $wallet } from 'src/store/wallet';
import { useStore } from 'effector-react';
import { ZilPayBase } from '../ZilPay/zilpay-base';

function BuyNFTUsername() {
    const zil_address = useStore($wallet);
    const zilpay = new ZilPayBase();
    
    const handleBuy = async () => {
        if( zil_address !== null ) {
            const deploy = await zilpay.deploy(zil_address.base16);
            
        } else {
            alert('Sign in with ZilPay.');
        }
    };

    return (
        <>
            <input
                type="button"
                className="button primary"
                value={`Buy NFT username`}
                onClick={handleBuy}
            />
        </>
    );
}

export default BuyNFTUsername;
