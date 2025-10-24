import { useCallback, useEffect, useRef } from 'react'
import { updateXR } from '../store/xr'
import { mempoolPrice } from '../utils/bitcoin/mempool'
import { useStore } from 'react-stores'
import { $syron } from '../store/syron'
import { useWalletInfoStore } from '../store/wallet_info'

const ONE_MINUTE_MS = 60 * 1000
const DEFAULT_SSI_ADDRESS =
    'bc1p2em8l7wx3w6gn0w3wswz5scsagfzg6zhlpwuaqszwts29285mnjq4ca8n7'
const isDev = process.env.NODE_ENV !== 'production'

let activeSubscribers = 0
let pollingInterval: ReturnType<typeof setInterval> | null = null
let lastRate: number | null = null
let lastRateTimestamp = 0
let ongoingRateFetch: Promise<number | null> | null = null

async function fetchLatestExchangeRate(
    fallback: number
): Promise<number | null> {
    if (ongoingRateFetch) {
        return ongoingRateFetch
    }

    ongoingRateFetch = (async () => {
        try {
            const xr = await mempoolPrice()
            const now = Math.floor(Date.now() / 1000)

            if (xr.time && now - xr.time > 600) {
                throw new Error(
                    'Mempool exchange rate data is older than 10 minutes'
                )
            }

            const xusd = Number(xr.USD)
            if (!Number.isFinite(xusd) || xusd <= 0) {
                throw new Error('Invalid exchange rate returned by mempool')
            }

            return xusd
        } catch (error) {
            if (isDev) {
                console.error('Failed to load mempool BTC rate', error)
            }

            if (Number.isFinite(fallback) && fallback > 0) {
                return fallback
            }

            try {
                const res = await fetch(
                    `/api/get-sdb-addr?id=${DEFAULT_SSI_ADDRESS}`
                )
                if (!res.ok) {
                    throw new Error(`Fallback SDB lookup failed: ${res.status}`)
                }
                const sdb = await res.json()
                const fallback = Number(sdb?.data?.exchange_rate)
                if (Number.isFinite(fallback) && fallback > 0) {
                    return fallback
                }
            } catch (fallbackError) {
                if (isDev) {
                    console.error(
                        'Fallback exchange rate fetch failed',
                        fallbackError
                    )
                }
            }

            return null
        } finally {
            ongoingRateFetch = null
        }
    })()

    return ongoingRateFetch
}

function cacheExchangeRate(rate: number | null) {
    if (!Number.isFinite(rate as number) || rate === null) {
        return
    }

    const normalized = Number(rate)
    if (!Number.isFinite(normalized) || normalized <= 0) {
        return
    }

    lastRateTimestamp = Date.now()

    if (lastRate === normalized) {
        return
    }

    lastRate = normalized
    console.log('Updating BTC Exchange Rate', normalized)
    updateXR({ rate: normalized })
}

function ensurePolling(fallback_xr: number) {
    if (pollingInterval) {
        return
    }

    const poll = async () => {
        const rate = await fetchLatestExchangeRate(fallback_xr)
        cacheExchangeRate(rate)
        if (isDev && rate !== null) {
            console.debug('BTC exchange rate refreshed', rate)
        }
    }

    void poll()
    pollingInterval = setInterval(poll, ONE_MINUTE_MS)
}

function stopPolling() {
    if (!pollingInterval) {
        return
    }

    clearInterval(pollingInterval)
    pollingInterval = null
}

//@mempool
export function useMempoolHook() {
    const { wallet } = useWalletInfoStore()
    const fallback_xr = useStore($syron)?.exchange_rate
    const wsRef = useRef<WebSocket | null>(null)
    const trackedTxsRef = useRef<Set<string>>(new Set())

    const getXR = useCallback(async (): Promise<number> => {
        const now = Date.now()
        if (lastRate && now - lastRateTimestamp < ONE_MINUTE_MS) {
            return lastRate
        }

        const rate = await fetchLatestExchangeRate(Number(fallback_xr))

        console.log('BTC Exchange Rate', rate)
        if (rate === null) {
            throw new Error('Unable to retrieve BTC exchange rate')
        }

        cacheExchangeRate(rate)
        return rate
    }, [fallback_xr])

    useEffect(() => {
        activeSubscribers += 1
        ensurePolling(Number(fallback_xr))

        return () => {
            activeSubscribers = Math.max(0, activeSubscribers - 1)
            if (activeSubscribers === 0) {
                stopPolling()
            }
        }
    }, [fallback_xr])

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

        const sdbAddress = wallet.address ? wallet.sdbAddress : null
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
            if (isDev) {
                console.log('🔗 Subscribed to', sdbAddress)
            }
        }

        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data)

                // mempool txs (unconfirmed)
                if (msg['address-transactions']) {
                    const tx = msg['address-transactions'][0]
                    if (isDev) {
                        console.log(
                            '🟡 mempool tx',
                            tx.txid,
                            'touching',
                            sdbAddress
                        )
                    }
                }

                // confirmed txs (block)
                if (msg['block-transactions']) {
                    const tx = msg['block-transactions'][0]
                    if (isDev) {
                        console.log(
                            '🟢 confirmed tx',
                            tx.txid,
                            'touching',
                            sdbAddress
                        )
                    }
                }

                if (msg['transaction']) {
                    const tx = msg['transaction']
                    if (isDev) {
                        console.log('🔔 tracked tx update', tx.txid)
                    }
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
            if (isDev) {
                console.log('🔌 WS closed for', sdbAddress)
            }
        }

        return cleanup
    }, [wallet.address, wallet.sdbAddress, resendTrackedTransactions])

    return {
        getXR,
        subscribeSdb,
        trackTransaction,
    }
}
