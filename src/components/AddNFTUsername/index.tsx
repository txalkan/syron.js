import React from 'react';
//import styles from './styles.module.scss';
import { $username } from 'src/store/username';
import { ZilPayBase } from '../ZilPay/zilpay-base';

function AddNFTUsername() {
    const username = $username.getState();
    const zilpay = new ZilPayBase();

    const handleDeploy = async () => {
        const result = await zilpay.deploy();
        alert(`Result: ${JSON.stringify(result)}`);
    };

    return (
        <div style={{ marginTop: '10%' }}>
            <h2 style={{ textAlign: 'center', color: 'grey' }}>
                Deploy{' '}
                <strong>
                    DID<i style={{ textTransform: 'lowercase' }}>x</i>Wallet
                </strong>{' '}
                <span style={{ textTransform: 'lowercase' }}>for</span>{' '}
                <strong style={{ color: 'yellow' }}>
                    {username?.nft}.{username?.domain}
                </strong>
            </h2>
            <input
                type="button"
                className="button primary"
                value={`Add todo`}
                onClick={handleDeploy}
            />
        </div>
    );
}

export default AddNFTUsername;
