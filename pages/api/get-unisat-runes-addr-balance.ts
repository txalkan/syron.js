import type { NextApiRequest, NextApiResponse } from 'next'
import { unisatApi } from '../../src/utils/unisat/api'
import nextCors from 'nextjs-cors'
import { sanitize, sortKeys } from '../../src/utils/gatewayResponse'

import { createClient } from 'redis'

// Initialize Redis with error handling
let redis: any = null
let redisConnected = false

const initializeRedis = async () => {
    if (redis) return redis

    try {
        if (!process.env.REDIS_URL) {
            console.warn(
                'REDIS_URL not configured, running without Redis cache'
            )
            return null
        }

        redis = createClient({ url: process.env.REDIS_URL })
        await redis.connect()
        redisConnected = true
        console.log('Redis connected successfully')
        return redis
    } catch (error) {
        console.error('Failed to connect to Redis:', {
            error: error,
            message:
                error instanceof Error ? error.message : 'Unknown Redis error',
            redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured',
        })
        redisConnected = false
        return null
    }
}

type Data = {
    data?: {
        runeid: string
        amount: string
    }
    error?: string
    details?: string
    requestId?: string
    timestamp?: string
}

// Define the structure of the allowed response
const allowedKeys = {
    amount: '',
}

const fetchWithRetry_ = async (addr: string, runeid: string): Promise<any> => {
    // 1. First attempt
    let data = await unisatApi.getRunesAddrBalance(addr, runeid)

    // 2. If the first attempt returns null, wait and try once more
    if (data == null) {
        console.warn(
            'Indexer data is null, waiting 10 seconds for one retry...'
        )
        await new Promise((resolve) => setTimeout(resolve, 10000)) // 10-second wait

        // 3. Second and final attempt
        data = await unisatApi.getRunesAddrBalance(addr, runeid)
    }

    return data // Return whatever we have after the final attempt (could still be null)
}

