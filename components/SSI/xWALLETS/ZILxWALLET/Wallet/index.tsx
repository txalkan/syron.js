import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import {
    Donate,
    InputZil,
    SearchBarWallet,
    Selector,
    SSNSelector,
    Spinner,
    Arrow,
} from '../../../..'
import { useEffect, useState } from 'react'
import { useStore as effectorStore } from 'effector-react'
import * as tyron from 'tyron'
import {
    $donation,
    $extraZil,
    updateDonation,
    updateExtraZil,
} from '../../../../../src/store/donation'
import PauseIco from '../../../../../src/assets/icons/pause.svg'
import UnpauseIco from '../../../../../src/assets/icons/unpause.svg'
import DelegateStake from '../../../../../src/assets/icons/delegate_stake.svg'
import WithdrawStakeRewards from '../../../../../src/assets/icons/withdraw_stake_rewards.svg'
import WithdrawStakeAmount from '../../../../../src/assets/icons/withdraw_stake_amount.svg'
import CompleteStakeWithdrawal from '../../../../../src/assets/icons/complete_stake_withdrawal.svg'
import RedelegateStake from '../../../../../src/assets/icons/redelegate_stake.svg'
import Swap from '../../../../../src/assets/icons/swap.svg'
import TickIco from '../../../../../src/assets/icons/tick_blue.svg'
import CloseIcoReg from '../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../src/assets/icons/ic_cross_black.svg'
import defaultCheckmark from '../../../../../src/assets/icons/default_checkmark.svg'
import selectedCheckmark from '../../../../../src/assets/icons/selected_checkmark_blue.svg'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import { setTxId, setTxStatusLoading } from '../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
    updateZilpayBalance,
} from '../../../../../src/store/modal'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import smartContract from '../../../../../src/utils/smartContract'
import DelegatorSwap from './DelegatorSwap'
import DashboardStake from './Dashboard'
import toastTheme from '../../../../../src/hooks/toastTheme'
import Pause from '../../../Pause'
import wallet from '../../../../../src/hooks/wallet'
import TransferOwnership from '../../../TransferOwnership'
import ThreeDots from '../../../../Spinner/ThreeDots'
import { $net } from '../../../../../src/store/network'
import { optionMainnet } from '../../../../../src/constants/staking-nodes'
import { useStore } from 'react-stores'

