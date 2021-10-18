import React from 'react';

function Footer() {
    return (
        <footer id="footer">
            <p className="icons">
                    <a
                        href="https://twitter.com/ssibrowser"
                        className="icon brands fa-twitter"
                    >
                        <span className="label">Twitter</span>
                    </a>
            </p>
            <p>
                <a
                    href="https://github.com/tyroncoop/ssibrowser"
                    className="icon brands fa-github"
                >
                    <span className="label">GitHub</span>
                </a>
            </p>
            <p>
                <a href="https://www.ssiprotocol.com/#/">
                        <span className="label">&#9889;</span>
                </a>
            </p>
        </footer>
    );
}

export default Footer;
