'use client'

import React from 'react'
import { Button } from '../Button'
import { TransactionDetails } from './TransactionDetails'
import LoadingSpinner from '../LoadingSpinner'
import styles from './styles.module.scss'
import gstyles from '../global.module.scss'
import { SyronForm } from '../syron-102'
import { Big, _0 } from '../../src/utils/big'
import { InputAmount } from './InputAmount'
import { useDepositPsbt } from '../../src/utils/bitcoin/deposit-psbt'
import { toast } from 'react-toastify'
import { mempoolFeeRate } from '../../src/utils/bitcoin/mempool'
import { CopyButton } from '../CopyButton'

// Constants
const start_pair = [
    {
        value: _0,
        meta: {
            name: 'Bitcoin',
            symbol: 'BTC',
            decimals: 8,
        },
    },
    {
        value: _0,
        meta: {
            name: 'Syron SUSD',
            symbol: 'Syron SUSD',
            decimals: 8,
        },
    },
]

type StateType = [boolean, () => void, () => void, () => void] & {
    state: boolean
    open: () => void
    close: () => void
    toggle: () => void
}

const useToggleState = (initial = false) => {
    const [state, setState] = React.useState<boolean>(initial)

    const close = () => {
        setState(false)
    }

    const open = () => {
        setState(true)
    }

    const toggle = () => {
        setState((state) => !state)
    }

    const hookData = [state, open, close, toggle] as StateType
    hookData.state = state
    hookData.open = open
    hookData.close = close
    hookData.toggle = toggle
    return hookData
}

interface DepositProps {
    open: boolean
    onClose: () => void
    sdbAddress?: string
}

