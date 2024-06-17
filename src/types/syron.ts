import Big from 'big.js'

export interface SyronSSI {
    ssi_box: string
    box_balance: Big
    box_loan: Big
    box_ratio: Big
}

export interface BTCWallet {
    network: string
    btc_addr: string
    btc_balance: Big
}
