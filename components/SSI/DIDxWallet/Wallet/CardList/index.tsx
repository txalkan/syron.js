import { updateIsController } from '../../../../../src/store/controller'
import { $arconnect } from '../../../../../src/store/arconnect'
import { $user } from '../../../../../src/store/user'
import styles from './styles.module.scss'
import { useRouter } from 'next/router'
import { useStore } from 'effector-react'
import { useEffect } from 'react'
import useArConnect from '../../../../../src/hooks/useArConnect'
import controller from '../../../../../src/hooks/isController'
import { useTranslation } from 'next-i18next'

export default function CardList() {
    const { t } = useTranslation()
    const { connect } = useArConnect()
    const { isController } = controller()
    const Router = useRouter()
    const arConnect = useStore($arconnect)
    const user = useStore($user)
    const username = user?.name

    useEffect(() => {
        isController()
    })

    const didOps = () => {
        if (arConnect === null) {
            connect().then(() => {
                updateIsController(true)
                Router.push(`/${username}/did/wallet/crud`)
            })
        } else {
            updateIsController(true)
            Router.push(`/${username}/did/wallet/crud`)
        }
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex' }}>
                <h2>
                    <div onClick={didOps} className={styles.flipCard}>
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <p className={styles.cardTitle3}>
                                    DID {t('OPERATIONS')}
                                </p>
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
                            updateIsController(true)
                            Router.push(`/${username}/did/wallet/balances`)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <p className={styles.cardTitle3}>
                                    {t('BALANCES')}
                                </p>
                            </div>
                            <div className={styles.flipCardBack}>
                                <p className={styles.cardTitle2}>
                                    {t('BALANCES, ADD FUNDS & WITHDRAWALS')}
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
                            updateIsController(true)
                            Router.push(`/${username}/did/wallet/nft`)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <p className={styles.cardTitle3}>
                                    {t('NFT USERNAME')}
                                </p>
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
                            updateIsController(true)
                            Router.push(`/${username}/did/wallet/updates`)
                        }}
                        className={styles.flipCard}
                    >
                        <div className={styles.flipCardInner}>
                            <div className={styles.flipCardFront}>
                                <p className={styles.cardTitle3}>
                                    {t('UPDATES')}
                                </p>
                            </div>
                            <div className={styles.flipCardBack}>
                                <p className={styles.cardTitle2}>
                                    {t('UPDATE DID CONTROLLER, SSI USERNAME &')}
                                </p>
                            </div>
                        </div>
                    </div>
                </h2>
            </div>
            {/* <h2>
        <div
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/did/wallet/upgrade`);
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
            {/* <h2>
        <div
          onClick={() => {
            updateIsController(true);
            Router.push(`/${username}/did/wallet/allowances`);
          }}
          className={styles.flipCard}
        >
          <div className={styles.flipCardInner}>
            <div className={styles.flipCardFront}>
              <p className={styles.cardTitle3}>ALLOWANCES</p>
            </div>
            <div className={styles.flipCardBack}>
              <p className={styles.cardTitle2}>increase/decrease allowances</p>
            </div>
          </div>
        </div>
      </h2> */}
        </div>
    )
}
