import React, { useState } from 'react';
import { DIDDocument } from '..';
import styles from './styles.module.scss';

function Component({ name, domain }: { 
        name: string;
        domain: string;
    }
) {
    const [hideDoc, setHideDoc] = useState(true);
    const [docLegend, setDocLegend] = useState('settings');

    const [trade, setTradeShow] = useState(false);
    const [tradeLegend, setTradeLegend] = useState('trade');
    
    const [stake, setStakeShow] = useState(false);
    const [stakeLegend, setStakeLegend] = useState('stake');

    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('settings');

    const [hideUpdate, setHideUpdate] = useState(true);
    const [updateLegend, setUpdateLegend] = useState('settings');
    
    return (
        <div style={{ marginTop: '10%' }}>
            <h2 style={{ textAlign: 'center', color: 'yellow' }}>
                SSI Wallet{' '}
                <span style={{ textTransform: 'lowercase', color: 'white' }}>
                    of
                </span>{' '}
                <span style={{ color: 'lightblue' }}>
                    {name}.{domain}
                </span>
            </h2>
            {   
                hideRecovery && hideUpdate &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        {
                            hideDoc
                            ?   <>
                                    Decentralized identity
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideDoc(false);
                                            setDocLegend('back');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {docLegend}
                                        </p>
                                    </button>
                                </>
                        
                            :   <>
                                    <span style={{ color: 'whitesmoke' }}>Decentralized identity</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideDoc(true);
                                            setDocLegend('settings');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {docLegend}
                                        </p>
                                    </button>
                                </>
                        }
                    </h3>
                    {
                        !hideDoc &&
                            < DIDDocument />
                    }
                </div>
            }
            {
                hideDoc && hideRecovery && hideUpdate &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        Decentralized finance
                        {
                            !trade &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setTradeShow(true);
                                        setTradeLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {tradeLegend}
                                    </p>
                                </button>
                        }
                        {
                            trade &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setTradeShow(false);
                                        setTradeLegend('trade');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {tradeLegend}
                                    </p>
                                </button>
                        }
                        {
                            !stake &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setStakeShow(true);
                                        setStakeLegend('Hide');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {stakeLegend}
                                    </p>
                                </button>
                        }
                        {
                            stake &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setStakeShow(false);
                                        setStakeLegend('stake');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {stakeLegend}
                                    </p>
                                </button>
                        }
                    </h3>
                    <>
                        {
                            trade &&
                                <div style={{ marginTop: '7%' }}>
                                    <p>Coming soon.</p>
                                </div>
                        }
                    </>
                    <>
                        {
                            stake &&
                                <div style={{ marginTop: '7%' }}>
                                    <p>Coming soon.</p>
                                </div>
                        }
                    </>
                </div>
            }
            {
                hideDoc && hideUpdate &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        {
                            hideRecovery
                            ?   <>
                                    Social <span style={{ color: 'whitesmoke' }}>recovery</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideRecovery(false);
                                            setRecoveryLegend('back');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {recoveryLegend}
                                        </p>
                                    </button>
                                </>
                            :   <>
                                    <span style={{ color: 'whitesmoke' }}>Social recovery</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideRecovery(true);
                                            setRecoveryLegend('settings');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {recoveryLegend}
                                        </p>
                                    </button>
                                </>
                        }                                
                    </h3>
                    {
                        !hideRecovery &&
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                </div>
            }
            {
                hideDoc && hideRecovery &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        {
                            hideUpdate
                            ?   <>
                                    Update <span style={{ color: 'whitesmoke' }}>addresses</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideUpdate(false);
                                            setUpdateLegend('back');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {updateLegend}
                                        </p>
                                    </button>
                                </>
                            :   <>
                                    <span style={{ color: 'whitesmoke' }}>Update addresses</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideUpdate(true);
                                            setUpdateLegend('settings');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {updateLegend}
                                        </p>
                                    </button>
                                </>
                        }                                
                    </h3>
                    {
                        !hideUpdate &&
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                </div>
            }
        </div>
    );
}

export default Component
