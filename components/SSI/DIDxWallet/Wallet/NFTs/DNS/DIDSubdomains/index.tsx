import React, { useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import ThreeDots from '../../../../../../Spinner/ThreeDots'

function Component() {
    const { t } = useTranslation()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''
    const { navigate } = routerHook()
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

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
                        navigate(
                            `/${domainNavigate}${username}/didx/wallet/nft/dns/subdomains/new`
                        )
                        setTimeout(() => {
                            setLoadingCard(false)
                        }, 1000)
                    }}
                    className={styles.flipCard}
                >
                    <div className={styles.flipCardInner}>
                        <div className={styles.flipCardFront}>
                            <p className={styles.cardTitle3}>
                                {loadingCard ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'NEW SUBDOMAIN'
                                )}
                            </p>
                        </div>
                        <div className={styles.flipCardBack}>
                            <p className={styles.cardTitle2}>
                                {loadingCard ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'NEW SUBDOMAIN'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </h2>
            <h2>
                <div
                    onClick={() => {
                        setLoadingCard2(true)
                        navigate(
                            `/${domainNavigate}${username}/didx/wallet/nft/dns/subdomains/nft`
                        )
                        setTimeout(() => {
                            setLoadingCard2(false)
                        }, 1000)
                    }}
                    className={styles.flipCard}
                >
                    <div className={styles.flipCardInner}>
                        <div className={styles.flipCardFront}>
                            <p className={styles.cardTitle3}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'UPDATE NFT DNS'
                                )}
                            </p>
                        </div>
                        <div className={styles.flipCardBack}>
                            <p className={styles.cardTitle2}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    'UPDATE NFT DNS'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </h2>
        </div>
    )
}

export default Component
