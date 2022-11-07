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

function Component() {
    const { t } = useTranslation()
    const user = useStore($resolvedInfo)
    const { navigate } = routerHook()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const domainNavigate = user?.domain !== '' ? user?.domain + '@' : ''

    const [loadingCard1, setLoadingCard1] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)

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
                        setLoadingCard1(true)
                        navigate(
                            `/${domainNavigate}${user?.name}/didx/wallet/dns/manage/did`
                        )
                        setTimeout(() => {
                            setLoadingCard1(false)
                        }, 1000)
                    }}
                    className={styles.flipCard}
                >
                    <div className={styles.flipCardInner}>
                        <div className={styles.flipCardFront}>
                            <p className={styles.cardTitle3}>
                                {loadingCard1 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    t('UPDATE NFT DID')
                                )}
                            </p>
                        </div>
                        <div className={styles.flipCardBack}>
                            <p className={styles.cardTitle2}>
                                {loadingCard1 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    t(
                                        'CHANGE THE DID ASSOCIATED WITH YOUR USERNAME'
                                    )
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
                            `/${domainNavigate}${user?.name}/didx/wallet/dns/manage/transfer`
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
                                    t('TRANSFER NFT USERNAME')
                                )}
                            </p>
                        </div>
                        <div className={styles.flipCardBack}>
                            <p className={styles.cardTitle2}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    t(
                                        'MODIFY THE ADDRESS ASSOCIATED WITH YOUR USERNAME'
                                    )
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
