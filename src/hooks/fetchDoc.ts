import * as zcrypto from '@zilliqa-js/crypto'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { $user } from '../store/user'
import { updateDoc } from '../store/did-doc'
import { updateLoadingDoc } from '../store/loading'
import { $net } from '../store/wallet-network'
import { DOMAINS } from '../../src/constants/domains'
import { updateLoginInfoContract } from '../app/actions'

function fetchDoc() {
    const username = useStore($user)?.name
    const net = useStore($net)
    const Router = useRouter()
    const dispatch = useDispatch()

    const fetch = async () => {
        const path = window.location.pathname.toLowerCase()
        const usernamePath = path.split('/')[1].split('.')[0]
        updateLoadingDoc(true)
        const _username = username !== undefined ? username! : usernamePath
        const _domain = 'did'
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, 'did')
            .then(async (addr) => {
                await tyron.SearchBarUtil.default
                    .Resolve(net, addr)
                    .then(async (result: any) => {
                        const did_controller = result.controller.toLowerCase()

                        updateDoc({
                            did: result.did,
                            version: result.version,
                            doc: result.doc,
                            dkms: result.dkms,
                            guardians: result.guardians,
                        })

                        updateLoadingDoc(false)

                        if (_domain === DOMAINS.DID) {
                            dispatch(
                                updateLoginInfoContract({
                                    addr: addr!,
                                    controller:
                                        zcrypto.toChecksumAddress(
                                            did_controller
                                        ),
                                    status: result.status,
                                })
                            )
                        } else {
                            await tyron.SearchBarUtil.default
                                .fetchAddr(net, _username, _domain)
                                .then(async (domain_addr) => {
                                    dispatch(
                                        updateLoginInfoContract({
                                            addr: domain_addr!,
                                            controller:
                                                zcrypto.toChecksumAddress(
                                                    did_controller
                                                ),
                                            status: result.status,
                                        })
                                    )
                                })
                                .catch(() => {
                                    toast.error(`Uninitialized DID Domain.`, {
                                        position: 'top-right',
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: 'dark',
                                    })
                                    Router.push(`/${_username}`)
                                })
                        }
                    })
                    .catch((err) => {
                        throw err
                    })
            })
            .catch((err) => {
                toast.error(String(err), {
                    position: 'top-right',
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                })
                Router.push(`/`)
            })
    }

    return {
        fetch,
    }
}

export default fetchDoc
