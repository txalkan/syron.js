import React from 'react';
import { useStore } from 'effector-react';
import { $isAdmin, updateIsAdmin } from 'src/store/admin';
import styles from './styles.module.scss';
import { $arconnect } from 'src/store/arconnect';

function Component() {
    const arConnect = useStore($arconnect);
    const is_admin = useStore($isAdmin);

    const handleShow = () => {
        if( arConnect === null ){
            alert('To continue, connect your SSI private key to encrypt/decrypt data.')
        } else {
            updateIsAdmin({
                verified: true,
                hideWallet: false,
                legend: 'hide wallet'
            })
        }
    };
    const handleHide = () => {
        updateIsAdmin({
            verified: true,
            hideWallet: true,
            legend: 'access DID wallet'
        })
    };

    return (
        <>           
            {
                is_admin?.verified && is_admin.hideWallet &&
                    <button
                        type="button"
                        className={ styles.button }
                        onClick={ handleShow }
                    >
                        <p className={ styles.buttonShow }>
                            { is_admin.legend }
                        </p>
                    </button>
            }
            {
                is_admin?.verified && !is_admin.hideWallet &&
                    <button
                        type="button"
                        className={ styles.button }
                        onClick={ handleHide }
                    >
                        <p className={styles.buttonHide}>
                            { is_admin.legend }
                        </p>
                    </button>
            }
        </>
    );
}

export default Component;
