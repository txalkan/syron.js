import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
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

export default function CardList() {
    const { t } = useTranslation()
    const { connect } = useArConnect()
    const { navigate } = routerHook()
    const { checkVersion } = fetch()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''
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
                    navigate(`/${domainNavigate}${username}/didx/wallet/doc`)
                }
            })
        } else {
            navigate(`/${domainNavigate}${username}/didx/wallet/doc`)
        }
        setTimeout(() => {
            setLoadingCard(false)
        }, 1000)
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex' }}>
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
                                <p className={styles.cardTitle2}>
                                    {loadingCard ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('MANAGE YOUR DIGITAL IDENTITY')
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
                                `/${domainNavigate}${username}/didx/wallet/balances`
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
                                <p className={styles.cardTitle2}>
                                    {loadingCard2 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('BALANCES & TRANSFERS')
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </h2>
            </div>
            <div style={{ display: 'flex' }}>
                <h2>
                    <div
                        onClick={() => {
                            setLoadingCard3(true)
                            navigate(
                                `/${domainNavigate}${username}/didx/wallet/nft`
                            )
                            setTimeout(() => {
                                setLoadingCard3(false)
                            }, 1000)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle3}>
                                    {loadingCard3 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        // @todo-i-fixed display s in lowercase
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
                                <p className={styles.cardTitle2}>
                                    {loadingCard3 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        'NON-FUNGIBLE TOKENS' // @todo-l t('DID DOMAINS & USERNAME TRANSFERS')
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </h2>
                <h2>
                    <div
                        onClick={() => {
                            setLoadingCard4(true)
                            navigate(
                                `/${domainNavigate}${username}/didx/wallet/updates`
                            )
                            setTimeout(() => {
                                setLoadingCard(false)
                            }, 1000)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle4}>
                                    {loadingCard4 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t('UPDATES')
                                    )}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <p className={styles.cardTitle2}>
                                    {loadingCard4 ? (
                                        <ThreeDots color="yellow" />
                                    ) : (
                                        t(
                                            'UPDATE DID CONTROLLER, SSI USERNAME & DEADLINE'
                                        )
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className={styles.selectionWrapper}>
                    <DeployTydra />
                </div>
            </div>
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
                                <p className={styles.cardTitle2}>
                                    {t('INCREASE/DECREASE ALLOWANCES')}
                                </p>
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
              <p className={styles.cardTitle3}>UPGRADE</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>COMING SOON!</p>
            </div>
          </div>
        </div>
      </h2> */}
            {/*
             */}
        </div>
    )
}
