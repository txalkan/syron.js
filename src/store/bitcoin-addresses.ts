import { Store } from 'react-stores'
import { BitcoinAddresses } from '../types/bitcoin-addresses'

export const $bitcoin_addresses = new Store<BitcoinAddresses | null>(null)
export function updateBitcoinAddresses(addr: BitcoinAddresses) {
    console.log('Bitcoin_Addresses_Updated', JSON.stringify(addr, null, 2))
    $bitcoin_addresses.setState(addr)
}
