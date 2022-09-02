import { updateIsController } from '../../../../../src/store/controller'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { useEffect } from 'react'
import useArConnect from '../../../../../src/hooks/useArConnect'
import controller from '../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../src/hooks/router'
import { $arconnect } from '../../../../../src/store/arconnect'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'

export default function CardList() {
    const { t } = useTranslation()
    const { connect } = useArConnect()
    const { isController } = controller()
    const { navigate } = routerHook()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const arConnect = useStore($arconnect)
    const user = useStore($resolvedInfo)
    const username = user?.name
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    useEffect(() => {
        isController()
    })

    const didOps = () => {
        if (arConnect === null) {
            connect().then(() => {
                // updateIsController(true)
                navigate(`/${username}/didx/wallet/doc`)
            })
        } else {
            // updateIsController(true)
            navigate(`/${username}/didx/wallet/doc`)
        }
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex' }}>
                <h2>
                    <div onClick={didOps} className={styles.flipCard}>
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle3}>
                                    {t('DID OPERATIONS')}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <p className={styles.cardTitle2}>
                                    {t('MANAGE YOUR DIGITAL IDENTITY')}
                                </p>
                            </div>
                        </div>
                    </div>
                </h2>
                <h2>
                    <div
                        onClick={() => {
                            // if (loginInfo.address && loginInfo.zilAddr) {
                            //     updateIsController(true)
                            navigate(`/${username}/didx/wallet/balances`)
                            // } else {
                            //     toast.error('Please log in first', {
                            //         position: 'top-right',
                            //         autoClose: 3000,
                            //         hideProgressBar: false,
                            //         closeOnClick: true,
                            //         pauseOnHover: true,
                            //         draggable: true,
                            //         progress: undefined,
                            //         theme: 'dark',
                            //         toastId: 1,
                            //     })
                            // }
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle3}>
                                    {t('BALANCES')}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <p className={styles.cardTitle2}>
                                    {t('BALANCES & TRANSFERS')}
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
                            // updateIsController(true)
                            navigate(`/${username}/didx/wallet/nft`)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle3}>
                                    {t('NFT USERNAME')}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <p className={styles.cardTitle2}>
                                    {t('DID DOMAINS & USERNAME TRANSFERS')}
                                </p>
                            </div>
                        </div>
                    </div>
                </h2>
                <h2>
                    <div
                        onClick={() => {
                            // updateIsController(true)
                            navigate(`/${username}/didx/wallet/updates`)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <div className={styles.cardTitle4}>
                                    {t('UPDATES')}
                                </div>
                            </div>
                            <div className={styles.flipCardBack}>
                                <p className={styles.cardTitle2}>
                                    {t(
                                        'UPDATE DID CONTROLLER, SSI USERNAME & DEADLINE'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </h2>
            </div>
            {/* <div style={{ display: 'flex' }}>
                <h2>
                    <div
                        onClick={() => {
                            updateIsController(true)
                            navigate(`/${username}/didx/wallet/allowances`)
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
            navigate(`/${username}/didx/wallet/upgrade`);
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
