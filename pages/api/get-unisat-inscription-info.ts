// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { unisatApi } from '../../src/utils/unisat/api'
import nextCors from 'nextjs-cors'
import supabase from '../../src/utils/supabase'

type Data = {
    data?: any
    error?: string
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Data>
) {
    // @dev Run the cors middleware
    // nextjs-cors uses the cors package, so we can pass the same options.
    await nextCors(request, response, {
        // Options here
        origin: '*', // Or the specific origin you want to give access to,
        methods: ['GET'], //, 'POST', 'PUT', 'DELETE'],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    })

    // @dev Cache response and revalidate every second
    response.setHeader('Cache-Control', 'public, s-maxage=1')

    const { id } = request.query

    // Get the data from Supabase
    const { data, error } = await supabase
        .from('unisat_inscription_info')
        .select('id, timestamp, data')
        .eq('id', id)
        .single()

    console.log('supabase', data, error)

    if (!id || Array.isArray(id)) {
        response.status(400).json({
            error: 'Invalid ID',
        })
        return
    }

    try {
        const data = await unisatApi.getInscriptionInfo(id)
        if (!data) {
            response.status(404).json({ error: 'No data found' })
        } else {
            response.status(200).json({ data })
        }
    } catch (error) {
        response.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
