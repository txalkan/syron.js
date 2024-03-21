import { basic_bitcoin_syron as syron } from '../declarations/basic_bitcoin_syron'
import { updateSyronSSI } from '../store/syron'
import Big from 'big.js'
import { updateXR } from '../store/xr'

Big.PE = 999

function useICPHook() {
    const getVault = async (ssi: string, balance: number, network: string) => {
        try {
            console.log('Satoshis', balance)

            if (balance != 0) {
                const vault = await syron.get_btc_address({ ssi })
                console.log('Vault', vault)

                const vault_balance = await syron.get_balance(vault)

                updateSyronSSI({
                    ssi_vault: vault,
                    vault_balance: Big(Number(vault_balance)),
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
            const txId = await syron.get_susd({ ssi }, txid)
            return txId
        } catch (err) {
            console.error('useICP_getSUSD', err)
        }
    }

    const updateVault = async (ssi: string) => {
        try {
            const txId = await syron.update_vault({ ssi })
            return txId
        } catch (err) {
            console.error('useICP_updateVault', err)
        }
    }

    return {
        getVault,
        getSUSD,
        updateVault,
    }
}

export default useICPHook
