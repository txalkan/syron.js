import React, { useState } from 'react'
import { Modal, Button, Typography } from 'antd'
import styles from './index.module.scss'
import ThreeDots from '../../Spinner/ThreeDots'

const { Text } = Typography

const ConfirmTransactionModal = ({
    isOpen,
    onClose,
    onDetails,
    onConfirm,
    isLoading,
}) => {
    return (
        <Modal
            title={onDetails.title}
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button
                    key="cancel"
                    onClick={onClose}
                    className={styles.cancel}
                >
                    Cancel
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    onClick={onConfirm}
                    className={styles.confirm}
                >
                    {isLoading ? (
                        <ThreeDots color={undefined} />
                    ) : (
                        <span>Confirm</span>
                    )}
                </Button>,
            ]}
        >
            {onDetails.info && <Text>{onDetails.info}</Text>}

            <div className={styles.subtitle}>Transaction Summary</div>
            {onDetails.amount && (
                <div className={styles.table}>
                    <div>SUSD paid</div>
                    <div className={styles.value}>{onDetails.amount}</div>
                </div>
            )}
            {onDetails.btcAmount && (
                <div className={styles.table}>
                    <div className={styles.subtable}>
                        <div>BTC acquired</div>
                        <div className={styles.subvalue}>
                            After 1% max slippage{' '}
                        </div>
                    </div>
                    <div className={styles.value}>{onDetails.btcAmount}</div>
                </div>
            )}
            <br />
            {onDetails.gas && (
                <div className={styles.table}>
                    <div>Miner fee &#8776; </div>
                    <div className={styles.value}>{onDetails.gas}</div>
                </div>
            )}
            {onDetails.fee && (
                <div className={styles.table}>
                    <div>DAO fee</div>
                    <div className={styles.value}>{onDetails.fee}</div>
                </div>
            )}
            <br />
            {onDetails.total_min && (
                <div>
                    <strong>You will receive around</strong>
                    <div className={styles.total}>{onDetails.total_min}</div>
                    <i>Final amount may vary slightly</i>
                </div>
            )}
            <br />
            {onDetails.receiver && (
                <div>
                    <u>Sending to</u>
                    <div className={styles.address}>{onDetails.receiver}</div>
                </div>
            )}

            <br />
            <Text>Are you sure you want to proceed?</Text>
        </Modal>
    )
}

export default ConfirmTransactionModal
