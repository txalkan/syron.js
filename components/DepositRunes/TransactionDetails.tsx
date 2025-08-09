import React from 'react'
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableHeaderCell,
} from '../Table'
import { useStore } from 'react-stores'
import { $btc_wallet } from '../../src/store/syron'
import styles from './TransactionDetails.module.scss'
import refreshIco from '../../src/assets/icons/refresh.svg'
import Image from 'next/image'
import { toast } from 'react-toastify'
import toastTheme from '../../src/hooks/toastTheme'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { mempoolFeeRate } from '../../src/utils/unisat/httpUtils'
import { DepositBitcoin } from '../DepositBitcoin'

// Constants
const STABLE_DEPOSIT_THRESHOLD = 0.1
const TXN_VB = 364 // Virtual bytes for the transaction

interface TransactionDetailsProps {
    runeName: string
    depositedAmount: string
    onClose: () => void
    onConfirm: () => void
    sdbAddress: string
}

// Function to call Internet Computer deposit_syron_runes
async function depositSyronRunes(
    ssi: string,
    recommendedFee: number
): Promise<{ Ok: string[] } | { Err: any }> {
    try {
        console.log('depositSyronRunes called with:', { ssi, recommendedFee })

        // @dev throw error if fee_rate is greater than 4
        // if (recommendedFee > 2) {
        //     throw new Error('The gas fee is too high - please try again later')
        // }

        // Import the basic_bitcoin_syron declaration
        const { basic_bitcoin_syron } = await import(
            '../../src/declarations/basic_bitcoin_tyron'
        )

        const syron = basic_bitcoin_syron()

        const args = {
            ssi: ssi,
            op: { depositsyron: null },
        }

        console.log('Calling syron.deposit_syron_runes with args:', args)
        console.log('Fee parameter:', BigInt(recommendedFee * 1000))

        const result = await syron.deposit_syron_runes(
            args,
            recommendedFee * 1000
        )

        console.log('deposit_syron_runes result:', result)
        return result
    } catch (error) {
        console.error('Error calling deposit_syron_runes:', error)
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : 'No stack trace',
        })
        return { Err: error }
    }
}

