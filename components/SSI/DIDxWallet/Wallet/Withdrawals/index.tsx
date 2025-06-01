import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore as effectorStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import React, { useState, useCallback, useRef } from 'react'
import {
    Arrow,
    Donate,
    InputPercentage,
    SearchBarWallet,
    Selector,
} from '../../../..'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import {
    updateModalTx,
    $selectedCurrency,
    updateModalTxMinimized,
    $selectedCurrencyBal,
} from '../../../../../src/store/modal'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { setTxStatusLoading, setTxId } from '../../../../../src/app/actions'
import { RootState } from '../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import smartContract from '../../../../../src/utils/smartContract'
import TickIco from '../../../../../src/assets/icons/tick.svg'
import toastTheme from '../../../../../src/hooks/toastTheme'
import ThreeDots from '../../../../Spinner/ThreeDots'
import { $net } from '../../../../../src/store/network'
import { useStore } from 'react-stores'
import Big from 'big.js'
Big.PE = 999
const _0 = Big(0)

function Component() {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()

    const dispatch = useDispatch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const donation = effectorStore($donation)
    const resolvedInfo = useStore($resolvedInfo)
    const currency = effectorStore($selectedCurrency)
    const currencyBal = effectorStore($selectedCurrencyBal)

    const [source, setSource] = useState('')
    const [manualInput, setManualInput] = useState<any>(true)
    const [transferInput, setTransferInput] = useState<any>(null) // the amount to transfer
    const [showTransferInput, setShowTransferInput] = useState<any>(null) // the amount to transfer

    const [recipientType, setRecipientType] = useState('')

    const [input_, setInput] = useState('')
    const [tld_, setTLD] = useState('default')
    const [domain_, setDomain] = useState('')

    const [subdomain, setSubdomain] = useState('')

    // const [inputB, setInputB] = useState('')
    const [input2, setInput2] = useState('') // the recipient (address)

    const [legend, setLegend] = useState('continue')
    const [legendCurrency, setLegendCurrency] = useState('continue')
    // const [button, setButton] = useState('button primary')
    const [hideDonation, setHideDonation] = useState(true)
    const [hideSubmit, setHideSubmit] = useState(true)
    const [loadingUser, setLoadingUser] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [resolvedAddr, setResolvedAddr] = useState('')

    const handleOnChange = (value) => {
        setSource(value)
        setLegend('continue')
        setLegendCurrency('continue')
        setTransferInput(null)
        setShowTransferInput(null)
        setDomain('')
        setTLD('default')
        setSubdomain('')
        setInput('')
        setInput2('')
        setRecipientType('')
        setHideDonation(true)
        setHideSubmit(true)
    }

    const handleOnChangeRecipientType = (value) => {
        setDomain('')
        setTLD('default')
        setSubdomain('')
        setInput2('')
        updateDonation(null)
        setHideDonation(true)
        setHideSubmit(true)
        setLegend('continue')
        // setButton('button primary')
        setRecipientType(value)
    }

    // const handleOnChangeB = (value) => {
    //     setInputB(value)
    // }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setManualInput(true)
        setHideDonation(true)
        setHideSubmit(true)
        setLegendCurrency('continue')
        // setButton('button primary')
        setRecipientType('')
        let input = event.target.value
        setTransferInput(input)
    }

    const handleInput2 = (event: { target: { value: any } }) => {
        setHideDonation(true)
        setHideSubmit(true)
        setLegend('continue')
        // setButton('button primary')
        let addr_input = event.target.value
        try {
            addr_input = zcrypto.fromBech32Address(addr_input)
            setInput2(addr_input)
        } catch (error) {
            try {
                addr_input = zcrypto.toChecksumAddress(addr_input)
                setInput2(addr_input)
            } catch {
                toast.warn('Wrong address format.', {
                    position: 'top-right',
                    autoClose: 2222,
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

    const handleOnKeyPress = async ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSaveCurrency()
        }
    }

    const handleOnKeyPress2 = async ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleSave = async () => {
        if (transferInput === 0) {
            const message = t('The amount cannot be zero.')
            toast.warn(message, {
                position: 'top-right',
                autoClose: 2222,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 4,
            })
        } else if (input2 === '') {
            toast.warn('The address of the recipient cannot be null.', {
                position: 'top-right',
                autoClose: 2222,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        } else {
            // if (currency === 'ZIL' && inputB === '') {
            //     toast.warn('Choose the type of recipient.', {
            //         position: 'top-right',
            //         autoClose: 2222,
            //         hideProgressBar: false,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         theme: toastTheme(isLight),
            //         toastId: 6,
            //     })
            // } else {
            setLegend('saved')
            // setButton('button')
            setHideDonation(false)
            setHideSubmit(false)
            // }
        }
    }

    const handlePercentage = (percentage) => {
        let input = _0
        if (source === 'zilpay') {
            input = Big(currencyBal[3]).mul(Big(percentage))
        } else {
            //@dev: xwallet
            input = Big(currencyBal[2]).mul(Big(percentage))
        }
        if (input !== _0) {
            setManualInput(false)
            setTransferInput(input)
            setShowTransferInput(
                Number(Big(input).div(currencyBal[4]).round(4)).toLocaleString()
            )
            setLegendCurrency('saved')
        } else {
            const message = t('The amount cannot be zero.')
            toast.warn(message, {
                position: 'top-right',
                autoClose: 2222,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 4,
            })
        }
    }

    const handleSaveCurrency = () => {
        let transfer_ = transferInput
        if (isNaN(transfer_)) {
            transfer_ = parseFloat(transferInput.replace(/,/g, ''))
        }
        const input_ = Number(transfer_) * currencyBal[4]
        if (!isNaN(input_)) {
            if (input_ === 0) {
                const message = t('The amount cannot be zero.')
                toast.warn(message, {
                    position: 'top-right',
                    autoClose: 2222,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 1,
                })
            } else {
                let index = 2
                if (source !== 'xwallet') {
                    index = 3
                }
                if (input_ > currencyBal[index]) {
                    const message = t(
                        'Insufficient balance. You have only {{amount}} {{currency}}.',
                        {
                            amount: Number(
                                Big(currencyBal[index])
                                    .div(currencyBal[4])
                                    .round(4)
                            ).toLocaleString(),
                            currency: currency,
                        }
                    )
                    toast.error(message, {
                        position: 'top-right',
                        autoClose: 2222,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 1,
                    })
                } else {
                    if (input_ < 6 * 1e12 && currency === 'ZIL') {
                        toast.warn(
                            'This transaction costs 4-6 ZIL, thus greater than the amount you want to send.',
                            {
                                position: 'top-right',
                                autoClose: 2222,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 2,
                            }
                        )
                    }
                    setLegendCurrency('saved')
                }
            }
        } else {
            const message = t('The input is not a number.')
            toast.warn(message, {
                position: 'top-right',
                autoClose: 2222,
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

    const handleSubmit = async () => {
        setLoadingSubmit(true)
        if (resolvedInfo !== null) {
            try {
                const zilpay = new ZilPayBase()
                let transfer_ = transferInput
                if (isNaN(transfer_)) {
                    transfer_ = parseFloat(transferInput.replace(/,/g, ''))
                }
                //@dev: w/ percentage
                if (!manualInput) {
                    transfer_ = 1 //dummy
                }
                const _currency = tyron.Currency.default.tyron(
                    currency!,
                    transfer_
                )

                const txID = _currency.txID
                let amount = Big(_currency.amount)
                if (!manualInput) {
                    amount = Big(transferInput)
                    console.log('_AMOUNT_PERCENTAGE', String(amount))
                }

                let beneficiary: tyron.TyronZil.Beneficiary
                if (
                    source === 'xwallet' &&
                    recipientType === 'username' &&
                    tld_ !== 'zlp'
                ) {
                    let _subdomain
                    let didxdomain = tld_
                    if (subdomain && subdomain !== '') {
                        _subdomain = subdomain
                        didxdomain = subdomain
                    }
                    const recipient =
                        await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            tld_,
                            domain_,
                            _subdomain
                        )
                    const domainId =
                        '0x' + (await tyron.Util.default.HashString(domain_))
                    await tyron.SearchBarUtil.default
                        .Resolve(net, resolvedInfo.addr!)
                        .then(async (res: any) => {
                            console.log(
                                'resolved address version',
                                Number(res?.version.slice(8, 11))
                            )

                            const beneficiary_: any =
                                await tyron.Beneficiary.default.generate(
                                    Number(res?.version.slice(8, 11)),
                                    recipient,
                                    domainId,
                                    didxdomain
                                )
                            beneficiary = beneficiary_
                            console.log(
                                'BENEFICIARY_',
                                JSON.stringify(beneficiary, null, 2)
                            )
                        })
                        .catch(async (err) => {
                            console.log('ORIGIN_NOT_DIDxWALLET')
                            const beneficiary_: any =
                                await tyron.Beneficiary.default.generate(
                                    7, //version > 6 means DEFIx too
                                    recipient,
                                    domainId,
                                    didxdomain
                                )
                            beneficiary = beneficiary_
                            console.log(
                                'BENEFICIARY_',
                                JSON.stringify(beneficiary, null, 2)
                            )
                        })
                } else {
                    beneficiary = {
                        constructor:
                            tyron.TyronZil.BeneficiaryConstructor.Recipient,
                        addr: input2,
                    }
                    console.log(
                        'BENEFICIARY_',
                        JSON.stringify(beneficiary, null, 2)
                    )
                }
                try {
                    switch (source) {
                        case 'xwallet':
                            let tx_params: unknown
                            try {
                                let donation_ = donation
                                if (donation_ === null) {
                                    donation_ = 0
                                }
                                const tyron_ =
                                    await tyron.Donation.default.tyron(
                                        donation_
                                    )

                                switch (txID) {
                                    case 'SendFunds':
                                        {
                                            let tag = 'AddFunds'
                                            // if (inputB === 'contract') {
                                            //     tag = 'AddFunds'
                                            // }
                                            tx_params =
                                                await tyron.TyronZil.default.SendFunds(
                                                    resolvedInfo?.addr!,
                                                    tag,
                                                    beneficiary!,
                                                    String(Big(amount)),
                                                    tyron_
                                                )
                                        }
                                        break
                                    default:
                                        tx_params =
                                            await tyron.TyronZil.default.Transfer(
                                                resolvedInfo?.addr!,
                                                currency!.toLowerCase(),
                                                beneficiary!,
                                                String(Big(amount)),
                                                tyron_
                                            )
                                        break
                                }
                            } catch (error) {
                                throw new Error('xWALLET withdrawal error.')
                            }
                            toast.info(
                                `${t('You’re about to transfer')} ${
                                    manualInput
                                        ? transferInput
                                        : showTransferInput
                                } ${currency}`,
                                {
                                    position: 'bottom-center',
                                    autoClose: 6000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 10,
                                }
                            )
                            dispatch(setTxStatusLoading('true'))
                            updateModalTxMinimized(false)
                            updateModalTx(true)
                            let tx = await tyron.Init.default.transaction(net)

                            console.log(
                                'TXN_PARAMS',
                                JSON.stringify(tx_params, null, 2)
                            )
                            await zilpay
                                .call({
                                    contractAddress: resolvedInfo?.addr!,
                                    transition: txID,
                                    params: tx_params as unknown as Record<
                                        string,
                                        unknown
                                    >[],
                                    amount: String(donation),
                                })
                                .then(async (res: any) => {
                                    dispatch(setTxId(res.ID))
                                    dispatch(setTxStatusLoading('submitted'))
                                    tx = await tx.confirm(res.ID, 33)
                                    if (tx.isConfirmed()) {
                                        dispatch(
                                            setTxStatusLoading('confirmed')
                                        )
                                        updateDonation(null)
                                        window.open(
                                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                        )
                                    } else if (tx.isRejected()) {
                                        dispatch(setTxStatusLoading('failed'))
                                    }
                                })
                                .catch((err: any) => {
                                    dispatch(setTxStatusLoading('idle'))
                                    throw new Error(
                                        'Could not withdraw from xWALLET.'
                                    )
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
                                    currency!.toLowerCase()
                                )

                                const tx_params = Array()
                                const tx_to = {
                                    vname: 'to',
                                    type: 'ByStr20',
                                    value: input2,
                                }
                                tx_params.push(tx_to)

                                const amount_ = {
                                    vname: 'amount',
                                    type: 'Uint128',
                                    value: String(amount),
                                }
                                tx_params.push(amount_)

                                if (token_addr !== undefined) {
                                    toast.info(
                                        `${t('You’re about to transfer')} ${
                                            manualInput
                                                ? transferInput
                                                : showTransferInput
                                        } ${currency}`,
                                        {
                                            position: 'bottom-center',
                                            autoClose: 6000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: toastTheme(isLight),
                                            toastId: 11,
                                        }
                                    )
                                    dispatch(setTxStatusLoading('true'))
                                    updateModalTxMinimized(false)
                                    updateModalTx(true)
                                    let tx =
                                        await tyron.Init.default.transaction(
                                            net
                                        )

                                    console.log(
                                        'TXN_PARAMS',
                                        JSON.stringify(tx_params, null, 2)
                                    )
                                    await zilpay
                                        .call({
                                            contractAddress: token_addr,
                                            transition: txID,
                                            params: tx_params,
                                            amount: '0',
                                        })
                                        .then(async (res) => {
                                            dispatch(setTxId(res.ID))
                                            dispatch(
                                                setTxStatusLoading('submitted')
                                            )
                                            tx = await tx.confirm(res.ID, 33)
                                            if (tx.isConfirmed()) {
                                                dispatch(
                                                    setTxStatusLoading(
                                                        'confirmed'
                                                    )
                                                )
                                                updateDonation(null)
                                                setTimeout(() => {
                                                    window.open(
                                                        `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                                    )
                                                }, 1000)
                                            } else if (tx.isRejected()) {
                                                dispatch(
                                                    setTxStatusLoading('failed')
                                                )
                                            }
                                        })
                                        .catch((err) => {
                                            dispatch(
                                                setTxStatusLoading('rejected')
                                            )
                                            updateModalTxMinimized(false)
                                            updateModalTx(true)
                                            throw new Error(
                                                'Could not withdraw from ZilPay.'
                                            )
                                        })
                                } else {
                                    throw new Error(
                                        'Transaction not supported yet.'
                                    )
                                }
                            }
                            break
                    }
                } catch (error) {
                    toast.warn(String(error), {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 7,
                    })
                }
            } catch (error) {
                console.error(error)
            }
        } else {
            toast.warning('Reload contract.', {
                position: 'top-right',
                autoClose: 2222,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 8,
            })
        }
        setLoadingSubmit(false)
    }

    const resolveUser = async () => {
        setLoadingUser(true)
        try {
            const input = input_.replace(/ /g, '')
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
            if (subdomain && subdomain !== '') {
                _subdomain = subdomain
            }
            // @todo-x review if (input.includes('@') && input.includes('.did')) {
            //     setInput(input.replace('.did', '.ssi'))
            // }
            await tyron.SearchBarUtil.default
                .fetchAddr(net, tld, domain, _subdomain)
                .then((addr) => {
                    setResolvedAddr(addr)
                    setTLD(tld)
                    setDomain(domain)
                    setSubdomain(subdomain)
                    setLegend('saved')
                    setHideDonation(false)
                    setHideSubmit(false)
                })
                .catch(() => {
                    throw Error
                })
        } catch (error) {
            toast.warn('Verification unsuccessful.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        }
        setLoadingUser(false)
    }

    const handleInputSearch = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        setHideDonation(true)
        setLegend('continue')
        setInput(value.toLowerCase().replace(/ /g, ''))
    }

    const optionSource = [
        {
            value: 'xwallet',
            label: 'xWALLET',
        },
        {
            value: 'zilpay',
            label: 'ZilPay',
        },
    ]

    // const optionType = [
    //     {
    //         value: '',
    //         label: 'Select type',
    //     },
    //     {
    //         value: 'contract',
    //         label: 'Smart contract',
    //     },
    //     {
    //         value: 'EOA',
    //         label: 'Regular address',
    //     },
    // ]

    const optionRecipient = [
        {
            value: 'username',
            label: t('NFT Username'),
        },
        {
            value: 'addr',
            label: t('Address'),
        },
    ]

    return (
        <>
            <div className={styles.container}>
                <div className={styles.wrapperSelector}>
                    <Selector
                        option={optionSource}
                        onChange={handleOnChange}
                        placeholder={t('Select source')}
                    />
                </div>
            </div>
            {currency !== '' && source !== '' && (
                <>
                    <div className={styles.container}>
                        <code className={styles.txt}>{currency}</code>
                        <input
                            value={
                                manualInput ? transferInput : showTransferInput
                            }
                            className={styles.inputCurrency}
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
                                handleSaveCurrency()
                            }}
                        >
                            <div>
                                {legendCurrency === 'continue' ? (
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
                    <InputPercentage
                        setPercentage={handlePercentage}
                        isMap={false}
                    />
                    {legendCurrency === 'saved' && (
                        <>
                            {/* {currency === 'ZIL' && (
                                <div className={styles.container}>
                                    <div style={{ width: '60%' }}>
                                        <Selector
                                            option={optionType}
                                            onChange={handleOnChangeB}
                                        />
                                    </div>
                                </div>
                            )} */}
                            {source === 'xwallet' && (
                                <div className={styles.container}>
                                    <div className={styles.wrapperSelector}>
                                        <Selector
                                            option={optionRecipient}
                                            onChange={
                                                handleOnChangeRecipientType
                                            }
                                            placeholder={t('SELECT_RECIPIENT')}
                                        />
                                    </div>
                                </div>
                            )}
                            {recipientType === 'username' && (
                                <>
                                    <div className={styles.searchBarWallet}>
                                        <SearchBarWallet
                                            resolveUsername={resolveUser}
                                            handleInput={handleInputSearch}
                                            input={input_}
                                            loading={loadingUser}
                                            saved={legend === 'saved'}
                                        />
                                    </div>
                                    {legend === 'saved' && (
                                        <div className={styles.txtResolvedAddr}>
                                            {/* @review: translate */}
                                            Recipient address:{' '}
                                            <span
                                                style={{
                                                    textTransform: 'lowercase',
                                                }}
                                            >
                                                ...
                                                {zcrypto
                                                    .toBech32Address(
                                                        resolvedAddr
                                                    )
                                                    .slice(-10)}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                            {(source === 'zilpay' && currency !== 'ZIL') ||
                            // (source === 'zilpay' &&
                            //     currency === 'ZIL' &&
                            //     inputB !== '')
                            // ||
                            (source === 'xwallet' &&
                                recipientType === 'addr') ? (
                                <div className={styles.containerInput}>
                                    <div className={styles.wrapperSelector}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder={t(
                                                'Type beneficiary address'
                                            )}
                                            onChange={handleInput2}
                                            onKeyPress={handleOnKeyPress2}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginLeft: '2%',
                                        }}
                                        onClick={() => {
                                            handleSave()
                                        }}
                                    >
                                        <div>
                                            {legend === 'continue' ? (
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
                            ) : (
                                <></>
                            )}
                        </>
                    )}
                </>
            )}
            {!hideDonation &&
                source === 'xwallet' &&
                ((domain_ !== '' && tld_ !== 'default') || input2 !== '') && (
                    <Donate />
                )}
            {!hideSubmit && (donation !== null || source == 'zilliqa') && (
                <div
                    style={{
                        marginTop: '10%',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        onClick={handleSubmit}
                    >
                        {loadingSubmit ? (
                            <ThreeDots color="yellow" />
                        ) : (
                            <>
                                <span>{t('TRANSFER')}&nbsp;</span>
                                <span style={{ textTransform: 'none' }}>
                                    {manualInput
                                        ? transferInput
                                        : showTransferInput}{' '}
                                    {currency}
                                </span>
                            </>
                        )}
                    </div>
                    {currency === 'ZIL' && (
                        <h5 className={styles.gasTxt}>
                            {t('GAS_AROUND')} 2 ZIL
                        </h5>
                    )}
                    {currency !== 'ZIL' && (
                        <h5 className={styles.gasTxt}>
                            {t('GAS_AROUND')} 6 ZIL
                        </h5>
                    )}
                </div>
            )}
        </>
    )
}

export default Component
