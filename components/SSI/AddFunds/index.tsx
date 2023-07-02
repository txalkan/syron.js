import React, { useState, useCallback, useEffect } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { $donation, updateDonation } from '../../../src/store/donation'
import {
    OriginatorAddress,
    Donate,
    Selector,
    Spinner,
    ConnectButton,
    WalletInfo,
    Arrow,
} from '../..'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../src/store/originatorAddress'
import { setTxStatusLoading, setTxId } from '../../../src/app/actions'
import { $doc } from '../../../src/store/did-doc'
import { RootState } from '../../../src/app/reducers'
import { $buyInfo, updateBuyInfo } from '../../../src/store/buyInfo'
import {
    updateModalAddFunds,
    updateModalTx,
    updateTxType,
    updateModalTxMinimized,
    updateTransferModal,
    updateTypeBatchTransfer,
} from '../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import smartContract from '../../../src/utils/smartContract'
import TickIcoYellow from '../../../src/assets/icons/tick.svg'
import TickIcoPurple from '../../../src/assets/icons/tick_purple.svg'
import toastTheme from '../../../src/hooks/toastTheme'
import wallet from '../../../src/hooks/wallet'
import ThreeDots from '../../Spinner/ThreeDots'
import fetch from '../../../src/hooks/fetch'

interface InputType {
    type: string
    token?: string
    reject?: any
}

