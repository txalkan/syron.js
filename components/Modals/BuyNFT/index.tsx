import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import * as tyron from 'tyron'
import {
    setTxId,
    setTxStatusLoading,
    updateLoginInfoUsername,
    updateLoginInfoZilpay,
} from '../../../src/app/actions'
import { RootState } from '../../../src/app/reducers'
import CloseIconReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIconBlack from '../../../src/assets/icons/ic_cross_black.svg'
import InfoDefaultReg from '../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../src/assets/icons/info_default_black.svg'
import InfoIconReg from '../../../src/assets/icons/warning.svg'
import InfoIconPurple from '../../../src/assets/icons/warning_purple.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import {
    $resolvedInfo,
    updateResolvedInfo,
} from '../../../src/store/resolvedInfo'
import {
    updateModalTx,
    updateModalDashboard,
    updateShowZilpay,
    updateModalTxMinimized,
} from '../../../src/store/modal'
import { useStore as effectorStore } from 'effector-react'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
// @review import { updateTxList } from '../../../src/store/transactions'
import { $donation, updateDonation } from '../../../src/store/donation'
import { $buyInfo, updateBuyInfo } from '../../../src/store/buyInfo'
import {
    $modalBuyNft,
    updateModalBuyNft,
    $txType, //@info: we need this when user adding funds from buy nft modal then minimizing the tx modal
} from '../../../src/store/modal'
import { AddFunds, Arrow, Donate, Selector, Spinner } from '../..'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../src/utils/smartContract'
import TickIcoReg from '../../../src/assets/icons/tick.svg'
import TickIcoPurple from '../../../src/assets/icons/tick_purple.svg'
import toastTheme from '../../../src/hooks/toastTheme'
import ThreeDots from '../../Spinner/ThreeDots'
import { updateOriginatorAddress } from '../../../src/store/originatorAddress'
import { sendTelegramNotification } from '../../../src/telegram'
import { optionPayment } from '../../../src/constants/mintDomainName'
import { $net, updateNet } from '../../../src/store/network'
import { useStore } from 'react-stores'
import iconTYRON from '../../../src/assets/icons/ssi_token_Tyron.svg'
import useFetch from '../../../src/hooks/fetch'

const zcrypto = tyron.Util.default.Zcrypto()

