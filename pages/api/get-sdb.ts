// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import nextCors from 'nextjs-cors'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../../src/utils/firebase/firebaseConfig'
import { basic_bitcoin_syron as syron } from '../../src/declarations/basic_bitcoin_tyron'
import { mempoolBalance } from '../../src/utils/unisat/httpUtils'

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

    console.log('@dev get data from Firebase')
    const querySnapshot = await getDocs(collection(db, 'sdb'))
    const dataList = querySnapshot.docs.map((doc) => ({ ...doc.data() }))
    const data = dataList.find((val) => val?.id === id)

    console.log('@response Firebase data:', JSON.stringify(data, null, 2))

    if (!id || Array.isArray(id)) {
        response.status(400).json({
            error: 'Invalid ID',
        })
        return
    }

    // @dev If the ID is found, send the data; otherwise, fetch from the Internet Computer

    let address: string = ''
    let ratio: string = ''
    let btc: string = ''
    let susd: string = ''

    if (data) {
        address = data.address
        ratio = data.ratio
        btc = data.btc
        susd = data.susd
    } else {
        console.log('@dev get data from ICP')
        try {
            address = await syron.get_box_address({
                ssi: id,
                op: { getsyron: null },
            })

            if (!address) {
                response.status(404).json({ error: 'No data found' })
            } else {
                console.log(
                    '@response from ICP, SDB address:',
                    JSON.stringify(address, null, 2)
                )

                // @dev Get account from ICP
                const account = await syron.get_account(id)

                if (account.Ok) {
                    ratio = account.Ok.collateral_ratio.toString()
                    btc = account.Ok.btc_1.toString()
                    susd = account.Ok.susd_1.toString()
                }

                await addDoc(collection(db, 'sdb'), {
                    id,
                    timestamp: new Date(),
                    address,
                    ratio,
                    btc,
                    susd,
                })
            }
        } catch (error) {
            console.error('@response ICP error:', error)
            response.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }

    if (address !== '') {
        const balance = await mempoolBalance(address)

        response
            .status(200)
            .json({ data: { address, balance, ratio, btc, susd } })
    }
}
