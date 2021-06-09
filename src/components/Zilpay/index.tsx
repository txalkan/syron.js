import React from 'react';

import { ReactComponent as ZilpayIcon } from '../../assets/logos/lg_zilpay.svg';

import styles from './styles.module.scss';

function Zilpay() {
  return (
    <button className={styles.signin}>
      <ZilpayIcon className={styles.zilpayIcon} />
      <p className={styles.signinText}>Sign in with Zilpay</p>
    </button>
  );
}

export default Zilpay;