export function TransactionDetails({
    runeName,
    depositedAmount,
    onClose,
    onConfirm,
    sdbAddress,
}: TransactionDetailsProps) {
    const currentAmount = parseFloat(depositedAmount)
    const availableForDeposit = Math.max(
        0,
        currentAmount - STABLE_DEPOSIT_THRESHOLD
    )
    const isDepositable = availableForDeposit > 0

    // Get wallet address from store
    const btcWallet = useStore($btc_wallet)
    const walletAddress = btcWallet?.btc_addr

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
        runesSats: number
    }>({
        hasError: false,
        requiredSats: 0,
        currentSats: 0,
        runesSats: 0,
    })

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
    const daoFee = 546
    const runeDust = 660
    const gasFeeSats =
        gasFee === 'Calculating...' || gasFee === 'Error'
            ? 0
            : parseInt(gasFee.split(' ')[0])
    const totalFee = daoFee + runeDust + gasFeeSats
    const totalFeeText = isLoadingFee ? 'Calculating...' : `${totalFee} sats`

    // Update insufficient sats error when gas fee changes
    React.useEffect(() => {
        if (insufficientSatsError.hasError) {
            const newRequiredSats = daoFee + runeDust + gasFeeSats
            setInsufficientSatsError((prev) => ({
                ...prev,
                requiredSats: newRequiredSats,
            }))
        }
    }, [gasFeeSats, insufficientSatsError.hasError])

    // Handle deposit to Tyron account
    const handleDeposit = async () => {
        if (!walletAddress || !isDepositable) {
            if (!walletAddress) {
                toast.error(
                    'Wallet not connected. Please connect your wallet first.',
                    { theme: toastTheme(isLight) }
                )
                setDepositStatus({
                    type: 'error',
                    message: 'Wallet not connected',
                })
            }
            return
        }

        setIsDepositing(true)
        setDepositStatus({ type: null, message: '' })

        try {
            console.log('Depositing runes:', walletAddress, feeRate)
            console.log('Wallet address type:', typeof walletAddress)
            console.log('Fee rate type:', typeof feeRate)

            const result = await depositSyronRunes(walletAddress, feeRate)
            // const result = { Ok: ['txId'] }
            if ('Ok' in result) {
                console.log('Deposit successful:', result.Ok)
                const successMessage = `Successfully deposited ${availableForDeposit.toFixed(2)} SUSD to your Tyron account!`
                toast.success(successMessage, { theme: toastTheme(isLight) })
                setDepositStatus({ type: 'success', message: successMessage })
                setTimeout(() => onConfirm(), 5000) // Give user time to see success message
            } else {
                console.error('Deposit failed:', JSON.stringify(result.Err))

                // Check for insufficient sats error
                let errorMessage = 'Unknown error occurred'

                // Handle CallError structure
                if (result.Err && typeof result.Err === 'object') {
                    if ('CallError' in result.Err && result.Err.CallError) {
                        errorMessage =
                            result.Err.CallError.reason || 'Call failed'
                    } else if ('message' in result.Err) {
                        errorMessage = result.Err.message
                    }
                }

                const isInsufficientSats =
                    errorMessage.includes('insufficient sats')

                if (isInsufficientSats) {
                    // Parse the error message to extract sats information
                    const satsMatch = errorMessage.match(
                        /btc deposit \((\d+)\), plus runes utxos deposit \((\d+)\), to cover sats in treasury fee \((\d+)\) and outputs utxo value \((\d+)\)/
                    )

                    if (satsMatch) {
                        const [, btcSats, runesSats, treasuryFee, utxoValue] =
                            satsMatch.map(Number)
                        const requiredSats =
                            treasuryFee + utxoValue + gasFeeSats

                        setInsufficientSatsError({
                            hasError: true,
                            requiredSats,
                            currentSats: btcSats,
                            runesSats,
                        })

                        const guidanceMessage = `Insufficient BTC to cover fees. You need ${requiredSats} sats but have ${btcSats + runesSats} sats. Please deposit at least ${requiredSats - btcSats - runesSats} sats to your SDB address.`
                        toast.error(guidanceMessage, {
                            theme: toastTheme(isLight),
                        })
                        setDepositStatus({
                            type: 'error',
                            message: guidanceMessage,
                        })
                    } else {
                        toast.error(`Deposit failed: ${errorMessage}`, {
                            theme: toastTheme(isLight),
                        })
                        setDepositStatus({
                            type: 'error',
                            message: `Deposit failed: ${errorMessage}`,
                        })
                    }
                } else {
                    toast.error(`Deposit failed: ${errorMessage}`, {
                        theme: toastTheme(isLight),
                    })
                    setDepositStatus({
                        type: 'error',
                        message: `Deposit failed: ${errorMessage}`,
                    })
                }
            }
        } catch (error) {
            console.error('Error during deposit:', error)
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
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h3 className={styles.title}>
                        Deposit Details for {runeName}
                    </h3>
                    <div className={styles.titleSubtitle}>
                        Review your deposited amount and available balance
                    </div>
                </div>
                <div className={styles.amountDisplay}>
                    <div className={styles.amountSection}>
                        <div className={styles.amountInfo}>
                            <span className={styles.amountLabel}>
                                Current Deposit
                            </span>
                            <span className={styles.amountDescription}>
                                Total amount in your SDB
                            </span>
                        </div>
                        <span className={styles.currentAmount}>
                            {currentAmount.toFixed(2)} SUSD
                        </span>
                    </div>
                    <div className={styles.amountSection}>
                        <div className={styles.amountInfo}>
                            <span className={styles.amountLabel}>
                                Stable Deposit
                            </span>
                            <span className={styles.amountDescription}>
                                Minimum balance to maintain
                            </span>
                        </div>
                        <span className={styles.stableAmount}>
                            {STABLE_DEPOSIT_THRESHOLD.toFixed(2)} SUSD
                        </span>
                    </div>
                    <div className={styles.amountSection}>
                        <div className={styles.amountInfo}>
                            <span className={styles.amountLabel}>
                                Available for Deposit
                            </span>
                            <span className={styles.amountDescription}>
                                Amount you can deposit to Tyron
                            </span>
                        </div>
                        <span
                            className={`${styles.availableAmount} ${isDepositable ? styles.depositable : styles.notDepositable}`}
                        >
                            {availableForDeposit.toFixed(2)} SUSD
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.feeBreakdown}>
                <div className={styles.feeHeader}>
                    <h4 className={styles.feeTitle}>Cost Breakdown</h4>
                    <div className={styles.feeSubtitle}>
                        Transaction fees and costs
                    </div>
                </div>
                <div className={styles.feeTableContainer}>
                    <Table className={styles.feeTable}>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Type</TableHeaderCell>
                                <TableHeaderCell>Amount</TableHeaderCell>
                                <TableHeaderCell>Description</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <div className={styles.feeType}>
                                        <div className={styles.feeIcon}>
                                            <svg
                                                width="12"
                                                height="12"
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
                                                <path
                                                    d="M9 12l2 2 4-4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <span>DAO Fee</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={styles.feeAmount}>
                                        {daoFee} sats
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={styles.feeDescription}>
                                        Protocol governance fee
                                    </span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <div className={styles.feeType}>
                                        <div className={styles.feeIcon}>
                                            <svg
                                                width="12"
                                                height="12"
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
                                                <path
                                                    d="M9 12l2 2 4-4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <span>Rune Dust</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={styles.feeAmount}>
                                        {runeDust} sats
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={styles.feeDescription}>
                                        Minimum UTXO requirement
                                    </span>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <div className={styles.feeType}>
                                        <div className={styles.feeIcon}>
                                            <svg
                                                width="12"
                                                height="12"
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
                                                <path
                                                    d="M9 12l2 2 4-4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <span>Gas Fee</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className={styles.gasFeeContainer}>
                                        <span className={styles.feeAmount}>
                                            {gasFee}
                                        </span>
                                        <button
                                            onClick={handleRefreshFee}
                                            disabled={isLoadingFee}
                                            className={styles.refreshButton}
                                            title="Refresh gas fee"
                                        >
                                            {isLoadingFee ? (
                                                <div
                                                    className={
                                                        styles.refreshSpinner
                                                    }
                                                ></div>
                                            ) : (
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M1 4v6h6"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M23 20v-6h-6"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                    <path
                                                        d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={styles.feeDescription}>
                                        {TXN_VB} vb × current gas rate (
                                        {feeRate} sats/vb)
                                    </span>
                                </TableCell>
                            </TableRow>
                            <TableRow className={styles.totalRow}>
                                <TableCell>
                                    <div className={styles.feeType}>
                                        <div className={styles.feeIcon}>
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    fill="currentColor"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                                <path
                                                    d="M9 12l2 2 4-4"
                                                    stroke="white"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <strong>Total</strong>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <strong className={styles.totalAmount}>
                                        {totalFeeText}
                                    </strong>
                                </TableCell>
                                <TableCell>
                                    <span className={styles.feeDescription}>
                                        Sum of all fees
                                    </span>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className={styles.actions}>
                <button className={styles.backButton} onClick={onClose}>
                    Go Back
                </button>
                <button
                    className={`${styles.confirmButton} ${!isDepositable ? styles.disabled : ''}`}
                    onClick={handleDeposit}
                    disabled={!isDepositable || isDepositing}
                >
                    {isDepositing
                        ? 'Depositing...'
                        : isDepositable
                          ? 'Deposit to Tyron Account'
                          : 'No Funds Available'}
                </button>
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

            {/* Insufficient Sats Guidance */}
            {insufficientSatsError.hasError && (
                <div className={styles.insufficientSatsGuidance}>
                    <div className={styles.guidanceHeader}>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                fill="currentColor"
                            />
                        </svg>
                        <span>BTC Deposit Required</span>
                    </div>
                    <div className={styles.guidanceContent}>
                        <p>
                            You need to deposit BTC to cover transaction fees:
                        </p>
                        <div className={styles.satsBreakdown}>
                            <div className={styles.satsItem}>
                                <span>Required:</span>
                                <span className={styles.satsValue}>
                                    {insufficientSatsError.requiredSats} sats
                                </span>
                            </div>
                            <div className={styles.satsItem}>
                                <span>Current BTC:</span>
                                <span className={styles.satsValue}>
                                    {insufficientSatsError.currentSats} sats
                                </span>
                            </div>
                            <div className={styles.satsItem}>
                                <span>Current Rune Dust:</span>
                                <span className={styles.satsValue}>
                                    {insufficientSatsError.runesSats} sats
                                </span>
                            </div>
                            <div className={styles.satsItem}>
                                <span>Missing:</span>
                                <span
                                    className={`${styles.satsValue} ${styles.missing}`}
                                >
                                    {insufficientSatsError.requiredSats -
                                        insufficientSatsError.currentSats -
                                        insufficientSatsError.runesSats}{' '}
                                    sats
                                </span>
                            </div>
                        </div>
                        <div className={styles.sdbAddressSection}>
                            <p>Send BTC to your SDB address:</p>
                            <div className={styles.sdbAddressContainer}>
                                <code className={styles.sdbAddress}>
                                    {sdbAddress || 'Loading...'}
                                </code>
                                <button
                                    onClick={() => {
                                        if (sdbAddress) {
                                            navigator.clipboard.writeText(
                                                sdbAddress
                                            )
                                            toast.success(
                                                'SDB address copied to clipboard!',
                                                { theme: toastTheme(isLight) }
                                            )
                                        }
                                    }}
                                    className={styles.copyButton}
                                    title="Copy SDB address"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect
                                            x="9"
                                            y="9"
                                            width="13"
                                            height="13"
                                            rx="2"
                                            ry="2"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                        <path
                                            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className={styles.depositButtonContainer}>
                                <DepositBitcoin
                                    sdbAddress={sdbAddress}
                                    btcAmount={
                                        insufficientSatsError.requiredSats -
                                        insufficientSatsError.currentSats -
                                        insufficientSatsError.runesSats
                                    }
                                    onSuccess={(txId) => {
                                        // Refresh the gas fee calculation after deposit
                                        setTimeout(() => {
                                            calculateGasFee()
                                        }, 2000)
                                    }}
                                    onError={(error) => {
                                        console.error(
                                            'Deposit Bitcoin error:',
                                            error
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
