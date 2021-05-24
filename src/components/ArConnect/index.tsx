import React from "react";

import styles from "./styles.module.scss";

import useAuthentication from "../../hooks/useAuthentication";

function ArConnect() {
  const { connect, disconnect, isAuthenticated, isArConnectInstalled } =
    useAuthentication();

  const handleConnect = () => {
    // @TODO: Modify this to trigger modal
    if (isArConnectInstalled)
      connect(() => {
        // @TODO: Dispatch modal for letting the user know they successfully connected
      });
    else console.log("Dispatch modal with warning");
  };

  const handleDisconnect = () =>
    disconnect(() => {
      // @TODO: Dispatch modal for letting the user know they successfully disconnected
    });

  return (
    <button
      type="button"
      className={styles.button}
      onClick={isAuthenticated ? handleConnect : handleDisconnect}
    >
      {isAuthenticated ? "Disconnect" : "Connect"}
    </button>
  );
}

export default ArConnect;
