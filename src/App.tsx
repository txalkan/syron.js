import React from 'react';
import { Header, Footer } from './components';
import './styles/scss/application.scss';

function App() {
    return (
        <div id="wrapper">
            <Header />
            <div id="footer">
                <Footer />
                <code>
                    TYRON Self-Sovereign Identity Protocol
                </code>
            </div>

        </div>
    );
}

export default App;
