import axios from 'axios'

export enum UnisatNetworkType {
    mainnet = 'livenet',
    testnet = 'testnet',
}

let network = UnisatNetworkType.mainnet // @mainnet @review (wallet)

export function setApiNetwork(type: UnisatNetworkType) {
    network = type
}

function unisatCreateApi(baseURL: string) {
    const api = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const apiKey = UnisatNetworkType.mainnet
        ? process.env.NEXT_PUBLIC_API_UNISAT_MAINNET
        : process.env.NEXT_PUBLIC_API_UNISAT // localStorage.getItem('apiKey') || ''

    api.interceptors.request.use((config) => {
        if (!apiKey) {
            throw new Error('input apiKey and reload page')
        }
        config.headers.Authorization = `Bearer ${apiKey}`
        return config
    })
    return api
}

const mainnetApi = unisatCreateApi('https://open-api.unisat.io')
const testnetApi = unisatCreateApi('https://open-api-testnet.unisat.io')

function getApi() {
    return network === UnisatNetworkType.testnet ? testnetApi : mainnetApi
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
        const url = `https://open-api-testnet.unisat.io/v1/indexer/inscription/info/${id}`

        const apiKey = process.env.NEXT_PUBLIC_API_UNISAT_MAINNET // @mainnet
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
        checkError(error)
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
        checkError(error)
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
        checkError(error)
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
        checkError(error)
    }
}

export async function mempoolFeeRate() {
    try {
        const url = 'https://mempool.space/api/v1/mining/blocks/fee-rates/24h' //'https://mempool.space/testnet/api/v1/mining/blocks/fee-rates/24h' @mainnet

        const response = await fetch(url, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        //console.log(JSON.stringify(data, null, 2))

        // Extract gas fees for the 75th percentile from the last 100 blocks
        const lastBlocks = data.slice(-100)
        const percentiles = lastBlocks
            .map((block: { avgFee_75 }) => {
                const fee = block.avgFee_75
                return fee === 0 ? undefined : fee // Exclude zero values
            })
            .filter((value) => value !== undefined) as number[] // Filter out undefined values

        // console.log(JSON.stringify(percentiles))
        // Calculate the average
        const sum = percentiles.reduce((acc, value) => acc + value, 0)
        const average = Math.ceil(sum / percentiles.length)

        return average
    } catch (error) {
        console.error('Mempool Error:', error)
        checkError(error)
    }
}

export async function mempoolBalance(address: string) {
    try {
        const url = `https://mempool.space/api/address/${address}/utxo` // @mainnet `https://mempool.space/testnet/api/address/${address}/utxo`

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
        const url = `https://open-api.unisat.io/v1/indexer/address/${address}/balance`

        const apiKey = process.env.NEXT_PUBLIC_API_UNISAT_MAINNET // @mainnet
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

        return data.data.btcSatoshi
    } catch (error) {
        console.error('UniSat Error:', error)
        checkError(error)
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
        checkError(error)
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
        checkError(error)
    }
}

// create a reusable function to check the erorr instance
function checkError(error: any) {
    if (error instanceof Error) {
        throw new Error('API Error: ' + error.message)
    } else {
        throw new Error('API error: ' + error)
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

export const transaction_status = async (txId) => {
    // @mainnet
    const url = `https://mempool.space/api/tx/${txId}/status` //`https://mempool.space/testnet/api/tx/${txId}/status`

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
