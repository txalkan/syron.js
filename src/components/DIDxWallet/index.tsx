import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $user } from 'src/store/user';
import { Dex, DIDOperations, Liquidity, NFTUsernameDNS, StakeRewards } from '..';
import styles from './styles.module.scss';

function Component() {
    const user = useStore($user);
    const [hideOperations, setHideOperations] = useState(true);
    const [operationsLegend, setOperationsLegend] = useState('operations');
    const [hideDns, setHideDns] = useState(true);
    const [dnsLegend, setDnsLegend] = useState('dns');
    const [hideLiquidity, setHideLiquidity] = useState(true);
    const [liquidityLegend, setLiquidityLegend] = useState('add / remove');
    const [hideDex, setHideDex] = useState(true);
    const [dexLegend, setDexLegend] = useState('exchange');
    const [hideStake, setHideStake] = useState(true);
    const [stakeLegend, setStakeLegend] = useState('+ rewards')
    const [hideStake2, setHideStake2] = useState(true);
    const [stakeLegend2, setStakeLegend2] = useState('swap');
    
    return (
        <div style={{ marginTop: '12%' }}>
            {
                user?.domain === 'did' &&
                    <h1 style={{ textAlign: 'center' }}>
                        <span style={{ color: 'lightblue' }}>
                            DID<span style={{ textTransform: 'lowercase' }}>x</span>Wallet
                        </span>
                        {' '}
                        <span style={{ textTransform: 'lowercase', color: 'white' }}>
                            of
                        </span>
                        {' '}
                        <span className={ styles.username }>
                            {user?.nft}
                        </span>
                    </h1>
            }
            {
                user?.domain !== 'did' &&
                    <h1 style={{ textAlign: 'center' }}>
                        <span style={{ color: 'lightblue' }}>
                            <span style={{ textTransform: 'lowercase' }}>x</span>Wallet
                        </span>
                        {' '}
                        <span style={{ textTransform: 'lowercase', color: 'white' }}>
                            of
                        </span>
                        {' '}
                        <span className={ styles.username }>
                            <span style={{ textTransform: 'lowercase', color: 'white' }}>
                                {user?.nft}
                            </span>
                            .{user?.domain}
                        </span>
                    </h1>
            }
            <div style={{ marginTop: '8%' }}>
            {
                hideDns && hideLiquidity && hideDex && hideStake && hideStake2 &&
                    <h2>
                        DID{' '}
                        {
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
                        }
                    </h2>
            }   
            {
                !hideOperations &&
                    <DIDOperations />
            }
            </div>
            <div style={{ marginTop: '8%' }}>
            {
                hideOperations && user?.domain === 'did' &&
                <h2>
                    NFT Username{' '}
                    {   
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
                                DNS
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
                    }
                </h2>
            }
                {
                    !hideDns &&
                        <NFTUsernameDNS />
                }
            </div>
            <div style={{ marginTop: '8%' }}>
            {
                hideOperations && user?.domain === 'swap' && hideDex &&
                <h2>
                    liquidity{' '}
                    {   
                        hideLiquidity
                        ?   <button
                                type="button"
                                className={styles.button}
                                onClick={() => {
                                    setHideLiquidity(false);
                                    setLiquidityLegend('back');
                                }}
                            >
                                <p className={styles.buttonWhiteText}>
                                    {liquidityLegend}
                                </p>
                            </button>
                    
                        :   <>
                                on zilswap
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideLiquidity(true);
                                        setLiquidityLegend('add / remove');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {liquidityLegend}
                                    </p>
                                </button>
                            </>
                    }
                </h2>
            }
            {
                !hideLiquidity &&
                    <Liquidity />
            }
            </div>
            <div style={{ marginTop: '8%' }}>
            {
                hideOperations && user?.domain === 'swap' && hideLiquidity &&
                <h2>
                    decentralized{' '}
                    {   
                        hideDex
                        ?   <button
                                type="button"
                                className={styles.button}
                                onClick={() => {
                                    setHideDex(false);
                                    setDexLegend('back');
                                }}
                            >
                                <p className={styles.buttonWhiteText}>
                                    {dexLegend}
                                </p>
                            </button>
                    
                        :   <>
                                exchange
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideDex(true);
                                        setDexLegend('exchange');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {dexLegend}
                                    </p>
                                </button>
                            </>
                    }
                </h2>
            }
            {
                !hideDex &&
                    <Dex />
            }
            </div>
            <div style={{ marginTop: '8%' }}>
            {
                hideOperations && user?.domain === 'stake' && hideStake2 &&
                <h2>
                    stake{' '}
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
                                <p className={styles.buttonWhiteText}>
                                    {stakeLegend}
                                </p>
                            </button>
                    
                        :   <>
                                + rewards
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideStake(true);
                                        setStakeLegend('+ rewards');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {stakeLegend}
                                    </p>
                                </button>
                            </>
                    }
                </h2>
            }
            {
                !hideStake &&
                    <StakeRewards />
            }
            </div>
            <div style={{ marginTop: '8%' }}>
            {
                hideOperations && user?.domain === 'stake' && hideStake &&
                <h2>
                    delegator{' '}
                    {   
                        hideStake2
                        ?   <button
                                type="button"
                                className={styles.button}
                                onClick={() => {
                                    setHideStake2(false);
                                    setStakeLegend2('back');
                                }}
                            >
                                <p className={styles.buttonWhiteText}>
                                    {stakeLegend2}
                                </p>
                            </button>
                    
                        :   <>
                                swap
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideStake2(true);
                                        setStakeLegend2('swap');
                                    }}
                                >
                                    <p className={styles.buttonText}>
                                        {stakeLegend2}
                                    </p>
                                </button>
                            </>
                    }
                </h2>
            }
            {
                !hideStake2 &&
                    <p>Coming soon.</p>
            }
            </div>
        </div>
    );
}

export default Component
