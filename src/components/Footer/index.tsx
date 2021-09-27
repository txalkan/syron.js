import React from 'react';

function Footer() {
    return (
        <footer id="footer">
            <ul className="icons" style={{ marginTop: '0.5%' }}>
                <li>
                    <a
                        href="https://www.ssiprotocol.com/#/"
                    >
                        <span className="label">&#9889;</span>
                    </a>
                </li> 
                <li>
                    <a
                        href="https://github.com/tyroncoop/ssibrowser"
                        className="icon brands fa-github"
                    >
                        <span className="label">GitHub</span>
                    </a>
                </li> 
                <li>
                    <a
                        href="https://twitter.com/ssiprotocol"
                        className="icon brands fa-twitter"
                    >
                        <span className="label">Twitter</span>
                    </a>               
                </li>
            </ul>
        </footer>
    );
}

export default Footer;
