// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import nextCors from 'nextjs-cors'
import { unisatApi } from '../../src/utils/unisat/api'

// export const config = {
//     maxDuration: 50,
// }

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
        methods: ['POST'], //, 'GET', 'PUT', 'DELETE'],
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    })

    // @dev Cache response and revalidate every second
    response.setHeader('Cache-Control', 'public, s-maxage=1')

    const {
        receiveAddress,
        feeRate,
        devAddress,
        devFee,
        brc20Ticker,
        brc20Amount,
        outputValue,
    } = request.query as {
        receiveAddress: string
        feeRate: string
        devAddress: string
        devFee: string
        brc20Ticker: string
        brc20Amount: string
        outputValue: string
    }

    console.log(
        '@dev post data to UniSat: ',
        JSON.stringify(request.query, null, 2)
    )
    try {
        const order = await unisatApi.createTransfer({
            receiveAddress,
            feeRate: Number(feeRate),
            outputValue: Number(outputValue),
            devAddress,
            devFee: Number(devFee),
            brc20Ticker,
            brc20Amount,
        })
        console.log('@response UniSat data:', JSON.stringify(order, null, 2))

        response.status(200).json({ data: order })
    } catch (error) {
        console.error('@response UniSat error:', error)
        response.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
