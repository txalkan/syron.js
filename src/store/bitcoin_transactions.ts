import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BitcoinTransactionState {
    runningTransactions: Record<string, boolean> // transactionType -> isRunning (e.g., withdraw_brc20, withdraw_runes)
    setTransactionRunning: (transactionType: string, isRunning: boolean) => void
    clearTransaction: (transactionType: string) => void
    clearAllTransactions: () => void
    // Add timestamp tracking to detect stale transactions
    transactionTimestamps: Record<string, number>
    setTransactionTimestamp: (
        transactionType: string,
        timestamp: number
    ) => void
}

export const useBitcoinTransactionStore = create<BitcoinTransactionState>()(
    persist(
        (set) => ({
            runningTransactions: {},
            transactionTimestamps: {},
            setTransactionRunning: (
                transactionType: string,
                isRunning: boolean
            ) =>
                set((state) => ({
                    runningTransactions: {
                        ...state.runningTransactions,
                        [transactionType]: isRunning,
                    },
                    transactionTimestamps: isRunning
                        ? {
                              ...state.transactionTimestamps,
                              [transactionType]: Date.now(),
                          }
                        : state.transactionTimestamps,
                })),
            setTransactionTimestamp: (
                transactionType: string,
                timestamp: number
            ) =>
                set((state) => ({
                    transactionTimestamps: {
                        ...state.transactionTimestamps,
                        [transactionType]: timestamp,
                    },
                })),
            clearTransaction: (transactionType: string) =>
                set((state) => {
                    const { [transactionType]: _, ...rest } =
                        state.runningTransactions
                    const { [transactionType]: __, ...restTimestamps } =
                        state.transactionTimestamps
                    return {
                        runningTransactions: rest,
                        transactionTimestamps: restTimestamps,
                    }
                }),
            clearAllTransactions: () =>
                set({
                    runningTransactions: {},
                    transactionTimestamps: {},
                }),
        }),
        {
            name: 'tyron-bitcoin-transactions',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
