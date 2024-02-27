import React, { createContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useStore } from 'effector-react'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { RootState } from '../../src/app/reducers'
import {
    updateModalDashboard,
    updateModalNewSsi,
    updateShowZilpay,
    // $showZilpay,
    // $dashboardState,
} from '../../src/store/modal'
// import { DashboardLabel, ZilPay } from '..'
// import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import sunIco from '../../src/assets/icons/sun.svg'
import moonIco from '../../src/assets/icons/moon.svg'
import { UpdateIsLight } from '../../src/app/actions'
// import toastTheme from '../../src/hooks/toastTheme'
import { $menuOn } from '../../src/store/menuOn'
import useArConnect from '../../src/hooks/useArConnect'
import zilpayHook from '../../src/hooks/zilpayHook'
import { User, signIn } from '@junobuild/core-peer'
import { authSubscribe } from '@junobuild/core-peer'

// Provide a default value appropriate for your AuthContext
const defaultValue = {
    // Define your default authentication state here
}

export const AuthContext = createContext(defaultValue)

function Component() {
    const dispatch = useDispatch()
    const { connect } = useArConnect()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = loginInfo.isLight ? stylesLight : stylesDark
    const menuOn = useStore($menuOn)
    const { t } = useTranslation()
    const { handleConnect } = zilpayHook()

    const onSignIn = () => {
        console.log('sign in')

        async function internetIdentity() {
            await signIn()
        }

        internetIdentity()

        // if (loginInfo.zilAddr) {
        //     updateModalDashboard(true)
        //     updateModalNewSsi(false)
        // } else {
        //     handleConnect()
        // }
        // toast.info(t('Browsing on {{net}}', { net: net }), {
        //     position: 'bottom-right',
        //     autoClose: 2000,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     progress: undefined,
        //     theme: toastTheme(loginInfo.isLight),
        //     toastId: 4,
        // })
    }

    const checkArConnect = () => {
        if (loginInfo.arAddr) {
            connect()
        }
    }

    useEffect(() => {
        if (loginInfo.zilAddr !== null) {
            updateShowZilpay(false)
        }
    }, [loginInfo.zilAddr])

    const [user, setUser] = useState<User | null>(null)
    useEffect(() => {
        const sub = authSubscribe((user) => setUser(user))

        return () => sub()
    }, [])

    if (menuOn) {
        return null
    }

    return (
        <AuthContext.Provider value={{ user }}>
            <div className={styles.wrapper}>
                {user !== undefined && user !== null ? (
                    <div>
                        {loginInfo.isLight ? (
                            <div
                                onClick={() => dispatch(UpdateIsLight(false))}
                                className={styles.toggleDark}
                            >
                                <Image
                                    width={30}
                                    src={sunIco}
                                    alt="toggle-ico"
                                />
                            </div>
                        ) : (
                            <div
                                onClick={() => dispatch(UpdateIsLight(true))}
                                className={styles.toggleLight}
                            >
                                <Image
                                    width={30}
                                    src={moonIco}
                                    alt="toggle-ico"
                                />
                            </div>
                        )}
                        {/*
                    {children}
                    <Logout />
                    */}
                    </div>
                ) : (
                    <>
                        {loginInfo.loggedInAddress && loginInfo.zilAddr ? (
                            <>
                                <div
                                    className={styles.wrapperIcon}
                                    onClick={() => {
                                        checkArConnect()
                                        onSignIn()
                                    }}
                                >
                                    <div className={styles.txtLoggedIn}>
                                        {t('LOGGED IN')}
                                    </div>
                                </div>
                                {/* {net === 'testnet' && <DashboardLabel />} */}
                            </>
                        ) : loginInfo.zilAddr ? (
                            <div
                                className={styles.wrapperIcon}
                                onClick={onSignIn}
                            >
                                <div className={styles.tooltip}>
                                    <div className={styles.txtConnected}>
                                        {t('Log in')}
                                    </div>
                                    <span className={styles.tooltiptext}>
                                        <div
                                            style={{
                                                fontSize: '8px',
                                            }}
                                        >
                                            {t(
                                                'Log in for full functionality.'
                                            )}
                                        </div>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={styles.wrapperIcon}
                                onClick={onSignIn}
                            >
                                <div className={styles.txtConnect}>
                                    {t('Sign_In')}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AuthContext.Provider>
    )
}

export default Component
