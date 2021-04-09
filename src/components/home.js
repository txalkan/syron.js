import React from "react";
import { Link, withRouter } from "react-router-dom";

function Home() {
    return (
        <div id="header">
            <nav>
                <ul>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/did">DID</Link></li>
                    <li><Link to="/mapu">.Mapu</Link></li>
                    <li><Link to="/token">Token</Link></li>
                    <li><Link to="/defi">DeFi</Link></li>
                    <li><Link to="/permawallet">Wallet</Link></li>
                    <li><Link to="/browser">Browser</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                </ul>
            </nav>
        </div>
    );
}

export default withRouter(Home);
