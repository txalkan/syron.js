import React from 'react'
import { toast } from 'react-toastify'
import toastTheme from '../../src/hooks/toastTheme'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { mempoolFeeRate } from '../../src/utils/unisat/httpUtils'
import styles from './styles.module.scss'

interface DepositBitcoinProps {
    sdbAddress: string
    btcAmount: number // in sats
    onSuccess?: (txId: string) => void
    onError?: (error: Error) => void
    disabled?: boolean
    className?: string
}

export function DepositBitcoin({
    sdbAddress,
    btcAmount,
    onSuccess,
    onError,
    disabled = false,
    className = '',
}: DepositBitcoinProps) {
    // Get theme from Redux store
    const isLight = true //useSelector((state: RootState) => state.modal.isLight)

    const handleDeposit = async () => {
        if (!sdbAddress) {
            const error = new Error('SDB address not available')
            toast.error('SDB address not available. Please try again.', {
                theme: toastTheme(isLight),
            })
            onError?.(error)
            return
        }

        const unisat = (window as any).unisat
        if (!unisat) {
            const error = new Error('Unisat wallet not found')
            toast.error(
                'UniSat wallet extension is required. Please install Unisat and try again.',
                {
                    theme: toastTheme(isLight),
                }
            )
            onError?.(error)
            return
        }

        try {
            // Get current fee rate
            const feeRate = await mempoolFeeRate()

            toast.info(
                `Preparing Bitcoin deposit of ${(Number(btcAmount) / 100000000).toFixed(8)} BTC...`,
                {
                    theme: toastTheme(isLight),
                    autoClose: false,
                    closeOnClick: true,
                    toastId: 'bitcoin-deposit',
                }
            )

            // Send Bitcoin using Unisat
            const txId = await unisat.sendBitcoin(
                sdbAddress,
                btcAmount,
                feeRate
            )

            // Dismiss the info toast
            toast.dismiss('bitcoin-deposit')

            toast.success(
                `Bitcoin deposit submitted successfully! Transaction ID: ${txId.slice(0, 8)}...${txId.slice(-8)}`,
                {
                    theme: toastTheme(isLight),
                    autoClose: 5000,
                }
            )

            // Call success callback
            onSuccess?.(txId)
        } catch (error) {
            // Dismiss the info toast
            toast.dismiss('bitcoin-deposit')

            console.error('Error sending Bitcoin:', error)
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'

            // Provide more specific error messages
            let userFriendlyMessage = 'Failed to send Bitcoin deposit'
            if (errorMessage.includes('insufficient')) {
                userFriendlyMessage =
                    'Insufficient Bitcoin balance in your wallet'
            } else if (errorMessage.includes('network')) {
                userFriendlyMessage =
                    'Network error. Please check your connection and try again'
            } else if (errorMessage.includes('user rejected')) {
                userFriendlyMessage = 'Transaction was cancelled by user'
            } else if (errorMessage.includes('fee')) {
                userFriendlyMessage = 'Fee calculation error. Please try again'
            }

            toast.error(`${userFriendlyMessage}. Please try again.`, {
                theme: toastTheme(isLight),
                autoClose: 5000,
            })
            onError?.(error instanceof Error ? error : new Error(errorMessage))
        }
    }

    return (
        <button
            onClick={handleDeposit}
            className={`${styles.depositBitcoinButton} ${className}`}
            disabled={disabled || !sdbAddress}
            title={`Deposit BTC to your SDB address`}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    fill="currentColor"
                />
            </svg>
            Deposit Bitcoin
        </button>
    )
}
