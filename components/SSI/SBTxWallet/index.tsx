import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { RootState } from '../../../src/app/reducers'
import toastTheme from '../../../src/hooks/toastTheme'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../src/hooks/router'
import { $isController } from '../../../src/store/controller'
import controller from '../../../src/hooks/isController'
import { $loading } from '../../../src/store/loading'
import Spinner from '../../Spinner'
import smartContract from '../../../src/utils/smartContract'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const resolvedInfo = useStore($resolvedInfo)
    const { isController } = controller()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const zcrypto = tyron.Util.default.Zcrypto()
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const net = useSelector((state: RootState) => state.modal.net)
    const loading = useStore($loading)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (value: any) => {
        if (resolvedInfo !== null) {
            //@todo-i aren't we using a global variable for loading?
            setIsLoading(true)
            const res: any = await getSmartContract(
                resolvedInfo?.addr!,
                'pending_username'
            )
            setIsLoading(false)
            const pending_username = res.result.pending_username
            if (pending_username === '') {
                toast.error('There is no pending NFT Domain Name', {
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
                setIsLoading(true)
                const addrPendingUsername =
                    await tyron.SearchBarUtil.default.fetchAddr(
                        net,
                        pending_username,
                        'did'
                    )
                const result: any = await tyron.SearchBarUtil.default.Resolve(
                    net,
                    addrPendingUsername
                )
                const pending_controller = zcrypto.toChecksumAddress(result.controller)
                setIsLoading(false)
                if (pending_controller !== zilAddr?.base16) {
                    toast.error(
                        t('Only X’s DID Controller can access this wallet.', {
                            name: pending_username,
                        }),
                        {
                            position: 'bottom-right',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 1,
                        }
                    )
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

    useEffect(() => {
        isController()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading || isLoading) {
        return <Spinner />
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '10%',
                        flexDirection: 'column',
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
                            </p>
                        </h1>
                    </div>
                    <div
                        style={{
                            marginTop: '100px',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <h2>
                                <div
                                    onClick={() => {
                                        navigate(
                                            `/${resolvedInfo?.domain}@${resolvedInfo?.name}/sbt/public`
                                        )
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <p className={styles.cardTitle3}>
                                                SBT
                                            </p>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <p className={styles.cardTitle2}>
                                                SBT
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                            <div className={styles.xText}>
                                <h5
                                    style={{
                                        color: isLight ? '#000' : '#dbe4eb',
                                    }}
                                >
                                    x
                                </h5>
                            </div>
                            <h2>
                                <div
                                    onClick={() => {
                                        isController()
                                        const is_controller =
                                            $isController.getState()
                                        if (is_controller) {
                                            navigate(
                                                `/${domain}@${username}/sbt/wallet`
                                            )
                                        } else {
                                            toast.error(
                                                t(
                                                    'Only X’s DID Controller can access this wallet.',
                                                    { name: username }
                                                ),
                                                {
                                                    position: 'bottom-right',
                                                    autoClose: 3000,
                                                    hideProgressBar: false,
                                                    closeOnClick: true,
                                                    pauseOnHover: true,
                                                    draggable: true,
                                                    progress: undefined,
                                                    theme: toastTheme(isLight),
                                                    toastId: 1,
                                                }
                                            )
                                        }
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <p className={styles.cardTitle3}>
                                                {t('WALLET')}
                                            </p>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <p className={styles.cardTitle2}>
                                                {t('WEB3 WALLET')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <div className={styles.selectionWrapper}>
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={handleSubmit}
                                        className={styles.card}
                                    >
                                        <div className={styles.cardTitle3}>
                                            CLAIM SBTxWALLET
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
