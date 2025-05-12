import { Store } from 'react-stores'

interface XR {
    rate: number
}
export const $xr = new Store<XR | null>(null)
export function updateXR(args: XR) {
    $xr.setState(args)
}
