import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $user } from 'src/store/user';
import { DIDOperations } from '..';
import styles from './styles.module.scss';

function Component() {
    const user = useStore($user);
    const [hideOperations, setHideOperations] = useState(true);
    const [operationsLegend, setOperationsLegend] = useState('operations');

    const [hideDns, setHideDns] = useState(true);
    const [dnsLegend, setDnsLegend] = useState('dns');

    const [hideTrade, setHideTrade] = useState(true);
    const [tradeLegend, setTradeLegend] = useState('trade');
    
    const [hideOrder, setHideOrder] = useState(true);
    const [orderLegend, setOrderLegend] = useState('order');
    
    const [hidePSC, setHidePSC] = useState(true);
    const [pscLegend, setPSCLegend] = useState('join');
    
    return (
        <div style={{ marginTop: '12%' }}>
            <h1 style={{ textAlign: 'center', color: 'yellow' }}>
                DID<span style={{ textTransform: 'lowercase' }}>x</span>Wallet{' '}
                <span style={{ textTransform: 'lowercase', color: 'white' }}>
                    of
                </span>{' '}
                <span className={ styles.username }>
                    {user?.nft}.{user?.domain}
                </span>
            </h1>
            {   
                hideTrade && hideOrder && hidePSC &&
                    <div style={{ marginTop: '8%' }}>
                        <h3>
                            DID{' '}
                            {
                                hideDns && <>{
                                    hideOperations
                                    ?   <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideOperations(false);
                                                setOperationsLegend('back');
                                            }}
                                        >
                                            <p className={styles.buttonWhiteText}>
                                                {operationsLegend}
                                            </p>
                                        </button>
                                    :   <>
                                            operations
                                            <button
                                                type="button"
                                                className={styles.button}
                                                onClick={() => {
                                                    setHideOperations(true);
                                                    setOperationsLegend('operations');
                                                }}
                                            >
                                                <p className={styles.buttonText}>
                                                    {operationsLegend}
                                                </p>
                                            </button>
                                        </>
                                }</>
                            }
                            {
                                hideOperations && <>{
                                    hideDns
                                    ?   <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideDns(false);
                                                setDnsLegend('back');
                                            }}
                                        >
                                            <p className={styles.buttonWhiteText}>
                                                {dnsLegend}
                                            </p>
                                        </button>
                                
                                    :   <>
                                            DNS or NFT Username DNS
                                            <button
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
                                        </>
                                }</>
                            }
                        </h3>
                        {
                            !hideOperations &&
                                <DIDOperations />
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
                hideOperations && hideDns && hideOrder && hidePSC &&
                <div style={{ marginTop: '8%' }}>
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
                    </h3>
                    {
                        !hideTrade &&
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                </div>
            }
            {
                hideOperations && hideDns && hideTrade && hidePSC &&
                <div style={{ marginTop: '8%' }}>
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
                hideOperations && hideDns && hideTrade && hideOrder &&
                <div style={{ marginTop: '8%' }}>
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
