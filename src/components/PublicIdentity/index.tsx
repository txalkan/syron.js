import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $doc } from 'src/store/did-doc';
import { updateLoggedIn } from 'src/store/loggedIn';
import { $user } from 'src/store/user';
import { DIDDocument, SocialRecovery, Transfers } from '..';
import styles from './styles.module.scss';

function Component() {
    const user = useStore($user);
    const doc = useStore($doc);
    const [hideDoc, setHideDoc] = useState(true);
    const [docLegend, setDocLegend] = useState('did');
    const [hideTransfer, setHideTransfer] = useState(true);
    const [transferLegend, setTransferLegend] = useState('top up');
    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('social recovery');

    return (
        <div style={{ textAlign: 'center', marginTop: '14%' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10%' }}>
                Public identity{' '}
                <span style={{ textTransform: 'lowercase', color: 'whitesmoke' }}>
                    of
                </span>{' '}
                <span className={styles.username}>
                    <span style={{ color: 'whitesmoke' }}>{user?.nft}</span>.{user?.domain}
                </span>
            </h1>
            {
                hideTransfer && hideRecovery && user?.domain === 'did' &&
                <div style={{ marginTop: '14%' }}>
                    <h2>
                        {
                            hideDoc
                                ? <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDoc(false);
                                        setDocLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonYellowText}>
                                        {docLegend}
                                    </p>
                                </button>
                                : <>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideDoc(true);
                                            setDocLegend('did');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {docLegend}
                                        </p>
                                    </button>
                                </>
                        }
                    </h2>
                    {
                        !hideDoc &&
                        <DIDDocument />
                    }
                </div>
            }
            <div style={{ marginTop: '7%' }}>
                <h2>
                    {
                        hideDoc && hideRecovery &&
                        <>
                            {
                                hideTransfer
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
                                                    setHideTransfer(false);
                                                    setTransferLegend('back');
                                                } else {
                                                    alert(`This feature is available from version 4. Tyron recommends upgrading ${user?.nft}'s account.`
                                                    )
                                                }
                                            }}
                                        >
                                            <p className={styles.buttonColorText}>
                                                {transferLegend}
                                            </p>
                                        </button>
                                    </>
                                    : <>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideTransfer(true);
                                                setTransferLegend('top up');
                                                updateLoggedIn(null);
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {transferLegend}
                                            </p>
                                        </button>
                                    </>
                            }
                        </>
                    }
                    {
                        hideDoc && hideTransfer && user?.domain === 'did' &&
                        <>
                            {
                                hideRecovery
                                    ? <button
                                        type="button"
                                        className={styles.button}
                                        style={{ marginLeft: '3%' }}
                                        onClick={() => {
                                            setHideRecovery(false);
                                            setRecoveryLegend('back');
                                        }}
                                    >
                                        <p className={styles.buttonColorText}>
                                            {recoveryLegend}
                                        </p>
                                    </button>
                                    : <div style={{ alignContent: 'left' }}>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideRecovery(true);
                                                setRecoveryLegend('social recovery');
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {recoveryLegend}
                                            </p>
                                        </button>
                                    </div>
                            }
                        </>
                    }
                </h2>
                {
                    !hideTransfer &&
                    <Transfers />
                }
                {
                    !hideRecovery && hideDoc && hideTransfer && user?.domain === 'did' &&
                    <SocialRecovery />
                }


            </div>
        </div>
    );
}

export default Component;
