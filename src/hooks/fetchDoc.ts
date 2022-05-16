import * as zcrypto from '@zilliqa-js/crypto'
import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { $user } from '../store/user'
import { fetchAddr, resolve } from '../../components/SearchBar/utils'
import { updateDoc } from '../store/did-doc'
import { updateLoadingDoc } from '../store/loading'
import { updateContract } from '../store/contract'
import { $net } from '../store/wallet-network'
import { DOMAINS } from '../../src/constants/domains'

function fetchDoc() {
    const username = useStore($user)?.name
    const net = useStore($net)
    const Router = useRouter()

    const fetch = async () => {
        const path = window.location.pathname.toLowerCase()
        const usernamePath = path.split('/')[1].split('.')[0]
        updateLoadingDoc(true)
        const _username = username !== undefined ? username! : usernamePath
        const _domain = 'did'
        await fetchAddr({ net, _username, _domain: 'did' })
            .then(async (addr) => {
                await resolve({ net, addr })
                    .then(async (result) => {
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
                            updateContract({
                                addr: addr!,
                                controller:
                                    zcrypto.toChecksumAddress(did_controller),
                                status: result.status,
                            })
                        } else {
                            await fetchAddr({ net, _username, _domain })
                                .then(async (domain_addr) => {
                                    updateContract({
                                        addr: domain_addr!,
                                        controller:
                                            zcrypto.toChecksumAddress(
                                                did_controller
                                            ),
                                        status: result.status,
                                    })
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
