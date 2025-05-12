import Big from 'big.js'

export interface SyronSSI {
    sdb: string
    collateral_ratio: Big
    sdb_btc: Big // BTC balance of the SDB (confirmed deposit)
    syron_btc: Big // Registered BTC balance in the Syron ledger (accounted deposit)
    syron_usd_loan: Big
    syron_usd_bal: Big
    exchange_rate: Big
}

export interface BTCWallet {
    network: string
    btc_addr: string
    btc_balance: Big
}
