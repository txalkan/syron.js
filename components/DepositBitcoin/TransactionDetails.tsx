import React from 'react'
import { useStore } from 'react-stores'
import { $syron } from '../../src/store/syron'
import { useWalletInfoStore } from '../../src/store/wallet_info'
import styles from './TransactionDetails.module.scss'
import { toast } from 'react-toastify'
import toastTheme from '../../src/hooks/toastTheme'
import { mempoolFeeRate, unisatBalance } from '../../src/utils/unisat/httpUtils'

const TXN_VB = 364 // Virtual bytes for the transaction

interface TransactionDetailsProps {
    collateralAmount: Big
    feeAmount: Big
    sdbAddress: string
    onConfirm?: () => void
}

export function TransactionDetails({
    collateralAmount,
    feeAmount,
    onConfirm,
}: TransactionDetailsProps) {
    const totalDeposit = collateralAmount.add(feeAmount)

    // Get wallet address from store
    const { wallet } = useWalletInfoStore()

    // Get syron store
    const syron = useStore($syron)

    // Get theme from Redux store
    const isLight = true //useSelector((state: RootState) => state.modal.isLight)

    // State for gas fee calculation
    const [gasFee, setGasFee] = React.useState<string>('Calculating...')
    const [isLoadingFee, setIsLoadingFee] = React.useState(true)
    const [feeRate, setFeeRate] = React.useState<number>(0)
    const [isDepositing, setIsDepositing] = React.useState(false)
    const [depositStatus, setDepositStatus] = React.useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })
    const [insufficientSatsError, setInsufficientSatsError] = React.useState<{
        hasError: boolean
        requiredSats: number
        currentSats: number
    }>({
        hasError: false,
        requiredSats: 0,
        currentSats: 0,
    })

    // Calculate the required amounts once to avoid repetition
    const missingAmount = React.useMemo(() => {
        return (
            insufficientSatsError.requiredSats -
            insufficientSatsError.currentSats
        )
    }, [insufficientSatsError.requiredSats, insufficientSatsError.currentSats])

    const isFeeTooHigh = React.useMemo(() => {
        return missingAmount > 2999
    }, [missingAmount])

    // Fetch gas fee on component mount
    React.useEffect(() => {
        calculateGasFee()
    }, [])

    // Function to calculate gas fee
    async function calculateGasFee() {
        setIsLoadingFee(true)
        try {
            const rate = await mempoolFeeRate()

            setFeeRate(rate)
            const feeSats = TXN_VB * rate
            setGasFee(`${feeSats} sats`)
        } catch (error) {
            console.error('Error calculating gas fee:', error)
            setGasFee('Error')
        } finally {
            setIsLoadingFee(false)
        }
    }

    // Function to refresh gas fee
    const handleRefreshFee = async () => {
        console.log('Refresh button clicked!')
        await calculateGasFee()
    }

    // Calculate total fee
    const gasFeeSats =
        gasFee === 'Calculating...' || gasFee === 'Error'
            ? 0
            : parseInt(gasFee.split(' ')[0])
    const totalFee = gasFeeSats
    const totalFeeText = isLoadingFee ? 'Calculating...' : `${totalFee} sats`

    // Check for insufficient sats when component loads or gas fee changes
    React.useEffect(() => {
        const checkInsufficientSats = async () => {
            if (syron && gasFeeSats > 0) {
                const requiredSats = gasFeeSats

                const currentDeposit = await unisatBalance(syron.sdb)
                const currentCollateral = syron?.syron_btc
                    ? Number(syron.syron_btc)
                    : 0
                const currentSats = currentDeposit - currentCollateral

                console.log('Sats Debug Info:', {
                    requiredSats,
                    currentDeposit,
                    currentCollateral,
                    currentSats,
                    gasFeeSats,
                    hasInsufficientFunds: currentSats < requiredSats,
                })

                if (currentSats < requiredSats) {
                    setInsufficientSatsError({
                        hasError: true,
                        requiredSats,
                        currentSats,
                    })
                } else {
                    setInsufficientSatsError({
                        hasError: false,
                        requiredSats: 0,
                        currentSats: 0,
                    })
                }
            }
        }

        checkInsufficientSats()
    }, [gasFeeSats, syron])

    // Handle deposit - Send PSBT
    const handleDeposit = React.useCallback(async () => {
        if (!wallet.address) {
            toast.error(
                'Wallet not connected. Please connect your wallet first.',
                { theme: toastTheme(isLight) }
            )
            setDepositStatus({
                type: 'error',
                message: 'Wallet not connected',
            })
            return
        }

        setIsDepositing(true)
        setDepositStatus({ type: null, message: '' })

        try {
            console.log('Sending PSBT for deposit:', {
                walletAddress: wallet.address,
                collateralAmount,
                feeAmount,
                feeRate: feeRate,
            })

            // Check if Unisat wallet is available
            const unisat = (window as any).unisat
            if (!unisat) {
                throw new Error(
                    'Unisat wallet not found. Please install Unisat wallet.'
                )
            }

            // Convert collateral amount to sats
            // Create PSBT for deposit
            console.log('Creating PSBT with:', {
                collateralAmount,
                feeAmount,
                feeRate: feeRate,
            })

            // Simulate PSBT signing and broadcasting
            // In real implementation, this would be:
            // const psbt = await createPSBT(...)
            // const signedPsbt = await unisat.signPsbt(psbt)
            // const txId = await unisat.pushPsbt(signedPsbt)

            await new Promise((resolve) => setTimeout(resolve, 3000))
            const mockTxId = 'mock_tx_id_' + Date.now()

            const successMessage = `Successfully deposited ${totalDeposit.div(1e8).round(8, 0).toString()} BTC as collateral! Transaction ID: ${mockTxId}`
            toast.success(successMessage, { theme: toastTheme(isLight) })
            setDepositStatus({ type: 'success', message: successMessage })
        } catch (error) {
            console.error('Error during PSBT deposit:', error)
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred'
            toast.error(`Deposit error: ${errorMessage}`, {
                theme: toastTheme(isLight),
            })
            setDepositStatus({
                type: 'error',
                message: `Error: ${errorMessage}`,
            })
        } finally {
            setIsDepositing(false)
        }
    }, [wallet.address, totalDeposit, feeRate])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSubtitle}>
                        Review your collateral amount and transaction fees
                    </div>
                </div>
                <div className={styles.amountDisplay}>
                    <div className={styles.amountSection}>
                        <div className={styles.amountInfo}>
                            <span className={styles.amountLabel}>
                                Collateral Amount
                            </span>
                            <span className={styles.amountDescription}>
                                Bitcoin to be deposited as collateral
                            </span>
                        </div>
                        <div className={styles.amountValue}>
                            <div className={styles.amountWithLogo}>
                                <span className={styles.amount}>
                                    {collateralAmount
                                        .div(1e8)
                                        .round(8, 0)
                                        .toString()}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={styles.bitcoinIcon}
                                >
                                    <path
                                        d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.362c6.43 1.605 10.342 8.115 8.738 14.542z"
                                        fill="#f7931a"
                                    />
                                    <path
                                        d="M17.464 9.546c.26-1.763-.999-2.704-2.696-3.333l.55-2.207-1.344-.334-.536 2.15c-.354-.088-.717-.171-1.078-.253l.539-2.16-1.344-.334-.55 2.206c-.293-.067-.58-.132-.86-.2l.001-.007-1.853-.462-.357 1.433s.999.23.977.244c.545.136.643.497.627.784l-1.508 6.047c-.037.093-.131.232-.343.179.007.01-.978-.244-.978-.244l-.669 1.51 1.752.436c.326.081.644.165.958.24l-.562 2.253 1.343.334.554-2.22c.37.1.726.192 1.073.278l-.553 2.217 1.344.334.562-2.25c2.295.434 4.02.259 4.747-1.815.591-1.675-.029-2.641-1.249-3.27.889-.205 1.558-.79 1.737-2.001zm-3.006 4.219c-.42 1.685-3.264.866-4.185.61l.747-2.993c.92.229 3.872.68 3.438 2.383zm.42-4.242c-.383 1.537-2.749.758-3.516.565l.676-2.708c.767.191 3.24.549 2.84 2.143z"
                                        fill="#fff"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className={styles.amountSection}>
                        <div className={styles.amountInfo}>
                            <span className={styles.amountLabel}>
                                Fee Amount
                            </span>
                            <span className={styles.amountDescription}>
                                To cover Safety Deposit ₿ox transaction fees
                            </span>
                        </div>
                        <div className={styles.amountValue}>
                            <div className={styles.amountWithLogo}>
                                <span className={styles.amount}>
                                    {feeAmount.div(1e8).round(8, 0).toString()}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={styles.bitcoinIcon}
                                >
                                    <path
                                        d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.362c6.43 1.605 10.342 8.115 8.738 14.542z"
                                        fill="#f7931a"
                                    />
                                    <path
                                        d="M17.464 9.546c.26-1.763-.999-2.704-2.696-3.333l.55-2.207-1.344-.334-.536 2.15c-.354-.088-.717-.171-1.078-.253l.539-2.16-1.344-.334-.55 2.206c-.293-.067-.58-.132-.86-.2l.001-.007-1.853-.462-.357 1.433s.999.23.977.244c.545.136.643.497.627.784l-1.508 6.047c-.037.093-.131.232-.343.179.007.01-.978-.244-.978-.244l-.669 1.51 1.752.436c.326.081.644.165.958.24l-.562 2.253 1.343.334.554-2.22c.37.1.726.192 1.073.278l-.553 2.217 1.344.334.562-2.25c2.295.434 4.02.259 4.747-1.815.591-1.675-.029-2.641-1.249-3.27.889-.205 1.558-.79 1.737-2.001zm-3.006 4.219c-.42 1.685-3.264.866-4.185.61l.747-2.993c.92.229 3.872.68 3.438 2.383zm.42-4.242c-.383 1.537-2.749.758-3.516.565l.676-2.708c.767.191 3.24.549 2.84 2.143z"
                                        fill="#fff"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className={styles.totalAmountSection}>
                        <div className={styles.totalAmountInfo}>
                            <div className={styles.totalAmountLabel}>
                                Total Deposit
                            </div>
                            <div className={styles.totalAmountDescription}>
                                Total BTC needed for this transaction
                            </div>
                        </div>
                        <div className={styles.totalAmountValue}>
                            <span className={styles.totalAmount}>
                                {totalDeposit.div(1e8).round(8, 0).toString()}{' '}
                                BTC
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Display */}
            {depositStatus.type && (
                <div
                    className={`${styles.statusMessage} ${styles[depositStatus.type]}`}
                >
                    <div className={styles.statusIcon}>
                        {depositStatus.type === 'success' ? (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        ) : (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <line
                                    x1="15"
                                    y1="9"
                                    x2="9"
                                    y2="15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <line
                                    x1="9"
                                    y1="9"
                                    x2="15"
                                    y2="15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                            </svg>
                        )}
                    </div>
                    <span className={styles.statusText}>
                        {depositStatus.message}
                    </span>
                </div>
            )}

            {/* Fee Too High Error */}
            {isFeeTooHigh && (
                <div className={styles.feeTooHighError}>
                    <div className={styles.errorHeader}>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                fill="#dc2626"
                            />
                        </svg>
                        <span>Fee Too High</span>
                    </div>
                    <div className={styles.errorContent}>
                        <p>
                            Please try again later when network fees are lower.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
