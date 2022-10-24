import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { updateDoc } from '../store/did-doc'
import { $loading, updateLoading, updateLoadingDoc } from '../store/loading'
import { RootState } from '../app/reducers'
import { updateShowSearchBar } from '../store/modal'
import { $resolvedInfo, updateResolvedInfo } from '../store/resolvedInfo'
import smartContract from '../utils/smartContract'
import toastTheme from './toastTheme'
import { useStore } from 'effector-react'
import { useTranslation } from 'next-i18next'

function fetch() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const zcrypto = tyron.Util.default.Zcrypto()
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const Router = useRouter()
    const loading = useStore($loading)
    const resolvedInfo = useStore($resolvedInfo)
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')
    const domainPath = path.includes('@')
        ? path.split('/')[1]?.split('@')[0]
        : path.split('.')[1] === 'did'
        ? 'did'
        : ''
    const usernamePath = path.includes('@')
        ? path
              .split('/')[1]
              ?.split('@')[1]
              ?.replace('.did', '')
              .replace('.ssi', '')
        : path.split('/')[1]?.split('.')[0]
    const _domain = domainPath
    const _username = usernamePath

    const resolveUser = async () => {
        updateShowSearchBar(false)
        if (!loading) {
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
                        version: res.result.version,
                    })
                    //@todo-x-check: issue, this gets run multiple times thus the alert(version) is repeated: adding !loading condition, tested when accessing sbt@bagasi directly
                    switch (version.toLowerCase()) {
                        case 'zilstak':
                            Router.push(`/${_domain}@${_username}/zil`)
                            break
                        case '.stake-':
                            Router.push(`/${_domain}@${_username}/zil`)
                            break
                        case 'zilxwal':
                            Router.push(`/${_domain}@${_username}/zil`)
                            break
                        case 'vcxwall':
                            //@todo-x-check why was fetchDoc here?: because we need doc for TTTxWallet wallet interface(e.g ivms) can't get it when user access directly from url not searchbar
                            // fetchDoc()
                            Router.push(`/${_domain}@${_username}/sbt`)
                            break
                        case 'sbtxwal':
                            // fetchDoc()
                            Router.push(`/${_domain}@${_username}/sbt`)
                            break
                        // @todo-x-check: why this default? issue when creating a new xWallet: it redirects to the DIDxWallet: to handle user access /didx/wallet directly. I think we need this
                        default: //handle user access /didx/wallet directly
                            const didx = path.split('/')
                            if (
                                didx.length !== 3 &&
                                didx[2] === 'didx' &&
                                didx[3] !== 'recovery' &&
                                resolvedInfo === null
                            ) {
                                Router.push(`/${_domain}@${_username}`)
                            }
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

    const checkUserAvailable = async (_username: string) => {
        let res
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, 'did')
            .then(async () => {
                res = true
            })
            .catch(() => {
                res = false
                toast.error(`${_username} ${t('not found')}`, {
                    position: 'top-left',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 11,
                })
            })
        return res
    }

    const versionAbove58 = () => {
        let res
        if (!resolvedInfo?.version?.includes('_')) {
            res = false
        } else {
            var ver = resolvedInfo?.version?.split('_')[1]!
            if (parseInt(ver?.split('.')[0]) < 5) {
                res = false
            } else if (parseInt(ver?.split('.')[0]) > 5) {
                res = true
            } else if (parseInt(ver?.split('.')[1]) >= 8) {
                res = true
            } else {
                res = false
            }
        }
        return res
    }

    return {
        resolveUser,
        fetchDoc,
        checkUserAvailable,
        versionAbove58,
    }
}

export default fetch