// Helper function to sleep for a specified duration
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Data>
) {
    const startTime = Date.now()
    const requestId = Math.random().toString(36).substring(2, 15)

    console.log(`[${requestId}] API Request started:`, {
        method: request.method,
        url: request.url,
        query: request.query,
        headers: {
            'user-agent': request.headers['user-agent'],
            referer: request.headers['referer'],
        },
        timestamp: new Date().toISOString(),
    })

    // @dev run the cors middleware
    // nextjs-cors uses the cors package, so we can pass the same options.
    try {
        await nextCors(request, response, {
            origin: '*', // or the specific origin you want to give access to,
            methods: ['GET'], //, 'POST', 'PUT', 'DELETE'],
            optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        })
    } catch (corsError) {
        console.error(`[${requestId}] CORS Error:`, {
            error: corsError,
            message:
                corsError instanceof Error
                    ? corsError.message
                    : 'Unknown CORS error',
            stack: corsError instanceof Error ? corsError.stack : undefined,
        })
        return response.status(500).json({
            error: 'CORS configuration error',
            details:
                corsError instanceof Error
                    ? corsError.message
                    : 'Unknown error',
        })
    }

    // @dev cache response and revalidate every 60 seconds
    response.setHeader('Cache-Control', 'public, s-maxage=60')

    const { addr, runeid } = request.query as {
        addr: string
        runeid: string
    }

    console.log(`[${requestId}] Request parameters:`, { addr, runeid })

    if (!addr || Array.isArray(addr)) {
        console.error(`[${requestId}] Invalid address parameter:`, {
            addr,
            type: typeof addr,
        })
        return response.status(400).json({
            error: 'Invalid address parameter',
            details: `Expected string, got: ${typeof addr}`,
            requestId,
        })
    }

    if (!runeid || Array.isArray(runeid)) {
        console.error(`[${requestId}] Invalid runeid parameter:`, {
            runeid,
            type: typeof runeid,
        })
        return response.status(400).json({
            error: 'Invalid runeid parameter',
            details: `Expected string, got: ${typeof runeid}`,
            requestId,
        })
    }

    const cacheKey = `runes-addr-balance:${addr}:${runeid}`
    const lockKey = `runes-addr-balance-lock:${addr}:${runeid}`

    console.log(`[${requestId}] Processing request with keys:`, {
        cacheKey,
        lockKey,
    })

    try {
        // Initialize Redis with error handling
        const redisClient = await initializeRedis()

        if (redisClient && redisConnected) {
            console.log(`[${requestId}] Redis available, using cache`)

            // Check Redis connection
            if (!redisClient.isReady) {
                console.error(`[${requestId}] Redis not ready:`, {
                    redisStatus: redisClient.isReady,
                    redisUrl: process.env.REDIS_URL
                        ? 'configured'
                        : 'not configured',
                })
                throw new Error('Redis connection not available')
            }

            const cachedRes = await redisClient.get(cacheKey)
            if (cachedRes) {
                console.log(`[${requestId}] CACHE HIT - data sent:`, {
                    cacheKey,
                    dataLength: cachedRes.length,
                    dataPreview: cachedRes.substring(0, 100) + '...',
                })
                return response.status(200).json(JSON.parse(cachedRes))
            }

            console.log(`[${requestId}] CACHE MISS - proceeding to fetch data`)

            // @dev when no cache, try to acquire a lock
            // The 'NX' option means "set only if the key does not exist".
            // This is an atomic operation. Only one process will succeed.
            const lockAcquired = await redisClient.set(lockKey, 'true', {
                EX: 15,
                NX: true,
            })

            if (lockAcquired) {
                console.log(
                    `[${requestId}] LOCK ACQUIRED. Fetching from UniSat...`
                )
                try {
                    // This is the "leader". It's responsible for fetching the data.
                    console.log(
                        `[${requestId}] Calling fetchWithRetry_ with:`,
                        {
                            addr,
                            runeid,
                        }
                    )
                    const data = await fetchWithRetry_(addr, runeid)

                    console.log(`[${requestId}] fetchWithRetry_ result:`, {
                        dataType: typeof data,
                        dataIsNull: data === null,
                        dataIsArray: Array.isArray(data),
                        dataLength: Array.isArray(data) ? data.length : 'N/A',
                        dataPreview: data
                            ? JSON.stringify(data).substring(0, 200) + '...'
                            : 'null',
                    })

                    // Print the full response for debugging
                    console.log(
                        `[${requestId}] FULL API RESPONSE:`,
                        JSON.stringify(data, null, 2)
                    )

                    if (data == null) {
                        console.warn(`[${requestId}] Data not found for:`, {
                            addr,
                            runeid,
                        })
                        return response.status(404).json({
                            error: 'Data not found',
                            details:
                                'No runes data available for this address and rune ID',
                            requestId,
                        })
                    }

                    // Handle different response formats from UniSat API
                    let runesData: any[] = []

                    if (Array.isArray(data)) {
                        // Direct array response
                        runesData = data
                    } else if (data && typeof data === 'object') {
                        // Check if data is wrapped in a response object
                        if (data.data && Array.isArray(data.data)) {
                            runesData = data.data
                        } else if (data.result && Array.isArray(data.result)) {
                            runesData = data.result
                        } else {
                            // Single object response, wrap in array
                            runesData = [data]
                        }
                    } else {
                        console.error(
                            `[${requestId}] Unexpected data format:`,
                            {
                                expected: 'array or object',
                                received: typeof data,
                                data: data,
                            }
                        )
                        return response.status(500).json({
                            error: 'Invalid data format',
                            details: 'Expected array or object of runes data',
                            requestId,
                        })
                    }

                    console.log(`[${requestId}] Processing runes data:`, {
                        dataLength: runesData.length,
                        runeIds: runesData
                            .map((item: any) => item.runeid || item.runeId)
                            .join(', '),
                    })

                    const rune_obj = findByRuneid(runesData, runeid)
                    console.log(`[${requestId}] Found rune object:`, {
                        found: !!rune_obj,
                        runeid,
                        runeObj: rune_obj,
                    })

                    // Extract the amount from the rune object
                    let amount = '0'
                    if (rune_obj) {
                        const rawAmount = rune_obj.amount || '0'
                        const divisibility = rune_obj.divisibility || 8

                        // Convert based on divisibility (usually 8 for runes)
                        const numericAmount = parseFloat(rawAmount)
                        if (!isNaN(numericAmount)) {
                            const divisor = Math.pow(10, divisibility)
                            amount = (numericAmount / divisor).toString()
                        } else {
                            amount = '0'
                        }

                        console.log(`[${requestId}] Amount conversion:`, {
                            rawAmount,
                            divisibility,
                            divisor: Math.pow(10, divisibility),
                            convertedAmount: amount,
                        })
                    }

                    const result: Data = { data: { runeid, amount } }

                    console.log(`[${requestId}] Final result:`, result)
                    console.log(
                        `[${requestId}] Response being sent:`,
                        JSON.stringify(result, null, 2)
                    )

                    // Set the data cache and release the lock by deleting it
                    await redisClient.set(cacheKey, JSON.stringify(result), {
                        EX: 60,
                    })
                    console.log(`[${requestId}] Data cached successfully`)

                    const duration = Date.now() - startTime
                    console.log(
                        `[${requestId}] Request completed successfully in ${duration}ms`
                    )

                    return response.status(200).json(result)
                } catch (fetchError) {
                    console.error(
                        `[${requestId}] Error during data fetching:`,
                        {
                            error: fetchError,
                            message:
                                fetchError instanceof Error
                                    ? fetchError.message
                                    : 'Unknown fetch error',
                            stack:
                                fetchError instanceof Error
                                    ? fetchError.stack
                                    : undefined,
                            addr,
                            runeid,
                        }
                    )
                    return response.status(500).json({
                        error: 'Data fetching failed',
                        details:
                            fetchError instanceof Error
                                ? fetchError.message
                                : 'Unknown error',
                        requestId,
                    })
                } finally {
                    // IMPORTANT: Always release the lock
                    try {
                        await redisClient.del(lockKey)
                        console.log(`[${requestId}] Lock released`)
                    } catch (lockError) {
                        console.error(
                            `[${requestId}] Error releasing lock:`,
                            lockError
                        )
                    }
                }
            } else {
                // @dev Lock not acquired, another process is fetching.
                console.log(`[${requestId}] Lock busy. Waiting for cache...`)
                await sleep(2000) // Wait 2 seconds
                // Try checking the cache again.
                const finalData = await redisClient.get(cacheKey)
                if (finalData) {
                    console.log(`[${requestId}] Data found after waiting:`, {
                        dataLength: finalData.length,
                        dataPreview: finalData.substring(0, 100) + '...',
                    })
                    return response.status(200).json(JSON.parse(finalData))
                } else {
                    // If data is still not available after waiting, return an error.
                    console.error(
                        `[${requestId}] Request timed out waiting for data`
                    )
                    return response.status(408).json({
                        error: 'Request timed out',
                        details: 'Data not available after waiting for lock',
                        requestId,
                    })
                }
            }
        } else {
            // Redis not available, fetch directly without caching
            console.log(
                `[${requestId}] Redis not available, fetching directly from UniSat`
            )

            try {
                console.log(`[${requestId}] Calling fetchWithRetry_ with:`, {
                    addr,
                    runeid,
                })
                const data = await fetchWithRetry_(addr, runeid)

                console.log(`[${requestId}] fetchWithRetry_ result:`, {
                    dataType: typeof data,
                    dataIsNull: data === null,
                    dataIsArray: Array.isArray(data),
                    dataLength: Array.isArray(data) ? data.length : 'N/A',
                    dataPreview: data
                        ? JSON.stringify(data).substring(0, 200) + '...'
                        : 'null',
                })

                // Print the full response for debugging
                console.log(
                    `[${requestId}] FULL API RESPONSE:`,
                    JSON.stringify(data, null, 2)
                )

                if (data == null) {
                    console.warn(`[${requestId}] Data not found for:`, {
                        addr,
                        runeid,
                    })
                    return response.status(404).json({
                        error: 'Data not found',
                        details:
                            'No runes data available for this address and rune ID',
                        requestId,
                    })
                }

                // Handle different response formats from UniSat API
                let runesData: any[] = []

                if (Array.isArray(data)) {
                    // Direct array response
                    runesData = data
                } else if (data && typeof data === 'object') {
                    // Check if data is wrapped in a response object
                    if (data.data && Array.isArray(data.data)) {
                        runesData = data.data
                    } else if (data.result && Array.isArray(data.result)) {
                        runesData = data.result
                    } else {
                        // Single object response, wrap in array
                        runesData = [data]
                    }
                } else {
                    console.error(`[${requestId}] Unexpected data format:`, {
                        expected: 'array or object',
                        received: typeof data,
                        data: data,
                    })
                    return response.status(500).json({
                        error: 'Invalid data format',
                        details: 'Expected array or object of runes data',
                        requestId,
                    })
                }

                console.log(`[${requestId}] Processing runes data:`, {
                    dataLength: runesData.length,
                    runeIds: runesData
                        .map((item: any) => item.runeid || item.runeId)
                        .join(', '),
                })

                const rune_obj = findByRuneid(runesData, runeid)
                console.log(`[${requestId}] Found rune object:`, {
                    found: !!rune_obj,
                    runeid,
                    runeObj: rune_obj,
                })

                // Extract the amount from the rune object
                let amount = '0'
                if (rune_obj) {
                    const rawAmount = rune_obj.amount || '0'
                    const divisibility = rune_obj.divisibility || 8

                    // Convert based on divisibility (usually 8 for runes)
                    const numericAmount = parseFloat(rawAmount)
                    if (!isNaN(numericAmount)) {
                        const divisor = Math.pow(10, divisibility)
                        amount = (numericAmount / divisor).toString()
                    } else {
                        amount = '0'
                    }

                    console.log(`[${requestId}] Amount conversion:`, {
                        rawAmount,
                        divisibility,
                        divisor: Math.pow(10, divisibility),
                        convertedAmount: amount,
                    })
                }

                const result: Data = { data: { runeid, amount } }

                console.log(`[${requestId}] Final result (no cache):`, result)
                console.log(
                    `[${requestId}] Response being sent:`,
                    JSON.stringify(result, null, 2)
                )

                const duration = Date.now() - startTime
                console.log(
                    `[${requestId}] Request completed successfully in ${duration}ms (no cache)`
                )

                return response.status(200).json(result)
            } catch (fetchError) {
                console.error(
                    `[${requestId}] Error during direct data fetching:`,
                    {
                        error: fetchError,
                        message:
                            fetchError instanceof Error
                                ? fetchError.message
                                : 'Unknown fetch error',
                        stack:
                            fetchError instanceof Error
                                ? fetchError.stack
                                : undefined,
                        addr,
                        runeid,
                    }
                )
                return response.status(500).json({
                    error: 'Data fetching failed',
                    details:
                        fetchError instanceof Error
                            ? fetchError.message
                            : 'Unknown error',
                    requestId,
                })
            }
        }
    } catch (error) {
        const duration = Date.now() - startTime
        console.error(`[${requestId}] CRITICAL ERROR after ${duration}ms:`, {
            error: error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            requestContext: {
                addr,
                runeid,
                cacheKey,
                lockKey,
            },
            redisStatus: redisConnected,
            timestamp: new Date().toISOString(),
        })

        return response.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error',
            requestId,
            timestamp: new Date().toISOString(),
        })
    }
}

function findByRuneid(
    arr: {
        runeid: string
        amount?: string
        balance?: string
        quantity?: string
        divisibility?: number
    }[],
    runeid: string
) {
    return arr.find((obj) => obj.runeid === runeid)
}
