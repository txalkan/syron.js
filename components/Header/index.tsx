import { useStore } from "effector-react";
import React from "react";
import { ToastContainer } from "react-toastify";
import {
  SearchBar,
  NewSSIModal,
  TransactionStatus,
  GetStartedModal,
  BuyNFTModal,
  DashboardModal,
  AddFundsModal,
} from "../";
import { $menuOn } from "../../src/store/menuOn";
import {
  $modalDashboard,
  $modalNewSsi,
  $modalTx,
  $modalGetStarted,
  $modalBuyNft,
  $modalAddFunds,
} from "../../src/store/modal";

function Header() {
  const menuOn = useStore($menuOn);
  const modalDashboard = useStore($modalDashboard);
  const modalNewSsi = useStore($modalNewSsi);
  const modalTx = useStore($modalTx);
  const modalGetStarted = useStore($modalGetStarted);
  const modalBuyNft = useStore($modalBuyNft);
  const modalAddFunds = useStore($modalAddFunds);

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
            !modalAddFunds &&
            !modalDashboard && (
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
          <AddFundsModal />
        </>
      )}
      {!menuOn && !modalTx && <DashboardModal />}
      {!menuOn && <TransactionStatus />}
    </>
  );
}

export default Header;
