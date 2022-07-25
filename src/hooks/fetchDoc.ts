import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { updateDoc } from '../store/did-doc'
import { updateLoadingDoc } from '../store/loading'
import { $net } from '../store/wallet-network'
import { UpdateResolvedInfo } from '../app/actions'
import { RootState } from '../app/reducers'

function fetchDoc() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const net = useStore($net)
    const Router = useRouter()
    const dispatch = useDispatch()
    const resolvedInfo = useSelector(
        (state: RootState) => state.modal.resolvedInfo
    )
    const username = resolvedInfo.name
    const domain = resolvedInfo.domain

    const fetch = async () => {
        updateLoadingDoc(true)
        // const path = window.location.pathname
        //     .toLowerCase()
        //     .replace('/es', '')
        //     .replace('/cn', '')
        //     .replace('/id', '')
        //     .replace('/ru', '')
        // const usernamePath = path.split('/')[1].split('.')[0]
        // const domainPath = path.includes('.')
        //     ? path.split('/')[1].split('.')[1]
        //     : path.split('/')[2] // the smart contract version
        // const username = usernamePath
        // const domain = domainPath

        await tyron.SearchBarUtil.default
            .fetchAddr(net, username, 'did')
            .then(async (addr) => {
                let network = tyron.DidScheme.NetworkNamespace.Mainnet
                if (net === 'testnet') {
                    network = tyron.DidScheme.NetworkNamespace.Testnet
                }
                // if (domain === '' || domain === 'nft') {
                //     dispatch(
                //         UpdateResolvedInfo({
                //             name: username,
                //             domain: domain,
                //             addr: addr,
                //         })
                //     )
                // } else {
                const init = new tyron.ZilliqaInit.default(network)
                let version = await init.API.blockchain
                    .getSmartContractSubState(addr, 'version')
                    .then((substate) => {
                        return substate.result.version as string
                    })
                    .catch(() => {
                        throw new Error('Version not supported.')
                    })
                version = version.slice(0, 7)
                // if (version === 'xwallet' || version === 'initi--') {
                await tyron.SearchBarUtil.default
                    .Resolve(net, addr)
                    .then(async (result: any) => {
                        // const did_controller =
                        //     result.controller.toLowerCase()
                        updateDoc({
                            did: result.did,
                            version: result.version,
                            doc: result.doc,
                            dkms: result.dkms,
                            guardians: result.guardians,
                        })
                        updateLoadingDoc(false)

                        // if (domain === 'did') {
                        //     dispatch(
                        //         UpdateResolvedInfo({
                        //             name: username,
                        //             domain: domain,
                        //             addr: addr!,
                        //             controller:
                        //                 zcrypto.toChecksumAddress(
                        //                     did_controller
                        //                 ),
                        //             status: result.status,
                        //         })
                        //     )
                        // } else {
                        //     await tyron.SearchBarUtil.default
                        //         .fetchAddr(net, username!, domain!)
                        //         .then(async (domain_addr) => {
                        //             dispatch(
                        //                 UpdateResolvedInfo({
                        //                     name: username,
                        //                     domain: domain,
                        //                     addr: domain_addr!,
                        //                     controller:
                        //                         zcrypto.toChecksumAddress(
                        //                             did_controller
                        //                         ),
                        //                     status: result.status,
                        //                 })
                        //             )
                        //         })
                        //         .catch(() => {
                        //             toast.error(
                        //                 `Uninitialized DID Domain.`,
                        //                 {
                        //                     position: 'top-right',
                        //                     autoClose: 3000,
                        //                     hideProgressBar: false,
                        //                     closeOnClick: true,
                        //                     pauseOnHover: true,
                        //                     draggable: true,
                        //                     progress: undefined,
                        //                     theme: 'dark',
                        //                 }
                        //             )
                        //             Router.push(`/${username}`)
                        //         })
                        // }
                    })
                    .catch((err) => {
                        throw err
                    })
                // }
                // }
            })
            .catch(() => {
                toast.warning('Create a new DID.', {
                    position: 'top-right',
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: '1',
                })
                //Router.push(`/`)
            })
    }

    return {
        fetch,
    }
}

export default fetchDoc
