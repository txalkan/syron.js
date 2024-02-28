import React, { useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $resolvedInfo } from '../../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import ThreeDots from '../../../../../../Spinner/ThreeDots'
import { toast } from 'react-toastify'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import useFetch from '../../../../../../../src/hooks/fetch'
import {
    updateSubdomain,
    updateDomainLegend,
} from '../../../../../../../src/store/modal'
import { useStore } from 'react-stores'
import { updateDomainAddr } from '../../../../../../../src/store/subdomainAddr'

function Component() {
    const resolvedInfo = useStore($resolvedInfo)

    const { t } = useTranslation()
    const { checkVersion } = useFetch(resolvedInfo)
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
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const version = checkVersion(resolvedInfo?.version!)

    //@todo-x this file seems to be deprecated
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            <h2>
                <div
                    onClick={() => {
                        setLoadingCard(true)
                        updateSubdomain('')

                        updateDomainAddr({ base16: '' })
                        updateDomainLegend('save')
                        navigate(
                            `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft/dns/subdomain/new`
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
                                    'NEW SUBDOMAIN'
                                )}
                            </div>
                        </div>
                        <div className={styles.flipCardBack}>
                            <div className={styles.cardTitle2}>
                                {loadingCard ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'NEW SUBDOMAIN'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </h2>
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
                                `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft/dns/subdomain/nft`
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
                                        UPDATE NFT
                                        <span style={{ textTransform: 'none' }}>
                                            s
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
                                    'Change the NFT displayed with your domains & subdomains'
                                    // @todo-i-fixed we need more margin for the card texts, let's try to set it up globally for all cardTitles because we also have this issue in multi-language
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </h2>
        </div>
    )
}

export default Component
