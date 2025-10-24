import { Store } from 'react-stores'
import { SyronSSI } from '../types/syron'
import { _0, Big } from '../utils/big'
const syronInitialState: SyronSSI = {
    sdb: '',
    collateral_ratio: _0,
    sdb_btc: _0,
    syron_btc: _0,
    syron_usd_loan: _0,
    syron_usd_bal: _0,
    exchange_rate: _0,
}
export const $syron = new Store<SyronSSI>(syronInitialState)
export function updateSyronSSI(args: SyronSSI) {
    $syron.setState(args)
}
export function clearSyronSSI() {
    $syron.setState(syronInitialState)
}
export function updateSusdBalance(state: SyronSSI, susd: Big) {
    $syron.setState({
        ...state,
        syron_usd_bal: susd,
    })
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
