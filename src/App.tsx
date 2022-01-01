import React from 'react';
import { Header, Footer } from './components';
import './styles/scss/application.scss';

function App() {
    return (
        <div id="wrapper">
            <Header />
            <div id="footer">
                <div style={{ marginLeft: '4%' }}>
                    <Footer />
                    <code>
                        <a
                            href="https://www.ssiprotocol.com/#/"
                            rel="noreferrer" target="_blank"
                        >
                            <span className="label">Self-Sovereign Identity Protocol</span>
                        </a>
                    </code>
                </div>
            </div>
        </div>
    );
}

export default App;
