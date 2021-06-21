import React from 'react';
import { SearchBar, SignIn } from '../index';

function Header() {
  return (
    <div id="header">
      <div className="content">
        <div className="inner">
          <SearchBar />
        </div>
        <SignIn />
      </div>
    </div>
  );
}

export default Header;
