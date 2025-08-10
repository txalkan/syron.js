import React from 'react'
import { Modal, Button, Typography } from 'antd'
import styles from './index.module.scss'
import ThreeDots from '../../Spinner/ThreeDots'
import LoadingSpinner from '../../LoadingSpinner'
import bitcoinIcon from '../../../src/assets/icons/bitcoin.png'
import { toast } from 'react-toastify'

const { Text } = Typography

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
    const extractNumber = (str) => {
        if (!str) return 0
        const match = str.toString().match(/[\d,]+\.?\d*/)
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0
    }

    // Calculate total amount to receive
    const calculateTotalAmount = () => {
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
                            Transaction Summary
                        </div>
                        <button
                            className={styles.reloadButton}
                            onClick={onReloadFees}
                            disabled={isReloadingFees}
                            title="Reload fee information"
                        >
                            {isReloadingFees ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <span>↻</span>
                            )}
                        </button>
                    </div>

                    {onDetails.amount && (
                        <div className={styles.summaryRow}>
                            <span className={styles.label}>
                                {onDetails.stablecoin === 'BRC-20'
                                    ? 'SYRON BRC-20 Amount'
                                    : onDetails.stablecoin === 'RUNES'
                                      ? 'RUNE•DOLLAR Amount'
                                      : 'SUSD Amount'}
                            </span>
                            <span className={styles.value}>
                                {onDetails.amount}
                            </span>
                        </div>
                    )}

                    {onDetails.btcAmount && (
                        <div className={styles.summaryRow}>
                            <div className={styles.labelGroup}>
                                <span className={styles.label}>
                                    BTC Acquired
                                </span>
                                <span className={styles.subLabel}>
                                    After 1% max slippage
                                </span>
                            </div>
                            <span className={styles.value}>
                                {onDetails.btcAmount}
                            </span>
                        </div>
                    )}

                    {onDetails.fee && (
                        <div className={styles.summaryRow}>
                            <span className={styles.label}>DAO Fee</span>
                            <span className={styles.value}>
                                {onDetails.fee}
                            </span>
                        </div>
                    )}

                    {onDetails.feeDescription && (
                        <div className={styles.feeDescription}>
                            <span className={styles.feeText}>
                                {onDetails.feeDescription}
                            </span>
                        </div>
                    )}

                    {onDetails.gas && (
                        <div className={styles.summaryRow}>
                            <span className={styles.label}>Network Fee ≈</span>
                            <span className={styles.value}>
                                {onDetails.gas}
                            </span>
                        </div>
                    )}
                </div>

                {/* Big Total Amount Display */}
                {/* Show SUSD amount (green box) only for withdrawals */}
                {onDetails.title === 'Confirm Transaction' && (
                    <div className={styles.bigTotalSection}>
                        <div className={styles.bigTotalLabel}>
                            Total Amount to Receive
                        </div>
                        <div className={styles.bigTotalAmount}>
                            <div className={styles.amountValue}>
                                {calculateTotalAmount()}
                            </div>
                            <div className={styles.tokenName}>
                                {onDetails.stablecoin === 'BRC-20'
                                    ? 'SYRON BRC-20'
                                    : onDetails.stablecoin === 'RUNES'
                                      ? 'RUNE•DOLLAR'
                                      : 'SUSD'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Show BTC amount (yellow box) only for BTC purchases */}
                {onDetails.title === 'Confirm BTC Purchase' && (
                    <div className={styles.totalSection}>
                        <div className={styles.bitcoinLogo}>
                            <img src={bitcoinIcon.src} alt="Bitcoin" />
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
                    Are you sure you want to proceed?
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
                            onDetails.title != 'Confirm BTC Purchase'
                                ? () => {
                                      onConfirm()
                                      onClose()
                                  }
                                : () => {
                                      onClose()
                                      toast.info('Coming soon')
                                  }
                        }
                        className={
                            onDetails.title === 'Confirm Transaction'
                                ? styles.confirmButtonGreen
                                : onDetails.title === 'Confirm BTC Purchase'
                                  ? styles.confirmButtonYellow
                                  : styles.confirmButton
                        }
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
