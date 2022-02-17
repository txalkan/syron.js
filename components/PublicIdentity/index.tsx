import { useStore } from 'effector-react';
import React, { useState, ReactNode, useEffect } from 'react';
import { $doc } from '../../src/store/did-doc';
import { updateLoggedIn } from '../../src/store/loggedIn';
import { $user } from '../../src/store/user';
import { $publicIdentity, updatePublicIdentity } from '../../src/store/public-identity';
import { updateIsAdmin } from '../../src/store/admin';
import { useRouter } from 'next/router';
import styles from './styles.module.scss';

interface LayoutProps {
    children: ReactNode;
  }

function Component(props: LayoutProps) {
    const { children } = props
    const Router = useRouter()
    const user = useStore($user);
    const doc = useStore($doc);
    const publicIdentity = useStore($publicIdentity);

    const resetWalletState = () => {
        updateIsAdmin({
            verified: false,
            hideWallet: true,
            legend: 'access DID wallet'
        });
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '14%' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10%' }}>
                Public identity{' '}
                <span style={{ textTransform: 'lowercase', color: 'whitesmoke' }}>
                    of
                </span>{' '}
                <span className={styles.username}>
                    <span style={{ color: 'whitesmoke' }}>{user?.name}</span>.{user?.domain}
                </span>
            </h1>
            {
                user?.domain === 'did' &&
                <div style={{ marginTop: '14%' }}>
                    <h2>
                        {publicIdentity === null || publicIdentity === '' ? (
                            <button
                                type="button"
                                className={styles.button}
                                onClick={() => {
                                    Router.push(`/${user?.name}/did`);
                                    updatePublicIdentity('did');
                                    resetWalletState();
                                }}
                            >
                                <p className={styles.buttonYellowText}>
                                    did
                                </p>
                            </button>
                        ): publicIdentity === 'did' ? (
                            <button
                                type="button"
                                className={styles.button}
                                onClick={() => {
                                    updatePublicIdentity('');
                                    resetWalletState();
                                    Router.back();
                                }}
                            >
                                <p className={styles.buttonText}>
                                    back
                                </p>
                            </button>
                        ):<></>}
                    </h2>
                </div>
            }
            <div style={{ marginTop: '7%' }}>
                <h2>
                    {
                        publicIdentity === null || publicIdentity === ''
                            ? <>
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        if (
                                            Number(doc?.version.substr(8, 1)) >= 4 ||
                                            doc?.version.substr(0, 4) === 'init' ||
                                            doc?.version.substr(0, 3) === 'dao'
                                        ) {
                                            updatePublicIdentity('top-up');
                                            resetWalletState();
                                            Router.push(`/${user?.name}/top-up`);
                                        } else {
                                            alert(`This feature is available from version 4. Tyron recommends upgrading ${user?.name}'s account.`
                                            )
                                        }
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        top up
                                    </p>
                                </button>
                            </>
                            : publicIdentity === 'top-up' ? <>
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        updatePublicIdentity('');
                                        updateLoggedIn(null);
                                        resetWalletState();
                                        Router.back()
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        back
                                    </p>
                                </button>
                            </>
                            : <></>
                    }
                    {
                        user?.domain === 'did' &&
                        <>
                            {
                                publicIdentity === null || publicIdentity === ''
                                    ? <button
                                        type="button"
                                        className={styles.button}
                                        style={{ marginLeft: '3%' }}
                                        onClick={() => {
                                            updatePublicIdentity('social-recovery');
                                            resetWalletState();
                                            Router.push(`/${user?.name}/social-recovery`);
                                        }}
                                    >
                                        <p className={styles.buttonColorText}>
                                            social recovery
                                        </p>
                                    </button>
                                    : publicIdentity === 'social-recovery' ? <div style={{ alignContent: 'left' }}>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                updatePublicIdentity('');
                                                resetWalletState();
                                                Router.back()
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                back
                                            </p>
                                        </button>
                                    </div>
                                    : <></>
                            }
                        </>
                    }
                </h2>
                {children}


            </div>
        </div>
    );
}

export default Component;