function Component() {
    const resolvedInfo = useStore($resolvedInfo)
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { fetchWalletBalance } = useFetch(resolvedInfo)

    const Router = useRouter()
    const net = $net.state.net as 'mainnet' | 'testnet'

    const resolvedTLD = resolvedInfo?.user_tld
    const resolvedDomain = resolvedInfo?.user_domain
    const donation = effectorStore($donation)
    const buyInfo = effectorStore($buyInfo)
    const modalBuyNft = effectorStore($modalBuyNft)
    const txType = effectorStore($txType)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const zil_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''

    const loggedInDomain = loginInfo.loggedInDomain
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const CloseIcon = isLight ? CloseIconBlack : CloseIconReg
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
    const InfoIcon = isLight ? InfoIconPurple : InfoIconReg
    const TickIco = isLight ? TickIcoPurple : TickIcoReg
    const [loadingBalance, setLoadingBalance] = useState(false)
    const [inputAddr, setInputAddr] = useState('')
    const [legend, setLegend] = useState('save')
    const [loading, setLoading] = useState(false)
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [isDidx, setIsDidx] = useState(true)

    const $zil_mintFee = 1200 // @mainnet-domains

    //@review
    // const handleOnChangeRecipient = (value: any) => {
    //     setInputAddr('')
    //     updateDonation(null)
    //     updateBuyInfo({
    //         recipientOpt: value,
    //         anotherAddr: undefined,
    //         currency: undefined,
    //         currentBalance: 0,
    //         isEnough: false,
    //     })
    // }

    //@connect
    const handleConnect = React.useCallback(async () => {
        try {
            const wallet = new ZilPayBase()
            const zp = await wallet.zilpay()
            const connected = await zp.wallet.connect()

            const network = zp.wallet.net
            updateNet(network)

            const address = zp.wallet.defaultAccount

            if (connected && address) {
                dispatch(updateLoginInfoZilpay(address))
                updateShowZilpay(true)
                updateModalDashboard(true)
            }

            // const cache = window.localStorage.getItem(
            //     String(zp.wallet.defaultAccount?.base16)
            // )
            // if (cache) {
            //     updateTxList(JSON.parse(cache))
            // }
        } catch (err) {
            toast.warn(String(err), {
                position: 'bottom-right',
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const handleInputAddr = (event: { target: { value } }) => {
        setLegend('save')
        setInputAddr(event.target.value)
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            validateInputAddr()
        }
    }

    const validateInputAddr = () => {
        const addr = tyron.Address.default.verification(inputAddr)
        if (addr !== '') {
            updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: addr,
            })
            setLegend('saved')
        } else {
            toast.warn(t('Wrong address.'), {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }
    }

    const handleOnChangePayment = async (value: any) => {
        updateOriginatorAddress(null)
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
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'did',
                    'init'
                )
                if (value === 'FREE') {
                    const get_freelist = await getSmartContract(
                        init_addr!,
                        'free_list'
                    )
                    const freelist: Array<string> =
                        get_freelist!.result.free_list
                    const is_free = freelist.filter((val) => val === zil_addr)
                    if (is_free.length === 0) {
                        throw new Error('You are not on the free list.')
                    }
                    toast("Congratulations! You're on the free list.", {
                        position: 'bottom-left',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 8,
                    })
                }
                const paymentOptions = async (id: string) => {
                    setLoadingBalance(true)

                    const zilpay_addr =
                        loginInfo?.zilAddr !== null
                            ? loginInfo?.zilAddr.base16.toLowerCase()
                            : ''

                    await fetchWalletBalance(
                        id,
                        zilpay_addr,
                        loginInfo.loggedInAddress.toLowerCase()
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
                                // let price: number
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
                                        'Your DIDxWALLET does not have enough balance',
                                        {
                                            position: 'bottom-right',
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
                                }
                            }
                        })
                        .catch(() => {
                            toast.warning(t('Mint NFT: Unsupported token.'), {
                                position: 'bottom-right',
                                autoClose: 4000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 4,
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
                toast.warn(String(error), {
                    position: 'bottom-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 2,
                })
            }
            setLoadingPayment(false)
        }
    }

    const notifyBot = async (domain) => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: `tyron.network ${net}\n\nNFT domain minted:\n${domain}.ssi`,
        }
        await sendTelegramNotification(request.body)
        //await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_BUYNFT_URL}`, request)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const zilpay = new ZilPayBase()

            let addr: tyron.TyronZil.TransitionValue
            if (buyInfo?.recipientOpt === 'ADDR') {
                addr = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'ByStr20',
                    buyInfo?.anotherAddr
                )
            } else {
                addr = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.none,
                    'ByStr20'
                )
            }

            const tyron_: tyron.TyronZil.TransitionValue =
                await tyron.Donation.default.tyron(donation!)
            const tx_params = await tyron.TyronZil.default.BuyNftUsername(
                resolvedDomain!,
                addr,
                buyInfo?.currency?.toLowerCase()!,
                tyron_
            )

            let tx = await tyron.Init.default.transaction(net)

            toast.info(
                t('You’re about to buy the NFT Username X!', {
                    name: resolvedDomain,
                }),
                {
                    position: 'top-center',
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 6,
                }
            )
            updateModalBuyNft(false)
            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)

            let amount_call = 0
            let amount_donation = 0
            if (donation !== null) {
                amount_donation = Number(donation)
            }
            if (buyInfo?.currency?.toLowerCase() === 'zil') {
                const zil_amount = amount_donation + $zil_mintFee
                if (zil_amount > buyInfo?.currentBalance) {
                    amount_call = zil_amount - buyInfo?.currentBalance
                } else {
                    amount_call = 0
                }
            } else {
                amount_call = amount_donation
            }

            await zilpay
                .call({
                    contractAddress: loginInfo.loggedInAddress,
                    transition: 'BuyNftUsername',
                    params: tx_params as unknown as Record<string, unknown>[],
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

                        if (loggedInDomain === null) {
                            dispatch(updateLoginInfoUsername(resolvedDomain!))
                        }
                        updateBuyInfo(null)

                        //@review this resolution should already happen at the UI
                        updateResolvedInfo({
                            user_tld: 'did',
                            user_domain: resolvedDomain!,
                            user_subdomain: '',
                        })
                        //---

                        Router.push(`/${resolvedDomain}.ssi`)
                        notifyBot(resolvedDomain)
                    } else if (tx.isRejected()) {
                        dispatch(setTxStatusLoading('failed'))
                        Router.push('/')
                    }
                })
                .catch((err) => {
                    throw err
                })
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.warn(String(error), {
                position: 'bottom-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 7,
            })
            Router.push('/')
        }
        updateDonation(null)
    }

    const closeModal = () => {
        setIsDidx(true)
        setInputAddr('')
        updateDonation(null)
        updateBuyInfo({
            recipientOpt: '',
            anotherAddr: undefined,
            currency: undefined,
            currentBalance: 0,
            isEnough: false,
        })
        Router.push('/')
        updateModalBuyNft(false)
    }

    const outerClose = () => {
        closeModal()
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

    const pasteFromClipboard = async () => {
        setLegend('save')
        const text = navigator.clipboard.readText()
        setInputAddr(await text)
    }

    const spinner = <Spinner />

    if (!modalBuyNft) {
        return null
    }

    const optionPayment_ = [
        ...optionPayment,
        {
            value: 'FREE',
            label: 'FREE' /* @todo-t t('FREE')*/,
        },
    ]

    return (
        <>
            <div className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className="closeIcon">
                        <Image
                            alt="close-ico"
                            src={CloseIcon}
                            onClick={outerClose}
                            layout="responsive"
                        />
                    </div>
                    {txType === 'AddFunds' &&
                    (loginInfo.txStatusLoading === 'true' ||
                        loginInfo.txStatusLoading === 'submitted') ? (
                        <div className={styles.wrapperLoading}>
                            <div className={styles.loadingIco}>{spinner}</div>
                            <h4 style={{ marginTop: '4%' }}>
                                To continue, please wait until the deposit
                                arrives.
                            </h4>
                        </div>
                    ) : (
                        <div className={styles.contentWrapper}>
                            <div className={styles.icoWrapper}>
                                <Image
                                    src={iconTYRON}
                                    alt="tyron-icon"
                                    height="25"
                                    width="25"
                                />
                                <div className={styles.headerInfo}>
                                    {t('BUY_THIS_NFT_USERNAME')}
                                </div>
                            </div>
                            <div className={styles.usernameInfoWrapper}>
                                <div className={styles.usernameInfoYellow}>
                                    {resolvedDomain?.length! > 20
                                        ? `${resolvedDomain?.slice(
                                              0,
                                              8
                                          )}...${resolvedDomain?.slice(-8)}`
                                        : resolvedDomain}
                                    .{resolvedTLD === '' ? 'ssi' : resolvedTLD}
                                </div>
                                <div className={styles.usernameInfo}>
                                    {t('IS_AVAILABLE')}
                                </div>
                            </div>
                            {loginInfo.loggedInAddress === null ? (
                                <div className={styles.wrapperActionBtn}>
                                    <div
                                        className={
                                            isLight
                                                ? 'actionBtnLight'
                                                : 'actionBtn'
                                        }
                                        onClick={handleConnect}
                                    >
                                        {t('LOG IN')}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <div style={{ display: 'flex' }}>
                                            <h6
                                                className={styles.txt}
                                                style={{
                                                    fontSize: '20px',
                                                    marginBottom: '1rem',
                                                    color: isLight
                                                        ? 'black'
                                                        : '#ffff32',
                                                }}
                                            >
                                                {t('ADDRESS')}
                                            </h6>
                                            <div className={styles.icoInfo}>
                                                <span
                                                    className={styles.tooltip}
                                                >
                                                    <div className={styles.ico}>
                                                        <div
                                                            className={
                                                                styles.icoDefault
                                                            }
                                                        >
                                                            <Image
                                                                alt="info-ico"
                                                                src={
                                                                    InfoDefault
                                                                }
                                                                width={20}
                                                                height={20}
                                                            />
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.icoColor
                                                            }
                                                        >
                                                            <Image
                                                                alt="info-ico"
                                                                src={InfoIcon}
                                                                width={20}
                                                                height={20}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={
                                                            styles.tooltiptext
                                                        }
                                                    >
                                                        <h5
                                                            className={
                                                                styles.modalInfoTitle
                                                            }
                                                        >
                                                            {t('INFO')}
                                                        </h5>
                                                        <div
                                                            className={
                                                                styles.txt
                                                            }
                                                            style={{
                                                                fontSize:
                                                                    '11px',
                                                            }}
                                                        >
                                                            {t(
                                                                'INFO_MSG_RECIPIENT'
                                                            )}
                                                        </div>
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ marginLeft: '1rem' }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div className={styles.txt}>
                                                    DIDxWALLET
                                                </div>
                                                {isDidx ||
                                                buyInfo?.recipientOpt === '' ? (
                                                    <div
                                                        onClick={() => {
                                                            setIsDidx(false)
                                                            updateBuyInfo({
                                                                recipientOpt:
                                                                    'ADDR',
                                                                anotherAddr:
                                                                    undefined,
                                                                currency:
                                                                    undefined,
                                                                currentBalance: 0,
                                                                isEnough: false,
                                                            })
                                                            setLegend('save')
                                                        }}
                                                        className={
                                                            styles.toggleActiveWrapper
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.toggleActiveBall
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div
                                                            onClick={() => {
                                                                setIsDidx(true)
                                                                updateBuyInfo({
                                                                    recipientOpt:
                                                                        '',
                                                                    anotherAddr:
                                                                        undefined,
                                                                    currency:
                                                                        undefined,
                                                                    currentBalance: 0,
                                                                    isEnough:
                                                                        false,
                                                                })
                                                            }}
                                                            className={
                                                                styles.toggleInactiveWrapper
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.toggleInactiveBall
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            {!isDidx && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.inputAddrWrapper
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.txt
                                                            }
                                                            style={{
                                                                marginRight:
                                                                    '1rem',
                                                            }}
                                                        >
                                                            {resolvedDomain}
                                                            .ssi ={' '}
                                                        </div>
                                                        {buyInfo?.anotherAddr ===
                                                        undefined ? (
                                                            <div
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    style={{
                                                                        width: '60%',
                                                                    }}
                                                                    className={
                                                                        styles.input
                                                                    }
                                                                    onChange={
                                                                        handleInputAddr
                                                                    }
                                                                    onKeyPress={
                                                                        handleOnKeyPress
                                                                    }
                                                                    placeholder={t(
                                                                        'Type address'
                                                                    )}
                                                                    value={
                                                                        inputAddr
                                                                    }
                                                                />
                                                                <div
                                                                    style={{
                                                                        marginRight:
                                                                            '0rem',
                                                                    }}
                                                                    onClick={
                                                                        pasteFromClipboard
                                                                    }
                                                                    className="button"
                                                                >
                                                                    PASTE
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <a
                                                                href={`https://viewblock.io/zilliqa/address/${zcrypto.toBech32Address(
                                                                    buyInfo?.anotherAddr!
                                                                )}?network=${net}`}
                                                                rel="noreferrer"
                                                                target="_blank"
                                                                style={{
                                                                    marginRight:
                                                                        '5%',
                                                                }}
                                                            >
                                                                <span>
                                                                    zil...
                                                                    {zcrypto
                                                                        .toBech32Address(
                                                                            buyInfo?.anotherAddr!
                                                                        )
                                                                        .slice(
                                                                            -15
                                                                        )}
                                                                </span>
                                                            </a>
                                                        )}
                                                        {/* Continue arrow */}
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            <div
                                                                onClick={
                                                                    validateInputAddr
                                                                }
                                                            >
                                                                {legend ===
                                                                'save' ? (
                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '5px',
                                                                            cursor: 'pointer',
                                                                        }}
                                                                    >
                                                                        <Arrow />
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '5px',
                                                                        }}
                                                                    >
                                                                        <Image
                                                                            width={
                                                                                40
                                                                            }
                                                                            src={
                                                                                TickIco
                                                                            }
                                                                            alt="tick"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {buyInfo?.recipientOpt !==
                                                'ADDR' && (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginTop: '2%',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            marginRight: '2rem',
                                                        }}
                                                        className={
                                                            styles.loginAddress
                                                        }
                                                    >
                                                        {resolvedDomain}
                                                        .ssi ={' '}
                                                        <a
                                                            href={`https://viewblock.io/zilliqa/address/${loginInfo.loggedInAddress}?network=${net}`}
                                                            rel="noreferrer"
                                                            target="_blank"
                                                        >
                                                            <span>
                                                                zil...
                                                                {zcrypto
                                                                    ?.toBech32Address(
                                                                        loginInfo?.loggedInAddress
                                                                    )
                                                                    .slice(-15)}
                                                            </span>
                                                        </a>
                                                    </div>
                                                    {/* Continue arrow */}
                                                    {/* <div
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems:
                                                                        'center',
                                                                }}
                                                            >
                                                                <div>
                                                                    {buyInfo?.recipientOpt !==
                                                                        'ADDR' ? (
                                                                        <div
                                                                            style={{
                                                                                cursor: 'pointer',
                                                                            }}
                                                                            onClick={() =>
                                                                                handleOnChangeRecipient(
                                                                                    'SSI'
                                                                                )
                                                                            }
                                                                        >
                                                                            <Arrow />
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            style={{
                                                                                marginTop:
                                                                                    '5px',
                                                                            }}
                                                                        >
                                                                            <Image
                                                                                width={
                                                                                    40
                                                                                }
                                                                                src={
                                                                                    TickIco
                                                                                }
                                                                                alt="tick"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div> */}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* Select payment */}
                                    <div className={styles.paymentWrapper}>
                                        {buyInfo?.recipientOpt === '' ||
                                        buyInfo?.recipientOpt === undefined ||
                                        (buyInfo?.recipientOpt === 'ADDR' &&
                                            buyInfo?.anotherAddr !==
                                                undefined) ? (
                                            <>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                    }}
                                                >
                                                    <h6
                                                        className={styles.txt}
                                                        style={{
                                                            fontSize: '20px',
                                                            marginBottom:
                                                                '1rem',
                                                            marginTop: '2rem',
                                                            color: isLight
                                                                ? 'black'
                                                                : '#ffff32',
                                                        }}
                                                    >
                                                        {t('SELECT_PAYMENT')}
                                                    </h6>
                                                </div>
                                                <div className={styles.select}>
                                                    <Selector
                                                        option={optionPayment_}
                                                        onChange={
                                                            handleOnChangePayment
                                                        }
                                                        loading={loadingPayment}
                                                        placeholder={t(
                                                            'Domain price'
                                                        )}
                                                        defaultValue={
                                                            buyInfo?.currency ===
                                                            undefined
                                                                ? undefined
                                                                : buyInfo?.currency
                                                        }
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    {buyInfo?.currency !== undefined &&
                                        !loadingPayment && (
                                            <>
                                                {buyInfo?.currency !== 'FREE' &&
                                                    buyInfo?.currency !==
                                                        '' && (
                                                        <div
                                                            className={
                                                                styles.balanceInfoWrapepr
                                                            }
                                                        >
                                                            {loadingBalance ? (
                                                                <div>
                                                                    {spinner}
                                                                </div>
                                                            ) : (
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
                                                                            buyInfo?.currentBalance
                                                                        }{' '}
                                                                        {
                                                                            buyInfo?.currency
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                {buyInfo?.currency !==
                                                    undefined &&
                                                    buyInfo?.currency !== '' &&
                                                    !loadingBalance && (
                                                        <>
                                                            {buyInfo?.isEnough ? (
                                                                <>
                                                                    <Donate />
                                                                    {donation !==
                                                                        null && (
                                                                        <>
                                                                            <div
                                                                                style={{
                                                                                    width: 'fit-content',
                                                                                    marginTop:
                                                                                        '10%',
                                                                                    textAlign:
                                                                                        'center',
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    className={
                                                                                        isLight
                                                                                            ? 'actionBtnLight'
                                                                                            : 'actionBtn'
                                                                                    }
                                                                                    onClick={
                                                                                        handleSubmit
                                                                                    }
                                                                                >
                                                                                    {loading ? (
                                                                                        <ThreeDots color="yellow" />
                                                                                    ) : (
                                                                                        t(
                                                                                            'MINT DNS'
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <h5
                                                                                className={
                                                                                    styles.gasTxt
                                                                                }
                                                                            >
                                                                                {t(
                                                                                    'GAS_AROUND'
                                                                                )}
                                                                                &nbsp;
                                                                                14
                                                                                ZIL
                                                                            </h5>
                                                                        </>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div
                                                                        style={{
                                                                            color: 'red',
                                                                            marginBottom:
                                                                                '2rem',
                                                                        }}
                                                                    >
                                                                        {t(
                                                                            'NOT_ENOUGH_BALANCE'
                                                                        )}
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
                                                                            reject={
                                                                                rejectAddFunds
                                                                            }
                                                                        />
                                                                    </div>
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
        </>
    )
}

export default Component
