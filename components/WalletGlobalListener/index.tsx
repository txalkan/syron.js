import { useEffect, useRef } from 'react'
import { useWalletInfoStore } from '../../src/store/wallet_info'
import { getUnisatWindow, getOkxWindow } from '../../src/config/wallet'
import { useWalletDisconnect } from '../../src/hooks/useWalletDisconnect'

/**
 * Global wallet event listener component that handles wallet events
 * and automatically disconnects the wallet when these events occur:
 *
 * 1. Account Change: User switches to a different account
 * 2. Disconnect App: User disconnects the app in the extension (handled via accountsChanged)
 * 3. Network Change: User switches networks in the wallet
 *
 * Note: Disconnect events are handled via accountsChanged when accounts become empty,
 * as most wallet extensions don't fire explicit disconnect events.
 *
 * This component should be mounted at the app level to ensure global coverage.
 */
export function WalletGlobalListener() {
    const { wallet } = useWalletInfoStore()
    const { disconnectWallet } = useWalletDisconnect()

    // Ref to store the last known account for OKX polling
    const lastKnownAccountRef = useRef<string | null>(null)
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const disconnectInProgressRef = useRef(false)
    const nullDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Global wallet event detection (3 event types: accountsChanged, networkChanged, lock)
    useEffect(() => {
        if (!wallet || !wallet.type || !wallet.address) {
            // Don't return immediately - we need to clean up any pending timeouts
            // The cleanup will handle stopping polling and clearing timeouts
            return
        }

        const accountsChangedHandler = (accounts: any) => {
            // EIP-1193: accounts is an array of addresses; empty array may mean locked
            const newAddr =
                Array.isArray(accounts) && accounts.length ? accounts[0] : null
            const currentAddr = wallet?.address || null

            // Only trigger disconnect if we have a current address (wallet is connected)
            if (!currentAddr) return

            if (newAddr && newAddr !== currentAddr) {
                // Case 1: Account change - user switched to a different account
                if (!disconnectInProgressRef.current) {
                    console.log(
                        '🔄 Account changed, triggering global disconnect...',
                        {
                            from: currentAddr,
                            to: newAddr,
                        }
                    )
                    disconnectInProgressRef.current = true
                    disconnectWallet('account change').finally(() => {
                        disconnectInProgressRef.current = false
                    })
                }
            } else if (!newAddr) {
                // Case 2: Disconnect - accounts became empty
                // This could also be lock, but we'll handle lock separately
                if (!disconnectInProgressRef.current) {
                    console.log(
                        '🔌 App disconnected in extension, triggering global disconnect...'
                    )
                    disconnectInProgressRef.current = true
                    disconnectWallet('app disconnect').finally(() => {
                        disconnectInProgressRef.current = false
                    })
                }
            } else {
                console.log(
                    'ℹ️ No action needed - same address or no change detected'
                )
            }
        }

        const networkChangedHandler = () => {
            // Case 3: Network change - user switched networks in the wallet
            if (!disconnectInProgressRef.current) {
                console.log('Network changed, triggering global disconnect...')
                disconnectInProgressRef.current = true
                disconnectWallet('network change').finally(() => {
                    disconnectInProgressRef.current = false
                })
            }
        }

        // Attach provider-specific listener
        let provider: any = null
        if (wallet.type === 'unisat') {
            provider = getUnisatWindow()
        } else if (wallet.type === 'okx') {
            provider = getOkxWindow()
        }

        try {
            if (provider) {
                if (typeof provider.on === 'function') {
                    provider.on('accountsChanged', accountsChangedHandler)
                    provider.on('networkChanged', networkChangedHandler)
                    console.log(
                        `✅ Global ${wallet.type} event listeners attached (on method)`
                    )
                } else if (typeof provider.addEventListener === 'function') {
                    provider.addEventListener(
                        'accountsChanged',
                        accountsChangedHandler
                    )
                    provider.addEventListener(
                        'networkChanged',
                        networkChangedHandler
                    )
                    console.log(
                        `✅ Global ${wallet.type} event listeners attached (addEventListener method)`
                    )
                } else {
                    console.warn(
                        `⚠️ ${wallet.type} provider doesn't support event listeners`
                    )
                }
            } else {
                console.warn(`⚠️ No ${wallet.type} provider found`)
            }
        } catch (e) {
            console.error(
                '❌ Error attaching global wallet event listeners:',
                e
            )
        }

        // OKX polling fallback - some versions don't fire accountsChanged reliably
        if (wallet.type === 'okx') {
            // Clear any existing polling first
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
                console.log('🔄 Clearing existing OKX polling')
            }

            lastKnownAccountRef.current = wallet.address

            const pollOKXAccounts = async () => {
                // Skip polling if disconnect is in progress
                if (disconnectInProgressRef.current) {
                    return
                }

                try {
                    const okx = getOkxWindow()
                    if (okx && typeof okx.getAccounts === 'function') {
                        const accounts = await okx.getAccounts()
                        let currentAccount =
                            accounts && accounts.length > 0 ? accounts[0] : null

                        // If we get null but had an account before, start a timeout to detect real disconnect
                        if (!currentAccount && lastKnownAccountRef.current) {
                            console.log(
                                '🔄 OKX returned null, starting disconnect detection timeout...'
                            )

                            // Stop polling immediately to prevent infinite loop
                            if (pollingIntervalRef.current) {
                                clearInterval(pollingIntervalRef.current)
                                pollingIntervalRef.current = null
                            }

                            // Clear any existing timeout
                            if (nullDetectionTimeoutRef.current) {
                                clearTimeout(nullDetectionTimeoutRef.current)
                            }

                            // Set a timeout to detect if this is a real disconnect
                            nullDetectionTimeoutRef.current = setTimeout(() => {
                                console.log(
                                    '🔌 OKX disconnect confirmed after timeout'
                                )
                                disconnectWallet('app disconnect').finally(
                                    () => {
                                        console.log('🔌 Disconnect completed')
                                        // Clean up any remaining refs
                                        if (pollingIntervalRef.current) {
                                            clearInterval(
                                                pollingIntervalRef.current
                                            )
                                            pollingIntervalRef.current = null
                                        }
                                        if (nullDetectionTimeoutRef.current) {
                                            clearTimeout(
                                                nullDetectionTimeoutRef.current
                                            )
                                            nullDetectionTimeoutRef.current =
                                                null
                                        }
                                        disconnectInProgressRef.current = false
                                    }
                                )
                            }, 3000) // Wait 3 seconds to confirm it's a real disconnect

                            return
                        }

                        // If we have a valid account, clear any pending disconnect timeout
                        if (currentAccount && nullDetectionTimeoutRef.current) {
                            clearTimeout(nullDetectionTimeoutRef.current)
                            nullDetectionTimeoutRef.current = null
                        }

                        // Only process if we have a valid current account
                        if (
                            currentAccount &&
                            lastKnownAccountRef.current &&
                            currentAccount !== lastKnownAccountRef.current &&
                            !disconnectInProgressRef.current
                        ) {
                            console.log(
                                '🔄 OKX account change detected via polling:',
                                {
                                    from: lastKnownAccountRef.current,
                                    to: currentAccount,
                                }
                            )
                            disconnectInProgressRef.current = true

                            // Stop polling immediately to prevent double triggers
                            if (pollingIntervalRef.current) {
                                clearInterval(pollingIntervalRef.current)
                                pollingIntervalRef.current = null
                                console.log(
                                    '🔄 OKX polling stopped due to account change'
                                )
                            }

                            disconnectWallet('account change').finally(() => {
                                disconnectInProgressRef.current = false
                            })
                        }

                        // Only update the last known account if we have a valid current account
                        if (currentAccount) {
                            lastKnownAccountRef.current = currentAccount
                        }
                    }
                } catch (error) {
                    console.log('OKX polling error:', error)
                }
            }

            // Poll every 2 seconds
            pollingIntervalRef.current = setInterval(pollOKXAccounts, 2000)
            console.log('🔄 OKX account polling started')
        }

        // cleanup function: remove the listener we added
        return () => {
            try {
                if (provider) {
                    if (typeof provider.removeListener === 'function') {
                        provider.removeListener(
                            'accountsChanged',
                            accountsChangedHandler
                        )
                        provider.removeListener(
                            'networkChanged',
                            networkChangedHandler
                        )
                    } else if (typeof provider.off === 'function') {
                        provider.off('accountsChanged', accountsChangedHandler)
                        provider.off('networkChanged', networkChangedHandler)
                    }
                    console.log('Global wallet event listeners cleaned up')
                }

                // Clean up OKX polling
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current)
                    pollingIntervalRef.current = null
                }

                // Clean up disconnect detection timeout only if not in progress
                if (
                    nullDetectionTimeoutRef.current &&
                    !disconnectInProgressRef.current
                ) {
                    clearTimeout(nullDetectionTimeoutRef.current)
                    nullDetectionTimeoutRef.current = null
                }

                // Reset disconnect flag
                disconnectInProgressRef.current = false
            } catch (e) {
                console.error(
                    'Error removing global wallet event listeners:',
                    e
                )
            }
        }
        // re-run when wallet type or address changes
    }, [wallet?.type, wallet?.address])

    // This component doesn't render anything - it's just for event listening
    return null
}

export default WalletGlobalListener
