import React, { useEffect } from 'react'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { useStore } from 'effector-react'
import userConnected from '../../src/assets/icons/user_connected.svg'
import userLoggedIn from '../../src/assets/icons/user_loggedin.svg'
import userConnect from '../../src/assets/icons/user_connect.svg'
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
        if (dashboardState !== null) {
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
            {dashboardState === 'loggedIn' ? (
                <>
                    <div className={styles.wrapperIcon} onClick={onConnect}>
                        <Image src={userLoggedIn} alt="user-loggedin" />
                        <div className={styles.txtLoggedIn}>
                            {t('LOGGED_IN')}
                        </div>
                    </div>
                    {net === 'testnet' && <DashboardLabel />}
                </>
            ) : dashboardState === 'connected' ? (
                <div className={styles.wrapperIcon} onClick={onConnect}>
                    <div className={styles.tooltip}>
                        <Image src={userConnected} alt="user-connected" />
                        <span className={styles.tooltiptext}>
                            <div
                                style={{
                                    fontSize: '8px',
                                }}
                            >
                                {t('CONNECTED')}
                            </div>
                        </span>
                    </div>
                    <div className={styles.txtConnected}>{t('Log in')}</div>
                </div>
            ) : (
                <div className={styles.wrapperIcon} onClick={onConnect}>
                    <Image src={userConnect} alt="user-connect" />
                    <div className={styles.txtConnect}>{t('CONNECT')}</div>
                </div>
            )}
            {showZilpay && <ZilPay />}
        </div>
    )
}

export default Component
