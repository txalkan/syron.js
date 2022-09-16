import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { RootState } from '../../../../src/app/reducers'
import Selector from '../../../Selector'
import { $arconnect } from '../../../../src/store/arconnect'
import toastTheme from '../../../../src/hooks/toastTheme'
import Ivms101 from './Ivms101'
import VC from './VC'
import { useTranslation } from 'next-i18next'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
import TransferOwnership from './TransferOwnership'
import Pause from '../../Pause'
import UpdatePublicEncryption from './UpdatePublicEncryption'
import smartContract from '../../../../src/utils/smartContract'
import Spinner from '../../../Spinner'
import CloseIcoReg from '../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../src/assets/icons/ic_cross_black.svg'
import { updateDonation } from '../../../../src/store/donation'
import useArConnect from '../../../../src/hooks/useArConnect'
import wallet from '../../../../src/hooks/wallet'

function Component({ type }) {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { getSmartContract } = smartContract()
    const { verifyArConnect } = useArConnect()
    const { checkPause } = wallet()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const net = useSelector((state: RootState) => state.modal.net)
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const [txName, setTxName] = useState('')
    const [paused, setPaused] = useState(false)
    const [loading, setLoading] = useState(type === 'wallet' ? true : false)

    const toggleActive = (id: string) => {
        verifyArConnect(() => {})
        updateDonation(null)
        if (id === txName) {
            setTxName('')
        } else {
            if (paused) {
                if (id === 'Unpause') {
                    setTxName(id)
                } else {
                    toast.warn('To continue, unpause your SBT xWallet.', {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 1,
                    })
                }
            } else {
                setTxName(id)
            }
        }
    }

    const handleSubmit = async (value: any) => {
        setLoading(true)
        const res: any = await getSmartContract(
            resolvedInfo?.addr!,
            'pending_username'
        )
        setLoading(false)
        if (resolvedInfo !== null) {
            if (res.result.pending_username === '') {
                toast.error('There is no pending username', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 12,
                })
            } else {
                try {
                    const zilpay = new ZilPayBase()
                    const txID = value

                    dispatch(setTxStatusLoading('true'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    let tx = await tyron.Init.default.transaction(net)

                    await zilpay
                        .call({
                            contractAddress: resolvedInfo?.addr!,
                            transition: txID,
                            params: [],
                            amount: String(0),
                        })
                        .then(async (res) => {
                            dispatch(setTxId(res.ID))
                            dispatch(setTxStatusLoading('submitted'))
                            try {
                                tx = await tx.confirm(res.ID)
                                if (tx.isConfirmed()) {
                                    dispatch(setTxStatusLoading('confirmed'))
                                    window.open(
                                        `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                    )
                                } else if (tx.isRejected()) {
                                    dispatch(setTxStatusLoading('failed'))
                                }
                            } catch (err) {
                                dispatch(setTxStatusLoading('rejected'))
                                updateModalTxMinimized(false)
                                updateModalTx(true)
                                toast.error(t(String(err)), {
                                    position: 'top-right',
                                    autoClose: 2000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                })
                            }
                        })
                } catch (error) {
                    updateModalTx(false)
                    dispatch(setTxStatusLoading('idle'))
                    toast.error(t(String(error)), {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 12,
                    })
                }
            }
        } else {
            toast.error('some data is missing.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 12,
            })
        }
    }

    const fetchPause = async () => {
        setLoading(true)
        const res = await checkPause()
        setPaused(res)
        setLoading(false)
    }

    useEffect(() => {
        if (resolvedInfo !== null && type === 'wallet') {
            fetchPause()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.wrapper}>
            {txName !== '' && (
                <div
                    className={styles.closeWrapper}
                    onClick={() => toggleActive('')}
                />
            )}
            {loading ? (
                <Spinner />
            ) : (
                <div className={styles.content}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '10%',
                        }}
                    >
                        <div
                            style={{
                                textAlign: 'left',
                                marginTop: '10%',
                            }}
                        >
                            <div className={styles.cardHeadline}>
                                <h3
                                    style={{
                                        color: '#dbe4eb',
                                        textTransform: 'none',
                                    }}
                                >
                                    Soulbound xWallet{' '}
                                </h3>{' '}
                            </div>
                            <h1>
                                <p className={styles.username}>
                                    {domain}@{username}.did
                                </p>{' '}
                            </h1>
                        </div>
                    </div>
                    <div className={styles.cardWrapper}>
                        {type === 'public' ? (
                            <>
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={() => toggleActive('Ivms101')}
                                        className={
                                            txName === 'Ivms101'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>UPLOAD TRAVEL RULE</div>
                                    </div>
                                    {txName === 'Ivms101' && (
                                        <div className={styles.cardRight}>
                                            <div
                                                className={
                                                    styles.closeIcoWrapper
                                                }
                                            >
                                                <div
                                                    onClick={() =>
                                                        toggleActive('')
                                                    }
                                                    className={styles.closeIco}
                                                >
                                                    <Image
                                                        width={10}
                                                        src={CloseIco}
                                                        alt="close-ico"
                                                    />
                                                </div>
                                            </div>
                                            <Ivms101 txName={txName} />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={() =>
                                            toggleActive(
                                                'Verifiable_Credential'
                                            )
                                        }
                                        className={
                                            txName === 'Verifiable_Credential'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>MINT ISSUER&apos;S SBT</div>
                                    </div>
                                    {txName === 'Verifiable_Credential' && (
                                        <div className={styles.cardRight}>
                                            <div
                                                className={
                                                    styles.closeIcoWrapper
                                                }
                                            >
                                                <div
                                                    onClick={() =>
                                                        toggleActive('')
                                                    }
                                                    className={styles.closeIco}
                                                >
                                                    <Image
                                                        width={10}
                                                        src={CloseIco}
                                                        alt="close-ico"
                                                    />
                                                </div>
                                            </div>
                                            <VC txName={txName} />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {paused ? (
                                    <div className={styles.cardActiveWrapper}>
                                        <div
                                            onClick={() =>
                                                toggleActive('Unpause')
                                            }
                                            className={styles.cardActive}
                                        >
                                            <div>UNPAUSE</div>
                                        </div>
                                        {txName === 'Unpause' && (
                                            <div className={styles.cardRight}>
                                                <div
                                                    className={
                                                        styles.closeIcoWrapper
                                                    }
                                                >
                                                    <div
                                                        onClick={() =>
                                                            toggleActive('')
                                                        }
                                                        className={
                                                            styles.closeIco
                                                        }
                                                    >
                                                        <Image
                                                            width={10}
                                                            src={CloseIco}
                                                            alt="close-ico"
                                                        />
                                                    </div>
                                                </div>
                                                <Pause
                                                    pause={false}
                                                    xwallet="sbt"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.cardActiveWrapper}>
                                        <div
                                            onClick={() =>
                                                toggleActive('Pause')
                                            }
                                            className={
                                                txName === 'Pause'
                                                    ? styles.cardActive
                                                    : styles.card
                                            }
                                        >
                                            <div>PAUSE</div>
                                        </div>
                                        {txName === 'Pause' && (
                                            <div className={styles.cardRight}>
                                                <div
                                                    className={
                                                        styles.closeIcoWrapper
                                                    }
                                                >
                                                    <div
                                                        onClick={() =>
                                                            toggleActive('')
                                                        }
                                                        className={
                                                            styles.closeIco
                                                        }
                                                    >
                                                        <Image
                                                            width={10}
                                                            src={CloseIco}
                                                            alt="close-ico"
                                                        />
                                                    </div>
                                                </div>
                                                <Pause
                                                    pause={true}
                                                    xwallet="sbt"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={() =>
                                            toggleActive(
                                                'UpdatePublicEncryption'
                                            )
                                        }
                                        className={
                                            txName === 'UpdatePublicEncryption'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>UPDATE PUBLIC ENCRYPTION</div>
                                    </div>
                                    {txName === 'UpdatePublicEncryption' && (
                                        <div className={styles.cardRight}>
                                            <div
                                                className={
                                                    styles.closeIcoWrapper
                                                }
                                            >
                                                <div
                                                    onClick={() =>
                                                        toggleActive('')
                                                    }
                                                    className={styles.closeIco}
                                                >
                                                    <Image
                                                        width={10}
                                                        src={CloseIco}
                                                        alt="close-ico"
                                                    />
                                                </div>
                                            </div>
                                            <UpdatePublicEncryption />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={handleSubmit}
                                        className={styles.card}
                                    >
                                        <div>CLAIM SBTxWALLET</div>
                                    </div>
                                </div>
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={() =>
                                            toggleActive('TransferOwnership')
                                        }
                                        className={
                                            txName === 'TransferOwnership'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>TRANSFER OWNERSHIP</div>
                                    </div>
                                    {txName === 'TransferOwnership' && (
                                        <div className={styles.cardRight}>
                                            <div
                                                className={
                                                    styles.closeIcoWrapper
                                                }
                                            >
                                                <div
                                                    onClick={() =>
                                                        toggleActive('')
                                                    }
                                                    className={styles.closeIco}
                                                >
                                                    <Image
                                                        width={10}
                                                        src={CloseIco}
                                                        alt="close-ico"
                                                    />
                                                </div>
                                            </div>
                                            <TransferOwnership />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Component
