import { useStore } from 'effector-react'
import { $user } from '../../../src/store/user'
import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../src/hooks/router'
import { updateIsController } from '../../../src/store/controller'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const user = useStore($user)
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const controller = resolvedUsername?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    return (
        <div className={styles.wrapper}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '10%',
                }}
            >
                <div
                    style={{
                        textAlign: 'left',
                        marginTop: '10%',
                    }}
                >
                    <div className={styles.cardHeadline}>
                        <h3 style={{ color: '#dbe4eb' }}>DID DOMAIN</h3>{' '}
                    </div>
                    <h1>
                        <p className={styles.username}>{user?.name}.zil</p>{' '}
                    </h1>
                </div>
            </div>
            <div
                style={{
                    marginTop: '3%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <h2>
                        <div
                            onClick={() => {
                                navigate(`/${user?.name}/zil/funds`)
                            }}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        {t('ADD FUNDS')}
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        {t('TOP UP WALLET')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </h2>
                    <h2 style={{ marginLeft: '20px' }}>
                        <div
                            onClick={() => {
                                if (controller === zilAddr?.base16) {
                                    updateIsController(true)
                                    navigate(`/${user?.name}/zil/wallet`)
                                } else {
                                    toast.error(
                                        t(
                                            'Only X’s DID Controller can access this wallet.',
                                            { name: user?.name }
                                        ),
                                        {
                                            position: 'top-right',
                                            autoClose: 3000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: 'dark',
                                            toastId: 1,
                                        }
                                    )
                                }
                            }}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        {t('WALLET')}
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        {t('WEB3 WALLET')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </h2>
                </div>
            </div>
        </div>
    )
}

export default Component