export function DepositBTC({ open, onClose, sdbAddress }: DepositProps) {
    // Initialize the PSBT utility
    const { createDeposit } = useDepositPsbt()

    const [isLoadingFee, setIsLoadingFee] = React.useState(true)
    const [feeRate, setFeeRate] = React.useState<number>(0)
    const [confirmOpen, showConfirm, closeConfirm] = useToggleState()
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [inputAmt, setInputAmount] = React.useState<string>('2999')
    const [feeAmount, setFeeAmount] = React.useState<Big>(_0)
    const [collateralAmount, setCollateralAmount] = React.useState<Big>(_0)
    const [isFeeTooHigh, setIsFeeTooHigh] = React.useState(false)

    // Function to update gas fee
    const getGasFee = React.useCallback(async () => {
        setIsLoadingFee(true)
        try {
            const rate = await mempoolFeeRate()
            setFeeRate(rate)
            if (rate === 0) {
                setIsFeeTooHigh(true)
            } else {
                setIsFeeTooHigh(false)
            }
        } catch (error) {
            console.error('Error calculating gas fee:', error)
        } finally {
            setIsLoadingFee(false)
        }
    }, [])

    // Fetch gas fee on component mount and set up automatic polling
    React.useEffect(() => {
        if (!open) return // Don't poll if modal is closed

        // Fetch immediately
        getGasFee()

        // Set up polling every 60 seconds (same as exchange rate polling)
        const pollInterval = setInterval(() => {
            getGasFee()
        }, 60000) // 60 seconds

        return () => {
            clearInterval(pollInterval)
        }
    }, [open, getGasFee])

    // Function to refresh gas fee
    const handleRefreshFee = async () => {
        await getGasFee()
    }

    // Validation logic
    const isValidFeeAmount = React.useMemo(() => {
        return (
            Number(feeAmount) >= 1000 &&
            Number(feeAmount) <= 2999 &&
            !isFeeTooHigh
        )
    }, [feeAmount, isFeeTooHigh])

    const isValidCollateralAmount = React.useMemo(() => {
        const minCollateralSats = 3000
        return collateralAmount.gte(minCollateralSats)
    }, [collateralAmount])

    const canContinue = React.useMemo(() => {
        return isValidFeeAmount && isValidCollateralAmount
    }, [isValidFeeAmount, isValidCollateralAmount])

    // Handle amount changes from SyronForm component
    const handleCollateralAmountChange = React.useCallback((amount: Big) => {
        // Use Big's RoundingMode enum for the round method
        const collateral = amount.round(0, Big.roundDown)
        //console.log(`collateral amount ${collateral} sats`)
        setCollateralAmount(collateral)
    }, [])

    // Handle fee amount validation changes
    const handleFeeValidationChange = React.useCallback((amount: number) => {
        setFeeAmount(Big(amount))
    }, [])

    const onContinue = () => {
        showConfirm()
    }

    const handleConfirm = async () => {
        if (!sdbAddress) {
            setError('SDB address is required')
            return
        }

        setError(null)
        setIsLoading(true)

        try {
            console.log(
                'Confirming deposit:',
                JSON.stringify(
                    {
                        collateralAmount,
                        feeAmount,
                        sdbAddress,
                    },
                    null,
                    2
                )
            )

            // Create and sign the deposit PSBT
            const result = await createDeposit({
                collateralAmount: BigInt(collateralAmount.toString()),
                feeAmount: BigInt(feeAmount.toString()),
                sdbAddress,
            })

            if (result.success) {
                console.log('Deposit PSBT created successfully:', result.txId)
                // TODO: Handle success (maybe show success message, redirect, etc.)
                onClose()
            } else {
                console.error('Failed to create deposit PSBT:', result.error)
                setError(result.error || 'Failed to create deposit transaction')

                toast.error(
                    result.error || 'Failed to create deposit transaction'
                )
            }
        } catch (error) {
            console.error('Error in handleConfirm:', error)
            setError(
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred'
            )
        } finally {
            setIsLoading(false)
        }
    }

    if (!open) return null

    return (
        <div className={styles.container} onClick={onClose}>
            <div
                className={styles.drawerContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.drawerHeader}>
                    <h3>
                        {confirmOpen
                            ? 'Confirm BTC Deposit'
                            : 'Deposit Bitcoin'}
                    </h3>
                    <div className={styles.headerActions}>
                        <span onClick={onClose}>&times;</span>
                    </div>
                </div>
                <div className={styles.drawerBody}>
                    {error && (
                        <div className={styles.errorMessage}>
                            <span style={{ color: '#ef4444' }}>⚠️ {error}</span>
                        </div>
                    )}
                    {confirmOpen ? (
                        <TransactionDetails
                            collateralAmount={collateralAmount}
                            feeAmount={feeAmount}
                            feeRate={feeRate}
                        />
                    ) : (
                        <>
                            <SyronForm
                                type="DepositBTC"
                                startPair={start_pair}
                                onCollateralAmountChange={
                                    handleCollateralAmountChange
                                }
                            />
                            <label htmlFor="deposit" className={styles.label}>
                                btc for fees
                            </label>
                            <div className={styles.gasFeeMeta}>
                                <span className={styles.gasFeeLabel}>
                                    Miner fee rate
                                </span>
                                <div className={styles.gasFeeContainer}>
                                    <span className={styles.gasFeeValue}>
                                        {isLoadingFee
                                            ? 'Refreshing…'
                                            : feeRate === 0
                                              ? 'Too High'
                                              : feeRate === 1
                                                ? `${feeRate} sat/vB`
                                                : `${feeRate} sats/vB`}
                                    </span>
                                    <button
                                        onClick={handleRefreshFee}
                                        disabled={isLoadingFee}
                                        className={styles.refreshButton}
                                        title="Refresh network fee"
                                        type="button"
                                    >
                                        {isLoadingFee ? (
                                            <LoadingSpinner size="md" />
                                        ) : (
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 18 18"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M1 3v4h4"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M17 15v-4h-4"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M15.37 6.75A6.75 6.75 0 0 0 4.23 4.23L1 7.5m16 3.5-3.23 3.02A6.75 6.75 0 0 1 2.63 11.25"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <InputAmount
                                min={1000}
                                max={2999}
                                value={inputAmt}
                                onChange={setInputAmount}
                                isFeeTooHigh={isFeeTooHigh}
                                unit="sats"
                                onValidationChange={handleFeeValidationChange}
                            />

                            {/* Validation Status */}
                            <div className={styles.validationStatus}>
                                <div className={styles.validationItem}>
                                    <span
                                        className={`${styles.validationIcon} ${isValidCollateralAmount ? styles.valid : styles.invalid}`}
                                    >
                                        {isValidCollateralAmount ? '✓' : '✗'}
                                    </span>
                                    <span className={styles.validationText}>
                                        {isValidCollateralAmount
                                            ? `Collateral: ${collateralAmount.div(1e8).round(8, 0)} BTC`
                                            : 'Enter collateral amount (min 0.00003 BTC)'}
                                    </span>
                                </div>
                                <div className={styles.validationItem}>
                                    <span
                                        className={`${styles.validationIcon} ${isValidFeeAmount ? styles.valid : styles.invalid}`}
                                    >
                                        {isValidFeeAmount ? '✓' : '✗'}
                                    </span>
                                    <span className={styles.validationText}>
                                        {isValidFeeAmount
                                            ? `Fee: ${feeAmount} sats`
                                            : 'Enter valid fee amount (1000-2999 sats)'}
                                    </span>
                                </div>
                            </div>

                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    margin: '18px 0',
                                }}
                            >
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: '#d4d4d8',
                                        display: 'inline-block',
                                        marginRight: 8,
                                    }}
                                />
                                <div
                                    style={{
                                        flex: 1,
                                        height: '1px',
                                        background: '#e4e4e7',
                                        borderRadius: '1px',
                                    }}
                                />
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: '#d4d4d8',
                                        display: 'inline-block',
                                        marginLeft: 8,
                                    }}
                                />
                            </div>
                            <p className={styles.sdbAddressLabel}>
                                Alternatively, you can deposit by sending BTC
                                directly to your Safety Deposit ₿ox address:
                            </p>
                            <div className={gstyles.sdbAddressContainer}>
                                <code className={styles.sdbAddress}>
                                    {sdbAddress || 'Loading...'}
                                </code>
                                <CopyButton
                                    value={sdbAddress}
                                    copyLabel="Copy SDB address"
                                    copiedLabel="SDB address copied"
                                    onCopied={(success) => {
                                        if (success) {
                                            toast.success(
                                                'SDB address copied to clipboard.'
                                            )
                                        } else {
                                            toast.error(
                                                'Failed to copy SDB address.'
                                            )
                                        }
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
                <div className={styles.drawerFooter}>
                    {!confirmOpen ? (
                        <>
                            <Button
                                variant="primary"
                                onClick={onContinue}
                                disabled={!canContinue}
                                className={styles.continueButton}
                            >
                                Continue
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    if (sdbAddress) {
                                        // window.open(
                                        //     `https://mempool.space/address/${sdbAddress}`,
                                        //     '_blank'
                                        // )
                                        window.open(
                                            `https://uniscan.cc/address/${sdbAddress}?assets=runes`,
                                            '_blank'
                                        )
                                    }
                                }}
                                className={styles.explorerButton}
                                disabled={!sdbAddress}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <polyline
                                        points="15,3 21,3 21,9"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <line
                                        x1="10"
                                        y1="14"
                                        x2="21"
                                        y2="3"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                View on UniScan
                            </Button>
                            {/* <Button variant="secondary" onClick={onClose}>
                                Close
                            </Button> */}
                        </>
                    ) : (
                        <>
                            <Button
                                variant="primary"
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className={styles.continueButton}
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner />
                                        Building Transaction...
                                    </>
                                ) : (
                                    'Confirm Deposit'
                                )}
                            </Button>
                            <Button variant="secondary" onClick={closeConfirm}>
                                Go Back
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
