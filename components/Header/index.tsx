import React from "react";
import { ToastContainer } from "react-toastify";
import { SearchBar } from "../";

function Header() {
  return (
    <>
      <div id="header">
        <div className="content">
          <ToastContainer
            style={{ maxWidth: 500 }}
            closeButton={false}
            progressStyle={{ backgroundColor: "#eeeeee" }}
          />
          <div className="inner">
            <SearchBar />
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
