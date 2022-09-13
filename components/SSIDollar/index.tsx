import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import * as tyron from 'tyron'
import { RootState } from '../../src/app/reducers'
import { ZilPayBase } from '../../components/ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { setTxId, setTxStatusLoading } from '../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../src/store/modal'

function Home() {
    const dispatch = useDispatch()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const net = useSelector((state: RootState) => state.modal.net)
    const [currency, setCurrency] = useState('')
    const [balance, setBalance] = useState(0)
    const [balance$SI, setBalance$SI] = useState(0)
    const [loading, setLoading] = useState(false)
    const [section, setSection] = useState('')
    const [amount, setAmount] = useState('')
    const [address, setAdress] = useState('')
    const $SIAddr = '0xc23cA8BE034b27B0d5d80CB08CE0EF10e336865d' // @todo

    const handleOnChangeCurrency = (event: { target: { value: any } }) => {
        const value = event.target.value
        setCurrency(value)
        fetchBalance(value.toLowerCase())
    }

    const handleOnChange = (event: { target: { value: any; name: any } }) => {
        if (event.target.name === 'amount') {
            if (isNaN(event.target.value)) {
                toast.error('Please input a valid number', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 1,
                })
            } else {
                setAmount(event.target.value)
            }
        } else {
            setAdress('')
            setAmount('')
            const addr = tyron.Address.default.verification(event.target.value)
            if (addr !== '') {
                setAdress(addr)
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
    }

    const fetchBalance = async (id: string) => {
        setLoading(true)
        let token_addr: string
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        try {
            if (id === '$si') {
                const balances =
                    await init.API.blockchain.getSmartContractSubState(
                        $SIAddr,
                        'balances'
                    )
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )
                try {
                    const balance_zilpay = balances_.get(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (balance_zilpay !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance = balance_zilpay / _currency.decimals
                        setBalance$SI(Number(finalBalance.toFixed(2)))
                    }
                } catch (error) {
                    setBalance$SI(0)
                }
            } else if (id !== 'zil') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                const get_services =
                    await init.API.blockchain.getSmartContractSubState(
                        init_addr,
                        'services'
                    )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )
                token_addr = services.get(id)
                const balances =
                    await init.API.blockchain.getSmartContractSubState(
                        token_addr,
                        'balances'
                    )
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )
                try {
                    const balance_zilpay = balances_.get(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (balance_zilpay !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance = balance_zilpay / 1e12 //_currency.decimals @todo only for testnet
                        setBalance(Number(finalBalance.toFixed(2)))
                    }
                } catch (error) {
                    setBalance(0)
                }
            } else {
                const zilpay = new ZilPayBase().zilpay
                const zilPay = await zilpay()
                const blockchain = zilPay.blockchain
                const zilpay_balance = await blockchain.getBalance(
                    loginInfo.zilAddr.base16.toLowerCase()
                )
                const zilpay_balance_ =
                    Number(zilpay_balance.result!.balance) / 1e12

                setBalance(Number(zilpay_balance_.toFixed(2)))
            }
        } catch (error) {
            setBalance(0)
        }
        setLoading(false)
    }

    const handleSubmitMint = async () => {
        setLoading(true)
        const zilpay = new ZilPayBase()
        const tx_params: any[] = []
        const addrName = {
            vname: 'addrName',
            type: 'String',
            value: currency.toLowerCase(),
        }
        tx_params.push(addrName)
        const amount_ = {
            vname: 'amount',
            type: 'Uint128',
            value: String(Number(amount) * 1e12),
        }
        tx_params.push(amount_)

        let tx = await tyron.Init.default.transaction(net)

        dispatch(setTxStatusLoading('true'))
        resetState()
        updateModalTxMinimized(false)
        updateModalTx(true)

        switch (currency) {
            case 'zUSDT':
                const tx_params_: any[] = []
                const spender = {
                    vname: 'spender',
                    type: 'ByStr20',
                    value: '0xf930df14b7ce8c133c40f53f5db39cae4a27fac7', // @todo the $SI impl
                }
                tx_params_.push(spender)
                tx_params_.push(amount_)
                try {
                    await zilpay
                        .call({
                            contractAddress:
                                '0x53934bdad86b8ba4df24cc6c5fe3ff35a6bd5fee', // zUSDT proxy
                            transition: 'IncreaseAllowance',
                            params: tx_params_ as unknown as Record<
                                string,
                                unknown
                            >[],
                            amount: '0',
                        })
                        .then(async () => {
                            setTimeout(async () => {
                                await zilpay
                                    .call({
                                        contractAddress: $SIAddr,
                                        transition: 'Mint',
                                        params: tx_params as unknown as Record<
                                            string,
                                            unknown
                                        >[],
                                        amount: '0',
                                    })
                                    .then(async (res) => {
                                        dispatch(setTxId(res.ID))
                                        dispatch(
                                            setTxStatusLoading('submitted')
                                        )
                                        tx = await tx.confirm(res.ID)
                                        if (tx.isConfirmed()) {
                                            setLoading(false)
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
                                        }
                                    })
                                    .catch((err) => {
                                        throw err
                                    })
                            }, 6000)
                        })
                        .catch((err) => {
                            throw err
                        })
                } catch (error) {
                    setLoading(false)
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
                        toastId: 12,
                    })
                }
                break

            default:
                try {
                    await zilpay
                        .call({
                            contractAddress: $SIAddr,
                            transition: 'Mint',
                            params: tx_params as unknown as Record<
                                string,
                                unknown
                            >[],
                            amount: amount,
                        })
                        .then(async (res) => {
                            dispatch(setTxId(res.ID))
                            dispatch(setTxStatusLoading('submitted'))
                            tx = await tx.confirm(res.ID)
                            if (tx.isConfirmed()) {
                                setLoading(false)
                                dispatch(setTxStatusLoading('confirmed'))
                                setTimeout(() => {
                                    window.open(
                                        `https://devex.zilliqa.com/tx/${
                                            res.ID
                                        }?network=https%3A%2F%2F${
                                            net === 'mainnet' ? '' : 'dev-'
                                        }api.zilliqa.com`
                                    )
                                }, 1000)
                            }
                        })
                        .catch((err) => {
                            throw err
                        })
                } catch (error) {
                    setLoading(false)
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
                        toastId: 12,
                    })
                }
                break
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        const zilpay = new ZilPayBase()
        const tx_params = await tyron.TyronZil.default.AddFunds(
            address,
            String(Number(amount) * 1e12)
        )
        let tx = await tyron.Init.default.transaction(net)

        dispatch(setTxStatusLoading('true'))
        resetState()
        updateModalTxMinimized(false)
        updateModalTx(true)
        try {
            await zilpay
                .call({
                    contractAddress: $SIAddr,
                    transition: 'Transfer',
                    params: tx_params as unknown as Record<string, unknown>[],
                    amount: '0',
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    tx = await tx.confirm(res.ID)
                    if (tx.isConfirmed()) {
                        setLoading(false)
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://devex.zilliqa.com/tx/${
                                    res.ID
                                }?network=https%3A%2F%2F${
                                    net === 'mainnet' ? '' : 'dev-'
                                }api.zilliqa.com`
                            )
                        }, 1000)
                    }
                })
                .catch((err) => {
                    throw err
                })
        } catch (error) {
            setLoading(false)
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
                toastId: 12,
            })
        }
    }

    const resetState = () => {
        setCurrency('')
        setBalance(0)
        setLoading(false)
        setSection('')
        setAmount('')
        setAdress('')
    }

    const spinner = (
        <i
            style={{ color: '#ffff32' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            {section === '' && (
                <div className={styles.wrapper}>
                    <div
                        style={{
                            marginTop: '3%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <h2>
                                <div
                                    onClick={() => {
                                        if (loginInfo.zilAddr) {
                                            fetchBalance('$si')
                                            setSection('currency')
                                        } else {
                                            toast.error('Connect ZilPay', {
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
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <p className={styles.cardTitle3}>
                                                GET $SI
                                            </p>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <p className={styles.cardTitle2}>
                                                $SI Vault
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                            <h2 style={{ marginLeft: '20px' }}>
                                <div
                                    onClick={() => {
                                        if (loginInfo.zilAddr) {
                                            fetchBalance('$si')
                                            setSection('transfer')
                                        } else {
                                            toast.error('Connect ZilPay', {
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
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <p className={styles.cardTitle3}>
                                                TRANSFER $SI
                                            </p>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <p className={styles.cardTitle2}>
                                                TRANSFER FUNDS
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                        </div>
                    </div>
                    <div
                        style={{
                            marginTop: '3%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <h2 style={{ marginLeft: '20px' }}>
                                <div
                                    onClick={() => {
                                        if (loginInfo.zilAddr) {
                                            fetchBalance('$si')
                                            fetchBalance('zil')
                                            setSection('unlock')
                                        } else {
                                            toast.error('Connect ZilPay', {
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
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <p className={styles.cardTitle3}>
                                                UNLOCK ZIL
                                            </p>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <p className={styles.cardTitle2}>
                                                UNLOCK ZIL
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                        </div>
                    </div>
                </div>
            )}
            {section !== '' && (
                <button
                    className="button"
                    onClick={() => {
                        setSection('')
                        setCurrency('')
                    }}
                >
                    <span>BACK</span>
                </button>
            )}
            {section === 'currency' && (
                <div className={styles.contentWrapper}>
                    {loading ? (
                        spinner
                    ) : (
                        <div>
                            <select
                                value={currency}
                                onChange={handleOnChangeCurrency}
                            >
                                <option value="">Select Currency</option>
                                <option value="ZIL">ZIL</option>
                                <option value="zUSDT">zUSDT</option>
                            </select>
                            <div
                                style={{
                                    marginTop: '20px',
                                    marginLeft: '15px',
                                }}
                            >
                                $SI Balance: {balance$SI} $SI
                            </div>
                            {currency !== '' && (
                                <div
                                    style={{
                                        marginTop: '5px',
                                        marginLeft: '15px',
                                    }}
                                >
                                    {currency} Balance: {balance} {currency}
                                </div>
                            )}
                            {currency !== '' && (
                                <div
                                    style={{
                                        display: 'flex',
                                        marginTop: '20%',
                                    }}
                                >
                                    <input
                                        name="amount"
                                        type="text"
                                        className={styles.inputBox}
                                        onChange={handleOnChange}
                                        placeholder={`Type amount of ${currency}`}
                                        autoFocus
                                    />
                                    <button
                                        style={{ marginLeft: '3%' }}
                                        onClick={handleSubmitMint}
                                        className={'button primary'}
                                    >
                                        <p>Submit</p>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {section === 'transfer' && (
                <div className={styles.contentWrapper}>
                    {loading ? (
                        spinner
                    ) : (
                        <>
                            <div style={{ marginTop: '20%' }}>
                                Balance: {balance$SI} $SI
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    marginTop: '10%',
                                    width: '100%',
                                }}
                            >
                                <input
                                    name="address"
                                    type="text"
                                    className={styles.inputBox}
                                    onChange={handleOnChange}
                                    placeholder="Type the recipient's address"
                                    autoFocus
                                />
                                <button
                                    style={{ marginLeft: '3%' }}
                                    className={`button ${
                                        address !== '' ? 'secondary' : 'primary'
                                    }`}
                                >
                                    <p>{address !== '' ? 'SAVED' : 'SAVE'}</p>
                                </button>
                            </div>
                            {address !== '' && (
                                <div
                                    style={{
                                        display: 'flex',
                                        marginTop: '10%',
                                    }}
                                >
                                    <input
                                        name="amount"
                                        type="text"
                                        className={styles.inputBox}
                                        onChange={handleOnChange}
                                        placeholder="Type the amount of $SI"
                                        autoFocus
                                    />
                                    <button
                                        style={{ marginLeft: '3%' }}
                                        className={`button ${
                                            amount !== ''
                                                ? 'secondary'
                                                : 'primary'
                                        }`}
                                    >
                                        <p>
                                            {amount !== '' ? 'SAVED' : 'SAVE'}
                                        </p>
                                    </button>
                                </div>
                            )}
                            {amount !== '' && (
                                <div
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        display: 'flex',
                                        marginTop: '20%',
                                    }}
                                >
                                    <button
                                        onClick={handleSubmit}
                                        className="button secondary"
                                    >
                                        <span>TRANSFER {amount} $SI</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
            {section === 'unlock' && (
                <div className={styles.contentWrapper}>
                    {loading ? (
                        spinner
                    ) : (
                        <>
                            <div style={{ marginTop: '20%' }}>
                                $SI Balance: {balance$SI} $SI
                            </div>
                            <div style={{ marginTop: '5%' }}>
                                ZIL Balance: {balance} ZIL
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    marginTop: '10%',
                                }}
                            >
                                <input
                                    name="amount"
                                    type="text"
                                    className={styles.inputBox}
                                    onChange={handleOnChange}
                                    placeholder="Type the amount of $SI"
                                    autoFocus
                                />
                                <button
                                    style={{ marginLeft: '3%' }}
                                    className={`button ${
                                        amount !== '' ? 'secondary' : 'primary'
                                    }`}
                                >
                                    <p>SUBMIT</p>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Home
