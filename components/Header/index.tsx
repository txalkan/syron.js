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
} from "../../src/store/modal";
import styles from "./styles.module.scss"

function Header() {
  const menuOn = useStore($menuOn);
  const modalDashboard = useStore($modalDashboard);
  const modalNewSsi = useStore($modalNewSsi);
  const modalTx = useStore($modalTx);
  const modalGetStarted = useStore($modalGetStarted);
  const modalBuyNft = useStore($modalBuyNft);
  const modalAddFunds = useStore($modalAddFunds);
  const modalWithdrawal = useStore($modalWithdrawal);

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
        </>
      )}
      {!menuOn && !modalTx && <DashboardModal />}
      {!menuOn && <TransactionStatus />}
    </>
  );
}

export default Header;
