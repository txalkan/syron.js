// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import nextCors from 'nextjs-cors'
import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../../src/utils/firebase/firebaseConfig'
import { basic_bitcoin_syron as syron } from '../../src/declarations/basic_bitcoin_tyron'
import { unisatBalance } from '../../src/utils/unisat/httpUtils'

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

        const { id, dummy } = request.query
        const dummy_ = dummy === 'true'

        console.log('@dev get data from Firebase')
        const querySnapshot = await getDocs(
            collection(db, 'sdb-qczt5-riaaa-aaaam-qbfkq-cai')
        )
        const dataList = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as any),
            docId: doc.id,
        }))
        const data = dataList.find((val) => val?.id === id)

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

            const now = new Date()

            const diff = now.getTime() - data.timestamp

            if (diff < 10000) {
                console.log(
                    '@response Firebase data:',
                    JSON.stringify(data, null, 2)
                )

                const balance = await unisatBalance(address)

                response
                    .status(200)
                    .json({ data: { address, balance, ratio, btc, susd } })
                return
            }
        }

        console.log('@dev get data from ICP')

        if (address === '') {
            address = await syron.get_box_address({
                ssi: id,
                op: { getsyron: null },
            })
            if (!address) {
                response.status(404).json({ error: 'No data found' })
            }
        }

        // @dev Get account from ICP
        const account = await syron.get_account(id, dummy_)

        if (account.Ok) {
            ratio = account.Ok.collateral_ratio.toString()
            btc = account.Ok.btc_1.toString()
            susd = account.Ok.susd_1.toString()
        }

        if (data) {
            console.log('@dev update document')
            // @dev Update the document if found
            const docRef = doc(
                db,
                'sdb-qczt5-riaaa-aaaam-qbfkq-cai',
                data.docId
            )
            await updateDoc(docRef, {
                timestamp: new Date().getTime(),
                address,
                ratio,
                btc,
                susd,
            })
        } else {
            console.log('@dev add document')
            // @dev Create a new document if not found
            await addDoc(collection(db, 'sdb-qczt5-riaaa-aaaam-qbfkq-cai'), {
                id,
                timestamp: new Date().getTime(),
                address,
                ratio,
                btc,
                susd,
            })
        }

        const balance = await unisatBalance(address)

        response
            .status(200)
            .json({ data: { address, balance, ratio, btc, susd } })
    } catch (error) {
        console.error('@response ICP error:', error)
        response.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
