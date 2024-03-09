import React, { createContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import useZilpayHook from '../../src/hooks/zilpayHook'
import { User, signIn } from '@junobuild/core-peer'
import { authSubscribe } from '@junobuild/core-peer'
import { AddressPurpose, BitcoinNetworkType, getAddress } from 'sats-connect'
import { useStore } from 'react-stores'
import {
    $bitcoin_addresses,
    updateBitcoinAddresses,
} from '../../src/store/bitcoin-addresses'
import useICPHook from '../../src/hooks/useICP'
import { updateXR } from '../../src/store/xr'

// Provide a default value appropriate for your AuthContext
const defaultValue = {
    // Define your default authentication state here
}

export const AuthContext = createContext(defaultValue)

function Component() {
    // @dev (ICP)
    const { getVault, getXR } = useICPHook()
    const dispatch = useDispatch()
    // const { connect } = useArConnect()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = loginInfo.isLight ? stylesLight : stylesDark

    const { t } = useTranslation()
    // const { handleConnect } = useZilpayHook()

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

    // const checkArConnect = () => {
    //     if (loginInfo.arAddr) {
    //         connect()
    //     }
    // }

    // useEffect(() => {
    //     if (loginInfo.zilAddr !== null) {
    //         updateShowZilpay(false)
    //     }
    // }, [loginInfo.zilAddr])

    const [user, setUser] = useState<User | null>(null)
    useEffect(() => {
        const sub = authSubscribe((user) => setUser(user))

        return () => sub()
    }, [])

    // @dev (xverse)

    // const bitcoin_addresses = useStore($bitcoin_addresses)
    // const [network, setNetwork] = useState<
    //     BitcoinNetworkType | BitcoinNetworkType.Testnet
    // >(BitcoinNetworkType.Testnet)

    // const onConnect = async () => {
    //     try {
    //         await getAddress({
    //             payload: {
    //                 purposes: [AddressPurpose.Payment, AddressPurpose.Ordinals],
    //                 message: 'Syron U$D: ₿e Your ₿ank',
    //                 network: {
    //                     type: network,
    //                 },
    //             },
    //             onFinish: async (response) => {
    //                 const paymentAddressItem = response.addresses.find(
    //                     (address) => address.purpose === AddressPurpose.Payment
    //                 )

    //                 const ordinalsAddressItem = response.addresses.find(
    //                     (address) => address.purpose === AddressPurpose.Ordinals
    //                 )

    //                 updateBitcoinAddresses({
    //                     paymentsAddress: paymentAddressItem?.address!,
    //                     paymentsPublicKey: paymentAddressItem?.publicKey!,
    //                     ordinalsAddress: ordinalsAddressItem?.address!,
    //                     ordinalsPublicKey: ordinalsAddressItem?.publicKey!,
    //                 })
    //                 await getVault(paymentAddressItem?.address!)
    //             },
    //             onCancel: () => alert('Request canceled'),
    //         })
    //     } catch (error) {
    //         alert(error)
    //     }
    // }

    // const menuOn = useStore($menuOn)
    // if (menuOn) {
    //     return null
    // }

    // @dev (xr)
    useEffect(() => {
        async function update() {
            await getXR()
        }
        update()
    }, [])

    // @dev (unisat)
    const unisat = (window as any).unisat
    const [unisatInstalled, setUnisatInstalled] = useState(false)
    const [connected, setConnected] = useState(false)
    const [accounts, setAccounts] = useState<string[]>([])
    const [publicKey, setPublicKey] = useState('')
    const [address, setAddress] = useState('')
    const [balance, setBalance] = useState({
        confirmed: 0,
        unconfirmed: 0,
        total: 0,
    })
    const [network, setNetwork] = useState('livenet')

    const getBasicInfo = async () => {
        const unisat = (window as any).unisat
        const [address] = await unisat.getAccounts()
        console.log('SSI', address)

        setAddress(address)

        const publicKey = await unisat.getPublicKey()
        setPublicKey(publicKey)

        const balance = await unisat.getBalance()
        console.log('Balance', JSON.stringify(balance, null, 2))

        setBalance(balance)

        const network = await unisat.getNetwork()
        setNetwork(network)
    }

    useEffect(() => {
        async function update() {
            await getVault(address, Number(balance.confirmed))
        }
        update()
    }, [address, balance])

    const selfRef = useRef<{ accounts: string[] }>({
        accounts: [],
    })
    const self = selfRef.current
    const handleAccountsChanged = (_accounts: string[]) => {
        if (self.accounts[0] === _accounts[0]) {
            // prevent from triggering twice
            return
        }
        self.accounts = _accounts
        if (_accounts.length > 0) {
            setAccounts(_accounts)
            setConnected(true)

            setAddress(_accounts[0])

            getBasicInfo()
        } else {
            setConnected(false)
        }
    }

    const handleNetworkChanged = (network: string) => {
        setNetwork(network)
        getBasicInfo()
    }
    useEffect(() => {
        async function checkUnisat() {
            let unisat = (window as any).unisat

            for (let i = 1; i < 10 && !unisat; i += 1) {
                await new Promise((resolve) => setTimeout(resolve, 100 * i))
                unisat = (window as any).unisat
            }

            if (unisat) {
                setUnisatInstalled(true)
            } else if (!unisat) return

            unisat.getAccounts().then((accounts: string[]) => {
                handleAccountsChanged(accounts)
            })

            unisat.on('accountsChanged', handleAccountsChanged)
            unisat.on('networkChanged', handleNetworkChanged)

            return () => {
                unisat.removeListener('accountsChanged', handleAccountsChanged)
                unisat.removeListener('networkChanged', handleNetworkChanged)
            }
        }

        checkUnisat().then()
    }, [])

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
                                    layout="responsive"
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
                                    layout="responsive"
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
                                        // checkArConnect() @review(zil-ar)
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
                            <>
                                {!connected ? (
                                    <>
                                        {!unisatInstalled ? (
                                            <div
                                                className={styles.wrapperIcon}
                                                onClick={() => {
                                                    window.open(
                                                        'https://unisat.io',
                                                        '_blank'
                                                    )
                                                }}
                                            >
                                                <div
                                                    className={
                                                        styles.txtConnect
                                                    }
                                                >
                                                    {t('Install Unisat')}
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.wrapperIcon}
                                                onClick={async () => {
                                                    const result =
                                                        await unisat.requestAccounts()
                                                    handleAccountsChanged(
                                                        result
                                                    )
                                                }}
                                            >
                                                <div
                                                    className={
                                                        styles.txtConnect
                                                    }
                                                >
                                                    {t('CONNECT')}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className={styles.wrapperIcon}>
                                        <div className={styles.txtConnected}>
                                            {t('CONNECTED')}
                                        </div>
                                    </div>
                                )}
                                {/* <div
                                    className={styles.wrapperIcon}
                                    onClick={onSignIn}
                                >
                                    <div className={styles.txtConnect}>
                                        {t('Sign_In')}
                                    </div>
                                </div> */}
                            </>
                        )}
                    </>
                )}
            </div>
        </AuthContext.Provider>
    )
}

export default Component
