import React from "react";
import logo from '../images/tyron_logo.png';

function Header() {
    return(
        <div id="header">
            <img src={logo} width="20%" alt="tyron_logo"/>
            <div class="content">
                <div class="inner">
                    <h1>tyron self-sovereign identity protocol</h1>
                    <p>own your data, empower your world</p>
                </div>
            </div>
        </div>
    )
}

export default Header;
