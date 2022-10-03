import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { RootState } from '../../../src/app/reducers'
import toastTheme from '../../../src/hooks/toastTheme'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../src/hooks/router'
import { $isController } from '../../../src/store/controller'
import controller from '../../../src/hooks/isController'
import { $loading } from '../../../src/store/loading'
import Spinner from '../../Spinner'
import fetch from '../../../src/hooks/fetch'
import { ClaimWallet } from '../..'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const resolvedInfo = useStore($resolvedInfo)
    const { isController } = controller()
    const { fetchDoc } = fetch()

    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loading = useStore($loading)

    useEffect(() => {
        isController()
        fetchDoc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return <Spinner />
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '10%',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        style={{
                            textAlign: 'left',
                            marginTop: '10%',
                        }}
                    >
                        <div className={styles.cardHeadline}>
                            <h3 className={styles.title}>Soulbound xWallet </h3>{' '}
                        </div>
                        <h1>
                            <p className={styles.username}>
                                <span>{domain}@</span>
                                <span>{username}.did</span>
                            </p>
                        </h1>
                    </div>
                    <div className={styles.cardWrapper}>
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
                                        navigate(
                                            `/${resolvedInfo?.domain}@${resolvedInfo?.name}/sbt/public`
                                        )
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <p className={styles.cardTitle3}>
                                                SBT
                                            </p>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <p className={styles.cardTitle2}>
                                                SBT
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                            <div className={styles.xText}>
                                <h5
                                    style={{
                                        color: isLight ? '#000' : '#dbe4eb',
                                    }}
                                >
                                    x
                                </h5>
                            </div>
                            <h2>
                                <div
                                    onClick={() => {
                                        isController()
                                        const is_controller =
                                            $isController.getState()
                                        if (is_controller) {
                                            navigate(
                                                `/${domain}@${username}/sbt/wallet`
                                            )
                                        } else {
                                            toast.error(
                                                t(
                                                    'Only X’s DID Controller can access this wallet.',
                                                    { name: username }
                                                ),
                                                {
                                                    position: 'bottom-right',
                                                    autoClose: 3000,
                                                    hideProgressBar: false,
                                                    closeOnClick: true,
                                                    pauseOnHover: true,
                                                    draggable: true,
                                                    progress: undefined,
                                                    theme: toastTheme(isLight),
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
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <div className={styles.selectionWrapper}>
                                <ClaimWallet title="CLAIM SBTxWallet" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
