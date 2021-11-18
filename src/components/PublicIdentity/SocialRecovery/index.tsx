import React, { useState } from 'react';
import { useStore } from 'effector-react';
import * as tyron from 'tyron';
import { $donation, updateDonation } from 'src/store/donation';
import { Lock, SocialRecover, Sign, TyronDonate } from '../..';
import { ZilPayBase } from '../../ZilPay/zilpay-base';
import styles from './styles.module.scss';
import { $net } from 'src/store/wallet-network';
import { $contract } from 'src/store/contract';
import { $doc } from 'src/store/did-doc';
import { $user } from 'src/store/user';

function Component() {
    const doc = useStore($doc);
    const user = useStore($user);
    const net = useStore($net);
    const contract = useStore($contract);
    const donation = useStore($donation);

    const [error, setError] = useState('');

    const [hideDonation, setHideDonation] = useState(true);
    const [hideSubmit, setHideSubmit] = useState(true);
    const [txID, setTxID] = useState('');

    const [hideRecovery, setHideRecovery] = useState(true);
    const [recoveryLegend, setRecoveryLegend] = useState('recover');

    const [hideLock, setHideLock] = useState(true);
    const [lockLegend, setLockLegend] = useState('lock');

    const [hideSig, setHideSig] = useState(true);
    const [sigLegend, setSigLegend] = useState('sign address');

    const is_operational =
        contract?.status !== tyron.Sidetree.DIDStatus.Deactivated &&
        contract?.status !== tyron.Sidetree.DIDStatus.Locked;

    const handleSave = async () => {
        setHideDonation(false);
        setHideSubmit(false);
    };
    const handleSubmit = async () => {
        handleSave();
        if (contract !== null && donation !== null) {
            const zilpay = new ZilPayBase();
            const txID = 'ConfigureSocialRecovery';

            let tyron_;
            const donation_ = String(donation * 1e12);
            switch (donation) {
                case 0:
                    tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.none, 'Uint128');
                    break;
                default:
                    tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'Uint128', donation_);
                    break;
            }

            const tx_params: tyron.TyronZil.TransitionValue[] = [tyron_];
            const _amount = String(donation);

            alert(`You're about to submit a transaction to configure social recovery. You're also donating ${donation} ZIL to donate.did, which gives you ${donation} xPoints!`);
            await zilpay.call({
                contractAddress: contract.addr,
                transition: txID,
                params: tx_params as unknown as Record<string, unknown>[],
                amount: _amount   //@todo-ux would u like to top up your wallet as well?
            })
                .then(res => {
                    setTxID(res.ID);
                    updateDonation(null);
                })
                .catch(err => setError(err))
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '14%' }}>
            {
                hideLock && hideSig &&
                <h2 style={{ color: 'lightblue' }}>
                    DID social recovery
                </h2>
            }
            {
                txID === '' && doc?.guardians.length === 0 &&
                <>
                    {
                        hideSig &&
                        <code>
                            <ul>
                                <li>
                                    Social recovery has not been enabled by {user?.nft} yet
                                </li>
                            </ul>
                        </code>
                    }
                    <div>
                        {
                            hideRecovery && hideLock &&
                            hideSig &&
                            <button
                                type="button"
                                className={styles.button}
                                onClick={() => {
                                    setHideSig(false);
                                    setSigLegend('back');
                                }}
                            >
                                <p className={styles.buttonText}>
                                    {sigLegend}
                                </p>
                            </button>
                        }
                        {
                            !hideSig &&
                            <Sign />
                        }
                    </div>
                </>
            }
            {
                txID === '' && doc?.guardians.length !== 0 &&
                <>
                    {
                        hideSig && hideLock &&
                        <code>
                            <ul>
                                <li>
                                    {user?.nft} has {doc?.guardians.length} guardians
                                </li>
                            </ul>
                        </code>
                    }
                    <ul style={{ marginTop: '3%' }}>
                        <li>
                            {
                                contract?.status === tyron.Sidetree.DIDStatus.Locked &&
                                hideLock && hideSig && <>{
                                    hideRecovery
                                        ? <button
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
                                        : <>
                                            <h3><span style={{ color: 'lightblue', marginRight: '3%' }}>recover account</span>
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
                                            </h3>
                                        </>
                                }</>
                            }
                            {
                                !hideRecovery &&
                                <div style={{ marginTop: '5%' }}>
                                    <SocialRecover />
                                </div>
                            }
                        </li>
                        <li>
                            {
                                is_operational &&
                                hideRecovery && hideSig &&
                                hideLock &&
                                <p><span style={{ marginRight: '3%' }}>Danger zone</span>
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={() => {
                                            setHideLock(false);
                                            setLockLegend('back');
                                        }}
                                    >
                                        <p className={styles.buttonColorDText}>
                                            {lockLegend}
                                        </p>
                                    </button>
                                </p>
                            }
                            {
                                !hideLock &&
                                <Lock />
                            }
                        </li>
                    </ul>
                    {
                        !hideDonation &&
                        <TyronDonate />
                    }
                    {
                        !hideSubmit && donation !== null &&
                        <button className={styles.button} onClick={handleSubmit}>
                            Configure{' '}
                            <span className={styles.x}>
                                did social recovery
                            </span>
                        </button>
                    }
                </>
            }
            {
                txID !== '' &&
                <div style={{ marginLeft: '-5%' }}>
                    <code>
                        Transaction ID:{' '}
                        <a
                            href={`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`}
                            rel="noreferrer" target="_blank"
                        >
                            {txID}
                        </a>
                    </code>
                </div>
            }
            {
                error !== '' &&
                <div>
                    <code>
                        Error: {error}
                    </code>
                </div>
            }
        </div>
    );
}

export default Component;
