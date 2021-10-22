import React, { useState } from 'react';
import { NFTUsernameDomain } from '..';
import styles from './styles.module.scss';

function Component() {
    const [hideSwap, setHideSwap] = useState(true);
    const [swapLegend, setSwapLegend] = useState('swap');
    const [hideStake, setHideStake] = useState(true);
    const [stakeLegend, setStakeLegend] = useState('stake');
    const [hideNft, setHideNft] = useState(true);
    const [nftLegend, setNftLegend] = useState('nft');
    const [hideCoop, setHideCoop] = useState(true);
    const [coopLegend, setCoopLegend] = useState('coop');
    const [hideTransfer, setHideTransfer] = useState(true);
    const [transferLegend, setTransferLegend] = useState('transfer NFT username');

    return (
        <div>
            <ul>
                {
                    hideTransfer && <>
                        {
                            hideSwap && hideStake && hideNft && hideCoop &&
                                <h3 style={{ marginTop: '6%'}}>Available domains:</h3>
                        }
                        <li>
                            {
                                hideStake && hideNft && hideCoop && <>{
                                    hideSwap
                                    ?   <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideSwap(false);
                                                setSwapLegend('back');
                                            }}
                                        >
                                            <p className={styles.buttonColorText}>
                                                {swapLegend}
                                            </p>
                                        </button>
                                    :   <>
                                            <h3><span style={{ color: 'yellow', marginRight: '3%'}}>DID swap</span>
                                                <button
                                                    type="button"
                                                    className={styles.button}
                                                    onClick={() => {
                                                        setHideSwap(true);
                                                        setSwapLegend('swap');
                                                    }}
                                                >
                                                    <p className={styles.buttonText}>
                                                        {swapLegend}
                                                    </p>
                                                </button>
                                            </h3>
                                        </>
                                }</>
                            }
                            {
                                !hideSwap &&
                                <NFTUsernameDomain
                                    {...{
                                        domain: 'swap',
                                    }}
                                />
                            }
                        </li>
                        <li>
                            {
                                hideSwap && hideNft && hideCoop && hideTransfer && <>{
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
                                            <h3><span style={{ color: 'yellow', marginRight: '3%'}}>DID Stake</span>
                                                <button
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
                        <li>
                            {
                                hideSwap && hideStake && hideCoop && hideTransfer && <>{
                                    hideNft
                                    ?   <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideNft(false);
                                                setNftLegend('back');
                                            }}
                                        >
                                            <p className={styles.buttonColorText}>
                                                {nftLegend}
                                            </p>
                                        </button>
                                    :   <>
                                            <h3><span style={{ color: 'yellow', marginRight: '3%'}}>did nft</span>
                                                <button
                                                    type="button"
                                                    className={styles.button}
                                                    onClick={() => {
                                                        setHideNft(true);
                                                        setNftLegend('nft');
                                                    }}
                                                >
                                                    <p className={styles.buttonText}>
                                                        {nftLegend}
                                                    </p>
                                                </button>
                                            </h3>
                                        </>
                                }</>
                            }
                            {
                                !hideNft &&
                                    <>
                                        <p>
                                            Coming soon.
                                        </p>
                                    </>
                            }
                        </li>
                        <li>
                            {
                                hideSwap && hideStake && hideNft && hideTransfer && <>{
                                    hideCoop
                                    ?   <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideCoop(false);
                                                setCoopLegend('back');
                                            }}
                                        >
                                            <p className={styles.buttonColorText}>
                                                {coopLegend}
                                            </p>
                                        </button>
                                    :   <>
                                            <h3><span style={{ color: 'yellow', marginRight: '3%'}}>DID Coop</span>
                                                <button
                                                type="button"
                                                className={styles.button}
                                                onClick={() => {
                                                    setHideCoop(true);
                                                    setCoopLegend('coop');
                                                }}
                                                >
                                                    <p className={styles.buttonText}>
                                                        {coopLegend}
                                                    </p>
                                                </button>
                                            </h3>
                                        </>
                                }</>
                            }
                            {
                                !hideCoop &&
                                    <>
                                        <p>
                                            Coming soon.
                                        </p>
                                    </>
                            }
                        </li>
                    </>    
                }
            </ul>
            {
                hideSwap && hideStake && hideNft && hideCoop && <>{
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
                    <>
                        <p>
                            Coming soon.
                        </p>
                    </>
            }
        </div>
    );
}

export default Component
