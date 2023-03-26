import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import * as fetchNode from 'node-fetch'
import { updateDoc } from '../store/did-doc'
import { $loading, updateLoading, updateLoadingDoc } from '../store/loading'
import { RootState } from '../app/reducers'
import { updateShowSearchBar } from '../store/modal'
import { $resolvedInfo, updateResolvedInfo } from '../store/resolvedInfo'
import smartContract from '../utils/smartContract'
import toastTheme from './toastTheme'
import { useStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { ZilPayBase } from '../../components/ZilPay/zilpay-base'

function fetch() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const zcrypto = tyron.Util.default.Zcrypto()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const Router = useRouter()
    const loading = useStore($loading)
    const resolvedInfo = useStore($resolvedInfo)
    const path = decodeURI(window.location.pathname)
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
            const domainId =
                '0x' + (await tyron.Util.default.HashString(_username))
            await tyron.SearchBarUtil.default
                .fetchAddr(net, domainId, _domain!)
                .then(async (addr) => {
                    let res = await getSmartContract(addr, 'version')
                    const version = res.result.version.slice(0, 7)
                    updateResolvedInfo({
                        name: _username,
                        domain: _domain,
                        addr: addr!,
                        version: res.result.version,
                    })
                    console.log('@!', res.result.version)
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
                        case 'airxwal':
                            // fetchDoc()
                            Router.push(`/${_domain}@${_username}/airx`)
                            break
                        // @todo-x-check: why this default? issue when creating a new xWallet: it redirects to the DIDxWallet: to handle user access /didx/wallet directly. I think we need this
                        default: //handle user access /didx/wallet directly
                            const didx = path.split('/')
                            if (
                                didx.length !== 3 &&
                                didx[2] === 'didx' &&
                                didx[3] !== 'recovery' &&
                                didx[3] !== 'doc' &&
                                resolvedInfo === null
                            ) {
                                Router.push(`/${_domain}@${_username}`)
                            }
                    }
                    updateLoading(false)
                })
                .catch(async () => {
                    try {
                        const domainId =
                            '0x' +
                            (await tyron.Util.default.HashString(_username))
                        await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            domainId,
                            ''
                        )
                        Router.push(`/${_username}/didx`)
                        updateResolvedInfo({
                            name: _username,
                            domain: _domain,
                        })
                    } catch (error) {
                        Router.push(`/`)
                    }
                    updateLoading(false)
                })
        }
    }

    const fetchDoc = async () => {
        updateShowSearchBar(false)
        updateLoadingDoc(true)
        const domainId = '0x' + (await tyron.Util.default.HashString(_username))
        await tyron.SearchBarUtil.default
            .fetchAddr(net, domainId, _domain)
            .then(async (addr) => {
                let res = await getSmartContract(addr, 'version')
                const version = res.result.version.slice(0, 7).toLowerCase()
                if (
                    version === 'didxwal' ||
                    version === 'xwallet' ||
                    version === 'initi--' ||
                    version === 'initdap'
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
                    const domainId =
                        '0x' + (await tyron.Util.default.HashString(_username))
                    await tyron.SearchBarUtil.default.fetchAddr(
                        net,
                        domainId,
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
        updateLoadingDoc(false)
    }

    const checkUserExists = async (_username: string) => {
        let res
        const domainId = '0x' + (await tyron.Util.default.HashString(_username))
        await tyron.SearchBarUtil.default
            .fetchAddr(net, domainId, 'did')
            .then(async () => {
                res = true
            })
            .catch(() => {
                res = false
                toast.error(`${_username} ${t('not found')}.`, {
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

    const checkVersion = (version) => {
        let res
        if (version?.includes('_')) {
            res = parseInt(version?.split('_')[1]!)
        } else {
            res = parseInt(version?.split('-')[1]!)
        }
        return res
    }

    const fetchWalletBalance = async (id: string, didxAddr?: string) => {
        let addr_ = resolvedInfo?.addr
        if (didxAddr) {
            addr_ = didxAddr
        }
        try {
            if (id !== 'zil') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                const get_services = await getSmartContract(
                    init_addr,
                    'services'
                )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )

                const token_addr = services.get(id)
                const balances = await getSmartContract(token_addr, 'balances')
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )

                let res = [0, 0]
                try {
                    const balance_didxwallet = balances_.get(
                        addr_!.toLowerCase()!
                    )
                    if (balance_didxwallet !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance =
                            balance_didxwallet / _currency.decimals
                        res[0] = Number(finalBalance.toFixed(12))
                    }
                } catch (error) {
                    res[0] = 0
                }
                try {
                    const balance_zilpay = balances_.get(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (balance_zilpay !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance = balance_zilpay / _currency.decimals
                        res[1] = Number(finalBalance.toFixed(12))
                    }
                } catch (error) {
                    res[1] = 0
                }
                return res
            } else {
                const balance = await getSmartContract(addr_!, '_balance')

                const balance_ = balance.result._balance
                const zil_balance = Number(balance_) / 1e12

                const zilpay = new ZilPayBase().zilpay
                const zilPay = await zilpay()
                const blockchain = zilPay.blockchain
                const zilliqa_balance = await blockchain.getBalance(
                    loginInfo.zilAddr.base16.toLowerCase()
                )
                const zilliqa_balance_ =
                    Number(zilliqa_balance.result!.balance) / 1e12

                let res = [
                    Number(zil_balance.toFixed(12)),
                    Number(zilliqa_balance_.toFixed(12)),
                ]
                return res
            }
        } catch (error) {
            let res = [0, 0]
            return res
        }
    }

    const getNftsWallet = async (nft) => {
        const tydras = ['nawelito', 'nawelitoonfire', 'nessy']
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            if (tydras.some((val) => val === nft)) {
                const base_uri = await getSmartContract(init_addr, 'base_uri')
                const baseUri = base_uri.result.base_uri
                const get_tokenuri = await getSmartContract(
                    init_addr,
                    'token_uris'
                )
                const token_uris = await tyron.SmartUtil.default.intoMap(
                    get_tokenuri.result.token_uris
                )
                const arr = Array.from(token_uris.values())
                const domainId =
                    '0x' +
                    (await tyron.Util.default.HashString(resolvedInfo?.name!))
                // @info arr[0] is nawelito, [1] nawelitoonfire, [2] nessy
                const id = tydras.indexOf(nft)
                let tokenUri = arr[id][domainId]
                let token_uris_: any = []
                if (tokenUri) {
                    await fetchNode(`${baseUri}${tokenUri}`)
                        .then((response) => response.json())
                        .then((data) => {
                            const obj = {
                                id: tokenUri,
                                name: data.resource,
                                uri: baseUri,
                                type: nft,
                            }
                            token_uris_.push(obj)
                        })
                }
                const res = {
                    token: token_uris_,
                    baseUri: baseUri,
                }
                return res
            } else {
                const get_services = await getSmartContract(
                    init_addr,
                    'services'
                )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )
                const tokenAddr = services.get(nft)
                const base_uri = await getSmartContract(tokenAddr, 'base_uri')
                // const baseUri = base_uri.result.base_uri
                const baseUri =
                    'https://lexica-serve-encoded-images.sharif.workers.dev/md/'
                const get_owners = await getSmartContract(
                    tokenAddr,
                    'token_owners'
                )
                const get_tokenUris = await getSmartContract(
                    tokenAddr,
                    'token_uris'
                )

                const owners = get_owners.result.token_owners
                const keyOwner = Object.keys(owners)
                const valOwner = Object.values(owners)
                let token_id: any = []
                for (let i = 0; i < valOwner.length; i += 1) {
                    if (
                        valOwner[i] === resolvedInfo?.addr?.toLowerCase() ||
                        valOwner[i] === loginInfo?.zilAddr?.base16.toLowerCase()
                    ) {
                        token_id.push(keyOwner[i])
                    }
                }

                const tokenUris = get_tokenUris.result.token_uris
                const keyUris = Object.keys(tokenUris)
                const valUris = Object.values(tokenUris)
                let token_uris: any = []
                for (let i = 0; i < valUris.length; i += 1) {
                    if (token_id.some((val) => val === keyUris[i])) {
                        const obj = {
                            id: keyUris[i],
                            name: valUris[i],
                            uri: baseUri,
                            type: nft,
                        }
                        token_uris.push(obj)
                    }
                }
                const res = {
                    token: token_uris,
                    baseUri: baseUri,
                }
                return res
            }
        } catch {
            const res = {
                token: [],
                baseUri: '',
            }
            return res
        }
    }

    const fetchLexica = async () => {
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            const get_services = await getSmartContract(init_addr, 'services')
            const services = await tyron.SmartUtil.default.intoMap(
                get_services.result.services
            )
            const tokenAddr = services.get('lexicassi')
            const get_tokenUris = await getSmartContract(
                tokenAddr,
                'token_uris'
            )
            const tokenUris = get_tokenUris.result.token_uris
            const valUris = Object.values(tokenUris)
            return valUris
        } catch {
            return []
        }
    }

    return {
        resolveUser,
        fetchDoc,
        versionAbove58,
        checkUserExists,
        checkVersion,
        fetchWalletBalance,
        getNftsWallet,
        fetchLexica,
    }
}

export default fetch
