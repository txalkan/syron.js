import React from "react";
import { Link, withRouter } from "react-router-dom";

function DeFi() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{marginBottom: '2%'}}><Link to="/">🔙</Link></span>
            <h2 class="major">Decentralized finance</h2>
            <section>
                <p>The $TYRON decentralized finance token will get minted by the protocol to reward liquidity providers of the <Link to="/token">$AYJA</Link> and $TYRON liquidity pools.</p>
                <p>There will not be a pre-allocation of $TYRON tokens.</p>
                <p>$TYRON will also get given as usage rewards on the <Link to="/mapu">.Mapu</Link> platform.</p>
            </section>
            <section>
                <h3 class="major">Gas-free experience</h3>
				<p>More importantly, $TYRON liquidity pools on different blockchains, such as Arweave and Zilliqa, will allow the user to have a <i>gas-free</i> experience. The protocol will enable the self-sovereign identity to buy $TYRON on one blockchain, lock-it and sell it on a different network - to get the latter's native currency to pay for gas.</p>
                <p>To execute a transaction on a new network for the first time, gas stations will exist to borrow gas from them. These stations will get provided by varied SSI Agents that the user will authorize to make a meta-transaction into their self-sovereign identity.</p>
            </section>	
        </div>
	);
}

export default withRouter(DeFi);
