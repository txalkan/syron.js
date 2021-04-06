import React, {useState, useEffect} from "react";
import useArConnect from 'use-arconnect';

function Wallet() {   
    const[value, setValue] = useState('Sign in');
    const[,setAddr] = useState('');
    const arConnect = useArConnect();
    useEffect(() => {
        if (!arConnect) return;
        (async () => {
            try {
                const permissions = await arConnect.getPermissions();
                if (permissions.includes("ACCESS_ADDRESS")) {
                    setAddr(await arConnect.getActiveAddress());
                    setValue("Disconnect wallet")
                }
            } catch {}
        })();
      }, [arConnect]);

	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><a href="/">🔙</a></span>
            <h2 class="major">Tyron Permaweb Wallet</h2>
            <section>
                <p>The amount of keys that the identity requires as <a href="/did">verification methods</a> is an issue. Most wallets in the market rely on third parties, so the secure management of private keys can be a problem for the user - even more when they have several private keys for multiple blockchains. The Tyron SSI Protocol Dapp solves this issue by implementing its own <a href="https://www.youtube.com/watch?v=LOrXOxc2yp0">Decentralized Key Management System</a> on-chain on the immutable permaweb and backing up the self-sovereign identity's private keys into the user's Tyron Permaweb Wallet.</p>
                <p>A Tyron Permaweb Wallet is a smart contract owned by its user where all keys got encrypted by the user's SSI Permaweb Key (their Arweave key). Whenever necessary, the user can read the data from their on-chain wallet, decrypt it and use it to make the signatures required by their self-sovereign identity.</p>
                <p>Furthermore, the Tyron Permaweb Wallet also stores an <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">IVMS101 message</a> that makes this self-hosted wallet compliant with the FATF Travel Rule. This message with the user's personal information gets encrypted by the user's SSI Travel Rule Key. When executing a virtual asset transfer, the user attaches a copy of this key encrypted by the beneficiary's SSI Permaweb Key - so that the beneficiary, and only the beneficiary, can read the IVMS101 message.</p>
                <p>With a Tyron Permaweb Wallet, the user only must worry about one private key: their SSI Permaweb Key. This improved user experience also brings to the user peace of mind that all their other private keys and personal information are encrypted, safely stored and always available on their on-chain wallet that lives on the permaweb - a decentralized, immutable and uncensorable Web 3.0.</p>
                <ul class="actions">
                    <li><input class="button primary" type="button" value={value}
                        onClick={ async() => {
                            switch (value) {
                                case "Disconnect wallet":
                                    await arConnect.disconnect()
                                    setValue("Sign in");
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
                                            setValue("Disconnect wallet");
                                        }
                                    } catch(err) {
                                        alert(`${err}.`)
                                    }
                                    break;
                            }
                        }}/>
                    </li>
                    {/** <li><input type="button" value="Create a new Tyron Permaweb Wallet" onclick={createWallet()}></input></li>*/}
                </ul>
            </section>
        </div>
	);
}

export default Wallet;
