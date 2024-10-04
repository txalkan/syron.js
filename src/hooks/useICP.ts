import { basic_bitcoin_syron as syron } from '../declarations/basic_bitcoin_tyron'
import { updateSyronSSI } from '../store/syron'
import Big from 'big.js'
import { updateXR } from '../store/xr'

Big.PE = 999

function useICPHook() {
    const getBox = async (ssi: string, dummy: boolean) => {
        try {
            console.log('Loading SDB')
            //if (balance != 0) { @review (syron) v2
            await fetch(`/api/get-sdb?id=${ssi}&dummy=${dummy}`)
                .then(async (response) => {
                    const sdb = await response.json()
                    console.log(
                        'outcall response - SDB',
                        JSON.stringify(sdb, null, 2)
                    )

                    // @dev Get the balance of the SDB using ICP (deprecated in favour of Mempool API)
                    // const box_balance = await syron.get_balance(sdb.data.address)

                    // if the sdb is not undefined, update the store
                    if (sdb.data) {
                        updateSyronSSI({
                            sdb: sdb.data.address,
                            sdb_btc: Big(Number(sdb.data.balance ?? 0)),
                            syron_btc: Big(Number(sdb.data.btc)), // @review (mainnet)
                            syron_usd_loan: Big(Number(sdb.data.susd)),
                            collateral_ratio: Big(Number(sdb.data.ratio)),
                        })
                    }
                })
                .catch((error) => {
                    throw error
                })

            //}
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
                0 // @mainnet
            )
            if (txId.Err) {
                throw new Error(txId.Err.GenericError.error_message)
            }
            console.log(txId)
            return txId
        } catch (err) {
            console.error('Get SUSD', err)
            throw err
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

    const redemptionGas = async (ssi: string) => {
        try {
            console.log('Loading Redemption Gas')
            const gas = await syron.redemption_gas({
                ssi,
                op: { redeembitcoin: null },
            })
            if (gas.Err) {
                throw new Error(gas.Err.GenericError.error_message)
            } else {
                console.log('Redeption Gas:', gas.Ok)
                return gas.Ok
            }
        } catch (err) {
            console.error('Redemption Gas', err)
            throw err
        }
    }

    const redeemBTC = async (ssi: string, txid: string) => {
        try {
            console.log('Loading BTC Redemption')
            const txId = await syron.redeem_btc(
                {
                    ssi,
                    op: { redeembitcoin: null },
                },
                txid
            )
            if (txId.Err) {
                throw new Error(txId.Err.GenericError.error_message)
            }
            console.log(txId)
            return txId
        } catch (err) {
            console.error('Redeem BTC', err)
            throw err
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
        redemptionGas,
        redeemBTC,
        getServiceProviders,
    }
}

export default useICPHook
