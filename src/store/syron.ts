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

// Helper function to save SIWB session to sessionStorage
const saveSiwbSession = (identity: DelegationIdentity | null) => {
    if (typeof window !== 'undefined') {
        if (identity) {
            // Store the identity data in sessionStorage
            const identityData = {
                identity: JSON.stringify(identity),
                timestamp: Date.now(),
            }
            sessionStorage.setItem('siwb_session', JSON.stringify(identityData))
        } else {
            // Clear sessionStorage when identity is null
            sessionStorage.removeItem('siwb_session')
        }
    }
}

// Helper function to load SIWB session from sessionStorage
const loadSiwbSession = (): DelegationIdentity | null => {
    if (typeof window !== 'undefined') {
        const sessionData = sessionStorage.getItem('siwb_session')
        if (sessionData) {
            try {
                const parsed = JSON.parse(sessionData)
                const identity = JSON.parse(parsed.identity)
                return identity
            } catch (error) {
                console.error('Failed to parse SIWB session:', error)
                sessionStorage.removeItem('siwb_session')
            }
        }
    }
    return null
}

export const $siwb = new Store<{ value: DelegationIdentity | null }>({
    value: loadSiwbSession(),
})
export function updateSiwb(args: DelegationIdentity | null) {
    $siwb.setState({ value: args })
    saveSiwbSession(args)
}

// Function to clear SIWB session (call this when wallet disconnects)
export function clearSiwbSession() {
    $siwb.setState({ value: null })
    saveSiwbSession(null)
}
