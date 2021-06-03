import React from 'react';

import { SearchBar } from '../index';

function Header() {
  return (
    <div id="header">
      <div className="content">
        <div className="inner">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}

export default Header;
