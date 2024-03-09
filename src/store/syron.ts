import { Store } from 'react-stores'
import { SyronSSI } from '../types/syron'

export const $syron = new Store<SyronSSI | null>(null)
export function updateSyronSSI(args: SyronSSI) {
    $syron.setState(args)
}
