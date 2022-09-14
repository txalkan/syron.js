import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import * as tyron from 'tyron'
import { RootState } from '../../../src/app/reducers'
import { ZilPayBase } from '../../../components/ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'

function TransferSSIDollar({ setBalance, balance$SI, loading, setLoading }) {
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const [amount, setAmount] = useState('')
    const [address, setAdress] = useState('')
    const $SIproxy = '0xc23cA8BE034b27B0d5d80CB08CE0EF10e336865d' // @todo

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
                    contractAddress: $SIproxy,
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
        setBalance(0)
        setLoading(false)
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
                                    amount !== '' ? 'secondary' : 'primary'
                                }`}
                            >
                                <p>{amount !== '' ? 'SAVED' : 'SAVE'}</p>
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
    )
}

export default TransferSSIDollar
