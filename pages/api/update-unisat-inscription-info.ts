// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { unisatApi } from '../../src/utils/unisat/api'
import nextCors from 'nextjs-cors'
import { addDoc, collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../src/utils/firebase/firebaseConfig'
import { sanitize, sortKeys } from '../../src/utils/gatewayResponse'

type Data = {
    data?: any
    error?: string
}

// Define the structure of the allowed response
const allowedKeys = {
    brc20: {
        amt: '',
        // decimal: '',
        // lim: '',
        op: '',
        tick: '',
    },
    utxo: {
        address: '',
        isSpent: false,
    },
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
    const querySnapshot = await getDocs(
        collection(db, 'unisat_inscription_info')
    )

    const dataList = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as any),
        docId: doc.id,
    }))
    const data = dataList.find((val) => val?.inscription_id === id)

    console.log('@response Firebase data:', JSON.stringify(data, null, 2))

    if (!id || Array.isArray(id)) {
        response.status(400).json({
            error: 'Invalid ID',
        })
        return
    }

    console.log('@dev get data from UniSat')
    try {
        const data_unisat = await unisatApi.getInscriptionInfo(id)

        if (!data_unisat) {
            response.status(404).json({ error: 'No data found' })
        } else {
            console.log(
                '@response UniSat data:',
                JSON.stringify(data_unisat, null, 2)
            )

            const res = sortKeys(sanitize(data_unisat, allowedKeys))

            console.log('@dev Update document')
            const docRef = doc(db, 'unisat_inscription_info', data.docId)
            await updateDoc(docRef, {
                inscription_id: id,
                timestamp: new Date().getTime(),
                data: res,
            })

            response.status(200).json(res)
        }
    } catch (error) {
        console.error('@response UniSat error:', error)
        response.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
