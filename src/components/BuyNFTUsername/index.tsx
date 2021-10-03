import React, { useState } from 'react';
import { $wallet } from 'src/store/wallet';
import { $net } from 'src/store/wallet-network';
import { AddNFTUsername, DeployDid } from 'src/components';
import { $username } from 'src/store/username';

function BuyNFTUsername() {
    const username = $username.getState();
    const [buy, setBuy] = useState(false);
    const [deploy, setDeploy] = useState(false);
    const [add, setAdd] = useState(false);

    const handleBuy = () => {
        alert(JSON.stringify(username));
        setBuy(true);
    };

    const address = $wallet.getState();
    const net = $net.getState();
    const handleDeploy = () => {
        if (!address?.base16) {
            alert('Sign in with ZilPay.');
        } else {
            alert(`Network: ${net} & Admin address: ${address.base16}.`);
            setDeploy(true);
        }
    };
    const handleAdd = () => {
        if (!address?.base16) {
            alert('Sign in with ZilPay.');
        } else {
            alert(`Network: ${net} & Admin address: ${address.base16}.`);
            setAdd(true);
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
            {buy && !deploy && !add && (
                <div style={{ color: 'yellow', marginTop: '5%' }}>
                    <p>Deploy a new SSI smart contract wallet:</p>
                </div>
            )}
            {buy && !deploy && !add && (
                <input
                    type="button"
                    className="button"
                    value={`Deploy`}
                    onClick={handleDeploy}
                />
            )}
            {buy && !deploy && !add && (
                <div style={{ color: 'lightblue', marginTop: '8%' }}>
                    <p>
                        Or add NFT username to your self-sovereign identity
                        wallet:
                    </p>
                </div>
            )}
            {buy && !add && !deploy && (
                <input
                    type="button"
                    className="button"
                    value={`Add`}
                    onClick={handleAdd}
                />
            )}
            {deploy && <DeployDid />}
            {add && <AddNFTUsername />}
        </>
    );
}

export default BuyNFTUsername;
