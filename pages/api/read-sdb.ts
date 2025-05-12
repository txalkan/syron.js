// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import nextCors from 'nextjs-cors'
import { basic_bitcoin_syron } from '../../src/declarations/basic_bitcoin_tyron'
import { unisatBalance } from '../../src/utils/unisat/httpUtils'

type Data = {
    data?: any
    error?: string
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse<Data>
) {
    try {
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

        // @network defaults to mainnet
        const version = process.env.NEXT_PUBLIC_SYRON_VERSION
        let canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SYRON
        if (version === '2') {
            canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SYRON_2
        } else if (version === 'testnet') {
            canisterId = process.env.NEXT_PUBLIC_CANISTER_ID_SYRON_TESTNET
        }

        let name = `syron-${canisterId}`

        console.log(`@dev minter canister: ${name}`)

        if (!id || Array.isArray(id)) {
            response.status(400).json({
                error: 'Invalid ID',
            })
            return
        }

        // @dev If the ID is found, send the data; otherwise, fetch from the Internet Computer

        console.log('@dev get data from ICP')

        const syron = basic_bitcoin_syron()
        let address = await syron.get_box_address({
            ssi: id,
            op: { getsyron: null },
        })
        if (!address) {
            response.status(404).json({ error: 'No box address found' })
        }

        // @dev read btc collateral deposit
        const balance = await unisatBalance(address)

        // @dev read account from ICP
        const account = await syron.read_account(id)
        console.log('@response account balances:', account)

        let ratio = '1500' //@review add btc_0
        let btc = account[1].toString()
        let susd = account[2].toString()
        let bal = account[3].toString()
        let brc20 = account[4].toString()

        response.status(200).json({
            data: { address, balance, ratio, btc, susd, bal, brc20 },
        })
    } catch (error) {
        console.error('@response account error:', error)
        response.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
