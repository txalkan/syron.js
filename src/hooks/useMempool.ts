import { useEffect } from 'react'
import { updateXR } from '../store/xr'
import { mempoolPrice } from '../utils/unisat/httpUtils'
import { useStore } from 'react-stores'
import { $syron } from '../store/syron'

//@mempool
export function useMempoolHook() {
    const syron = useStore($syron)

    const getXR = async (): Promise<number> => {
        try {
            const xr = await mempoolPrice()
            // console.log(
            //     'BTC exchange rates from Mempool',
            //     JSON.stringify(xr, null, 2)
            // )
            const now = Math.floor(Date.now() / 1000)
            // console.log('now is', now)
            if (xr.time && now - xr.time > 600) {
                throw new Error(
                    'Mempool exchange rate data is older than 10 minutes'
                )
            }
            const xusd = Number(xr.USD)
            // throw new Error('Invalid exchange rate')
            if (xusd <= 0) throw new Error('Invalid exchange rate')
            return xusd
        } catch (err) {
            // @add time
            console.error(err)
            if (syron?.exchange_rate) {
                return Number(syron?.exchange_rate)
            } else {
                const res = await fetch(
                    `/api/get-sdb?id=${'bc1p2em8l7wx3w6gn0w3wswz5scsagfzg6zhlpwuaqszwts29285mnjq4ca8n7'}`
                )
                const sdb = await res.json()
                return Number(sdb.data.exchange_rate)
            }
        }
    }

    // @dev Update BTC exchange rate every minute
    useEffect(() => {
        async function updateXRate() {
            const exchange_rate = await getXR()
            updateXR({ rate: exchange_rate })
            console.log('BTC Exchange Rate', exchange_rate)
            // @review update wallet balance too
        }

        updateXRate()

        const intervalId = setInterval(updateXRate, 1 * 60 * 1000)

        return () => clearInterval(intervalId) // Cleanup on unmount
    }, [syron])

    return {
        getXR,
    }
}
