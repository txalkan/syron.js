import React from "react";
import { Link, withRouter } from "react-router-dom";

function Contact() {
	return(
		<div id="main">
            <span role="img" aria-label="back arrow" style={{ marginTop:"7%", marginBottom: '2%' }}><Link to="/">🔙</Link></span>
            <h2 class="major">Join us</h2>
            <p>Would love to hear from you!</p>
            <p>eMail: pungtas@pm.me</p>
            <ul class="icons">
                <li><a href="https://twitter.com/ssiprotocol" class="icon brands fa-twitter"><span class="label">Twitter</span></a></li>
                <li><a href="https://github.com/pungtas" class="icon brands fa-github"><span class="label">GitHub</span></a></li>
                <li><a href="https://www.youtube.com/channel/UCmzZR1G-g0Kq97j4dGx06eA" class="icon brands fa-youtube"><span class="label">YouTube</span></a></li>
            </ul>	
        </div>
	);
}

export default withRouter(Contact);
