import { useStore as effectorStore } from 'effector-react'
import React, { ReactNode, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { $doc } from '../../../src/store/did-doc'
import { toast } from 'react-toastify'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
// import { $isController } from '../../../src/store/controller' @todo-x review
import { RootState } from '../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import { ClaimWallet, Spinner } from '../..'
import useRouterHook from '../../../src/hooks/router'
import {
    $loading,
    $loadingDoc,
    $loadingTydra,
    updateLoadingTydra,
} from '../../../src/store/loading'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
// import controller from '../../../src/hooks/isController'
// import toastTheme from '../../../src/hooks/toastTheme'
import ThreeDots from '../../Spinner/ThreeDots'
import Tydra from '../Tydra'
import useFetch from '../../../src/hooks/fetch'
import { useStore } from 'react-stores'

interface LayoutProps {
    children: ReactNode
}

function Component(props: LayoutProps) {
    const { t } = useTranslation()
    const { navigate } = useRouterHook()

    const { children } = props

    const { fetchDoc } = useFetch()
    // @review: loading doc inside wallet & did doc && loading
    // const loadingDoc = useStore($loadingDoc)
    const loading = effectorStore($loading)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const controller_ = effectorStore($doc)?.controller.toLowerCase()
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const subdomainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const [loadingCard1, setLoadingCard1] = useState(false)
    //const [loadingCard2, setLoadingCard2] = useState(false)
    const [loadingCard3, setLoadingCard3] = useState(false)
    // const [loadingCard4, setLoadingCard4] = useState(false)
    const [loadingTydra_, setLoadingTydra_] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setLoadingCard1(false)
            setLoadingCard3(false)
            setLoadingTydra_(false)
        }, 2000)
        fetchDoc()
        return () => {
            setLoadingCard1(false)
            setLoadingCard3(false)
            setLoadingTydra_(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDomain, resolvedSubdomain]) //@review: add tld

    // if (loadingDoc || loading) {
    //     return <Spinner />
    // }
    if (loading) {
        return <Spinner />
    }

    return (
        <div className={styles.wrapper}>
            {/* <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        textAlign: 'left',
                        marginTop: '10%',
                    }}
                >
                    {!loadingTydra_ && (
                        <h1>
                            <div className={styles.username}>
                                <span style={{ textTransform: 'none' }}>
                                    {domain !== '' &&
                                        domain !== 'did' &&
                                        `${domain}@`}
                                </span>
                                {username!?.length > 12 && (
                                    <div className={styles.usernameMobile}>
                                        <br />
                                    </div>
                                )}
                                <span>{username}</span>
                                {username!?.length > 12 && (
                                    <div className={styles.usernameMobile}>
                                        <br />
                                    </div>
                                )}
                                <span>.{domain === 'did' ? 'did' : 'ssi'}</span>
                            </div>
                        </h1>
                    )}
                </div>
            </div> */}
            {/* <div style={{ marginBottom: '10%' }}>
                <Tydra />
            </div> */}
            {!loadingTydra_ && (
                <>
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
                        {/* <div className={styles.cardHeadline}>
                            <h3 style={{ color: isLight ? '#000' : '#dbe4eb' }}>
                                {docVersion === 'didxwal' ||
                                    docVersion === 'xwallet' ||
                                    docVersion === 'initi--' ||
                                    docVersion === 'initdap'
                                    ? t('DECENTRALIZED IDENTITY')
                                    : t('NFT USERNAME')}
                            </h3>{' '}
                            <h2
                                style={{
                                    marginTop: '40px',
                                    marginBottom: '40px',
                                    color: isLight ? '#6C00AD' : '#ffff32',
                                }}
                            >
                                DID
                                <span style={{ textTransform: 'lowercase' }}>
                                    x
                                </span>
                                WALLET
                            </h2>
                        </div> */}
                        <div
                            style={{
                                marginTop: '100px',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
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
                                <div
                                    onClick={() => {
                                        setLoadingCard1(true)
                                        navigate(
                                            `/${subdomainNavigate}${resolvedDomain}/didx/doc`
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
                                                    t(
                                                        'DECENTRALIZED IDENTIFIER'
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* <h2>
                                    <div
                                        onClick={() => {
                                            setLoadingCard2(true)
                                            navigate(
                                                `/${domainNavigate}${resolvedDomain}/didx/recovery`
                                            )
                                            setTimeout(() => {
                                                setLoadingCard2(false)
                                            }, 1000)
                                        }}
                                        className={styles.flipCard}
                                    >
                                        <div className={styles.flipCardInner}>
                                            <div
                                                className={
                                                    styles.flipCardFront2
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle3
                                                    }
                                                >
                                                    {loadingCard2 ? (
                                                        <ThreeDots color="yellow" />
                                                    ) : (
                                                        t('SOCIAL RECOVERY')
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={styles.flipCardBack2}
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle2
                                                    }
                                                >
                                                    {loadingCard2 ? (
                                                        <ThreeDots color="yellow" />
                                                    ) : (
                                                        t(
                                                            'UPDATE DID CONTROLLER'
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </h2> */}
                            </div>
                            <div className={styles.xText}>
                                <h5
                                    style={{
                                        color: isLight ? '#000' : '#dbe4eb',
                                    }}
                                >
                                    {/* x */}
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
                                {controller_ === zilpay_addr && (
                                    <div
                                        onClick={() => {
                                            setLoadingCard3(true)
                                            navigate(
                                                `/${subdomainNavigate}${resolvedDomain}/didx/wallet`
                                            )
                                            setTimeout(() => {
                                                setLoadingCard3(false)
                                            }, 1000)
                                        }}
                                        className={styles.flipCard}
                                    >
                                        <div className={styles.flipCardInner}>
                                            <div
                                                className={
                                                    styles.flipCardFrontWallet
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle3
                                                    }
                                                >
                                                    {loadingCard3 ? (
                                                        <ThreeDots color="yellow" />
                                                    ) : (
                                                        t('SETTINGS')
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={styles.flipCardBack}
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle2
                                                    }
                                                >
                                                    {loadingCard3 ? (
                                                        <ThreeDots color="yellow" />
                                                    ) : (
                                                        t(
                                                            'ACCOUNT CONFIGURATION'
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* <h2>
                                    <div
                                        onClick={() => {
                                            setLoadingCard3(true)
                                            isController()
                                            const is_controller =
                                                $isController.getState()
                                            if (is_controller) {
                                                navigate(
                                                    `/${domainNavigate}${resolvedDomain}/didx/wallet`
                                                )
                                                setTimeout(() => {
                                                    setLoadingCard3(false)
                                                }, 1000)
                                            } else {
                                                setLoadingCard3(false)
                                                toast.warn(
                                                    t(
                                                        'Only X’s DID Controller can access this wallet.',
                                                        { name: resolvedDomain }
                                                    ),
                                                    {
                                                        position:
                                                            'bottom-right',
                                                        autoClose: 3000,
                                                        hideProgressBar: false,
                                                        closeOnClick: true,
                                                        pauseOnHover: true,
                                                        draggable: true,
                                                        progress: undefined,
                                                        theme: toastTheme(
                                                            isLight
                                                        ),
                                                        toastId: 1,
                                                    }
                                                )
                                            }
                                        }}
                                        className={styles.flipCard}
                                    >
                                        <div className={styles.flipCardInner}>
                                            <div
                                                className={styles.flipCardFront}
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle3
                                                    }
                                                >
                                                    {loadingCard3 ? (
                                                        <ThreeDots color="yellow" />
                                                    ) : (
                                                        t('WALLET')
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={styles.flipCardBack}
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle2
                                                    }
                                                >
                                                    {loadingCard3 ? (
                                                        <ThreeDots color="yellow" />
                                                    ) : (
                                                        t('WEB3 WALLET')
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </h2> */}
                                {/* <h2>
                                    <div
                                        onClick={() => {
                                            setLoadingCard4(true)
                                            if (
                                                Number(
                                                    doc?.version.slice(8, 9)
                                                ) >= 4 ||
                                                doc?.version.slice(0, 4) ===
                                                'init' ||
                                                doc?.version.slice(0, 3) ===
                                                'dao' ||
                                                doc?.version.slice(0, 10) ===
                                                'DIDxWALLET'
                                            ) {
                                                navigate(
                                                    `/${domainNavigate}${resolvedDomain}/didx/funds`
                                                )
                                                setTimeout(() => {
                                                    setLoadingCard4(false)
                                                }, 1000)
                                            } else {
                                                setLoadingCard4(false)
                                                toast.info(
                                                    `Feature unavailable. Upgrade ${resolvedDomain}'s SSI.`,
                                                    {
                                                        position: 'top-center',
                                                        autoClose: 2000,
                                                        hideProgressBar: false,
                                                        closeOnClick: true,
                                                        pauseOnHover: true,
                                                        draggable: true,
                                                        progress: undefined,
                                                        theme: toastTheme(
                                                            isLight
                                                        ),
                                                        toastId: 7,
                                                    }
                                                )
                                            }
                                        }}
                                        className={styles.flipCard}
                                    >
                                        <div className={styles.flipCardInner}>
                                            <div
                                                className={
                                                    styles.flipCardFront2
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle3
                                                    }
                                                >
                                                    {loadingCard4 ? (
                                                        <ThreeDots color="yellow" />
                                                    ) : (
                                                        t('RECEIVE')
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={styles.flipCardBack2}
                                            >
                                                <div
                                                    className={
                                                        styles.cardTitle2
                                                    }
                                                >
                                                    {loadingCard4 ? (
                                                        <ThreeDots color="yellow" />
                                                    ) : (
                                                        t('TOP UP WALLET')
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </h2> */}
                            </div>
                        </div>
                        {/* <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <div className={styles.selectionWrapper}>
                                <ClaimWallet title="CLAIM DIDxWALLET" />
                            </div>
                        </div> */}
                    </div>
                </>
            )}
        </div>
    )
}

export default Component
