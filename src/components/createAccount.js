import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import Arweave from 'arweave';
import { ConnectWallet } from ".";

function CreateAccount({ account }) {
    const[donationAmount, setDonationAmount] = useState('');

    const handleDonationAmount = event => {
        setDonationAmount(event.target.value);
    };

	return(
		<div id="main">
            <h3>{account.username}.{account.domain} is available </h3>
            <ConnectWallet/>
        </div>
	);
}

export default withRouter(CreateAccount);
