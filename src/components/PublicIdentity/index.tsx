import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { updateLoggedIn } from 'src/store/loggedIn';
import { $user } from 'src/store/user';
import { DIDDocument, SocialRecovery, Transfers } from '..';
import styles from './styles.module.scss';

function Component() {
    const user = useStore($user);
    const [hideDoc, setHideDoc] = useState(true);
    const [docLegend, setDocLegend] = useState('identity');
    const [hideTransfer, setHideTransfer] = useState(true);
    const [transferLegend, setTransferLegend] = useState('top up');
    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('recovery');
    
    return (
        <div style={{ marginTop: '12%' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '10%' }}>
                Public identity{' '}
                <span style={{ textTransform: 'lowercase', color: 'whitesmoke' }}>
                    of
                </span>{' '}
                <span className={ styles.username }>
                    <span style={{ color: 'whitesmoke' }}>{user?.nft}</span>.{user?.domain}
                </span>
            </h1>
            {   
                hideTransfer && hideRecovery && user?.domain === 'did' &&
                    <div style={{ marginLeft: '4%', marginTop: '8%' }}>
                        <h2>
                            Decentralized
                            {
                                hideDoc
                                ?   <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideDoc(false);
                                            setDocLegend('back');
                                        }}
                                    >
                                        <p className={styles.buttonBlueText}>
                                            {docLegend}
                                        </p>
                                    </button>
                                :   <>
                                        {' '}<span style={{ color: 'lightblue' }}>identity</span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideDoc(true);
                                                setDocLegend('identity');
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
            {
                hideDoc && hideRecovery &&
                    <div style={{ marginLeft: '4%', marginTop: '8%' }}>
                        <h2>
                            {   
                                hideTransfer
                                ?   <>
                                        Transfers
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideTransfer(false);
                                                setTransferLegend('back');
                                            }}
                                        >
                                            <p className={styles.buttonColorText}>
                                                {transferLegend}
                                            </p>
                                        </button>
                                    </>
                                :   <>
                                        Top up
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
                        </h2>
                        {
                            !hideTransfer &&
                                <Transfers />
                        }
                    </div>
            }
            {
                hideDoc && hideTransfer && user?.domain === 'did' &&
                    <div style={{ marginLeft: '4%', marginTop: '8%' }}>
                        <h2>
                            Social
                            {
                                hideRecovery
                                ?   <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideRecovery(false);
                                            setRecoveryLegend('back');
                                        }}
                                    >
                                        <p className={styles.buttonColorText}>
                                            {recoveryLegend}
                                        </p>
                                    </button>
                                    
                                :   <>
                                        {' '}<span style={{ color: 'lightblue' }}>recovery</span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideRecovery(true);
                                                setRecoveryLegend('recovery');
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {recoveryLegend}
                                            </p>
                                        </button>
                                    </>
                            }                                
                        </h2>
                        {
                            !hideRecovery &&
                                <SocialRecovery />
                        }
                    </div>
            }    
        </div>
    );
}

export default Component;
