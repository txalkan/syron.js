import { useStore } from 'effector-react'
import React, { ReactNode, useState } from 'react'
import { useSelector } from 'react-redux'
import { $doc } from '../../../src/store/did-doc'
import { toast } from 'react-toastify'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $isController } from '../../../src/store/controller'
import { RootState } from '../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import { ClaimWallet, Spinner } from '../..'
import routerHook from '../../../src/hooks/router'
import { $loading, $loadingDoc } from '../../../src/store/loading'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import controller from '../../../src/hooks/isController'
import toastTheme from '../../../src/hooks/toastTheme'
import ThreeDots from '../../Spinner/ThreeDots'
import Tydra from '../Tydra'

interface LayoutProps {
    children: ReactNode
}

function Component(props: LayoutProps) {
    const { t } = useTranslation()
    const { navigate } = routerHook()

    const { children } = props

    const doc = useStore($doc)
    const loadingDoc = useStore($loadingDoc)
    const loading = useStore($loading)
    const docVersion = doc?.version.slice(0, 7).toLowerCase()
    const { isController } = controller()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const [loadingCard1, setLoadingCard1] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const [loadingCard3, setLoadingCard3] = useState(false)
    const [loadingCard4, setLoadingCard4] = useState(false)

    const domainNavigate = domain !== '' ? domain + '@' : ''

    if (loadingDoc || loading) {
        return <Spinner />
    }

    return (
        <div className={styles.wrapper}>
            <Tydra />
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
                        <div className={styles.username}>
                            <span style={{ textTransform: 'none' }}>
                                {domain !== '' &&
                                    domain !== 'did' &&
                                    `${domain}@`}
                            </span>
                            {username!?.length > 7 && (
                                <div className={styles.usernameMobile}>
                                    <br />
                                </div>
                            )}
                            <span>{username}</span>
                            {username!?.length > 7 && (
                                <div className={styles.usernameMobile}>
                                    <br />
                                </div>
                            )}
                            <span>.{domain === 'did' ? 'did' : 'ssi'}</span>
                        </div>
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
                        {docVersion === 'didxwal' ||
                        docVersion === 'xwallet' ||
                        docVersion === 'initi--' ||
                        docVersion === 'initdap'
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
                                    setLoadingCard1(true)
                                    navigate(
                                        `/${domainNavigate}${username}/didx/doc`
                                    )
                                    setTimeout(() => {
                                        setLoadingCard1(false)
                                    }, 1000)
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront}>
                                        <div className={styles.cardTitle3}>
                                            {loadingCard1 ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                t('DID')
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.flipCardBack}>
                                        <div className={styles.cardTitle2}>
                                            {loadingCard1 ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                t('DECENTRALIZED IDENTIFIER')
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </h2>
                        <h2>
                            <div
                                onClick={() => {
                                    setLoadingCard2(true)
                                    navigate(
                                        `/${domainNavigate}${username}/didx/recovery`
                                    )
                                    setTimeout(() => {
                                        setLoadingCard2(false)
                                    }, 1000)
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront2}>
                                        <div className={styles.cardTitle3}>
                                            {loadingCard2 ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                t('SOCIAL RECOVERY')
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.flipCardBack2}>
                                        <div className={styles.cardTitle2}>
                                            {loadingCard2 ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                t('UPDATE DID CONTROLLER')
                                            )}
                                        </div>
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
                                    setLoadingCard3(true)
                                    isController()
                                    const is_controller =
                                        $isController.getState()
                                    if (is_controller) {
                                        navigate(
                                            `/${domainNavigate}${username}/didx/wallet`
                                        )
                                        setTimeout(() => {
                                            setLoadingCard3(false)
                                        }, 1000)
                                    } else {
                                        setLoadingCard3(false)
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
                                        <div className={styles.cardTitle3}>
                                            {loadingCard3 ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                t('WALLET')
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.flipCardBack}>
                                        <div className={styles.cardTitle2}>
                                            {loadingCard3 ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                t('WEB3 WALLET')
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </h2>
                        <h2>
                            <div
                                onClick={() => {
                                    setLoadingCard4(true)
                                    if (
                                        Number(doc?.version.slice(8, 9)) >= 4 ||
                                        doc?.version.slice(0, 4) === 'init' ||
                                        doc?.version.slice(0, 3) === 'dao' ||
                                        doc?.version.slice(0, 10) ===
                                            'DIDxWALLET'
                                    ) {
                                        navigate(
                                            `/${domainNavigate}${username}/didx/funds`
                                        )
                                        setTimeout(() => {
                                            setLoadingCard4(false)
                                        }, 1000)
                                    } else {
                                        setLoadingCard4(false)
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
                                        <div className={styles.cardTitle3}>
                                            {loadingCard4 ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                t('ADD_FUNDS')
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.flipCardBack2}>
                                        <div className={styles.cardTitle2}>
                                            {loadingCard4 ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                t('TOP UP WALLET')
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </h2>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className={styles.selectionWrapper}>
                        <ClaimWallet title="CLAIM DIDxWALLET" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
