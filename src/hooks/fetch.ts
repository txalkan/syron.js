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
import toastTheme from './toastTheme'

function fetch() {
    const { getSmartContract } = smartContract()
    const zcrypto = tyron.Util.default.Zcrypto()
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const Router = useRouter()
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')
    const domainPath = path.includes('@')
        ? path.split('/')[1]?.split('@')[0]
        : 'did'
    const usernamePath = path.includes('@')
        ? path.split('/')[1]?.split('@')[1].replace('.did', '')
        : path.split('/')[1]?.split('.')[0]
    const _domain = domainPath
    const _username = usernamePath

    const resolveUser = async () => {
        updateShowSearchBar(false)
        updateLoading(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username!, _domain!)
            .then(async (addr) => {
                let res = await getSmartContract(addr, 'version')
                const version = res.result.version.slice(0, 7)
                updateResolvedInfo({
                    name: _username,
                    domain: _domain,
                    addr: addr!,
                    version: version,
                })
                switch (res.result.version.slice(0, 8)) {
                    case 'zilstake':
                        Router.push(`/${_username}/zil`)
                        break
                    case '.stake--':
                        Router.push(`/${_username}/zil`)
                        break
                    case 'ZILxWall':
                        Router.push(`/${_username}/zil`)
                        break
                    case 'VCxWalle':
                        fetchDoc()
                        Router.push(`/${_username}/sbt`)
                        break
                    case 'SBTxWall':
                        fetchDoc()
                        Router.push(`/${_username}/sbt`)
                        break
                    default:
                        Router.push(`/${_username}`)
                }
                updateLoading(false)
            })
            .catch(() => {
                updateLoading(false)
                // setTimeout(() => {
                //     toast.warning('Create a new DID.', {
                //         position: 'top-right',
                //         autoClose: 6000,
                //         hideProgressBar: false,
                //         closeOnClick: true,
                //         pauseOnHover: true,
                //         draggable: true,
                //         progress: undefined,
                //         theme: toastTheme(isLight),
                //         toastId: '1',
                //     })
                // }, 1000)
                // Router.push(`/`)
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
                if (
                    version === 'DIDxWAL' ||
                    version === 'xwallet' ||
                    version === 'initi--'
                ) {
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
            .catch(async () => {
                try {
                    await tyron.SearchBarUtil.default.fetchAddr(
                        net,
                        _username!,
                        ''
                    )
                    setTimeout(() => {
                        toast.warning('Create a new DID.', {
                            position: 'top-right',
                            autoClose: 6000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: '1',
                        })
                    }, 1000)
                    Router.push(`/${_username}/didx`)
                } catch (error) {
                    Router.push(`/`)
                }
                updateLoadingDoc(false)
            })
    }

    return {
        resolveUser,
        fetchDoc,
    }
}

export default fetch
