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

                updateSyronSSI({
                    btc_addr: ssi,
                    ssi_vault: vault,
                    btc_balance: Big(balance),
                    network: network,
                })
            }

            // const balance = await syron.get_balance(ssi)
        } catch (err) {
            console.error(err)
        }
    }

    const getXR = async () => {
        try {
            const xr = await syron.get_xr()
            updateXR({ rate: Number(xr) })

            console.log('Rate', xr)
        } catch (err) {
            console.error(err)
        }
    }

    return {
        getVault,
        getXR,
    }
}

export default useICPHook
