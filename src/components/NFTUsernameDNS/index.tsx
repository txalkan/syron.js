import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $user } from 'src/store/user';
import { NFTUsernameDomain, TransferNFTUsername } from '..';
import styles from './styles.module.scss';

function Component() {
    const user = useStore($user);
    const [hideDex, setHideDex] = useState(true);
    const [dexLegend, setDexLegend] = useState('.dex');
    const [hideStake, setHideStake] = useState(true);
    const [stakeLegend, setStakeLegend] = useState('.stake');
    const [hideTransfer, setHideTransfer] = useState(true);
    const [transferLegend, setTransferLegend] = useState('transfer NFT username');

    return (
        <div>
            <ul>
                {
                    hideTransfer && <>
                        {
                            hideDex && hideStake &&
                                <h3 style={{ marginTop: '6%'}}>
                                    Available <span style={{ textTransform: 'lowercase'}}>x</span>Wallet domains:
                                </h3>
                        }
                        <li>
                            {
                                hideStake && <>{
                                    hideDex
                                    ?   <button
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
                                    :   <>
                                            <h3>
                                                <span style={{ marginRight: '3%' }}>
                                                    <span style={{ color: 'yellow' }}>.dex</span>{' '}<span style={{ textTransform: 'lowercase'}}>x</span>Wallet domain
                                                </span>
                                                <button
                                                    type="button"
                                                    className={styles.button}
                                                    onClick={() => {
                                                        setHideDex(true);
                                                        setDexLegend('.dex');
                                                    }}
                                                >
                                                    <p className={styles.buttonText}>
                                                        {dexLegend}
                                                    </p>
                                                </button>
                                            </h3>
                                        </>
                                }</>
                            }
                            {
                                !hideDex &&
                                <NFTUsernameDomain
                                    {...{
                                        domain: 'dex',
                                    }}
                                />
                            }
                        </li>
                        {
                            user?.nft === 'tralcan' &&
                                <li>
                                {
                                    hideDex && hideTransfer && <>{
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
                                        :   <>
                                                <h3>
                                                    <span style={{ marginRight: '3%' }}>
                                                        <span style={{ color: 'yellow' }}>.stake</span>{' '}<span style={{ textTransform: 'lowercase'}}>x</span>Wallet domain
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={styles.button}
                                                        onClick={() => {
                                                            setHideStake(true);
                                                            setStakeLegend('.stake');
                                                        }}
                                                    >
                                                        <p className={styles.buttonText}>
                                                            {stakeLegend}
                                                        </p>
                                                    </button>
                                                </h3>
                                            </>
                                    }</>
                                }
                                {
                                    !hideStake &&
                                        <NFTUsernameDomain
                                            {...{
                                                domain: 'stake',
                                            }}
                                        />
                                }
                                </li>
                        }
                    </>    
                }
            </ul>
            {
                hideDex && hideStake && <>{
                    hideTransfer
                    ?   <p><span style={{ marginLeft: '2%', marginRight: '3%'}}>Danger zone</span>
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
                        </p>
                    :   <>
                            <h3><span style={{ color: 'red', marginRight: '3%'}}>Transfer NFT Username</span>
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideTransfer(true);
                                        setTransferLegend('transfer NFT username');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {transferLegend}
                                    </p>
                                </button>
                            </h3>
                        </>
                }</>
            }
            {
                !hideTransfer &&
                    <TransferNFTUsername />
            }
        </div>
    );
}

export default Component
