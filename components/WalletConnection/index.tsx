import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import styles from './styles.module.scss'
import connectedWalletIcon from '../../src/assets/icons/ssi_icon_key-based-wallet.svg'
import accountIcon from '../../src/assets/icons/ssi_icon_defix.svg'

import { useTranslation } from 'next-i18next'
import useICPHook from '../../src/hooks/useICP'
import { BitcoinNetworkType, getMempoolUrl } from '../../src/config/wallet'
import { useBTCWalletHook } from '../../src/hooks/useBTCWallet'
import { useWalletInfoStore } from '../../src/store/wallet_info'
import { toast } from 'react-toastify'
import { CopyButton } from '../CopyButton'
import WalletOptionsModal from '../Modals/WalletOptionsModal'
import WalletDropdown from '../WalletDropdown'
import {
    getUnisatTargetNetwork,
    getOKXTargetNetwork,
    parseBitcoinNetwork,
    getUnisatWindow,
    getOkxWindow,
} from '../../src/config/wallet'
import { Big } from '../../src/utils/big'
import { useMempoolHook } from '../../src/hooks/useMempool'
import { isMainnetSegwit } from '../../src/utils/bitcoin/segwit'

interface WalletConnectionProps {
    /**
     * When true, renders a compact call-to-action variant suitable for hero sections.
     * Dropdowns and floating positioning are disabled in this mode.
     */
    variant?: 'default' | 'hero'
    /**
     * Optional callback invoked when the hero CTA successfully opens the wallet modal.
     */
    onConnectIntent?: () => void
}

