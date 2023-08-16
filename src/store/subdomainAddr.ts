import { Store } from 'react-stores'
import { Wallet } from '../types/wallet'
export const $domainAddr = new Store<Wallet | null>(null)
export function updateDomainAddr(addr: Wallet) {
    console.log('SUBDOMAIN_ADDR_UPDATED', addr)
    $domainAddr.setState(addr)
}
