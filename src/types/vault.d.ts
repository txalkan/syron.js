import Big from 'big.js'

export interface CryptoState {
    name: string
    symbol: string
    decimals: number
}

export interface VaultPair {
    value: Big
    meta: CryptoState
}
