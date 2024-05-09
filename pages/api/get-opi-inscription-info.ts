// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { unisatApi } from '../../src/utils/unisat/api'
import { bisInscriptionInfo } from '../../src/utils/unisat/httpUtils'

type Data = {
    data?: any
    error?: string
}

let cache = {}
let lastCall = Date.now()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const { id } = req.query

    if (!id || Array.isArray(id)) {
        res.status(400).json({
            error: 'Invalid ID',
        })
        return
    }

    // @dev If the last call was less than 6000 ms ago & the data is in the cache, return it
    if (Date.now() - lastCall < 6000 && cache[id]) {
        res.status(200).json({ data: cache[id] })
        return
    } else {
        try {
            const data = await bisInscriptionInfo(id)
            if (!data) {
                res.status(404).json({ error: 'No data found' })
            } else {
                // @dev Save the data in the cache
                cache[id] = data
                lastCall = Date.now()
                res.status(200).json({ data: { res: data, cache: cache[id] } })
            }
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }
}
