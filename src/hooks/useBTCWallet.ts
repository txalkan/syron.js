import { updateBTCWallet } from '../store/syron'
import Big from 'big.js'
Big.PE = 999

export function useBTCWalletHook() {
    const updateWallet = async (
        ssi: string,
        balance: number,
        network: string
    ) => {
        try {
            console.log(`Wallet Balance: ${balance} satoshis`)
            console.log(`Wallet Address: ${ssi}`)

            updateBTCWallet({
                network: network,
                btc_addr: ssi,
                btc_balance: Big(balance),
            })
        } catch (err) {
            console.error(err)
        }
    }

    return {
        updateWallet,
    }
}
