import React, { useState } from 'react';
import styles from './styles.module.scss';

function Component() {
    const [hideCreate, setHideCreate] = useState(true);
    const [createLegend, setCreateLegend] = useState('create');

    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('recovery');

    const [hideUpdate, setHideUpdate] = useState(true);
    const [updateLegend, setUpdateLegend] = useState('update');

    const [hideDeactivate, setHideDeactivate] = useState(true);
    const [deactivateLegend, setDeactivateLegend] = useState('deactivate');
    
    return (
        <div style={{ marginTop: '8%' }}>
            <h3>
                Decentralized Identifier operations
            </h3>
            {   
                hideRecovery && hideUpdate && hideDeactivate &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        Create
                        {
                            hideCreate
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideCreate(false);
                                        setCreateLegend('off');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {createLegend}
                                    </p>
                                </button>
                            :   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideCreate(true);
                                        setCreateLegend('did');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {createLegend}
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
                            hideUpdate
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideUpdate(false);
                                        setUpdateLegend('off');
                                    }}
                                >
                                    <p className={styles.buttonWhiteText}>
                                        {updateLegend}
                                    </p>
                                </button>
                            :    <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideUpdate(true);
                                        setUpdateLegend('dns');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {updateLegend}
                                    </p>
                                </button>
                        }
                    </h3>
                    {
                        !hideCreate &&
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
                        !hideUpdate &&
                            <>
                                <div style={{ marginTop: '7%' }}>
                                    <p>Coming soon.</p>
                                </div>
                            </>
                    }
                </div>
            }
            {
                <div style={{ marginTop: '6%' }}>
                    <h3>
                        Decentralized finance
                        {
                            hideDeactivate
                            ?   <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDeactivate(false);
                                        setDeactivateLegend('back');
                                    }}
                                >
                                    <p className={styles.buttonColorText}>
                                        {deactivateLegend}
                                    </p>
                                </button>
                            :    <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDeactivate(true);
                                        setDeactivateLegend('trade');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {deactivateLegend}
                                    </p>
                                </button>
                        }
                    </h3>
                    {
                        !hideDeactivate &&
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
