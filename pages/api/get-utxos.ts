// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import nextCors from 'nextjs-cors'
import { unisatApi } from '../../src/utils/unisat/api'

/**
 * Bitcoin address validation utility (same as in deposit-psbt.ts)
 */
function isTaprootAddress(addr: string) {
    return addr.startsWith('bc1p')
}

function isP2WPKHAddress(addr: string) {
    return addr.startsWith('bc1') && addr.length === 42
}

function isLegacyAddress(addr: string) {
    return addr.startsWith('1') && addr.length >= 26 && addr.length <= 35
}

function isP2SHAddress(addr: string) {
    return addr.startsWith('3') && addr.length >= 26 && addr.length <= 35
}

function isValidBitcoinAddress(addr: string): boolean {
    return (
        isTaprootAddress(addr) ||
        isP2WPKHAddress(addr) ||
        isLegacyAddress(addr) ||
        isP2SHAddress(addr)
    )
}

type Data = {
    data?: any[]
    error?: string
}

interface UTXO {
    txid: string
    vout: number
    status: {
        confirmed: boolean
        block_height?: number
        block_hash?: string
        block_time?: number
    }
    value: number
}

const utxoCache = new Map<string, { data: UTXO[]; timestamp: number }>() // Map address to UTXOs with timestamp

const RUNES_VALUE_THRESHOLD = 1000

const INSCRIPTION_CACHE_TTL_MS = 120 * 1000 // 2 minutes
const RUNES_CACHE_TTL_MS = 120 * 1000

const inscriptionCheckCache = new Map<
    string,
    { result: boolean; timestamp: number }
>()

const runesCheckCache = new Map<
    string,
    { result: boolean; timestamp: number }
>()

function shouldCheckRunes(value: number): boolean {
    return value > 0 && value <= RUNES_VALUE_THRESHOLD
}

function hasNonZeroAmountValue(value: unknown): boolean {
    if (value === undefined || value === null) {
        return false
    }

    if (typeof value === 'number') {
        return value !== 0
    }

    if (typeof value === 'bigint') {
        return value !== BigInt(0)
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.length === 0) {
            return false
        }

        const numeric = Number(trimmed)
        if (!Number.isNaN(numeric)) {
            return numeric !== 0
        }

        return true
    }

    return false
}

function normalizeRuneEntries(data: any): any[] {
    if (!data) {
        return []
    }

    if (Array.isArray(data)) {
        return data
    }

    if (Array.isArray(data?.data)) {
        return data.data
    }

    if (Array.isArray(data?.result)) {
        return data.result
    }

    if (Array.isArray(data?.list)) {
        return data.list
    }

    if (Array.isArray(data?.balances)) {
        return data.balances
    }

    if (Array.isArray(data?.items)) {
        return data.items
    }

    if (Array.isArray(data?.balanceList)) {
        return data.balanceList
    }

    return []
}

function hasRunesData(data: any): boolean {
    const entries = normalizeRuneEntries(data)

    if (entries.length > 0) {
        const containsAmount = entries.some((entry) => {
            if (!entry || typeof entry !== 'object') {
                return false
            }

            return (
                hasNonZeroAmountValue(entry.amount) ||
                hasNonZeroAmountValue(entry.balance) ||
                hasNonZeroAmountValue(entry.quantity) ||
                hasNonZeroAmountValue(entry.totalBalance) ||
                hasNonZeroAmountValue(entry.totalAmount)
            )
        })

        return containsAmount || entries.length > 0
    }

    if (!data || typeof data !== 'object') {
        return false
    }

    const amountFields = [
        'amount',
        'balance',
        'quantity',
        'totalBalance',
        'totalAmount',
        'availableBalance',
    ]

    return amountFields.some((field) =>
        hasNonZeroAmountValue((data as any)[field])
    )
}

async function utxoHasInscription(utxo: UTXO): Promise<boolean> {
    const cacheKey = `${utxo.txid}:${utxo.vout}`
    const cached = inscriptionCheckCache.get(cacheKey)
    const now = Date.now()

    if (cached && now - cached.timestamp < INSCRIPTION_CACHE_TTL_MS) {
        return cached.result
    }

    const inscriptionId = `${utxo.txid}i${utxo.vout}`
    console.log('@dev inscriptionId:', inscriptionId)

    try {
        const info = await unisatApi.getInscriptionInfo(inscriptionId)
        console.log('@dev info:', JSON.stringify(info, null, 2))
        if (info) {
            const hasInscriptionsArray = Array.isArray(info.inscriptions)
                ? info.inscriptions.length > 0
                : false

            const hasBrc20 =
                info.brc20 &&
                typeof info.brc20 === 'object' &&
                Object.keys(info.brc20).length > 0

            const shouldSkip = Boolean(hasInscriptionsArray || hasBrc20)

            inscriptionCheckCache.set(cacheKey, {
                result: shouldSkip,
                timestamp: now,
            })
            return shouldSkip
        }

        inscriptionCheckCache.set(cacheKey, { result: false, timestamp: now })
        return false
    } catch (error) {
        if (isNotFoundInscriptionError(error)) {
            inscriptionCheckCache.set(cacheKey, {
                result: false,
                timestamp: now,
            })
            return false
        }

        throw error
    }
}

