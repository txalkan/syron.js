import { createClient } from 'redis'

// Redis client instance
let redis: ReturnType<typeof createClient> | null = null

/**
 * Get Redis client instance with connection management
 * @returns Redis client or null if connection fails
 */
export async function getRedisClient() {
    if (redis && redis.isOpen) return redis
    if (!process.env.REDIS_URL) return null

    try {
        redis = createClient({ url: process.env.REDIS_URL })
        await redis.connect()
        return redis
    } catch (err) {
        console.error('Redis connection failed:', err)
        redis = null
        return null
    }
}

/**
 * Get cached value from Redis
 * @param key Cache key
 * @returns Cached value or null
 */
export async function getFromCache(key: string): Promise<string | null> {
    try {
        const client = await getRedisClient()
        if (!client) return null
        return await client.get(key)
    } catch (err) {
        console.error('Redis get error:', err)
        return null
    }
}

/**
 * Set value in Redis cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttlSeconds Time to live in seconds (default: 3600 = 1 hour)
 */
export async function setCache(
    key: string,
    value: string,
    ttlSeconds: number = 3600
): Promise<void> {
    try {
        const client = await getRedisClient()
        if (!client) return

        if (ttlSeconds === 0) {
            // Permanent storage (no expiration)
            await client.set(key, value)
        } else {
            // Temporary storage with expiration
            await client.set(key, value, { EX: ttlSeconds })
        }
    } catch (err) {
        console.error('Redis set error:', err)
    }
}

/**
 * Delete key from Redis cache
 * @param key Cache key to delete
 */
export async function deleteCache(key: string): Promise<void> {
    try {
        const client = await getRedisClient()
        if (!client) return
        await client.del(key)
    } catch (err) {
        console.error('Redis delete error:', err)
    }
}

/**
 * Set distributed lock in Redis
 * @param key Lock key
 * @param value Lock value
 * @param ttlSeconds Lock expiration in seconds
 * @returns true if lock acquired, false if already locked
 */
export async function setLock(
    key: string,
    value: string = 'true',
    ttlSeconds: number = 15
): Promise<boolean> {
    try {
        const client = await getRedisClient()
        if (!client) return false
        const result = await client.set(key, value, {
            NX: true,
            EX: ttlSeconds,
        })
        return result === 'OK'
    } catch (err) {
        console.error('Redis lock error:', err)
        return false
    }
}

/**
 * Release distributed lock from Redis
 * @param key Lock key to release
 */
export async function releaseLock(key: string): Promise<void> {
    try {
        const client = await getRedisClient()
        if (!client) return
        await client.del(key)
    } catch (err) {
        console.error('Redis unlock error:', err)
    }
}

/**
 * Cache helper for SDB addresses (permanent - no expiration)
 */
export const sdbAddressCache = {
    get: (id: string) => getFromCache(`sdb-addr:${id}`),
    set: (id: string, address: string) =>
        setCache(`sdb-addr:${id}`, address, 0), // 0 = permanent (no expiration)
}

/**
 * Cache helper for complete SDB data (1 hour TTL)
 */
export const sdbDataCache = {
    get: (id: string) => getFromCache(`sdb-data:${id}`),
    set: (id: string, data: string) =>
        setCache(`sdb-data:${id}`, data, 60 * 60),
}

/**
 * Lock helper for SDB operations
 */
export const sdbLock = {
    acquire: (id: string) => setLock(`sdb-lock:${id}`),
    release: (id: string) => releaseLock(`sdb-lock:${id}`),
}
