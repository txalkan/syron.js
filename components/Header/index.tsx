import React from "react";
import { ToastContainer } from 'react-toastify'
import {
  SearchBar
} from "../index";

function Header() {
  return (
    <>
      <div id="header">
        <div className="content">
          <ToastContainer closeButton={false} progressStyle={{backgroundColor: '#eeeeee'}} />
          <div className="inner">
            <SearchBar />
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
