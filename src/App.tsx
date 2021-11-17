import React from 'react';
import { Header, Footer, PublicIdentity, DIDxWallet } from './components';
import './styles/scss/application.scss';
import { HashRouter as Router, Route, Switch } from "react-router-dom";

function App() {
    return (
        <div id="wrapper">
            <Router>
                <Switch>
                    <Route exact path="/" ><Header /></Route>
                    <Route exact path="/identity" ><PublicIdentity /></Route>
                    <Route exact path="/xwallet" ><DIDxWallet /></Route>
                </Switch>
                <div id="footer">
                    <Footer />
                    <code>
                        TYRON Self-Sovereign Identity Protocol
                    </code>
                </div>
            </Router>
        </div>
    );
}

export default App;
