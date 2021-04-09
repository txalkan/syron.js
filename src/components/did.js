import React from "react";
import { Link, withRouter } from "react-router-dom";

function Did() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><Link to="/">🔙</Link></span>
            <h2 class="major">Decentralized Identifiers</h2>
            <p>The W3C Decentralized Identifier Working Group has developed the <a href="https://w3c.github.io/did-core/">Decentralized Identifiers (DIDs) specification</a> that defines a DID as a unique identifier that enables verifiable, decentralized digital identity. The Tyron SSI Protocol is conformant with this specification by implementing the <a href="https://www.tyronzil.com/">tyronzil DID Method</a> - listed in the <a href="https://w3c.github.io/did-spec-registries/">W3C DID Specification Registries</a>.</p>
            <p>A digital identity's decentralized identifier rely on public attributes described in its DID Document. Such attributes are service endpoints and verification methods.</p>
            <section>
            <h3 class="major">Service endpoints</h3>
                <p>Network addresses, such as an HTTP URL or blockchain address, at which services operate on behalf of the digital identity. Services can refer to privacy-preserving communication (DID Comm) and social networking apps, among others.</p>
                <h3 class="major">Verification methods</h3>
                <p>Cryptographic key pairs allow the user to authenticate themselves or authorize transactions through digital signatures. Verification methods correspond to verification relationships such as:</p>
                <ul>
                <li><b>Authentication:</b> To, e.g., sign in to a service or website.</li>
                <li><b>Assertion:</b> To sign claims in verifiable credentials.</li>
                <li><b>Key agreement:</b> A public key of yours that people can use to encrypt confidential information into a message that only you can decrypt with your corresponding private key.</li>
                <li><b>Capability invocation:</b> A key that invokes a cryptographic capability to, e.g., authorize the update of your DID Document.</li>
                <li><b>Capability delegation:</b> To delegate a cryptographic capability to another party.</li>
            </ul>
            </section>
        </div>
	);
}

export default withRouter(Did);
