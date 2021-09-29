import React from 'react';
//import styles from './styles.module.scss';
import { $username } from 'src/store/username';
import { ZilPayBase } from '../ZilPay/zilpay-base';

function Deploy() {
    const username = $username.getState();
    const zilpay = new ZilPayBase();

    const handleDeploy = async () => {
        
        const result = await zilpay.deploy();
        alert(
            `Result: ${JSON.stringify(result)}`
        );
    };

    return (
        <div style={{ marginTop: '10%' }}>
            <h2 style={{ textAlign: 'center', color: 'grey' }}>
                Deploy <strong>DID<i style={{ textTransform: 'lowercase' }}>x</i>Wallet</strong> <i style={{ textTransform: 'lowercase' }}>for</i> <strong style={{ color: 'yellow' }}>{username?.nft}.{username?.domain}</strong>
            </h2>
            <input
                type="button"
                className="button primary"
                value={`Deploy smart contract wallet`}
                onClick={handleDeploy}
            />
        </div>
    );
}

export default Deploy;
