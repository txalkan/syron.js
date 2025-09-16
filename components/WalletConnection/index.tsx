import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './styles.module.scss'
import powerIconBlack from '../../src/assets/icons/power_icon_black.svg'
import { useTranslation } from 'next-i18next'
import useICPHook from '../../src/hooks/useICP'
import { BitcoinNetworkType } from '../../src/config/wallet'
import { useBTCWalletHook } from '../../src/hooks/useBTCWallet'
import { useWalletInfoStore } from '../../src/store/wallet_info'
import { toast } from 'react-toastify'
import WalletOptionsModal from '../Modals/WalletOptionsModal'
import WalletDropdown from '../WalletDropdown'
import {
    getUnisatTargetNetwork,
    getOKXTargetNetwork,
    parseBitcoinNetwork,
} from '../../src/config/wallet'

function Component() {
    const { updateWallet } = useBTCWalletHook()
    const { getBox } = useICPHook()
    const {
        wallet,
        setWalletType,
        setWalletAddress,
        setWalletNetwork,
        setWalletBalance,
        clearWallet,
    } = useWalletInfoStore()

    // Derive connection state from wallet address
    const isWalletConnected = !!wallet.address

    const { t } = useTranslation()

    const [unisatInstalled, setUnisatInstalled] = useState(false)
    const [okxInstalled, setOKXInstalled] = useState(false)

    // Helper functions to safely access window objects
    const getUnisat = () =>
        typeof window !== 'undefined' ? (window as any).unisat : null
    const getOkx = () =>
        typeof window !== 'undefined' ? (window as any).okxwallet : null

    useEffect(() => {
        const checkWalletInstallations = () => {
            const unisat = getUnisat()
            const okx = getOkx()

            if (unisat) {
                setUnisatInstalled(true)
                clearInterval(intervalId)
            }
            if (okx) {
                setOKXInstalled(true)
                clearInterval(intervalId)
            }
        }

        // Check for wallets every 100ms, up to 10 times
        const intervalId = setInterval(checkWalletInstallations, 100)
        setTimeout(() => clearInterval(intervalId), 1000)

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
                const unisat = getUnisat()
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
                const okx = getOkx()
                if (!okx || !okx.bitcoin) {
                    console.error('OKX wallet not available')
                    return
                }
                walletInstance = okx.bitcoin

                // Get network (OKX might have different network API)
                try {
                    if (typeof okx.bitcoin.getNetwork === 'function') {
                        const okxNetwork = await okx.bitcoin.getNetwork()
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
                accounts = await okx.bitcoin.getAccounts()

                // Get balance (OKX might have different balance API)
                if (accounts && accounts.length > 0) {
                    try {
                        // Pass address to getBalance if API supports it
                        const address = accounts[0]
                        balance = (await okx.bitcoin.getBalance()) || {
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
                } else {
                    if (typeof network === 'string' && network) {
                        setWalletNetwork(network)
                    }
                }
            } else if (typeof network === 'string' && network) {
                setWalletNetwork(network)
            }

            // Update Zustand store with wallet info
            if (accounts && accounts.length > 0) {
                const [address] = accounts
                setWalletAddress(address)

                // Update wallet balance using the latest balance value
                if (balance) {
                    const balanceAmount =
                        typeof balance === 'number' ? balance : balance.total
                    if (balanceAmount !== undefined) {
                        setWalletBalance(balanceAmount)
                        await updateWallet(
                            address,
                            balanceAmount,
                            network || BitcoinNetworkType.mainnet
                        )
                    }
                }
            } else {
                setWalletAddress('')
            }
        } catch (error) {
            console.error('Error getting wallet info:', error)
            // Don't disconnect on error, just log it
        }
    }

    const lastProcessedAddress = useRef<string | null>(null)
    useEffect(() => {
        async function updateBox() {
            if (
                wallet.address &&
                wallet.address !== lastProcessedAddress.current
            ) {
                await getBox(wallet.address)
                lastProcessedAddress.current = wallet.address
            }
        }
        if (wallet.address) updateBox()
    }, [wallet.address])

    const selfRef = useRef<{ accounts: string[] }>({
        accounts: [],
    })
    const self = selfRef.current

    // Store handler references for proper cleanup
    const unisatAccountsHandlerRef = useRef<
        ((accounts: string[]) => void) | null
    >(null)
    const okxAccountsHandlerRef = useRef<((accounts: string[]) => void) | null>(
        null
    )
    const unisatNetworkHandlerRef = useRef<(() => void) | null>(null)
    const okxNetworkHandlerRef = useRef<(() => void) | null>(null)
    const handleAccountsChanged = (
        _accounts: string[],
        walletType?: 'unisat' | 'okx'
    ) => {
        if (self.accounts[0] === _accounts[0]) {
            // prevent from triggering twice
            return
        }
        self.accounts = _accounts
        if (_accounts.length > 0) {
            setWalletAddress(_accounts[0])

            // Set wallet type if provided, otherwise keep existing type
            if (walletType) {
                setWalletType(walletType)
            }
            // If no walletType provided, keep the existing wallet.type from store

            // Call getWalletInfo with the current wallet type
            getWalletInfo(walletType || wallet.type || undefined)
        } else {
            setWalletAddress('')
            clearWallet()
        }
    }

    const [isConnecting, setIsConnecting] = useState(false)
    const [isDisconnecting, setIsDisconnecting] = useState(false)
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)

    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isUserDropdownOpen && !isDisconnecting) {
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
    }, [isUserDropdownOpen, isDisconnecting])

    const handleDisconnect = async () => {
        try {
            console.log('Disconnecting wallet...')

            // Prevent multiple clicks
            if (isDisconnecting) {
                return
            }
            setIsDisconnecting(true)

            // Use wallet-specific disconnect method
            if (wallet.type === 'unisat') {
                const unisat = getUnisat()
                if (unisat && unisat.disconnect) {
                    try {
                        await unisat.disconnect()
                        console.log('UniSat wallet disconnected via API')
                    } catch (disconnectError) {
                        console.log(
                            'UniSat disconnect API not available, using fallback'
                        )
                    }
                }
            } else if (wallet.type === 'okx') {
                const okx = getOkx()
                if (okx && okx.bitcoin && okx.bitcoin.disconnect) {
                    try {
                        await okx.bitcoin.disconnect()
                        console.log('OKX wallet disconnected via API')
                    } catch (disconnectError) {
                        console.log(
                            'OKX disconnect API not available, using fallback'
                        )
                    }
                }
            }

            // Clear wallet info from Zustand store (only once)
            clearWallet()

            // Clear wallet from store
            updateWallet('', 0, BitcoinNetworkType.mainnet)

            // Show success message
            toast.success('Wallet disconnected successfully', {
                onClick: () => toast.dismiss(),
            })

            console.log('Wallet disconnected successfully')
        } catch (error) {
            console.error('Error disconnecting wallet:', error)
            toast.error('Failed to disconnect wallet', {
                onClick: () => toast.dismiss(),
            })
        } finally {
            setIsDisconnecting(false)
        }
    }

    useEffect(() => {
        async function checkUnisat() {
            try {
                let unisatInstance = getUnisat()

                // Wait for unisat to be available
                for (let i = 1; i < 10 && !unisatInstance; i += 1) {
                    await new Promise((resolve) => setTimeout(resolve, 100 * i))
                    unisatInstance = getUnisat()
                }

                if (!unisatInstance) {
                    return
                }

                try {
                    // Create event handler functions for proper cleanup
                    const unisatAccountsHandler = (accounts: string[]) =>
                        handleAccountsChanged(accounts, 'unisat')

                    // Store handler references for cleanup
                    unisatAccountsHandlerRef.current = unisatAccountsHandler
                    const unisatNetworkHandler = () => getWalletInfo('unisat')
                    unisatNetworkHandlerRef.current = unisatNetworkHandler

                    // Set up UniSat event listeners
                    unisatInstance.on('accountsChanged', unisatAccountsHandler)
                    unisatInstance.on('networkChanged', unisatNetworkHandler)

                    return () => {
                        if (
                            unisatInstance &&
                            unisatAccountsHandlerRef.current
                        ) {
                            unisatInstance.removeListener(
                                'accountsChanged',
                                unisatAccountsHandlerRef.current
                            )
                            unisatInstance.removeListener(
                                'networkChanged',
                                unisatNetworkHandlerRef.current!
                            )
                        }
                    }
                } catch (error) {}
            } catch (error) {}
        }

        checkUnisat().catch((error) => {
            console.error('❌ Error in UniSat useEffect:', error)
        })
    }, [])

    // Setup OKX wallet listeners on component mount
    useEffect(() => {
        async function setupOKXListeners() {
            let okxInstance = getOkx()

            // Wait for OKX to be available
            for (let i = 1; i < 10 && !okxInstance; i += 1) {
                await new Promise((resolve) => setTimeout(resolve, 100 * i))
                okxInstance = getOkx()
            }

            if (!okxInstance || !okxInstance.bitcoin) {
                return
            }

            try {
                // Set up OKX wallet event listeners (if available)
                if (okxInstance.bitcoin.on) {
                    // Create event handler functions for proper cleanup
                    const okxAccountsHandler = (accounts: string[]) =>
                        handleAccountsChanged(accounts, 'okx')

                    // Store handler references for cleanup
                    okxAccountsHandlerRef.current = okxAccountsHandler
                    const okxNetworkHandler = () => getWalletInfo('okx')
                    okxNetworkHandlerRef.current = okxNetworkHandler

                    okxInstance.bitcoin.on(
                        'accountsChanged',
                        okxAccountsHandler
                    )
                    // Add network change listener for OKX if supported
                    try {
                        okxInstance.bitcoin.on(
                            'networkChanged',
                            okxNetworkHandler
                        )
                    } catch (error) {}

                    return () => {
                        if (
                            okxInstance &&
                            okxInstance.bitcoin &&
                            typeof okxInstance.bitcoin.removeListener ===
                                'function'
                        ) {
                            try {
                                okxInstance.bitcoin.removeListener(
                                    'accountsChanged',
                                    okxAccountsHandlerRef.current!
                                )
                                okxInstance.bitcoin.removeListener(
                                    'networkChanged',
                                    okxNetworkHandlerRef.current!
                                )
                            } catch (error) {}
                        }
                    }
                }
            } catch (error) {}
        }

        setupOKXListeners().catch((error) => {
            console.error('❌ Error in OKX useEffect:', error)
        })
    }, [])

    useEffect(() => {
        // Only auto-connect if wallet was connected in this tab's session
        // Don't auto-connect in new tabs for security
        // Only restore once when wallets are installed, not on every re-render
        if (wallet.address && wallet.type) {
            // Restore UniSat connection if wallet type is unisat
            if (wallet.type === 'unisat' && unisatInstalled) {
                const unisat = getUnisat()
                if (unisat) {
                    unisat
                        .getAccounts()
                        .then((accounts: string[]) => {
                            if (accounts && accounts.length > 0) {
                                handleAccountsChanged(accounts, 'unisat')
                            }
                        })
                        .catch(console.error)
                }
            }

            // Restore OKX connection if wallet type is okx
            if (wallet.type === 'okx' && okxInstalled) {
                const okx = getOkx()
                if (okx && okx.bitcoin) {
                    okx.bitcoin
                        .getAccounts()
                        .then((accounts: string[]) => {
                            if (accounts && accounts.length > 0) {
                                handleAccountsChanged(accounts, 'okx')
                            }
                        })
                        .catch(console.error)
                }
            }
        }
    }, [unisatInstalled, okxInstalled])

    // Cleanup effect for component unmount
    useEffect(() => {
        return () => {
            // Cleanup unisat listeners when component unmounts
            const unisat = getUnisat()
            if (
                unisat &&
                typeof unisat.removeListener === 'function' &&
                unisatAccountsHandlerRef.current
            ) {
                try {
                    unisat.removeListener(
                        'accountsChanged',
                        unisatAccountsHandlerRef.current
                    )
                    unisat.removeListener(
                        'networkChanged',
                        unisatNetworkHandlerRef.current!
                    )
                } catch (error) {}
            }

            // Cleanup OKX listeners when component unmounts
            const okx = getOkx()
            if (
                okx &&
                okx.bitcoin &&
                typeof okx.bitcoin.removeListener === 'function' &&
                okxAccountsHandlerRef.current
            ) {
                try {
                    okx.bitcoin.removeListener(
                        'accountsChanged',
                        okxAccountsHandlerRef.current
                    )
                    okx.bitcoin.removeListener(
                        'networkChanged',
                        okxNetworkHandlerRef.current!
                    )
                } catch (error) {}
            }
        }
    }, [])

    const handleUniSatConnect = async () => {
        try {
            // Prevent multiple clicks
            if (isConnecting) {
                return
            }
            setIsConnecting(true)

            // Check if unisat is available
            const unisat = getUnisat()
            if (!unisat) {
                toast.error(
                    'Unisat wallet not found. Please install Unisat extension.',
                    {
                        onClick: () => toast.dismiss(),
                    }
                )
                setIsConnecting(false)
                return
            }

            // Check if unisat is already connected
            const currentAccounts = await unisat.getAccounts()
            if (currentAccounts && currentAccounts.length > 0) {
                toast.info('UniSat wallet connected', {
                    onClick: () => toast.dismiss(),
                })
                handleAccountsChanged(currentAccounts, 'unisat')
                setIsConnecting(false)
                return
            }

            // Get current network
            const network = await unisat
                .getChain()
                .then((chain: { enum: any }) => chain.enum)
                .catch((error: any) => {
                    console.error('Error getting chain:', error)
                    return null
                })

            if (!network) {
                toast.error('Failed to get wallet network', {
                    onClick: () => toast.dismiss(),
                })
                return
            }

            //@network
            const target_network = getUnisatTargetNetwork()

            // Switch network if needed
            if (network !== target_network) {
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
            } else {
                if (typeof network === 'string' && network) {
                    setWalletNetwork(network)
                }
            }

            // Request accounts
            const result = await unisat.requestAccounts()
            if (result && result.length > 0) {
                // Set wallet type explicitly (keeps exclusivity super clear)
                setWalletType('unisat')
                handleAccountsChanged(result, 'unisat')
                toast.success('Your UniSat wallet is now connected', {
                    onClick: () => toast.dismiss(),
                })
            } else {
                toast.error('No accounts returned from wallet', {
                    onClick: () => toast.dismiss(),
                })
            }
        } catch (error) {
            console.error('Error connecting wallet:', error)
            toast.error('Failed to connect wallet', {
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
            const okx = getOkx()
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

            // Check if OKX wallet has bitcoin support
            if (!okx.bitcoin) {
                toast.error(
                    'OKX wallet Bitcoin support not available. Please update your OKX wallet.',
                    {
                        onClick: () => toast.dismiss(),
                    }
                )
                setIsConnecting(false)
                return
            }

            // Check if OKX wallet is already connected
            try {
                const currentAccounts = await okx.bitcoin.getAccounts()
                if (currentAccounts && currentAccounts.length > 0) {
                    toast.info('OKX wallet connected', {
                        onClick: () => toast.dismiss(),
                    })
                    handleAccountsChanged(currentAccounts, 'okx')
                    setIsConnecting(false)
                    return
                }
            } catch (error) {
                console.log(
                    'No existing OKX connection, proceeding with connection'
                )
            }

            // Request accounts from OKX wallet
            const result = await okx.bitcoin.requestAccounts()
            if (result && result.length > 0) {
                // Set wallet type explicitly (keeps exclusivity super clear)
                setWalletType('okx')
                handleAccountsChanged(result, 'okx')
                toast.success('Your OKX wallet is now connected', {
                    onClick: () => toast.dismiss(),
                })
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
        <div className={styles.wrapper}>
            <>
                {!isWalletConnected ? (
                    <button
                        className={'button primary'}
                        onClick={() => setIsWalletModalOpen(true)}
                        disabled={isConnecting}
                    >
                        {isConnecting ? t('CONNECTING...') : t('CONNECT')}
                    </button>
                ) : (
                    <div style={{ position: 'relative' }} data-user-dropdown>
                        {/* User Icon Button */}
                        <button
                            onClick={() =>
                                setIsUserDropdownOpen(!isUserDropdownOpen)
                            }
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                backgroundColor: '#f8fafc',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                minWidth: '120px',
                                justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#f1f5f9'
                                e.currentTarget.style.borderColor = '#d1d5db'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    '#f8fafc'
                                e.currentTarget.style.borderColor = '#e5e7eb'
                            }}
                        >
                            {/* User Icon */}
                            <div
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Image
                                    src={powerIconBlack}
                                    alt="Power Icon"
                                    width={24}
                                    height={24}
                                    style={{
                                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
                                    }}
                                />
                            </div>

                            {/* Wallet Type */}
                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                }}
                            >
                                {wallet.type === 'unisat'
                                    ? 'UniSat'
                                    : wallet.type === 'okx'
                                      ? 'OKX'
                                      : 'Wallet'}
                            </span>

                            {/* Dropdown Arrow */}
                            <div
                                style={{
                                    width: '0',
                                    height: '0',
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderTop: '4px solid #6b7280',
                                    transform: isUserDropdownOpen
                                        ? 'rotate(180deg)'
                                        : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                }}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        <WalletDropdown
                            isOpen={isUserDropdownOpen}
                            wallet={wallet}
                            isDisconnecting={isDisconnecting}
                            onDisconnect={handleDisconnect}
                            onClose={() => setIsUserDropdownOpen(false)}
                        />
                    </div>
                )}
            </>
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
