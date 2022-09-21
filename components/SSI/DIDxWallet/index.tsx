import { useStore } from 'effector-react'
import React, { ReactNode, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as tyron from 'tyron'
import { $doc } from '../../../src/store/did-doc'
import { toast } from 'react-toastify'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $isController } from '../../../src/store/controller'
import { RootState } from '../../../src/app/reducers'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { useTranslation } from 'next-i18next'
import { Spinner } from '../..'
import routerHook from '../../../src/hooks/router'
import {
    $loading,
    $loadingDoc,
    updateLoading,
} from '../../../src/store/loading'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import controller from '../../../src/hooks/isController'
import toastTheme from '../../../src/hooks/toastTheme'
import smartContract from '../../../src/utils/smartContract'

interface LayoutProps {
    children: ReactNode
}

function Component(props: LayoutProps) {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { getSmartContract } = smartContract()

    const { children } = props
    const dispatch = useDispatch()

    const net = useSelector((state: RootState) => state.modal.net)
    const doc = useStore($doc)
    const loadingDoc = useStore($loadingDoc)
    const loading = useStore($loading)
    const docVersion = doc?.version.slice(0, 7)
    const { isController } = controller()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    // @todo-i can we remove thiS?
    // useEffect(() => {
    //     isController()
    // })

    const handleSubmit = async (value: any) => {
        //@todo-i-fixed verify that the pending_username (PU) !== "" &
        // if PU !== "", verify that the DID Controller of the PU (fetchAddr(PM, did)) is = loginInfo.zilAddr
        if (resolvedInfo !== null) {
            updateLoading(true)
            const res: any = await getSmartContract(
                resolvedInfo?.addr!,
                'pending_username'
            )
            updateLoading(false)
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
                // @todo-i it must be the controller of the pending username, not the current controller
            } else if (!is_controller) {
                toast.error(
                    t('Only X’s DID Controller can access this wallet.', {
                        name: username,
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

    if (loadingDoc || loading) {
        return <Spinner />
    }

    return (
        <div className={styles.wrapper}>
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
                    <h1>
                        <p className={styles.username}>{username}</p>{' '}
                    </h1>
                </div>
            </div>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                }}
            >
                {children}
            </div>
            <div>
                <div className={styles.cardHeadline}>
                    <h3 style={{ color: isLight ? '#000' : '#dbe4eb' }}>
                        {docVersion === 'DIDxWAL' ||
                        docVersion === 'xwallet' ||
                        docVersion === 'initi--'
                            ? t('DECENTRALIZED IDENTITY')
                            : t('NFT USERNAME')}
                    </h3>{' '}
                </div>
                <div
                    style={{
                        marginTop: '3%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <h2>
                            <div
                                onClick={() => {
                                    navigate(`/${username}/didx/doc`)
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront}>
                                        <p className={styles.cardTitle3}>
                                            {t('DID')}
                                        </p>
                                    </div>
                                    <div className={styles.flipCardBack}>
                                        <p className={styles.cardTitle2}>
                                            {t('DECENTRALIZED IDENTIFIER')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </h2>
                        <h2>
                            <div
                                onClick={() => {
                                    navigate(`/${username}/didx/recovery`)
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront2}>
                                        <p className={styles.cardTitle3}>
                                            {t('SOCIAL RECOVERY')}
                                        </p>
                                    </div>
                                    <div className={styles.flipCardBack2}>
                                        <p className={styles.cardTitle2}>
                                            {t('UPDATE DID CONTROLLER')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </h2>
                    </div>
                    <div className={styles.xText}>
                        <h5 style={{ color: isLight ? '#000' : '#dbe4eb' }}>
                            x
                        </h5>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <h2>
                            <div
                                onClick={() => {
                                    isController()
                                    const is_controller =
                                        $isController.getState()
                                    if (is_controller) {
                                        navigate(`/${username}/didx/wallet`)
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
                        <h2>
                            <div
                                onClick={() => {
                                    if (
                                        Number(doc?.version.slice(8, 9)) >= 4 ||
                                        doc?.version.slice(0, 4) === 'init' ||
                                        doc?.version.slice(0, 3) === 'dao'
                                    ) {
                                        navigate(`/${username}/didx/funds`)
                                    } else {
                                        toast.info(
                                            `Feature unavailable. Upgrade ${username}'s SSI.`,
                                            {
                                                position: 'top-center',
                                                autoClose: 2000,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: toastTheme(isLight),
                                                toastId: 7,
                                            }
                                        )
                                    }
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront2}>
                                        <p className={styles.cardTitle3}>
                                            {t('ADD_FUNDS')}
                                        </p>
                                    </div>
                                    <div className={styles.flipCardBack2}>
                                        <p className={styles.cardTitle2}>
                                            {t('TOP UP WALLET')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </h2>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className={styles.selectionWrapper}>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() =>
                                    handleSubmit('AcceptPendingController')
                                }
                                className={styles.card}
                            >
                                <div className={styles.cardTitle3}>
                                    CLAIM DIDxWALLET
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
