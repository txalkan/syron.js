import React from "react";
import lgArconnect from "../../src/assets/logos/lg_arconnect.png";
import useArConnect from "../../src/hooks/useArConnect";
import styles from "./styles.module.scss";
import Image from "next/image";
import { toast } from "react-toastify";

function ArConnect() {
  const { connect, /*disconnect, isAuthenticated,*/ isArConnectInstalled } =
    useArConnect();

  // @todo-i review if the following is still needed
  const handleConnect = () => {
    // if (isArConnectInstalled) {
    //   connect(() => {
    //     toast.info("Connected!", {
    //       position: "top-center",
    //       autoClose: 2000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //       theme: "dark",
    //     });
    //   });
    // } else {
    //   // @TODO: Improve this alert/ could add modal instead or toast
    //   if (
    //     window.confirm(
    //       "You need an ArConnect wallet. Click OK to get redirected to ArConnect."
    //     )
    //   ) {
    //     window.open("https://arconnect.io/");
    //   }
    // }
  };

  /*const handleDisconnect = () =>
        disconnect(() => {
            // @TODO: Dispatch message to let the user know they successfully disconnected
        });*/

  return (
    <button
      type="button"
      className={`${styles.button}`}
      onClick={handleConnect}
    >
      <div className={styles.logo}>
        <Image alt="ar-logo" src={lgArconnect} />
      </div>
      <p className={styles.buttonText}>ArConnect</p>
    </button>
  );
}

export default ArConnect;
