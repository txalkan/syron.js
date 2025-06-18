import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../src/hooks/router'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { $loading, $loadingTydra } from '../../../../src/store/loading'
import { ClaimWallet, Spinner } from '../../..'
import useFetch from '../../../../src/hooks/fetch'
import controller from '../../../../src/hooks/isController'
import { $isController } from '../../../../src/store/controller'
import toastTheme from '../../../../src/hooks/toastTheme'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import wallet from '../../../../src/hooks/wallet'
import Tydra from '../../Tydra'
import ThreeDots from '../../../Spinner/ThreeDots'
import { useStore as effectorStore } from 'effector-react'
import { useStore } from 'react-stores'

function Component() {
    const resolvedInfo = useStore($resolvedInfo)
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { fetchDoc } = useFetch(resolvedInfo)
    const { checkPause } = wallet()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const loading = effectorStore($loading)
    const { isController } = controller()
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

    const [isPaused, setIsPaused] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)

    const fetchPause = async () => {
        setIsLoading(true)
        try {
            const paused = await checkPause(resolvedInfo.addr!)
            setIsPaused(paused)
            setIsLoading(false)
            fetchDoc()
        } catch {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPause()
        isController()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading || isLoading) {
        return <Spinner />
    }

    return (
        <div className={styles.wrapper}>
            {/* <Tydra />
            {!loadingTydra && ( */}

            <>
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
                        {/* @todo add module <div className={styles.cardHeadline}>
                            <h1>
                                <div className={styles.username}>
                                    <span>{resolvedSubdomain}@</span>
                                    {resolvedDomain!?.length > 7 && (
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
                                </div>{' '}
                            </h1>
                        </div> */}
                    </div>
                </div>
                <div
                    style={{
                        marginTop: '3%',
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
                                    if (isPaused) {
                                        toast.warn(
                                            'To continue, unpause your ZILxWALLET',
                                            {
                                                position: 'top-right',
                                                autoClose: 2000,
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
                                        setLoadingCard(true)
                                        navigate(
                                            `/${subdomainNavigate}${resolvedDomain}/zil/funds`
                                        )
                                        setTimeout(() => {
                                            setLoadingCard(false)
                                        }, 1000)
                                    }
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront}>
                                        <div className={styles.cardTitle3}>
                                            {loadingCard ? (
                                                <ThreeDots color="basic" />
                                            ) : (
                                                'DEPOSIT'
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.flipCardBack}>
                                        <div className={styles.cardTitle2}>
                                            {loadingCard ? (
                                                <ThreeDots color="basic" />
                                            ) : (
                                                t('TOP UP WALLET')
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </h2>
                        <div className={styles.xText}>
                            {/* <h5
                                    style={{
                                        color: isLight ? '#000' : '#dbe4eb',
                                    }}
                                >
                                    x
                                </h5> */}
                        </div>
                        <h2>
                            <div
                                onClick={() => {
                                    setLoadingCard2(true)

                                    const is_controller =
                                        $isController.getState()
                                    if (is_controller) {
                                        navigate(
                                            `/${subdomainNavigate}${resolvedDomain}/zil/wallet`
                                        )
                                        setTimeout(() => {
                                            setLoadingCard2(false)
                                        }, 1000)
                                    } else {
                                        setLoadingCard2(false)

                                        const message = t(
                                            'Only X’s owner can access this wallet.',
                                            { name: resolvedDomain }
                                        )
                                        toast.warn(message, {
                                            position: 'bottom-right',
                                            autoClose: 3000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: toastTheme(isLight),
                                            toastId: 1,
                                        })
                                    }
                                }}
                                className={styles.flipCard}
                            >
                                <div className={styles.flipCardInner}>
                                    <div className={styles.flipCardFront}>
                                        <div className={styles.cardTitle3}>
                                            {loadingCard2 ? (
                                                <ThreeDots color="basic" />
                                            ) : (
                                                'STAKING'
                                                // t('WALLET') @todo
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.flipCardBack}>
                                        <div className={styles.cardTitle2}>
                                            {loadingCard2 ? (
                                                <ThreeDots color="basic" />
                                            ) : (
                                                'Stake ZIL'
                                                //t('WEB3 WALLET') @todo
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </h2>
                    </div>
                    {/*
                            @reviewed: deprecate in favor of SBTx - merge with DEFIx
                            <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <div className={styles.selectionWrapper}>
                                <ClaimWallet title="CLAIM DEFIxWALLET" />
                            </div>
                        </div> */}
                </div>
            </>
            {/* )} */}
        </div>
    )
}

export default Component
