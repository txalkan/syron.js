import { useStore as effectorStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import Image from 'next/image'
import {
    Arrow,
    ConnectButton,
    Donate,
    OriginatorAddress,
    Spinner,
    WalletInfo,
} from '../../../..'
import { RootState } from '../../../../../src/app/reducers'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../../../src/store/originatorAddress'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import TickIco from '../../../../../src/assets/icons/tick_blue.svg'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import React from 'react'
import toastTheme from '../../../../../src/hooks/toastTheme'
import wallet from '../../../../../src/hooks/wallet'
import ThreeDots from '../../../../Spinner/ThreeDots'
import { $net } from '../../../../../src/store/network'
import { useStore } from 'react-stores'

function StakeAddFunds() {
    const { t } = useTranslation()
    const { checkBalance } = wallet()
    const dispatch = useDispatch()
    const originator = effectorStore($originatorAddress)
    const donation = effectorStore($donation)
    const net = $net.state.net as 'mainnet' | 'testnet'

    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const resolvedTLD = resolvedInfo?.user_tld

    const [legend, setLegend] = useState('CONTINUE')
    const [input, setInput] = useState(0)
    const [hideDonation, setHideDonation] = useState(true)
    const [loadingInfoBal, setLoadingInfoBal] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const recipient = resolvedInfo?.addr!

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setHideDonation(true)
        setLegend('CONTINUE')
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        if (!isNaN(input_)) {
            setInput(input_)
        } else {
            const message = t('The input is not a number.')
            toast.warn(message, {
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
        const isEnough = await checkBalance('zil', input, setLoadingInfoBal)
        if (input === 0) {
            const message = t('The amount cannot be zero.')
            toast.warn(message, {
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
        } else if (!isEnough) {
            const message = t('Insufficient balance.')
            toast.warn(message, {
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
        } else {
            setLegend('SAVED')
            setHideDonation(false)
        }
    }

    const showSubmitBtn = () => {
        if (originator?.value === 'zilliqa' && legend === 'SAVED') {
            return true
        } else if (
            originator?.value !== 'zilliqa' &&
            donation !== null &&
            legend === 'SAVED'
        ) {
            return true
        } else {
            return false
        }
    }

    useEffect(() => {
        setLegend('CONTINUE')
        setHideDonation(true)
    }, [originator?.value])

    const handleSubmit = async () => {
        setLoadingSubmit(true)
        try {
            if (originator?.value !== null) {
                const zilpay = new ZilPayBase()
                const currency = 'zil'
                const _currency = tyron.Currency.default.tyron(currency, input)
                const txID = _currency.txID
                const amount = _currency.amount

                let tx = await tyron.Init.default.transaction(net)

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                switch (originator?.value!) {
                    case 'zilliqa':
                        await zilpay
                            .call({
                                contractAddress: recipient,
                                transition: 'AddFunds',
                                params: [],
                                amount: String(input),
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
                                } else if (tx.isRejected()) {
                                    dispatch(setTxStatusLoading('failed'))
                                }
                            })
                            .catch((err) => {
                                throw err
                            })
                    default: {
                        const addr = originator?.value
                        let beneficiary: tyron.TyronZil.Beneficiary
                        let didxdomain = resolvedTLD
                        if (resolvedSubdomain !== '') {
                            didxdomain = resolvedSubdomain
                        }
                        const domainId =
                            '0x' +
                            (await tyron.Util.default.HashString(
                                resolvedDomain!
                            ))
                        if (originator?.domain === 'did') {
                            await tyron.SearchBarUtil.default
                                .Resolve(net, addr!)
                                .then(async (res: any) => {
                                    const beneficiary_: any =
                                        await tyron.Beneficiary.default.generate(
                                            Number(res?.version.slice(8, 11)),
                                            recipient,
                                            domainId,
                                            didxdomain
                                        )
                                    beneficiary = beneficiary_
                                })
                                .catch((err) => {
                                    throw err
                                })
                        } else {
                            beneficiary = {
                                constructor:
                                    tyron.TyronZil.BeneficiaryConstructor
                                        .NftUsername,
                                username: domainId,
                                domain: didxdomain,
                            }
                        }

                        if (donation !== null) {
                            const tyron_ =
                                await tyron.Donation.default.tyron(donation)
                            const tx_params =
                                await tyron.TyronZil.default.SendFunds(
                                    addr!,
                                    'AddFunds',
                                    beneficiary!,
                                    String(amount),
                                    tyron_
                                )
                            const _amount = String(donation)

                            toast.info(
                                `${t(
                                    'You’re about to transfer'
                                )} $${currency} ${input}`,
                                {
                                    position: 'bottom-center',
                                    autoClose: 6000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                }
                            )
                            await zilpay
                                .call({
                                    contractAddress: originator?.value!,
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
                                        dispatch(
                                            setTxStatusLoading('confirmed')
                                        )
                                        setTimeout(() => {
                                            window.open(
                                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
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
            toast.warn(String(error), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 12,
            })
        }
        updateOriginatorAddress(null)
        updateDonation(null)
        setLoadingSubmit(false)
    }

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>{t('ADD FUNDS')}</h4>
            {/* <div className={styles.subTitle}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div> */}

            {loginInfo.zilAddr === null ? (
                <ConnectButton />
            ) : (
                <div className={styles.wrapper}>
                    <div className={styles.originatorWrapper}>
                        <OriginatorAddress />
                    </div>
                    {originator?.value && (
                        <div className={styles.walletInfo}>
                            <WalletInfo currency="ZIL" />
                        </div>
                    )}
                    {originator?.value && (
                        <>
                            <div className={styles.formAmount}>
                                <input
                                    style={{ width: '50%' }}
                                    type="text"
                                    placeholder={t('Type amount')}
                                    onChange={handleInput}
                                    onKeyPress={handleOnKeyPress}
                                    className={styles.input}
                                />
                                <code className={styles.txt}>ZIL</code>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginLeft: '5%',
                                    }}
                                >
                                    <div
                                        onClick={() => {
                                            if (legend === 'CONTINUE') {
                                                handleSave()
                                            }
                                        }}
                                    >
                                        {loadingInfoBal ? (
                                            <Spinner />
                                        ) : legend === 'CONTINUE' ? (
                                            <Arrow isBlue={true} />
                                        ) : (
                                            <div style={{ marginTop: '5px' }}>
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
                            {!hideDonation &&
                                originator?.value !== 'zilliqa' && (
                                    <div className={styles.donateWrapper}>
                                        <Donate />
                                    </div>
                                )}
                            {showSubmitBtn() && (
                                <>
                                    <div className={styles.addFundsInfo}>
                                        <div className={styles.txt}>
                                            Send funds into&nbsp;
                                            <span
                                                style={{
                                                    color: isLight
                                                        ? '#000'
                                                        : '#dbe4eb',
                                                }}
                                            >
                                                {resolvedSubdomain}@
                                                {resolvedDomain}.${resolvedTLD}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: '40px',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <div
                                            onClick={handleSubmit}
                                            className={
                                                isLight
                                                    ? 'actionBtnBlueLight'
                                                    : 'actionBtnBlue'
                                            }
                                        >
                                            {loadingSubmit ? (
                                                <ThreeDots color="yellow" />
                                            ) : (
                                                <div>TRANSFER {input} ZIL</div>
                                            )}
                                        </div>
                                        <div className={styles.gasTxt}>
                                            {t('GAS_AROUND')} 1 ZIL
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default StakeAddFunds
