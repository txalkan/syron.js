// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { unisatApi } from '../../src/utils/unisat/api'
import nextCors from 'nextjs-cors'
import supabase from '../../src/utils/supabase'
import { sanitize, sortKeys } from '../../src/utils/gatewayResponse'

type Data = {
    data?: any
    error?: string
}

// Define the structure of the allowed response
const allowedKeys = {
    detail: [
        {
            ticker: '',
            overallBalance: '',
        },
    ],
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

    console.log('@dev get data from Supabase')
    const { data, error } = await supabase
        .from('unisat_brc20_info')
        .select()
        .eq('id', id)
        .single()

    console.log('@response Supabase data:', data, 'error:', error)

    if (!id || Array.isArray(id)) {
        response.status(400).json({
            error: 'Invalid ID',
        })
        return
    }

    // if id found in supabase, send the data - else fetch from unisat
    // @review Fetch data from UniSat API if the Supabase timestamp is older than 10 seconds

    if (data) {
        response
            .status(200)
            .json(sortKeys(sanitize(JSON.parse(data.data), allowedKeys)))
    } else {
        console.log('@dev get data from UniSat')
        try {
            const data_unisat = await unisatApi.getBrc20Info(id)
            if (!data_unisat) {
                response.status(404).json({ error: 'No data found' })
            } else {
                console.log('@response UniSat data:', data_unisat)

                // data_unisat.detail = data_unisat.detail.filter(
                //     (item: { ticker: string }) => item.ticker === 'SYRO'
                // )
                //const balance = data_unisat.detail[0].overallBalance

                await supabase.from('unisat_brc20_info').insert({
                    id,
                    timestamp: new Date(),
                    data: data_unisat,
                })

                response
                    .status(200)
                    .json(sortKeys(sanitize(data_unisat, allowedKeys)))
            }
        } catch (error) {
            console.error('@response UniSat error:', error)
            response.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }
}
