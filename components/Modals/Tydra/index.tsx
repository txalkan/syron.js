import { useStore } from 'effector-react'
import {
    $investorItems,
    $modalInvestor,
    $modalTydra,
    updateInvestorModal,
    updateModalTx,
    updateModalTxMinimized,
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

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { navigate } = routerHook()
    const { checkVersion } = fetch()
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const modalTydra = useStore($modalTydra)
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const version = checkVersion(resolvedInfo?.version)

    const [currency, setCurrency] = useState('')
    const [tydra, setTydra] = useState('')
    const [txName, setTxName] = useState('')
    const [saveResult, setRes] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isEnough, setIsEnough] = useState(true)
    const [loading, setLoading] = useState(false)
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''

    const handleOnChange = (value) => {
        updateDonation(null)
        setTydra('')
        setSavedAddr(false)
        setAddr('')
        setCurrency(value)
    }

    const handleOnChangeTydra = (value) => {
        updateDonation(null)
        setAddr('')
        setSavedAddr(false)
        setTydra(value)
    }

    const submitAr = async () => {
        setIsLoading(true)
        try {
            toast.info(
                `You're about to save the Tydra GIF permanently on Arweave.`,
                {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 0,
                }
            )
            const data = {
                name: 'Nawelito ON FIRE',
                net: 'tyron.network',
                first_owner: loginInfo?.arAddr,
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
                    position: 'top-center',
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
            console.log(err)
        }
        setIsLoading(false)
    }

    const fetchZilBalance = async (id: string) => {
        let token_addr: string
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
                token_addr = services.get(id)
                const balances = await getSmartContract(token_addr, 'balances')
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )

                let res = 0
                try {
                    const balance_zilpay = balances_.get(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (balance_zilpay !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance = balance_zilpay / _currency.decimals
                        res = Number(finalBalance.toFixed(2))
                    }
                } catch (error) {
                    res = 0
                }
                return res
            } else {
                const zilpay = new ZilPayBase().zilpay
                const zilPay = await zilpay()
                const blockchain = zilPay.blockchain
                const zilliqa_balance = await blockchain.getBalance(
                    loginInfo.zilAddr.base16.toLowerCase()
                )
                const zilliqa_balance_ =
                    Number(zilliqa_balance.result!.balance) / 1e12

                let res = Number(zilliqa_balance_.toFixed(2))
                return res
            }
        } catch (error) {
            let res = 0
            return res
        }
    }

    const handleSubmitSend = async () => {
        setIsEnough(true)
        setIsLoading(true)
        let freeList = false
        const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
            net,
            'init',
            'did'
        )
        let params: any = []
        let contract = init_addr
        let currency_ = 'zil'
        let price = 1000
        if (version >= 6) {
            currency_ = currency
            contract = resolvedInfo?.addr!
            const donation_ = await tyron.Donation.default.tyron(donation!)
            const tyron_ = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: donation_,
            }
            params.push(tyron_)
        }
        switch (currency_.toLowerCase()) {
            case 'tyron':
                price = 30
                break
            case '$si':
                price = 30
                break
            case 'zusdt':
                price = 30
                break
            case 'xsgd':
                price = 40
                break
            case 'xidr':
                price = 150000
                break
        }
        const balance = await fetchZilBalance(currency_.toLowerCase())
        if (price > balance) {
            setIsLoading(false)
            setIsEnough(false)
            toast.error(
                `Insufficient balance, the cost is ${price} ${currency_}`,
                {
                    position: 'top-center',
                    autoClose: 3000,
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
            try {
                const get_free_list = await getSmartContract(
                    init_addr,
                    'tydra_free_list'
                )
                const freelist: Array<string> =
                    get_free_list.result.tydra_free_list
                const is_free = freelist.filter(
                    (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                )
                if (is_free.length !== 0) {
                    freeList = true
                }
            } catch {
                freeList = false
            }
            const zilpay = new ZilPayBase()
            let tx = await tyron.Init.default.transaction(net)
            const domainId =
                '0x' +
                (await tyron.Util.default.HashString(resolvedInfo?.name!))
            const id = {
                vname: 'id',
                type: 'String',
                value: freeList ? 'free' : currency_.toLowerCase(),
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
                    contractAddress: contract,
                    transition: 'MintTydraNft',
                    params: params as unknown as Record<string, unknown>[],
                    amount: String(freeList ? 0 : price),
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    tx = await tx.confirm(res.ID)
                    if (tx.isConfirmed()) {
                        setIsLoading(false)
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        }, 1000)
                        updateTydraModal(false)
                        navigate(`/${domainNavigate}${username}/didx`)
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
        }
    }

    const handleSubmitTransfer = async () => {
        setIsLoading(true)
        let freeList = false
        const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
            net,
            'init',
            'did'
        )
        let params: any = []
        let contract = init_addr
        let currency_ = 'zil'
        let price = 500
        if (version >= 6) {
            price = 1000
            currency_ = currency.toLowerCase()
            contract = resolvedInfo?.addr!
            const donation_ = await tyron.Donation.default.tyron(donation!)
            const tyron_ = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: donation_,
            }
            params.push(tyron_)
        }
        switch (currency_.toLowerCase()) {
            case 'tyron':
                price = 30
                break
            case '$si':
                price = 30
                break
            case 'zusdt':
                price = 30
                break
            case 'xsgd':
                price = 40
                break
            case 'xidr':
                price = 150000
                break
        }
        const balance = await fetchZilBalance(currency_.toLowerCase())
        if (price > balance) {
            setIsLoading(false)
            setIsEnough(false)
            toast.error(
                `Insufficient balance, the cost is ${price} ${currency_}`,
                {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 3,
                }
            )
        } else {
            try {
                const get_free_list = await getSmartContract(
                    init_addr,
                    'tydra_free_list'
                )
                const freelist: Array<string> =
                    get_free_list.result.tydra_free_list
                const is_free = freelist.filter(
                    (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                )
                if (is_free.length !== 0) {
                    freeList = true
                }
            } catch {
                freeList = false
            }
            const zilpay = new ZilPayBase()
            let tx = await tyron.Init.default.transaction(net)
            const domainId =
                '0x' +
                (await tyron.Util.default.HashString(resolvedInfo?.name!))
            const domainIdTo =
                '0x' + (await tyron.Util.default.HashString(addr!))
            const id = {
                vname: 'id',
                type: 'String',
                value: freeList ? 'free' : currency_.toLowerCase(),
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

            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            await zilpay
                .call({
                    contractAddress: contract,
                    transition: 'TransferTydraNft',
                    params: params as unknown as Record<string, unknown>[],
                    amount: String(freeList ? 0 : price),
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    tx = await tx.confirm(res.ID)
                    if (tx.isConfirmed()) {
                        setIsLoading(false)
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        }, 1000)
                        updateTydraModal(false)
                        navigate(`/${domainNavigate}${username}/didx`)
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
        }
    }

    const toggleActive = (id: string) => {
        updateDonation(null)
        // resetState()
        setCurrency('')
        setRes('')
        if (id === txName) {
            setTxName('')
        } else {
            setTxName(id)
        }
    }

    const outerClose = () => {
        if (window.confirm('Are you sure about closing this window?')) {
            updateDonation(null)
            setCurrency('')
            setRes('')
            updateTydraModal(false)
        }
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
                toast.error('Identity verification unsuccessful.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
            })
        setLoading(false)
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        setSavedAddr(false)
        setAddr('')
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

    const optionCurrency = [
        {
            key: 'TYRON',
            name: 'TYRON',
        },
        {
            key: '$SI',
            name: '$SI',
        },
        {
            key: 'ZIL',
            name: 'ZIL',
        },
        {
            key: 'zUSDT',
            name: 'zUSDT',
        },
        {
            key: 'XSGD',
            name: 'XSGD',
        },
        {
            key: 'XIDR',
            name: 'XIDR',
        },
    ]

    const optionCurrencyTransfer = [
        {
            key: 'FREE',
            name: 'FREE',
        },
        ...optionCurrency,
    ]

    const optionTydra = [
        {
            key: 'nawelito',
            name: 'Nawelito',
        },
    ]

    if (!modalTydra) {
        return null
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
                        <h5 className={styles.headerTxt}>
                            TYDRA NON-FUNGIBLE TOKENS
                        </h5>
                    </div>
                    <div className={styles.cardWrapper}>
                        <div
                            onClick={() => toggleActive('deploy')}
                            className={
                                txName === 'deploy'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>MINT NFT</div>
                            {/* @todo-i when clicking on MINT NFT arConnect is mandatory but arConnect is not needed to TRANSFER NFT*/}
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
                                    {saveResult === '' ? (
                                        <div>
                                            {version >= 6 && (
                                                <div className={styles.select}>
                                                    <Selector
                                                        option={optionCurrency}
                                                        onChange={
                                                            handleOnChange
                                                        }
                                                        placeholder={t(
                                                            'Select coin'
                                                        )}
                                                    />
                                                </div>
                                            )}
                                            {currency !== '' || version < 6 ? (
                                                <div
                                                    className={
                                                        styles.btnWrapper
                                                    }
                                                >
                                                    <div
                                                        onClick={submitAr}
                                                        className={
                                                            isLight
                                                                ? 'actionBtnLight'
                                                                : 'actionBtn'
                                                        }
                                                    >
                                                        {isLoading ? (
                                                            <ThreeDots color="basic" />
                                                        ) : (
                                                            'SAVE TYDRA'
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {version >= 6 && <Donate />}
                                            {renderSend() && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.btnWrapper
                                                        }
                                                    >
                                                        <div
                                                            onClick={
                                                                handleSubmitSend
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
                                                                'MINT TYDRA' //@todo-l
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.cardWrapper}>
                        <div
                            onClick={() => toggleActive('transferTydra')}
                            className={
                                txName === 'transferTydra'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>TRANSFER NFT</div>
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
                                    <div className={styles.picker}>
                                        <Selector
                                            option={optionCurrencyTransfer}
                                            onChange={handleOnChange}
                                            placeholder={t('Select coin')}
                                        />
                                    </div>
                                    {currency !== '' && (
                                        <>
                                            <div className={styles.picker}>
                                                <Selector
                                                    option={optionTydra}
                                                    onChange={
                                                        handleOnChangeTydra
                                                    }
                                                    placeholder={t(
                                                        'Select Tydra'
                                                    )}
                                                />
                                            </div>
                                            {tydra !== '' && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.picker
                                                        }
                                                    >
                                                        <SearchBarWallet
                                                            resolveUsername={
                                                                resolveUsername
                                                            }
                                                            handleInput={
                                                                handleInput
                                                            }
                                                            input={
                                                                usernameInput
                                                            }
                                                            loading={loading}
                                                            saved={savedAddr}
                                                        />
                                                    </div>
                                                    {savedAddr && (
                                                        <>
                                                            {version >= 6 && (
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
