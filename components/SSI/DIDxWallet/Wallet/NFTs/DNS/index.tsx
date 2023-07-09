import React, { useEffect, useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import ThreeDots from '../../../../../Spinner/ThreeDots'
import {
    updateSubdomain,
    updateDomainAddr,
    updateDomainLegend,
} from '../../../../../../src/store/modal'

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
    const [hideTransfer, setHideTransfer] = useState(true)
    const [showDIDDomain, setShowDIDDomain] = useState(false)
    const [showManageNFT, setShowManageNFT] = useState(false)
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const back = () => {
        if (!hideTransfer) {
            setHideTransfer(true)
        } else if (showManageNFT) {
            setShowManageNFT(false)
        } else if (showDIDDomain) {
            setShowDIDDomain(false)
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {showDIDDomain || showManageNFT ? (
                <button
                    onClick={back}
                    className="button"
                    style={{ marginBottom: '50%' }}
                >
                    <div>{t('BACK')}</div>
                </button>
            ) : (
                <></>
            )}
            {!showDIDDomain && !showManageNFT && (
                <>
                    <h2>
                        <div
                            onClick={() => {
                                setLoadingCard(true)
                                updateSubdomain('')
                                updateDomainAddr('')
                                updateDomainLegend('save')
                                navigate(
                                    `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft/dns/subdomain/`
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
                                            <div>{t('DNS_1')}</div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <div className={styles.cardTitle2}>
                                        {loadingCard ? (
                                            <ThreeDots color="yellow" />
                                        ) : (
                                            <div>{t('DNS_2')}</div>
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
                                    `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft/dns/manage/transfer`
                                )
                                setTimeout(() => {
                                    setLoadingCard2(false)
                                }, 1000)
                            }}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <div className={styles.cardTitle3}>
                                        {loadingCard2 ? (
                                            <ThreeDots color="yellow" />
                                        ) : (
                                            <div>{t('DNS_3')}</div>
                                            // @todo-l t('TRANSFER NFT USERNAME') //t('MANAGE NFT USERNAME')
                                        )}
                                    </div>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <div className={styles.cardTitle2}>
                                        {loadingCard2 ? (
                                            <ThreeDots color="yellow" />
                                        ) : (
                                            <div>{t('DNS_4')}</div>

                                            // @todo-l t(
                                            //     'MODIFY THE ADDRESS ASSOCIATED WITH YOUR USERNAME'
                                            // )
                                            // t('EXTRA FUNCTIONALITY')
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </h2>
                </>
            )}
        </div>
    )
}

export default Component
