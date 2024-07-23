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
            console.log('Satoshis', balance)

            if (balance != 0) {
                const sdb = await fetch(`/api/get-sdb?id=${ssi}&dummy=${dummy}`)
                    .then(async (response) => {
                        const res = await response.json()
                        console.log(
                            'outcall response',
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
                    ssi_box: sdb.data.address,
                    box_balance: Big(Number(sdb.data.btc)), // @review (mainnet) balance)),
                    box_loan: Big(Number(sdb.data.susd)),
                    box_ratio: Big(Number(sdb.data.ratio)),
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
            const txId = await syron.withdraw_susd(
                { ssi, op: { getsyron: null } },
                txid,
                72000000,
                1
            )
            return txId
        } catch (err) {
            console.error('useICP_getSUSD', err)
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
            console.error('useICP_updateSSI', err)
        }
    }

    const redeemBTC = async (ssi: string) => {
        try {
            const txid =
                '6f5bf11ec0a565351c316bc2bca5014d3388f96c6d0ab726f7db4a1adb820d68'
            const txId = await syron.redeem_btc(
                {
                    ssi,
                    op: { redeembitcoin: null },
                },
                txid
            )
            return txId
        } catch (err) {
            console.error('useICP_redeemBTC', err)
        }
    }

    return {
        getBox,
        getSUSD,
        updateSyronLedgers,
        redeemBTC,
    }
}

export default useICPHook
