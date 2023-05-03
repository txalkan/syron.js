import { useSelector } from 'react-redux'
import * as tyron from 'tyron'
import { RootState } from '../app/reducers'
import { toast } from 'react-toastify'

function smartContract() {
    const net = useSelector((state: RootState) => state.modal.net)

    const getSmartContract = async (address: string, field: string) => {
        try {
            let network = tyron.DidScheme.NetworkNamespace.Mainnet
            if (net === 'testnet') {
                network = tyron.DidScheme.NetworkNamespace.Testnet
            }
            const init = new tyron.ZilliqaInit.default(network)
            const substate = await init.API.blockchain.getSmartContractSubState(
                address,
                field
            )
            return substate
        } catch (error) {
            console.error(`getSmartContract: ${String(error)}`)
            // toast(`${String(error)}`, {
            //     position: 'top-center',
            //     autoClose: 3000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     draggable: true,
            //     progress: undefined,
            //     toastId: 8,
            // })
        }
    }

    const getSmartContractInit = async (address: string) => {
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        const init_ = await init.API.blockchain.getSmartContractInit(address)
        return init_
    }

    return { getSmartContract, getSmartContractInit }
}

export default smartContract
