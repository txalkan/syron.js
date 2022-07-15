import React, { useState, useCallback, useEffect } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { $donation, updateDonation } from '../../../src/store/donation'
import { $user } from '../../../src/store/user'
import { OriginatorAddress, Donate, Selector } from '../..'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $net, updateNet } from '../../../src/store/wallet-network'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../src/store/originatorAddress'
import {
    setTxStatusLoading,
    setTxId,
    updateLoginInfoZilpay,
} from '../../../src/app/actions'
import { $doc } from '../../../src/store/did-doc'
import { RootState } from '../../../src/app/reducers'
import { $buyInfo, updateBuyInfo } from '../../../src/store/buyInfo'
import {
    updateModalAddFunds,
    updateModalTx,
    $zilpayBalance,
    updateTxType,
    updateModalTxMinimized,
    updateShowZilpay,
    updateModalDashboard,
} from '../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import { updateTxList } from '../../../src/store/transactions'

interface InputType {
    type: string
    coin?: string
}

function Component(props: InputType) {
    const { type, coin } = props
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])
    const zcrypto = tyron.Util.default.Zcrypto()
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const user = useStore($user)
    const username = user?.name
    const domain = user?.domain
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const doc = useStore($doc)
    const donation = useStore($donation)
    const net = useStore($net)
    const buyInfo = useStore($buyInfo)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const originator_address = useStore($originatorAddress)
    const zilpayBalance = useStore($zilpayBalance)

    let coin_: string = ''
    if (coin !== undefined) {
        coin_ = coin
    }

    const [currency, setCurrency] = useState(coin_)
    const [input, setInput] = useState(0) // the amount to transfer
    const [legend, setLegend] = useState(t('CONTINUE'))
    const [button, setButton] = useState('button primary')

    const [hideDonation, setHideDonation] = useState(true)
    const [hideSubmit, setHideSubmit] = useState(true)
    const [isBalanceAvailable, setIsBalanceAvailable] = useState(true)

    let recipient: string
    if (type === 'buy') {
        recipient = loginInfo.address
    } else {
        recipient = resolvedUsername?.addr!
    }

    useEffect(() => {
        if (
            doc?.version.slice(8, 9) === undefined ||
            Number(doc?.version.slice(8, 9)) >= 4 ||
            doc?.version.slice(0, 4) === 'init' ||
            doc?.version.slice(0, 3) === 'dao'
        ) {
            if (currency !== '' && currency !== 'ZIL' && isBalanceAvailable) {
                paymentOptions(currency.toLowerCase(), recipient.toLowerCase())
            }
        } else {
            toast.info(`Feature unavailable. Upgrade ${username}'s SSI.`, {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 6,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            )
            if (cache) {
                updateTxList(JSON.parse(cache))
            }
        } catch (err) {
            toast.error(String(err), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }, [dispatch])

    const paymentOptions = async (id: string, addr: string) => {
        try {
            let network = tyron.DidScheme.NetworkNamespace.Mainnet
            if (net === 'testnet') {
                network = tyron.DidScheme.NetworkNamespace.Testnet
            }
            const init = new tyron.ZilliqaInit.default(network)

            // Fetch token address
            let token_addr: string
            await tyron.SearchBarUtil.default
                .fetchAddr(net, 'init', 'did')
                .then(async (init_addr) => {
                    return await init.API.blockchain.getSmartContractSubState(
                        init_addr,
                        'services'
                    )
                })
                .then(async (get_services) => {
                    return await tyron.SmartUtil.default.intoMap(
                        get_services.result.services
                    )
                })
                .then(async (services) => {
                    // Get token address
                    token_addr = services.get(id)
                    const balances =
                        await init.API.blockchain.getSmartContractSubState(
                            token_addr,
                            'balances'
                        )
                    return await tyron.SmartUtil.default.intoMap(
                        balances.result.balances
                    )
                })
                .then((balances_) => {
                    // Get balance of the logged in address
                    const balance = balances_.get(addr)
                    if (balance !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        updateBuyInfo({
                            recipientOpt: buyInfo?.recipientOpt,
                            anotherAddr: buyInfo?.anotherAddr,
                            currency: currency,
                            currentBalance: balance / _currency.decimals,
                        })
                        let price: number
                        switch (id.toLowerCase()) {
                            case 'xsgd':
                                price = 15
                                break
                            default:
                                price = 10
                                break
                        }
                        if (balance >= price * _currency.decimals) {
                            updateBuyInfo({
                                recipientOpt: buyInfo?.recipientOpt,
                                anotherAddr: buyInfo?.anotherAddr,
                                currency: currency,
                                currentBalance: balance / _currency.decimals,
                                isEnough: true,
                            })
                        }
                    }
                })
                .catch(() => {
                    throw new Error('Not able to fetch balance.')
                })
        } catch (error) {
            setIsBalanceAvailable(false)
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 5,
            })
        }
    }

    const fetchBalance = async () => {
        if (currency !== 'ZIL') {
            updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: buyInfo?.anotherAddr,
                currency: currency,
                currentBalance: 0,
                isEnough: false,
            })
            paymentOptions(currency.toLowerCase(), recipient.toLowerCase())
        }
    }

    const handleOnChange = (value) => {
        setInput(0)
        setHideDonation(true)
        setHideSubmit(true)
        setLegend(t('CONTINUE'))
        setButton('button primary')
        setCurrency(value)
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setHideDonation(true)
        setHideSubmit(true)
        setLegend(t('CONTINUE'))
        setButton('button primary')
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        if (!isNaN(input_)) {
            setInput(input_)
        } else {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
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
        if (input === 0) {
            toast.error(t('The amount cannot be zero.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        } else {
            setLegend(t('SAVED'))
            setButton('button')
            setHideDonation(false)
            setHideSubmit(false)
        }
    }

    const handleSubmit = async () => {
        // @todo-checked add loading/spinner: loading will not show up because tx modal pop up - if we add loading/setState it will cause error "can't perform react state update.."
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
                    case 'zilpay':
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
                                        tx = await tx.confirm(res.ID)
                                        if (tx.isConfirmed()) {
                                            dispatch(
                                                setTxStatusLoading('confirmed')
                                            )
                                            setTimeout(() => {
                                                window.open(
                                                    `https://devex.zilliqa.com/tx/${
                                                        res.ID
                                                    }?network=https%3A%2F%2F${
                                                        net === 'mainnet'
                                                            ? ''
                                                            : 'dev-'
                                                    }api.zilliqa.com`
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
                                    let network =
                                        tyron.DidScheme.NetworkNamespace.Mainnet
                                    if (net === 'testnet') {
                                        network =
                                            tyron.DidScheme.NetworkNamespace
                                                .Testnet
                                    }
                                    const init = new tyron.ZilliqaInit.default(
                                        network
                                    )
                                    const init_addr =
                                        await tyron.SearchBarUtil.default.fetchAddr(
                                            net,
                                            'init',
                                            'did'
                                        )
                                    const services =
                                        await init.API.blockchain.getSmartContractSubState(
                                            init_addr!,
                                            'services'
                                        )
                                    const services_ =
                                        await tyron.SmartUtil.default.intoMap(
                                            services.result.services
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
                                                position: 'top-center',
                                                autoClose: 6000,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: 'dark',
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
                                                tx = await tx.confirm(res.ID)
                                                if (tx.isConfirmed()) {
                                                    fetchBalance().then(() => {
                                                        dispatch(
                                                            setTxStatusLoading(
                                                                'confirmed'
                                                            )
                                                        )
                                                        setTimeout(() => {
                                                            window.open(
                                                                `https://devex.zilliqa.com/tx/${
                                                                    res.ID
                                                                }?network=https%3A%2F%2F${
                                                                    net ===
                                                                    'mainnet'
                                                                        ? ''
                                                                        : 'dev-'
                                                                }api.zilliqa.com`
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
                            await tyron.SearchBarUtil.default
                                .Resolve(net, addr!)
                                .then(async (res: any) => {
                                    console.log(
                                        Number(res?.version.slice(8, 11))
                                    )
                                    if (
                                        Number(res?.version.slice(8, 11)) < 5.6
                                    ) {
                                        beneficiary = {
                                            constructor:
                                                tyron.TyronZil
                                                    .BeneficiaryConstructor
                                                    .Recipient,
                                            addr: recipient,
                                        }
                                    } else {
                                        beneficiary = {
                                            constructor:
                                                tyron.TyronZil
                                                    .BeneficiaryConstructor
                                                    .NftUsername,
                                            username: user?.name,
                                            domain: user?.domain,
                                        }
                                    }
                                })
                                .catch((err) => {
                                    throw err
                                })
                        }
                        if (donation !== null) {
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
                            const _amount = String(donation)

                            toast.info(
                                `${t(
                                    'You’re about to transfer'
                                )} ${input} ${currency}`,
                                {
                                    position: 'top-center',
                                    autoClose: 6000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: 'dark',
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
                                    tx = await tx.confirm(res.ID)
                                    if (tx.isConfirmed()) {
                                        fetchBalance().then(() => {
                                            dispatch(
                                                setTxStatusLoading('confirmed')
                                            )
                                            setTimeout(() => {
                                                window.open(
                                                    `https://devex.zilliqa.com/tx/${
                                                        res.ID
                                                    }?network=https%3A%2F%2F${
                                                        net === 'mainnet'
                                                            ? ''
                                                            : 'dev-'
                                                    }api.zilliqa.com`
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
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 12,
            })
        }
        updateOriginatorAddress(null)
        updateDonation(null)
    }

    const resetOriginator = () => {
        updateOriginatorAddress(null)
        setInput(0)
        setLegend(t('CONTINUE'))
        setButton('button primary')
    }

    const domainCheck = () => {
        if (domain !== '') {
            return `.${domain}`
        } else {
            return ''
        }
    }

    const option = [
        {
            key: '',
            name: t('Select coin'),
        },
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
            key: 'gZIL',
            name: 'gZIL',
        },
        {
            key: 'XSGD',
            name: 'XSGD',
        },
        {
            key: 'zUSDT',
            name: 'zUSDT',
        },
        {
            key: 'XIDR',
            name: 'XIDR',
        },
        {
            key: 'zWBTC',
            name: 'zWBTC',
        },
        {
            key: 'zETH',
            name: 'zETH',
        },
        {
            key: 'XCAD',
            name: 'XCAD',
        },
        {
            key: 'zOPUL',
            name: 'zOPUL',
        },
        {
            key: 'Lunr',
            name: 'Lunr',
        },
        {
            key: 'SWTH',
            name: 'SWTH',
        },
        {
            key: 'FEES',
            name: 'FEES',
        },
        {
            key: 'PORT',
            name: 'PORT',
        },
        {
            key: 'ZWAP',
            name: 'ZWAP',
        },
        {
            key: 'dXCAD',
            name: 'dXCAD',
        },
        {
            key: 'zBRKL',
            name: 'zBRKL',
        },
        {
            key: 'SCO',
            name: 'SCO',
        },
        {
            key: 'CARB',
            name: 'CARB',
        },
        {
            key: 'DMZ',
            name: 'DMZ',
        },
        {
            key: 'Huny',
            name: 'Huny',
        },
        {
            key: 'BLOX',
            name: 'BLOX',
        },
        {
            key: 'STREAM',
            name: 'STREAM',
        },
        {
            key: 'REDC',
            name: 'REDC',
        },
        {
            key: 'HOL',
            name: 'HOL',
        },
        {
            key: 'EVZ',
            name: 'EVZ',
        },
        {
            key: 'ZLP',
            name: 'ZLP',
        },
        {
            key: 'GRPH',
            name: 'GRPH',
        },
        {
            key: 'SHARDS',
            name: 'SHARDS',
        },
        {
            key: 'DUCK',
            name: 'DUCK',
        },
        {
            key: 'GP',
            name: 'GP',
        },
        {
            key: 'GEMZ',
            name: 'GEMZ',
        },
        {
            key: 'Oki',
            name: 'Oki',
        },
        {
            key: 'FRANC',
            name: 'FRANC',
        },
        {
            key: 'ZWALL',
            name: 'ZWALL',
        },
        {
            key: 'PELE',
            name: 'PELE',
        },
        {
            key: 'GARY',
            name: 'GARY',
        },
        {
            key: 'CONSULT',
            name: 'CONSULT',
        },
        {
            key: 'ZAME',
            name: 'ZAME',
        },
        {
            key: 'CONSULT',
            name: 'CONSULT',
        },
        {
            key: 'WALLEX',
            name: 'WALLEX',
        },
        {
            key: 'HODL',
            name: 'HODL',
        },
        {
            key: 'ATHLETE',
            name: 'ATHLETE',
        },
        {
            key: 'MILKY',
            name: 'MILKY',
        },
        {
            key: 'BOLT',
            name: 'BOLT',
        },
        {
            key: 'MAMBO',
            name: 'MAMBO',
        },
        {
            key: 'RECAP',
            name: 'RECAP',
        },
        {
            key: 'ZCH',
            name: 'ZCH',
        },
        {
            key: 'SRV',
            name: 'SRV',
        },
        {
            key: 'NFTDEX',
            name: 'NFTDEX',
        },
        {
            key: 'UNIDEX-V2',
            name: 'UNIDEX-V2',
        },
        {
            key: 'ZILLEX',
            name: 'ZILLEX',
        },
        {
            key: 'ZLF',
            name: 'ZLF',
        },
        {
            key: 'BUTTON',
            name: 'BUTTON',
        },
    ]

    return (
        <>
            {type === 'buy' ? (
                <div>
                    <p style={{ fontSize: '20px', color: 'silver' }}>
                        {t('ADD_FUNDS')}
                    </p>
                    {loginInfo.address !== null && (
                        <p className={styles.addFundsToAddress}>
                            {t('ADD_FUNDS_INTO', {
                                name: loginInfo?.username
                                    ? `${loginInfo?.username}.did`
                                    : `did:tyron:zil...${loginInfo.address.slice(
                                          -10
                                      )}`,
                            })}
                        </p>
                    )}
                    <OriginatorAddress type="" />
                    {originator_address?.value && (
                        <>
                            {originator_address.value === 'zilpay' ? (
                                <div className={styles.originatorInfoWrapper}>
                                    <p className={styles.originatorType}>
                                        {t('ZilPay wallet')}:&nbsp;
                                    </p>
                                    <p className={styles.originatorAddr}>
                                        <a
                                            href={`https://devex.zilliqa.com/address/${
                                                loginInfo.zilAddr?.bech32
                                            }?network=https%3A%2F%2F${
                                                net === 'mainnet' ? '' : 'dev-'
                                            }api.zilliqa.com`}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            {loginInfo.zilAddr?.bech32}
                                        </a>
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {originator_address.username ===
                                        undefined && (
                                        <p style={{ marginBottom: '10%' }}>
                                            {t(
                                                'About to send funds from X into X',
                                                {
                                                    source: `${zcrypto.toBech32Address(
                                                        originator_address?.value
                                                    )}`,
                                                    recipient: '',
                                                }
                                            )}
                                            <span style={{ color: '#ffff32' }}>
                                                {username}
                                                {domainCheck()}{' '}
                                            </span>
                                        </p>
                                    )}
                                </>
                            )}
                            {
                                <>
                                    {currency !== '' &&
                                        originator_address.value !== '' && (
                                            <div
                                                className={styles.fundsWrapper}
                                            >
                                                <code>{currency}</code>
                                                <input
                                                    ref={callbackRef}
                                                    style={{
                                                        width: '100%',
                                                        marginLeft: '2%',
                                                        marginRight: '2%',
                                                    }}
                                                    type="text"
                                                    onChange={handleInput}
                                                    onKeyPress={
                                                        handleOnKeyPress
                                                    }
                                                    autoFocus
                                                />
                                                <input
                                                    type="button"
                                                    className={button}
                                                    value={String(legend)}
                                                    onClick={() => {
                                                        handleSave()
                                                    }}
                                                />
                                            </div>
                                        )}
                                </>
                            }
                        </>
                    )}
                    {!hideDonation &&
                        originator_address?.value !== 'zilpay' && <Donate />}
                    {!hideSubmit &&
                        (donation !== null ||
                            originator_address?.value == 'zilpay') && (
                            <>
                                {input > 0 && (
                                    <>
                                        <div
                                            className={
                                                styles.transferInfoWrapper
                                            }
                                        >
                                            <p className={styles.transferInfo}>
                                                {t('TRANSFER')}:&nbsp;
                                            </p>
                                            <p
                                                className={
                                                    styles.transferInfoYellow
                                                }
                                            >
                                                {input} {currency}&nbsp;
                                            </p>
                                            <p className={styles.transferInfo}>
                                                {t('TO')}&nbsp;
                                            </p>
                                            <p
                                                className={
                                                    styles.transferInfoYellow
                                                }
                                            >
                                                {loginInfo.username
                                                    ? `${loginInfo.username}.did`
                                                    : `did:tyron:zil...${loginInfo.address.slice(
                                                          -10
                                                      )}`}
                                            </p>
                                        </div>
                                        <div
                                            style={{
                                                width: 'fit-content',
                                                marginTop: '10%',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <div
                                                className="actionBtn"
                                                onClick={handleSubmit}
                                            >
                                                {t('PROCEED')}
                                            </div>
                                        </div>
                                        <h5
                                            style={{
                                                marginTop: '3%',
                                                color: 'lightgrey',
                                            }}
                                        >
                                            {t('GAS_AROUND')} 4 -7 ZIL
                                        </h5>
                                    </>
                                )}
                            </>
                        )}
                </div>
            ) : (
                <div className={type !== 'modal' ? styles.wrapperNonBuy : ''}>
                    <h2 className={styles.title}>{t('ADD_FUNDS')}</h2>
                    <>
                        <h4>
                            {t('ADD_FUNDS_INTO', {
                                name: `${username}${domainCheck()}`,
                            })}
                        </h4>
                        <OriginatorAddress type="" />
                        {loginInfo.zilAddr === null && (
                            <div
                                style={{
                                    display: 'flex',
                                    width: '100%',
                                    justifyContent: 'center',
                                    marginTop: '10%',
                                }}
                            >
                                <div
                                    onClick={handleConnect}
                                    className="actionBtn"
                                >
                                    {t('CONNECT')}
                                </div>
                            </div>
                        )}
                        {originator_address?.username && (
                            <p
                                style={{
                                    marginTop: '10%',
                                    marginBottom: '10%',
                                }}
                            >
                                {t('About to send funds from X into X', {
                                    source: `${originator_address?.username}.did`,
                                    recipient: '',
                                })}
                                <span style={{ color: '#ffff32' }}>
                                    {username}
                                    {domainCheck()}{' '}
                                </span>
                            </p>
                        )}
                        {originator_address?.value && (
                            <>
                                {originator_address.value === 'zilpay' ? (
                                    <ul className={styles.walletInfoWrapper}>
                                        <li className={styles.originatorAddr}>
                                            Wallet:{' '}
                                            <a
                                                style={{
                                                    textTransform: 'lowercase',
                                                }}
                                                href={`https://devex.zilliqa.com/address/${
                                                    loginInfo.zilAddr?.bech32
                                                }?network=https%3A%2F%2F${
                                                    net === 'mainnet'
                                                        ? ''
                                                        : 'dev-'
                                                }api.zilliqa.com`}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                {loginInfo.zilAddr?.bech32}
                                            </a>
                                        </li>
                                        {type === 'modal' && (
                                            <li>
                                                Balance:{' '}
                                                <span
                                                    style={{ color: '#dbe4eb' }}
                                                >
                                                    {zilpayBalance} {currency}
                                                </span>
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <>
                                        {originator_address.username ===
                                            undefined && (
                                            <p
                                                className={
                                                    styles.originatorAddr
                                                }
                                            >
                                                {t(
                                                    'About to send funds from X into X',
                                                    {
                                                        source: zcrypto.toBech32Address(
                                                            originator_address?.value
                                                        ),
                                                        recipient: '',
                                                    }
                                                )}
                                                <span
                                                    style={{ color: '#ffff32' }}
                                                >
                                                    {username}
                                                    {domainCheck()}{' '}
                                                </span>
                                            </p>
                                        )}
                                    </>
                                )}
                                {/* {type === "modal" && (
                  <p>
                    Balance:{" "}
                    {loadingBalance ? (
                      <i
                        style={{ color: '#ffff32' }} className="fa fa-lg fa-spin fa-circle-notch"
                        aria-hidden="true"
                      ></i>
                    ) : (
                      `${balance} ${currency}`
                    )}
                  </p>
                )} */}
                                {
                                    <>
                                        <h3 style={{ marginTop: '7%' }}>
                                            {t('ADD_FUNDS_INTO_TITLE')}{' '}
                                            {type === 'buy' ? (
                                                <span
                                                    className={styles.username}
                                                >
                                                    {loginInfo.username
                                                        ? `${loginInfo.username}.did`
                                                        : `did:tyron:zil...${loginInfo.address.slice(
                                                              -10
                                                          )}`}
                                                </span>
                                            ) : (
                                                <span
                                                    className={styles.username}
                                                >
                                                    {username}
                                                    {domainCheck()}
                                                </span>
                                            )}
                                        </h3>
                                        {type !== 'modal' && (
                                            <div className={styles.container}>
                                                <div style={{ width: '70%' }}>
                                                    <Selector
                                                        option={option}
                                                        onChange={
                                                            handleOnChange
                                                        }
                                                        value={currency}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className={styles.container}>
                                            {currency !== '' && (
                                                <>
                                                    <code>{currency}</code>
                                                    <input
                                                        ref={callbackRef}
                                                        style={{ width: '40%' }}
                                                        type="text"
                                                        placeholder={t(
                                                            'Type amount'
                                                        )}
                                                        onChange={handleInput}
                                                        onKeyPress={
                                                            handleOnKeyPress
                                                        }
                                                        autoFocus
                                                    />
                                                    <input
                                                        style={{
                                                            marginLeft: '2%',
                                                        }}
                                                        type="button"
                                                        className={button}
                                                        value={String(legend)}
                                                        onClick={() => {
                                                            handleSave()
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </>
                                }
                            </>
                        )}
                        {!hideDonation &&
                            originator_address?.value !== 'zilpay' && (
                                <Donate />
                            )}
                        {!hideSubmit &&
                            (donation !== null ||
                                originator_address?.value == 'zilpay') && (
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
                                        className="actionBtn"
                                        onClick={handleSubmit}
                                    >
                                        <div>
                                            {t('TRANSFER')}{' '}
                                            <span>
                                                {input} {currency}
                                            </span>{' '}
                                            <span
                                                style={{
                                                    textTransform: 'lowercase',
                                                }}
                                            >
                                                {t('TO')}
                                            </span>{' '}
                                            {type === 'buy' ? (
                                                <span
                                                    style={{
                                                        textTransform:
                                                            'lowercase',
                                                    }}
                                                >
                                                    {loginInfo.username
                                                        ? `${loginInfo.username}.did`
                                                        : `did:tyron:zil...${loginInfo.address.slice(
                                                              -10
                                                          )}`}
                                                </span>
                                            ) : (
                                                <span
                                                    style={{
                                                        textTransform:
                                                            'lowercase',
                                                    }}
                                                >
                                                    {username}
                                                    {domainCheck()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <h5
                                        style={{
                                            marginTop: '3%',
                                            color: 'lightgrey',
                                        }}
                                    >
                                        {currency === 'ZIL' ? (
                                            <p>{t('GAS_AROUND')} 1-2 ZIL</p>
                                        ) : (
                                            <p>{t('GAS_AROUND')} 4-7 ZIL</p>
                                        )}
                                    </h5>
                                </div>
                            )}
                    </>
                </div>
            )}
        </>
    )
}

export default Component
