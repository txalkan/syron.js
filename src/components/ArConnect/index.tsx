import React from 'react';
import lgArconnect from '../../assets/logos/lg_arconnect.png';
import useArConnect from '../../hooks/useArConnect';
import styles from './styles.module.scss';

export interface IArConnect {
    className?: string;
}

function ArConnect({ className }: IArConnect) {
    const { connect, disconnect, isAuthenticated, isArConnectInstalled } =
        useArConnect();

    const handleConnect = () => {
        if (isArConnectInstalled)
            connect(() => {
                // @TODO: Dispatch message to let the user know they successfully connected
            });
        else {
            // @TODO: Improve this alert/ could add modal instead
            window.alert('You need to have the ArConnect extension installed');
        }
    };

    const handleDisconnect = () =>
        disconnect(() => {
            // @TODO: Dispatch message to let the user know they successfully disconnected
        });

    return (
        <button
            type="button"
            className={`${styles.button} ${className}`}
            onClick={isAuthenticated ? handleDisconnect : handleConnect}
        >
            <img src={lgArconnect} className={styles.logo} />
            <p className={styles.buttonText}>ArConnect</p>
        </button>
    );
}

export default ArConnect;

//@todo decide the design for alerts, preferably without dependencies.
// Or let's discuss which dependency is the best one (material-ui?)
