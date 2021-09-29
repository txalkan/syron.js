import React from 'react';
import { ZilPayBase } from '../ZilPay/zilpay-base';

function Deploy() {
    const zilpay = new ZilPayBase();

    const handleDeploy = async () => {
        alert(
            `Coming soon!`
        );
    };

    return (
        <div>
            <input
                type="button"
                className="button"
                value={`Deploy Coop smart contract wallet`}
                style={{ marginTop: '3%', marginBottom: '3%' }}
                onClick={handleDeploy}
            />
        </div>
    );
}

export default Deploy;
