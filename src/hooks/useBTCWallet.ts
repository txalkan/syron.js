import { useWalletInfoStore } from '../store/wallet_info'
import Big from 'big.js'
Big.PE = 999

export function useBTCWalletHook() {
    const { updateWalletInfo } = useWalletInfoStore()
    const updateWallet = async (
        ssi: string,
        balance: number,
        network: string
    ) => {
        try {
            console.log(`Wallet Balance: ${balance} satoshis`)
            console.log(`Wallet Address: ${ssi}`)
            console.log(`Wallet Network: ${network}`)

            let net
            if (network === 'livenet' || network === 'BITCOIN_MAINNET') {
                net = 'BITCOIN_MAINNET'
            } else {
                net = 'BITCOIN_TESTNET4'
            }

            updateWalletInfo({
                network: net,
                address: ssi,
                balance: Big(balance),
            })
        } catch (err) {
            console.error(err)
        }
    }

    return {
        updateWallet,
    }
}
