import React from 'react';

function Footer() {
    return (
        <footer id="footer">
            <p>
                <a
                    className="icon brands fa-discord"
                    href="https://discord.gg/NPbd92HJ7e"
                    rel="noreferrer" target="_blank"
                >
                    <span className="label">
                        Discord
                    </span>
                </a>
            </p>
            <p className="icons">
                <a
                    className="icon brands fa-twitter"
                    href="https://twitter.com/ssibrowser"
                    rel="noreferrer" target="_blank"
                >
                    <span className="label">Twitter</span>
                </a>
            </p>
            <p>
                <a
                    className="icon brands fa-github"
                    href="https://github.com/tyroncoop/ssibrowser"
                    rel="noreferrer" target="_blank"
                >
                    <span className="label">GitHub</span>
                </a>
            </p>
            <p>
                <a
                    href="https://www.ssiprotocol.com/#/"
                    rel="noreferrer" target="_blank"
                >
                    <span className="label">&#9889;</span>
                </a>
            </p>
        </footer>
    );
}

export default Footer;
