import React, { useState } from "react";
import { Link, withRouter } from "react-router-dom";
import Arweave from 'arweave';
import { ConnectWallet } from ".";

function Profile({account}) {
    const[donationAmount, setDonationAmount] = useState('');

    const handleDonationAmount = event => {
        setDonationAmount(event.target.value);
    };

	return(
		<div id="main">
            <ConnectWallet/>
            <section style={{width:"100%"}}>
            <h3 class="major" style={{ marginTop: "4%" }}>{account.username}.{account.domain} profile</h3>
                <h4 class="major">Articles</h4>
                <p>Coming soon!</p>
                <h4 class="major">Donations</h4>
                <p>Show your support:</p>
                <form><div class="fields">
                    <div class="field half"> 
                        <input type="text" placeholder="Amount" onChange={handleDonationAmount} /></div>
                    <div class="field half">
                        <input type="button" class="button primary" value="Donate $AR"
                            onClick={ async() => {
                                const arweave = Arweave.init({
                                    host: 'arweave.net',
                                    port: 443,
                                    protocol: 'https'
                                });
                                if (window.confirm(`You are about to donate ${donationAmount} $AR to '${account.username}.${account.domain}'. Click OK to proceed.`)) {
                                    const qty = arweave.ar.arToWinston(donationAmount);
                                    const tx = await arweave.createTransaction({
                                        target: account.registered.ssi,
                                        quantity: qty
                                    });

                                    await arweave.transactions.sign(tx);
                                      
                                    const result = await arweave.transactions.post(tx);
                                    alert(`"Transaction: ${tx}. Status: ${result.status}`);
                                }
                            
                            }}
                        />
                    </div>
                </div></form>
            </section>
            { account.registered.wallet !== "" &&
                <section style={{width:"100%"}}>
                    <h4 class="major">SSI Communication</h4>
                    <p>Send them an encrypted message:</p>
                    <form method="post" action="#">
                        <div class="fields">
                            <div class="field">
                                <textarea name="message" id="message" rows="4"></textarea>
                            </div>
                        </div>
                        <ul class="actions">
                            <li><input type="button" class="button primary" value="Encrypt & send"
                                onClick={ async() => {
                                    const arweave = Arweave.init({
                                        host: 'arweave.net',
                                        port: 443,
                                        protocol: 'https'
                                    });
                                    if (window.confirm(`You are about to donate ${donationAmount} $AR to '${account.username}.${account.domain}'. Click OK to proceed.`)) {
                                        const qty = arweave.ar.arToWinston(donationAmount);
                                        const tx = await arweave.createTransaction({
                                            target: account.registered.ssi,
                                            quantity: qty
                                        });

                                        await arweave.transactions.sign(tx);
                                                
                                        const result = await arweave.transactions.post(tx);
                                        alert(`"Transaction: ${tx}. Status: ${result.status}`);
                                    }
                                
                                }}
                            /></li>
                            <li><input type="reset" value="Reset" /></li>
                        </ul>
                    </form>
                </section>
            }
            {JSON.stringify(account.registered)}	
        </div>
	);
}

export default withRouter(Profile);
