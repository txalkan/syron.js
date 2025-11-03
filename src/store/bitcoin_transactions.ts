import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TransactionRecord = {
    transactionKey: string
    transactionType: string
    txid?: string
    timestamp: number
    nonce: number
    status: 'pending' | 'success' | 'failed'
    error?: string
    amountSats: string
    recipient: string
}

interface BitcoinTransactionState {
    nextNonce: number
    transactionHistory: Record<string, TransactionRecord>
    beginTransaction: (
        transactionType: string,
        amountSats: bigint,
        recipient: string,
        txid?: string,
        timestamp?: number
    ) => TransactionRecord
    updateTransactionRecord: (
        transactionKey: string,
        updates: Partial<
            Pick<
                TransactionRecord,
                | 'txid'
                | 'timestamp'
                | 'status'
                | 'error'
                | 'amountSats'
                | 'recipient'
            >
        >
    ) => TransactionRecord | undefined
    clearTransaction: (transactionKey: string) => void
    clearAllTransactions: () => void
}

const HISTORY_KEY_SEPARATOR = ':'

export const formatTransactionKey = (
    nonce: number,
    transactionType: string,
    txid?: string
) => {
    const sanitizedTxId = txid && txid.trim().length > 0 ? txid : ''
    return `${nonce}${HISTORY_KEY_SEPARATOR}${transactionType}${HISTORY_KEY_SEPARATOR}${sanitizedTxId}`
}

export const useBitcoinTransactionStore = create<BitcoinTransactionState>()(
    persist(
        (set, get) => ({
            nextNonce: 0,
            transactionHistory: {},
            beginTransaction: (
                transactionType: string,
                amountSats: bigint,
                recipient: string,
                txid?: string,
                timestamp = Date.now()
            ) => {
                const state = get()
                const nonce = state.nextNonce || 0
                const transactionKey = formatTransactionKey(
                    nonce,
                    transactionType,
                    txid ?? ''
                )
                if (txid) {
                    const existingRecord = Object.values(
                        state.transactionHistory
                    ).find((record) => record.transactionKey === transactionKey)

                    if (existingRecord) {
                        return existingRecord
                    }
                }

                const nextNonce = nonce + 1

                const newRecord: TransactionRecord = {
                    transactionKey,
                    transactionType,
                    txid,
                    timestamp,
                    nonce,
                    status: 'pending',
                    error: undefined,
                    amountSats: amountSats.toString(),
                    recipient,
                }

                set({
                    transactionHistory: {
                        ...state.transactionHistory,
                        [transactionKey]: newRecord,
                    },
                    nextNonce,
                })

                return newRecord
            },
            updateTransactionRecord: (transactionKey, updates) => {
                const state = get()
                const entry = state.transactionHistory[transactionKey]

                if (!entry) {
                    return undefined
                }

                const nextTxId =
                    updates.txid !== undefined ? updates.txid : entry.txid
                const nextTimestamp =
                    updates.timestamp !== undefined
                        ? updates.timestamp
                        : entry.timestamp
                const nextStatus = updates.status ?? entry.status
                const nextError = updates.error ?? entry.error

                const nextKey = formatTransactionKey(
                    entry.nonce,
                    entry.transactionType,
                    nextTxId
                )

                const nextAmountSats =
                    updates.amountSats !== undefined
                        ? updates.amountSats.toString()
                        : entry.amountSats

                const nextRecipient =
                    updates.recipient !== undefined
                        ? updates.recipient
                        : entry.recipient

                const updatedRecord: TransactionRecord = {
                    ...entry,
                    transactionKey: nextKey,
                    txid: nextTxId,
                    timestamp: nextTimestamp,
                    status: nextStatus,
                    error: nextError,
                    amountSats: nextAmountSats,
                    recipient: nextRecipient,
                }

                set((state) => {
                    const { transactionHistory } = state

                    const { [transactionKey]: _, ...restHistory } =
                        transactionHistory

                    const updatedHistory = {
                        ...restHistory,
                        [nextKey]: updatedRecord,
                    }

                    return {
                        transactionHistory: updatedHistory,
                    }
                })

                return updatedRecord
            },
            clearTransaction: (transactionKey: string) =>
                set((state) => {
                    const { [transactionKey]: ___, ...restHistory } =
                        state.transactionHistory
                    return {
                        transactionHistory: restHistory,
                    }
                }),
            clearAllTransactions: () =>
                set({
                    nextNonce: 0,
                    transactionHistory: {},
                }),
        }),
        {
            name: 'tyron-bitcoin-transactions',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
