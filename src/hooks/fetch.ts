import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import * as fetchNode from 'node-fetch'
import { updateDoc } from '../store/did-doc'
import { $loading, updateLoading, updateLoadingDoc } from '../store/loading'
import { RootState } from '../app/reducers'
import { updateModalBuyNft, updateShowSearchBar } from '../store/modal'
import { $resolvedInfo, User, updateResolvedInfo } from '../store/resolvedInfo'
import smartContract from '../utils/smartContract'
import toastTheme from './toastTheme'
import { useStore as effectorStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { ZilPayBase } from '../../components/ZilPay/zilpay-base'
import { Blockchain } from '../mixins/custom-fetch'
import { $net } from '../store/network'
import { updateSmartWallet } from '../store/wallet'
import { useStore } from 'react-stores'
import { ecoNfts } from '../constants/mintDomainName'

function useFetch(resolvedInfo: User) {
    // const isLight = useSelector((state: RootState) => state.modal.isLight)
    // const { t } = useTranslation()
    // const loginInfo = useSelector((state: RootState) => state.modal)
    // const zilpay_addr =
    // loginInfo?.zilAddr !== null
    //     ? loginInfo?.zilAddr.base16.toLowerCase()
    //     : ''
    // const resolvedInfo = useStore($resolvedInfo)
    // const Router = useRouter()
    // const loading = effectorStore($loading)

    const { getSmartContract } = smartContract()
    const zcrypto = tyron.Util.default.Zcrypto()

    const net = $net.state.net as 'mainnet' | 'testnet'

    const path = decodeURI(window.location.pathname)
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')
    // const tldPath = path.includes('@')
    //     ? path.split('/')[1]?.split('@')[0]
    //     : path.split('.')[1] === 'did'
    //         ? 'did'
    //         : ''
    // const usernamePath = path.includes('@')
    //     ? path
    //         .split('/')[1]
    //         ?.split('@')[1]
    //         ?.replace('.did', '')
    //         .replace('.ssi', '')
    //     : path.split('/')[1]?.split('.')[0]

    const input = path.split('/')[1]
    let domain: string
    let tld = ''
    let subdomain = ''
    if (input !== undefined) {
        domain = input.toLowerCase()
        if (input.includes('.zlp')) {
            tld = 'zlp'
        }
        if (input.includes('@')) {
            domain = input
                .split('@')[1]
                .replace('.did', '')
                .replace('.ssi', '')
                .replace('.zlp', '')
                .toLowerCase()
            subdomain = input.split('@')[0]
        } else if (input.includes('.')) {
            if (
                input.split('.')[1] === 'ssi' ||
                input.split('.')[1] === 'did' ||
                input.split('.')[1] === 'zlp'
            ) {
                domain = input.split('.')[0].toLowerCase()
                tld = input.split('.')[1]
            } else {
                toast('Resolution failed - Ask for support on Telegram.', {
                    position: 'bottom-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 2,
                })
            }
        }
    }

    const resolveUser = async () => {
        try {
            updateShowSearchBar(false)
            // if (!loading) {
            updateLoading(true)
            let _subdomain: string | undefined
            if (subdomain !== '') {
                _subdomain = subdomain
            }

            const res = await tyron.SearchBarUtil.default
                .fetchAddr(net, tld, domain, _subdomain)
                .then(async (addr) => {
                    try {
                        const res = await getSmartContract(addr, 'version')
                        const version_ = res!.result.version
                        const resolution = {
                            user_tld: tld,
                            user_domain: domain,
                            user_subdomain: subdomain,
                            addr: addr!,
                            version: version_,
                        }
                        updateResolvedInfo(resolution)
                        updateSmartWallet({ base16: addr })

                        console.log(
                            '@fetch: resolution - ',
                            JSON.stringify(resolution, null, 2)
                        )

                        let subdomainNavigate = _subdomain
                        if (tld === 'did') {
                            subdomainNavigate = 'did'
                        } else {
                            subdomainNavigate =
                                subdomain !== '' ? `${subdomain}@` : ''
                        }
                        updateLoading(false)
                        //@todo-x-check: issue, this gets run multiple times thus the alert(version) is repeated: adding !loading condition, tested when accessing sbt@bagasi directly
                        let r
                        switch (version_.slice(0, 7).toLowerCase()) {
                            case 'defixwa':
                                r = `/${subdomainNavigate}${domain}.ssi/defix`
                                break
                            case 'zilstak':
                                r = `/${subdomainNavigate}${domain}.ssi/zil`
                                break
                            case '.stake-':
                                r = `/${subdomainNavigate}${domain}.ssi/zil`
                                break
                            case 'zilxwal':
                                r = `/${subdomainNavigate}${domain}.ssi/zil`
                                break
                            case 'vcxwall':
                                //@review: xalkan, it should work with fetchDoc in the useEffect of each component when needed
                                //@todo-x-check why was fetchDoc here?: because we need doc for TTTxWallet wallet interface(e.g ivms) can't get it when user access directly from url not searchbar
                                r = `/${subdomainNavigate}${domain}.ssi/sbt`
                                break
                            case 'sbtxwal':
                                r = `/${subdomainNavigate}${domain}.ssi/sbt`
                                break
                            case 'airxwal':
                                r = `/${subdomainNavigate}${domain}.ssi/airx`
                                break
                            default:
                                // @info: why this default?
                                // there is an issue when creating a new xWallet (it redirects to the DIDxWallet).
                                // this handles user access to /didx/wallet directly

                                const didx = path.split('/')
                                if (
                                    didx.length !== 3 &&
                                    didx[2] === 'didx' &&
                                    didx[3] !== 'recovery' &&
                                    didx[3] !== 'doc' &&
                                    resolvedInfo === null
                                ) {
                                    r = `/${subdomainNavigate}${domain}.ssi`
                                } else {
                                    r = `/${subdomainNavigate}${domain}.ssi`
                                }
                        }
                        return r
                    } catch (error) {
                        updateLoading(false)
                        return `/resolvedAddress`
                    }
                })
                .catch(async (error) => {
                    console.error('@fetch user - ', error)
                    updateLoading(false)
                    updateResolvedInfo({
                        user_tld: tld,
                        user_domain: domain,
                        user_subdomain: '',
                    })
                    // Router.push('/')
                    updateModalBuyNft(true)
                    toast.warning(
                        // t('For your security, make sure you’re at tyron.network'),
                        'For your security, make sure you’re at tyron.network',
                        {
                            position: 'top-center',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            // theme: toastTheme(isLight),
                            toastId: 4,
                        }
                    )
                    // await tyron.SearchBarUtil.default.fetchAddr(
                    //     net,
                    //     '',
                    //     domain
                    // ).then(() => {
                    //     updateResolvedInfo({
                    //         user_tld: tld,
                    //         user_domain: domain,
                    //         user_subdomain: '',
                    //     })
                    //     Router.push(`/${domain}/didx`)
                    // })
                    //     .catch(() => {
                    //         Router.push(`/`)
                    //     })

                    return '/'
                })
            // }

            return res
        } catch (error) {
            return error
        }
    }

    const fetchDoc = async () => {
        updateShowSearchBar(false)
        updateLoadingDoc(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, 'did', domain)
            .then(async (addr) => {
                let res = await getSmartContract(addr, 'version')
                const version = res!.result.version.slice(0, 7).toLowerCase()
                if (
                    version === 'didxwal' ||
                    version === 'xwallet' ||
                    version === 'initi--'
                ) {
                    await tyron.SearchBarUtil.default
                        .Resolve(net, addr)
                        .then(async (result: any) => {
                            updateLoadingDoc(false)
                            console.log(
                                '@fetch: did doc',
                                JSON.stringify(result, null, 2)
                            )
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
                        })
                        .catch((err) => {
                            throw err
                        })
                } else if (version === 'initdap') {
                    updateLoadingDoc(false)
                }
            })
            .catch(async (error) => {
                updateLoadingDoc(false)
                console.error('@fetch doc:', error)
                // await tyron.SearchBarUtil.default.fetchAddr(net, '', domain)
                //     .then(() => {
                //         Router.push(`/${domain}/didx`)
                //     })
                //     .catch(() => {
                //         Router.push(`/`)
                //     })
            })
    }

    const checkUserExists = async (this_domain: string) => {
        let res
        await tyron.SearchBarUtil.default
            .fetchAddr(net, 'did', this_domain)
            .then(async () => {
                res = true
            })
            .catch(() => {
                res = false
                toast.warn(`${this_domain} ${'not found'}.`, {
                    position: 'top-left',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
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

    const checkVersion = (version: string) => {
        // console.log('@fetch: contract version for ', version)
        let res: number
        if (version?.includes('_')) {
            res = parseInt(version?.split('_')[1]!)
        } else {
            res = parseInt(version?.split('-')[1]!)
        }
        return res
    }

    const fetchWalletBalance = async (
        id: string,
        zilpay_addr: string,
        didxAddr?: string
    ) => {
        let addr_ = resolvedInfo?.addr
        if (didxAddr) {
            addr_ = didxAddr
        }
        try {
            if (id !== 'zil') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'did',
                    'init'
                )
                const get_services = await getSmartContract(
                    init_addr,
                    'services'
                )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services!.result.services
                )

                const token_addr = services.get(id)
                const balances = await getSmartContract(token_addr, 'balances')
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances!.result.balances
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
                    const balance_zilpay = balances_.get(zilpay_addr)
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

                const balance_ = balance!.result._balance
                const zil_balance = Number(balance_) / 1e12

                const zilpay = new ZilPayBase().zilpay
                const zilPay = await zilpay()
                const blockchain = zilPay.blockchain
                const zilliqa_balance = await blockchain.getBalance(zilpay_addr)
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

    const getNftsWallet = async (addrName: string) => {
        //@nfts-mainnet
        //@tydras-mainnet
        const tydras = [
            'nawelito',
            'nawelitoonfire',
            'nessy',
            'merxek',
            'ognawelito',
        ]
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                'init'
            )
            if (tydras.some((val) => val === addrName)) {
                const base_uri = await getSmartContract(init_addr, 'base_uri')
                const baseUri = base_uri!.result.base_uri
                const get_tokenuri = await getSmartContract(
                    init_addr,
                    'token_uris'
                )
                const token_uris = await tyron.SmartUtil.default.intoMap(
                    get_tokenuri!.result.token_uris
                )
                const arr = Array.from(token_uris.values())
                const domainId =
                    '0x' +
                    (await tyron.Util.default.HashString(
                        resolvedInfo?.user_domain!
                    ))
                // @info arr[0] is nawelito, [1] nawelitoonfire, [2] nessy
                const id = tydras.indexOf(addrName)
                let tokenUri = arr[id][domainId]
                let token_uris_: any = []
                if (tokenUri) {
                    await fetchNode
                        .default(`${baseUri}${tokenUri}`)
                        .then((response) => response.json())
                        .then((data) => {
                            const obj = {
                                id: tokenUri,
                                name: data.resource,
                                uri: baseUri,
                                type: addrName,
                            }
                            token_uris_.push(obj)
                        })
                }
                const res = {
                    tokenIds: [],
                    tokenUris: token_uris_,
                    baseUri: baseUri,
                }
                return res
            } else {
                const get_services = await getSmartContract(
                    init_addr,
                    'services'
                )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services!.result.services
                )
                const tokenAddr = services.get(addrName)

                // @batch fetch
                let nft_data
                try {
                    const provider = new Blockchain()
                    nft_data = await provider.getNonFungibleData(tokenAddr)
                    // console.log(
                    //     '@fetch: nft data',
                    //     JSON.stringify(nft_data, null, 2)
                    // )
                } catch (error) {
                    console.error('@fetch nft wallet - ', error)
                }

                let base_uri
                // if (addrName === 'lexicassi') {
                //     base_uri =
                //         'https://lexica-serve-encoded-images.sharif.workers.dev/md/'
                // } else
                if (addrName === 'dd10k') {
                    base_uri =
                        'https://dd10k.sfo3.cdn.digitaloceanspaces.com/dd10klores/'
                } else {
                    base_uri = nft_data.base_uri
                }
                console.log('@fetch_NFT_BASE_URI: ', base_uri)
                const owners = nft_data.owners
                const keyOwner = Object.keys(owners)
                const valOwner = Object.values(owners)
                let token_ids: any = []
                for (let i = 0; i < valOwner.length; i += 1) {
                    if (
                        valOwner[i] === resolvedInfo?.addr?.toLowerCase()
                        //|| valOwner[i] === loginInfo?.zilAddr?.base16.toLowerCase()
                    ) {
                        token_ids.push({ id: keyOwner[i] })
                    }
                }

                const tokenUris = nft_data.token_uris
                const keyUris = Object.keys(tokenUris)
                const valUris = Object.values(tokenUris)
                let token_uris: any = []
                for (let i = 0; i < valUris.length; i += 1) {
                    if (token_ids.some((val) => val.id === keyUris[i])) {
                        let nft_name = valUris[i]

                        //@review: nfts
                        if (ecoNfts.includes(addrName)) {
                            nft_name = keyUris[i] + '.png'
                        }
                        const obj = {
                            id: keyUris[i],
                            name: nft_name,
                            uri: base_uri,
                            type: addrName,
                        }
                        token_uris.push(obj)
                    }
                }
                const res = {
                    tokenIds: token_ids,
                    tokenUris: token_uris,
                    baseUri: base_uri,
                }
                return res
            }
        } catch {
            const res = {
                tokenIds: [],
                tokenUris: [],
                baseUri: '',
            }
            return res
        }
    }

    const fetchLexica = async () => {
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                'init'
            )
            const get_services = await getSmartContract(init_addr, 'services')
            const services = await tyron.SmartUtil.default.intoMap(
                get_services!.result.services
            )
            const tokenAddr = services.get('lexicassi')
            const get_tokenUris = await getSmartContract(
                tokenAddr,
                'token_uris'
            )
            const tokenUris = get_tokenUris!.result.token_uris
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

export default useFetch
