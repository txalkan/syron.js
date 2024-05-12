// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { unisatApi } from '../../src/utils/unisat/api'
import nextCors from 'nextjs-cors'

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
    // @dev Run the cors middleware
    // nextjs-cors uses the cors package, so we can pass the same options.
    await nextCors(req, res, {
        // Options here
        origin: '*', // Or the specific origin you want to give access to,
        methods: ['GET'], //, 'POST', 'PUT', 'DELETE'],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    })

    const { id } = req.query

    if (!id || Array.isArray(id)) {
        res.status(400).json({
            error: 'Invalid ID',
        })
        return
    }

    // unisatApi
    //     .getInscriptionInfo(id)
    //     .then((data) => {
    //         res.status(200).json({ data })
    //     })
    //     .catch((error) => {
    //         res.status(500).json({ error })
    //     })

    // @dev If the last call was less than 333ms ago & the data is in the cache, return it
    if (Date.now() - lastCall < 333 && cache[id]) {
        res.status(200).json({ data: cache[id] })
        return
    } else {
        try {
            const data = await unisatApi.getInscriptionInfo(id)
            if (!data) {
                res.status(404).json({ error: 'No data found' })
            } else {
                // @dev Save the data in the cache
                cache[id] = data
                lastCall = Date.now()
                res.status(200).json({ data })
                // res.status(200).json({ data: { res: data, cache: cache[id] } })
            }
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }
}