function StakeWallet() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { checkPause } = wallet()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const extraZil = effectorStore($extraZil)
    const resolvedTLD = resolvedInfo?.user_tld
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    let contractAddress = resolvedInfo?.addr
    const donation = effectorStore($donation)
    const v09 =
        parseFloat(resolvedInfo?.version?.slice(-5)!) >= 0.9 ||
        resolvedInfo?.version?.slice(10)! == 'ZILxWALLET'
    const net = $net.state.net as 'mainnet' | 'testnet'

    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const actionBtn = isLight ? 'actionBtnBlueLight' : 'actionBtnBlue'
    const [active, setActive] = useState('')
    const [legend, setLegend] = useState('CONTINUE')
    const [legend2, setLegend2] = useState('CONTINUE')
    const [input, setInput] = useState(0)
    const [recipient, setRecipient] = useState('')
    const [input_, setSearchInput] = useState('')
    const [beneficiaryTLD, setBeneficiaryTLD] = useState('default')
    const [beneficiaryDomain, setBeneficiaryDomain] = useState('')
    const [beneficiarySubdomain, setBeneficiarySubdomain] = useState('')

    const [ssn, setSsn] = useState('')
    const [ssn2, setSsn2] = useState('')
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingUser, setLoadingUser] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [currentD, setCurrentD] = useState('')
    const [zilBal, setZilBal] = useState([0, 0])
    const [showZil, setShowZil] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            if (isPaused) {
                if (id === 'unpause') {
                    setActive(id)
                } else {
                    toast.warn('To continue, unpause your ZILxWALLET', {
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
            } else {
                setActive(id)
            }
        }
    }
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setLegend('CONTINUE')
        updateDonation(null)
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        setInput(input_)
    }
    const handleInput2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateExtraZil(0)
        setLegend2('CONTINUE')
        updateDonation(null)
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        updateExtraZil(input_)
    }
    const handleInputSendZil = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLegend('CONTINUE')
        setLegend2('CONTINUE')
        setRecipient('')
        updateDonation(null)
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        setInput(input_)
    }
    const handleOnChangeRecipient = (value) => {
        setBeneficiaryTLD('')
        setBeneficiaryDomain('')
        setBeneficiarySubdomain('')
        setAddress('')
        setLegend2('CONTINUE')
        updateDonation(null)
        setRecipient(value)
    }
    const handleInputAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLegend2('CONTINUE')
        updateDonation(null)
        setAddress(event.target.value)
    }
    const handleSaveAddress = () => {
        const addr = tyron.Address.default.verification(address)
        if (addr !== '') {
            if (addr === contractAddress) {
                toast.warn('The recipient and sender must be different.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 5,
                })
            } else {
                setAddress(addr)
                setLegend2('SAVED')
            }
        } else {
            toast.warn('Wrong address.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }
    const handleOnKeyPressAddr = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSaveAddress()
        }
    }
    const handleSave = (noMinimum) => {
        if (isNaN(input)) {
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
                toastId: 2,
            })
        } else if (input === 0) {
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
        } else if (!noMinimum && input < 10) {
            const message = t('The minimum input is 10 ZIL.')
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
        }
    }
    const handleSave2 = () => {
        if (isNaN(Number(extraZil))) {
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
                toastId: 2,
            })
        } else if (Number(extraZil) === 0) {
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
        } else if (Number(extraZil) < 10) {
            const message = t('The minimum input is 10 ZIL.')
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
            if (Number(extraZil) <= zilBal[1]) {
                setLegend2('SAVED')
            } else {
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
            }
        }
    }
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const fetchZilBalance = async () => {
        setLoading(true)
        try {
            const balance = await getSmartContract(
                resolvedInfo?.addr!,
                '_balance'
            )

            const balance_ = balance!.result._balance

            const zil_balance = Number(balance_) / 1e12

            const zilpay = new ZilPayBase().zilpay
            const zilPay = await zilpay()
            const blockchain = zilPay.blockchain
            const zilliqa_balance = await blockchain.getBalance(zilpay_addr)
            const zilliqa_balance_ =
                Number(zilliqa_balance.result!.balance) / 1e12

            let res = [
                Number(zil_balance.toFixed(2)),
                Number(zilliqa_balance_.toFixed(2)),
            ]
            setZilBal(res)
            updateZilpayBalance(res[1])
            setLoading(false)
            return res
        } catch (error) {
            let res = [0, 0]
            setLoading(false)
            return res
        }
    }
    const handleSaveSendZil = () => {
        if (!isNaN(input)) {
            if (input === 0) {
                toast.warn("Input can't be zero", {
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
            }
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
    const handleOnChangeUsername = (event: { target: { value: any } }) => {
        setLegend2('CONTINUE')
        setSearchInput(event.target.value)
    }
    const getSsnName = (key: string) => {
        const res = optionMainnet.filter((val) => val.value === key)
        return res[0].label
    }
    const handleOnChangeSsn = (value) => {
        updateDonation(null)
        setLegend('CONTINUE')
        setSsn2('')
        setSsn(value)
    }
    const handleOnChangeSsn2 = (value) => {
        setLegend('CONTINUE')
        setSsn2(value)
    }
    const toggleShowZilInput = () => {
        setShowZil(!showZil)
        setLegend2('CONTINUE')
        updateDonation(null)
    }
    const resetState = () => {
        updateDonation(null)
        setLegend('CONTINUE')
        setLegend2('CONTINUE')
        setInput(0)
        updateExtraZil(0)
        setRecipient('')
        setBeneficiaryTLD('default')
        setBeneficiaryDomain('')
        setBeneficiarySubdomain('')
        setSsn('')
        setSsn2('')
        setCurrentD('')
        setSearchInput('')
        setShowZil(false)
    }
    const resolveBeneficiaryUser = async () => {
        setLoadingUser(true)
        try {
            let input = input_.replace(/ /g, '')
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
            if (
                tld === resolvedTLD &&
                domain === resolvedDomain &&
                subdomain === resolvedSubdomain
            ) {
                toast.warn('The recipient and sender must be different.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 5,
                })
            } else {
                await tyron.SearchBarUtil.default
                    .fetchAddr(net, tld, domain, _subdomain)
                    .then((addr) => {
                        setAddress(addr)
                        setBeneficiaryTLD(tld)
                        setBeneficiaryDomain(domain)
                        setBeneficiarySubdomain(subdomain)
                        setLegend2('SAVED')
                    })
                    .catch(() => {
                        throw Error
                    })
            }
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
    const fetchPause = async () => {
        setLoading(true)
        try {
            const paused = await checkPause(resolvedInfo.addr!)
            setIsPaused(paused)
            setLoading(false)
        } catch {
            setLoading(false)
        }
    }

    const handleSubmit = async (id: string) => {
        setLoadingSubmit(true)
        try {
            const zilpay = new ZilPayBase()
            let tx = await tyron.Init.default.transaction(net)
            let txID
            let tx_params: any = []
            let donation_ = String(donation)

            const tyron_ = await tyron.Donation.default.tyron(donation!)
            const tyron__ = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: tyron_,
            }

            const tx_username = {
                vname: 'username',
                type: 'String',
                value: resolvedDomain,
            }
            if (!v09 && id !== 'withdrawStakeRewards') {
                tx_params.push(tx_username)
            }
            const stakeId = {
                vname: 'stakeID',
                type: 'String',
                value: 'zilstaking',
            }
            const ssnId = {
                vname: 'ssnID',
                type: 'String',
                value: ssn,
            }
            const amount = {
                vname: 'amount',
                type: 'Uint128',
                value: String(input * 1e12),
            }

            switch (id) {
                case 'withdrawZil':
                    txID = 'SendFunds'
                    let beneficiary: tyron.TyronZil.Beneficiary
                    if (recipient === 'tyron') {
                        let didxdomain = beneficiaryTLD
                        if (beneficiarySubdomain !== '') {
                            didxdomain = beneficiarySubdomain
                        }
                        const domainId =
                            '0x' +
                            (await tyron.Util.default.HashString(
                                beneficiaryDomain
                            ))
                        //@review: asap
                        beneficiary = {
                            constructor:
                                tyron.TyronZil.BeneficiaryConstructor
                                    .NftUsername,
                            username: domainId,
                            domain: didxdomain,
                        }
                    } else {
                        beneficiary = {
                            constructor:
                                tyron.TyronZil.BeneficiaryConstructor.Recipient,
                            addr: address,
                        }
                    }
                    tx_params = await tyron.TyronZil.default.SendFunds(
                        contractAddress!,
                        'AddFunds',
                        beneficiary!,
                        String(input * 1e12),
                        tyron_
                    )
                    break
                case 'delegateStake':
                    txID = 'DelegateStake'
                    if (showZil) {
                        donation_ = String(Number(donation) + Number(extraZil))
                    }
                    tx_params.push(stakeId)
                    tx_params.push(ssnId)
                    tx_params.push(amount)
                    tx_params.push(tyron__)
                    break
                case 'withdrawStakeRewards':
                    txID = 'WithdrawStakeRewards'
                    if (currentD === 'zilliqa') {
                        let services = await tyron.SearchBarUtil.default
                            .fetchAddr(net, 'did', 'init')
                            .then(async (init_addr) => {
                                return await getSmartContract(
                                    init_addr,
                                    'services'
                                )
                            })
                            .then(async (res) => {
                                const services = res!.result.services
                                return services
                            })
                            .catch((err) => {
                                console.error('@zilxwallet:', err)
                            })
                        const ssnaddr = services[ssn]
                        const ssnAddr = {
                            vname: 'ssnaddr',
                            type: 'ByStr20',
                            value: ssnaddr.toLowerCase(), //zcrypto.toChecksumAddress(ssnaddr),
                        }
                        tx_params.push(ssnAddr)
                        contractAddress = services['zilstaking'].toLowerCase()
                        donation_ = String(0)
                    } else {
                        if (!v09) {
                            tx_params.push(tx_username)
                        }
                        tx_params.push(stakeId)
                        tx_params.push(ssnId)
                        tx_params.push(tyron__)
                    }
                    break
                case 'withdrawStakeAmount':
                    txID = 'WithdrawStakeAmt'
                    tx_params.push(stakeId)
                    tx_params.push(ssnId)
                    tx_params.push(amount)
                    tx_params.push(tyron__)
                    break
                case 'completeStakeWithdrawal':
                    txID = 'CompleteWithdrawal'
                    tx_params.push(stakeId)
                    tx_params.push(tyron__)
                    break
                case 'redelegateStake':
                    txID = 'ReDelegateStake'
                    tx_params.push(stakeId)
                    tx_params.push(ssnId)
                    tx_params.push(amount)
                    tx_params.push(tyron__)
                    const tossnId = {
                        vname: 'tossnID',
                        type: 'String',
                        value: ssn2,
                    }
                    tx_params.push(tossnId)
                    break
            }

            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            await zilpay
                .call({
                    contractAddress: contractAddress!,
                    transition: txID,
                    params: tx_params as unknown as Record<string, unknown>[],
                    amount: donation_,
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    tx = await tx.confirm(res.ID, 33)
                    resetState()
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
                    dispatch(setTxStatusLoading('rejected'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    throw err
                })
        } catch (err) {
            toast.warn(String(err), {
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
        setLoadingSubmit(false)
    }
    const handleOnChangeCurrentD = (value: any) => {
        updateDonation(null)
        setCurrentD(value)
    }

    useEffect(() => {
        fetchPause()
        fetchZilBalance()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const spinner = <Spinner />
    const optionWallet = [
        {
            value: 'tyron',
            label: 'NFT Domain Name',
        },
        {
            value: 'zilliqa',
            label: 'Zilliqa address',
        },
    ]
    const optionWallet2 = [
        {
            value: 'tyron',
            label: 'xWallet',
        },
        {
            value: 'zilliqa',
            label: 'ZilPay',
        },
    ]

    return (
        <div className={styles.container}>
            {active !== '' && (
                <div
                    className={styles.closeWrapper}
                    onClick={() => toggleActive('')}
                />
            )}
            <h4 className={styles.title}>STAKING xWALLET</h4>
            {!loading && <DashboardStake balance={zilBal} />}
            <div className={styles.cardWrapper}>
                {loading ? (
                    spinner
                ) : (
                    <>
                        {isPaused ? (
                            <div className={styles.cardActiveWrapper}>
                                <div
                                    onClick={() => toggleActive('unpause')}
                                    className={styles.cardActive}
                                >
                                    <div>UNPAUSE</div>
                                    <div className={styles.icoWrapper}>
                                        <Image
                                            src={UnpauseIco}
                                            alt="unpause-ico"
                                        />
                                    </div>
                                </div>
                                {active === 'unpause' && (
                                    <div className={styles.cardRight}>
                                        <div className={styles.closeIcoWrapper}>
                                            <div
                                                onClick={() => toggleActive('')}
                                                className={styles.closeIco}
                                            >
                                                <Image
                                                    width={10}
                                                    src={CloseIco}
                                                    alt="close-ico"
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.wrapperPause}>
                                            <Pause
                                                pause={false}
                                                xwallet="zil"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // PAUSE, TRANSFER OWNERSHIP & SEND ZIL

                            <div className={styles.cardActiveWrapper}>
                                {/*<div
                                    onClick={() => toggleActive('pause')}
                                    className={
                                        active === 'pause'
                                            ? styles.cardActive
                                            : styles.card
                                    }
                                >
                                    <div>PAUSE</div>
                                    <div className={styles.icoWrapper}>
                                        <Image src={PauseIco} alt="pause-ico" />
                                    </div>
                                </div>*/}
                                {active === 'pause' && (
                                    <div className={styles.cardRight}>
                                        <div className={styles.closeIcoWrapper}>
                                            <div
                                                onClick={() => toggleActive('')}
                                                className={styles.closeIco}
                                            >
                                                <Image
                                                    width={10}
                                                    src={CloseIco}
                                                    alt="close-ico"
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.wrapperPause}>
                                            <Pause pause={true} xwallet="zil" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={styles.cardActiveWrapper}>
                            {/*<div
                                onClick={() =>
                                    toggleActive('transferOwnership')
                                }
                                className={
                                    active === 'transferOwnership'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>TRANSFER OWNERSHIP</div>
                                <div className={styles.icoWrapper}>
                                    <Arrow />
                                </div>
                            </div>*/}
                            {active === 'transferOwnership' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ width: '100%' }}>
                                        <TransferOwnership />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            {/* <div
                                onClick={() => toggleActive('withdrawalZil')}
                                className={
                                    active === 'withdrawalZil'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>SEND ZIL</div>
                                <div className={styles.icoWrapper}>
                                    <Arrow />
                                </div>
                            </div>*/}
                            {active === 'withdrawalZil' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputZil}>
                                        <InputZil
                                            onChange={handleInputSendZil}
                                            legend={legend}
                                            handleSave={handleSaveSendZil}
                                        />
                                    </div>
                                    {legend === 'SAVED' && (
                                        <>
                                            <div
                                                style={{
                                                    marginTop: '16px',
                                                    width: '100%',
                                                }}
                                            >
                                                <Selector
                                                    option={optionWallet}
                                                    onChange={
                                                        handleOnChangeRecipient
                                                    }
                                                    placeholder="Address"
                                                />
                                            </div>
                                            {recipient === 'tyron' ? (
                                                <SearchBarWallet
                                                    resolveUsername={
                                                        resolveBeneficiaryUser
                                                    }
                                                    handleInput={
                                                        handleOnChangeUsername
                                                    }
                                                    input={input_}
                                                    loading={loadingUser}
                                                    saved={legend2 === 'SAVED'}
                                                />
                                            ) : recipient === 'zilliqa' ? (
                                                <div
                                                    style={{
                                                        marginTop: '16px',
                                                        width: '100%',
                                                        justifyContent:
                                                            'space-between',
                                                    }}
                                                    className={
                                                        styles.formAmount
                                                    }
                                                >
                                                    <input
                                                        style={{
                                                            width: '70%',
                                                        }}
                                                        type="text"
                                                        placeholder={t(
                                                            'Type address'
                                                        )}
                                                        onChange={
                                                            handleInputAddress
                                                        }
                                                        onKeyPress={
                                                            handleOnKeyPressAddr
                                                        }
                                                    />
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <div
                                                            onClick={
                                                                handleSaveAddress
                                                            }
                                                        >
                                                            {legend2 ===
                                                            'CONTINUE' ? (
                                                                <Arrow
                                                                    isBlue={
                                                                        true
                                                                    }
                                                                />
                                                            ) : (
                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            '5px',
                                                                    }}
                                                                >
                                                                    <Image
                                                                        width={
                                                                            40
                                                                        }
                                                                        src={
                                                                            TickIco
                                                                        }
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
                                    {legend2 === 'SAVED' && (
                                        <>
                                            <Donate />
                                            {donation !== null && (
                                                <>
                                                    <div
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                        onClick={() =>
                                                            handleSubmit(
                                                                'withdrawZil'
                                                            )
                                                        }
                                                        className={actionBtn}
                                                    >
                                                        {loadingSubmit ? (
                                                            <ThreeDots color="basic" />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    styles.txtBtn
                                                                }
                                                            >
                                                                WITHDRAW {input}{' '}
                                                                ZIL
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.gasTxt
                                                        }
                                                    >
                                                        {t('GAS_AROUND')} 3 ZIL
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('delegateStake')}
                                className={
                                    active === 'delegateStake'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>DELEGATE STAKE</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={DelegateStake}
                                        alt="delegate-stake-ico"
                                    />
                                </div>
                            </div>
                            {active === 'delegateStake' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <SSNSelector
                                        onChange={handleOnChangeSsn}
                                        title="Node"
                                        // value={ssn}
                                    />
                                    {ssn !== '' && (
                                        <div className={styles.inputZil}>
                                            <InputZil
                                                onChange={handleInput}
                                                legend={legend}
                                                handleSave={handleSave}
                                            />
                                        </div>
                                    )}
                                    {legend === 'SAVED' && (
                                        <>
                                            <div className={styles.extraZil}>
                                                <div
                                                    onClick={toggleShowZilInput}
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Image
                                                        src={
                                                            showZil
                                                                ? selectedCheckmark
                                                                : defaultCheckmark
                                                        }
                                                        alt="arrow"
                                                    />
                                                </div>
                                                <div>
                                                    &nbsp;Add ZIL from DID
                                                    Controller
                                                </div>
                                            </div>
                                            {showZil ? (
                                                <>
                                                    <div
                                                        className={
                                                            styles.inputZil
                                                        }
                                                    >
                                                        <InputZil
                                                            onChange={
                                                                handleInput2
                                                            }
                                                            legend={legend2}
                                                            handleSave={
                                                                handleSave2
                                                            }
                                                        />
                                                    </div>
                                                    {legend2 === 'SAVED' && (
                                                        <Donate />
                                                    )}
                                                </>
                                            ) : (
                                                <Donate />
                                            )}
                                        </>
                                    )}
                                    {donation !== null &&
                                        legend === 'SAVED' && (
                                            <>
                                                <div
                                                    style={{ width: '100%' }}
                                                    onClick={() =>
                                                        handleSubmit(
                                                            'delegateStake'
                                                        )
                                                    }
                                                    className={actionBtn}
                                                >
                                                    {loadingSubmit ? (
                                                        <ThreeDots color="basic" />
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.txtBtn
                                                            }
                                                        >
                                                            DELEGATE {input} ZIL
                                                            to {getSsnName(ssn)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.gasTxt}>
                                                    {t('GAS_AROUND')} 1-2 ZIL
                                                </div>
                                            </>
                                        )}
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() =>
                                    toggleActive('withdrawStakeRewards')
                                }
                                className={
                                    active === 'withdrawStakeRewards'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>GET REWARDS</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={WithdrawStakeRewards}
                                        alt="withdrwa-stake-ico"
                                    />
                                </div>
                            </div>
                            {active === 'withdrawStakeRewards' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            width: '100%',
                                            marginBottom: '20px',
                                            marginTop: '16px',
                                        }}
                                    >
                                        <div className={styles.titleComponent}>
                                            Current Delegator&apos;s wallet
                                        </div>
                                        <Selector
                                            option={optionWallet2}
                                            onChange={handleOnChangeCurrentD}
                                            placeholder={t('Select wallet')}
                                        />
                                    </div>
                                    {currentD !== '' && (
                                        <SSNSelector
                                            onChange={handleOnChangeSsn}
                                            title="Staked Seed Node ID"
                                            // value={ssn}
                                        />
                                    )}
                                    {ssn !== '' && currentD !== 'zilliqa' && (
                                        <div>
                                            <Donate />
                                        </div>
                                    )}
                                    {donation !== null ||
                                    (currentD === 'zilliqa' && ssn !== '') ? (
                                        <>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    marginTop: '40px',
                                                }}
                                                onClick={() =>
                                                    handleSubmit(
                                                        'withdrawStakeRewards'
                                                    )
                                                }
                                                className={actionBtn}
                                            >
                                                {loadingSubmit ? (
                                                    <ThreeDots color="basic" />
                                                ) : (
                                                    <div
                                                        className={
                                                            styles.txtBtn
                                                        }
                                                    >
                                                        WITHDRAW REWARDS
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.gasTxt}>
                                                {t('GAS_AROUND')} 1-2 ZIL
                                            </div>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() =>
                                    toggleActive('withdrawStakeAmount')
                                }
                                className={
                                    active === 'withdrawStakeAmount'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>WITHDRAW STAKE</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={WithdrawStakeAmount}
                                        alt="withdraw-stake-amount-ico"
                                    />
                                </div>
                            </div>
                            {active === 'withdrawStakeAmount' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <SSNSelector
                                        onChange={handleOnChangeSsn}
                                        title="Staked Seed Node ID"
                                        // value={ssn}
                                    />
                                    {ssn !== '' && (
                                        <div className={styles.inputZil}>
                                            <InputZil
                                                onChange={handleInput}
                                                legend={legend}
                                                handleSave={() =>
                                                    handleSave(true)
                                                }
                                            />
                                        </div>
                                    )}
                                    {legend === 'SAVED' && (
                                        <div>
                                            <Donate />
                                        </div>
                                    )}
                                    {donation !== null && (
                                        <>
                                            <div
                                                style={{ width: '100%' }}
                                                onClick={() =>
                                                    handleSubmit(
                                                        'withdrawStakeAmount'
                                                    )
                                                }
                                                className={actionBtn}
                                            >
                                                {loadingSubmit ? (
                                                    <ThreeDots color="basic" />
                                                ) : (
                                                    <div
                                                        className={
                                                            styles.txtBtn
                                                        }
                                                    >
                                                        WITHDRAW {input} ZIL
                                                        from&nbsp;
                                                        {getSsnName(ssn)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.gasTxt}>
                                                {t('GAS_AROUND')} 1-2 ZIL
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() =>
                                    toggleActive('completeStakeWithdrawal')
                                }
                                className={
                                    active === 'completeStakeWithdrawal'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>COMPLETE STAKE WITHDRAWAL</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={CompleteStakeWithdrawal}
                                        alt="completeStakeWithdrawal-ico"
                                    />
                                </div>
                            </div>
                            {active === 'completeStakeWithdrawal' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: '-12%',
                                            marginBottom: '-12%',
                                        }}
                                    >
                                        <Donate />
                                    </div>
                                    {donation !== null && (
                                        <>
                                            <div
                                                onClick={() =>
                                                    handleSubmit(
                                                        'completeStakeWithdrawal'
                                                    )
                                                }
                                                style={{
                                                    marginTop: '40px',
                                                    width: '100%',
                                                }}
                                                className={actionBtn}
                                            >
                                                {loadingSubmit ? (
                                                    <ThreeDots color="basic" />
                                                ) : (
                                                    <div
                                                        className={
                                                            styles.txtBtn
                                                        }
                                                    >
                                                        COMPLETE WITHDRAWAL
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.gasTxt}>
                                                {t('GAS_AROUND')} 1-2 ZIL
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('redelegateStake')}
                                className={
                                    active === 'redelegateStake'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>REDELEGATE STAKE</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={RedelegateStake}
                                        alt="redelegateStake-ico"
                                    />
                                </div>
                            </div>
                            {active === 'redelegateStake' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <SSNSelector
                                        onChange={handleOnChangeSsn}
                                        title="Current Staked Seed Node ID"
                                        // value={ssn}
                                    />
                                    {ssn !== '' && (
                                        <>
                                            <div
                                                style={{
                                                    marginTop: '16px',
                                                    width: '100%',
                                                }}
                                            >
                                                <SSNSelector
                                                    onChange={
                                                        handleOnChangeSsn2
                                                    }
                                                    title="New Staked Seed Node ID"
                                                    // value={ssn2}
                                                />
                                            </div>
                                            {ssn2 !== '' && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.inputZil
                                                        }
                                                    >
                                                        <InputZil
                                                            onChange={
                                                                handleInput
                                                            }
                                                            legend={legend}
                                                            handleSave={
                                                                handleSave
                                                            }
                                                        />
                                                    </div>
                                                    {legend === 'SAVED' && (
                                                        <>
                                                            <Donate />
                                                            {donation !==
                                                                null && (
                                                                <>
                                                                    <div
                                                                        onClick={() =>
                                                                            handleSubmit(
                                                                                'redelegateStake'
                                                                            )
                                                                        }
                                                                        style={{
                                                                            marginTop:
                                                                                '24px',
                                                                            width: '100%',
                                                                        }}
                                                                        className={
                                                                            actionBtn
                                                                        }
                                                                    >
                                                                        {loadingSubmit ? (
                                                                            <ThreeDots color="basic" />
                                                                        ) : (
                                                                            <div
                                                                                className={
                                                                                    styles.txtBtn
                                                                                }
                                                                            >
                                                                                REDELEGATE{' '}
                                                                                {
                                                                                    input
                                                                                }{' '}
                                                                                ZIL
                                                                                from{' '}
                                                                                {getSsnName(
                                                                                    ssn
                                                                                )}{' '}
                                                                                to{' '}
                                                                                {getSsnName(
                                                                                    ssn2
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div
                                                                        className={
                                                                            styles.gasTxt
                                                                        }
                                                                    >
                                                                        {t(
                                                                            'GAS_AROUND'
                                                                        )}{' '}
                                                                        1-2 ZIL
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('delegatorSwap')}
                                className={
                                    active === 'delegatorSwap'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>DELEGATOR SWAP</div>
                                <div className={styles.icoWrapper}>
                                    <Image src={Swap} alt="delegatorSwap-ico" />
                                </div>
                            </div>
                        </div>
                        {active === 'delegatorSwap' && (
                            <div>
                                <DelegatorSwap />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default StakeWallet
