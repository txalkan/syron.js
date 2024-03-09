import { Store } from 'react-stores'
import Big from 'big.js'

interface XR {
    rate: number
}
export const $xr = new Store<XR | null>(null)
export function updateXR(args: XR) {
    $xr.setState(args)
}