function Component(props: WalletConnectionProps) {
    const { variant = 'default', onConnectIntent } = props
    const { updateWallet } = useBTCWalletHook()
    const { getBox } = useICPHook()
    const {
        wallet,
        setWalletType,
        setWalletAddress,
        setWalletNetwork,
        setWalletBalance,
        setPublicKey,
    } = useWalletInfoStore()
    const { subscribeSdb } = useMempoolHook()

    // Derive connection state from wallet address
    const isWalletConnected = !!wallet.address

    const { t } = useTranslation()

    const [unisatInstalled, setUnisatInstalled] = useState(false)
    const [okxInstalled, setOKXInstalled] = useState(false)

    useEffect(() => {
        const checkWalletInstallations = () => {
            const unisat = getUnisatWindow()
            const okx = getOkxWindow()

            if (unisat) {
                setUnisatInstalled(true)
                // console.log('Unisat wallet installation confirmed')
            }
            if (okx) {
                setOKXInstalled(true)
                // console.log('OKX wallet installation confirmed')
            }
        }

        // Check for wallets every 100ms, up to 10 times
        const intervalId = setInterval(checkWalletInstallations, 100)
        setTimeout(() => {
            clearInterval(intervalId)
            // console.log('Wallet installation check completed')
        }, 1000)

        return () => clearInterval(intervalId)
    }, [])

    const getWalletInfo = async (walletType?: 'unisat' | 'okx') => {
        try {
            const currentWalletType = walletType || wallet.type
            if (!currentWalletType) return

            let walletInstance: any = null
            let accounts: string[] = []
            let network: string | null = null
            let balance: any = null

            if (currentWalletType === 'unisat') {
                const unisat = getUnisatWindow()
                if (!unisat) {
                    console.error('UniSat not available')
                    return
                }
                walletInstance = unisat

                // Get network
                network = await unisat
                    .getChain()
                    .then((chain: any) => chain.enum)
                // Get accounts
                accounts = await unisat.getAccounts()

                // Get balance
                if (accounts && accounts.length > 0) {
                    balance = await unisat.getBalance()
                }
            } else if (currentWalletType === 'okx') {
                const okx = getOkxWindow()
                if (!okx) {
                    console.error('OKX wallet not available')
                    return
                }
                walletInstance = okx

                // Get network (OKX might have different network API)
                try {
                    if (typeof okx.getNetwork === 'function') {
                        const okxNetwork = await okx.getNetwork()
                        network = parseBitcoinNetwork(okxNetwork)
                    } else {
                        network = getOKXTargetNetwork()
                        console.log(
                            'OKX getNetwork() not available, using default:',
                            network
                        )
                    }
                } catch (error) {
                    network = getOKXTargetNetwork()
                    console.log(
                        'OKX getNetwork() threw error, using default:',
                        network,
                        'Error:',
                        error
                    )
                }

                // Get accounts
                accounts = await okx.getAccounts()

                // Get balance (OKX might have different balance API)
                if (accounts && accounts.length > 0) {
                    try {
                        // Pass address to getBalance if API supports it
                        const address = accounts[0]
                        balance = (await okx.getBalance()) || {
                            confirmed: 0,
                            unconfirmed: 0,
                            total: 0,
                        }
                    } catch (error) {
                        console.log(
                            'OKX balance detection failed, using default'
                        )
                        balance = { confirmed: 0, unconfirmed: 0, total: 0 }
                    }
                }
            }

            // Handle network switching for UniSat (OKX might handle this differently)
            if (currentWalletType === 'unisat' && walletInstance && network) {
                const target_network = getUnisatTargetNetwork()
                if (network !== target_network) {
                    await walletInstance.switchChain(target_network)
                    if (typeof target_network === 'string' && target_network) {
                        setWalletNetwork(target_network)
                    }
                    console.log(`Switched to ${target_network}`)
                } else if (typeof network === 'string' && network) {
                    setWalletNetwork(network)
                }
            } else if (typeof network === 'string' && network) {
                setWalletNetwork(network)
            }

            // Update Zustand store with wallet info
            if (accounts && accounts.length > 0) {
                const [address] = accounts
                if (isMainnetSegwit(address)) {
                    setWalletAddress(address)
                } else {
                    toast.error(
                        'Only SegWit wallets (Native SegWit or Taproot) are supported. Please switch to a SegWit address in your wallet.',
                        {
                            onClick: () => toast.dismiss(),
                        }
                    )
                    return
                }

                // Update wallet balance using the latest balance value
                if (balance) {
                    const balanceAmount =
                        typeof balance === 'number' ? balance : balance.total
                    if (balanceAmount !== undefined) {
                        setWalletBalance(Big(balanceAmount))
                        await updateWallet(
                            address,
                            balanceAmount,
                            network || BitcoinNetworkType.mainnet
                        )
                    }
                }

                const publicKey = await walletInstance.getPublicKey()
                setPublicKey(publicKey)
            }
        } catch (error) {
            console.error('Error getting wallet info:', error)
            // Don't disconnect on error, just log it
        }
    }

    const lastProcessedAddress = useRef<string | null>(null)
    useEffect(() => {
        const address = wallet.address?.trim()

        if (!address) {
            lastProcessedAddress.current = null
            return
        }

        // Only run when the address changes.
        if (address === lastProcessedAddress.current) {
            return
        }

        let isCancelled = false
        // Save a reference to the exact getBox this run, so if the dep changes, we don't accidentally treat it as address change.
        const currentGetBox = getBox

        const updateBox = async () => {
            if (isCancelled) return
            try {
                await currentGetBox(address)
                if (!isCancelled) {
                    lastProcessedAddress.current = address
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error('Error fetching SDB address:', error)
                }
            }
        }

        updateBox()

        return () => {
            isCancelled = true
        }
        // Only depend on address; don't retrigger for getBox reference changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet.address])

    useEffect(() => {
        if (wallet.address && wallet.sdbAddress) {
            subscribeSdb()
        }
    }, [wallet.address, wallet.sdbAddress, subscribeSdb])

    const [isConnecting, setIsConnecting] = useState(false)
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

    const isHeroVariant = variant === 'hero'
    const shortAddress = wallet.sdbAddress
        ? `${wallet.sdbAddress.slice(0, 6)}…${wallet.sdbAddress.slice(-4)}`
        : ''
    const wrapperClassName = isHeroVariant ? styles.heroWrapper : styles.wrapper
    const dropdownTriggerClassName = clsx(styles.dropdownTrigger, {
        [styles.dropdownTriggerOpen]: isUserDropdownOpen,
    })

    // Close dropdown when clicking outside
    useEffect(() => {
        if (isHeroVariant) return

        const handleClickOutside = (event: MouseEvent) => {
            if (isUserDropdownOpen) {
                const target = event.target as HTMLElement
                if (!target.closest('[data-user-dropdown]')) {
                    setIsUserDropdownOpen(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isUserDropdownOpen, isHeroVariant])

    const handleUniSatConnect = async () => {
        try {
            // Prevent multiple clicks
            if (isConnecting) {
                return
            }
            setIsConnecting(true)

            // Check if unisat is available
            let unisat = getUnisatWindow()
            if (!unisat) {
                // Try waiting a bit more for the extension to load
                console.log(
                    'Unisat not found, waiting for extension to load...'
                )
                for (let i = 0; i < 5; i++) {
                    await new Promise((resolve) => setTimeout(resolve, 200))
                    unisat = getUnisatWindow()
                    if (unisat) {
                        console.log('Unisat loaded after waiting')
                        break
                    }
                }

                if (!unisat) {
                    toast.error(
                        'Unisat wallet not found. Please install Unisat extension and refresh the page.',
                        {
                            onClick: () => toast.dismiss(),
                        }
                    )
                    setIsConnecting(false)
                    return
                }
            }

            // Check if unisat is already connected
            try {
                const currentAccounts = await unisat.getAccounts()
                if (currentAccounts && currentAccounts.length > 0) {
                    setWalletType('unisat')
                    getWalletInfo('unisat')
                    setIsConnecting(false)
                    return
                }
            } catch (getAccountsError) {
                console.log(
                    'No existing connection, proceeding with connection request'
                )
            }

            // Get current network
            let network = null
            try {
                network = await unisat
                    .getChain()
                    .then((chain: { enum: any }) => chain.enum)
            } catch (error) {
                console.error('Error getting chain:', error)
                toast.error('Failed to get wallet network', {
                    onClick: () => toast.dismiss(),
                })
                return
            }

            //@network
            const target_network = getUnisatTargetNetwork()

            // Switch network if needed (only if we got network info)
            if (network && network !== target_network) {
                try {
                    await unisat.switchChain(target_network)
                    setWalletNetwork(target_network)
                    console.log(`Switched to ${target_network}`)
                } catch (switchError) {
                    console.error('Failed to switch network:', switchError)
                    toast.error('Failed to switch to required network', {
                        onClick: () => toast.dismiss(),
                    })
                    return
                }
            } else if (network) {
                if (typeof network === 'string' && network) {
                    setWalletNetwork(network)
                }
            }

            // Request accounts
            const result = await unisat.requestAccounts()
            if (result && result.length > 0) {
                setWalletType('unisat')
                getWalletInfo('unisat')
            } else {
                toast.error('No accounts returned from wallet', {
                    onClick: () => toast.dismiss(),
                })
            }
        } catch (error) {
            console.error('Error connecting wallet:', error)

            // Provide more specific error messages
            let errorMessage = 'Failed to connect wallet'
            if (error instanceof Error) {
                if (
                    error.message.includes('User rejected') ||
                    error.message.includes('user rejected')
                ) {
                    errorMessage = 'Connection rejected by user'
                } else if (
                    error.message.includes('Extension') ||
                    error.message.includes('extension')
                ) {
                    errorMessage =
                        'Please check if the UniSat extension is properly installed and enabled'
                } else if (
                    error.message.includes('popup') ||
                    error.message.includes('Popup')
                ) {
                    errorMessage = 'Please allow popups and try again'
                }
            }

            toast.error(errorMessage, {
                onClick: () => toast.dismiss(),
            })
        } finally {
            setIsConnecting(false)
        }
    }

    const handleOKXConnect = async () => {
        try {
            // Prevent multiple clicks
            if (isConnecting) {
                return
            }
            setIsConnecting(true)

            // Check if OKX wallet is available
            const okx = getOkxWindow()
            if (!okx) {
                toast.error(
                    'OKX wallet not found. Please install OKX extension.',
                    {
                        onClick: () => toast.dismiss(),
                    }
                )
                setIsConnecting(false)
                return
            }

            // Check if OKX wallet is already connected
            try {
                const currentAccounts = await okx.getAccounts()
                if (currentAccounts && currentAccounts.length > 0) {
                    setWalletType('okx')
                    getWalletInfo('okx')
                    setIsConnecting(false)
                    return
                }
            } catch (error) {
                console.log(
                    'No existing OKX connection, proceeding with connection'
                )
            }

            // Request accounts from OKX wallet
            const result = await okx.requestAccounts()
            if (result && result.length > 0) {
                setWalletType('okx')
                getWalletInfo('okx')
            } else {
                toast.error('No accounts returned from OKX wallet', {
                    onClick: () => toast.dismiss(),
                })
            }
        } catch (error) {
            console.error('Error connecting OKX wallet:', error)
            if (
                error instanceof Error &&
                error.message &&
                error.message.includes('User rejected')
            ) {
                toast.error('Connection rejected by user', {
                    onClick: () => toast.dismiss(),
                })
            } else {
                toast.error('Failed to connect OKX wallet', {
                    onClick: () => toast.dismiss(),
                })
            }
        } finally {
            setIsConnecting(false)
        }
    }

    return (
        <div className={wrapperClassName}>
            {!isWalletConnected ? (
                isHeroVariant ? (
                    <button
                        className={clsx(styles.connectButton, {
                            [styles.connectButtonHero]: true,
                            [styles.connectButtonPulse]: !isConnecting,
                        })}
                        onClick={() => {
                            if (isHeroVariant && onConnectIntent) {
                                onConnectIntent()
                            }
                            setIsWalletModalOpen(true)
                        }}
                        disabled={isConnecting}
                    >
                        {isConnecting
                            ? t('CONNECTING...')
                            : t('CONNECT WALLET')}
                    </button>
                ) : null
            ) : isHeroVariant ? (
                <div className={styles.heroConnectedCard}>
                    <Image
                        src={accountIcon}
                        alt="Account Icon"
                        width={56}
                        height={56}
                    />
                    <div className={styles.heroConnectedContent}>
                        <span className={styles.heroConnectedLabel}>
                            safety deposit ₿ox
                        </span>
                        {wallet.address && wallet.sdbAddress ? (
                            <span className={styles.heroConnectedAddress}>
                                <div className={styles.heroAddressContainer}>
                                    <div className={styles.heroAddressValue}>
                                        {shortAddress}
                                    </div>
                                    <CopyButton
                                        value={wallet.sdbAddress}
                                        copyLabel="Copy Safety Deposit ₿ox address"
                                        copiedLabel="Address copied to clipboard"
                                        onCopied={(success) => {
                                            if (success) {
                                                toast.success(
                                                    'Address copied to clipboard',
                                                    {
                                                        onClick: () =>
                                                            toast.dismiss(),
                                                    }
                                                )
                                            } else {
                                                toast.error(
                                                    'Failed to copy address',
                                                    {
                                                        onClick: () =>
                                                            toast.dismiss(),
                                                    }
                                                )
                                            }
                                        }}
                                    />
                                </div>
                                <div
                                    className={styles.inspectLink}
                                    onClick={() => {
                                        const url = getMempoolUrl(
                                            `/address/${wallet.sdbAddress}`
                                        )
                                        window.open(url)
                                    }}
                                >
                                    Inspect ↗
                                </div>
                            </span>
                        ) : (
                            <span>Loading...</span>
                        )}
                    </div>
                </div>
            ) : (
                <div
                    className={styles.dropdownTriggerWrapper}
                    data-user-dropdown
                >
                    {/* User Icon Button */}
                    <button
                        type="button"
                        className={dropdownTriggerClassName}
                        aria-haspopup="true"
                        aria-expanded={isUserDropdownOpen}
                        onClick={() =>
                            setIsUserDropdownOpen(!isUserDropdownOpen)
                        }
                    >
                        <span className={styles.dropdownTriggerGlow} />
                        <span className={styles.dropdownTriggerIcon}>
                            <Image
                                src={connectedWalletIcon}
                                alt="Connected wallet icon"
                                width={24}
                                height={24}
                            />
                        </span>
                        <span className={styles.dropdownTriggerLabel}>
                            wallet
                        </span>
                        <span
                            className={styles.dropdownTriggerCaret}
                            aria-hidden
                        />
                    </button>

                    {/* Dropdown Menu */}
                    <WalletDropdown
                        isOpen={isUserDropdownOpen}
                        wallet={wallet}
                        onClose={() => setIsUserDropdownOpen(false)}
                    />
                </div>
            )}
            <WalletOptionsModal
                isOpen={isWalletModalOpen}
                onClose={() => setIsWalletModalOpen(false)}
                onConnectUnisat={handleUniSatConnect}
                isUnisatInstalled={unisatInstalled}
                onConnectOKX={handleOKXConnect}
                isOKXInstalled={okxInstalled}
            />
        </div>
    )
}

export default Component
