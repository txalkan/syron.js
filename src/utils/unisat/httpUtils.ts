import axios from 'axios'

// @review (mainnet)
export enum UnisatNetworkType {
    livenet = 'livenet',
    testnet = 'testnet',
}

let network = UnisatNetworkType.testnet

export function setApiNetwork(type: UnisatNetworkType) {
    network = type
}

function createApi(baseURL: string) {
    const api = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const apiKey = process.env.NEXT_PUBLIC_API_UNISAT //localStorage.getItem('apiKey') || ''

    api.interceptors.request.use((config) => {
        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }
        config.headers.Authorization = `Bearer ${apiKey}`
        return config
    })
    return api
}

const mainnetApi = createApi('https://open-api.unisat.io')
const testnetApi = createApi('https://open-api-testnet.unisat.io')

function getApi() {
    return network === UnisatNetworkType.testnet ? testnetApi : mainnetApi
}

export const get = async (url: string, params?: any) => {
    const res = await getApi().get(url, { params })
    if (res.status !== 200) {
        throw new Error(res.statusText)
    }

    const responseData = res.data

    if (responseData.code !== 0) {
        throw new Error(responseData.msg)
    }
    return responseData.data
}

export const post = async (url: string, data?: any) => {
    const res = await getApi().post(url, data)
    if (res.status !== 200) {
        throw new Error(res.statusText)
    }

    const responseData = res.data

    if (responseData.code !== 0) {
        throw new Error(responseData.msg)
    }

    return responseData.data
}

export async function coinGeckoApi() {
    try {
        const url =
            'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin?vs_currencies=usd'

        const apiKey = process.env.NEXT_PUBLIC_COINGECKO
        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'x-cg-demo-api-key': `${apiKey}` },
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        console.log(JSON.stringify(data, null, 2))

        return data
    } catch (error) {
        console.error('CoinGecko API Error', error)
    }
}

export async function mempoolPrice() {
    try {
        const url = 'https://mempool.space/api/v1/prices'

        const response = await fetch(url, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        return data
    } catch (error) {
        console.error('Mempool API Error', error)
    }
}

export async function mempoolTxId(address: string) {
    try {
        const url = `https://mempool.space/testnet/api/address/${address}/txs`

        const response = await fetch(url, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        const tx_id = data[0].txid
        console.log(tx_id)

        return tx_id
    } catch (error) {
        console.error('Mempool API Error', error)
    }
}
