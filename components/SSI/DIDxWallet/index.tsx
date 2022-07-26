import { useStore } from 'effector-react'
import React, { ReactNode, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as tyron from 'tyron'
import { $doc } from '../../../src/store/did-doc'
import { toast } from 'react-toastify'
import styles from './styles.module.scss'
import { updateIsController } from '../../../src/store/controller'
import { RootState } from '../../../src/app/reducers'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import fetchDoc from '../../../src/hooks/fetchDoc'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { useTranslation } from 'next-i18next'
import { Selector } from '../..'
import routerHook from '../../../src/hooks/router'
import { $loading, $loadingDoc } from '../../../src/store/loading'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'

interface LayoutProps {
    children: ReactNode
}

function Component(props: LayoutProps) {
    const { t } = useTranslation()
    const { fetch } = fetchDoc()
    const { navigate } = routerHook()
    const path = window.location.pathname
    useEffect(() => {
        if (!loading && !loadingDoc) {
            if (
                username !== path.split('/')[1] &&
                resolvedInfo?.domain === 'did'
            ) {
                fetch()
            } else if (!username) {
                fetch()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path])

    const { children } = props
    const dispatch = useDispatch()

    const net = useSelector((state: RootState) => state.modal.net)
    const doc = useStore($doc)
    const loadingDoc = useStore($loadingDoc)
    const loading = useStore($loading)
    const docVersion = doc?.version.slice(0, 7)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const controller = resolvedInfo?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    const handleSubmit = async (value: any) => {
        if (resolvedInfo !== null) {
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
                                    `https://devex.zilliqa.com/tx/${
                                        res.ID
                                    }?network=https%3A%2F%2F${
                                        net === 'mainnet' ? '' : 'dev-'
                                    }api.zilliqa.com`
                                )
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                            }
                        } catch (err) {
                            dispatch(setTxStatusLoading('rejected'))
                            updateModalTxMinimized(false)
                            updateModalTx(true)
                            toast.error(String(err), {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                            })
                        }
                    })
            } catch (error) {
                updateModalTx(false)
                dispatch(setTxStatusLoading('idle'))
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 12,
                })
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
                theme: 'dark',
                toastId: 12,
            })
        }
    }

    const option = [
        {
            key: '',
            name: t('More transactions'),
        },
        {
            key: 'AcceptPendingController',
            name: t('Accept pending controller'),
        },
        {
            key: 'AcceptPendingUsername',
            name: t('Accept pending username'),
        },
    ]

    if (loadingDoc || loading) {
        return (
            <i
                style={{ color: 'silver' }}
                className="fa fa-lg fa-spin fa-circle-notch"
                aria-hidden="true"
            ></i>
        )
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
                    <div className={styles.cardHeadline}>
                        <h3 style={{ color: '#dbe4eb' }}>
                            {docVersion === 'xwallet' ||
                            docVersion === 'initi--'
                                ? t('DECENTRALIZED IDENTITY')
                                : t('NFT USERNAME')}
                        </h3>{' '}
                        {/** @todo-i-checked define label based on version (if version = initi- or xwallet => DECENTRALIZED IDENTITY, otherwise NFT USERNAME */}
                    </div>
                    <h1>
                        <p className={styles.username}>
                            {username}
                            {/* {user?.domain === '' ? '' : '.did'} */}
                        </p>{' '}
                        {/** @todo-i-checked if domain = "" => no not render the dot . */}
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
                                        {t('DECENTRALIZED IDENTITY')}
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
                    <h5 style={{ color: '#dbe4eb' }}>x</h5>
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
                                if (controller === zilAddr?.base16) {
                                    updateIsController(true)
                                    navigate(`/${username}/didx/wallet`)
                                } else {
                                    toast.error(
                                        t(
                                            'Only X’s DID Controller can access this wallet.',
                                            { name: username }
                                        ),
                                        {
                                            position: 'top-right',
                                            autoClose: 3000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: 'dark',
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
                                            theme: 'dark',
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
            <div className={styles.selectionWrapper}>
                <Selector option={option} onChange={handleSubmit} value="" />
            </div>
        </div>
    )
}

export default Component
