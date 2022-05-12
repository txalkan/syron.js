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
  WithdrawalModal,
  NewMotionsModal,
} from "../";
import { $menuOn } from "../../src/store/menuOn";
import {
  $modalDashboard,
  $modalNewSsi,
  $modalTx,
  $modalGetStarted,
  $modalBuyNft,
  $modalAddFunds,
  $modalWithdrawal,
  $modalNewMotions,
} from "../../src/store/modal";
import styles from "./styles.module.scss";

function Header() {
  const menuOn = useStore($menuOn);
  const modalDashboard = useStore($modalDashboard);
  const modalNewSsi = useStore($modalNewSsi);
  const modalTx = useStore($modalTx);
  const modalGetStarted = useStore($modalGetStarted);
  const modalBuyNft = useStore($modalBuyNft);
  const modalAddFunds = useStore($modalAddFunds);
  const modalWithdrawal = useStore($modalWithdrawal);
  const modalNewMotions = useStore($modalNewMotions);

  return (
    <>
      <div id="header">
        <div className="content">
          <ToastContainer
            className={styles.containerToast}
            closeButton={false}
            progressStyle={{ backgroundColor: "#eeeeee" }}
          />
          {!menuOn &&
            !modalTx &&
            !modalGetStarted &&
            !modalNewSsi &&
            !modalBuyNft &&
            !modalAddFunds &&
            !modalWithdrawal &&
            !modalNewMotions &&
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
          <WithdrawalModal />
          <NewMotionsModal />
        </>
      )}
      {!menuOn && !modalTx && <DashboardModal />}
      {!menuOn && <TransactionStatus />}
    </>
  );
}

export default Header;
