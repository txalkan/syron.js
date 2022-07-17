import { useStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import { Donate, OriginatorAddress } from '../../..'
import { RootState } from '../../../../src/app/reducers'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../../src/store/originatorAddress'
import { $user } from '../../../../src/store/user'
import styles from './styles.module.scss'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { $donation, updateDonation } from '../../../../src/store/donation'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import { $net } from '../../../../src/store/wallet-network'
import { setTxId, setTxStatusLoading } from '../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'

function StakeAddFunds() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const originator_address = useStore($originatorAddress)
    const user = useStore($user)
    const donation = useStore($donation)
    const net = useStore($net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const [legend, setLegend] = useState('CONTINUE')
    const [button, setButton] = useState('button primary')
    const [input, setInput] = useState(0)
    const [hideDonation, setHideDonation] = useState(true)

    const recipient = resolvedUsername?.addr!

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setHideDonation(true)
        setLegend('CONTINUE')
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
        updateDonation(null)
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
            setLegend('SAVED')
            setButton('button')
            setHideDonation(false)
        }
    }

    const resetOriginator = () => {
        updateOriginatorAddress(null)
        setInput(0)
        setLegend('CONTINUE')
        setButton('button primary')
    }

    const showSubmitBtn = () => {
        if (originator_address?.value === 'zilpay' && legend === 'SAVED') {
            return true
        } else if (
            originator_address?.value !== 'zilpay' &&
            donation !== null &&
            legend === 'SAVED'
        ) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        setInput(0)
        setLegend('CONTINUE')
        setButton('button primary')
        setHideDonation(true)
    }, [originator_address?.value])

    const handleSubmit = async () => {
        try {
            if (originator_address?.value !== null) {
                const zilpay = new ZilPayBase()
                const currency = 'zil'
                const _currency = tyron.Currency.default.tyron(currency, input)
                const txID = _currency.txID
                const amount = _currency.amount

                let tx = await tyron.Init.default.transaction(net)

                dispatch(setTxStatusLoading('true'))
                resetOriginator()
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
                                                    `https://devex.zilliqa.com/tx/${res.ID
                                                    }?network=https%3A%2F%2F${net === 'mainnet'
                                                        ? ''
                                                        : 'dev-'
                                                    }api.zilliqa.com`
                                                )
                                            }, 1000)
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
                                                    dispatch(
                                                        setTxStatusLoading(
                                                            'confirmed'
                                                        )
                                                    )
                                                    setTimeout(() => {
                                                        window.open(
                                                            `https://devex.zilliqa.com/tx/${res.ID
                                                            }?network=https%3A%2F%2F${net ===
                                                                'mainnet'
                                                                ? ''
                                                                : 'dev-'
                                                            }api.zilliqa.com`
                                                        )
                                                    }, 1000)
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
                        await tyron.SearchBarUtil.default
                            .Resolve(net, addr!)
                            .then(async (res: any) => {
                                console.log(Number(res?.version.slice(8, 11)))
                                if (Number(res?.version.slice(8, 11)) < 5.6) {
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
                                        dispatch(
                                            setTxStatusLoading('confirmed')
                                        )
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

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>{t('ADD FUNDS')}</h4>
            {/* <p className={styles.subTitle}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p> */}
            <div className={styles.wrapper}>
                <OriginatorAddress type="AddFundsStake" />
                {originator_address?.value && (
                    <>
                        <div className={styles.addFundsInfo}>
                            <div>About to send funds from:</div>
                            <div>
                                {originator_address?.value === 'zilpay'
                                    ? `${loginInfo.zilAddr?.bech32.slice(
                                        0,
                                        5
                                    )}...${loginInfo.zilAddr?.bech32.slice(
                                        -5
                                    )}`
                                    : originator_address.username !== undefined
                                        ? originator_address?.username
                                        : zcrypto.toBech32Address(
                                            originator_address?.value
                                        )}
                                &nbsp;into&nbsp;
                                <span style={{ color: '#0000FF' }}>
                                    {user?.name}.zil
                                </span>
                            </div>
                        </div>
                        <div className={styles.formAmount}>
                            <code>ZIL</code>
                            <input
                                ref={callbackRef}
                                style={{ width: '50%' }}
                                type="text"
                                placeholder={t('Type amount')}
                                onChange={handleInput}
                                onKeyPress={handleOnKeyPress}
                                autoFocus
                            />
                            <input
                                style={{
                                    marginLeft: '2%',
                                }}
                                type="button"
                                className={button}
                                value={t(legend)}
                                onClick={() => {
                                    handleSave()
                                }}
                            />
                        </div>
                        {!hideDonation &&
                            originator_address?.value !== 'zilpay' && (
                                <div
                                    style={{
                                        marginTop: '-50px',
                                        marginBottom: '-40px',
                                    }}
                                >
                                    <Donate />
                                </div>
                            )}
                        {showSubmitBtn() && (
                            <>
                                <div
                                    onClick={handleSubmit}
                                    style={{ marginTop: '40px', width: '100%' }}
                                    className="actionBtnBlue"
                                >
                                    <div>
                                        TRANSFER {input} ZIL to {user?.name}
                                        .zil
                                    </div>
                                </div>
                                <p className={styles.gasTxt}>
                                    {t('GAS_AROUND')} 1 ZIL
                                </p>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default StakeAddFunds
