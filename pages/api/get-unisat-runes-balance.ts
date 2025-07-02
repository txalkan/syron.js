import type { NextApiRequest, NextApiResponse } from 'next'
import { unisatApi } from '../../src/utils/unisat/api'
import nextCors from 'nextjs-cors'
import { sanitize, sortKeys } from '../../src/utils/gatewayResponse'

import { createClient } from 'redis'

const redis = await createClient({ url: process.env.REDIS_URL }).connect()

type Data = {
    amount?: string
    error?: string
}

// Define the structure of the allowed response
const allowedKeys = {
    amount: '',
}

const runeid = '902268:517' // @review (alpha)

const fetchWithRetry_ = async (txid: string, index: string): Promise<any> => {
    // 1. First attempt
    let data = await unisatApi.getRunesBalance(txid, index)

    // 2. If the first attempt returns null, wait and try once more
    if (data == null) {
        console.warn(
            'Indexer data is null, waiting 10 seconds for one retry...'
        )
        await new Promise((resolve) => setTimeout(resolve, 10000)) // 10-second wait

        // 3. Second and final attempt
        data = await unisatApi.getRunesBalance(txid, index)
    }

    return data // Return whatever we have after the final attempt (could still be null)
}

// Helper function to sleep for a specified duration
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Data>
) {
    // @dev run the cors middleware
    // nextjs-cors uses the cors package, so we can pass the same options.
    await nextCors(request, response, {
        origin: '*', // or the specific origin you want to give access to,
        methods: ['GET'], //, 'POST', 'PUT', 'DELETE'],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    })

    // @dev cache response and revalidate every 60 seconds
    response.setHeader('Cache-Control', 'public, s-maxage=60')

    const { txid, index } = request.query as {
        txid: string
        index: string
    }

    if (!txid || Array.isArray(txid)) {
        response.status(400).json({
            error: 'invalid id',
        })
        return
    }

    const cacheKey = `runes-balance:${txid}:${index}`
    const lockKey = `runes-balance-lock:${txid}:${index}`

    try {
        const cachedRes = await redis.get(cacheKey)
        if (cachedRes) {
            console.warn(`[${cacheKey}] CACHE HIT - data sent: ${cachedRes}`)
            return response.status(200).json(JSON.parse(cachedRes))
        }

        console.log(`[${cacheKey}] CACHE MISS`)

        // @dev when no cache, try to acquire a lock
        // The 'NX' option means "set only if the key does not exist".
        // This is an atomic operation. Only one process will succeed.
        const lockAcquired = await redis.set(lockKey, 'true', {
            EX: 15,
            NX: true,
        })

        if (lockAcquired) {
            console.log(`[${cacheKey}] LOCK ACQUIRED. Fetching from UniSat...`)
            try {
                // This is the "leader". It's responsible for fetching the data.
                const data = await fetchWithRetry_(txid, index)

                if (data == null) {
                    return response
                        .status(404)
                        .json({ error: 'Data not found.' })
                }

                const rune_obj = findByRuneid(data, runeid)
                const result: Data = !rune_obj
                    ? { amount: '0' }
                    : sortKeys(sanitize(rune_obj, allowedKeys))

                // Set the data cache and release the lock by deleting it
                await redis.set(cacheKey, JSON.stringify(result), { EX: 60 })

                console.log(
                    `[${cacheKey}] RESULT from UniSat:`,
                    JSON.stringify(result, null, 2)
                )
                return response.status(200).json(result)
            } finally {
                // IMPORTANT: Always release the lock
                await redis.del(lockKey)
            }
        } else {
            // @dev Lock not acquired, another process is fetching.
            console.log(`[${cacheKey}] Lock busy. Waiting for cache...`)
            await sleep(2000) // Wait 2 seconds
            // Try checking the cache again.
            const finalData = await redis.get(cacheKey)
            if (finalData) {
                console.log(
                    `[${cacheKey}] Data found after waiting`,
                    JSON.stringify(finalData, null, 2)
                )
                return response.status(200).json(JSON.parse(finalData))
            } else {
                // If data is still not available after waiting, return an error.
                return response
                    .status(408)
                    .json({ error: 'Request timed out waiting for data.' })
            }
        }

        const fetchWithRetry = async (
            maxRetryTime: number = 3 * 60 * 1000, // 3 minutes in milliseconds
            retryInterval: number = 10000
        ): Promise<any> => {
            const startTime = Date.now()
            let data: any
            while (true) {
                data = await unisatApi.getRunesBalance(txid, index)
                if (data) {
                    break
                }

                if (Date.now() - startTime >= maxRetryTime) {
                    throw new Error('the data is wrong - please try again')
                }

                console.log('indexer data is null, retrying...')
                await new Promise((resolve) =>
                    setTimeout(resolve, retryInterval)
                )
            }
            return data
        }

        //const data = await fetchWithRetry()

        // if (!data) {
        //     response.status(404).json({ error: 'no data found' })
        // } else {
        //     console.log('@response unisat data:', JSON.stringify(data, null, 2))
        //     // @dev filter out the runeid object or throw error if undefined
        //     const rune_obj = findByRuneid(data, runeid)
        //     if (!rune_obj) {
        //         throw new Error(`Rune with id ${runeid} not found`)
        //     }
        //     const res = sortKeys(sanitize(rune_obj, allowedKeys))

        //     await redis.set(cacheKey, JSON.stringify(res), { EX: 30 })

        //     response.status(200).json(res)
        // }
    } catch (error) {
        console.error(`[${cacheKey}] ERROR:`, error)
        return response.status(500).json({
            error: error instanceof Error ? error.message : 'unknown error',
        })

        // @dev check if it's an Error object to safely access its .message property
        // if (error instanceof Error) {
        //     if (error.message.includes(`Rune with id ${runeid} not found`)) {
        //         const res = { amount: '0' }
        //         // @note this is an expected "error", so we return a successful response
        //         await redis.set(cacheKey, JSON.stringify(res), { EX: 30 })
        //         return response.status(200).json(res)
        //     }
        // }
    }
}

function findByRuneid(arr: { runeid: string }[], runeid: string) {
    return arr.find((obj) => obj.runeid === runeid)
}
