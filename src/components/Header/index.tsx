import React from 'react';
import { SearchBar, SignIn, NewWallet, FAQ, AccessWallet } from '../index';

function Header() {
    return (
        <>
            <div id="header">
                <div className="content">
                    <div className="inner">
                        <SearchBar />
                        <AccessWallet />
                    </div>
                </div>
            </div>
            <SignIn />
            <NewWallet />
            <FAQ />
        </>
    );
}

export default Header;
