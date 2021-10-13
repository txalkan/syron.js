import React, { useState } from 'react';
import styles from './styles.module.scss';

function Component({ name, domain }: { 
        name: string;
        domain: string;
    }
) {
    const [hideDoc, setHideDoc] = useState(true);
    const [docLegend, setDocLegend] = useState('did');

    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('recovery');

    const [hideDns, setHideDns] = useState(true);
    const [dnsLegend, setDnsLegend] = useState('dns');

    const [hideTrade, setHideTrade] = useState(true);
    const [tradeLegend, setTradeLegend] = useState('trade');
    
    const [hideStake, setHideStake] = useState(true);
    const [stakeLegend, setStakeLegend] = useState('stake');

    const [hideOrder, setHideOrder] = useState(true);
    const [orderLegend, setOrderLegend] = useState('order');
    
    const [hidePSC, setHidePSC] = useState(true);
    const [pscLegend, setPSCLegend] = useState('join');
    
    return (
        <div style={{ marginTop: '8%' }}>
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
                hideTrade && hideStake && hideOrder && hidePSC &&
                <div style={{ marginTop: '6%', width: '110%' }}>
                    <h3>
                        Decentralized identity
                        {
                            hideDoc
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDoc(false);
                                        setDocLegend('off');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {docLegend}
                                    </p>
                                </button>
                            :   <button
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
                        }
                        {
                            hideRecovery
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideRecovery(false);
                                        setRecoveryLegend('off');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {recoveryLegend}
                                    </p>
                                </button>
                            :    <button
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
                        }
                        {
                            hideDns
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDns(false);
                                        setDnsLegend('off');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {dnsLegend}
                                    </p>
                                </button>
                            :    <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDns(true);
                                        setDnsLegend('dns');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {dnsLegend}
                                    </p>
                                </button>
                        }
                    </h3>
                    {
                        !hideDoc &&
                            <>
                                <div style={{ marginTop: '7%' }}>
                                    <p>Coming soon.</p>
                                </div>
                            </>
                    }
                    {
                        !hideRecovery &&
                            <>
                                <div style={{ marginTop: '7%' }}>
                                    <p>Coming soon.</p>
                                </div>
                            </>
                    }
                    {
                        !hideDns &&
                            <>
                                <div style={{ marginTop: '7%' }}>
                                    <p>Coming soon.</p>
                                </div>
                            </>
                    }
                </div>
            }
            {
                hideOrder && hidePSC &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        Decentralized finance
                        {
                            hideTrade
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideTrade(false);
                                        setTradeLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {tradeLegend}
                                    </p>
                                </button>
                            :    <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideTrade(true);
                                        setTradeLegend('trade');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {tradeLegend}
                                    </p>
                                </button>
                        }
                        {
                            hideStake
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideStake(false);
                                        setStakeLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {stakeLegend}
                                    </p>
                                </button>
                            :    <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideStake(true);
                                        setStakeLegend('stake');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {stakeLegend}
                                    </p>
                                </button>
                        }
                    </h3>
                    {
                        !hideTrade &&
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                    {
                        !hideStake &&
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                </div>
            }
            {
                hideTrade && hideStake && hidePSC &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        Meta-transactions
                        {
                            hideOrder
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideOrder(false);
                                        setOrderLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {orderLegend}
                                    </p>
                                </button>
                            :    <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideOrder(true);
                                        setOrderLegend('order');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {orderLegend}
                                    </p>
                                </button>
                        }
                    </h3>
                    {
                        !hideOrder &&
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                </div>
            }
            {
                hideTrade && hideStake && hideOrder &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        SSI Staking Program
                        {
                            hidePSC
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHidePSC(false);
                                        setPSCLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {pscLegend}
                                    </p>
                                </button>
                            :    <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHidePSC(true);
                                        setPSCLegend('join');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {pscLegend}
                                    </p>
                                </button>
                        }
                    </h3>
                    {
                        !hidePSC &&
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
