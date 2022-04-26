import { useStore } from "effector-react";
import React from "react";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import {
  SearchBar,
  NewSSIModal,
  TransactionStatus,
  GetStartedModal,
  LogInModal,
  BuyNFTModal,
  DashboardModal,
} from "../";
import { $menuOn } from "../../src/store/menuOn";
import {
  $modalDashboard,
  $modalNewSsi,
  $modalTx,
  $modalLogin,
  $modalGetStarted,
  $modalBuyNft,
} from "../../src/store/modal";

function Header() {
  const menuOn = useStore($menuOn);
  const modalDashboard = useStore($modalDashboard);
  const modalNewSsi = useStore($modalNewSsi);
  const modalTx = useStore($modalTx);
  const modalLogin = useStore($modalLogin);
  const modalGetStarted = useStore($modalGetStarted);
  const modalBuyNft = useStore($modalBuyNft);

  return (
    <>
      <div id="header">
        <div className="content">
          <ToastContainer
            style={{ maxWidth: 500 }}
            closeButton={false}
            progressStyle={{ backgroundColor: "#eeeeee" }}
          />
          {!menuOn &&
            !modalTx &&
            !modalGetStarted &&
            !modalNewSsi &&
            !modalBuyNft &&
            !modalDashboard &&
            !modalLogin && (
              <div className="inner">
                <SearchBar />
              </div>
            )}
        </div>
      </div>
      {!menuOn && !modalTx && !modalDashboard && (
        <>
          <NewSSIModal />
          <GetStartedModal />
          <BuyNFTModal />
          <LogInModal />
        </>
      )}
      {!menuOn && !modalTx && <DashboardModal />}
      {!menuOn && <TransactionStatus />}
    </>
  );
}

export default Header;
