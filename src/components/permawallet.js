import React from "react";
import { Link, withRouter } from "react-router-dom";

function Permawallet() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><Link to="/">🔙</Link></span>
            <h2 class="major">SSI Permawallet</h2>
                <p>The amount of keys that a decentralized identity requires as <Link to="/did">verification methods</Link> is an issue. Most wallets in the market rely on third parties, so the secure management of private keys can be a problem for the user - even more when they have private keys for different blockchains. The Tyron SSI Protocol Dapp solves this issue by implementing its own <a href="https://www.youtube.com/watch?v=LOrXOxc2yp0">Decentralized Key Management System</a> on-chain on the immutable permaweb and backing up the user's SSI private keys into their Self-Sovereign Identity Permawallet.</p>
                <p>An SSI Permawallet is a smart contract owned by its user where all keys got encrypted by the user's SSI Permaweb Key (their Arweave main key). Whenever necessary, the user can read the data from their on-chain wallet, decrypt it and use it to make the signatures required by their self-sovereign identity.</p>
                <p>With an SSI Permawallet, the user must only worry about one private key: their SSI Permaweb Key. This improved user experience also brings to the user peace of mind that all their other private keys and personal information are encrypted, safely stored and always available on their on-chain wallet that lives on the permaweb - a decentralized, immutable and uncensorable Web 3.0.</p>
            <section>
                <h3>SSI Travel Rule Passport for multi-chain KYC</h3>
                <p>The SSI Permawallet also stores the user's SSI Travel Rule Passport: An <a href="https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf">IVMS101 message</a> that makes this self-hosted wallet compliant with the FATF Travel Rule. This passport has the user's personal information encrypted by the user's SSI Travel Rule Key. When executing a virtual asset transfer, the user attaches a copy of this key encrypted by the beneficiary's SSI Communication Key - so that the beneficiary, and only the beneficiary, can read their SSI Travel Rule Passport.</p>
            </section>    
            <section>
                <h3>The SSI Communication Key</h3>
                <p>Self-sovereign identities can send messages to each other, encrypting them with the receiver's SSI Communication Key - so that only the receiver can read them. For example, when sending a transfer, the originator can attach their SSI Travel Rule Key encrypted by the beneficiary's SSI Communication Key so they can read the originator's Travel Rule Passport.</p>
                <h3 class="major">Create your SSI Permawallet</h3>
                <p>Go to the <Link to="/browser">browser</Link>, choose a username and if it's available you will be available to take it for your self-sovereign identity.</p>
            </section>
        </div>
	);
}

export default withRouter(Permawallet);
