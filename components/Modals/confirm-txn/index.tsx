import React from 'react'
import { Modal, Button, Typography } from 'antd'
import styles from './index.module.scss'
import LoadingSpinner from '../../LoadingSpinner'
import Image from 'next/image'
import bitcoinIcon from '../../../src/assets/icons/bitcoin.png'
import { toast } from 'react-toastify'

const { Text } = Typography

// Define a type for the formatLedgerValue options object
type LedgerValueOptions = {
    defaultUnit?: string
    precision?: number
}

const ConfirmTransactionModal = ({
    isOpen,
    onClose,
    onDetails,
    onConfirm,
    isLoading,
    onReloadFees,
    isReloadingFees,
}) => {
    // Safety check to ensure onDetails exists
    if (!onDetails || typeof onDetails !== 'object') {
        return null
    }

    // Helper function to extract numeric values from currency strings
    const extractNumber = (str: any): number => {
        if (!str) return 0
        const match = str.toString().match(/[\d,]+\.?\d*/)
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0
    }

    // Calculate total amount to receive
    const calculateTotalAmount = (): string => {
        if (!onDetails.amount) return '0.00'

        const amount = extractNumber(onDetails.amount)
        const gasFee =
            onDetails.gas && onDetails.gas.includes('sats')
                ? 0
                : onDetails.gas
                  ? extractNumber(onDetails.gas)
                  : 0

        // if the fee includes a $ sign, treat as number without the $ sign
        // otherwise, if includes "sats" consider 0

        const daoFee =
            onDetails.fee && onDetails.fee.includes('$')
                ? extractNumber(onDetails.fee.replace('$', ''))
                : onDetails.fee && onDetails.fee.includes('sats')
                  ? 0
                  : onDetails.fee
                    ? extractNumber(onDetails.fee)
                    : 0

        const total = Math.max(0, amount - gasFee - daoFee)

        return `${total.toFixed(2)}`
    }

    const toLocaleValue = (value: number, precision?: number) => {
        if (!Number.isFinite(value)) return '--'

        const resolvedPrecision =
            typeof precision === 'number'
                ? precision
                : Number.isInteger(value)
                  ? 0
                  : 2

        if (value === 0) {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value)
        }

        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: resolvedPrecision,
            maximumFractionDigits: resolvedPrecision,
        }).format(value)
    }

    const formatLedgerValue = (
        rawValue: any,
        options: LedgerValueOptions = {}
    ): { amount: string; unit: string } => {
        if (rawValue === undefined || rawValue === null) {
            return { amount: '--', unit: options.defaultUnit || '' }
        }

        const stringValue = rawValue.toString().trim()
        if (!stringValue) {
            return { amount: '--', unit: options.defaultUnit || '' }
        }

        const numericValue = extractNumber(stringValue)
        if (/(sats)/i.test(stringValue)) {
            return {
                amount: toLocaleValue(numericValue, options.precision ?? 0),
                unit: 'SATS',
            }
        }
        if (/(susd)/i.test(stringValue)) {
            return {
                amount: toLocaleValue(
                    numericValue,
                    options.precision ??
                        (Number.isInteger(numericValue) ? 0 : 2)
                ),
                unit: 'SUSD',
            }
        }
        if (/(btc)/i.test(stringValue)) {
            return {
                amount: toLocaleValue(numericValue, options.precision ?? 8),
                unit: 'BTC',
            }
        }
        if (stringValue.includes('$')) {
            return {
                amount: toLocaleValue(
                    numericValue,
                    options.precision ??
                        (Number.isInteger(numericValue) ? 0 : 2)
                ),
                unit: options.defaultUnit || 'SUSD',
            }
        }

        return {
            amount: toLocaleValue(
                numericValue,
                options.precision ?? (Number.isInteger(numericValue) ? 0 : 2)
            ),
            unit: options.defaultUnit || '',
        }
    }

    const amountLabel =
        onDetails.stablecoin === 'BRC-20'
            ? 'SYRON BRC-20 AMOUNT'
            : onDetails.stablecoin === 'RUNES'
              ? 'RUNE•DOLLAR AMOUNT'
              : 'SUSD AMOUNT'

    // This typing avoids errors in TS/JS and adds correct structure
    const ledgerRows: Array<{
        key: string
        label: string
        amount: string
        unit?: string
    }> = []

    if (onDetails.amount) {
        ledgerRows.push({
            key: 'amount',
            label: amountLabel,
            ...formatLedgerValue(onDetails.amount, {
                defaultUnit: 'SUSD',
                precision: 2,
            }),
        })
    }

    if (onDetails.btcAmount) {
        ledgerRows.push({
            key: 'btcAmount',
            label: 'BTC ACQUIRED',
            ...formatLedgerValue(onDetails.btcAmount, {
                defaultUnit: 'BTC',
                precision: 8,
            }),
        })
    }

    if (onDetails.fee) {
        const feeDefaultPrecision =
            typeof onDetails.fee === 'string' && onDetails.fee.includes('sats')
                ? 0
                : 2

        ledgerRows.push({
            key: 'daoFee',
            label: 'DAO FEE',
            ...formatLedgerValue(onDetails.fee, {
                defaultUnit: 'SUSD',
                precision: feeDefaultPrecision,
            }),
        })
    }

    if (onDetails.gas) {
        ledgerRows.push({
            key: 'networkFee',
            label: 'MINER FEE',
            ...formatLedgerValue(onDetails.gas, {
                defaultUnit: 'SATS',
                precision: 0,
            }),
        })
    }

    const totalOutputRaw = calculateTotalAmount()
    const totalOutputFormatted = formatLedgerValue(totalOutputRaw, {
        precision: 2,
        defaultUnit: '',
    }).amount

    const resolveOutputToken = () => {
        if (onDetails.stablecoin === 'BRC-20') return 'SYRON•BRC-20'
        if (onDetails.stablecoin === 'RUNES') return 'RUNE•DOLLAR'
        return 'SUSD'
    }

    return (
        <Modal
            title={
                <div className={styles.modalTitle}>
                    <span className={styles.titleText}>
                        {onDetails.title || 'Confirm Transaction'}
                    </span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            className={styles.modal}
            width={480}
        >
            <div className={styles.modalContent}>
                {onDetails.info && (
                    <div className={styles.infoSection}>
                        <Text className={styles.infoText}>
                            {onDetails.info}
                        </Text>
                    </div>
                )}

                <div className={styles.summarySection}>
                    <div className={styles.summaryHeader}>
                        <div className={styles.summaryTitle}>
                            TRANSACTION SUMMARY
                        </div>
                        <button
                            className={styles.reloadButton}
                            onClick={onReloadFees}
                            disabled={isReloadingFees}
                            title="Reload fee information"
                        >
                            {isReloadingFees ? (
                                <LoadingSpinner size="md" />
                            ) : (
                                <span>↻</span>
                            )}
                        </button>
                    </div>

                    <div className={styles.ledgerBody}>
                        {ledgerRows.map((row) => (
                            <div key={row.key} className={styles.ledgerRow}>
                                <span className={styles.ledgerLabel}>
                                    {row.label}
                                </span>
                                <span
                                    className={styles.ledgerDivider}
                                    aria-hidden
                                >
                                    ···········································
                                </span>
                                <div className={styles.ledgerValueWrapper}>
                                    <span className={styles.ledgerAmount}>
                                        {row.amount}
                                    </span>
                                    {row.unit && (
                                        <span className={styles.ledgerUnit}>
                                            {row.unit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {onDetails.feeDescription && (
                        <div className={styles.feeDescription}>
                            <span className={styles.infoText}>
                                {onDetails.feeDescription}
                            </span>
                        </div>
                    )}
                </div>

                {/* Big Total Amount Display */}
                {/* Show SUSD amount (green box) only for withdrawals */}
                {onDetails.title === 'Confirm Transaction' && (
                    <div className={styles.totalOutputPanel}>
                        <div className={styles.totalOutputLabel}>
                            TOTAL RECEIVED
                        </div>
                        <div className={styles.totalOutputValue}>
                            {totalOutputFormatted}
                        </div>
                        <div className={styles.totalOutputToken}>
                            {resolveOutputToken()}
                        </div>
                    </div>
                )}

                {/* Show BTC amount (yellow box) only for BTC purchases */}
                {onDetails.title === 'Confirm BTC Purchase' && (
                    <div className={styles.totalSection}>
                        <div className={styles.bitcoinLogo}>
                            <Image
                                src={bitcoinIcon}
                                alt="Bitcoin"
                                width={40}
                                height={40}
                            />
                        </div>
                        <div className={styles.totalLabel}>
                            You will receive around
                        </div>
                        <div className={styles.totalAmount}>
                            {onDetails.total_min}
                        </div>
                        <div className={styles.totalNote}>
                            Final amount may vary slightly
                        </div>
                    </div>
                )}

                {onDetails.receiver && (
                    <div className={styles.receiverSection}>
                        <div className={styles.receiverLabel}>Sending to</div>
                        <div className={styles.receiverAddress}>
                            {onDetails.receiver}
                        </div>
                    </div>
                )}

                <div className={styles.confirmationText}>
                    Confirm to sign and execute transaction.
                </div>

                <div className={styles.actionButtons}>
                    <Button
                        onClick={onClose}
                        className={styles.cancelButton}
                        size="large"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={
                            onDetails.title &&
                            onDetails.title !== 'Confirm BTC Purchase'
                                ? () => {
                                      onConfirm()
                                      onClose()
                                  }
                                : () => {
                                      onClose()
                                      toast.info('Coming soon')
                                  }
                        }
                        className={styles.confirmButton}
                        size="large"
                        loading={isLoading}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmTransactionModal
