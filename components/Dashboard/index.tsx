import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useStore } from 'effector-react'
import styles from './styles.module.scss'
import { RootState } from '../../src/app/reducers'
import {
    updateModalDashboard,
    updateModalNewSsi,
    updateShowZilpay,
    $showZilpay,
    $dashboardState,
} from '../../src/store/modal'
import { DashboardLabel, ZilPay } from '..'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'

function Component() {
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const showZilpay = useStore($showZilpay)
    const dashboardState = useStore($dashboardState)
    const { t } = useTranslation()

    const onConnect = () => {
        if (loginInfo.zilAddr) {
            updateModalDashboard(true)
            updateModalNewSsi(false)
        } else {
            updateShowZilpay(true)
        }
        toast.info(t('Browsing on {{net}}', { net: net }), {
            position: 'bottom-right',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
            toastId: 4,
        })
    }

    useEffect(() => {
        if (loginInfo.zilAddr !== null) {
            updateShowZilpay(false)
        }
    }, [loginInfo.zilAddr])

    return (
        <div className={styles.wrapper}>
            {loginInfo.address && loginInfo.zilAddr ? (
                <>
                    <div className={styles.wrapperIcon} onClick={onConnect}>
                        <div className={styles.txtLoggedIn}>
                            {t('LOGGED_IN')}
                        </div>
                    </div>
                    {net === 'testnet' && <DashboardLabel />}
                </>
            ) : loginInfo.zilAddr ? (
                <div className={styles.wrapperIcon} onClick={onConnect}>
                    <div className={styles.tooltip}>
                        {/* @todo-i cannot see the following */}
                        <span className={styles.tooltiptext}>
                            <div
                                style={{
                                    fontSize: '8px',
                                }}
                            >
                                {/* @todo-i update in languages:
                                - SPANISH: Iniciá sesión para acceder a todas las funcionalidades.
                                 */}
                                {'Log in for full functionality.'}
                            </div>
                        </span>
                    </div>
                    <div className={styles.txtConnected}>{t('Log in')}</div>
                </div>
            ) : (
                <div className={styles.wrapperIcon} onClick={onConnect}>
                    <div className={styles.txtConnect}>{t('CONNECT')}</div>
                </div>
            )}
            {showZilpay && <ZilPay />}
        </div>
    )
}

export default Component
