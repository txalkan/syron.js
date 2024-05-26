// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { unisatApi } from '../../src/utils/unisat/api'
import nextCors from 'nextjs-cors'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../../src/utils/firebase/firebaseConfig'
import { sortKeys } from '../../src/utils/sortKeys'

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
    const querySnapshot = await getDocs(
        collection(db, 'unisat_inscription_info')
    )
    const dataList = querySnapshot.docs.map((doc) => ({ ...doc.data() }))
    const data = dataList.find((val) => val?.inscription_id === id)

    console.log('@response Firebase data:', data)

    if (!id || Array.isArray(id)) {
        response.status(400).json({
            error: 'Invalid ID',
        })
        return
    }

    // if id not found in firebase
    if (data) {
        response
            .status(200)
            .json(sortKeys(sanitizeInscriptionInfoResponse(data.data))) //{ data: data.data })
    } else {
        console.log('@dev get data from UniSat')
        try {
            const data_unisat = await unisatApi.getInscriptionInfo(id)
            if (!data_unisat) {
                response.status(404).json({ error: 'No data found' })
            } else {
                console.log('@response UniSat data:', data_unisat)

                await addDoc(collection(db, 'unisat_inscription_info'), {
                    inscription_id: id,
                    timestamp: new Date(),
                    data: data_unisat,
                })

                response
                    .status(200)
                    .json(
                        sortKeys(sanitizeInscriptionInfoResponse(data_unisat))
                    ) //{ data: data_unisat })
            }
        } catch (error) {
            console.error('@response UniSat error:', error)
            response.status(500).json({
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        }
    }
}

// Function to sanitize and normalize the response
function sanitizeInscriptionInfoResponse(response: any): any {
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

    // Recursive function to copy allowed keys
    function sanitize(obj: any, allowed: any): any {
        const sanitizedObj: any = {}
        for (const key in allowed) {
            if (obj.hasOwnProperty(key)) {
                if (
                    typeof allowed[key] === 'object' &&
                    !Array.isArray(allowed[key])
                ) {
                    sanitizedObj[key] = sanitize(obj[key], allowed[key])
                } else {
                    sanitizedObj[key] = obj[key]
                }
            } else {
                sanitizedObj[key] = allowed[key]
            }
        }
        return sanitizedObj
    }

    return sanitize(response, allowedKeys)
}
