'use client'

import React from 'react'
import { Button } from '../Button'
import { TransactionDetails } from './TransactionDetails'
import LoadingSpinner from '../LoadingSpinner'
import styles from './styles.module.scss'
import { SyronForm } from '../syron-102'
import { Big, _0 } from '../../src/utils/big'
import { InputAmount } from './InputAmount'
import { useDepositPsbt } from '../../src/utils/bitcoin/deposit-psbt'
import { toast } from 'react-toastify'

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
    const [confirmOpen, showConfirm, closeConfirm] = useToggleState()
    const [isLoading, setIsLoading] = React.useState(false)
    const [isCopied, setIsCopied] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const [inputAmt, setInputAmount] = React.useState<string>('2999')
    const [feeAmount, setFeeAmount] = React.useState<Big>(_0)
    const [collateralAmount, setCollateralAmount] = React.useState<Big>(_0)

    // Initialize the PSBT utility
    const { createDeposit } = useDepositPsbt()

    const isFeeTooHigh = false

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
        console.log(`collateral amount ${collateral} sats`)
        setCollateralAmount(amount)
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
                collateralAmount,
                feeAmount,
                sdbAddress,
                setIsLoading,
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
                                            setIsCopied(true)
                                            // Reset the copied state after 2 seconds
                                            setTimeout(() => {
                                                setIsCopied(false)
                                            }, 2000)
                                        }
                                    }}
                                    className={`${styles.copyButton} ${isCopied ? styles.copied : ''}`}
                                    title={
                                        isCopied
                                            ? 'Copied!'
                                            : 'Copy SDB address'
                                    }
                                >
                                    {isCopied ? (
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M20 6L9 17l-5-5"
                                                stroke="#10b981"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <rect
                                                x="8"
                                                y="2"
                                                width="8"
                                                height="4"
                                                rx="1"
                                                ry="1"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            />
                                        </svg>
                                    )}
                                </button>
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
                                        Sending Transaction...
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
