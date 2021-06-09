import React from 'react';

import { MODALS } from '../../context/modal/types';

import { Modal, ArConnect, Zilpay } from '../index';

import styles from './styles.module.scss';

function SignInModal() {
  return (
    <Modal name={MODALS.LOG_IN} className={styles.modal}>
      <h2 className={styles.title}>Log in</h2>
      <Zilpay />
      <ArConnect />
    </Modal>
  );
}

export default SignInModal;
