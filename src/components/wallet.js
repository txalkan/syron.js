import React, {useState, useEffect} from "react";
import useArConnect from 'use-arconnect';
import Arweave from 'arweave';
import TestWeave from 'testweave-sdk';

function Wallet() {   
    const[value, setValue] = useState('Sign in to your Permaweb SSI Key');
    const[,setAddr] = useState('');
    const arConnect = useArConnect();
    useEffect(() => {
        if (!arConnect) return;
        (async () => {
            try {
                const permissions = await arConnect.getPermissions();
                if (permissions.includes("ACCESS_ADDRESS")) {
                    setAddr(await arConnect.getActiveAddress());
                    setValue('Disconnect Permaweb SSI Key')
                }
            } catch {}
        })();
    }, [arConnect]);

    const[host, setHost] = useState('');

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
            <h2 class="major">Tyron Permaweb Wallet</h2>
                <p>The amount of keys that the identity requires as <a href="/did">verification methods</a> is an issue. Most wallets in the market rely on third parties, so the secure management of private keys can be a problem for the user - even more when they have several private keys for multiple blockchains. The Tyron SSI Protocol Dapp solves this issue by implementing its own <a href="https://www.youtube.com/watch?v=LOrXOxc2yp0">Decentralized Key Management System</a> on-chain on the immutable permaweb and backing up the self-sovereign identity's private keys into the user's Tyron Permaweb Wallet.</p>
                <p>A Tyron Permaweb Wallet is a smart contract owned by its user where all keys got encrypted by the user's Permaweb SSI Key (their Arweave key). Whenever necessary, the user can read the data from their on-chain wallet, decrypt it and use it to make the signatures required by their self-sovereign identity.</p>
                <p>Furthermore, the Tyron Permaweb Wallet also stores an <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">IVMS101 message</a> that makes this self-hosted wallet compliant with the FATF Travel Rule. This message with the user's personal information gets encrypted by the user's Travel Rule SSI Key. When executing a virtual asset transfer, the user attaches a copy of this key encrypted by the beneficiary's Permaweb SSI Key - so that the beneficiary, and only the beneficiary, can read the IVMS101 message.</p>
                <p>With a Tyron Permaweb Wallet, the user must only worry about one private key: their Permaweb SSI Key. This improved user experience also brings to the user peace of mind that all their other private keys and personal information are encrypted, safely stored and always available on their on-chain wallet that lives on the permaweb - a decentralized, immutable and uncensorable Web 3.0.</p>
            <section style={{width:'100%'}}>
                <h3>Create a Tyron Permaweb Wallet</h3>
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
                                                setValue("Disconnect Permaweb SSI Key");
                                            }
                                        } catch(err) {
                                            alert(`${err}.`)
                                        }
                                        break;
                                }
                            }}
                        />
                        <span> or </span>
                        <input type="button" value="Try it on testnet"
                            onClick={ () => {
                                setHost('localhost');
                                if (window.confirm("To use TestWeave, you must have a local testnet running. Click OK to get redirected, or Cancel if you've got one already.")) {
                                    window.open("https://github.com/ArweaveTeam/testweave-docker")
                                }
                            }}
                        />
                    </li>
                    <li>
                        <h4>Travel Rule SSI Passport</h4>
                        <p>Generate an <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">IVMS101 message</a> for KYC to make your self-hosted wallet compliant with the FATF Travel Rule to counteract money laundering and terrorism financing, and thus building a web of trust. This personal information will get encrypted by a Travel Rule SSI Key generated by your Tyron Permaweb Wallet - only you decide who can read this message. You won't need to give this information anymore to other third parties, over and over again. Your Travel Rule SSI (private) Key will get encrypted by your Permaweb SSI Key, so only you can access it. When making a transfer, you will be attaching to it this private key, encrypted by the beneficiary's Permaweb SSI Key.</p>
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
                                }}
                                />
                            </li>
							<li><input type="reset" value="Reset" /></li>
						</ul>
					</form>
                    </li>
                    <li>
                        <p>Deploy your Tyron Permaweb Wallet smart contract.</p>
                        <input type="button" value="Deploy"
                            onClick={ async() => {
                                switch (host) {
                                    case 'arweave.net':
                                        {
                                            const arweave = Arweave.init({
                                                host: 'arweave.net',
                                                port: 443,
                                                protocol: 'https'
                                            });
                                        }                                        
                                        break;
                                    case 'localhost':
                                        {
                                            const arweave = Arweave.init({
                                                host: 'localhost',
                                                port: 1984,
                                                protocol: 'http',
                                                timeout: 20000,
                                                logging: false,
                                            });
                                            const testWeave = await TestWeave.init(arweave);     
                                        }
                                        break
                                
                                    default:
                                        alert(`Go back to step 2.`)
                                        break;
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
