import * as tyron from 'tyron'
import { $net } from '../store/network'

function smartContract() {
    const net = $net.state.net as 'mainnet' | 'testnet'
    let network = tyron.DidScheme.NetworkNamespace.Mainnet
    if (net === 'testnet') {
        network = tyron.DidScheme.NetworkNamespace.Testnet
    }
    const init = new tyron.ZilliqaInit.default(network)

    const getSmartContract = async (address: string, field: string) => {
        try {
            const substate = await init.API.blockchain.getSmartContractSubState(
                address,
                field
            )
            return substate
        } catch (error) {
            console.error(`@smartContract_getState: ${String(error)}`)
        }
    }

    const getSmartContractInit = async (address: string) => {
        const init_ = await init.API.blockchain.getSmartContractInit(address)
        return init_
    }

    return { getSmartContract, getSmartContractInit }
}

export default smartContract
