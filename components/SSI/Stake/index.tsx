import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../src/hooks/router'
import { updateIsController } from '../../../src/store/controller'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useEffect } from 'react'
import { $loading, $loadingDoc } from '../../../src/store/loading'
import fetchDoc from '../../../src/hooks/fetchDoc'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { fetch } = fetchDoc()
    const resolvedInfo = useStore($resolvedInfo)
    const loading = useStore($loading)
    const loadingDoc = useStore($loadingDoc)
    const username = resolvedInfo?.name
    const controller = resolvedInfo?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)

    const path = window.location.pathname
    useEffect(() => {
        if (!loading && !loadingDoc) {
            if (
                username !== path.split('/')[1] &&
                resolvedInfo?.domain === 'zil'
            ) {
                fetch()
            } else if (!username) {
                fetch()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path])

    if (loadingDoc || loading) {
        return (
            <i
                style={{ color: 'silver' }}
                className="fa fa-lg fa-spin fa-circle-notch"
                aria-hidden="true"
            ></i>
        )
    }

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
                        <p className={styles.username}>
                            {resolvedInfo?.name}.zil
                        </p>{' '}
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
                                navigate(`/${resolvedInfo?.name}/zil/funds`)
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
                                    navigate(
                                        `/${resolvedInfo?.name}/zil/wallet`
                                    )
                                } else {
                                    toast.error(
                                        t(
                                            'Only X’s DID Controller can access this wallet.',
                                            { name: resolvedInfo?.name }
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
