import React from "react";
import { Link, withRouter } from "react-router-dom";

function Home() {
    return (
        <div id="header" style={{ marginTop: '1%' }}>
            <nav style={{ width:"100%"}}>
                <ul>
                    <li><Link to="/browser">Domains</Link></li>
                    <li><Link to="/contact">Join us</Link></li>
                </ul>
            </nav>
        </div>
    );
}

export default withRouter(Home);
