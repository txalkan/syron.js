import React from 'react';
import { SearchBar, SignIn } from '../index';
import { BrowserRouter as Router } from 'react-router-dom';

function Header() {
    return (
        <>
            <div id="header">
                <div className="content">
                    <div className="inner">
                    <Router>
                        <SearchBar />
                    </Router>
                    </div>
                </div>
            </div>
            <SignIn />
        </>
    );
}

export default Header;
