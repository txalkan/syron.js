import React from 'react';
import { useRouter } from 'next/router';
import { useStore } from 'effector-react';
import { $isAdmin, updateIsAdmin } from '../../src/store/admin';
import { $user } from '../../src/store/user';
import styles from './styles.module.scss';

function Component() {
    const Router = useRouter();
    const is_admin = useStore($isAdmin);
    const user = useStore($user);

    const handleShow = () => {
        Router.push('/DIDxWallet');
    };
    const handleHide = () => {
        Router.push(`/${user?.name}`);
        setTimeout(() => {
            updateIsAdmin({
                verified: true,
                hideWallet: true,
                legend: 'access DID wallet'
            })
        }, 100);
    };

    return (
        <>
            {
                is_admin?.verified && is_admin.hideWallet &&
                <button
                    type="button"
                    className={styles.button}
                    onClick={handleShow}
                >
                    <p className={styles.buttonShow}>
                        {is_admin.legend}
                    </p>
                </button>
            }
            {
                is_admin?.verified && !is_admin.hideWallet &&
                <button
                    type="button"
                    className={styles.button}
                    onClick={handleHide}
                >
                    <p className={styles.buttonHide}>
                        {is_admin.legend}
                    </p>
                </button>
            }
        </>
    );
}

export default Component;
