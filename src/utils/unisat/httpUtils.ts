import axios from 'axios'

export enum UnisatNetworkType {
    mainnet = 'livenet',
    testnet = 'testnet',
    testnet4 = 'BITCOIN_TESTNET4',
}

// let network = UnisatNetworkType.mainnet

// export function setApiNetwork(type: UnisatNetworkType) {
//     network = type
// }

function unisatCreateApi(baseURL: string) {
    const api = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    //@network defaults to mainnet
    const version = process.env.NEXT_PUBLIC_SYRON_VERSION
    let apiKey = process.env.NEXT_PUBLIC_API_UNISAT_MAINNET // localStorage.getItem('apiKey') || ''
    if (version === 'testnet') {
        apiKey = process.env.NEXT_PUBLIC_API_UNISAT_TESTNET
    }

    api.interceptors.request.use((config) => {
        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }
        config.headers.Authorization = `Bearer ${apiKey}`
        return config
    })
    return api
}

//@network
const mainnetApi = unisatCreateApi('https://open-api.unisat.io')
const testnetApi = unisatCreateApi('https://open-api-testnet4.unisat.io')

function getApi() {
    //@network defaults to mainnet
    const version = process.env.NEXT_PUBLIC_SYRON_VERSION
    let api = mainnetApi
    if (version === 'testnet') {
        api = testnetApi
    }

    return api
}

export const getUniSat = async (url: string, params?: any) => {
    const res = await getApi().get(url, { params })
    //console.log(JSON.stringify(res, null, 2))

    if (res.status !== 200) {
        throw new Error(res.statusText)
    }

    const responseData = res.data

    if (responseData.code !== 0) {
        throw new Error(responseData.msg)
    }

    // console.log(JSON.stringify(responseData.data, null, 2))
    // e.g.
    // {
    //     "utxo": {
    //       "txid": "4b3f67dc18d10581edb237a1de3035a455cea2bf5d674babc1c2fb3c50385c44",
    //       "vout": 0,
    //       "satoshi": 546,
    //       "scriptType": "0014",
    //       "scriptPk": "0014d95aafa329fe17cb8086f381409953f9406645b4",
    //       "codeType": 7,
    //       "address": "tb1qm9d2lgeflctuhqyx7wq5px2nl9qxv3d58sqgm9",
    //       "height": 2811443,
    //       "idx": 2173,
    //       "isOpInRBF": false,
    //       "isSpent": false,
    //       "inscriptions": [
    //         {
    //           "inscriptionNumber": 48107204,
    //           "inscriptionId": "4b3f67dc18d10581edb237a1de3035a455cea2bf5d674babc1c2fb3c50385c44i0",
    //           "offset": 0,
    //           "moved": false,
    //           "sequence": 0,
    //           "isCursed": false,
    //           "isVindicate": false,
    //           "isBRC20": true
    //         }
    //       ]
    //     },
    //     "address": "tb1qm9d2lgeflctuhqyx7wq5px2nl9qxv3d58sqgm9",
    //     "offset": 0,
    //     "inscriptionIndex": 0,
    //     "inscriptionNumber": 48107204,
    //     "inscriptionId": "4b3f67dc18d10581edb237a1de3035a455cea2bf5d674babc1c2fb3c50385c44i0",
    //     "hasPointer": false,
    //     "hasParent": false,
    //     "hasDeligate": false,
    //     "hasMetaProtocal": false,
    //     "hasMetadata": false,
    //     "hasContentEncoding": false,
    //     "pointer": 0,
    //     "parent": "",
    //     "deligate": "",
    //     "metaprotocol": "",
    //     "metadata": "",
    //     "contentEncoding": "",
    //     "contentType": "text/plain;charset=utf-8",
    //     "contentLength": 58,
    //     "contentBody": "",
    //     "height": 2811443,
    //     "timestamp": 1714855908,
    //     "inSatoshi": 7675,
    //     "outSatoshi": 3837,
    //     "brc20": {
    //       "op": "transfer",
    //       "tick": "SYRO",
    //       "lim": "100000000000",
    //       "amt": "0.469",
    //       "decimal": "18"
    //     },
    //     "detail": null
    // }

    return responseData.data
}

