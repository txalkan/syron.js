import React, { useState, useRef, useEffect } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import styles from './styles.module.scss'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
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
import { Donate } from '../../../../../..'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import controller from '../../../../../../../src/hooks/isController'
import { RootState } from '../../../../../../../src/app/reducers'

function Component() {
    const dispatch = useDispatch()
    const Router = useRouter()
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
    const contract = useSelector((state: RootState) => state.modal.contract)
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
            toast.error('Wrong address.', {
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
        if (contract !== null && donation !== null) {
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
                        ? contract?.addr
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
                        contractAddress: contract.addr,
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
                toast.error(String(error), {
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
            })
        }
    }

    const handleOnChangeSelectedAddress = (event: {
        target: { value: any }
    }) => {
        setAddress('')
        setInputAddr('')
        setSelectedAddress(event.target.value)
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
            toast.error(`Wrong address.`, {
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

    const handleOnChangeUsername = (event: { target: { value: any } }) => {
        setUsernameType(event.target.value)
    }

    const handleOnChangeCurrency = (event: { target: { value: any } }) => {
        updateDonation(null)
        setCurrency(event.target.value)
    }

    const handleInputUsername = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(value.toLowerCase())
    }

    return (
        <div style={{ marginBottom: '14%', textAlign: 'center' }}>
            <button
                onClick={() => {
                    Router.push(`/${user?.name}/did/wallet/nft/manage`)
                }}
                className="button"
                style={{ marginBottom: '50%' }}
            >
                <p>BACK</p>
            </button>
            <h3 style={{ marginBottom: '7%' }}>
                Transfer{' '}
                <span className={styles.username}>
                    {usernameType === 'default'
                        ? user?.name
                        : usernameType === 'input'
                        ? username
                        : ''}
                </span>{' '}
                NFT Username
            </h3>
            <select onChange={handleOnChangeUsername}>
                <option value="">Select Username</option>
                <option value="default">{user?.name}</option>
                <option value="input">Input Username</option>
            </select>
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
                    <h4>recipient</h4>
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
                    <h4>beneficiary did</h4>
                    <select
                        style={{ marginBottom: '5%' }}
                        className={styles.select}
                        onChange={handleOnChangeSelectedAddress}
                        value={selectedAddress}
                    >
                        <option value="">Select DID</option>
                        <option value="SSI">This SSI</option>
                        <option value="RECIPIENT">The recipient</option>
                        <option value="ADDR">Another address</option>
                    </select>
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
                        <p>{legend2}</p>
                    </button>
                </div>
            )}
            {input !== '' &&
                (selectedAddress === 'SSI' ||
                    selectedAddress === 'RECIPIENT' ||
                    (selectedAddress === 'ADDR' && address !== '')) && (
                    <div>
                        <div style={{ marginTop: '14%' }}>
                            <h4>payment</h4>
                            <select onChange={handleOnChangeCurrency}>
                                <option value="">Select Currency</option>
                                <option value="TYRON">15 TYRON</option>
                                <option value="FREE">Free</option>
                            </select>
                        </div>
                        {currency !== '' && <Donate />}
                        {donation !== null && (
                            <div
                                style={{
                                    marginTop: '14%',
                                    textAlign: 'center',
                                }}
                            >
                                <button
                                    className="button secondary"
                                    onClick={handleSubmit}
                                >
                                    <p>
                                        Transfer{' '}
                                        <span className={styles.username}>
                                            {usernameType === 'default'
                                                ? user?.name!
                                                : username}
                                        </span>{' '}
                                        NFT Username
                                    </p>
                                </button>
                                <h5 style={{ marginTop: '3%' }}>
                                    gas around 14 ZIL
                                </h5>
                            </div>
                        )}
                    </div>
                )}
        </div>
    )
}

export default Component
