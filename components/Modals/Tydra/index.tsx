import { useStore } from 'effector-react'
import {
    $modalTx,
    $modalTydra,
    $selectedCurrency,
    $txName,
    $tydra,
    updateModalTx,
    updateModalTxMinimized,
    updateSelectedCurrency,
    updateTxName,
    updateTydra,
    updateTydraModal,
} from '../../../src/store/modal'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import Spinner from '../../Spinner'
import { AddFunds, Donate, SearchBarWallet, Selector } from '../..'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../src/utils/smartContract'
import routerHook from '../../../src/hooks/router'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import Tydra from '../../../src/assets/logos/tydra.json'
import arweave from '../../../src/config/arweave'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import ThreeDots from '../../Spinner/ThreeDots'
import CloseIcoReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../src/assets/icons/ic_cross_black.svg'
import { $donation, updateDonation } from '../../../src/store/donation'
import { toast } from 'react-toastify'
import toastTheme from '../../../src/hooks/toastTheme'
import fetch from '../../../src/hooks/fetch'
import { $arconnect } from '../../../src/store/arconnect'
import useArConnect from '../../../src/hooks/useArConnect'
import { updateOriginatorAddress } from '../../../src/store/originatorAddress'
import leftArrowChrome from '../../../src/assets/icons/arrow_left_chrome.svg'
import leftArrowDark from '../../../src/assets/icons/arrow_left_dark.svg'
import { optionPayment } from '../../../src/constants/mintDomainName'
import { $buyInfo, updateBuyInfo } from '../../../src/store/buyInfo'

