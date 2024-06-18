// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import nextCors from 'nextjs-cors'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../src/utils/firebase/firebaseConfig'

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

    console.log('@dev get data from Firebase')
    try {
        const collectionRef = collection(db, 'sdb')
        const querySnapshot = await getDocs(collectionRef)
        const dataList = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
        }))

        console.log('@response Firebase data all sdb:', dataList)

        response.status(200).json({ data: dataList })
    } catch (error) {
        response.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        })
    }
}
