import React from 'react';
import { MODALS } from '../../../context/modal/types';
import { actionsCreatorSec } from '../../../context/modal/actions';
import { useDispatch } from '../../../context/index';
import styles from './styles.module.scss';

function PermawebKey() {
    const dispatch = useDispatch();
    const handleOnClick = () =>
        dispatch(actionsCreatorSec.openModal(MODALS.PERMAWEB_KEY));

    return (
        <>
            <button className={styles.privateKey} onClick={handleOnClick}>
                <img src={undefined} className={styles.logo} />
                <p className={styles.buttonText}>SSI Permaweb key</p>
            </button>
        </>
    );
}

export default PermawebKey;
