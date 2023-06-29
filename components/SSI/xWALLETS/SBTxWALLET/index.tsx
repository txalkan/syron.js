import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { RootState } from '../../../../src/app/reducers'
import toastTheme from '../../../../src/hooks/toastTheme'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../src/hooks/router'
import { $isController } from '../../../../src/store/controller'
import controller from '../../../../src/hooks/isController'
import { $loading, $loadingTydra } from '../../../../src/store/loading'
import Spinner from '../../../Spinner'
import fetch from '../../../../src/hooks/fetch'
import { ClaimWallet } from '../../..'
// import Tydra from '../../Tydra'
import ThreeDots from '../../../Spinner/ThreeDots'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const resolvedInfo = useStore($resolvedInfo)
    const { isController } = controller()
    const { fetchDoc } = fetch()

    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const domainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const loading = useStore($loading)
    const loadingTydra = useStore($loadingTydra)
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)

    useEffect(() => {
        fetchDoc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return <Spinner />
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                {/* <Tydra />
                {!loadingTydra && ( */}

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
                        {/* @dev: MERGE with ZILxWALLET */}
                        {/* <div className={styles.cardHeadline}>
                                <h3 className={styles.title}>
                                    Soulbound xWALLET
                                </h3>
                            </div>
                            <h1>
                                <div className={styles.username}>
                                    <span>{resolvedSubdomain}@</span>
                                    {resolvedDomain!?.length > 5 && (
                                        <div className={styles.usernameMobile}>
                                            <br />
                                        </div>
                                    )}
                                    <span>{resolvedDomain}</span>
                                    {resolvedDomain!?.length > 7 && (
                                        <div className={styles.usernameMobile}>
                                            <br />
                                        </div>
                                    )}
                                    <span>.ssi</span>
                                </div>
                            </h1> */}
                    </div>
                    <div className={styles.cardWrapper}>
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
                                        setLoadingCard(true)
                                        navigate(
                                            `/${domainNavigate}${resolvedDomain}/sbt/public`
                                        )
                                        setTimeout(() => {
                                            setLoadingCard(false)
                                        }, 1000)
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <div className={styles.cardTitle3}>
                                                {loadingCard ? (
                                                    <ThreeDots color="yellow" />
                                                ) : (
                                                    'SBT'
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <div className={styles.cardTitle2}>
                                                {loadingCard ? (
                                                    <ThreeDots color="yellow" />
                                                ) : (
                                                    'SBT'
                                                )}
                                            </div>
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
                                        setLoadingCard2(true)
                                        isController()
                                        const is_controller =
                                            $isController.getState()
                                        if (is_controller) {
                                            navigate(
                                                `/${domainNavigate}${resolvedDomain}/sbt/wallet`
                                            )
                                            setTimeout(() => {
                                                setLoadingCard2(false)
                                            }, 1000)
                                        } else {
                                            setLoadingCard2(false)
                                            toast.error(
                                                t(
                                                    'Only X’s DID Controller can access this wallet.',
                                                    { name: resolvedDomain }
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
                                                {loadingCard2 ? (
                                                    <ThreeDots color="yellow" />
                                                ) : (
                                                    t('WALLET')
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <div className={styles.cardTitle2}>
                                                {loadingCard2 ? (
                                                    <ThreeDots color="yellow" />
                                                ) : (
                                                    'Soulbound tokens'
                                                    // @review: translates t('WEB3 WALLET') este lo dejaria soulbound tokens
                                                )}
                                            </div>
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
                                <ClaimWallet title="CLAIM DEFIxWALLET" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* )} */}
            </div>
        </div>
    )
}

export default Component
