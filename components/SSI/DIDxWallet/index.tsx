import { useStore } from 'effector-react'
import React, { ReactNode, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import * as tyron from 'tyron'
import { $doc } from '../../../src/store/did-doc'
import { $user } from '../../../src/store/user'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import styles from './styles.module.scss'
import { updateIsController } from '../../../src/store/controller'
import { RootState } from '../../../src/app/reducers'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import { $net } from '../../../src/store/wallet-network'
import fetchDoc from '../../../src/hooks/fetchDoc'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { useTranslation } from 'next-i18next'

interface LayoutProps {
    children: ReactNode
}

function Component(props: LayoutProps) {
    const { t } = useTranslation()
    const { fetch } = fetchDoc()
    useEffect(() => {
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { children } = props
    const Router = useRouter()
    const dispatch = useDispatch()

    const net = useStore($net)
    const user = useStore($user)
    const doc = useStore($doc)
    const docVersion = doc?.version.slice(0, 7)
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const controller = resolvedUsername?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    const handleSubmit = async (event: { target: { value: any } }) => {
        if (resolvedUsername !== null) {
            try {
                const zilpay = new ZilPayBase()
                const txID = event.target.value

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                await zilpay
                    .call({
                        contractAddress: resolvedUsername.addr,
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
                            {user?.name}
                            {user?.domain === '' ? '' : `.${user?.domain}`}
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
                                Router.push(`/${user?.name}/did/doc`)
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
                                Router.push(`/${user?.name}/did/recovery`)
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
                    <h5 style={{ color: '#ffff32' }}>x</h5>
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
                                    Router.push(`/${user?.name}/did/wallet`)
                                } else {
                                    toast.error(
                                        t(
                                            'Only X’s DID Controller can access this wallet.',
                                            { name: user?.name }
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
                                    Router.push(`/${user?.name}/did/funds`)
                                } else {
                                    toast.info(
                                        `Feature unavailable. Upgrade ${user?.name}'s SSI.`,
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
                <select className={styles.selection} onChange={handleSubmit}>
                    <option value="">{t('More transactions')}</option>
                    <option value="AcceptPendingController">
                        {t('Accept pending controller')}
                    </option>
                    <option value="AcceptPendingUsername">
                        {t('Accept pending username')}
                    </option>
                </select>
            </div>
        </div>
    )
}

export default Component
