import { basic_bitcoin_syron as syron } from '../declarations/basic_bitcoin_tyron'
import { updateSyronSSI } from '../store/syron'
import Big from 'big.js'
import { updateXR } from '../store/xr'

Big.PE = 999

function useICPHook() {
    const getBox = async (ssi: string, balance: number, network: string) => {
        try {
            console.log('Satoshis', balance)

            if (balance != 0) {
                const box = await syron.get_box_address({
                    ssi,
                    op: { getsyron: null },
                })
                console.log('Safety Deposit Box', box)

                const box_balance = await syron.get_balance(box)

                updateSyronSSI({
                    ssi_box: box,
                    box_balance: Big(Number(box_balance)),
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
            const txId = await syron.get_susd(
                { ssi, op: { getsyron: null } },
                txid
            )
            return txId
        } catch (err) {
            console.error('useICP_getSUSD', err)
        }
    }

    const getSyron = async (ssi: string) => {
        try {
            const txId = await syron.update_ssi({ ssi, op: { getsyron: null } })
            return txId
        } catch (err) {
            console.error('useICP_updateSSI', err)
        }
    }

    return {
        getBox,
        getSUSD,
        getSyron,
    }
}

export default useICPHook
