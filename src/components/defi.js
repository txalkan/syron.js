import React from "react";
import { Link, withRouter } from "react-router-dom";

function DeFi() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{ marginTop:"7%", marginBottom: '2%' }}><Link to="/">🔙</Link></span>
            <h2 style={{ width: "100%", textAlign:"center" }} class="major">Decentralized finance</h2>
            <section style={{ width: "100%"}}>
                <p>The $TYRON DeFi identity token will get minted by the protocol to reward:</p>
                <ul>
                    <li>Liquidity providers</li>
                    <li>Developers</li>
                    <li>Content creators</li>
                </ul>
                <p>There will not be a pre-allocation of $TYRON tokens.</p>
            </section>
            <section style={{ width: "100%"}}>
                <h3 class="major">SSI Bridge: $TYRON + Gas Stations</h3>
                <p>SSI gas stations will exist for the self-sovereign identities to buy gas (e.g. AR) from them, provided by SSI Agents ($AYJA holders).</p>
                <p>Gas stations will only accept $TYRON as means of payment. Fees will also get paid in $TYRON:</p>
                <ul>
                    <li>SSI Agents can charge a fee</li>
                    <li>The protocol could charge a fee and burn it to reduce the circulating supply of $TYRON</li>
                </ul>
                <i>More detail coming soon. Feel free to ask on <Link to="/contact">Discord</Link></i>
            </section>	
        </div>
	);
}

export default withRouter(DeFi);