function Component() {
    // const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { connect } = useArConnect()
    const arConnect = useStore($arconnect)
    const { getSmartContract } = smartContract()
    const { navigate } = routerHook()
    const { checkVersion } = fetch()
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const modalTydra = useStore($modalTydra)
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const txName = useStore($txName)
    const modalTx = useStore($modalTx)
    const token: any = useStore($selectedCurrency)
    const tydra = useStore($tydra)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const leftArrow = isLight ? leftArrowDark : leftArrowChrome
    const version = checkVersion(resolvedInfo?.version)

    //@tydras-fee
    const zilMintFee = 1000

    //@tydras
    const tydra_url = 'JjOOYJ2LGWdOYkl_zLU6lATyVLSo8CIUawyMx8TIUsQ' //nawelito on fire: 'ohZj8PAGF27hsVHcIx6GZA05pr-HWVHrrrtjXcGHKag' // nessy: 'gzQgpvDBD8VujvSvgZ3WqPfFf7gumxYb3iTJNnDKE-A' // @xalkan token_uri on Arweave

    const [saveResult, setRes] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingPayment, setIsLoadingPayment] = useState(false)
    const [isEnough, setIsEnough] = useState(true)
    const [loading, setLoading] = useState(false)
    const [recipient, setRecipient] = useState('')
    const [isUsernameSaved, setSaveUsername] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')
    const [loadingCard, setLoadingCard] = useState(false)
    const [currentBalance, setCurrentBalance] = useState(0)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain

    const subdomainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''

    const buyInfo = useStore($buyInfo)

    const handleOnChangePayment = async (value) => {
        updateOriginatorAddress(null)
        setCurrentBalance(0)
        updateSelectedCurrency('')
        setIsEnough(true)
        updateDonation(null)
        setSaveUsername(false)
        setRecipient('')
        setIsLoadingPayment(true)
        try {
            if (value !== '') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'did',
                    'init'
                )
                if (value === 'FREE') {
                    const get_freelist = await getSmartContract(
                        init_addr,
                        'tydra_free_list'
                    )
                    const freelist: Array<string> =
                        get_freelist!.result.tydra_free_list
                    const is_free = freelist.filter(
                        (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (is_free.length === 0) {
                        throw new Error('You are not on the free list.')
                    }
                    toast("Congratulations, you're a winner!!", {
                        position: 'top-center',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 8,
                    })
                    // updateSelectedCurrency(value)
                    // setIsEnough(true)
                } else if (version >= 6) {
                    const id = value.toLowerCase()
                    const _currency = tyron.Currency.default.tyron(id)
                    let price = 0
                    //@todo make generic
                    switch (id) {
                        case 'tyron':
                            price = txName == 'deploy' ? 30 : 10
                            break
                        case 'zil':
                            price = txName == 'deploy' ? zilMintFee : 400
                            break
                        case 'gzil':
                            price = txName == 'deploy' ? 4.2 : 1.4
                            break
                        case 'zusdt':
                            price = txName == 'deploy' ? 30 : 10
                            break
                        case 'xsgd':
                            price = txName == 'deploy' ? 42 : 14
                            break
                        case 'xidr':
                            price = txName == 'deploy' ? 465000 : 155000
                            price = 155000
                            break
                    }
                    let xWallet_balance = 0
                    if (value !== 'ZIL') {
                        const tokenBalance = async (id_: string) => {
                            const id = id_.toLowerCase()
                            await getSmartContract(init_addr, 'services')
                                .then(async (get_services) => {
                                    return await tyron.SmartUtil.default.intoMap(
                                        get_services!.result.services
                                    )
                                })
                                .then(async (services) => {
                                    // Get token address
                                    const token_addr = services.get(id)
                                    const balances = await getSmartContract(
                                        token_addr,
                                        'balances'
                                    )
                                    return await tyron.SmartUtil.default.intoMap(
                                        balances!.result.balances
                                    )
                                })
                                .then((balances) => {
                                    const balance = balances.get(
                                        resolvedInfo?.addr?.toLowerCase()!
                                    )
                                    if (balance !== undefined) {
                                        xWallet_balance = balance
                                    }
                                })
                                .catch(() => {
                                    toast.warn(
                                        t('Mint NFT: Unsupported token.'),
                                        {
                                            position: 'bottom-left',
                                            autoClose: 4000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: toastTheme(isLight),
                                            toastId: 4,
                                        }
                                    )
                                })
                        }
                        await tokenBalance(value)

                        if (xWallet_balance < price * _currency.decimals) {
                            updateSelectedCurrency(value)
                            setCurrentBalance(
                                xWallet_balance / _currency.decimals
                            )
                            setIsEnough(false)
                            toast.warn('Your xWALLET needs more funds.', {
                                position: 'bottom-left',
                                autoClose: 4000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 3,
                            })
                        }
                    } else {
                        const zil_balance = await getSmartContract(
                            resolvedInfo?.addr!,
                            '_balance'
                        )
                        updateSelectedCurrency(value)
                        xWallet_balance = Number(zil_balance!.result._balance)
                        setCurrentBalance(xWallet_balance / _currency.decimals)
                    }
                    setCurrentBalance(xWallet_balance / _currency.decimals)

                    // if (xWallet_balance >= price * _currency.decimals) {
                    //     setIsEnough(true)
                    // } else {
                    //     // updateSelectedCurrency(value)
                    //     setIsEnough(false)
                    //     toast.error('Your xWALLET needs more funds.', {
                    //         position: 'bottom-right',
                    //         autoClose: 3000,
                    //         hideProgressBar: false,
                    //         closeOnClick: true,
                    //         pauseOnHover: true,
                    //         draggable: true,
                    //         progress: undefined,
                    //         theme: toastTheme(isLight),
                    //         toastId: 3,
                    //     })
                    // }
                    // updateSelectedCurrency(value)
                } else {
                    if (value !== 'ZIL') {
                        throw new Error(
                            'Payments other than ZIL are possible with a new DIDxWALLET v6.'
                        )
                    } else {
                        updateSelectedCurrency(value)
                        setIsEnough(true) //@todo verify zilpay balance
                    }
                }
                console.log('ToT selected fee:', value)
                updateSelectedCurrency(value)
            }
        } catch (error) {
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }
        setIsLoadingPayment(false)
    }

    const handleOnChangeTydra = (value) => {
        updateDonation(null)
        setRecipient('')
        setSaveUsername(false)
        setCurrentBalance(0)
        updateSelectedCurrency('')
        updateTydra(value)
    }

    const submitAr = async () => {
        setIsLoading(true)
        // setIsEnough(true)
        // setFreeList(false)
        // const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
        //     net,
        //     'init',
        //     'did'
        // )
        // let currency_ = 'zil'
        // let price = 1000
        // if (version >= 6) {
        //     currency_ = currency
        // }
        // switch (currency_.toLowerCase()) {
        //     case 'tyron':
        //         price = 30
        //         break
        //     case '$si':
        //         price = 30
        //         break
        //     case 'zusdt':
        //         price = 30
        //         break
        //     case 'xsgd':
        //         price = 40
        //         break
        //     case 'xidr':
        //         price = 450000
        //         break
        // }
        // const balance_ = await fetchWalletBalance(currency_.toLowerCase())
        // let balance = balance_[1]
        // if (version >= 6) {
        //     balance = balance_[0]
        // }
        // if (price > balance && currency !== 'FREE') {
        //     setIsLoading(false)
        //     setIsEnough(false)
        //     toast.error(
        //         `Insufficient balance, the cost is ${price} ${currency_}`,
        //         {
        //             position: 'top-center',
        //             autoClose: 3000,
        //             hideProgressBar: false,
        //             closeOnClick: true,
        //             pauseOnHover: true,
        //             draggable: true,
        //             progress: undefined,
        //             theme: toastTheme(isLight),
        //             toastId: 2,
        //         }
        //     )
        // } else {
        //     if (currency === 'FREE') {
        //         try {
        //             const get_free_list = await getSmartContract(
        //                 init_addr,
        //                 'tydra_free_list'
        //             )
        //             const freelist: Array<string> =
        //                 get_free_list.result.tydra_free_list
        //             const is_free = freelist.filter(
        //                 (val) => val === loginInfo.zilAddr.base16.toLowerCase()
        //             )
        //             if (is_free.length !== 0) {
        //                 setFreeList(true)
        //                 toast("Congratulations! You're a winner, baby!!", {
        //                     position: 'bottom-left',
        //                     autoClose: 3000,
        //                     hideProgressBar: false,
        //                     closeOnClick: true,
        //                     pauseOnHover: true,
        //                     draggable: true,
        //                     progress: undefined,
        //                     theme: toastTheme(isLight),
        //                     toastId: 8,
        //                 })
        //             } else {
        //                 throw Error()
        //             }
        //         } catch {
        //             toast.error(`You are not on the free list`, {
        //                 position: 'top-center',
        //                 autoClose: 3000,
        //                 hideProgressBar: false,
        //                 closeOnClick: true,
        //                 pauseOnHover: true,
        //                 draggable: true,
        //                 progress: undefined,
        //                 theme: toastTheme(isLight),
        //                 toastId: 2,
        //             })
        //             setFreeList(false)
        //             updateSelectedCurrency('')
        //         }
        //     }
        // if ((currency === 'FREE' && freeList) || price <= balance) {
        try {
            toast.info(
                `You're about to save the ToT GIF on Arweave's permaweb.`,
                {
                    position: 'top-center',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 0,
                }
            )
            //@xalkan
            const data = {
                name: 'MerXek ToT NFT',
                net: 'tyron.network',
                deployer: loginInfo?.arAddr,
                resource: Tydra.img,
            }

            await arweave
                .createTransaction({
                    data: JSON.stringify(data),
                })
                .then((transaction) => {
                    transaction.addTag('Content-Type', 'application/json')
                    window.arweaveWallet
                        .dispatch(transaction)
                        .then((res) => {
                            setRes(res.id)
                        })
                        .catch((err) => {
                            toast.warn(
                                `There was an issue when trying to save the NFT metadata on Arweave.`,
                                {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 1,
                                }
                            )
                        })
                })
                .catch((err) => {
                    toast.warn(`There was an unexpected issue.`, {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 1,
                    })
                })
        } catch (err) {
            toast.error(
                `There was an issue when trying to save GIF on Arweave.`,
                {
                    position: 'top-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 1,
                }
            )
            console.log(err)
        }
        setIsLoading(false)
    }

    const handleSubmitMint = async () => {
        try {
            // setIsEnough(true)
            setIsLoading(true)
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                'init'
            )
            let params: any = []
            let to_contract = init_addr
            let currency_ = 'zil'
            let amount_call = 0
            if (version >= 6) {
                currency_ = token.toLowerCase()
                to_contract = resolvedInfo?.addr!
                const donation_ = await tyron.Donation.default.tyron(donation!)
                const tyron_ = {
                    vname: 'tyron',
                    type: 'Option Uint128',
                    value: donation_,
                }
                params.push(tyron_)
                if (currency_ === 'zil') {
                    const zil_amount = Number(donation) + zilMintFee
                    if (zil_amount > currentBalance) {
                        amount_call = zil_amount - currentBalance
                    } else {
                        amount_call = 0
                    }
                } else {
                    amount_call = Number(donation)
                }
            } else {
                const get_freelist = await getSmartContract(
                    init_addr,
                    'tydra_free_list'
                )
                const freelist: Array<string> =
                    get_freelist!.result.tydra_free_list
                const is_free = freelist.filter(
                    (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                )
                if (is_free.length === 0) {
                    amount_call = zilMintFee
                } else {
                    amount_call = 0
                }
            }
            const zilpay = new ZilPayBase()
            let tx = await tyron.Init.default.transaction(net)
            const domainId =
                '0x' + (await tyron.Util.default.HashString(resolvedDomain!))
            const id = {
                vname: 'id',
                type: 'String',
                value: currency_,
            }
            params.push(id)
            const token_id = {
                vname: 'token_id',
                type: 'ByStr32',
                value: domainId,
            }
            params.push(token_id)
            const token_uri = {
                vname: 'token_uri',
                type: 'String',
                value: saveResult,
            }
            params.push(token_uri)

            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            await zilpay
                .call({
                    contractAddress: to_contract,
                    transition: 'MintTydraNft',
                    params: params as unknown as Record<string, unknown>[],
                    amount: String(amount_call),
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    tx = await tx.confirm(res.ID, 33)
                    if (tx.isConfirmed()) {
                        setIsLoading(false)
                        updateTxName('')
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        }, 1000)
                        updateTydraModal(false)
                        updateSelectedCurrency('')
                        navigate(
                            `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft`
                        )
                    } else if (tx.isRejected()) {
                        setIsLoading(false)
                        dispatch(setTxStatusLoading('failed'))
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    dispatch(setTxStatusLoading('rejected'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    throw err
                })
        } catch (error) {
            toast.warn('Please double-check the transaction link.', {
                position: 'bottom-left',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }

    const handleSubmitTransfer = async () => {
        try {
            setIsLoading(true)
            let params: any = []
            let contract: string
            let currency_ = token.toLowerCase()
            let amount_call = 0
            if (version >= 6) {
                contract = resolvedInfo?.addr!
                const donation_ = await tyron.Donation.default.tyron(donation!)
                const tyron_ = {
                    vname: 'tyron',
                    type: 'Option Uint128',
                    value: donation_,
                }
                params.push(tyron_)
                if (currency_ === 'zil') {
                    const zil_amount = Number(donation) + 400
                    if (zil_amount > currentBalance) {
                        amount_call = zil_amount - currentBalance
                    } else {
                        amount_call = 0
                    }
                } else {
                    amount_call = Number(donation)
                }
            } else {
                if (currency_ === 'zil') {
                    amount_call = zilMintFee
                }
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'did',
                    'init'
                )
                contract = init_addr
            }

            // const balance_ = await fetchWalletBalance(currency_)
            // let balance = balance_[1]
            // if (version >= 6) {
            //     balance = balance_[0]
            // }
            // if (price > balance && currency !== 'FREE') {
            //     setIsLoading(false)
            //     setIsEnough(false)
            //     toast.error(
            //         `Insufficient balance, the cost is ${price} ${currency}`,
            //         {
            //             position: 'top-right',
            //             autoClose: 3000,
            //             hideProgressBar: false,
            //             closeOnClick: true,
            //             pauseOnHover: true,
            //             draggable: true,
            //             progress: undefined,
            //             theme: toastTheme(isLight),
            //             toastId: 3,
            //         }
            //     )
            // } else {
            //     // if (currency === 'FREE') {
            //     //     try {
            //     //         const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
            //     //             net,
            //     //             'init',
            //     //             'did'
            //     //         )
            //     //         const get_free_list = await getSmartContract(
            //     //             init_addr,
            //     //             'tydra_free_list'
            //     //         )
            //     //         const freelist: Array<string> =
            //     //             get_free_list.result.tydra_free_list
            //     //         const is_free = freelist.filter(
            //     //             (val) => val === loginInfo.zilAddr.base16.toLowerCase()
            //     //         )
            //     //         if (is_free.length !== 0) {
            //     //             setFreeList(true)
            //     //             toast("Congratulations! You're a winner, baby!!", {
            //     //                 position: 'bottom-left',
            //     //                 autoClose: 3000,
            //     //                 hideProgressBar: false,
            //     //                 closeOnClick: true,
            //     //                 pauseOnHover: true,
            //     //                 draggable: true,
            //     //                 progress: undefined,
            //     //                 theme: toastTheme(isLight),
            //     //                 toastId: 8,
            //     //             })
            //     //         } else {
            //     //             throw Error()
            //     //         }
            //     //     } catch {
            //     //         toast.error(`You are not on the free list`, {
            //     //             position: 'top-center',
            //     //             autoClose: 3000,
            //     //             hideProgressBar: false,
            //     //             closeOnClick: true,
            //     //             pauseOnHover: true,
            //     //             draggable: true,
            //     //             progress: undefined,
            //     //             theme: toastTheme(isLight),
            //     //             toastId: 2,
            //     //         })
            //     //         setFreeList(false)
            //     //         updateSelectedCurrency('')
            //     //         setIsLoading(false)
            //     //     }
            //     // }
            //     if ((currency === 'FREE' && freeList) || price <= balance) {
            const zilpay = new ZilPayBase()
            let tx = await tyron.Init.default.transaction(net)
            const domainId =
                '0x' + (await tyron.Util.default.HashString(resolvedDomain!))
            const domainIdTo =
                '0x' + (await tyron.Util.default.HashString(recipient!))
            const id = {
                vname: 'id',
                type: 'String',
                value: currency_.toLowerCase(),
            }
            params.push(id)
            const tydra_ = {
                vname: 'tydra',
                type: 'String',
                value: tydra,
            }
            params.push(tydra_)
            const token_id = {
                vname: 'token_id',
                type: 'ByStr32',
                value: domainId,
            }
            params.push(token_id)
            const to_token_id = {
                vname: 'to_token_id',
                type: 'ByStr32',
                value: domainIdTo,
            }
            params.push(to_token_id)

            toast.info(`You’re about to transfer a ToT NFT to ${recipient}.`, {
                position: 'bottom-center',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 6,
            })

            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            await zilpay
                .call({
                    contractAddress: contract,
                    transition: 'TransferTydraNft',
                    params: params as unknown as Record<string, unknown>[],
                    amount: String(amount_call),
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    tx = await tx.confirm(res.ID, 33)
                    if (tx.isConfirmed()) {
                        setIsLoading(false)
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        }, 1000)
                        updateTxName('')
                        updateTydraModal(false)
                        updateSelectedCurrency('')
                        navigate(
                            `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft`
                        )
                    } else if (tx.isRejected()) {
                        setIsLoading(false)
                        dispatch(setTxStatusLoading('failed'))
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    dispatch(setTxStatusLoading('rejected'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    throw err
                })
        } catch (error) {
            toast.warn('Please double-check the transaction link.', {
                position: 'bottom-left',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }

    const toggleActive = async (id: string) => {
        if (loginInfo.arAddr) {
            connect()
        }
        setLoadingCard(false)
        updateDonation(null)
        // resetState()
        setIsEnough(true)
        updateSelectedCurrency('')
        setRes('')
        updateTydra('')
        if (id === txName) {
            updateTxName('')
        } else {
            updateTxName(id)
            // @todo review (to deploy tydra with existing arweave link)
            // if (id === 'deploy') {
            //     setLoadingCard(true)
            //     await connect().then(() => {
            //         const arConnect = $arconnect.getState()
            //         if (arConnect) {
            //             setLoadingCard(false)
            //             updateTxName(id)
            //         } else {
            //             setLoadingCard(false)
            //         }
            //     }).catch(() => {
            //         setLoadingCard(false)
            //     })
            // } else {
            //     updateTxName(id)
            // }
        }
    }

    const outerClose = () => {
        if (window.confirm('Are you sure about closing this window?')) {
            updateDonation(null)
            updateSelectedCurrency('')
            setRes('')
            updateTydraModal(false)
            toggleActive('')
            updateTxName('')
        }
    }

    const resolveDomain = async () => {
        setLoading(true)
        try {
            const input = usernameInput.replace(/ /g, '')
            let domain = input.toLowerCase()
            if (input.includes('@')) {
                domain = input
                    .split('@')[1]
                    .replace('.did', '')
                    .replace('.ssi', '')
                    .toLowerCase()
                toast.warn('The subdomain@ does not matter.', {
                    position: 'bottom-left',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 5,
                })
            } else if (input.includes('.')) {
                if (
                    input.split('.')[1] === 'ssi' ||
                    input.split('.')[1] === 'did'
                ) {
                    domain = input.split('.')[0].toLowerCase()
                } else {
                    throw new Error('Resolver failed: invalid NFT Domain Name.')
                }
            }

            await tyron.SearchBarUtil.default
                .fetchAddr(net, 'did', domain)
                .then(async () => {
                    setRecipient(domain)
                    setSaveUsername(true)
                })
                .catch(() => {
                    throw Error('Identity verification unsuccessful.')
                })
        } catch (error) {
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }

        setLoading(false)
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        setSaveUsername(false)
        setRecipient('')
        setUsernameInput(value)
    }

    const renderSend = () => {
        if (version < 6) {
            return true
        } else if (donation !== null) {
            return true
        } else {
            return false
        }
    }

    const back = () => {
        updateOriginatorAddress(null)
        setCurrentBalance(0)
        updateSelectedCurrency('')
        setIsEnough(true)
        updateDonation(null)
        setSaveUsername(false)
        setRecipient('')
    }

    useEffect(() => {
        console.log('effect token:', token)
        if (!modalTx && token !== '' && txName !== '') {
            handleOnChangePayment(token)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalTx])

    //@tydras-fee
    const optionMintingFee = [
        {
            value: 'ZIL',
            label: '$ZIL 1,000.0',
        },
        {
            value: 'TYRON',
            label: '$TYRON 30.0',
        },
        {
            value: 'gZIL',
            label: '$gZIL 4.2',
        },
        {
            value: 'XSGD',
            label: '$XSGD 42.0',
        },
        {
            value: 'XIDR',
            label: '$XIDR 465,000.0',
        },
        {
            value: 'zUSDT',
            label: '$zUSDT 30.0',
        },
        {
            value: 'FREE',
            label: 'FREE',
        },
    ]

    const optionMinting = [...optionMintingFee]

    const optionCurrencyTransfer = [
        ...optionPayment,
        {
            value: 'FREE',
            label: 'FREE' /* @todo-t t('FREE')*/,
        },
    ]

    //@tydras
    const optionTydra = [
        {
            value: 'nawelito',
            label: 'Nawelito: The Original',
        },
        {
            value: 'nawelitoonfire',
            label: 'Nawelito ON FIRE ToT',
        },
        {
            value: 'nessy',
            label: 'Nessy ToT',
        },
        {
            value: 'merxek',
            label: 'MerXek ToT',
        },
    ]

    if (!modalTydra) {
        return null
    }

    const rejectAddFunds = () => {
        updateDonation(null)
        updateOriginatorAddress(null)
        updateBuyInfo({
            recipientOpt: buyInfo?.recipientOpt,
            anotherAddr: buyInfo?.anotherAddr,
            currency: '',
            currentBalance: undefined,
            isEnough: undefined,
        })
    }

    return (
        <>
            <div onClick={outerClose} className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div onClick={outerClose} className="closeIcon">
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <div className={styles.headerTxt}>TYDRAS of TYRON</div>
                        <h6
                            style={{
                                marginLeft: '10px',
                                marginBottom: '20px',
                                color: isLight ? 'black' : 'white',
                            }}
                        >
                            Non-Fungible Tokens
                        </h6>
                    </div>
                    <div className={styles.cardWrapper}>
                        {/* @info Mint ToT */}
                        <div
                            onClick={() => toggleActive('deploy')}
                            className={
                                txName === 'deploy'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div className={styles.txt}>
                                {loadingCard ? (
                                    <div style={{ marginLeft: '1rem' }}>
                                        <ThreeDots color="basic" />
                                    </div>
                                ) : (
                                    'MINT ToT'
                                )}
                            </div>
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            {txName === 'deploy' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    {isEnough ? (
                                        <>
                                            {saveResult === '' ? (
                                                <div
                                                    style={{
                                                        marginTop: '16px',
                                                        width: '90%',
                                                    }}
                                                >
                                                    {version >= 6 && (
                                                        <>
                                                            <div
                                                                className={
                                                                    styles.select
                                                                }
                                                            >
                                                                <Selector
                                                                    option={
                                                                        optionMinting
                                                                    }
                                                                    onChange={
                                                                        handleOnChangePayment
                                                                    }
                                                                    placeholder={t(
                                                                        'Minting fee'
                                                                    )}
                                                                    defaultValue={
                                                                        token ===
                                                                        ''
                                                                            ? undefined
                                                                            : token
                                                                    }
                                                                />
                                                            </div>
                                                            {isLoadingPayment ? (
                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            '30px',
                                                                        display:
                                                                            'flex',
                                                                        width: '100%',
                                                                        justifyContent:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <Spinner />
                                                                </div>
                                                            ) : token !== '' ? (
                                                                <div
                                                                    className={
                                                                        styles.balanceInfo
                                                                    }
                                                                >
                                                                    {t(
                                                                        'CURRENT_BALANCE'
                                                                    )}
                                                                    <span
                                                                        className={
                                                                            styles.balanceInfoYellow
                                                                        }
                                                                    >
                                                                        &nbsp; $
                                                                        {token}{' '}
                                                                        {
                                                                            currentBalance
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </>
                                                    )}
                                                    {(token !== '' ||
                                                        version < 6) && (
                                                        <>
                                                            {arConnect ? (
                                                                <div
                                                                    className={
                                                                        styles.btnWrapper
                                                                    }
                                                                >
                                                                    <div
                                                                        onClick={
                                                                            submitAr
                                                                        }
                                                                        className={
                                                                            isLight
                                                                                ? 'actionBtnLight'
                                                                                : 'actionBtn'
                                                                        }
                                                                    >
                                                                        {isLoading ? (
                                                                            <ThreeDots color="black" /> //"basic" />
                                                                        ) : (
                                                                            'SAVE TYDRA'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div
                                                                        className={
                                                                            styles.btnWrapper
                                                                        }
                                                                    >
                                                                        <div
                                                                            onClick={() => {
                                                                                setRes(
                                                                                    tydra_url
                                                                                )
                                                                            }}
                                                                            className={
                                                                                isLight
                                                                                    ? 'actionBtnLight'
                                                                                    : 'actionBtn'
                                                                            }
                                                                        >
                                                                            {isLoading ? (
                                                                                <ThreeDots color="black" />
                                                                            ) : (
                                                                                'CONTINUE'
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    {version >= 6 && (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    '-10%',
                                                            }}
                                                        >
                                                            <Donate />
                                                        </div>
                                                    )}
                                                    {renderSend() && (
                                                        <>
                                                            <div
                                                                className={
                                                                    styles.btnWrapper
                                                                }
                                                            >
                                                                <div
                                                                    onClick={
                                                                        handleSubmitMint
                                                                    }
                                                                    className={
                                                                        isLight
                                                                            ? 'actionBtnLight'
                                                                            : 'actionBtn'
                                                                    }
                                                                >
                                                                    {isLoading ? (
                                                                        <ThreeDots color="black" />
                                                                    ) : (
                                                                        'MINT TYDRA' //@todo-t
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    width: '100%',
                                                }}
                                            >
                                                <div
                                                    onClick={back}
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Image
                                                        width={20}
                                                        src={leftArrow}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                className={styles.balanceInfo}
                                                style={{
                                                    marginBottom: '2rem',
                                                }}
                                            >
                                                {t('CURRENT_BALANCE')}
                                                <span
                                                    className={
                                                        styles.balanceInfoYellow
                                                    }
                                                >
                                                    &nbsp; ${token}{' '}
                                                    {currentBalance}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '90%',
                                                }}
                                            >
                                                <AddFunds
                                                    type="modal"
                                                    token={
                                                        version >= 6
                                                            ? token
                                                            : 'zil'
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.cardWrapper}>
                        {/* @info Transfer ToT */}
                        <div
                            onClick={() => toggleActive('transferTydra')}
                            className={
                                txName === 'transferTydra'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            {loadingCard ? (
                                <div style={{ marginLeft: '1rem' }}>
                                    <ThreeDots color="basic" />
                                </div>
                            ) : (
                                <span className={styles.txt}>TRANSFER ToT</span>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            {txName === 'transferTydra' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    {isEnough && (
                                        <div className={styles.picker}>
                                            <Selector
                                                option={optionTydra}
                                                onChange={handleOnChangeTydra}
                                                placeholder={t('Select ToT')}
                                                defaultValue={
                                                    tydra === ''
                                                        ? undefined
                                                        : tydra
                                                }
                                            />
                                            {/* @todo-x make sure that the user holds the selected Tydra */}
                                        </div>
                                    )}
                                    {tydra !== '' && (
                                        <>
                                            {isEnough && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.picker
                                                        }
                                                    >
                                                        <Selector
                                                            option={
                                                                optionCurrencyTransfer
                                                            }
                                                            onChange={
                                                                handleOnChangePayment
                                                            }
                                                            placeholder={t(
                                                                'Fee'
                                                            )}
                                                            defaultValue={
                                                                token === ''
                                                                    ? undefined
                                                                    : token
                                                            }
                                                        />
                                                    </div>
                                                    {isLoadingPayment ? (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    '10px',
                                                            }}
                                                        >
                                                            <Spinner />
                                                        </div>
                                                    ) : token !== '' ? (
                                                        <div
                                                            className={
                                                                styles.balanceInfo
                                                            }
                                                        >
                                                            {t(
                                                                'CURRENT_BALANCE'
                                                            )}
                                                            <span
                                                                className={
                                                                    styles.balanceInfoYellow
                                                                }
                                                            >
                                                                &nbsp;
                                                                {
                                                                    currentBalance
                                                                }{' '}
                                                                {token}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </>
                                            )}
                                            {!isEnough &&
                                                token !== '' &&
                                                token !== 'ZIL' && (
                                                    <div>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                width: '100%',
                                                            }}
                                                        >
                                                            <div
                                                                onClick={back}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <Image
                                                                    width={20}
                                                                    src={
                                                                        leftArrow
                                                                    }
                                                                    alt="arrow"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.balanceInfo
                                                            }
                                                            style={{
                                                                marginBottom:
                                                                    '2rem',
                                                            }}
                                                        >
                                                            {t(
                                                                'CURRENT_BALANCE'
                                                            )}
                                                            <span
                                                                className={
                                                                    styles.balanceInfoYellow
                                                                }
                                                            >
                                                                &nbsp;
                                                                {
                                                                    currentBalance
                                                                }{' '}
                                                                {token}
                                                            </span>
                                                        </div>
                                                        <AddFunds
                                                            type="modal"
                                                            token={token}
                                                            // coin={
                                                            //     version >= 6 ? currency : 'zil'
                                                            // }
                                                            //@todo add reject funds for this scenario in addfunds
                                                            reject={
                                                                rejectAddFunds
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            {isEnough && (
                                                <>
                                                    {/* <div className={styles.picker}>
                                                <Selector
                                                    option={
                                                        optionCurrencyTransfer
                                                    }
                                                    onChange={handleOnChange}
                                                    placeholder={t(
                                                        'Select payment'
                                                    )}
                                                />
                                            </div> */}
                                                    {token !== '' && (
                                                        <>
                                                            {/* <div
                                                        className={
                                                            styles.picker
                                                        }
                                                    >
                                                        <Selector
                                                            option={optionTydra}
                                                            onChange={
                                                                handleOnChangeTydra
                                                            }
                                                            placeholder={t(
                                                                'Select Tydra'
                                                            )}
                                                        />
                                                    </div> */}
                                                            {tydra !== '' && (
                                                                <>
                                                                    <div
                                                                        className={
                                                                            styles.picker
                                                                        }
                                                                    >
                                                                        <h6
                                                                            style={{
                                                                                marginTop:
                                                                                    '10%',
                                                                                width: '100%',
                                                                                display:
                                                                                    'flex',
                                                                                justifyContent:
                                                                                    'left',
                                                                            }}
                                                                        >
                                                                            recipient
                                                                        </h6>
                                                                        <SearchBarWallet
                                                                            resolveUsername={
                                                                                resolveDomain
                                                                            }
                                                                            handleInput={
                                                                                handleInput
                                                                            }
                                                                            input={
                                                                                usernameInput
                                                                            }
                                                                            loading={
                                                                                loading
                                                                            }
                                                                            saved={
                                                                                isUsernameSaved
                                                                            }
                                                                            bottomTick={
                                                                                true
                                                                            }
                                                                        />
                                                                    </div>
                                                                    {isUsernameSaved && (
                                                                        <>
                                                                            {version >=
                                                                                6 && (
                                                                                <Donate />
                                                                            )}
                                                                            {renderSend() && (
                                                                                <div
                                                                                    className={
                                                                                        styles.btnWrapper
                                                                                    }
                                                                                >
                                                                                    <div
                                                                                        onClick={
                                                                                            handleSubmitTransfer
                                                                                        }
                                                                                        className={
                                                                                            isLight
                                                                                                ? 'actionBtnLight'
                                                                                                : 'actionBtn'
                                                                                        }
                                                                                    >
                                                                                        {isLoading ? (
                                                                                            <ThreeDots color="basic" />
                                                                                        ) : (
                                                                                            'TRANSFER TYDRA'
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
