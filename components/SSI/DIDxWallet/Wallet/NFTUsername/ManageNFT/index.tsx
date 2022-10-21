import React, { useEffect } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import controller from '../../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'

function Component() {
    const { t } = useTranslation()
    const user = useStore($resolvedInfo)
    const { navigate } = routerHook()
    const { isController } = controller()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const domainNavigate = user?.domain !== '' ? user?.domain + '@' : ''

    useEffect(() => {
        isController()
    })

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
                        navigate(
                            `${domainNavigate}${user?.name}/didx/wallet/dns/manage/did`
                        )
                    }}
                    className={styles.flipCard}
                >
                    <div className={styles.flipCardInner}>
                        <div className={styles.flipCardFront}>
                            <p className={styles.cardTitle3}>
                                {t('UPDATE NFT DID')}
                            </p>
                        </div>
                        <div className={styles.flipCardBack}>
                            <p className={styles.cardTitle2}>
                                {t(
                                    'CHANGE THE DID ASSOCIATED WITH YOUR USERNAME'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </h2>
            <h2>
                <div
                    onClick={() => {
                        navigate(
                            `/${domainNavigate}${user?.name}/didx/wallet/dns/manage/transfer`
                        )
                    }}
                    className={styles.flipCard}
                >
                    <div className={styles.flipCardInner}>
                        <div className={styles.flipCardFront}>
                            <p className={styles.cardTitle3}>
                                {t('TRANSFER NFT USERNAME')}
                            </p>
                        </div>
                        <div className={styles.flipCardBack}>
                            <p className={styles.cardTitle2}>
                                {t(
                                    'MODIFY THE ADDRESS ASSOCIATED WITH YOUR USERNAME'
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
