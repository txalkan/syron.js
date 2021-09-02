import React, { useState } from 'react';
import styles from './styles.module.scss';

export interface IPublicPortal {
    username: string;
    domain: string;
    did: any;
}

function PublicPortal({ username, domain, did }: IPublicPortal) {
    const [TransferAmount, setTransferAmount] = useState('');
    const handleTransferAmount = (event: React.ChangeEvent<HTMLInputElement>) =>
        setTransferAmount(event.target.value);

    const [message, setMessage] = useState('');
    const handleMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
        setMessage(event.target.value);

    const [didDoc, setDidDoc] = useState(false);
    const [docButtonLegend, setDocButtonLegend] = useState('access');

    const [transferComp, setTransferComp] = useState(false);
    const [transferButtonLegend, setTransferButtonLegend] = useState('access');

    const [msgComp, setMsgComp] = useState(false);
    const [msgButtonLegend, setMsgButtonLegend] = useState('access');

    //to-do user must sign in to send

    return (
        <div style={{ marginTop: '10%' }}>
            <h2 style={{ textAlign: 'center', color: 'purple' }}>
                SSI public portal <i style={{ textTransform: 'lowercase', color: 'white' }}>of</i> <strong style={{ color: 'yellow' }}>{username}.{domain}</strong>
            </h2>
            <div style={{ marginTop: '9%' }}>
                <h3 style={{ marginBottom: '3%' }}>DID <strong style={{ color: "purple" }}>identity</strong>
                    <>
                    {
                        !didDoc &&
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => {
                                setDidDoc(true);
                                setDocButtonLegend('Hide')
                            }}
                        >
                            <p className={styles.buttonText}>{docButtonLegend}</p>
                        </button>
                    }
                    {
                        didDoc &&
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => {
                                setDidDoc(false);
                                setDocButtonLegend('access')
                            }}
                        >
                            <p className={styles.buttonText}>{docButtonLegend}</p>
                        </button>
                    }
                    </>
                </h3>
                <>
                {
                    didDoc &&
                    did.map((res: any) => {
                        return (
                            <div key={res} className={styles.docInfo}>
                                <h4 className={styles.blockHead}>
                                    {res[0]}
                                </h4>
                                {res[1].map((element: any) => {
                                    return (
                                        <p
                                            key={element}
                                            className={styles.did}
                                        >
                                            {element}
                                        </p>
                                    );
                                })}
                            </div>
                        );
                    })
                }
                </>
            </div>
            <div style={{ marginTop: '9%' }}>
                <h3 style={{ width: '150%' }}>Peer-to-peer <strong style={{ color: "purple" }}>transfers</strong>
                    <>
                    {
                        !transferComp &&
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => {
                                setTransferComp(true);
                                setTransferButtonLegend('Hide')
                            }}
                        >
                            <p className={styles.buttonText}>{transferButtonLegend}</p>
                        </button>
                    }
                    {
                        transferComp &&
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => {
                                setTransferComp(false);
                                setTransferButtonLegend('access')
                            }}
                        >
                            <p className={styles.buttonText}>{transferButtonLegend}</p>
                        </button>
                    }
                    </>
                </h3>
                <>
                {
                    transferComp &&
                    <div style={{ marginTop: '7%' }}>
                        <code>Send <strong style={{ color: "yellow" }}>{username}.{domain}</strong> an $XSGD transfer:</code>
                        <form style={{ marginTop: '4%' }}>
                            <div className="fields">
                            <div className="field half">
                                <input
                                    type="text"
                                    placeholder="Amount of $XSGD"
                                    onChange={handleTransferAmount}
                                />
                            </div>
                            <div className="field half">
                                <input
                                    type="button"
                                    className="button primary"
                                    value={`Transfer to ${username}.${domain}`}
                                    onClick={async () => {
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
                }
                </>
            </div>
            <div style={{ marginTop: '9%' }}>
                <h3 style={{ width: '150%'}}>Encrypted <strong style={{ color: "purple" }}>messages</strong>
                    <>
                    {
                        !msgComp &&
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => {
                                setMsgComp(true);
                                setMsgButtonLegend('Hide')
                            }}
                        >
                            <p className={styles.buttonText}>{msgButtonLegend}</p>
                        </button>
                    }
                    {
                        msgComp &&
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => {
                                setMsgComp(false);
                                setMsgButtonLegend('access')
                            }}
                        >
                            <p className={styles.buttonText}>{msgButtonLegend}</p>
                        </button>
                    }
                    </>
                </h3>
                <>
                {
                    msgComp &&
                    <div style={{ marginTop: '7%' }}>
                        <code>Send <strong style={{ color: "yellow" }}>{username}.{domain}</strong> a message through SSI Comm:</code>
                        <form method="post" action="#" style={{ marginTop: '4%' }}>
                            <div className="fields">
                                <div className="field">
                                    <textarea
                                        onChange={handleMessage}
                                        rows={4}
                                        className={styles.message}
                                        placeholder='Write a message here.'
                                    ></textarea>
                                </div>
                            </div>
                            <ul className="actions">
                            <li>
                                <input
                                    type="button"
                                    className="button primary"
                                    value="Encrypt & send"
                                    onClick={async () => {
                                        try {
                                            /*
                        if (keyfile === "" && arconnect === "") {
                            throw new Error(
                            `You have to connect with ArConnect or your keyfile.`
                            );
                        }

                        const userPermawallet = await SmartWeave.readContract(
                            arweave,
                            account.wallet
                        );
                        const userSsiComm = userPermawallet.ssiComm;
                        const encryptedMessage = await DKMS.encryptData(
                            message,
                            userSsiComm
                        );

                        if (
                            window.confirm(
                            `You are about to send a message to ${username}.${domain}'. Click OK to proceed.`
                            )
                        ) {
                            let tx;
                            if (arconnect !== "") {
                            tx = await arweave.createTransaction({
                                target: account.ssi,
                                data: Arweave.utils.concatBuffers([
                                encryptedMessage,
                                ]),
                                quantity: arweave.ar.arToWinston("0"),
                            });
                            await arweave.transactions.sign(tx);
                            } else {
                            tx = await arweave.createTransaction(
                                {
                                target: account.ssi,
                                data: Arweave.utils.concatBuffers([
                                    encryptedMessage,
                                ]),
                                quantity: arweave.ar.arToWinston("0"),
                                },
                                keyfile
                            );
                            await arweave.transactions.sign(tx, keyfile);
                            }
                            const result = await arweave.transactions.post(tx);
                            alert(
                            `Transaction: ${JSON.stringify(tx)}. Status: ${
                                result.status
                            }`
                            );
                        }
                        */
                                        } catch (error) {
                                            alert(error);
                                        }
                                    }}
                                />
                            </li>
                            <li>
                                <input type="reset" value="Reset" />
                            </li>
                        </ul>
                    </form>
                    </div>
                }
                </>
            </div>
            <div style={{ marginTop: '9%' }}>
                <code>If you are the owner of <strong style={{ color: 'yellow' }}>{username}.{domain}</strong>, sign in to access your SSI private portal.</code>
            </div>    
        </div>
    );
}

export default PublicPortal;
