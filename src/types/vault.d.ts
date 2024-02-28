export interface CryptoState {
    name: string
    symbol: string
    decimals: number
}

export interface VaultPair {
    value: string
    meta: CryptoState
}