export const postUniSat = async (url: string, data?: any) => {
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

export async function unisatInscriptionInfo(id: string) {
    try {
        // @network defaults to mainnet
        let url: URL = new URL(
            `https://open-api.unisat.io/v1/indexer/inscription/info/${id}`
        )
        const version = process.env.NEXT_PUBLIC_SYRON_VERSION
        if (version === 'testnet') {
            url = new URL(
                `https://open-api-testnet4.unisat.io/v1/indexer/inscription/info/${id}`
            )
        }

        const apiKey = UnisatNetworkType.mainnet
            ? process.env.NEXT_PUBLIC_API_UNISAT_MAINNET
            : process.env.NEXT_PUBLIC_API_UNISAT_TESTNET

        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        console.log(JSON.stringify(data, null, 2))

        return data
    } catch (error) {
        console.error('UniSat Error:', error)
        const e = checkError(error)
        throw e
    }
}

// @dev CoinGecko API

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
        console.error('CoinGecko Error:', error)
        const e = checkError(error)
        throw e
    }
}

// @dev Mempool API

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
        console.error('Mempool Error:', error)
        const e = checkError(error)
        throw e
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
        console.error('Mempool Error:', error)
        const e = checkError(error)
        throw e
    }
}

// @dev The transaction fee rate in sat/vB
export async function mempoolFeeRate(): Promise<number> {
    try {
        //'https://mempool.space/api/v1/mining/blocks/fee-rates/24h' //'https://mempool.space/testnet/api/v1/mining/blocks/fee-rates/24h'

        //@network defaults to mainnet
        let url: URL = new URL('https://mempool.space/api/v1/fees/recommended')
        const version = process.env.NEXT_PUBLIC_SYRON_VERSION
        if (version === 'testnet') {
            url = new URL(
                'https://mempool.space/testnet4/api/v1/fees/recommended'
            )
        }

        const response = await fetch(url, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        // @dev recommended fees
        console.log('RecommendedFees', JSON.stringify(data, null, 2))

        let fee = data.fastestFee

        // @dev fee rates
        // console.log(
        //     'Fees of last 6 blocks',
        //     JSON.stringify(data.slice(-6), null, 2)
        // )

        // Extract gas fees for the 50th percentile from the last 2 blocks (20min approx)
        // const lastBlocks = data.slice(-2)

        // const percentiles = lastBlocks
        //     .map((block: { avgFee_50 }) => {
        //         const fee = block.avgFee_50
        //         return fee === 0 ? undefined : fee // Exclude zero values
        //     })
        //     .filter((value) => value !== undefined) as number[] // Filter out undefined values

        // // Calculate the average
        // const sum = percentiles.reduce((acc, value) => acc + value, 0)
        // const res = Math.ceil(sum / percentiles.length)

        console.log('Fee Rate', fee)
        if (!fee) {
            fee = 5
        }

        return fee
    } catch (error) {
        console.error('Mempool Error:', error)
        //checkError(error)
        return 5
    }
}

export async function mempoolBalance(address: string) {
    try {
        // @network defaults to mainnet
        let url: URL = new URL(
            `https://mempool.space/api/address/${address}/utxo`
        )
        const version = process.env.NEXT_PUBLIC_SYRON_VERSION
        if (version === 'testnet') {
            url = new URL(
                `https://mempool.space/testnet4/api/address/${address}/utxo`
            )
        }

        const response = await fetch(url, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error(
                `Mempool API request failed with status ${response.status}`
            )
        }

        const data = await response.json()

        //console.log('SDB UTXOs', JSON.stringify(data, null, 2))

        const balance = data.reduce(
            (total: number, utxo: { value: number }) => total + utxo.value,
            0
        )

        return balance
    } catch (error) {
        console.error('Mempool Error:', error)
        checkError(error)
    }
}

export async function unisatBalance(address: string) {
    try {
        // @network defaults to mainnet
        let url = new URL(
            `https://open-api.unisat.io/v1/indexer/address/${address}/balance`
        )
        let apiKey = process.env.NEXT_PUBLIC_API_UNISAT_MAINNET
        const version = process.env.NEXT_PUBLIC_SYRON_VERSION
        if (version === 'testnet') {
            url = new URL(
                `https://open-api-testnet4.unisat.io/v1/indexer/address/${address}/balance`
            )
            apiKey = process.env.NEXT_PUBLIC_API_UNISAT_TESTNET
        }
        // const apiKey = UnisatNetworkType.mainnet
        //     ? process.env.NEXT_PUBLIC_API_UNISAT_MAINNET
        //     : process.env.NEXT_PUBLIC_API_UNISAT_TESTNET

        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        //console.log(JSON.stringify(data, null, 2))

        if (data.data) return data.data.btcSatoshi
    } catch (error) {
        console.error('UniSat Error:', error)
        const e = checkError(error)
        throw e
    }
}

// @dev Best In Slot API

export async function bisInscriptionInfo(id: string) {
    try {
        const url = `https://testnet.api.bestinslot.xyz/v3/inscription/single_info_id?inscription_id=${id}`

        const apiKey = process.env.NEXT_PUBLIC_API_BIS
        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': `${apiKey}`,
            },
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        console.log(JSON.stringify(data, null, 2))

        return data
    } catch (error) {
        console.error('BIS Error:', error)
        const e = checkError(error)
        throw e
    }
}

