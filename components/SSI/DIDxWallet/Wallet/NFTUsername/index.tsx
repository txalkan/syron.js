import React, { useEffect, useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { toast } from 'react-toastify'
import controller from '../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import { $arconnect } from '../../../../../src/store/arconnect'
import useArConnect from '../../../../../src/hooks/useArConnect'
import toastTheme from '../../../../../src/hooks/toastTheme'

function Component() {
    const { t } = useTranslation()
    const { verifyArConnect } = useArConnect()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const { navigate } = routerHook()
    const [hideTransfer, setHideTransfer] = useState(true)
    const [showDIDDomain, setShowDIDDomain] = useState(false)
    const [showManageNFT, setShowManageNFT] = useState(false)
    const { isController } = controller()
    const arConnect = useStore($arconnect)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    useEffect(() => {
        isController()
    })

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
                    <p>{t('BACK')}</p>
                </button>
            ) : (
                <></>
            )}
            {!showDIDDomain && !showManageNFT && (
                <>
                    <h2>
                        <div
                            onClick={() => {
                                if (arConnect === null) {
                                    verifyArConnect(
                                        toast.warning(
                                            'Connect with ArConnect.',
                                            {
                                                position: 'top-center',
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
                                    )
                                } else {
                                    navigate(
                                        `/${username}/didx/wallet/nft/domains`
                                    )
                                }
                            }}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        {t('DID DOMAINS')}
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        {t('CREATE NEW DID DOMAINS')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </h2>
                    <h2>
                        <div
                            onClick={() => {
                                navigate(
                                    `/${resolvedInfo?.name}/didx/wallet/nft/manage`
                                )
                            }}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        {t('MANAGE NFT USERNAME')}
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        {t('EXTRA FUNCTIONALITY')}
                                    </p>
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
