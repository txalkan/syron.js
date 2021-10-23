import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $user } from 'src/store/user';
import { DIDDocument } from '..';
import styles from './styles.module.scss';

function Component() {
    const user = useStore($user);
    const [hideDoc, setHideDoc] = useState(true);
    const [docLegend, setDocLegend] = useState('identity');
    const [hideTransfer, setHideTransfer] = useState(true);
    const [transferLegend, setTransferLegend] = useState('top up');
    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('recovery');
    const [transferAmount, setTransferAmount] = useState('');

    const handleTransferAmount = (event: React.ChangeEvent<HTMLInputElement>) =>
        setTransferAmount(event.target.value);
    
    return (
        <div style={{ marginTop: '12%' }}>
            <h1 style={{ textAlign: 'center' }}>
                Public identity{' '}
                <span style={{ textTransform: 'lowercase', color: 'whitesmoke' }}>
                    of
                </span>{' '}
                <span className={ styles.username }>
                    <span style={{ color: 'whitesmoke' }}>{user?.nft}</span>.{user?.domain}
                </span>
            </h1>
            {   
                hideTransfer && hideRecovery &&
                    <div style={{ marginLeft: '4%', marginTop: '8%' }}>
                        <h2>
                            {
                                hideDoc
                                ?   <>
                                        Decentralized
                                        <button
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
                                    </>
                            
                                :   <>
                                        <span style={{ color: 'whitesmoke' }}>Decentralized identity</span>
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
                                    transfers <span style={{ color: 'lightblue' }}>/</span> donations
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
                                    <span>Top up</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideTransfer(true);
                                            setTransferLegend('top up');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {transferLegend}
                                        </p>
                                    </button>
                                </>
                        } 
                    </h2>
                    <>
                    {!hideTransfer && (
                        <div style={{ marginTop: '7%' }}>
                            <p><code>To send {user?.nft} a direct transfer or donation.</code></p>
                            <code>You can add funds to this DIDxWallet using another xWallet or ZilPay.</code>
                            <form style={{ marginTop: '4%' }}>
                                <div className="fields">
                                    <div className="field half">
                                        <input
                                            type="text"
                                            placeholder="$TYRON"
                                            onChange={ handleTransferAmount }
                                        />
                                    </div>
                                    <div className="field half">
                                        <input
                                            type="button"
                                            className="button primary"
                                            value={`top up ${user?.nft}.${user?.domain}`}
                                            onClick={async () => { alert(`$TYRON ${transferAmount} coming soon.`)
                                                /*
                        try {
                            if (keyfile === "" && arconnect === "") {
                            throw new Error(
                                `You have to connect with ArConnect or your keyfile.`
                            );
                            }
                            if (
                            window.confirm(
                                `You are about to donate ${TransferAmount} $AR to '${username}.${domain}'. Click OK to proceed.`
                            )
                            ) {
                            let tx;
                            if (arconnect !== "") {
                                tx = await arweave.createTransaction({
                                target: account.ssi,
                                quantity: arweave.ar.arToWinston(TransferAmount),
                                });
                                await arweave.transactions.sign(tx);
                            } else {
                                tx = await arweave.createTransaction(
                                {
                                    target: account.ssi,
                                    quantity: arweave.ar.arToWinston(TransferAmount),
                                },
                                keyfile
                                );
                                await arweave.transactions.sign(tx, keyfile);
                            }
                            const result = await arweave.transactions.post(tx);
                            alert(`Transaction: ${tx}. Status: ${result.status}`);
                            }
                        } catch (error) {
                            alert(error);
                        }
                        */
                                            }}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </>
                </div>
            }
            {
                hideDoc && hideTransfer && user?.domain === 'did' &&
                <div style={{ marginLeft: '4%', marginTop: '8%' }}>
                    <h2>
                        {
                            hideRecovery
                            ?   <>
                                    Social
                                    <button
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
                                </>
                            :   <>
                                    <span style={{ color: 'whitesmoke' }}>Social recovery</span>
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
                            <div style={{ marginTop: '7%' }}>
                                <p>Coming soon.</p>
                            </div>
                    }
                </div>
            }    
        </div>
    );
}

export default Component;
