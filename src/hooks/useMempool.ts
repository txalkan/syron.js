import { useCallback, useEffect, useRef } from 'react'
import { updateXR } from '../store/xr'
import { mempoolPrice } from '../utils/bitcoin/mempool'
import { useStore } from 'react-stores'
import { $syron } from '../store/syron'
import { useWalletInfoStore } from '../store/wallet_info'

//@mempool
export function useMempoolHook() {
    const syron = useStore($syron)
    const { wallet } = useWalletInfoStore()
    const wsRef = useRef<WebSocket | null>(null)
    const trackedTxsRef = useRef<Set<string>>(new Set())

    const getXR = useCallback(async (): Promise<number> => {
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
                // @dev get exchange rate from ICP using a default SSI address
                const res = await fetch(
                    `/api/get-sdb-addr?id=${'bc1p2em8l7wx3w6gn0w3wswz5scsagfzg6zhlpwuaqszwts29285mnjq4ca8n7'}`
                )
                const sdb = await res.json()
                return Number(sdb.data.exchange_rate)
            }
        }
    }, [syron])

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
    }, [getXR])

    const resendTrackedTransactions = useCallback(() => {
        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return

        trackedTxsRef.current.forEach((txId) => {
            ws.send(JSON.stringify({ 'track-tx': txId }))
        })
    }, [])

    const trackTransaction = useCallback((txId: string) => {
        const normalized = txId?.trim()
        if (!normalized) return

        trackedTxsRef.current.add(normalized)

        const ws = wsRef.current
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ 'track-tx': normalized }))
        }
    }, [])

    const subscribeSdb = useCallback(() => {
        const cleanup = (options?: { clearTracked?: boolean }) => {
            if (wsRef.current) {
                wsRef.current.onopen = null
                wsRef.current.onmessage = null
                wsRef.current.onerror = null
                wsRef.current.onclose = null
                wsRef.current.close()
                wsRef.current = null
            }

            if (options?.clearTracked) {
                trackedTxsRef.current.clear()
            }
        }

        const sdbAddress = wallet.sdbAddress
        if (!sdbAddress) {
            cleanup({ clearTracked: true })
            return cleanup
        }

        cleanup()

        const ws = new WebSocket('wss://mempool.space/api/v1/ws')
        wsRef.current = ws

        ws.onopen = () => {
            ws.send(JSON.stringify({ 'track-address': sdbAddress }))
            resendTrackedTransactions()
            console.log('🔗 Subscribed to', sdbAddress)
        }

        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data)

                // mempool txs (unconfirmed)
                if (msg['address-transactions']) {
                    const tx = msg['address-transactions'][0]
                    console.log(
                        '🟡 mempool tx',
                        tx.txid,
                        'touching',
                        sdbAddress
                    )
                }

                // confirmed txs (block)
                if (msg['block-transactions']) {
                    const tx = msg['block-transactions'][0]
                    console.log(
                        '🟢 confirmed tx',
                        tx.txid,
                        'touching',
                        sdbAddress
                    )
                }

                if (msg['transaction']) {
                    const tx = msg['transaction']
                    console.log('🔔 tracked tx update', tx.txid)
                }
            } catch (error) {
                console.error('Error parsing message', error)
            }
        }

        ws.onerror = (event) => {
            console.error('WebSocket error for', sdbAddress, event)
            ws.close()
        }

        ws.onclose = () => {
            if (wsRef.current === ws) {
                wsRef.current = null
            }
            console.log('🔌 WS closed for', sdbAddress)
        }

        return cleanup
    }, [wallet.sdbAddress, resendTrackedTransactions])

    return {
        getXR,
        subscribeSdb,
        trackTransaction,
    }
}
