import styles from './styles.module.scss'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import React, { useState, useCallback, useRef } from 'react'
import { $net } from '../../../../../src/store/wallet-network'
import { Donate, Selector } from '../../../..'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import {
    updateModalTx,
    $selectedCurrency,
    updateModalWithdrawal,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { setTxStatusLoading, setTxId } from '../../../../../src/app/actions'
import { RootState } from '../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])
    const searchInput = useRef(null)

    const dispatch = useDispatch()
    const net = useStore($net)
    const donation = useStore($donation)
    const resolvedInfo = useSelector(
        (state: RootState) => state.modal.resolvedInfo
    )
    const currency = useStore($selectedCurrency)

    const [source, setSource] = useState('')
    const [input, setInput] = useState(0) // the amount to transfer
    const [recipientType, setRecipientType] = useState('')

    const [username, setUsername] = useState('')
    const [domain, setDomain] = useState('default')
    const [inputB, setInputB] = useState('')
    const [input2, setInput2] = useState('') // the recipient (address)

    const [legend, setLegend] = useState('continue')
    const [button, setButton] = useState('button primary')
    const [hideDonation, setHideDonation] = useState(true)
    const [hideSubmit, setHideSubmit] = useState(true)

    const handleOnChange = (value) => {
        setSource(value)
        setInput(0)
        setUsername('')
        setDomain('default')
        setInputB('')
        setInput2('')
        setRecipientType('')
        setHideDonation(true)
        setHideSubmit(true)
    }

    const handleOnChangeRecipientType = (value) => {
        setUsername('')
        setDomain('default')
        setInput2('')
        updateDonation(null)
        setHideDonation(true)
        setHideSubmit(true)
        setLegend('continue')
        setButton('button primary')
        setRecipientType(value)
    }

    const handleOnChangeB = (value) => {
        setInputB(value)
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHideDonation(true)
        setHideSubmit(true)
        setLegend('continue')
        setButton('button primary')
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        if (!isNaN(input_)) {
            if (input_ === 0) {
                toast.error(t('The amount cannot be zero.'), {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 1,
                })
            } else {
                setInput(input_)
            }
        } else {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 2,
            })
        }
    }

    const handleInput2 = (event: { target: { value: any } }) => {
        setHideDonation(true)
        setHideSubmit(true)
        setLegend('continue')
        setButton('button primary')
        let addr_input = event.target.value
        try {
            addr_input = zcrypto.fromBech32Address(addr_input)
            setInput2(addr_input)
        } catch (error) {
            try {
                addr_input = zcrypto.toChecksumAddress(addr_input)
                setInput2(addr_input)
            } catch {
                toast.error('Wrong address format.', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 3,
                })
            }
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
        if (input === 0) {
            toast.error(t('The amount cannot be zero.'), {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 4,
            })
        } else if (input2 === '') {
            toast.error('The address of the recipient cannot be null.', {
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
        } else {
            if (currency === 'ZIL' && inputB === '') {
                toast.error('Choose the type of recipient.', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 6,
                })
            } else {
                setLegend('saved')
                setButton('button')
                setHideDonation(false)
                setHideSubmit(false)
            }
        }
    }

    const handleSubmit = async () => {
        if (resolvedInfo !== null) {
            const zilpay = new ZilPayBase()
            const _currency = tyron.Currency.default.tyron(currency!, input)
            const txID = _currency.txID
            const amount = _currency.amount

            let beneficiary: tyron.TyronZil.Beneficiary
            if (source === 'DIDxWallet' && recipientType === 'username') {
                await tyron.SearchBarUtil.default
                    .Resolve(net, resolvedInfo.addr!)
                    .then(async (res: any) => {
                        console.log(Number(res?.version.slice(8, 11)))
                        if (Number(res?.version.slice(8, 11)) < 5.6) {
                            const recipient =
                                await tyron.SearchBarUtil.default.fetchAddr(
                                    net,
                                    username,
                                    domain
                                )
                            beneficiary = {
                                constructor:
                                    tyron.TyronZil.BeneficiaryConstructor
                                        .Recipient,
                                addr: recipient,
                            }
                        } else {
                            beneficiary = {
                                constructor:
                                    tyron.TyronZil.BeneficiaryConstructor
                                        .NftUsername,
                                username: username,
                                domain: domain,
                            }
                        }
                    })
                    .catch((err) => {
                        throw err
                    })
            } else {
                beneficiary = {
                    constructor:
                        tyron.TyronZil.BeneficiaryConstructor.Recipient,
                    addr: input2,
                }
            }

            try {
                switch (source) {
                    case 'DIDxWallet':
                        let tx_params: unknown
                        try {
                            let donation_ = donation
                            if (donation_ === null) {
                                donation_ = 0
                            }
                            const tyron_ = await tyron.Donation.default.tyron(
                                donation_
                            )

                            switch (txID) {
                                case 'SendFunds':
                                    {
                                        let tag = ''
                                        if (inputB === 'contract') {
                                            tag = 'AddFunds'
                                        }
                                        tx_params =
                                            await tyron.TyronZil.default.SendFunds(
                                                resolvedInfo.addr,
                                                tag,
                                                beneficiary!,
                                                String(amount),
                                                tyron_
                                            )
                                    }
                                    break
                                default:
                                    tx_params =
                                        await tyron.TyronZil.default.Transfer(
                                            resolvedInfo.addr,
                                            currency!.toLowerCase(),
                                            beneficiary!,
                                            String(amount),
                                            tyron_
                                        )
                                    break
                            }
                        } catch (error) {
                            throw new Error('DIDxWallet withdrawal error.')
                        }
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
                                toastId: 10,
                            }
                        )
                        dispatch(setTxStatusLoading('true'))
                        updateModalTxMinimized(false)
                        updateModalTx(true)
                        let tx = await tyron.Init.default.transaction(net)

                        await zilpay
                            .call({
                                contractAddress: resolvedInfo.addr,
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
                                tx = await tx.confirm(res.ID)
                                if (tx.isConfirmed()) {
                                    dispatch(setTxStatusLoading('confirmed'))
                                    updateDonation(null)
                                    updateModalWithdrawal(false)
                                    window.open(
                                        `https://devex.zilliqa.com/tx/${res.ID
                                        }?network=https%3A%2F%2F${net === 'mainnet' ? '' : 'dev-'
                                        }api.zilliqa.com`
                                    )
                                } else if (tx.isRejected()) {
                                    updateModalWithdrawal(false)
                                    dispatch(setTxStatusLoading('failed'))
                                }
                            })
                            .catch((err: any) => {
                                dispatch(setTxStatusLoading('idle'))
                                throw new Error(
                                    'Could not withdraw from DIDxWallet.'
                                )
                            })
                        break
                    default:
                        {
                            let network =
                                tyron.DidScheme.NetworkNamespace.Mainnet
                            if (net === 'testnet') {
                                network =
                                    tyron.DidScheme.NetworkNamespace.Testnet
                            }
                            const init = new tyron.ZilliqaInit.default(network)
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
                                        toastId: 11,
                                    }
                                )
                                dispatch(setTxStatusLoading('true'))
                                updateModalTxMinimized(false)
                                updateModalTx(true)
                                let tx = await tyron.Init.default.transaction(
                                    net
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
                                        tx = await tx.confirm(res.ID)
                                        if (tx.isConfirmed()) {
                                            dispatch(
                                                setTxStatusLoading('confirmed')
                                            )
                                            updateDonation(null)
                                            updateModalWithdrawal(false)
                                            setTimeout(() => {
                                                window.open(
                                                    `https://devex.zilliqa.com/tx/${res.ID
                                                    }?network=https%3A%2F%2F${net === 'mainnet'
                                                        ? ''
                                                        : 'dev-'
                                                    }api.zilliqa.com`
                                                )
                                            }, 1000)
                                        } else if (tx.isRejected()) {
                                            updateModalWithdrawal(false)
                                            dispatch(
                                                setTxStatusLoading('failed')
                                            )
                                        }
                                    })
                                    .catch((err) => {
                                        dispatch(setTxStatusLoading('rejected'))
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
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 7,
                })
            }
        } else {
            toast.warning('Reload contract.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 8,
            })
        }
    }

    const handleInputUsername = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        setHideDonation(true)
        setLegend('continue')
        setButton('button primary')
        setUsername(value.toLowerCase())
    }

    const handleOnChangeDomain = (value) => {
        updateDonation(null)
        setHideDonation(true)
        setLegend('continue')
        setButton('button primary')
        setDomain(value)
    }

    const handleContinue = () => {
        setLegend('saved')
        setButton('button')
        setHideDonation(false)
        setHideSubmit(false)
    }

    const optionSource = [
        {
            key: '',
            name: 'Select source',
        },
        {
            key: 'DIDxWallet',
            name: t('DIDxWallet'),
        },
        {
            key: 'ZilPay',
            name: 'ZilPay',
        },
    ]

    const optionType = [
        {
            key: '',
            name: 'Select type',
        },
        {
            key: 'contract',
            name: 'Smart contract',
        },
        {
            key: 'EOA',
            name: 'Regular address',
        },
    ]

    const optionRecipient = [
        {
            key: '',
            name: 'Select recipient',
        },
        {
            key: 'username',
            name: 'NFT Username',
        },
        {
            key: 'addr',
            name: 'Address',
        },
    ]

    const optionDomain = [
        {
            key: 'default',
            name: t('Domain'),
        },
        {
            key: '',
            name: 'NFT',
        },
        {
            key: 'did',
            name: '.did',
        },
        {
            key: 'zil',
            name: '.zil',
        },
    ]

    return (
        <div>
            <div className={styles.container}>
                <div style={{ width: '70%' }}>
                    <Selector
                        option={optionSource}
                        onChange={handleOnChange}
                        value={source}
                    />
                </div>
            </div>
            {currency !== '' && source !== '' && (
                <>
                    <div className={styles.container}>
                        <code>{currency}</code>
                        <input
                            ref={callbackRef}
                            style={{ width: '40%' }}
                            type="text"
                            placeholder="Type amount"
                            onChange={handleInput}
                            autoFocus
                        />
                    </div>
                    {currency === 'ZIL' && input !== 0 && (
                        <div className={styles.container}>
                            <div style={{ width: '60%' }}>
                                <Selector
                                    option={optionType}
                                    onChange={handleOnChangeB}
                                    value={setInputB}
                                />
                            </div>
                        </div>
                    )}
                    {source === 'DIDxWallet' && input !== 0 && (
                        <div className={styles.container}>
                            <div style={{ width: '70%' }}>
                                <Selector
                                    option={optionRecipient}
                                    onChange={handleOnChangeRecipientType}
                                    value={recipientType}
                                />
                            </div>
                        </div>
                    )}
                    {recipientType === 'username' && (
                        <div className={styles.container}>
                            <input
                                ref={searchInput}
                                type="text"
                                style={{ width: '40%' }}
                                onChange={handleInputUsername}
                                placeholder="Type username"
                                value={username}
                                autoFocus
                            />
                            <div style={{ width: '30%', marginLeft: '5px' }}>
                                <Selector
                                    option={optionDomain}
                                    onChange={handleOnChangeDomain}
                                    value={domain}
                                />
                            </div>
                            {username !== '' && domain !== 'default' && (
                                <button
                                    onClick={handleContinue}
                                    className={button}
                                >
                                    <p>{legend}</p>
                                </button>
                            )}
                        </div>
                    )}
                    {(source === 'ZilPay' && currency !== 'ZIL') ||
                        (source === 'ZilPay' &&
                            currency === 'ZIL' &&
                            inputB !== '') ||
                        (source === 'DIDxWallet' && recipientType === 'addr') ? (
                        <div className={styles.containerInput}>
                            <input
                                ref={callbackRef}
                                type="text"
                                style={{ width: '100%' }}
                                placeholder="Type beneficiary address"
                                onChange={handleInput2}
                                onKeyPress={handleOnKeyPress2}
                                autoFocus
                            />
                            <input
                                style={{ marginLeft: '2%' }}
                                type="button"
                                className={button}
                                value={legend}
                                onClick={() => {
                                    handleSave()
                                }}
                            />
                        </div>
                    ) : (
                        <></>
                    )}
                </>
            )}
            {!hideDonation &&
                source === 'DIDxWallet' &&
                ((username !== '' && domain !== 'default') ||
                    input2 !== '') && <Donate />}
            {!hideSubmit && (donation !== null || source == 'ZilPay') && (
                <div
                    style={{
                        marginTop: '10%',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <div className="actionBtn" onClick={handleSubmit}>
                        <span>Transfer </span>
                        <span>
                            {input} {currency}
                        </span>
                    </div>
                    {currency === 'ZIL' && (
                        <h5 style={{ marginTop: '3%', color: 'lightgrey' }}>
                            gas around 2 ZIL
                        </h5>
                    )}
                    {currency !== 'ZIL' && (
                        <h5 style={{ marginTop: '3%', color: 'lightgrey' }}>
                            gas around 4-6 ZIL
                        </h5>
                    )}
                </div>
            )}
        </div>
    )
}

export default Component
