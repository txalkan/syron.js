import React, { useEffect, useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
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

function Component() {
    const { t } = useTranslation()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''
    const { navigate } = routerHook()
    const { checkVersion } = fetch()
    const [hideTransfer, setHideTransfer] = useState(true)
    const [showDIDDomain, setShowDIDDomain] = useState(false)
    const [showManageNFT, setShowManageNFT] = useState(false)
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const version = checkVersion(resolvedInfo?.version)

    return (
        <>
            <ZRC6Gallery />
            <div className={styles.content}>
                {!showDIDDomain && !showManageNFT && (
                    <>
                        <h2>
                            <div
                                onClick={() => {
                                    setLoadingCard(true)
                                    navigate(
                                        `/${domainNavigate}${username}/didx/wallet/nft/dns`
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
                                                <>
                                                    DID
                                                    <span
                                                        style={{
                                                            textTransform:
                                                                'lowercase',
                                                        }}
                                                    >
                                                        x
                                                    </span>
                                                    SSI
                                                </>
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
                                        toast.warn(
                                            'Available from DIDxWALLET v6.',
                                            {
                                                position: 'top-right',
                                                autoClose: 2000,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: toastTheme(isLight),
                                                toastId: 7,
                                            }
                                        )
                                    } else {
                                        setLoadingCard2(true)
                                        navigate(
                                            `/${domainNavigate}${username}/didx/wallet/nft/zrc6`
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
                                                            textTransform:
                                                                'uppercase',
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
                                                    MANAGE ZRC6 NFT
                                                    <span
                                                        style={{
                                                            textTransform:
                                                                'lowercase',
                                                        }}
                                                    >
                                                        s
                                                    </span>
                                                </div>
                                            )}
                                            {/* @TODO-t */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </h2>
                    </>
                )}
            </div>
        </>
    )
}

export default Component
