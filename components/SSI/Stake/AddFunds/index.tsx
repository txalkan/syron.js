import { useStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import Image from 'next/image'
import { ConnectButton, Donate, OriginatorAddress, Spinner } from '../../..'
import { RootState } from '../../../../src/app/reducers'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../../src/store/originatorAddress'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { $donation, updateDonation } from '../../../../src/store/donation'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
import ContinueArrow from '../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../src/assets/icons/tick_blue.svg'
import ArrowDownReg from '../../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import ArrowDownBlack from '../../../../src/assets/icons/dashboard_arrow_down_icon_black.svg'
import ArrowUpReg from '../../../../src/assets/icons/dashboard_arrow_up_icon.svg'
import ArrowUpBlack from '../../../../src/assets/icons/dashboard_arrow_up_icon_black.svg'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import React from 'react'
import toastTheme from '../../../../src/hooks/toastTheme'
import smartContract from '../../../../src/utils/smartContract'

function StakeAddFunds() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const zcrypto = tyron.Util.default.Zcrypto()
    const originator = useStore($originatorAddress)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const ArrowDown = isLight ? ArrowDownBlack : ArrowDownReg
    const ArrowUp = isLight ? ArrowUpBlack : ArrowUpReg
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const [legend, setLegend] = useState('CONTINUE')
    const [input, setInput] = useState(0)
    const [hideDonation, setHideDonation] = useState(true)
    const [toggleInfoZilpay, setToggleInfoZilpay] = useState(false)
    const [loadingInfoBal, setLoadingInfoBal] = useState(false)
    const [infoBal, setInfoBal] = useState(0)

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
            toast.error(t('The input is not a number.'), {
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
        if (input === 0) {
            toast.error(t('The amount cannot be zero.'), {
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

    const resetOriginator = () => {
        updateOriginatorAddress(null)
        setInput(0)
        setLegend('CONTINUE')
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

    const fetchInfoBalance = async (id: string, addr?: string) => {
        let token_addr: string
        try {
            setLoadingInfoBal(true)
            if (id !== 'zil') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                const get_services = await getSmartContract(
                    init_addr,
                    'services'
                )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )
                token_addr = services.get(id)
                const balances = await getSmartContract(token_addr, 'balances')
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )
                try {
                    if (addr) {
                        const balance_didxwallet = balances_.get(
                            addr!.toLowerCase()!
                        )
                        if (balance_didxwallet !== undefined) {
                            const _currency = tyron.Currency.default.tyron(id)
                            const finalBalance =
                                balance_didxwallet / _currency.decimals
                            setInfoBal(Number(finalBalance.toFixed(2)))
                        }
                    } else {
                        const balance_zilpay = balances_.get(
                            loginInfo.zilAddr.base16.toLowerCase()
                        )
                        if (balance_zilpay !== undefined) {
                            const _currency = tyron.Currency.default.tyron(id)
                            const finalBalance =
                                balance_zilpay / _currency.decimals
                            setInfoBal(Number(finalBalance.toFixed(2)))
                        }
                    }
                } catch (error) {
                    setInfoBal(0)
                }
            } else {
                if (addr) {
                    const balance = await getSmartContract(addr!, '_balance')
                    const balance_ = balance.result._balance
                    const zil_balance = Number(balance_) / 1e12
                    setInfoBal(Number(zil_balance.toFixed(2)))
                } else {
                    const zilpay = new ZilPayBase().zilpay
                    const zilPay = await zilpay()
                    const blockchain = zilPay.blockchain
                    const zilliqa_balance = await blockchain.getBalance(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    const zilliqa_balance_ =
                        Number(zilliqa_balance.result!.balance) / 1e12

                    setInfoBal(Number(zilliqa_balance_.toFixed(2)))
                }
            }
            setLoadingInfoBal(false)
        } catch (error) {
            setInfoBal(0)
            setLoadingInfoBal(false)
        }
    }

    useEffect(() => {
        setLegend('CONTINUE')
        setHideDonation(true)
    }, [originator?.value])

    const handleSubmit = async () => {
        try {
            if (originator?.value !== null) {
                const zilpay = new ZilPayBase()
                const currency = 'zil'
                const _currency = tyron.Currency.default.tyron(currency, input)
                const txID = _currency.txID
                const amount = _currency.amount

                let tx = await tyron.Init.default.transaction(net)

                dispatch(setTxStatusLoading('true'))
                // resetOriginator() @todo-x review
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
                                tx = await tx.confirm(res.ID)
                                if (tx.isConfirmed()) {
                                    dispatch(setTxStatusLoading('confirmed'))
                                    setTimeout(() => {
                                        window.open(
                                            `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
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
                        if (originator?.domain === 'did') {
                            await tyron.SearchBarUtil.default
                                .Resolve(net, addr!)
                                .then(async (res: any) => {
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
                                    tyron.TyronZil.BeneficiaryConstructor
                                        .NftUsername,
                                username: username,
                                domain: domain,
                            }
                        }

                        if (donation !== null) {
                            const tyron_ = await tyron.Donation.default.tyron(
                                donation
                            )
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
                                )} ${input} ${currency}`,
                                {
                                    position: 'top-center',
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
                                    tx = await tx.confirm(res.ID)
                                    if (tx.isConfirmed()) {
                                        dispatch(
                                            setTxStatusLoading('confirmed')
                                        )
                                        setTimeout(() => {
                                            window.open(
                                                `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
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
                theme: toastTheme(isLight),
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

            {loginInfo.zilAddr === null ? (
                <ConnectButton />
            ) : (
                <div className={styles.wrapper}>
                    <div className={styles.originatorWrapper}>
                        <OriginatorAddress type="AddFundsStake" />
                    </div>
                    {originator?.value && (
                        <>
                            <div>
                                <div
                                    onClick={() => {
                                        setToggleInfoZilpay(!toggleInfoZilpay)
                                        if (originator.value === 'zilliqa') {
                                            fetchInfoBalance('zil')
                                        } else {
                                            fetchInfoBalance(
                                                'zil',
                                                originator?.value
                                            )
                                        }
                                    }}
                                    className={styles.zilpayWalletInfo}
                                >
                                    <div
                                        className={styles.txt}
                                        style={{ marginRight: '20px' }}
                                    >
                                        {originator.value === 'zilliqa'
                                            ? t('ZilPay wallet')
                                            : 'xWallet'}{' '}
                                        info
                                    </div>
                                    <Image
                                        src={
                                            toggleInfoZilpay
                                                ? ArrowUp
                                                : ArrowDown
                                        }
                                        alt="ico-arrow"
                                    />
                                </div>
                                {toggleInfoZilpay && (
                                    <ul className={styles.walletInfoWrapper}>
                                        {originator?.value !== 'zilliqa' && (
                                            <li className={styles.txt}>
                                                {originator?.username}
                                                {originator?.domain
                                                    ? '@' + originator.domain
                                                    : ''}
                                            </li>
                                        )}
                                        <li className={styles.txt}>
                                            {t('Address')}:{' '}
                                            {originator.value === 'zilliqa' ? (
                                                <a
                                                    style={{
                                                        textTransform:
                                                            'lowercase',
                                                    }}
                                                    href={`https://v2.viewblock.io/zilliqa/address/${loginInfo.zilAddr?.bech32}?network=${net}`}
                                                    rel="noreferrer"
                                                    target="_blank"
                                                >
                                                    {loginInfo.zilAddr?.bech32}
                                                </a>
                                            ) : (
                                                <a
                                                    style={{
                                                        textTransform:
                                                            'lowercase',
                                                    }}
                                                    href={`https://v2.viewblock.io/zilliqa/address/${originator?.value}?network=${net}`}
                                                    rel="noreferrer"
                                                    target="_blank"
                                                >
                                                    {zcrypto?.toBech32Address(
                                                        originator?.value
                                                    )}
                                                </a>
                                            )}
                                        </li>
                                        <li className={styles.txt}>
                                            Balance:{' '}
                                            <span
                                                style={{
                                                    color: isLight
                                                        ? '#000'
                                                        : '#dbe4eb',
                                                }}
                                            >
                                                {loadingInfoBal ? (
                                                    <Spinner />
                                                ) : (
                                                    infoBal
                                                )}{' '}
                                                ZIL
                                            </span>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                    {originator?.value && (
                        <>
                            <div className={styles.formAmount}>
                                <input
                                    ref={callbackRef}
                                    style={{ width: '50%' }}
                                    type="text"
                                    placeholder={t('Type amount')}
                                    onChange={handleInput}
                                    onKeyPress={handleOnKeyPress}
                                    autoFocus
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
                                        className={
                                            legend === 'CONTINUE'
                                                ? 'continueBtnBlue'
                                                : ''
                                        }
                                        onClick={() => {
                                            handleSave()
                                        }}
                                    >
                                        {legend === 'CONTINUE' ? (
                                            <Image
                                                src={ContinueArrow}
                                                alt="arrow"
                                            />
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
                            {!hideDonation && originator?.value !== 'zilliqa' && (
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
                                                {username}@{domain}.did
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
                                            className="actionBtnBlue"
                                        >
                                            <div>TRANSFER {input} ZIL</div>
                                        </div>
                                        <p className={styles.gasTxt}>
                                            {t('GAS_AROUND')} 1 ZIL
                                        </p>
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