function Component(props: InputType) {
    const { type, token, reject } = props

    const dispatch = useDispatch()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { checkBalance } = wallet()
    const { checkVersion, fetchWalletBalance } = fetch()
    const doc = useStore($doc)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedTLD = resolvedInfo?.user_tld
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const subdomainNavigate =
        resolvedInfo?.user_subdomain !== ''
            ? resolvedInfo?.user_subdomain + '@'
            : ''

    const buyInfo = useStore($buyInfo)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const originator_address = useStore($originatorAddress)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const TickIco = isLight ? TickIcoPurple : TickIcoYellow
    const version = checkVersion(originator_address?.version)

    let coin: string = ''
    if (token !== undefined) {
        coin = token
    }

    const [currency, setCurrency] = useState(coin)
    const [input, setInput] = useState(0) // the amount to transfer
    const [legend, setLegend] = useState('CONTINUE')

    const [hideDonation, setHideDonation] = useState(true)
    const [hideSubmit, setHideSubmit] = useState(true)
    const [isBalanceAvailable, setIsBalanceAvailable] = useState(true)
    const [loadingInfoBal, setLoadingInfoBal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showSingleTransfer, setShowSingleTransfer] = useState(false)

    let recipient: string
    if (type === 'buy') {
        recipient = loginInfo.loggedInAddress
    } else {
        recipient = resolvedInfo?.addr!
    }

    //@info can we combine the 2 useEffect into 1?: I don't think so, since the other useEffect has different condition(only triggered when originator_address changed)
    useEffect(() => {
        updateOriginatorAddress(null)
        if (
            doc?.version.slice(8, 9) === undefined ||
            Number(doc?.version.slice(8, 9)) >= 4 ||
            doc?.version.slice(0, 4) === 'init' ||
            doc?.version.slice(0, 3) === 'dao' ||
            doc?.version.slice(0, 10) === 'DIDxWALLET'
        ) {
            if (currency !== '' && isBalanceAvailable && type !== 'modal') {
                paymentOptions(currency.toLowerCase(), recipient.toLowerCase())
            }
        } else {
            toast.warn(`Feature unavailable. Upgrade account.`, {
                position: 'bottom-left',
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
    }, [])

    const paymentOptions = async (id_: string, inputAddr: string) => {
        try {
            const id = id_.toLowerCase()
            await fetchWalletBalance(id, inputAddr.toLowerCase())
                .then(async (balances_) => {
                    // Get balance of the logged in address
                    const balance = balances_[0]
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
                        const field = Object.entries(get_state!.result.utility)
                        for (let i = 0; i < field.length; i += 1) {
                            if (field[i][0] === id) {
                                const utils = Object.entries(field[i][1] as any)
                                const util_id = 'BuyNftUsername'
                                for (let i = 0; i < utils.length; i += 1) {
                                    if (utils[i][0] === util_id) {
                                        price = Number(utils[i][1])
                                        const _currency =
                                            tyron.Currency.default.tyron(id)
                                        price = price / _currency.decimals
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
                                currency: currency,
                                currentBalance: balance,
                                isEnough: true,
                            })
                        } else {
                            updateBuyInfo({
                                recipientOpt: buyInfo?.recipientOpt,
                                anotherAddr: buyInfo?.anotherAddr,
                                currency: currency,
                                currentBalance: balance,
                                isEnough: false,
                            })
                        }
                    }
                })
                .catch(() => {
                    throw new Error('Not able to fetch balance')
                })
        } catch (error) {
            setIsBalanceAvailable(false)
            toast.error(String(error), {
                position: 'bottom-right',
                autoClose: 3000,
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

    const fetchBalance = async () => {
        updateBuyInfo({
            recipientOpt: buyInfo?.recipientOpt,
            anotherAddr: buyInfo?.anotherAddr,
            currency: currency,
            currentBalance: 0,
            isEnough: false,
        })
        paymentOptions(currency.toLowerCase(), recipient.toLowerCase())
    }

    const handleOnChange = (value) => {
        setInput(0)
        setHideDonation(true)
        setHideSubmit(true)
        setLegend('CONTINUE')
        setCurrency(value)
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setHideDonation(true)
        setHideSubmit(true)
        setLegend('CONTINUE')
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        if (!isNaN(input_)) {
            setInput(input_)
        } else {
            toast.error(t('The input is not a number.'), {
                position: 'bottom-right',
                autoClose: 2000,
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

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleSave = async () => {
        const isEnough = await checkBalance(currency, input, setLoadingInfoBal)
        if (input === 0) {
            toast.error(t('The amount cannot be zero.'), {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 4,
            })
        } else if (!isEnough) {
            setLoadingInfoBal(false)
            setLegend('CONTINUE')
            toast.error('Insufficient balance.', {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        } else {
            setLegend('SAVED')
            setHideDonation(false)
            setHideSubmit(false)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        // @info [add loading/spinner]: loading will not show up because tx modal pop up - if we add loading/setState it will cause error "can't perform react state update.."
        try {
            if (originator_address?.value !== null) {
                const zilpay = new ZilPayBase()
                const _currency = tyron.Currency.default.tyron(currency, input)
                const txID = _currency.txID
                const amount = _currency.amount

                let tx = await tyron.Init.default.transaction(net)

                dispatch(setTxStatusLoading('true'))
                resetOriginator()
                updateTxType('AddFunds')
                updateModalTxMinimized(false)
                updateModalTx(true)
                switch (originator_address?.value!) {
                    case 'zilliqa':
                        switch (txID) {
                            case 'SendFunds':
                                await zilpay
                                    .call({
                                        contractAddress: recipient,
                                        transition: 'AddFunds',
                                        params: [],
                                        amount: String(input),
                                    })
                                    .then(async (res) => {
                                        dispatch(setTxId(res.ID))
                                        dispatch(
                                            setTxStatusLoading('submitted')
                                        )
                                        tx = await tx.confirm(res.ID, 33)
                                        if (tx.isConfirmed()) {
                                            dispatch(
                                                setTxStatusLoading('confirmed')
                                            )
                                            setTimeout(() => {
                                                window.open(
                                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                                )
                                            }, 1000)
                                            if (type === 'modal') {
                                                updateModalAddFunds(false)
                                            }
                                        } else if (tx.isRejected()) {
                                            dispatch(
                                                setTxStatusLoading('failed')
                                            )
                                        }
                                    })
                                    .catch((err) => {
                                        throw err
                                    })
                                break
                            default:
                                {
                                    const init_addr =
                                        await tyron.SearchBarUtil.default.fetchAddr(
                                            net,
                                            'did',
                                            'init'
                                        )
                                    const services = await getSmartContract(
                                        init_addr!,
                                        'services'
                                    )
                                    const services_ =
                                        await tyron.SmartUtil.default.intoMap(
                                            services!.result.services
                                        )
                                    const token_addr = services_.get(
                                        currency.toLowerCase()
                                    )

                                    const tx_params =
                                        await tyron.TyronZil.default.AddFunds(
                                            recipient,
                                            String(amount)
                                        )

                                    if (token_addr !== undefined) {
                                        toast.info(
                                            `${t(
                                                'You’re about to transfer'
                                            )} ${input} ${currency}`,
                                            {
                                                position: 'bottom-center',
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
                                        await zilpay
                                            .call({
                                                contractAddress: token_addr,
                                                transition: txID,
                                                params: tx_params as unknown as Record<
                                                    string,
                                                    unknown
                                                >[],
                                                amount: '0',
                                            })
                                            .then(async (res) => {
                                                dispatch(setTxId(res.ID))
                                                dispatch(
                                                    setTxStatusLoading(
                                                        'submitted'
                                                    )
                                                )
                                                tx = await tx.confirm(
                                                    res.ID,
                                                    33
                                                )
                                                if (tx.isConfirmed()) {
                                                    fetchBalance().then(() => {
                                                        dispatch(
                                                            setTxStatusLoading(
                                                                'confirmed'
                                                            )
                                                        )
                                                        setTimeout(() => {
                                                            window.open(
                                                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                                            )
                                                        }, 1000)
                                                    })
                                                    if (type === 'modal') {
                                                        updateModalAddFunds(
                                                            false
                                                        )
                                                    }
                                                } else if (tx.isRejected()) {
                                                    dispatch(
                                                        setTxStatusLoading(
                                                            'failed'
                                                        )
                                                    )
                                                }
                                            })
                                            .catch((err) => {
                                                throw err
                                            })
                                    } else {
                                        throw new Error(
                                            'Token not supported yet.'
                                        )
                                    }
                                }
                                break
                        }
                        break
                    default: {
                        const addr = originator_address?.value
                        let beneficiary: tyron.TyronZil.Beneficiary
                        if (type === 'buy') {
                            beneficiary = {
                                constructor:
                                    tyron.TyronZil.BeneficiaryConstructor
                                        .Recipient,
                                addr: recipient,
                            }
                        } else {
                            let didxdomain = resolvedTLD
                            if (resolvedSubdomain !== '') {
                                didxdomain = resolvedSubdomain
                            }
                            await tyron.SearchBarUtil.default
                                .Resolve(net, addr!)
                                .then(async (res: any) => {
                                    const domainId =
                                        '0x' +
                                        (await tyron.Util.default.HashString(
                                            resolvedDomain!
                                        ))
                                    const beneficiary_: any =
                                        await tyron.Beneficiary.default.generate(
                                            Number(res?.version.slice(8, 11)),
                                            recipient,
                                            domainId,
                                            didxdomain
                                        )
                                    beneficiary = beneficiary_
                                })
                                .catch(async () => {
                                    const domainId =
                                        '0x' +
                                        (await tyron.Util.default.HashString(
                                            resolvedDomain!
                                        ))

                                    beneficiary = {
                                        constructor:
                                            tyron.TyronZil
                                                .BeneficiaryConstructor
                                                .NftUsername,
                                        username: domainId,
                                        domain: didxdomain,
                                    }
                                })
                        }
                        let _amount = '0'
                        if (donation !== null) {
                            _amount = String(donation)
                            const tyron_ = await tyron.Donation.default.tyron(
                                donation
                            )
                            let tx_params = Array()
                            switch (txID) {
                                case 'SendFunds':
                                    tx_params =
                                        await tyron.TyronZil.default.SendFunds(
                                            addr!,
                                            'AddFunds',
                                            beneficiary!,
                                            String(amount),
                                            tyron_
                                        )
                                    break
                                default:
                                    tx_params =
                                        await tyron.TyronZil.default.Transfer(
                                            addr!,
                                            currency.toLowerCase(),
                                            beneficiary!,
                                            String(amount),
                                            tyron_
                                        )
                                    break
                            }

                            toast.info(
                                `${t(
                                    'You’re about to transfer'
                                )} ${input} ${currency}`,
                                {
                                    position: 'bottom-center',
                                    autoClose: 6000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 7,
                                }
                            )
                            await zilpay
                                .call({
                                    contractAddress: originator_address?.value!,
                                    transition: txID,
                                    params: tx_params as unknown as Record<
                                        string,
                                        unknown
                                    >[],
                                    amount: _amount,
                                })
                                .then(async (res) => {
                                    dispatch(setTxId(res.ID))
                                    dispatch(setTxStatusLoading('submitted'))
                                    tx = await tx.confirm(res.ID, 33)
                                    if (tx.isConfirmed()) {
                                        fetchBalance().then(() => {
                                            dispatch(
                                                setTxStatusLoading('confirmed')
                                            )
                                            setTimeout(() => {
                                                window.open(
                                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                                )
                                            }, 1000)
                                            if (type === 'modal') {
                                                updateModalAddFunds(false)
                                            }
                                        })
                                    } else if (tx.isRejected()) {
                                        dispatch(setTxStatusLoading('failed'))
                                    }
                                })
                                .catch((err) => {
                                    throw err
                                })
                        }
                    }
                }
            }
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.error(String(error), {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 8,
            })
        }
        updateOriginatorAddress(null)
        updateDonation(null)
        setLoading(false)
    }

    const resetOriginator = () => {
        updateOriginatorAddress(null)
        setInput(0)
        setLegend('CONTINUE')
    }

    //@review: ilham why function?
    // const domainCheck = () => {
    //     if (resolvedTLD !== '' && resolvedTLD !== 'did') {
    //         return `${resolvedTLD}@`
    //     } else {
    //         return ''
    //     }
    // }

    const dotCheck = () => {
        if (resolvedTLD === 'did') {
            return `.did`
        } else {
            return '.ssi'
        }
    }

    useEffect(() => {
        setHideDonation(true)
        updateDonation(null)
        setLegend('CONTINUE')
        setShowSingleTransfer(false)
        console.log('Originator:', originator_address)
        console.log('AddFunds Token:', token)
        if (coin === '') {
            console.log('AddFunds currency:', token)
            setCurrency('')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [originator_address])

    const listCoin = tyron.Options.default.listCoin()
    const option = [...listCoin]

    return (
        <>
            {type === 'buy' ? (
                <div>
                    <div
                        style={{ marginBottom: '2rem' }}
                        className={styles.addFundsTitle}
                    >
                        {t('ADD_FUNDS')}
                    </div>

                    {/* {loginInfo.address !== null && (
                        <div
                            style={{ marginBottom: '2rem' }}
                            className={styles.addFundsToAddress}
                        >
                            {t('ADD_FUNDS_INTO', {
                                name: loginInfo?.username
                                    ? `${loginInfo?.username}.did`
                                    : `did:tyron:zil...${loginInfo.address.slice(
                                          -10
                                      )}`,
                            })}
                        </div>
                    )} */}
                    <OriginatorAddress />
                    {originator_address?.value && currency !== '' && (
                        <>
                            <div className={styles.walletInfo}>
                                <WalletInfo currency={currency} />
                            </div>
                            {currency !== '' /*&&
                                        originator_address.value !== ''*/ && (
                                <div className={styles.fundsWrapper}>
                                    <code className={styles.txt}>
                                        {currency}
                                    </code>
                                    <input
                                        className={styles.inputCoin}
                                        type="text"
                                        onChange={handleInput}
                                        onKeyPress={handleOnKeyPress}
                                    />
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginLeft: '2%',
                                        }}
                                        onClick={() => {
                                            if (legend === 'CONTINUE') {
                                                handleSave()
                                            }
                                        }}
                                    >
                                        <div>
                                            {loadingInfoBal ? (
                                                <Spinner />
                                            ) : legend === 'CONTINUE' ? (
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
                            )}
                        </>
                    )}
                    {!hideDonation &&
                        originator_address?.value !== 'zilliqa' && <Donate />}
                    {!hideSubmit &&
                        (donation !== null ||
                            originator_address?.value == 'zilliqa') && (
                            <>
                                {legend !== 'CONTINUE' && (
                                    <>
                                        <div
                                            className={
                                                styles.transferInfoWrapper
                                            }
                                        >
                                            <div
                                                className={styles.transferInfo}
                                            >
                                                {t('TRANSFER')}:&nbsp;
                                            </div>
                                            <div
                                                className={
                                                    styles.transferInfoYellow
                                                }
                                            >
                                                {input}{' '}
                                                <span
                                                    style={{
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    {currency}
                                                </span>
                                                &nbsp;
                                            </div>
                                            <div
                                                className={styles.transferInfo}
                                            >
                                                {t('TO')}&nbsp;
                                            </div>
                                            <div
                                                className={
                                                    styles.transferInfoYellow
                                                }
                                            >
                                                {loginInfo.loggedInDomain
                                                    ? `${loginInfo.loggedInDomain}.ssi`
                                                    : `did:tyron:zil...${loginInfo.loggedInAddress.slice(
                                                          -10
                                                      )}`}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                width: 'fit-content',
                                                marginTop: '10%',
                                                textAlign: 'center',
                                                display: 'flex',
                                            }}
                                        >
                                            <div
                                                className={
                                                    isLight
                                                        ? 'actionBtnLight'
                                                        : 'actionBtn'
                                                }
                                                onClick={handleSubmit}
                                            >
                                                {loading ? (
                                                    <ThreeDots color="yellow" />
                                                ) : (
                                                    t('CONFIRM')
                                                )}
                                            </div>
                                            {reject && (
                                                <>
                                                    &nbsp;
                                                    <div
                                                        className={
                                                            isLight
                                                                ? 'actionBtnRedLight'
                                                                : 'actionBtnRed'
                                                        }
                                                        onClick={reject}
                                                    >
                                                        {loading ? (
                                                            <ThreeDots color="yellow" />
                                                        ) : (
                                                            t('REJECT')
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {/* @todo update cost
                                        <h5 className={styles.gasTxt}>
                                            {t('GAS_AROUND')} 4 -7 ZIL
                                        </h5> */}
                                    </>
                                )}
                            </>
                        )}
                </div>
            ) : (
                <div className={type !== 'modal' ? styles.wrapperNonBuy : ''}>
                    <h2 className={styles.title}>{t('ADD_FUNDS')}</h2>
                    <>
                        <div
                            style={{ marginBottom: '2rem' }}
                            className={styles.subtitle}
                        >
                            {t('ADD_FUNDS_INTO', {
                                name: `${subdomainNavigate}${resolvedDomain}${dotCheck()}`,
                            })}
                        </div>
                        {loginInfo.zilAddr === null ? (
                            <ConnectButton />
                        ) : (
                            <>
                                <div className={styles.wrapperOriginator}>
                                    <OriginatorAddress />
                                </div>
                                {originator_address?.value && (
                                    <>
                                        {version >= 6 && type !== 'modal' && (
                                            <>
                                                {currency === '' && (
                                                    <div
                                                        className={
                                                            styles.walletInfo
                                                        }
                                                    >
                                                        <WalletInfo currency="" />
                                                    </div>
                                                )}
                                                <div
                                                    className={
                                                        styles.btnGroupTransfer
                                                    }
                                                >
                                                    <div>
                                                        <div
                                                            onClick={() => {
                                                                setShowSingleTransfer(
                                                                    false
                                                                )
                                                                updateTypeBatchTransfer(
                                                                    'withdraw'
                                                                )
                                                                updateTransferModal(
                                                                    true
                                                                )
                                                            }}
                                                            className="button small"
                                                        >
                                                            BATCH TRANSFER
                                                        </div>
                                                    </div>
                                                    {!showSingleTransfer && (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    '20px',
                                                            }}
                                                        >
                                                            <div
                                                                onClick={() => {
                                                                    setShowSingleTransfer(
                                                                        true
                                                                    )
                                                                }}
                                                                className="button small"
                                                            >
                                                                SINGLE TRANSFER
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        {(version < 6 ||
                                            showSingleTransfer ||
                                            originator_address?.value ===
                                                'zilliqa') &&
                                        type !== 'modal' ? (
                                            <div className={styles.container2}>
                                                <div className={styles.select}>
                                                    <Selector
                                                        option={option}
                                                        onChange={
                                                            handleOnChange
                                                        }
                                                        placeholder={t(
                                                            'Select coin'
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {/* {originator_address?.username && (
                            <div
                                style={{
                                    marginTop: '10%',
                                    marginBottom: '10%',
                                }}
                            >
                                {t('Send funds from X into X', {
                                    source: `${originator_address?.username}@${originator_address?.domain}.did`,
                                    recipient: '',
                                })}
                                <span style={{ color: '#ffff32' }}>
                                    {username}
                                    {domainCheck()}{' '}
                                </span>
                            </div>
                        )} */}
                        {currency !== '' && originator_address?.value && (
                            <>
                                <div className={styles.walletInfo}>
                                    <WalletInfo currency={currency} />
                                </div>
                                <h3
                                    className={styles.txt}
                                    style={{
                                        marginTop: '7%',
                                        textAlign: 'left',
                                    }}
                                >
                                    {t('ADD_FUNDS_INTO_TITLE')}{' '}
                                    <span className={styles.username}>
                                        {subdomainNavigate}
                                        {resolvedDomain}
                                        {dotCheck()}
                                    </span>
                                </h3>
                                <div className={styles.container2}>
                                    {currency !== '' && (
                                        <>
                                            <code className={styles.txt}>
                                                {currency}
                                            </code>
                                            <input
                                                className={styles.inputCoin2}
                                                type="text"
                                                placeholder={t('Type amount')}
                                                onChange={handleInput}
                                                onKeyPress={handleOnKeyPress}
                                            />

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginLeft: '2%',
                                                }}
                                                onClick={() => {
                                                    if (legend === 'CONTINUE') {
                                                        handleSave()
                                                    }
                                                }}
                                            >
                                                <div>
                                                    {loadingInfoBal ? (
                                                        <Spinner />
                                                    ) : legend ===
                                                      'CONTINUE' ? (
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
                                            {/* <input
                                                        style={{
                                                            marginLeft: '2%',
                                                        }}
                                                        type="button"
                                                        className={button}
                                                        value={t(legend)}
                                                        onClick={() => {
                                                            handleSave()
                                                        }}
                                                    /> */}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                        {!hideDonation &&
                            originator_address?.value !== 'zilliqa' && (
                                <Donate />
                            )}
                        {!hideSubmit &&
                            (donation !== null ||
                                originator_address?.value == 'zilliqa') && (
                                <div
                                    style={{
                                        marginTop: '14%',
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        marginLeft: '1%',
                                    }}
                                >
                                    <div
                                        className={
                                            isLight
                                                ? 'actionBtnLight'
                                                : 'actionBtn'
                                        }
                                        onClick={handleSubmit}
                                    >
                                        {loading ? (
                                            <ThreeDots color="yellow" />
                                        ) : (
                                            <div>
                                                {t('TRANSFER')}{' '}
                                                <span
                                                    style={{
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    {input} {currency}
                                                </span>{' '}
                                                <span
                                                    style={{
                                                        textTransform:
                                                            'lowercase',
                                                    }}
                                                >
                                                    {t('TO')}
                                                </span>{' '}
                                                <span
                                                    style={{
                                                        textTransform:
                                                            'lowercase',
                                                    }}
                                                >
                                                    {subdomainNavigate}
                                                    {resolvedDomain}
                                                    {dotCheck()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {/* @todo update gas cost */}
                                    {/* <h5
                                        style={{
                                            marginTop: '3%',
                                            color: 'lightgrey',
                                        }}
                                    >
                                        {currency === 'ZIL' ? (
                                            <div className={styles.gasTxt}>
                                                {t('GAS_AROUND')} 1-2 ZIL
                                            </div>
                                        ) : (
                                            <div className={styles.gasTxt}>
                                                {t('GAS_AROUND')} 4-7 ZIL
                                            </div>
                                        )}
                                    </h5> */}
                                </div>
                            )}
                    </>
                </div>
            )}
        </>
    )
}

export default Component
