import React from 'react';

import lgArconnect from '../../assets/logos/lg_arconnect.png';
import useAuthentication from '../../hooks/useArConnect';

import styles from './styles.module.scss';

export interface IArConnect {
  className?: string;
}

function ArConnect({ className }: IArConnect) {
  const { connect, disconnect, isAuthenticated, isArConnectInstalled } =
    useAuthentication();

  const handleConnect = () => {
    // @TODO: Modify this to trigger modal
    if (isArConnectInstalled)
      connect(() => {
        // @TODO: Dispatch modal for letting the user know they successfully connected
      });
    else {
      // @TODO: Improve this. Have a modal instead of an alert.
      window.alert('You need to have ArConnect extension installed');
    }
  };

  const handleDisconnect = () =>
    disconnect(() => {
      // @TODO: Dispatch modal for letting the user know they successfully disconnected
    });

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={isAuthenticated ? handleDisconnect : handleConnect}
    >
      <img src={lgArconnect} className={styles.logo} />
      <p className={styles.buttonText}>Sign in with ArConnect</p>
    </button>
  );
}

export default ArConnect;
