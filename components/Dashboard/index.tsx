import React, { useEffect } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useStore } from "effector-react";
import userConnected from "../../src/assets/icons/user_connected.svg";
import userLoggedIn from "../../src/assets/icons/user_loggedin.svg";
import userConnect from "../../src/assets/icons/user_connect.svg";
import styles from "./styles.module.scss";
import { RootState } from "../../src/app/reducers";
import {
  updateModalDashboard,
  updateModalNewSsi,
  updateShowZilpay,
  $showZilpay,
  $dashboardState,
} from "../../src/store/modal";
import { ZilPay } from "..";
import { $net } from "../../src/store/wallet-network";
import { toast } from "react-toastify";

function Component() {
  const net = useStore($net);
  const loginInfo = useSelector((state: RootState) => state.modal);
  const showZilpay = useStore($showZilpay);
  const dashboardState = useStore($dashboardState);

  const onConnect = () => {
    if (dashboardState !== "") {
      updateModalDashboard(true);
      updateModalNewSsi(false);
    } else {
      updateShowZilpay(true);
    }
    toast.info(`Browsing on ${net}`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      toastId: 4,
    });
  };

  useEffect(() => {
    if (loginInfo.zilAddr !== null) {
      updateShowZilpay(false);
    }
  }, [loginInfo.zilAddr]);

  return (
    <div className={styles.wrapper} onClick={onConnect}>
      {dashboardState === "loggedIn" ? (
        <>
          <Image src={userLoggedIn} alt="user-loggedin" />
          <div className={styles.txtLoggedIn}>LOGGED IN</div>
        </>
      ) : dashboardState === "connected" ? (
        <>
          <Image src={userConnected} alt="user-connected" />
          <div className={styles.txtConnected}>CONNECTED</div>
        </>
      ) : (
        <>
          <Image src={userConnect} alt="user-connect" />
          <div className={styles.txtConnect}>CONNECT</div>
        </>
      )}
      {showZilpay && <ZilPay />}
    </div>
  );
}

export default Component;
