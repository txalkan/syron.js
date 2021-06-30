import React from 'react';
import useZilPay from '../../hooks/useZilPay';
import { ReactComponent as ZilpayIcon } from '../../assets/logos/lg_zilpay.svg';
import styles from './styles.module.scss';
export interface IZilPay {
    className?: string;
}

function ZilPay({ className }: IZilPay) {
    const { connect } = useZilPay();

    const handleConnect = () => {
        connect(() => {
            // @TODO: Dispatch modal for letting the user know they successfully connected
        });
    };

    return (
        <button
            type="button"
            className={`${styles.signin} ${className}`}
            onClick={() => handleConnect()}
        >
            <ZilpayIcon className={styles.zilpayIcon} />
            <p className={styles.signinText}>ZilPay</p>
        </button>
    );
}

export default ZilPay;
