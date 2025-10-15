/**
 * Mempool API Client
 * Provides functions to interact with mempool.space API
 * Automatically detects network (mainnet/testnet4) based on NEXT_PUBLIC_SYRON_VERSION
 */

import { getWalletWindow } from '../../config/wallet'
import { useWalletInfoStore } from '../../store/wallet_info'

/**
 * Get Bitcoin price in various currencies
 * @returns Price data object with currency pairs
 */
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

/**
 * Get transaction ID for a given address (testnet only)
 * @param address - Bitcoin address
 * @returns Transaction ID
 */
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

/**
 * Get recommended transaction fee rate in sat/vB
 * @returns Fee rate in satoshis per virtual byte
 */
export async function mempoolFeeRate(): Promise<number> {
    try {
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
        // console.log('RecommendedFees', JSON.stringify(data, null, 2))

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

        if (!fee) {
            fee = 5
        }

        // max gas rate per @vB
        if (fee > 4) return 0

        return fee
    } catch (error) {
        console.error('Mempool Error:', error)
        //checkError(error)
        return 3
    }
}

/**
 * Get UTXO balance for a Bitcoin address
 * @param address - Bitcoin address
 * @returns Balance in satoshis
 */
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

/**
 * Poll transaction status until confirmed
 * @param txId - Transaction ID to check
 * @returns Transaction status data when confirmed
 */
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

/**
 * Get UTXOs for a Bitcoin address
 * @param address - Bitcoin address
 * @returns Array of UTXOs with transaction details
 */
export async function mempoolUtxos(address: string) {
    try {
        const response = await fetch(
            `/api/get-utxos?address=${encodeURIComponent(address)}`,
            {
                method: 'GET',
            }
        )

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
            throw new Error(data.error)
        }

        console.log('Mempool UTXOs', JSON.stringify(data.data, null, 2))

        return data.data || []
    } catch (error) {
        console.error('Mempool UTXOs Error:', error)
        const e = checkError(error)
        throw e
    }
}

/**
 * Helper function to standardize error handling
 * @param error - Error object
 * @returns Formatted Error instance
 */
function checkError(error: any) {
    if (error instanceof Error) {
        return new Error('API Error: ' + error.message)
    } else {
        return new Error('API error: ' + error)
    }
}
