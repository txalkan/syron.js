import React from "react";
import lgArconnect from "../../src/assets/logos/lg_arconnect.png";
import useArConnect from "../../src/hooks/useArConnect";
import styles from "./styles.module.scss";
import Image from "next/image";
import { toast } from "react-toastify";

export interface IArConnect {
  className?: string;
}

//@todo re-evaluate IArConnect
function ArConnect({ className }: IArConnect) {
  const { connect, /*disconnect, isAuthenticated,*/ isArConnectInstalled } =
    useArConnect();

  const handleConnect = () => {
    if (isArConnectInstalled) {
      connect(() => {
        toast.info('SSI Private Key connected!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      });
    } else {
      // @TODO: Improve this alert/ could add modal instead
      if (
        window.confirm(
          "You have to download the ArConnect browser extension. Click OK to get redirected."
        )
      ) {
        window.open("https://arconnect.io/");
      }
    }
  };

  /*const handleDisconnect = () =>
        disconnect(() => {
            // @TODO: Dispatch message to let the user know they successfully disconnected
        });*/

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
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

//@todo decide the design for alert boxes, preferably without dependencies.
// Or let's discuss which dependency is the best one (material-ui?)
