import React, { useState } from 'react';
import { TransferNFTUsername } from '..';
import styles from './styles.module.scss';

function Component() {
    const [hideDex, setHideDex] = useState(true);
    const [dexLegend, setDexLegend] = useState('.dex');
    const [hideStake, setHideStake] = useState(true);
    const [stakeLegend, setStakeLegend] = useState('.stake');
    const [hideTransfer, setHideTransfer] = useState(true);
    const [transferLegend, setTransferLegend] = useState('transfer NFT username');

    return (
        <div style={{ marginTop: '14%' }}>
            {
                hideDex && hideStake && hideTransfer &&
                <h3 style={{ marginBottom: '7%' }}>
                    Available <span style={{ textTransform: 'lowercase' }}>x</span>Wallet domains:
                </h3>
            }
            <ul>
                {
                    hideTransfer &&
                    <>
                        <li>
                            {
                                hideStake && <>{
                                    hideDex
                                        ? <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideDex(false);
                                                setDexLegend('back');
                                            }}
                                        >
                                            <p className={styles.buttonColorText}>
                                                {dexLegend}
                                            </p>
                                        </button>
                                        : <>
                                            <h3>
                                                <span style={{ color: 'yellow' }}>.dex</span>{' '}<span style={{ textTransform: 'lowercase' }}>x</span>Wallet domain
                                            </h3>
                                        </>
                                }</>
                            }
                            {
                                !hideDex &&
                                <p>
                                    Coming soon!
                                </p>
                            }
                        </li>
                        <li>
                            {
                                hideDex && hideTransfer && <>{
                                    hideStake
                                        ? <button
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
                                        : <>
                                            <h3>
                                                <span style={{ color: 'yellow' }}>.stake</span>{' '}<span style={{ textTransform: 'lowercase' }}>x</span>Wallet domain
                                            </h3>
                                        </>
                                }</>
                            }
                            {
                                !hideStake &&
                                <p>
                                    Coming soon!
                                </p>
                            }
                        </li>
                    </>
                }
            </ul>
            {
                hideDex && hideStake &&
                hideTransfer &&
                <div>
                    <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                            setHideTransfer(false);
                            setTransferLegend('back');
                        }}
                    >
                        <p className={styles.buttonColorDText}>
                            {transferLegend}
                        </p>
                    </button>
                    <p>
                        danger zone
                    </p>
                </div>
            }
            {
                !hideTransfer &&
                <TransferNFTUsername />
            }
        </div>
    );
}

export default Component
