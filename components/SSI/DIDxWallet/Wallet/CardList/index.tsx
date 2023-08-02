import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import useArConnect from '../../../../../src/hooks/useArConnect'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import { $arconnect } from '../../../../../src/store/arconnect'
import { useState } from 'react'
import ThreeDots from '../../../../Spinner/ThreeDots'
import DeployTydra from '../../../DeployTydra'
import fetch from '../../../../../src/hooks/fetch'
import { NFT } from '../../../..'
import { useStore } from 'react-stores'

export default function CardList() {
    const { t } = useTranslation()
    const { connect } = useArConnect()
    const { navigate } = routerHook()
    const { checkVersion } = fetch()
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
    const resolvedTLD =
        resolvedInfo?.user_tld! && resolvedInfo.user_tld
            ? resolvedInfo.user_tld
            : ''

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const [loadingCard, setLoadingCard] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)
    const [loadingCard3, setLoadingCard3] = useState(false)
    const [loadingCard4, setLoadingCard4] = useState(false)
    const version = checkVersion(resolvedInfo?.version)

    const didOps = async () => {
        setLoadingCard(true)
        if (version < 6) {
            await connect().then(() => {
                const arConnect = $arconnect.getState()
                if (arConnect) {
                    navigate(
                        `/${subdomainNavigate}${resolvedDomain}/didx/wallet/doc`
                    )
                }
            })
        } else {
            navigate(`/${subdomainNavigate}${resolvedDomain}/didx/wallet/doc`)
        }
        setTimeout(() => {
            setLoadingCard(false)
        }, 1000)
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <h2>
                    <div onClick={didOps} className={styles.flipCard}>
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle3}>
                                    {loadingCard ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('DID OPERATIONS')
                                    )}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardTitle2}>
                                    {loadingCard ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('MANAGE YOUR DIGITAL IDENTITY')
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </h2>
                {/* @review: clean ui */}
                {/* <h2>
                    <div
                        onClick={() => {
                            setLoadingCard2(true)
                            navigate(
                                `/${domainNavigate}${resolvedDomain}/didx/wallet/balances`
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
                                        t('BALANCES')
                                    )}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardTitle2}>
                                    {loadingCard2 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('BALANCES & TRANSFERS')
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </h2> */}
            </div>
            {/* <div style={{ display: 'flex' }}>
                <h2>
                    <div
                        onClick={() => {
                            // setLoadingCard3(true)
                            navigate(
                                `/${domainNavigate}${resolvedDomain}/didx/wallet/nft`
                            )
                            // setLoadingCard3(false)
                            // @todo review since the timeout provokes an unmounted component issue
                            // setTimeout(() => {
                            //     setLoadingCard3(false)
                            // }, 1000)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle3}>
                                    {loadingCard3 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        <>
                                            NFT
                                            <span
                                                style={{
                                                    textTransform: 'lowercase',
                                                }}
                                            >
                                                s
                                            </span>
                                        </>
                                        // @todo-l t('NFT USERNAME')
                                    )}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardTitle2}>
                                    {loadingCard3 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        'NON-FUNGIBLE TOKENS' // @todo-t t('DID DOMAINS & USERNAME TRANSFERS')
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </h2>
                @todo-r
                <h2>
                    <div
                        onClick={() => {
                            setLoadingCard4(true)
                            navigate(
                                `/${domainNavigate}${resolvedDomain}/didx/wallet/updates`
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
                                    {loadingCard4 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('UPDATES')
                                    )}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardTitle2}>
                                    {loadingCard4 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        'UPDATE CONTROLLER WALLET'
                                        // @todo-t t(
                                        //     'UPDATE DID CONTROLLER, SSI USERNAME & DEADLINE'
                                        // )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </h2>
            </div> */}
            <div className={styles.selectionWrapper}>
                <DeployTydra />
            </div>
            <NFT />
            {/* <div style={{ display: 'flex' }}>
                <h2>
                    <div
                        onClick={() => {
                            updateIsController(true)
                            navigate(`/${domainNavigate}${username}/didx/wallet/allowances`)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle3}>
                                    {t('ALLOWANCES')}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <div className={styles.cardTitle2}>
                                    {t('INCREASE/DECREASE ALLOWANCES')}
                                </div>
                            </div>
                        </div>
                    </div>
                </h2>
            </div> */}
            {/* <h2>
        <div
          onClick={() => {
            updateIsController(true);
            navigate(`/${domainNavigate}${username}/didx/wallet/upgrade`);
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <div className={styles.cardTitle3}>UPGRADE</div>
            </div>
            <div className={styles.flipCardBack}>
              <div className={styles.cardTitle2}>COMING SOON!</div>
            </div>
          </div>
        </div>
      </h2> */}
        </div>
    )
}
