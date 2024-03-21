import { Store } from 'react-stores'
import { BTCWallet, SyronSSI } from '../types/syron'

export const $syron = new Store<SyronSSI | null>(null)
export function updateSyronSSI(args: SyronSSI) {
    $syron.setState(args)
}

export const $btc_wallet = new Store<BTCWallet | null>(null)
export function updateBTCWallet(args: BTCWallet) {
    $btc_wallet.setState(args)
}
