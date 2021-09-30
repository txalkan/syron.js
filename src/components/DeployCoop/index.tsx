import React from 'react';
import { ZilPayBase } from '../ZilPay/zilpay-base';

function Deploy() {
    const zilpay = new ZilPayBase();

    const handleDeploy = async () => {
        alert(
            `Coming soon!`
        );// @todo add: "More info here." + link to https://ssiprotocol.notion.site/coop-tyron-de8edb67778541f79fee3de343f213ae 
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