function bisCreateApi(baseURL: string) {
    const apiKey = process.env.NEXT_PUBLIC_API_BIS

    const api = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            'x-api-key': `${apiKey}`,
        },
    })

    api.interceptors.request.use((config) => {
        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }
        config.headers.Authorization = `Bearer ${apiKey}`
        return config
    })
    return api
}

const bis = bisCreateApi('https://testnet.api.bestinslot.xyz/v3/')

export async function bisApi(url: string) {
    try {
        const res = await bis.get(url)

        if (res.status !== 200) {
            throw new Error(res.statusText)
        }

        const responseData = res.data

        if (responseData.code !== 0) {
            throw new Error(responseData.msg)
        }

        console.log(JSON.stringify(responseData.data, null, 2))
        return responseData.data
    } catch (error) {
        console.error('BIS Error:', error)
        const e = checkError(error)
        throw e
    }
}

// create a reusable function to check the erorr instance
function checkError(error: any) {
    if (error instanceof Error) {
        return new Error('API Error: ' + error.message)
    } else {
        return new Error('API error: ' + error)
    }
}

// async function simulateRequests() {
//     const promises = []
//     for (let i = 0; i < 20; i++) {
//         promises.push(
//             axios
//                 .get('http://testnet.tyron.io/api/your-endpoint') // replace with your actual endpoint
//                 .then((response) => console.log(response.data))
//                 .catch((error) => console.error(error))
//         )
//     }
//     await Promise.all(promises)
// }

export const transaction_status = async (txId: string) => {
    // Runtime validation to ensure txId is a valid string
    if (!txId || typeof txId !== 'string') {
        throw new Error('Invalid transaction ID parameter')
    }

    // @network defaults to mainnet
    let url: URL = new URL(`https://mempool.space/api/tx/${txId}/status`)
    const version = process.env.NEXT_PUBLIC_SYRON_VERSION
    if (version === 'testnet') {
        url = new URL(`https://mempool.space/testnet4/api/tx/${txId}/status`)
    }

    while (true) {
        try {
            const response = await fetch(url, {
                method: 'GET',
            })

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}`
                )
            }

            const data = await response.json()
            //console.log(JSON.stringify(data, null, 2))

            if (!data.confirmed) {
                throw new Error(`Trying again`)
            } else {
                // toast.info('BTC deposit confirmed', {
                //     position: 'bottom-center',
                //     autoClose: 4000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     toastId: 1,
                // })

                return data
            }
        } catch (error) {
            console.error(`Transaction status not confirmed. ${error}`)
            await new Promise(
                (resolve) => setTimeout(resolve, 1 * 60 * 1000) // 1 min
            )
        }
    }
}
