import Big from 'big.js'

export interface SyronSSI {
    sdb: string
    syron_btc: Big
    syron_usd_loan: Big
    collateral_ratio: Big
}

export interface BTCWallet {
    network: string
    btc_addr: string
    btc_balance: Big
}
