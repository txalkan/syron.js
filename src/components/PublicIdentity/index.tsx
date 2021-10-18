import { useStore } from 'effector-react';
import React, { useState } from 'react';
import { $user } from 'src/store/user';
import { DIDDocument } from '..';
import styles from './styles.module.scss';

function Component({ doc }: {
    doc: boolean;
}) {
    const user = useStore($user);

    const [hideDoc, setHideDoc] = useState(true);
    const [docLegend, setDocLegend] = useState('identity');

    const [hideTransfer, setHideTransfer] = useState(true);
    const [transferLegend, setTransferLegend] = useState('add funds');

    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('recovery');

    const [transferAmount, setTransferAmount] = useState('');
    const handleTransferAmount = (event: React.ChangeEvent<HTMLInputElement>) =>
        setTransferAmount(event.target.value);
    
    return (
        <div style={{ marginTop: '8%' }}>
            <h2 style={{ textAlign: 'center', color: 'lightblue' }}>
                SSI public identity{' '}
                <span style={{ textTransform: 'lowercase', color: 'white' }}>
                    of
                </span>{' '}
                <span className={ styles.username }>
                    {user?.nft}.{user?.domain}
                </span>
            </h2>
            {   
                //doc && 
                    hideTransfer && hideRecovery &&
                    <div style={{ marginTop: '6%' }}>
                        <h3>
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
                                            <p className={styles.buttonColorText}>
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
                        </h3>
                        {
                            !hideDoc &&
                                <>
                                    <DIDDocument />
                                    <div style={{ marginTop: '7%' }}>
                                        <p>More coming soon.</p>
                                    </div>
                                </>
                        }
                    </div>
            }
            {
                hideDoc && hideRecovery &&
                <div style={{ marginTop: '6%' }}>
                    <h3 style={{ width: '150%' }}>
                        {   
                            hideTransfer
                            ?   <>
                                    transfers / donations /
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
                                    <span style={{ color: 'whitesmoke' }}>Peer-to-peer transfers / donations / add funds</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideTransfer(true);
                                            setTransferLegend('add funds');
                                        }}
                                    >
                                        <p className={styles.buttonText}>
                                            {transferLegend}
                                        </p>
                                    </button>
                                </>
                        } 
                    </h3>
                    <>
                    {!hideTransfer && (
                        <div style={{ marginTop: '7%' }}>
                            <form style={{ marginTop: '4%' }}>
                                <div className="fields">
                                    <div className="field half">
                                        <input
                                            type="text"
                                            placeholder="$TYRON"
                                            onChange={handleTransferAmount}
                                        />
                                    </div>
                                    <div className="field half">
                                        <input
                                            type="button"
                                            className="button primary"
                                            value={`top up ${user?.nft}.${user?.domain}`}
                                            onClick={async () => { alert('Coming soon.')
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
                hideDoc && hideTransfer &&
                <div style={{ marginTop: '6%' }}>
                    <h3>
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
                    </h3>
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
