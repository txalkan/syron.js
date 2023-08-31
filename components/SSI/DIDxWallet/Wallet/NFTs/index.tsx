import React, { useEffect, useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import ThreeDots from '../../../../Spinner/ThreeDots'
import { toast } from 'react-toastify'
import toastTheme from '../../../../../src/hooks/toastTheme'
import fetch from '../../../../../src/hooks/fetch'
import { ZRC6Gallery } from '../../../..'
import { useStore } from 'react-stores'

function Component() {
    const { t } = useTranslation()
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

    const { navigate } = routerHook()
    const { checkVersion } = fetch()
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const version = checkVersion(resolvedInfo?.version!)

    return (
        <div>
            <ZRC6Gallery />
            <div className={styles.content}>
                <h2>
                    <div
                        onClick={() => {
                            setLoadingCard(true)
                            navigate(
                                `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft/dns`
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
                                        <>DNS</>
                                    )}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardTitle2}>
                                    {loadingCard ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        'DOMAIN NAME SYSTEM'
                                    )}
                                    {/* @todo-t */}
                                </div>
                            </div>
                        </div>
                    </div>
                </h2>
                &nbsp;
                <h2>
                    <div
                        onClick={() => {
                            if (version < 6) {
                                toast.warn('Available from DIDxWALLET v6.', {
                                    position: 'top-right',
                                    autoClose: 2000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 7,
                                })
                            } else {
                                setLoadingCard2(true)
                                navigate(
                                    `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft/zrc6`
                                )
                                setTimeout(() => {
                                    setLoadingCard2(false)
                                }, 1000)
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
                                        <div>
                                            <span
                                                style={{
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                COLLECTIONS
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardTitle2}>
                                    {loadingCard2 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        <div>
                                            MANAGE NON-FUNGIBLE TOKENS
                                            <span
                                                style={{
                                                    textTransform: 'lowercase',
                                                }}
                                            >
                                                s
                                            </span>
                                        </div>
                                    )}
                                    {/* @review: translate */}
                                </div>
                            </div>
                        </div>
                    </div>
                </h2>
            </div>
        </div>
    )
}

export default Component
