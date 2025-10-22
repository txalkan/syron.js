'use client'

import React from 'react'
import styles from './styles.module.scss'
import { TRANSACTION_TYPE_METADATA } from '../../src/utils/transaction-tracker'
import {
    useBitcoinTransactionStore,
    type TransactionRecord,
} from '../../src/store/bitcoin_transactions'
import { updateModalGetStarted } from '../../src/store/modal'
import { Big } from '../../src/utils/big'

type MetadataKey = keyof typeof TRANSACTION_TYPE_METADATA
type TransactionMetadata = (typeof TRANSACTION_TYPE_METADATA)[MetadataKey]

type TransactionStatusItem = {
    key: string
    record: TransactionRecord
    metadataKey: MetadataKey
    metadata: TransactionMetadata
    timestamp: number
}

const getTransactionItems = (
    transactionHistory: Record<string, TransactionRecord>
): TransactionStatusItem[] =>
    Object.values(transactionHistory)
        .map((record) => {
            const metadata = TRANSACTION_TYPE_METADATA[record.transactionType]

            console.log('record', record)
            // console.log('metadata', metadata)

            return {
                key: record.transactionKey,
                record,
                metadataKey: record.transactionType as MetadataKey,
                metadata,
                timestamp: record.timestamp,
            }
        })
        .filter((item): item is TransactionStatusItem => item !== null)
        .sort((a, b) => b.timestamp - a.timestamp)

const formatRelativeTime = (timestamp?: number, now?: number) => {
    if (!timestamp || now === undefined) return null

    const diffMs = now - timestamp
    if (diffMs < 0) return 'just now'

    const diffSeconds = Math.floor(diffMs / 1000)
    if (diffSeconds < 60) return `${diffSeconds}s ago`

    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ago`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
}

const formatAmountLabel = (amountSats: string, category: string) => {
    try {
        console.log('amountSats', amountSats)
        const decimalPlaces = category === 'bitcoin' ? 8 : 2

        const formatted = new Intl.NumberFormat('en-US').format(
            Big(amountSats).div(100000000).toFixed(decimalPlaces)
        )

        const currencySymbol = category === 'bitcoin' ? '₿' : '$'
        return `${currencySymbol} ${formatted}`
    } catch (error) {
        console.warn('Failed to format sats amount', error)
    }
}

export const SessionTransactions: React.FC = () => {
    const transactionHistory = useBitcoinTransactionStore(
        (state) => state.transactionHistory
    )

    const transactionItems = React.useMemo(
        () => getTransactionItems(transactionHistory ?? {}),
        [transactionHistory]
    )

    const [tick, setTick] = React.useState(0)

    React.useEffect(() => {
        const timer = setInterval(() => {
            setTick((prev) => prev + 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const now = tick > 0 ? Date.now() : undefined

    if (transactionItems.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.emptyTitle}>No transactions yet</div>
                    <div className={styles.emptySubtitle}>
                        Execute a transaction to see progress updates here. For
                        previous transactions, check the blockchain explorer.
                    </div>
                </div>
                {/* <div className={styles.emptyActions}>
                    <button
                        type="button"
                        className={styles.emptyAction}
                        onClick={() => updateModalGetStarted(true)}
                    >
                        How to start
                    </button>
                </div> */}
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>Session activity</div>
                <div className={styles.headerSubtitle}>
                    Tracking current transactions
                </div>
            </div>
            <ul className={styles.list}>
                {transactionItems.map((item) => {
                    const { record, metadataKey, metadata } = item
                    const timestampLabel = formatRelativeTime(
                        item.timestamp,
                        now
                    )
                    const amountLabel = formatAmountLabel(
                        record.amountSats,
                        metadata.category
                    )
                    const statusLabel =
                        record.status === 'pending'
                            ? 'In progress'
                            : record.status === 'success'
                              ? 'Completed'
                              : 'Failed'
                    return (
                        <li key={item.key} className={styles.listItem}>
                            <div className={styles.listItemHeader}>
                                <span className={styles.category}>
                                    {metadata?.category}
                                </span>
                                <span
                                    className={
                                        record.status === 'pending'
                                            ? styles.statusRunning
                                            : styles.statusIdle
                                    }
                                >
                                    {statusLabel}
                                </span>
                            </div>
                            <div className={styles.label}>
                                {metadata?.label}
                            </div>
                            {metadata?.description ? (
                                <div className={styles.description}>
                                    {metadata?.description}
                                </div>
                            ) : null}
                            <div className={styles.metaRow}>
                                <div className={styles.amountContainer}>
                                    {amountLabel ? (
                                        <span className={styles.amount}>
                                            {amountLabel}
                                        </span>
                                    ) : null}
                                </div>
                                {/* <span className={styles.key}>
                                    {metadataKey}
                                </span> */}
                                {timestampLabel ? (
                                    <span className={styles.timestamp}>
                                        {timestampLabel}
                                    </span>
                                ) : null}
                            </div>
                            <div className={styles.recipient}>
                                To: {record.recipient}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default SessionTransactions
