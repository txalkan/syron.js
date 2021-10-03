import React, { useState } from 'react';
import { DIDDocument } from '..';
import styles from './styles.module.scss';

function Component({ name, domain }: { 
        name: string;
        domain: string;
    }
) {
    const [doc, SetDocShow] = useState(false);
    const [docLegend, setDocLegend] = useState('settings');

    const [trade, setTradeShow] = useState(false);
    const [tradeLegend, setTradeLegend] = useState('trade');
    
    const [stake, setStakeShow] = useState(false);
    const [stakeLegend, setStakeLegend] = useState('stake');

    const [recovery, setRecoveryShow] = useState(false);
    const [recoveryLegend, setRecoveryLegend] = useState('settings');

    const [update, setUpdateShow] = useState(false);
    const [updateLegend, setUpdateLegend] = useState('update');
    
    return (
        <div style={{ marginTop: '10%' }}>
            <h2 style={{ textAlign: 'center', color: 'yellow' }}>
                SSI Wallet{' '}
                <span style={{ textTransform: 'lowercase', color: 'white' }}>
                    of
                </span>{' '}
                <strong style={{ color: 'lightblue' }}>
                    {name}.{domain}
                </strong>
            </h2>
            <div style={{ marginTop: '9%' }}>
                <h3 style={{ marginBottom: '3%' }}>
                    DID <strong style={{ color: 'yellow' }}>identity</strong>
                    <>
                        {
                            !doc &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        SetDocShow(true);
                                        setDocLegend('Hide');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {docLegend}
                                    </p>
                                </button>
                        }
                        {
                            doc &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        SetDocShow(false);
                                        setDocLegend('settings');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {docLegend}
                                    </p>
                                </button>
                        }
                    </>
                </h3>
                <>
                    {
                        doc &&
                            < DIDDocument />
                    }
                </>
            </div>
            <div style={{ marginTop: '9%' }}>
                <h3>
                    Decentralized
                    <strong style={{ color: 'yellow' }}> finance</strong>
                    <>
                        {
                            !trade &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setTradeShow(true);
                                        setTradeLegend('Hide');
                                    }}
                                >
                                    <p className={styles.buttonText}>
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
                    </>
                    <>
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
                                    <p className={styles.buttonText}>
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
                    </>
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
            <div style={{ marginTop: '9%' }}>
                <h3>
                    Social
                    <strong style={{ color: 'yellow' }}> recovery</strong>
                    <>
                        {
                            !recovery &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setRecoveryShow(true);
                                        setRecoveryLegend('Hide');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {recoveryLegend}
                                    </p>
                                </button>
                        }
                        {
                            recovery &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setRecoveryShow(false);
                                        setRecoveryLegend('access');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {recoveryLegend}
                                    </p>
                                </button>
                        }
                    </>
                </h3>
                <>
                    {
                        recovery &&
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                </>
            </div>
            <div style={{ marginTop: '9%' }}>
                <h3 style={{ width: '150%' }}>
                    <strong style={{ color: 'yellow' }}> addresses</strong>
                    <>
                        {
                            !update &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setUpdateShow(true);
                                        setUpdateLegend('Hide');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {updateLegend}
                                    </p>
                                </button>
                        }
                        {
                            update &&
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setUpdateShow(false);
                                        setUpdateLegend('update');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {updateLegend}
                                    </p>
                                </button>
                        }
                    </>
                </h3>
                <>
                    {
                        update &&
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                </>
            </div>
        </div>
    );
}

export default Component
