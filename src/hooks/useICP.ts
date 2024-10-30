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
                            collateral_ratio: Big(Number(sdb.data.ratio)),
                            sdb_btc: Big(Number(sdb.data.balance ?? 0)),
                            syron_btc: Big(Number(sdb.data.btc)), // @review (mainnet)
                            syron_usd_loan: Big(Number(sdb.data.susd)),
                            syron_usd_bal: Big(Number(sdb.data.bal)),
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

    const updateSyronBalance = async (ssi: string) => {
        try {
            console.log('Calling Syron update...')
            const txId = await syron.update_ssi_balance({
                ssi,
                op: { getsyron: null },
            })

            // Convert BigInt values to strings
            const txIdStringified = JSON.stringify(txId, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )

            console.log('txId response: ', txIdStringified)

            if (txId.Err) {
                throw new Error(txIdStringified)
            }

            return txId
        } catch (err) {
            console.error('Update Syron Balance: ', err)
            throw err
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

    const getSUSD = async (ssi: string, txid: string, fee: number) => {
        try {
            console.log(`Initiating SYRON Issuance with fee (${fee})...`)
            const txId = await syron.withdraw_susd(
                { ssi, op: { getsyron: null } },
                txid,
                72000000,
                0, // @mainnet
                fee * 1000
            )

            // Convert BigInt values to strings
            const txIdStringified = JSON.stringify(txId, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )

            console.log('txId response: ', txIdStringified)
            //console.log('txId response: ', JSON.stringify(txId, null, 2))

            if (txId.Err) {
                throw new Error(txIdStringified)
            }

            return txId
        } catch (err) {
            console.error('Get SYRON Call', err)
            throw err
        }
    }

    const syronWithdrawal = async (
        ssi: string,
        txid: string,
        amt: number,
        fee: number
    ) => {
        try {
            console.log(
                `Initiating SYRON Withdrawal of amount (${amt}) with fee (${fee})...`
            )
            const txId = await syron.syron_withdrawal(
                { ssi, op: { getsyron: null } },
                txid,
                72000000,
                0, // @mainnet
                amt,
                fee * 1000
            )

            // Convert BigInt values to strings
            const txIdStringified = JSON.stringify(txId, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )

            console.log('txId response: ', txIdStringified)
            //console.log('txId response: ', JSON.stringify(txId, null, 2))

            if (txId.Err) {
                throw new Error(txIdStringified)
            }

            return txId
        } catch (error) {
            console.error('Syron Withdrawal Call', error)
            throw error
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
        updateSyronBalance,
        getSUSD,
        syronWithdrawal,
        redemptionGas,
        redeemBTC,
        getServiceProviders,
    }
}

export default useICPHook
