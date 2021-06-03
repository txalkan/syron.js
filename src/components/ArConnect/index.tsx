import React from 'react';

import styles from './styles.module.scss';

import useAuthentication from '../../hooks/useAuthentication';

export interface IArConnect {
  className?: string;
}

function ArConnect({ className }: IArConnect) {
  const { connect, disconnect, isAuthenticated, isArConnectInstalled } =
    useAuthentication();
  console.log({ isAuthenticated });

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
      {isAuthenticated ? 'Disconnect' : 'Connect'}
    </button>
  );
}

export default ArConnect;
