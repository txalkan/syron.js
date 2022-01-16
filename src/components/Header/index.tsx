import React from 'react';
import { SearchBar, Connect, SSIProtocol, FAQ, AccessWallet } from '../index';

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
            <Connect />
            <SSIProtocol />
            <FAQ />
        </>
    );
}

export default Header;
