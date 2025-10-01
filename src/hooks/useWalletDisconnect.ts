import { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { useWalletInfoStore } from '../store/wallet_info'
import { useBitcoinTransactionStore } from '../store/bitcoin_transactions'
import { getWalletWindow } from '../config/wallet'

/**
 * Custom hook for wallet disconnect functionality
 * Provides a reusable disconnect function that can be used across components
 */
export function useWalletDisconnect() {
    const [isDisconnecting, setIsDisconnecting] = useState(false)
    const { wallet, clearWallet } = useWalletInfoStore()
    const { clearAllTransactions } = useBitcoinTransactionStore()

    // Prevent multiple simultaneous disconnect calls
    const disconnectInProgress = useRef(false)

    const disconnectWallet = async (reason?: string) => {
        try {
            console.log(
                `Disconnecting wallet${reason ? ` - ${reason}` : ''}...`
            )

            // Prevent multiple simultaneous disconnect calls
            if (isDisconnecting || disconnectInProgress.current) {
                console.log('Disconnect already in progress, skipping...')
                return
            }

            disconnectInProgress.current = true
            setIsDisconnecting(true)

            // Remove event listeners first to prevent stale data callbacks
            const walletWindow = getWalletWindow(wallet.type)
            if (
                walletWindow &&
                typeof walletWindow.removeAllListeners === 'function'
            ) {
                try {
                    await walletWindow.removeAllListeners()
                    console.log(`${wallet.type} all event listeners removed`)
                } catch (error) {
                    console.log(
                        `${wallet.type} removeAllListeners not available:`,
                        error
                    )
                }
            }

            // Clear all app data
            clearWallet()
            clearAllTransactions()

            // Call wallet provider disconnect API
            if (walletWindow && walletWindow.disconnect) {
                try {
                    await walletWindow.disconnect()
                    console.log(`${wallet.type} wallet disconnected via API`)
                } catch (disconnectError) {
                    console.log(
                        `${wallet.type} disconnect API not available, using fallback. Error: ${disconnectError}`
                    )
                }
            }

            // Show success message
            const message = reason
                ? `Wallet disconnected due to ${reason}`
                : 'Wallet disconnected successfully'

            toast.success(message, {
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
            disconnectInProgress.current = false
        }
    }

    return {
        disconnectWallet,
        isDisconnecting,
    }
}

export default useWalletDisconnect
