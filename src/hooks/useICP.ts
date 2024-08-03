import { basic_bitcoin_syron as syron } from '../declarations/basic_bitcoin_tyron'
import { updateSyronSSI } from '../store/syron'
import Big from 'big.js'
import { updateXR } from '../store/xr'

Big.PE = 999

function useICPHook() {
    const getBox = async (
        ssi: string,
        balance: number,
        network: string,
        dummy: boolean
    ) => {
        try {
            console.log('Balance in Satoshis', balance)

            console.log('Loading SDB')
            if (balance != 0) {
                const sdb = await fetch(`/api/get-sdb?id=${ssi}&dummy=${dummy}`)
                    .then(async (response) => {
                        const res = await response.json()
                        console.log(
                            'outcall response - SDB',
                            JSON.stringify(res, null, 2)
                        )
                        return res
                    })
                    .catch((error) => {
                        throw error
                    })

                // @dev Get the balance of the SDB using ICP (deprecated in favour of Mempool API)
                // const box_balance = await syron.get_balance(sdb.data.address)

                updateSyronSSI({
                    sdb: sdb.data.address,
                    syron_btc: Big(Number(sdb.data.btc)), // @review (mainnet) balance)),
                    syron_usd_loan: Big(Number(sdb.data.susd)),
                    collateral_ratio: Big(Number(sdb.data.ratio)),
                })
            }
        } catch (err) {
            console.error(err)
        }
    }

    // const getXR = async () => {
    //     try {
    //         const xr = await syron.get_xr()
    //         updateXR({ rate: Number(xr) / 1e9 })

    //         console.log('Rate from XRC', xr)
    //     } catch (err) {
    //         console.error(err)
    //     }
    // }

    const getSUSD = async (ssi: string, txid: string) => {
        try {
            console.log('Loading SUSD Issuance')
            const txId = await syron.withdraw_susd(
                { ssi, op: { getsyron: null } },
                txid,
                72000000,
                1
            )
            console.log(txId)
            return txId
        } catch (err) {
            console.error('Get SUSD Error', err)
        }
    }

    const updateSyronLedgers = async (ssi: string) => {
        try {
            const txId = await syron.update_ssi_balance({
                ssi,
                op: { getsyron: null },
            })
            return txId
        } catch (err) {
            console.error('Update Balance Error', err)
        }
    }

    const redeemBTC = async (ssi: string) => {
        try {
            const txid =
                '6f5bf11ec0a565351c316bc2bca5014d3388f96c6d0ab726f7db4a1adb820d68'

            console.log('Loading BTC Redemption')
            const txId = await syron.redeem_btc(
                {
                    ssi,
                    op: { redeembitcoin: null },
                }
                // txid
            )
            console.log(txId)
            return txId
        } catch (err) {
            console.error('Redeem BTC Error', err)
        }
    }

    const getServiceProviders = async () => {
        try {
            console.log('Loading Service Providers')
            const res = await syron.getServiceProviderMap()
            console.log('Service Providers', res)
            return res
        } catch (err) {
            console.error(err)
        }
    }

    return {
        getBox,
        getSUSD,
        updateSyronLedgers,
        redeemBTC,
        getServiceProviders,
    }
}

export default useICPHook
