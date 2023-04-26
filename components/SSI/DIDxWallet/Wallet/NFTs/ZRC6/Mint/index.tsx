/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../../src/hooks/router'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import ThreeDots from '../../../../../../Spinner/ThreeDots'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import { toast } from 'react-toastify'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'
import Selector from '../../../../../../Selector'
import {
    AddFunds,
    Arrow,
    Donate,
    ModalImg,
    SearchBarWallet,
    Spinner,
} from '../../../../../..'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import {
    setTxId,
    setTxStatusLoading,
} from '../../../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import smartContract from '../../../../../../../src/utils/smartContract'
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkDark from '../../../../../../../src/assets/icons/selected_checkmark.svg'
import selectedCheckmarkLight from '../../../../../../../src/assets/icons/selected_checkmark_purple.svg'
import AddIconBlack from '../../../../../../../src/assets/icons/add_icon_black.svg'
import AddIconReg from '../../../../../../../src/assets/icons/add_icon.svg'
import * as fetch_ from '../../../../../../../src/hooks/fetch'
import { $buyInfo, updateBuyInfo } from '../../../../../../../src/store/buyInfo'
import {
    isValidUsername,
    optionPayment,
} from '../../../../../../../src/constants/mintDomainName'
import { sendTelegramNotification } from '../../../../../../../src/telegram'

