import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { updateDoc } from '../store/did-doc'
import { updateLoading, updateLoadingDoc } from '../store/loading'
import { RootState } from '../app/reducers'
import { updateShowSearchBar } from '../store/modal'
import { updateResolvedInfo } from '../store/resolvedInfo'
import smartContract from '../utils/smartContract'

function fetch() {
    const { getSmartContract } = smartContract()
    const zcrypto = tyron.Util.default.Zcrypto()
    const net = useSelector((state: RootState) => state.modal.net)
    const Router = useRouter()
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')
    const usernamePath = path.split('/')[1]?.split('.')[0]
    const domainPath = path.includes('.')
        ? path.split('/')[1].split('.')[1]
        : path.split('/')[2] === 'didx'
        ? 'did'
        : path.split('/')[2] === 'zil'
        ? 'zil'
        : '' // @todo-i-fixed does this mean that empty defaults to did?
    const _username = usernamePath
    const _domain = domainPath

    const resolveUser = async () => {
        updateShowSearchBar(false)
        updateLoading(true)
        // await tyron.SearchBarUtil.default
        //     .fetchAddr(net, _username!, 'did')
        //     .then(async (addr) => {
        //         let res = await getSmartContract(addr, 'version')
        //         const version = res.result.version.slice(0, 7)
        //         if (version === 'xwallet' || version === 'initi--') {
        //             await tyron.SearchBarUtil.default
        //                 .Resolve(net, addr)
        //                 .then(async (result: any) => {
        //                     const did_controller =
        //                         result.controller.toLowerCase()
        //                     const res = await getSmartContract(addr, 'version')

        //                     updateDoc({
        //                         did: result.did,
        //                         version: result.version,
        //                         doc: result.doc,
        //                         dkms: result.dkms,
        //                         guardians: result.guardians,
        //                     })

        //                     if (_domain === 'did') {
        //                         updateResolvedInfo({
        //                             name: _username,
        //                             domain: 'did',
        //                             addr: addr!,
        //                             controller:
        //                                 zcrypto.toChecksumAddress(
        //                                     did_controller
        //                                 ),
        //                             status: result.status,
        //                             version: res.result.version,
        //                         })
        //                     } else {
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username!, _domain!)
            .then(async (addr) => {
                // const res = await getSmartContract(
                //     addr,
                //     'version'
                // )
                updateResolvedInfo({
                    name: _username,
                    domain: _domain,
                    addr: addr!,
                    // controller:
                    //     zcrypto.toChecksumAddress(
                    //         did_controller
                    //     ),
                    // status: result.status,
                    // version: res.result.version,
                })
                updateLoading(false)
            })
            //                         .catch(() => {
            //                             toast.error(
            //                                 `Uninitialized DID Domain.`,
            //                                 {
            //                                     position: 'top-right',
            //                                     autoClose: 3000,
            //                                     hideProgressBar: false,
            //                                     closeOnClick: true,
            //                                     pauseOnHover: true,
            //                                     draggable: true,
            //                                     progress: undefined,
            //                                     theme: 'dark',
            //                                 }
            //                             )
            //                             Router.push('/')
            //                         })
            //                 }
            //                 updateLoading(false)
            //             })
            //             .catch((err) => {
            //                 throw err
            //             })
            //     }
            // })
            .catch(() => {
                updateLoading(false)
                setTimeout(() => {
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
                }, 1000)
                Router.push(`/`)
            })
    }

    const fetchDoc = async () => {
        updateShowSearchBar(false)
        updateLoadingDoc(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username!, 'did')
            .then(async (addr) => {
                let res = await getSmartContract(addr, 'version')
                const version = res.result.version.slice(0, 7)
                if (version === 'xwallet' || version === 'initi--') {
                    await tyron.SearchBarUtil.default
                        .Resolve(net, addr)
                        .then(async (result: any) => {
                            const did_controller = zcrypto.toChecksumAddress(
                                result.controller
                            )
                            updateDoc({
                                did: result.did,
                                controller: did_controller,
                                version: result.version,
                                doc: result.doc,
                                dkms: result.dkms,
                                guardians: result.guardians,
                            })
                            updateLoadingDoc(false)
                        })
                        .catch((err) => {
                            throw err
                        })
                }
            })
            .catch(() => {
                updateLoadingDoc(false)
                setTimeout(() => {
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
                }, 1000)
                Router.push(`/`)
            })
    }

    return {
        resolveUser,
        fetchDoc,
    }
}

export default fetch
