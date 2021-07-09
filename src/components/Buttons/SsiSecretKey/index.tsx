import React from 'react';
import { MODALS } from '../../../context/modal/types';
import { actionsCreator } from '../../../context/modal/actions';
import { useDispatch } from '../../../context/index';
import styles from './styles.module.scss';

function SsiSecretKey() {
    const dispatch = useDispatch();
    const handleOnClick = () =>
        dispatch(actionsCreator.openModal(MODALS.SSI_SECRET_KEY));

    return (
        <>
            <button className={styles.privateKey} onClick={handleOnClick}>
                <img src={undefined} className={styles.logo} />
                <p className={styles.buttonText}>SSI secret key</p>
            </button>
        </>
    );
}

export default SsiSecretKey;
