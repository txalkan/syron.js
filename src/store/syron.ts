import { Store } from 'react-stores'
import { BTCWallet, SyronSSI } from '../types/syron'
import { DelegationIdentity } from '@dfinity/identity'

export const $syron = new Store<SyronSSI | null>(null)
export function updateSyronSSI(args: SyronSSI) {
    $syron.setState(args)
}
export function updateSusdBalance(state: SyronSSI, susd: Big) {
    $syron.setState({
        ...state,
        syron_usd_bal: susd,
    })
}

export const $btc_wallet = new Store<BTCWallet | null>(null)
export function updateBTCWallet(args: BTCWallet) {
    $btc_wallet.setState(args)
}

export const $walletConnected = new Store<{ isConnected: boolean }>({
    isConnected: false,
})
export function updateWalletConnected(args: boolean) {
    $walletConnected.setState({ isConnected: args })
}

export const $inscriptionTx = new Store<{ value: string | null }>({
    value: null,
})
export function updateInscriptionTx(args: string | null) {
    $inscriptionTx.setState({ value: args })
}

export const $icpTx = new Store<{ value: boolean | null }>({ value: null })
export function updateIcpTx(args: boolean | null) {
    $icpTx.setState({ value: args })
}

export const $siwb = new Store<{ value: DelegationIdentity | null }>({
    value: null,
})
export function updateSiwb(args: DelegationIdentity | null) {
    $siwb.setState({ value: args })
}
