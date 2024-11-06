import { updateXR } from '../store/xr'
import { mempoolPrice } from '../utils/unisat/httpUtils'

export function useMempoolHook() {
    const getXR = async () => {
        try {
            const xr = await mempoolPrice()
            updateXR({ rate: Number(xr.USD) })

            console.log('BTC exchange rates', JSON.stringify(xr, null, 2))
        } catch (err) {
            console.error(err)
        }
    }

    return {
        getXR,
    }
}
