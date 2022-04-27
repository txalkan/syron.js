import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import userConnected from "../../src/assets/icons/user_connected.svg";
import userLoggedIn from "../../src/assets/icons/user_loggedin.svg";
import userConnect from "../../src/assets/icons/user_connect.svg";
import styles from "./styles.module.scss";
import { RootState } from "../../src/app/reducers";
import { updateModalDashboard, updateModalNewSsi } from "../../src/store/modal";
import { ZilPay } from "..";

function Component() {
  const loginInfo = useSelector((state: RootState) => state.modal);
  const [showZil, setShowZil] = useState(false);

  const onConnect = () => {
    if (loginInfo.address !== null || loginInfo.zilAddr !== null) {
      updateModalDashboard(true);
      updateModalNewSsi(false);
    } else {
      setShowZil(true);
    }
  };

  useEffect(() => {
    if (loginInfo.zilAddr !== null) {
      setShowZil(false);
    }
  }, [setShowZil, loginInfo.zilAddr]);

  return (
    <div className={styles.wrapper} onClick={onConnect}>
      {loginInfo.address !== null ? (
        <>
          <Image src={userLoggedIn} alt="user-loggedin" />
          <h6 className={styles.txtLoggedIn}>logged in</h6>
        </>
      ) : loginInfo.zilAddr !== null ? (
        <>
          <Image src={userConnected} alt="user-connected" />
          <h6 className={styles.txtConnected}>connected</h6>
        </>
      ) : (
        <>
          <Image src={userConnect} alt="user-connect" />
          <h6 className={styles.txtConnect}>connect</h6>
        </>
      )}
      {showZil && <ZilPay />}
    </div>
  );
}

export default Component;
