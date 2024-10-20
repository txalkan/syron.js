import Big from 'big.js'

export interface SyronSSI {
    sdb: string
    collateral_ratio: Big
    sdb_btc: Big // BTC deposit balance of the SDB
    syron_btc: Big // Registered balance in the Syron ledger
    syron_usd_loan: Big
    syron_usd_bal: Big
}

export interface BTCWallet {
    network: string
    btc_addr: string
    btc_balance: Big
}
