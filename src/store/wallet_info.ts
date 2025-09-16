import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WalletInfo {
    type: 'unisat' | 'okx' | null
    address: string | null
    network: string | null // e.g., 'mainnet', 'testnet'
    sdbAddress: string | null // Safety Deposit Box address
    balance: number | null
}

interface WalletInfoState {
    wallet: WalletInfo
    setWallet: (wallet: WalletInfo) => void
    setWalletType: (type: 'unisat' | 'okx') => void
    setWalletAddress: (address: string) => void
    setWalletNetwork: (network: string) => void
    setSdbAddress: (sdbAddress: string) => void
    setWalletBalance: (balance: number) => void
    clearWallet: () => void
    updateWallet: (updates: Partial<WalletInfo>) => void
}

const initialWalletState: WalletInfo = {
    type: null,
    address: null,
    network: null,
    sdbAddress: null,
    balance: null,
}

export const useWalletInfoStore = create<WalletInfoState>()(
    persist(
        (set) => ({
            wallet: initialWalletState,

            setWallet: (wallet: WalletInfo) =>
                set(() => ({
                    wallet,
                })),

            setWalletType: (type: 'unisat' | 'okx') =>
                set((state) => ({
                    wallet: {
                        ...state.wallet,
                        type,
                    },
                })),

            setWalletAddress: (address: string) =>
                set((state) => ({
                    wallet: {
                        ...state.wallet,
                        address,
                    },
                })),

            setWalletNetwork: (network: string) =>
                set((state) => ({
                    wallet: {
                        ...state.wallet,
                        network,
                    },
                })),

            setSdbAddress: (sdbAddress: string) =>
                set((state) => ({
                    wallet: {
                        ...state.wallet,
                        sdbAddress,
                    },
                })),

            setWalletBalance: (balance: number) =>
                set((state) => ({
                    wallet: {
                        ...state.wallet,
                        balance,
                    },
                })),

            updateWallet: (updates: Partial<WalletInfo>) =>
                set((state) => ({
                    wallet: {
                        ...state.wallet,
                        ...updates,
                    },
                })),

            clearWallet: () =>
                set(() => ({
                    wallet: initialWalletState,
                })),
        }),
        {
            name: 'tyron-wallet-info',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)
