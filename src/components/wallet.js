import React, {useState, useEffect} from "react";
import useArConnect from 'use-arconnect';
import Arweave from 'arweave';
import * as DKMS from '../lib/dkms';
import * as TR from "../lib/travel-rule-passport";

import * as SmartWeave from 'smartweave';
import { selectWeightedAyjaHolder } from "../lib/select-weighted-ayja-holder";


function Wallet() {   
    const[value, setValue] = useState('Sign in with your Permaweb SSI Key');
    const[addr,setAddr] = useState('');
    const[host, setHost] = useState('');
    
    const arConnect = useArConnect();
    useEffect(() => {
        if (!arConnect) return;
        (async () => {
            try {
                const permissions = await arConnect.getPermissions();
                if (permissions.includes("ACCESS_ADDRESS")) {
                    setAddr(await arConnect.getActiveAddress());
                    setHost('arweave.net');
                    setValue('Disconnect Permaweb SSI Key');
                }
            } catch {}
        })();
    }, [arConnect]);

    const[ayjaID, setAyjaID] = useState('');
    const[permawalletID, setpermawalletID] = useState('');

    const message = {
        firstName: "",
        lastName: "",
        streetName: "",
        buildingNumber: "",
        country: ""
    };
    const[ivms101, setIvms101] = useState(message);
    
    const[firstName, setFirstName] = useState('');
    const[lastName, setLastName] = useState('');
    const[streetName, setStreetName] = useState('');
    const[buildingNumber, setBuildingNumber] = useState('');
    const[country, setCountry] = useState('');

    const handleFirstName = event => {
        setFirstName(event.target.value);
    };
    const handleLastName = event => {
        setLastName(event.target.value);
    };
    const handleStreetName = event => {
        setStreetName(event.target.value);
    };
    const handleBuildingNumber = event => {
        setBuildingNumber(event.target.value);
    };
    const handleCountry = event => {
        setCountry(event.target.value);
    };

	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><a href="/">🔙</a></span>
            <h2 class="major">Tyron Permawallet</h2>
                <p>The amount of keys that a decentralized identity requires as <a href="/did">verification methods</a> is an issue. Most wallets in the market rely on third parties, so the secure management of private keys can be a problem for the user - even more when they have private keys for different blockchains. The Tyron SSI Protocol Dapp solves this issue by implementing its own <a href="https://www.youtube.com/watch?v=LOrXOxc2yp0">Decentralized Key Management System</a> on-chain on the immutable permaweb and backing up the self-sovereign identity's private keys into the user's Tyron Permawallet.</p>
                <p>A Tyron Permawallet is a smart contract owned by its user where all keys got encrypted by the user's Permaweb SSI Key (their Arweave key). Whenever necessary, the user can read the data from their on-chain wallet, decrypt it and use it to make the signatures required by their self-sovereign identity.</p>
                <p>With a Tyron Permawallet, the user must only worry about one private key: their Permaweb SSI Key. This improved user experience also brings to the user peace of mind that all their other private keys and personal information are encrypted, safely stored and always available on their on-chain wallet that lives on the permaweb - a decentralized, immutable and uncensorable Web 3.0.</p>
            <section>
                <h3>Travel Rule SSI Passport for multi-chain KYC</h3>
                <p>The Tyron Permawallet also stores the user's Travel Rule SSI Passport: An <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">IVMS101 message</a> that makes this self-hosted wallet compliant with the FATF Travel Rule. This passport has the user's personal information encrypted by the user's Travel Rule SSI Key. When executing a virtual asset transfer, the user attaches a copy of this key encrypted by the beneficiary's SSI Communication Key - so that the beneficiary, and only the beneficiary, can read their Travel Rule SSI Passport.</p>
            </section>    
            <section>
                <h3>The SSI Communication Key</h3>
                <p>Self-sovereign identities can send messages to each other, encrypting them with the receiver's SSI Communication Key - so that only the receiver can read them. For example, when sending a transfer, the originator can attach their Travel Rule SSI Key encrypted by the beneficiary's SSI Communication Key so they can read the originator's Travel Rule Passport.</p>
            </section>
            <section style={{width:'100%'}}>
                <h3 class="major">Create a Tyron Permawallet</h3>
                <ol>
                    <li>Create a new or load an existing Arweave wallet on the <a href="https://arconnect.io/">ArConnect</a> browser extension. The private key of this wallet will be your Permaweb SSI Key.</li>
                    <li style={{marginTop:"4%", marginBottom:"4%"}}>
                        <input class="button primary" type="button" value={value}
                            onClick={ async() => {
                                switch (value) {
                                    case "Disconnect Permaweb SSI Key":
                                        await arConnect.disconnect()
                                        setValue('Sign in to your Permaweb SSI Key');
                                        alert(`Your wallet got successfully disconnected.`)
                                        return;
                                    default:
                                        const permissions = [
                                            "ACCESS_ADDRESS",
                                            "SIGN_TRANSACTION",
                                            "ENCRYPT",
                                            "DECRYPT"
                                        ]
                                        try {
                                            if (!arConnect) {
                                                if (window.confirm("You have to download the ArConnect browser extension. Click OK to get redirected.")) {
                                                    window.open("https://arconnect.io/")
                                                }                    
                                            } else {
                                                await arConnect.connect(permissions);
                                                setAddr(await arConnect.getActiveAddress());
                                                setHost('arweave.net');
                                                setAyjaID('qNgHMuMEc3zIAbpQ_gn2zvQlbShf__Ih0Vte4ag4F9s');
                                                setpermawalletID('ZdGlXLsq-wYJ8KbAgwY6VyCSI6EMvkZrmqGrjiGehp4');
                                                setValue("Disconnect Permaweb SSI Key");
                                            }
                                        } catch(err) {
                                            alert(`${err}.`)
                                        }
                                        break;
                                }
                            }}
                        />
                    </li>
                    <li>
                        <h4>Travel Rule SSI Passport</h4>
                        <p>Generate an <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">IVMS101 message</a> for KYC to make your self-hosted wallet compliant with the FATF Travel Rule to counteract money laundering and terrorism financing, and thus building a web of trust. This personal information will get encrypted by a Travel Rule SSI Key generated by your Tyron Permawallet - only you decide who can read this message. You won't need to give this information anymore to other third parties, over and over again. Your Travel Rule SSI (private) Key will get encrypted by your Permaweb SSI Key and saved into your wallet, so only you can access it. When making a transfer, you will have the option to attach this secret encrypted by the beneficiary's SSI Communication Key so they can read your Travel Rule Passport.</p>
                        <form>
						<div class="fields">
							<div class="field half">
								<label>First name</label>
								<input type="text" onChange={handleFirstName} />
							</div>
							<div class="field half">
								<label>Last name</label>
								<input type="text" onChange={handleLastName} />
							</div>
						</div>
                        <section style={{width:'100%', marginBottom:"3%"}}>
                            <h4>Residential address</h4>
                            <div class="fields">
                                <input type="text" placeholder="Street name" onChange={handleStreetName} />
                            </div>
                        </section>
                        <div class="fields">
							<div class="field half">
								<input type="text" placeholder="Building number" onChange={handleBuildingNumber} />
							</div>
							<div class="field half">
								<select onChange={handleCountry}>
                                    <option value="" disabled selected>Select country of residence</option>
									<option value="Argentina">Argentina</option>
									<option value="Denmark">Denmark</option>
									<option value="Singapore">Singapore</option>
								</select>
							</div>
						</div>
						<ul class="actions">
							<li><input class="button primary" type="button" value="Submit"
                                onClick={() => {
                                    setIvms101({
                                        firstName: firstName,
                                        lastName: lastName,
                                        streetName: streetName,
                                        buildingNumber: buildingNumber,
                                        country: country
                                    })
                                    alert("Information received.")
                                }}
                                />
                            </li>
							<li><input type="reset" value="Reset" /></li>
						</ul>
					</form>
                    </li>
                    <li>
                        <p>Deploy your Tyron Permawallet smart contract:</p>
                        <input type="button" class="button primary" value="Deploy"
                            onClick={ async() => {
                                let arweave;
                                switch (host) {
                                    case 'arweave.net':
                                        {
                                            arweave = Arweave.init({
                                                host: 'arweave.net',
                                                port: 443,
                                                protocol: 'https'
                                            });
                                        }                                        
                                        break;
                                    default:
                                        alert(`Go back to step 2.`)
                                        break;
                                }

                                if(arweave !== undefined ) {
                                    // SSI Communication Keys
                                    const ssiCommKeys = await DKMS.generateSsiKeys(arweave);
                                    
                                    // Travel Rule Passport
                                    const trSsiKeys = await DKMS.generateSsiKeys(arweave);
                                    const encryptedTrPassport = await TR.encryptTravelRulePassport(ivms101, trSsiKeys.publicEncryption);
                                    const encryptedTrSsiKey = await DKMS.encryptKey(arConnect, trSsiKeys.privateKey);
                                    
                                    /*For testing
                                    const decryptedTrSsiKey = await DKMS.decryptKey(arConnect, encryptedTrSsiKey);
                                    alert(`TR decrypted key: ${decryptedTrSsiKey}`);

                                    const decryptedTrPassport = await TR.decryptTravelRulePassport(encryptedTrPassport, trSsiKeys.privateKey);
                                    alert(decryptedTrPassport);*/

                                    let permawalletInitState = await SmartWeave.readContract(arweave, permawalletID);
                                    permawalletInitState.ssi = addr;
                                    permawalletInitState.comm = ssiCommKeys.publicEncryption;
                                    permawalletInitState.trp.message = encryptedTrPassport;
                                    permawalletInitState.trp.key = encryptedTrSsiKey;
                                    alert(JSON.stringify(permawalletInitState));
                                    
                                    // Fee paid to the PSC

                                    const ayjaState = await SmartWeave.readContract(arweave, ayjaID);
                                    alert(JSON.stringify(ayjaState.accounts));
                                    const holder = selectWeightedAyjaHolder(ayjaState.accounts);
                                    const fee = arweave.ar.arToWinston('0.00001');

                                    if (window.confirm("The fee to create your Tyron Permawallet is 0.00001 $AR. Click OK to accept.")) {
                                        const tx = await arweave.createTransaction({
                                            target: holder,
                                            quantity: fee
                                        });

                                        await arweave.transactions.sign(tx);
                                        await arweave.transactions.post(tx);
                                    }

                                    await DKMS.createPermawallet(arweave, arConnect, permawalletInitState, permawalletID);
                                    alert(`Success!`)
                                }
                            }}
                        />
                    </li>
                </ol>
            </section>
        </div>
	);
}

export default Wallet;
