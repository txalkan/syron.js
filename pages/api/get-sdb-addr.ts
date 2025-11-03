import type { NextApiRequest, NextApiResponse } from 'next'
import nextCors from 'nextjs-cors'
import { basic_bitcoin_syron } from '../../src/declarations/basic_bitcoin_tyron'
import { unisatBalance } from '../../src/utils/unisat/httpUtils'
import {
    sdbAddressCache,
    getFromCache,
    setCache,
} from '../../src/utils/redisConfig'

type Data = {
    data?: any
    error?: string
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Data>
) {
    try {
        // CORS middleware
        await nextCors(request, response, {
            origin: '*',
            methods: ['GET'],
            optionsSuccessStatus: 200,
        })

        response.setHeader('Cache-Control', 'public, s-maxage=1')

        const { id } = request.query

        if (!id || Array.isArray(id)) {
            response.status(400).json({ error: 'Invalid ID' })
            return
        }

        // 1. Try to get SDB address from Redis, fallback to ICP
        const address = await getSdbAddress(id)
        if (!address) {
            response.status(404).json({ error: 'No box address found' })
            return
        }

        // 2. Fetch account data from ICP
        const data = await fetchAccountData(id, address)
        response.status(200).json({ data })
    } catch (error) {
        console.error(
            '@dev get-sdb-addr error.message:',
            error instanceof Error ? error.message : 'N/A'
        )
        console.error(
            '@dev get-sdb-addr error stack:',
            error instanceof Error ? error.stack : 'No stack trace'
        )
        response.status(500).json({
            error: error instanceof Error ? error.message : String(error),
        })
    }
}

async function getSdbAddress(id: string): Promise<string | null> {
    // Try Redis cache first
    const cached = await sdbAddressCache.get(id)
    if (cached) {
        console.log(`Using cached SDB address for ${id}`)
        return cached
    }

    // Fallback to ICP
    console.log(`Fetching SDB address from ICP for ${id}`)
    const syron = basic_bitcoin_syron()
    const address = await syron.get_box_address({
        ssi: id,
        op: { getsyron: null },
    })

    // Cache in Redis if available
    if (address) {
        await sdbAddressCache.set(id, address)
        console.log(`Cached SDB address for ${id}`)
    }

    return address
}

async function fetchAccountData(id: string, address: string) {
    const syron = basic_bitcoin_syron()

    // Get BTC balance (always fetch fresh - no caching)
    console.log(
        `[${new Date().toLocaleString()}] Fetching BTC balance for address: ${address}`
    )
    const balance = await unisatBalance(address)

    // Get account data from Syron
    const account = await syron.get_account(id)

    if (account.Ok) {
        return {
            address,
            balance,
            ratio: account.Ok.collateral_ratio.toString(),
            btc: account.Ok.btc_1.toString(),
            susd: account.Ok.susd_1.toString(),
            bal: account.Ok.susd_2.toString(),
            brc20: account.Ok.susd_3.toString(),
            exchange_rate: account.Ok.exchange_rate.toString(),
        }
    } else {
        console.error('@dev account error:', JSON.stringify(account.Err))
        throw new Error(JSON.stringify(account.Err))
    }
}
