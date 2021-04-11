import React, { useState } from "react";
import Arweave from 'arweave';
import * as SmartWeave from 'smartweave';
import * as DKMS from '../lib/dkms';

function Profile({ username, domain, account, arweave, arconnect, keyfile }) {
    const[donationAmount, setDonationAmount] = useState('');
    const handleDonationAmount = event => {
        setDonationAmount(event.target.value);
    };

    const[message, setMessage] = useState('');
    const handleMessage = event => {
        setMessage(event.target.value);
    };

	return(
		<div id="main" style={{ marginTop: "4%" }}>
            <section style={{width:"100%"}}>
                <h3 class="major">{ username }.{ domain } profile</h3>
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
                                try {
                                    if( keyfile === '' &&  arconnect === '' ) {
                                        throw new Error(`You have to connect with ArConnect or your keyfile.`)
                                    }
                                    if (window.confirm(`You are about to donate ${donationAmount} $AR to '${ username }.${ domain }'. Click OK to proceed.`)) {
                                        let tx;
                                        if( arconnect !== ''){
                                            tx = await arweave.createTransaction({
                                                ttarget: account.ssi,
                                                quantity: arweave.ar.arToWinston(donationAmount)
                                            });
                                            await arweave.transactions.sign(tx);
                                        } else{
                                            tx = await arweave.createTransaction({
                                                target: account.ssi,
                                                quantity: arweave.ar.arToWinston(donationAmount)
                                            },
                                            keyfile
                                            );
                                            await arweave.transactions.sign(tx, keyfile);
                                        }
                                        const result = await arweave.transactions.post(tx);
                                        alert(`Transaction: ${ JSON.stringify(tx) }. Status: ${ result.status }`);
                                    }
                                } catch (error) {
                                    alert(error)
                                }
                            }}
                        />
                    </div>
                </div></form>
            </section>
            { account.wallet !== "" &&
                <section style={{width:"100%"}}>
                    <h4 class="major">SSI Communication</h4>
                    <p>Send them an encrypted message:</p>
                    <form method="post" action="#">
                        <div class="fields">
                            <div class="field">
                                <textarea onChange={ handleMessage }rows="4"></textarea>
                            </div>
                        </div>
                        <ul class="actions">
                            <li><input type="button" class="button primary" value="Encrypt & send"
                                onClick={ async() => {
                                    try {
                                        if( keyfile === '' &&  arconnect === '' ) {
                                            throw new Error(`You have to connect with ArConnect or your keyfile.`)
                                        }

                                        const userPermawallet = await SmartWeave.readContract(arweave, account.wallet);
                                        const userSsiComm = userPermawallet.ssiComm;
                                        const encryptedMessage = await DKMS.encryptData(message, userSsiComm);
                                        
                                        if (window.confirm(`You are about to send a message to ${ username }.${ domain }'. Click OK to proceed.`)) {
                                            let tx;
                                            if( arconnect !== ''){
                                                tx = await arweave.createTransaction({
                                                    target: account.ssi,
                                                    data: Arweave.utils.concatBuffers([encryptedMessage]),
                                                    quantity: arweave.ar.arToWinston('0')
                                                });
                                                await arweave.transactions.sign(tx);
                                            } else{
                                                tx = await arweave.createTransaction({
                                                    target: account.ssi,
                                                    data: Arweave.utils.concatBuffers([encryptedMessage]),
                                                    quantity: arweave.ar.arToWinston('0')
                                                },
                                                keyfile
                                                );
                                                await arweave.transactions.sign(tx, keyfile);    
                                            }
                                            const result = await arweave.transactions.post(tx);
                                            alert(`Transaction: ${ JSON.stringify(tx) }. Status: ${ result.status }`);
                                        }
                                    } catch (error) {
                                        alert(error)
                                    }
                                }}
                            /></li>
                            <li><input type="reset" value="Reset" /></li>
                        </ul>
                    </form>
                </section>
            }	
        </div>
	);
}

export default Profile;
