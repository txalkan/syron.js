import React, { createContext, useEffect, useRef, useState } from 'react'
import { useStore } from 'react-stores'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { RootState } from '../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import sunIco from '../../src/assets/icons/sun.svg'
import moonIco from '../../src/assets/icons/moon.svg'
import { UpdateIsLight } from '../../src/app/actions'
// import toastTheme from '../../src/hooks/toastTheme'
import { $menuOn } from '../../src/store/menuOn'
import { User, signIn } from '@junobuild/core-peer'
import { authSubscribe } from '@junobuild/core-peer'
import { AddressPurpose, BitcoinNetworkType, getAddress } from 'sats-connect'
import {
    $bitcoin_addresses,
    updateBitcoinAddresses,
} from '../../src/store/bitcoin-addresses'
import useICPHook from '../../src/hooks/useICP'
import { UnisatNetworkType } from '../../src/utils/unisat/httpUtils'
import { useMempoolHook } from '../../src/hooks/useMempool'
import { useBTCWalletHook } from '../../src/hooks/useBTCWallet'
import { $walletConnected, updateWalletConnected } from '../../src/store/syron'
import { toast } from 'react-toastify'

// Provide a default value appropriate for your AuthContext
const defaultValue = {
    // Define your default authentication state here
}

export const AuthContext = createContext(defaultValue)

function Component() {
    const { updateWallet } = useBTCWalletHook()
    const { getBox } = useICPHook()
    const { getXR } = useMempoolHook()

    const dispatch = useDispatch()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = loginInfo.isLight ? stylesLight : stylesDark

    const { t } = useTranslation()

    const onSignIn = () => {
        console.log('sign in')

        async function internetIdentity() {
            await signIn()
        }

        internetIdentity()
    }

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
    //                 await getBox(paymentAddressItem?.address!)
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
    useEffect(() => {
        const checkUnisatInstallation = () => {
            if ((window as any).unisat) {
                setUnisatInstalled(true)
                clearInterval(intervalId) // Clear the interval once unisat is found
            }
        }

        // Check for unisat every 100ms, up to 10 times
        const intervalId = setInterval(checkUnisatInstallation, 100)
        setTimeout(() => clearInterval(intervalId), 1000) // Stop checking after 1 second

        return () => clearInterval(intervalId) // Cleanup interval on component unmount
    }, [])

    const [accounts, setAccounts] = useState<string[]>([])
    const [publicKey, setPublicKey] = useState('')
    const [address_, setAddress] = useState('')
    const [balance_, setBalance] = useState({
        confirmed: 0,
        unconfirmed: 0,
        total: 0,
    })
    const [network_, setNetwork] = useState('livenet') //@mainnet
    const walletConnected = useStore($walletConnected).isConnected

    const getBasicInfo = async () => {
        try {
            const unisat = (window as any).unisat

            const [address] = await unisat.getAccounts()
            console.log('Wallet Address: ', address)
            setAddress(address)

            const publicKey = await unisat.getPublicKey()
            setPublicKey(publicKey)

            const balance = await unisat.getBalance()
            console.log('Wallet Balance: ', JSON.stringify(balance, null, 2))

            setBalance(balance)

            const network = await unisat.getNetwork()

            console.log('Bitcoin Network: ', network) // @mainnet
            if (network != UnisatNetworkType.mainnet) {
                await unisat.switchNetwork(UnisatNetworkType.mainnet)
            }
            setNetwork(network)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        async function update() {
            if (balance_)
                await updateWallet(
                    address_,
                    Number(balance_.confirmed),
                    network_
                ) //@review (mainnet) showcase unconfirmed too

            console.log('Wallet balance updated') // @review (wallet) no needed when connecting for the first time
        }

        if (address_ !== '') update()
    }, [address_, balance_, network_])

    useEffect(() => {
        async function updateSDB() {
            console.log('@dev update safety deposit box')
            await getBox(address_, false)
        }
        if (address_ != '') updateSDB()
    }, [address_])

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
            updateWalletConnected(true)

            setAddress(_accounts[0])

            getBasicInfo()
        } else {
            updateWalletConnected(false)
        }
    }

    const handleNetworkChanged = (network: string) => {
        setNetwork(network)
        getBasicInfo()
    }

    const [shouldCheckUnisat, setShouldCheckUnisat] = useState(false)
    useEffect(() => {
        async function checkUnisat() {
            let unisat = (window as any).unisat

            for (let i = 1; i < 10 && !unisat; i += 1) {
                await new Promise((resolve) => setTimeout(resolve, 100 * i))
                unisat = (window as any).unisat
            }

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

        if (shouldCheckUnisat) checkUnisat().then()
    }, [shouldCheckUnisat])

    const handleButtonClick = async () => {
        try {
            setShouldCheckUnisat(true)

            const network = await unisat.getNetwork()
            if (network != UnisatNetworkType.mainnet) {
                await unisat.switchNetwork(UnisatNetworkType.mainnet)
            }

            const result = await unisat.requestAccounts()
            handleAccountsChanged(result)

            toast.info('Your wallet is now connected! 🎉')
        } catch (error) {
            console.error('Error connecting wallet:', error)
            toast.error('Failed to connect wallet')
        }
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
                                {!walletConnected ? (
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
                                                    {t('CONNECT')}
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.wrapperIcon}
                                                onClick={handleButtonClick}
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
