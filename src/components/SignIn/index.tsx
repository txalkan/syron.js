import React from 'react';
import { MODALS } from '../../context/modal/types';
import { actionsCreator } from '../../context/modal/actions';
import { useDispatch } from '../../context/index';
import styles from './styles.module.scss';

function SignIn() {
  const dispatch = useDispatch();
  const handleOnClick = () => dispatch(actionsCreator.openModal(MODALS.SIGN_IN));

  return (
    <>
      <button className={styles.signin} onClick={handleOnClick}>
        Sign in
      </button>
    </>
  );
}

export default SignIn;
