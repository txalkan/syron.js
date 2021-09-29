import React from 'react';
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
        <div>
            <input
                type="button"
                className="button primary"
                value={`Deploy DID smart contract wallet`}
                style={{ marginTop: '3%', marginBottom: '3%' }}
                onClick={handleDeploy}
            />
        </div>
    );
}

export default Deploy;
