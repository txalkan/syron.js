import React, { useState, useRef, useEffect } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import styles from './styles.module.scss'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import { $user } from '../../../../../../../src/store/user'
import { $net } from '../../../../../../../src/store/wallet-network'
import { $doc } from '../../../../../../../src/store/did-doc'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import {
    setTxStatusLoading,
    setTxId,
} from '../../../../../../../src/app/actions'
import { Donate, Selector } from '../../../../../..'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import controller from '../../../../../../../src/hooks/isController'
import { RootState } from '../../../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const searchInput = useRef(null)
    const { isController } = controller()
    function handleFocus() {
        if (searchInput !== null && searchInput.current !== null) {
            const si = searchInput.current as any
            si.focus()
        }
    }

    useEffect(() => {
        isController()
        // current property is refered to input element
        handleFocus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const user = $user.getState()
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const doc = useStore($doc)
    const net = useStore($net)
    const donation = useStore($donation)

    const [input, setInput] = useState('') // the recipient (address)
    const [legend, setLegend] = useState('save')
    const [button, setButton] = useState('button primary')

    const [inputAddr, setInputAddr] = useState('')
    const [address, setAddress] = useState('')
    const [legend2, setLegend2] = useState('save')
    const [selectedAddress, setSelectedAddress] = useState('')
    const [usernameType, setUsernameType] = useState('')
    const [username, setUsername] = useState('')
    const [currency, setCurrency] = useState('')

    const handleSave = async () => {
        setLegend('saved')
        setButton('button')
    }
    const handleInput = (event: { target: { value: any } }) => {
        setInput('')
        setSelectedAddress('')
        setInputAddr('')
        setAddress('')
        updateDonation(null)
        setLegend('save')
        setButton('button primary')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
            setInput(addr)
            handleSave()
        } else {
            toast.error(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
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
    const handleOnKeyPress = async ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleSubmit = async () => {
        if (resolvedUsername !== null && donation !== null) {
            try {
                const zilpay = new ZilPayBase()
                let txID = 'TransferNftUsername'
                if (Number(doc?.version.slice(8, 9)) < 5) {
                    txID = 'TransferNFTUsername'
                }

                const tx_username =
                    usernameType === 'default' ? user?.name! : username
                const guardianship = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'ByStr20',
                    input
                )
                const tx_did =
                    selectedAddress === 'SSI'
                        ? resolvedUsername?.addr
                        : selectedAddress === 'ADDR'
                        ? address
                        : input
                const tyron_ = await tyron.Donation.default.tyron(donation!)

                const params = await tyron.TyronZil.default.TransferNftUsername(
                    tx_username,
                    guardianship,
                    currency.toLowerCase(),
                    input,
                    tx_did,
                    tyron_,
                    doc?.version
                )

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                await zilpay
                    .call({
                        contractAddress: resolvedUsername.addr,
                        transition: txID,
                        params: params as unknown as Record<string, unknown>[],
                        amount: String(donation),
                    })
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        try {
                            tx = await tx.confirm(res.ID)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://devex.zilliqa.com/tx/${
                                        res.ID
                                    }?network=https%3A%2F%2F${
                                        net === 'mainnet' ? '' : 'dev-'
                                    }api.zilliqa.com`
                                )
                                updateDonation(null)
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                            }
                        } catch (err) {
                            updateModalTx(false)
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
                    })
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
        } else {
            toast.error('some data is missing.', {
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
    }

    const handleOnChangeSelectedAddress = (value) => {
        setAddress('')
        setInputAddr('')
        setSelectedAddress(value)
    }

    const handleInputAddr = (event: { target: { value: any } }) => {
        setAddress('')
        setLegend2('save')
        setInputAddr(event.target.value)
    }

    const handleOnKeyPress2 = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            validateInputAddr()
        }
    }

    const validateInputAddr = () => {
        const addr = tyron.Address.default.verification(inputAddr)
        if (addr !== '') {
            setAddress(addr)
            setLegend2('saved')
        } else {
            toast.error(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
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

    const handleOnChangeUsername = (value) => {
        setUsernameType(value)
    }

    const handleOnChangeCurrency = (value) => {
        updateDonation(null)
        setCurrency(value)
    }

    const handleInputUsername = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(value.toLowerCase())
    }

    const optionUsername = [
        {
            key: '',
            name: t('Select Username'),
        },
        {
            key: 'default',
            name: user?.name,
        },
        {
            key: 'input',
            name: t('Input Username'),
        },
    ]

    const optionBeneficiary = [
        {
            key: '',
            name: t('Select DID'),
        },
        {
            key: 'SSI',
            name: t('This SSI'),
        },
        {
            key: 'RECIPIENT',
            name: t('The recipient'),
        },
        {
            key: 'ADDR',
            name: t('Another address'),
        },
    ]

    const optionCurrency = [
        {
            key: '',
            name: t('Select Currency'),
        },
        {
            key: 'TYRON',
            name: '15 TYRON',
        },
        {
            key: 'FREE',
            name: t('FREE'),
        },
    ]

    return (
        <div style={{ marginBottom: '14%', textAlign: 'center' }}>
            <h3 style={{ color: '#ffff32', marginBottom: '10%' }}>
                {t('TRANSFER')}{' '}
                <span className={styles.username}>
                    {usernameType === 'default'
                        ? user?.name
                        : usernameType === 'input'
                        ? username
                        : ''}
                </span>{' '}
                {t('NFT Username')}
            </h3>
            <div>
                <Selector
                    option={optionUsername}
                    onChange={handleOnChangeUsername}
                    value={usernameType}
                />
            </div>
            {usernameType === 'input' && (
                <div className={styles.container}>
                    <input
                        ref={searchInput}
                        type="text"
                        style={{ width: '50%' }}
                        onChange={handleInputUsername}
                        placeholder="Type username"
                        value={username}
                        autoFocus
                    />
                </div>
            )}
            {usernameType !== '' && (
                <div style={{ marginTop: '14%' }}>
                    <h4>{t('RECIPIENT')}</h4>
                    <p className={styles.containerInput}>
                        <input
                            ref={searchInput}
                            type="text"
                            style={{ width: '100%', marginLeft: '2%' }}
                            placeholder="Type address"
                            onChange={handleInput}
                            onKeyPress={handleOnKeyPress}
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
                    </p>
                </div>
            )}
            {input !== '' && (
                <div style={{ marginTop: '14%' }}>
                    <h4>{t('BENEFICIARY DID')}</h4>
                    <div style={{ marginBottom: '5%' }}>
                        <Selector
                            option={optionBeneficiary}
                            onChange={handleOnChangeSelectedAddress}
                            value={selectedAddress}
                        />
                    </div>
                </div>
            )}
            {selectedAddress === 'ADDR' && (
                <div className={styles.wrapperInputAddr}>
                    <input
                        type="text"
                        style={{ marginRight: '3%' }}
                        onChange={handleInputAddr}
                        onKeyPress={handleOnKeyPress2}
                        placeholder="Type address"
                        autoFocus
                    />
                    <button
                        onClick={validateInputAddr}
                        className={
                            legend2 === 'save'
                                ? 'button primary'
                                : 'button secondary'
                        }
                    >
                        <p>{t(legend2)}</p>
                    </button>
                </div>
            )}
            {input !== '' &&
                (selectedAddress === 'SSI' ||
                    selectedAddress === 'RECIPIENT' ||
                    (selectedAddress === 'ADDR' && address !== '')) && (
                    <div>
                        <div style={{ marginTop: '14%' }}>
                            <h4>{t('PAYMENT')}</h4>
                            <div>
                                <Selector
                                    option={optionCurrency}
                                    onChange={handleOnChangeCurrency}
                                    value={currency}
                                />
                            </div>
                        </div>
                        {currency !== '' && <Donate />}
                        {donation !== null && (
                            <div
                                style={{
                                    marginTop: '14%',
                                    textAlign: 'center',
                                }}
                            >
                                <div
                                    className="actionBtn"
                                    onClick={handleSubmit}
                                >
                                    <div>
                                        {t('TRANSFER')}{' '}
                                        <span className={styles.username}>
                                            {usernameType === 'default'
                                                ? user?.name!
                                                : username}
                                        </span>{' '}
                                        {t('NFT Username')}
                                    </div>
                                </div>
                                <h5 style={{ marginTop: '3%' }}>
                                    {t('GAS_AROUND')} 14 ZIL
                                </h5>
                            </div>
                        )}
                    </div>
                )}
        </div>
    )
}

export default Component