async function utxoHasRunes(utxo: UTXO): Promise<boolean> {
    const cacheKey = `${utxo.txid}:${utxo.vout}`
    const cached = runesCheckCache.get(cacheKey)
    const now = Date.now()

    if (cached && now - cached.timestamp < RUNES_CACHE_TTL_MS) {
        return cached.result
    }

    try {
        const runesData = await unisatApi.getRunesBalance(
            utxo.txid,
            String(utxo.vout)
        )

        const result = hasRunesData(runesData)
        runesCheckCache.set(cacheKey, { result, timestamp: now })
        return result
    } catch (error) {
        if (isNotFoundRunesError(error)) {
            runesCheckCache.set(cacheKey, { result: false, timestamp: now })
            return false
        }

        throw error
    }
}

function isNotFoundInscriptionError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false
    }

    const message = error.message.toLowerCase()

    const indicators = [
        'not exist',
        'not found',
        'invalid inscription',
        'inscription info not exist',
        'get nft index failed',
    ]

    return indicators.some((indicator) => message.includes(indicator))
}

function isNotFoundRunesError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false
    }

    const message = error.message.toLowerCase()

    return (
        message.includes('not exist') ||
        message.includes('not found') ||
        message.includes('no rune data') ||
        message.includes('no data available')
    )
}

function isMissingApiKeyError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false
    }

    const message = error.message.toLowerCase()

    return message.includes('api key') && message.includes('not defined')
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Data>
) {
    try {
        // @dev Run the cors middleware
        await nextCors(request, response, {
            origin: '*',
            methods: ['GET'],
            optionsSuccessStatus: 200,
        })

        // @dev Cache response and revalidate every 10 seconds
        response.setHeader('Cache-Control', 'public, s-maxage=10')

        const { address } = request.query

        if (!address || Array.isArray(address)) {
            response.status(400).json({
                error: 'Invalid address parameter',
            })
            return
        }

        // Validate Bitcoin address using the same utility as deposit-psbt.ts
        if (!isValidBitcoinAddress(address)) {
            response.status(400).json({
                error: 'Invalid Bitcoin address format',
            })
            return
        }

        // Check cache first (10 second TTL)
        const cacheKey = address.toLowerCase()
        const cached = utxoCache.get(cacheKey)
        const now = Date.now()

        if (cached && now - cached.timestamp < 10000) {
            console.log(`Returning cached UTXOs for ${address}`)
            response.status(200).json({
                data: cached.data,
            })
            return
        }

        // @network defaults to mainnet
        let url: URL = new URL(
            `https://mempool.space/api/address/${address}/utxo`
        )
        const version = process.env.NEXT_PUBLIC_SYRON_VERSION
        if (version === 'testnet') {
            url = new URL(
                `https://mempool.space/testnet4/api/address/${address}/utxo`
            )
        }

        console.log(`Fetching UTXOs from mempool.space for ${address}`)

        const mempoolResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'SSIBrowser/1.0',
            },
        })

        if (!mempoolResponse.ok) {
            throw new Error(
                `Mempool API request failed with status ${mempoolResponse.status}`
            )
        }

        const utxos: UTXO[] = await mempoolResponse.json()

        // Validate and format UTXO data - only accept confirmed UTXOs
        const validatedUtxos = utxos.filter((utxo) => {
            return (
                utxo.txid &&
                typeof utxo.vout === 'number' &&
                typeof utxo.value === 'number' &&
                utxo.vout >= 0 &&
                utxo.value > 0 &&
                utxo.status &&
                utxo.status.confirmed === true
                // &&
                // utxo.value > 546
            )
        })

        const filteredUtxos: UTXO[] = []

        console.log(
            '@dev validatedUtxos:',
            JSON.stringify(validatedUtxos, null, 2)
        )

        for (const utxo of validatedUtxos) {
            try {
                const hasInscription = await utxoHasInscription(utxo)
                if (hasInscription) {
                    console.log(
                        `Skipping UTXO ${utxo.txid}:${utxo.vout} due to inscription metadata`
                    )
                    continue
                }

                if (shouldCheckRunes(utxo.value)) {
                    const hasRunes = await utxoHasRunes(utxo)
                    if (hasRunes) {
                        console.log(
                            `Skipping UTXO ${utxo.txid}:${utxo.vout} due to runes data`
                        )
                        continue
                    }
                }
            } catch (checkError) {
                if (isMissingApiKeyError(checkError)) {
                    throw checkError
                }

                console.warn(
                    `Failed to evaluate inscriptions/runes for ${utxo.txid}:${utxo.vout}:`,
                    checkError
                )
                continue
            }

            filteredUtxos.push(utxo)
        }

        // Cache the result
        utxoCache.set(cacheKey, {
            data: filteredUtxos,
            timestamp: now,
        })

        // Clean up old cache entries (older than 5 minutes)
        for (const [key, value] of utxoCache.entries()) {
            if (now - value.timestamp > 300000) {
                utxoCache.delete(key)
            }
        }

        console.log(
            `Fetched ${filteredUtxos.length} spendable UTXOs for ${address}`
        )

        response.status(200).json({
            data: filteredUtxos,
        })
    } catch (error) {
        console.error('@response UTXO fetch error:', error)
        response.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