function Component({ addrName }) {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { getSmartContract } = smartContract()
    const { fetchLexica, fetchWalletBalance } = fetch_.default()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const buyInfo = useStore($buyInfo)
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    // const username = resolvedInfo?.name
    // const domain = resolvedInfo?.domain
    // const domainNavigate = domain !== '' ? domain + '@' : ''
    // const { navigate } = routerHook()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const AddIcon = isLight ? AddIconBlack : AddIconReg
    const styles = isLight ? stylesLight : stylesDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const selectedCheckmark = isLight
        ? selectedCheckmarkLight
        : selectedCheckmarkDark
    // const [txName, setTxName] = useState('')
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [savedDns, setSavedGzil] = useState(false)
    const [recipient, setRecipient] = useState('')
    const [otherRecipient, setOtherRecipient] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingGzil, setLoadingDns] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')

    const [domainName, setDomainName] = useState('')
    const [domainInput, setDomainInput] = useState('')
    const [nftInput, setNftInput] = useState('')
    const [nftLoading, setNftLoading] = useState(false)
    const [nftList, setNftList] = useState([])
    const [selectedNft, setSelectedNft] = useState('')
    const [showModalImg, setShowModalImg] = useState(false)
    const [dataModalImg, setDataModalImg] = useState('')
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [loadingBalance, setLoadingBalance] = useState(false)

    const handleInputAdddr = (event: { target: { value: any } }) => {
        setSavedAddr(false)
        setAddr(event.target.value)
    }

    const handleInputLexica = (event: { target: { value: any } }) => {
        setSelectedNft('')
        setNftList([])
        setNftInput(event.target.value)
    }

    const saveAddr = () => {
        const addr_ = tyron.Address.default.verification(addr)
        if (addr_ !== '') {
            setAddr(addr)
            setSavedAddr(true)
        } else {
            toast.error(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 10,
            })
        }
    }

    const searchLexica = async () => {
        setNftLoading(true)
        const lexicaList = await fetchLexica()
        await fetch(`https://lexica.art/api/v1/search?q=${nftInput}`)
            .then((response) => response.json())
            .then((data) => {
                setNftLoading(false)
                let filteredData: any = Array()
                for (let i = 0; i < data.images.length; i += 1) {
                    if (!lexicaList?.some((arr) => arr === data.images[i].id)) {
                        filteredData.push(data.images[i])
                    }
                }
                let shuffled = filteredData
                    .map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)
                // setTydra(data.resource)
                console.log(shuffled.slice(0, 10))
                setNftList(shuffled.slice(0, 10))
            })
            .catch(() => {
                setNftLoading(false)
            })
    }

    const handleOnKeyPressAddr = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            saveAddr()
        }
    }

    const handleOnKeyPressLexica = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            searchLexica()
        }
    }

    const onChangeRecipient = (value: string) => {
        updateDonation(null)
        updateBuyInfo(null)
        setAddr('')
        setOtherRecipient('')
        setSavedAddr(false)
        setRecipient(value)
    }

    const onChangeTypeOther = (value: string) => {
        updateDonation(null)
        setAddr('')
        setSavedAddr(false)
        setOtherRecipient(value)
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        setSavedAddr(false)
        setAddr('')
        setUsernameInput(value)
    }

    const handleDomainInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        updateBuyInfo(null)
        setSavedGzil(false)
        setDomainName('')
        setDomainInput(value)
    }

    const toggleSelectNft = (val) => {
        if (selectedNft === val) {
            setSelectedNft('')
        } else {
            setSelectedNft(val)
        }
    }

    const resolveUsername = async (type: string) => {
        try {
            let input = ''
            if (type === 'new_domain') {
                setLoadingDns(true)
                if (isValidUsername(domainInput)) {
                    input = domainInput.replace(/ /g, '').toLowerCase()
                    input = input.replace(addrName, '')
                    const init_addr =
                        await tyron.SearchBarUtil.default.fetchAddr(
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
                    const serviceAddr = services.get(addrName)
                    const get_state = await getSmartContract(
                        serviceAddr,
                        'nft_dns'
                    )
                    const state = await tyron.SmartUtil.default.intoMap(
                        get_state!.result.nft_dns
                    )
                    const domainId =
                        '0x' + (await tyron.Util.default.HashString(input))

                    if (state.get(domainId)) {
                        console.log(
                            'Domain Taken. Assigned address',
                            state.get(domainId)
                        )
                        toast.error(
                            `${input}${addrName} is already registered.`,
                            {
                                position: 'bottom-right',
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
                    } else {
                        console.log('domain_hash:', domainId)
                        setDomainName(domainId)
                        setSavedGzil(true)
                    }
                } else {
                    if (domainInput !== '') {
                        if (domainInput.toLowerCase().includes(addrName)) {
                            toast.warn(
                                `Type the domain name without ${addrName} at the end.`,
                                {
                                    position: 'bottom-left',
                                    autoClose: 4000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 2,
                                }
                            )
                        } else {
                            toast('Available in the future.', {
                                position: 'top-right',
                                autoClose: 6000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 3,
                            })
                        }
                    }
                }
                setLoadingDns(false)
            } else {
                setLoading(true)
                input = usernameInput.replace(/ /g, '').toLowerCase()
                let domain = input.toLowerCase()
                let tld = ''
                let subdomain = ''
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
                        throw new Error('Resolver failed.')
                    }
                }
                let _subdomain
                if (subdomain !== '') {
                    _subdomain = subdomain
                }
                // let username = ''
                // let domain = ''
                // if (input.includes('.')) {
                //     let suffix = input.split('.')[1]

                //     suffix = suffix
                //         .replace('did', '')
                //         .replace('ssi', '')
                //         .replace('gzil', '')
                //         .replace('zlp', '')
                //     if (suffix !== '') {
                //         toast.warn('Unavailable domain.', {
                //             position: 'bottom-left',
                //             autoClose: 4000,
                //             hideProgressBar: false,
                //             closeOnClick: true,
                //             pauseOnHover: true,
                //             draggable: true,
                //             progress: undefined,
                //             theme: toastTheme(isLight),
                //             toastId: 3,
                //         })
                //     } else {
                //         if (input.includes('@')) {
                //             username = input.split('@')[1]
                //             // .replace('.did', '')
                //             // .replace('.ssi', '')
                //             // .replace('.gzil', '')
                //             domain = input.split('@')[0]
                //         } else if (input.includes('.')) {
                //             if (input.split('.')[1] === 'did') {
                //                 username = input.split('.')[0]
                //                 domain = 'did'
                //             } else if (input.split('.')[1] === 'gzil') {
                //                 username = input.split('.')[0]
                //                 domain = 'gzil'
                //             } else if (input.split('.')[1] === 'zlp') {
                //                 username = input.split('.')[0]
                //                 domain = 'zlp'
                //             } else if (input.split('.')[1] === 'ssi') {
                //                 username = input.split('.')[0]
                //             }
                //         }
                //     }
                // } else if (input.includes('@')) {
                //     username = input.split('@')[1]
                //     domain = input.split('@')[0]
                // } else {
                //     username = input
                // }
                // console.log('username:', username)
                // console.log('domain:', domain)
                if (domain !== '') {
                    if (tld === 'gzil' || tld === 'zlp') {
                        const init_addr =
                            await tyron.SearchBarUtil.default.fetchAddr(
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
                        const serviceAddr = services.get(addrName)
                        const get_state = await getSmartContract(
                            serviceAddr,
                            'nft_dns'
                        )
                        const state = await tyron.SmartUtil.default.intoMap(
                            get_state!.result.nft_dns
                        )
                        const domainId =
                            '0x' + (await tyron.Util.default.HashString(domain))
                        let nft_addr = state.get(domainId)
                        if (nft_addr) {
                            console.log('Assigned address:', nft_addr)
                            nft_addr = zcrypto.toChecksumAddress(nft_addr)
                            setAddr(nft_addr)
                            setSavedAddr(true)
                        } else {
                            toast('Assigned address not found', {
                                position: 'top-right',
                                autoClose: 6000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 4,
                            })
                        }
                    } else {
                        await tyron.SearchBarUtil.default
                            .fetchAddr(net, tld, domain, _subdomain)
                            .then(async (addr) => {
                                addr = zcrypto.toChecksumAddress(addr)
                                console.log('address:', addr)
                                setAddr(addr)
                                setSavedAddr(true)
                            })
                            .catch(() => {
                                toast.error('Address not found.', {
                                    position: 'top-right',
                                    autoClose: 2000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 11,
                                })
                            })
                    }
                }
                setLoading(false)
            }
        } catch (error) {
            if (type === 'new_domain') {
                setLoadingDns(false)
            } else {
                setLoading(false)
            }
        }
    }

    const handleOnChangePayment = async (value: any) => {
        updateDonation(null)
        updateBuyInfo({
            recipientOpt: buyInfo?.recipientOpt,
            anotherAddr: buyInfo?.anotherAddr,
            currency: undefined,
            currentBalance: undefined,
            isEnough: undefined,
        })
        if (value !== '') {
            updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: buyInfo?.anotherAddr,
                currency: value,
                currentBalance: 0,
                isEnough: false,
            })
            setLoadingPayment(true)
            try {
                // const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                //     net,
                //     'init',
                //     'did'
                // )
                // if (value === 'FREE') {
                //     const get_freelist = await getSmartContract(
                //         init_addr!,
                //         'free_list'
                //     )
                //     const freelist: Array<string> =
                //         get_freelist.result.free_list
                //     const is_free = freelist.filter(
                //         (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                //     )
                //     if (is_free.length === 0) {
                //         throw new Error('You are not on the free list')
                //     }
                //     toast("Congratulations! You're a winner, baby!!", {
                //         position: 'bottom-left',
                //         autoClose: 3000,
                //         hideProgressBar: false,
                //         closeOnClick: true,
                //         pauseOnHover: true,
                //         draggable: true,
                //         progress: undefined,
                //         theme: toastTheme(isLight),
                //         toastId: 8,
                //     })
                // }
                const paymentOptions = async (id: string) => {
                    setLoadingBalance(true)
                    await fetchWalletBalance(
                        id,
                        loginInfo.address.toLowerCase()
                    )
                        .then(async (balances) => {
                            const balance = balances[0]
                            if (balance !== undefined) {
                                let price = 0
                                const init_addr =
                                    await tyron.SearchBarUtil.default.fetchAddr(
                                        net,
                                        'did',
                                        'init'
                                    )
                                const get_state = await getSmartContract(
                                    init_addr,
                                    'utility'
                                )
                                const field = Object.entries(
                                    get_state!.result.utility
                                )
                                for (let i = 0; i < field.length; i += 1) {
                                    if (field[i][0] === id) {
                                        const utils = Object.entries(
                                            field[i][1] as any
                                        )
                                        const util_id = 'BuyNftUsername'
                                        for (
                                            let i = 0;
                                            i < utils.length;
                                            i += 1
                                        ) {
                                            if (utils[i][0] === util_id) {
                                                price = Number(utils[i][1])
                                                const _currency =
                                                    tyron.Currency.default.tyron(
                                                        id
                                                    )
                                                price =
                                                    price / _currency.decimals
                                                price = Number(price.toFixed(2))
                                            }
                                        }
                                    }
                                }
                                // switch (id) {
                                //     case 'xsgd':
                                //         price = 15
                                //         break
                                //     case 'zil':
                                //         price = 500
                                //         break
                                //     default:
                                //         price = 10
                                //         break
                                // }
                                if (balance >= price || id === 'zil') {
                                    updateBuyInfo({
                                        recipientOpt: buyInfo?.recipientOpt,
                                        anotherAddr: buyInfo?.anotherAddr,
                                        currency: value,
                                        currentBalance: balance,
                                        isEnough: true,
                                    })
                                } else {
                                    updateBuyInfo({
                                        recipientOpt: buyInfo?.recipientOpt,
                                        anotherAddr: buyInfo?.anotherAddr,
                                        currency: value,
                                        currentBalance: balance,
                                        isEnough: false,
                                    })
                                    toast.warn(
                                        'Your DIDxWALLET does not have enough balance.',
                                        {
                                            position: 'bottom-left',
                                            autoClose: 4000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: toastTheme(isLight),
                                            toastId: 12,
                                        }
                                    )
                                }
                            }
                        })
                        .catch(() => {
                            toast.warn(t('Mint NFT: Unsupported token.'), {
                                position: 'bottom-left',
                                autoClose: 4000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 13,
                            })
                        })
                    setLoadingBalance(false)
                }
                const id = value.toLowerCase()
                if (id !== 'free') {
                    paymentOptions(id)
                } else {
                    updateBuyInfo({
                        recipientOpt: buyInfo?.recipientOpt,
                        anotherAddr: buyInfo?.anotherAddr,
                        currency: value,
                        currentBalance: 0,
                        isEnough: true,
                    })
                }
            } catch (error) {
                updateBuyInfo({
                    recipientOpt: buyInfo?.recipientOpt,
                    anotherAddr: buyInfo?.anotherAddr,
                    currency: undefined,
                    currentBalance: undefined,
                    isEnough: undefined,
                })
                toast.error(String(error), {
                    position: 'bottom-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 14,
                })
            }
            setLoadingPayment(false)
        }
    }

    const notifyBot = async (domain) => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: `tyron.network ${net}\n\nNFT domain minted:\n${domain}${addrName}`,
        }
        await sendTelegramNotification(request.body)
    }

    const handleSubmit = async () => {
        setLoadingSubmit(true)
        let amount: any = '0'
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
            const serviceAddr = services.get(addrName)
            const get_premiumprice = await getSmartContract(
                serviceAddr,
                'premium_price'
            )
            const premium_price = await tyron.SmartUtil.default.intoMap(
                get_premiumprice!.result.premium_price
            )
            amount = premium_price //@xalkan review
        } catch {
            amount = '0'
        }
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        // let tokenUri = selectedNft
        // try {
        //     tokenUri = await fetchTydra()
        // } catch (err) {
        //     throw new Error()
        // }
        let params: any = []
        const addrName_ = {
            vname: 'addrName',
            type: 'String',
            value: addrName,
        }
        params.push(addrName_)
        const id_ = {
            vname: 'id',
            type: 'String',
            value:
                addrName === '.gzil' || addrName === '.zlp'
                    ? buyInfo?.currency?.toLowerCase()
                    : '',
        }
        params.push(id_)
        const recipient_ = {
            vname: 'to',
            type: 'ByStr20',
            value: recipient === 'SSI' ? resolvedInfo?.addr : addr,
        }
        params.push(recipient_)
        const token_uri = {
            vname: 'token_uri',
            type: 'String',
            value: addrName === 'lexicassi' ? selectedNft : domainName,
            // value: addrName === 'lexicassi' ? tokenUri : gzil + '.gzil',
        }
        params.push(token_uri)
        const domain_id = {
            vname: 'domain_id',
            type: 'ByStr32',
            value:
                addrName === 'lexicassi'
                    ? '0x06d8d4ab79634161034b58683dafca79f6a8efab6c66b9f90553fec4b8365c67'
                    : domainName,
        }
        params.push(domain_id)
        const amount_ = {
            vname: 'amount',
            type: 'Uint128',
            value: amount,
        }
        params.push(amount_)
        const donation_ = await tyron.Donation.default.tyron(donation!)
        const tyron_ = {
            vname: 'tyron',
            type: 'Option Uint128',
            value: donation_,
        }
        params.push(tyron_)

        let amount_call = Number(donation)
        if (
            (addrName === '.gzil' || addrName === '.zlp') &&
            buyInfo?.currency?.toLowerCase() === 'zil'
        ) {
            const zil_amount = Number(donation) + 400
            if (zil_amount > buyInfo?.currentBalance) {
                amount_call = zil_amount - buyInfo?.currentBalance
            } else {
                amount_call = 0
            }
        }

        setLoadingSubmit(false)
        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        await zilpay
            .call({
                contractAddress: resolvedInfo?.addr!,
                transition: 'ZRC6_Mint',
                params: params as unknown as Record<string, unknown>[],
                amount: String(amount_call),
            })
            .then(async (res) => {
                dispatch(setTxId(res.ID))
                dispatch(setTxStatusLoading('submitted'))
                tx = await tx.confirm(res.ID, 33)
                if (tx.isConfirmed()) {
                    dispatch(setTxStatusLoading('confirmed'))
                    setTimeout(() => {
                        window.open(
                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                        )
                    }, 1000)
                    if (addrName === '.gzil' || addrName === '.zlp') {
                        notifyBot(domainInput.toLowerCase())
                    }
                } else if (tx.isRejected()) {
                    dispatch(setTxStatusLoading('failed'))
                }
            })
            .catch((err) => {
                dispatch(setTxStatusLoading('rejected'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                throw err
            })
    }

    const optionRecipient = [
        {
            value: 'SSI',
            label: t('This SSI'),
        },
        {
            value: 'ADDR',
            label: 'Another wallet',
        },
    ]

    const optionTypeOtherAddr = [
        {
            value: 'address',
            label: t('Address'),
        },
        {
            value: 'nft',
            label: 'NFT Domain Name',
        },
    ]

    const optionPayment_ = [
        ...optionPayment,
        {
            value: 'FREE',
            label: '$ZLP 0',
        },
    ]

    if (addrName === 'lexicassi') {
        return (
            <>
                {selectedNft === '' && (
                    <>
                        <div style={{ marginTop: '17px' }}>
                            <Selector
                                option={optionRecipient}
                                onChange={onChangeRecipient}
                                placeholder="Recipient" //{t('SELECT_RECIPIENT')}
                                defaultValue={
                                    recipient === '' ? undefined : recipient
                                }
                            />
                        </div>
                        {recipient === 'ADDR' && (
                            <>
                                <div
                                    style={{
                                        marginTop: '10%',
                                        marginBottom: '10%',
                                    }}
                                >
                                    <Selector
                                        option={optionTypeOtherAddr}
                                        onChange={onChangeTypeOther}
                                        placeholder="Address type"
                                    />
                                </div>
                                {otherRecipient !== '' && (
                                    <h6 className={styles.txt}>recipient</h6>
                                )}
                                {otherRecipient === 'address' ? (
                                    <div
                                        style={{
                                            marginTop: '17px',
                                        }}
                                    >
                                        <div className={styles.containerInput}>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder={t('Address')}
                                                onChange={handleInputAdddr}
                                                onKeyPress={
                                                    handleOnKeyPressAddr
                                                }
                                            />
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <div onClick={saveAddr}>
                                                    {!savedAddr ? (
                                                        <Arrow />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    '5px',
                                                            }}
                                                        >
                                                            <Image
                                                                width={40}
                                                                src={TickIco}
                                                                alt="tick"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : otherRecipient === 'nft' ? (
                                    <SearchBarWallet
                                        resolveUsername={resolveUsername}
                                        handleInput={handleInput}
                                        input={usernameInput}
                                        loading={loading}
                                        saved={savedAddr}
                                    />
                                ) : (
                                    <></>
                                )}
                            </>
                        )}
                    </>
                )}
                {(recipient === 'ADDR' && savedAddr) || recipient === 'SSI' ? (
                    <div>
                        {selectedNft === '' && (
                            <>
                                <div
                                    style={{
                                        marginTop: '17px',
                                    }}
                                >
                                    <div className={styles.txt}>
                                        <a
                                            href="https://lexica.art/"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            lexica.art
                                        </a>
                                    </div>
                                    <div className={styles.containerInput}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="Search for an image"
                                            onChange={handleInputLexica}
                                            onKeyPress={handleOnKeyPressLexica}
                                        />
                                        {nftLoading ? (
                                            <Spinner />
                                        ) : (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <div onClick={searchLexica}>
                                                    <Arrow />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {nftList.length > 0 && (
                                        <>
                                            {nftList.map((val: any, i) => (
                                                <div
                                                    className={
                                                        styles.wrapperNftOption
                                                    }
                                                    key={i}
                                                >
                                                    {val.id === selectedNft ? (
                                                        <div
                                                            onClick={() =>
                                                                toggleSelectNft(
                                                                    val.id
                                                                )
                                                            }
                                                            className={
                                                                styles.optionIco
                                                            }
                                                        >
                                                            <Image
                                                                src={
                                                                    selectedCheckmark
                                                                }
                                                                alt="arrow"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.optionIco
                                                            }
                                                            onClick={() =>
                                                                toggleSelectNft(
                                                                    val.id
                                                                )
                                                            }
                                                        >
                                                            <Image
                                                                src={
                                                                    defaultCheckmark
                                                                }
                                                                alt="arrow"
                                                            />
                                                        </div>
                                                    )}
                                                    {dataModalImg ===
                                                        val.src && (
                                                        <ModalImg
                                                            showModalImg={
                                                                showModalImg
                                                            }
                                                            setShowModalImg={
                                                                setShowModalImg
                                                            }
                                                            dataModalImg={
                                                                dataModalImg
                                                            }
                                                            setDataModalImg={
                                                                setDataModalImg
                                                            }
                                                        />
                                                    )}
                                                    <img
                                                        onClick={() =>
                                                            toggleSelectNft(
                                                                val.id
                                                            )
                                                        }
                                                        style={{
                                                            cursor: 'pointer',
                                                        }}
                                                        width={200}
                                                        src={val.srcSmall}
                                                        alt="lexica-img"
                                                    />
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                setDataModalImg(
                                                                    val.src
                                                                )
                                                                setShowModalImg(
                                                                    true
                                                                )
                                                            }}
                                                            style={{
                                                                marginLeft:
                                                                    '5px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <Image
                                                                alt="arrow-ico"
                                                                src={AddIcon}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                        {selectedNft !== '' && (
                            <>
                                <div
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <div
                                        onClick={() => {
                                            updateDonation(null)
                                            setSelectedNft('')
                                        }}
                                        className="button small"
                                    >
                                        BACK
                                    </div>
                                </div>
                                <Donate />
                                {donation !== null && (
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <div
                                            onClick={handleSubmit}
                                            className={
                                                isLight
                                                    ? 'actionBtnLight'
                                                    : 'actionBtn'
                                            }
                                        >
                                            {loadingSubmit ? (
                                                <ThreeDots color="black" />
                                            ) : (
                                                'MINT'
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <></>
                )}
            </>
        )
    } else {
        return (
            <>
                <div style={{ marginTop: '7%' }}>
                    <Selector
                        option={optionRecipient}
                        onChange={onChangeRecipient}
                        placeholder="Recipient" //{t('SELECT_RECIPIENT')}
                        defaultValue={recipient === '' ? undefined : recipient}
                    />
                </div>
                {recipient === 'ADDR' && (
                    <>
                        <div
                            style={{
                                marginTop: '10%',
                                marginBottom: '10%',
                            }}
                        >
                            <Selector
                                option={optionTypeOtherAddr}
                                onChange={onChangeTypeOther}
                                placeholder="Address type"
                            />
                        </div>
                        {otherRecipient !== '' && (
                            <h6 className={styles.txt}>recipient</h6>
                        )}
                        {otherRecipient === 'address' ? (
                            <div
                                style={{
                                    marginTop: '17px',
                                }}
                            >
                                <div className={styles.containerInput}>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder={t('Type address')}
                                        onChange={handleInputAdddr}
                                        onKeyPress={handleOnKeyPressAddr}
                                    />
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div onClick={saveAddr}>
                                            {!savedAddr ? (
                                                <Arrow />
                                            ) : (
                                                <div
                                                    style={{
                                                        marginTop: '5px',
                                                    }}
                                                >
                                                    <Image
                                                        width={40}
                                                        src={TickIco}
                                                        alt="tick"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : otherRecipient === 'nft' ? (
                            <SearchBarWallet
                                resolveUsername={resolveUsername}
                                handleInput={handleInput}
                                input={usernameInput}
                                loading={loading}
                                saved={savedAddr}
                            />
                        ) : (
                            <></>
                        )}
                    </>
                )}
                {/* </>
                )} */}
                {(recipient === 'ADDR' && savedAddr) || recipient === 'SSI' ? (
                    <div>
                        <div
                            style={{ marginBottom: '4%', marginTop: '7%' }}
                            className={styles.txt}
                        >
                            Search for a {addrName} domain name:
                        </div>
                        <SearchBarWallet
                            resolveUsername={() =>
                                resolveUsername('new_domain')
                            }
                            handleInput={handleDomainInput}
                            input={domainInput}
                            loading={loadingGzil}
                            saved={savedDns}
                        />
                        {savedDns && (
                            <>
                                <h6 style={{ marginTop: '40px' }}>
                                    {t('SELECT_PAYMENT')}
                                </h6>
                                <Selector
                                    option={optionPayment_}
                                    onChange={handleOnChangePayment}
                                    loading={loadingPayment || loadingBalance}
                                    placeholder="Minting fee" //{t('SELECT_PAYMENT')} @todo-t
                                    defaultValue={
                                        buyInfo?.currency === undefined
                                            ? undefined
                                            : buyInfo?.currency
                                    }
                                />
                                {buyInfo?.currency !== undefined &&
                                    !loadingBalance &&
                                    !loadingPayment && (
                                        <>
                                            {buyInfo?.isEnough ? (
                                                <>
                                                    <Donate />
                                                    {donation !== null && (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            <div
                                                                onClick={
                                                                    handleSubmit
                                                                }
                                                                className={
                                                                    isLight
                                                                        ? 'actionBtnLight'
                                                                        : 'actionBtn'
                                                                }
                                                            >
                                                                {loadingSubmit ? (
                                                                    <ThreeDots color="black" />
                                                                ) : (
                                                                    'MINT'
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        style={{
                                                            color: 'red',
                                                            marginTop: '7%',
                                                            marginBottom: '4%',
                                                        }}
                                                    >
                                                        Not enough balance to
                                                        mint a {addrName} NFT
                                                    </div>
                                                    <div
                                                        style={{
                                                            width: '90%',
                                                        }}
                                                    >
                                                        <AddFunds
                                                            type="buy"
                                                            token={
                                                                buyInfo?.currency
                                                            }
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                            </>
                        )}
                    </div>
                ) : (
                    <></>
                )}
            </>
        )
    }
}

export default Component
