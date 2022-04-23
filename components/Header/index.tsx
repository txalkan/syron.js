import { useStore } from "effector-react";
import React from "react";
import { ToastContainer } from "react-toastify";
import { ConnectModal, SearchBar, NewSSIModal, TransactionStatus } from "../";
import { $menuOn } from "../../src/store/menuOn";

function Header() {
  const menuOn = useStore($menuOn);

  return (
    <>
      <div id="header">
        <div className="content">
          <ToastContainer
            style={{ maxWidth: 500 }}
            closeButton={false}
            progressStyle={{ backgroundColor: "#eeeeee" }}
          />
          {!menuOn && (
            <div className="inner">
              <SearchBar />
            </div>
          )}
        </div>
      </div>
      {!menuOn && (
        <>
          <ConnectModal />
          <NewSSIModal />
          <TransactionStatus />
        </>
      )}
    </>
  );
}

export default Header;
