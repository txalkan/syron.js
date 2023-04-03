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
import CloseIcoReg from '../../../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../../../src/assets/icons/ic_cross_black.svg'
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
import {
    isValidUsernameInBatch,
    optionPayment,
} from '../../../../../../../src/constants/mintDomainName'
import { $buyInfo, updateBuyInfo } from '../../../../../../../src/store/buyInfo'
import { sendTelegramNotification } from '../../../../../../../src/telegram'

function Component({ addrName }) {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { getSmartContract } = smartContract()
    const { fetchLexica, fetchWalletBalance } = fetch_.default()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const AddIcon = isLight ? AddIconBlack : AddIconReg
    const styles = isLight ? stylesLight : stylesDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const selectedCheckmark = isLight
        ? selectedCheckmarkLight
        : selectedCheckmarkDark
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [recipient, setRecipient] = useState('')
    const [otherRecipient, setOtherRecipient] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')
    const [nftInput, setNftInput] = useState('')
    const [nftLoading, setNftLoading] = useState(false)
    const [nftList, setNftList] = useState([])
    const [selectedNft, setSelectedNft] = useState([])
    const [showModalImg, setShowModalImg] = useState(false)
    const [dataModalImg, setDataModalImg] = useState('')
    const [savedSelect, setSavedSelect] = useState(false)

    const handleInputAdddr = (event: { target: { value: any } }) => {
        setSavedAddr(false)
        setAddr(event.target.value)
    }

    const handleInputLexica = (event: { target: { value: any } }) => {
        setSelectedNft([])
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
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
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
        setAddr('')
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

    const resolveUsername = async () => {
        setLoading(true)
        const input = usernameInput.replace(/ /g, '')
        let username = input.toLowerCase()
        let domain = ''
        if (input.includes('@')) {
            username = input
                .split('@')[1]
                .replace('.did', '')
                .replace('.ssi', '')
                .toLowerCase()
            domain = input.split('@')[0]
        } else if (input.includes('.')) {
            if (input.split('.')[1] === 'did') {
                username = input.split('.')[0].toLowerCase()
                domain = 'did'
            } else if (input.split('.')[1] === 'ssi') {
                username = input.split('.')[0].toLowerCase()
            } else {
                throw Error()
            }
        }
        const domainId = '0x' + (await tyron.Util.default.HashString(username))
        await tyron.SearchBarUtil.default
            .fetchAddr(net, domainId, domain)
            .then(async (addr) => {
                addr = zcrypto.toChecksumAddress(addr)
                setAddr(addr)
                setSavedAddr(true)
            })
            .catch(() => {
                toast.error('Address not found.', {
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
            })
        setLoading(false)
    }

    const checkIsSelectedNft = (id) => {
        if (selectedNft.some((val) => val === id)) {
            return true
        } else {
            return false
        }
    }

    const [reRender, setReRender] = useState(true)
    const selectNft = (id: string) => {
        if (!checkIsSelectedNft(id)) {
            let arr: any = selectedNft
            arr.push(id)
            setSelectedNft(arr)
            setReRender(false)
            setTimeout(() => {
                setReRender(true)
            }, 10)
        } else {
            let arr = selectedNft.filter((arr) => arr !== id)
            setSelectedNft(arr)
        }
    }

    const notifyBot = async (domains) => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: `tyron.network ${net}\n\n.gzil NFT domains minted:\n${domains}`,
        }
        await sendTelegramNotification(request.body)
    }

    const handleSubmit = async () => {
        setLoadingSubmit(true)
        let amount: any = '0'
        if (addrName !== '.gzil') {
            try {
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
                const serviceAddr = services.get('lexicassi')
                const get_premiumprice = await getSmartContract(
                    serviceAddr,
                    'premium_price'
                )
                const premium_price = await tyron.SmartUtil.default.intoMap(
                    get_premiumprice.result.premium_price
                )
                amount = premium_price
            } catch {
                amount = '0'
            }
        }
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
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
            value: addrName == '.gzil' ? buyInfo?.currency?.toLowerCase() : '',
        }
        params.push(id_)
        const to_token_uri_pair_list: any[] = []
        const addr_ = resolvedInfo?.addr //recipient === 'SSI' ? resolvedInfo?.addr : addr
        if (addrName === 'lexicassi') {
            for (let i = 0; i < selectedNft.length; i += 1) {
                to_token_uri_pair_list.push({
                    argtypes: ['ByStr20', 'String'],
                    arguments: [`${addr_}`, `${selectedNft[i]}`],
                    constructor: 'Pair',
                })
            }
        } else {
            for (let i = 0; i < inputArray.length; i += 1) {
                to_token_uri_pair_list.push({
                    argtypes: ['ByStr20', 'String'],
                    arguments: [`${addr_}`, `${inputArray[i]}`],
                    constructor: 'Pair',
                })
            }
        }
        const to_token_uri_pair_list_ = {
            vname: 'to_token_uri_pair_list',
            type: 'List( Pair ByStr20 String )',
            value: to_token_uri_pair_list,
        }
        params.push(to_token_uri_pair_list_)
        const amount_ = {
            vname: 'amount',
            type: 'Uint128',
            value: `${parseInt(amount) * selectedNft.length}`,
        }
        params.push(amount_)
        const donation_ = await tyron.Donation.default.tyron(donation!)
        const tyron_ = {
            vname: 'tyron',
            type: 'Option Uint128',
            value: donation_,
        }
        params.push(tyron_)
        let amountCall: any = donation
        if (
            addrName == '.gzil' &&
            buyInfo?.currency?.toLowerCase() === 'zil' &&
            buyInfo?.currentBalance < 400 // @todo read fee from blockchain
        ) {
            amountCall = String(
                Number(amountCall) +
                    400 * inputArray.length -
                    buyInfo?.currentBalance
            )
        }
        setLoadingSubmit(false)
        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        await zilpay
            .call({
                contractAddress: resolvedInfo?.addr!,
                transition: 'ZRC6_BatchMint',
                params: params as unknown as Record<string, unknown>[],
                amount: String(amountCall),
            })
            .then(async (res) => {
                dispatch(setTxId(res.ID))
                dispatch(setTxStatusLoading('submitted'))
                tx = await tx.confirm(res.ID)
                if (tx.isConfirmed()) {
                    dispatch(setTxStatusLoading('confirmed'))
                    setTimeout(() => {
                        window.open(
                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                        )
                    }, 1000)
                    if (addrName === '.gzil') {
                        notifyBot(inputArray)
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
            label: 'Another Wallet',
        },
    ]

    const optionTypeOtherAddr = [
        {
            value: 'address',
            label: 'Address',
        },
        {
            value: 'nft',
            label: 'NFT Domain Name',
        },
    ]

    const [inputAmount, setInputAmount] = useState(0) // the amount of domains
    const input_ = Array(inputAmount)
    const select_input = Array()
    for (let i = 0; i < input_.length; i += 1) {
        select_input[i] = i
    }
    const [inputArray, setInputArray] = useState([])
    const domains: string[] = inputArray

    const handleInputAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputAmount(0)
        setInputArray([])
        let _input = event.target.value
        const re = /,/gi
        _input = _input.replace(re, '.')
        const input = Number(_input)
        let minimumInput = 2
        if (!isNaN(input) && Number.isInteger(input) && input >= minimumInput) {
            setInputAmount(input)
        } else if (isNaN(input)) {
            toast.error('The input is not a number.', {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 3,
            })
        } else if (!Number.isInteger(input)) {
            toast.error('The number of domains must be an integer.', {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 4,
            })
        } else if (input < 2) {
            toast.error(
                'The number of domains must be at least two, or use the MINT transaction instead.',
                {
                    position: 'top-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 5,
                }
            )
        }
    }

    const [loadingGzil, setLoadingGzil] = useState(false)
    const [legend, setLegend] = useState('continue')
    // const [domainName, setDomainName] = useState('')
    // const [domainInput, setDomainInput] = useState('')

    // const handleDomainInput = ({
    //     currentTarget: { value },
    // }: React.ChangeEvent<HTMLInputElement>) => {
    //     updateDonation(null)
    //     updateBuyInfo(null)
    //     setSavedGzil(false)
    //     setDomainName('')
    //     setDomainInput(value)
    // }

    const HandleSaveDomains = async () => {
        try {
            let input = ''
            setLoadingGzil(true)
            if (domains.length === input_.length) {
                var arr = domains.map((v) => v.toLowerCase())
                const duplicated = new Set(arr).size !== arr.length
                if (duplicated) {
                    toast.error(
                        'NFT domains must be unique, so you cannot submit repeated domain names.',
                        {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 4,
                        }
                    )
                } else {
                    let available_domains: string[] = []
                    for (let i = 0; i < domains.length; i++) {
                        if (isValidUsernameInBatch(domains[i])) {
                            input = domains[i].replace(/ /g, '').toLowerCase()
                            // input = input.replace('.gzil', '')
                            const domainId =
                                '0x' +
                                (await tyron.Util.default.HashString(input))
                            const init_addr =
                                await tyron.SearchBarUtil.default.fetchAddr(
                                    net,
                                    'init',
                                    'did'
                                )
                            const get_services = await getSmartContract(
                                init_addr,
                                'services'
                            )
                            const services =
                                await tyron.SmartUtil.default.intoMap(
                                    get_services.result.services
                                )
                            const serviceAddr = services.get('.gzil')
                            const get_state = await getSmartContract(
                                serviceAddr,
                                'nft_dns'
                            )
                            const state = await tyron.SmartUtil.default.intoMap(
                                get_state.result.nft_dns
                            )
                            if (state.get(domainId)) {
                                console.log(
                                    'Domain Taken. Token ID:',
                                    state.get(domainId)
                                )
                                toast.error(
                                    `${domains[i]} is already registered.`,
                                    {
                                        position: 'top-right',
                                        autoClose: 4000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: toastTheme(isLight),
                                        toastId: 6,
                                    }
                                )
                            } else {
                                console.log('Domain name:', domains[i])
                                console.log('Domain hash:', domainId)
                                available_domains.push(input)
                            }
                        } else {
                            if (domains[i] !== '') {
                                if (
                                    domains[i].toLowerCase().includes('.gzil')
                                ) {
                                    toast.warn(
                                        'Type the domain name without .gzil at the end.',
                                        {
                                            position: 'bottom-right',
                                            autoClose: 4000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: toastTheme(isLight),
                                            toastId: 7,
                                        }
                                    )
                                } else {
                                    toast('Available in the future.', {
                                        position: 'top-right',
                                        autoClose: 4000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: toastTheme(isLight),
                                        toastId: 8,
                                    })
                                }
                            }
                        }
                    }
                    if (available_domains.length === domains.length) {
                        setLegend('saved')
                    }
                }
            } else {
                toast.error(t('The input is incomplete.'), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 9,
                })
            }
            setLoadingGzil(false)
        } catch (error) {
            setLoadingGzil(false)
        }
    }

    const buyInfo = useStore($buyInfo)
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [loadingBalance, setLoadingBalance] = useState(false)

    const loginInfo = useSelector((state: RootState) => state.modal)

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
                                        'init',
                                        'did'
                                    )
                                const get_state = await getSmartContract(
                                    init_addr,
                                    'utility'
                                )
                                const field = Object.entries(
                                    get_state.result.utility
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
                                                price =
                                                    Number(price.toFixed(2)) *
                                                    inputArray.length
                                            }
                                        }
                                    }
                                }
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
                                            position: 'bottom-right',
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
                                position: 'bottom-right',
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
                paymentOptions(id)
            } catch (error) {
                updateBuyInfo({
                    recipientOpt: buyInfo?.recipientOpt,
                    anotherAddr: buyInfo?.anotherAddr,
                    currency: undefined,
                    currentBalance: undefined,
                    isEnough: undefined,
                })
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 4000,
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
    if (addrName === 'lexicassi') {
        return (
            <>
                {!savedSelect && (
                    <>
                        <div style={{ marginTop: '16px' }}>
                            <Selector
                                option={optionRecipient}
                                onChange={onChangeRecipient}
                                placeholder="Recipient" //@todo-t{t('Choose address')}
                                defaultValue={
                                    recipient === '' ? undefined : recipient
                                }
                            />
                        </div>
                        {recipient === 'ADDR' && (
                            <>
                                <div
                                    style={{
                                        marginTop: '16px',
                                    }}
                                >
                                    <Selector
                                        option={optionTypeOtherAddr}
                                        onChange={onChangeTypeOther}
                                        placeholder="Select Type"
                                    />
                                </div>
                                {otherRecipient === 'address' ? (
                                    <div
                                        style={{
                                            marginTop: '16px',
                                        }}
                                    >
                                        <div className={styles.txt}>
                                            Input Address
                                        </div>
                                        <div className={styles.containerInput}>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder={t('Type address')}
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
                        {!savedSelect && (
                            <>
                                <div
                                    style={{
                                        marginTop: '16px',
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
                                                    <div
                                                        onClick={() =>
                                                            selectNft(val.id)
                                                        }
                                                        className={
                                                            styles.optionIco
                                                        }
                                                    >
                                                        <Image
                                                            src={
                                                                checkIsSelectedNft(
                                                                    val.id
                                                                )
                                                                    ? selectedCheckmark
                                                                    : defaultCheckmark
                                                            }
                                                            alt="arrow"
                                                        />
                                                    </div>
                                                    <img
                                                        onClick={() =>
                                                            selectNft(val.id)
                                                        }
                                                        style={{
                                                            cursor: 'pointer',
                                                        }}
                                                        width={200}
                                                        src={val.srcSmall}
                                                        alt="lexica-img"
                                                    />
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
                                {selectedNft.length > 0 && (
                                    <div
                                        onClick={() => setSavedSelect(true)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            marginTop: '5rem',
                                        }}
                                    >
                                        <div
                                            className={
                                                isLight
                                                    ? 'actionBtnLight'
                                                    : 'actionBtn'
                                            }
                                        >
                                            SAVE
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {savedSelect && (
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
                                            setSavedSelect(false)
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
                                                'BATCH MINT'
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
                {reRender && <div />}
            </>
        )
    } else {
        return (
            <>
                <div className={styles.container2}>
                    <div>How many domains would you like to mint?</div>
                    <input
                        className={styles.inputAmount}
                        type="text"
                        placeholder={t('Type amount')}
                        onChange={handleInputAmount}
                    />
                </div>
                {inputAmount >= 2 &&
                    select_input.map((res: any) => {
                        return (
                            <section key={res} className={styles.container2}>
                                <code style={{ width: '50%' }}>#{res + 1}</code>
                                <input
                                    className={styles.inputText}
                                    type="text"
                                    placeholder={t('DOMAIN')}
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        setLegend('continue')
                                        domains[res] =
                                            event.target.value.toLowerCase()
                                    }}
                                />
                                <code>.gzil</code>
                            </section>
                            // <section key={res} className={styles.container}>
                            //     <SearchBarWallet
                            //         resolveUsername={IsNewDomain}
                            //         handleInput={handleDomainInput}
                            //         input={domainInput}
                            //         loading={loadingGzil}
                            //         saved={savedGzil}
                            //     />
                            // </section>
                        )
                    })}
                {inputAmount >= 2 && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '7%',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <div
                            onClick={() => {
                                HandleSaveDomains()
                            }}
                        >
                            {loadingGzil ? (
                                <Spinner />
                            ) : (
                                <>
                                    {legend.toUpperCase() === 'CONTINUE' ? (
                                        <Arrow width={50} height={50} />
                                    ) : (
                                        <div style={{ marginTop: '5px' }}>
                                            <Image
                                                width={50}
                                                src={TickIco}
                                                alt="tick"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
                {legend === 'saved' && (
                    <>
                        <h5>The minting fee is per domain</h5>
                        <Selector
                            option={optionPayment}
                            onChange={handleOnChangePayment}
                            loading={loadingPayment || loadingBalance}
                            placeholder={t('SELECT_PAYMENT')}
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
                                    ) : (
                                        <>
                                            <div
                                                style={{
                                                    color: 'red',
                                                    marginTop: '7%',
                                                    marginBottom: '4%',
                                                }}
                                            >
                                                Your DIDx wallet does not have
                                                enough funds.
                                            </div>
                                            <div
                                                style={{
                                                    width: '90%',
                                                }}
                                            >
                                                <AddFunds
                                                    type="buy"
                                                    coin={buyInfo?.currency}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                    </>
                )}
            </>
        )
    }
}

export default Component
