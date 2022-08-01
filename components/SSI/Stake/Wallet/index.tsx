import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import styles from './styles.module.scss'
import {
    Donate,
    InputZil,
    SearchBarWallet,
    Selector,
    SSNSelector,
    Spinner,
} from '../../..'
import { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { $donation, updateDonation } from '../../../../src/store/donation'
import PauseIco from '../../../../src/assets/icons/pause.svg'
import UnpauseIco from '../../../../src/assets/icons/unpause.svg'
import ContinueArrow from '../../../../src/assets/icons/continue_arrow.svg'
import DelegateStake from '../../../../src/assets/icons/delegate_stake.svg'
import WithdrawStakeRewards from '../../../../src/assets/icons/withdraw_stake_rewards.svg'
import WithdrawStakeAmount from '../../../../src/assets/icons/withdraw_stake_amount.svg'
import CompleteStakeWithdrawal from '../../../../src/assets/icons/complete_stake_withdrawal.svg'
import RedelegateStake from '../../../../src/assets/icons/redelegate_stake.svg'
import TickIco from '../../../../src/assets/icons/tick_blue.svg'
import CloseIco from '../../../../src/assets/icons/ic_cross.svg'
import defaultCheckmark from '../../../../src/assets/icons/default_checkmark.svg'
import selectedCheckmark from '../../../../src/assets/icons/selected_checkmark.svg'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import { setTxId, setTxStatusLoading } from '../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import smartContract from '../../../../src/utils/smartContract'
import DelegatorSwap from './DelegatorSwap'
import DashboardStake from './Dashboard'

function StakeWallet() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    let contractAddress = resolvedInfo?.addr
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const [active, setActive] = useState('')
    const [legend, setLegend] = useState('CONTINUE')
    const [legend2, setLegend2] = useState('CONTINUE')
    const [input, setInput] = useState(0)
    const [input2, setInput2] = useState(0)
    const [source, setSource] = useState('')
    const [recipient, setRecipient] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [beneficiaryUsername, setBeneficiaryUsername] = useState('')
    const [beneficiaryDomain, setBeneficiaryDomain] = useState('default')
    const [ssn, setSsn] = useState('')
    const [ssn2, setSsn2] = useState('')
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingUser, setLoadingUser] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [currentD, setCurrentD] = useState('')
    const [newD, setNewD] = useState('')
    const [zilBal, setZilBal] = useState([0, 0])
    const [showZil, setShowZil] = useState(false)

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            if (isPaused) {
                if (id === 'unpause') {
                    setActive(id)
                } else {
                    toast.warn('To continue, unpause your Web3 wallet.', {
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
        setInput2(0)
        setLegend2('CONTINUE')
        updateDonation(null)
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        setInput2(input_)
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

    const handleInputAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddress('')
        setLegend2('CONTINUE')
        updateDonation(null)
        setAddress(event.target.value)
    }

    const handleSaveAddress = () => {
        const addr = tyron.Address.default.verification(address)
        if (addr !== '') {
            if (addr === contractAddress) {
                toast.error('The recipient and sender must be different.', {
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
            } else {
                setLegend2('SAVED')
            }
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

    const handleOnKeyPressAddr = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSaveAddress()
        }
    }

    const handleSave = () => {
        if (isNaN(input)) {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 2,
            })
        } else if (input === 0) {
            toast.error(t('The amount cannot be zero.'), {
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
        } else if (input < 10) {
            toast.error(t('Minimum input are 10 ZIL.'), {
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
            setLegend('SAVED')
        }
    }

    const handleSave2 = () => {
        if (isNaN(input2)) {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 2,
            })
        } else if (input2 === 0) {
            toast.error(t('The amount cannot be zero.'), {
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
        } else if (input2 < 10) {
            toast.error(t('Minimum input are 10 ZIL.'), {
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
            if (input2 <= zilBal[1]) {
                setLegend2('SAVED')
            } else {
                toast.error(t('Insufficient balance.'), {
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
            }
        }
    }

    const fetchZilBalance = async () => {
        setLoading(true)
        try {
            const balance = await getSmartContract(
                resolvedInfo?.addr!,
                '_balance'
            )

            const balance_ = balance.result._balance

            const zil_balance = Number(balance_) / 1e12

            const zilpay = new ZilPayBase().zilpay
            const zilPay = await zilpay()
            const blockchain = zilPay.blockchain
            const zilpay_balance = await blockchain.getBalance(
                loginInfo.zilAddr.base16.toLowerCase()
            )
            const zilpay_balance_ =
                Number(zilpay_balance.result!.balance) / 1e12

            let res = [
                Number(zil_balance.toFixed(2)),
                Number(zilpay_balance_.toFixed(2)),
            ]
            setZilBal(res)
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
                toast.error("Input can't be zero", {
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
                setLegend('SAVED')
            }
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
                toastId: 1,
            })
        }
    }

    const handleOnChangeRecipient = (value) => {
        setBeneficiaryDomain('default')
        setLegend2('CONTINUE')
        updateDonation(null)
        setRecipient(value)
    }

    const handleOnChangeUsername = (event: { target: { value: any } }) => {
        setLegend2('CONTINUE')
        setSearchInput(event.target.value)
    }

    const getSsnName = (key: string) => {
        const res = optionSsn.filter((val) => val.key === key)
        return res[0].name
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
        setInput2(0)
        setRecipient('')
        setBeneficiaryUsername('')
        setBeneficiaryDomain('default')
        setSsn('')
        setSsn2('')
        setCurrentD('')
        setNewD('')
        setSource('')
        setSearchInput('')
        setShowZil(false)
    }

    const resolveBeneficiaryUser = async () => {
        setLoadingUser(true)
        const username_ = searchInput.split('.')[0]
        let domain_ = ''
        if (searchInput.includes('.')) {
            domain_ = searchInput.split('.')[1]
        }

        if (username === username_ && domain === domain_) {
            toast.error('The recipient and sender must be different.', {
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
        } else {
            await tyron.SearchBarUtil.default
                .fetchAddr(net, username_, domain_)
                .then((addr) => {
                    setAddress(addr)
                    setBeneficiaryUsername(username_)
                    setBeneficiaryDomain(domain_)
                    setLegend2('SAVED')
                })
                .catch(() => {
                    toast.error('Identity verification unsuccessful.', {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    })
                })
        }
        setLoadingUser(false)
    }

    const fetchPause = async () => {
        setLoading(true)
        getSmartContract(contractAddress!, 'paused')
            .then(async (res) => {
                const paused = res.result.paused.constructor === 'True'
                setIsPaused(paused)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const handleSubmit = async (id: string) => {
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
                value: username,
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
                case 'pause':
                    txID = 'Pause'
                    tx_params.push(tx_username)
                    tx_params.push(tyron__)
                    break
                case 'unpause':
                    txID = 'Unpause'
                    tx_params.push(tx_username)
                    tx_params.push(tyron__)
                    break
                case 'withdrawZil':
                    txID = 'SendFunds'
                    let beneficiary: tyron.TyronZil.Beneficiary
                    if (recipient === 'username') {
                        beneficiary = {
                            constructor:
                                tyron.TyronZil.BeneficiaryConstructor
                                    .NftUsername,
                            username: beneficiaryUsername,
                            domain: beneficiaryDomain,
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
                    const usernameWithdraw = {
                        vname: 'username',
                        type: 'String',
                        value: beneficiaryUsername,
                    }
                    tx_params.push(usernameWithdraw)
                    break
                case 'delegateStake':
                    txID = 'DelegateStake'
                    if (showZil) {
                        donation_ = String(Number(donation) + input2)
                        if (zilBal[1] < Number(donation_)) {
                            throw new Error('Insufficient balance')
                        }
                    }
                    tx_params.push(tx_username)
                    tx_params.push(stakeId)
                    tx_params.push(ssnId)
                    tx_params.push(amount)
                    tx_params.push(tyron__)
                    break
                case 'withdrawStakeRewards':
                    txID = 'WithdrawStakeRewards'
                    if (currentD === 'zilliqa') {
                        let services = await tyron.SearchBarUtil.default
                            .fetchAddr(net, 'init', 'did')
                            .then(async (init_addr) => {
                                return await getSmartContract(
                                    init_addr,
                                    'services'
                                )
                            })
                            .then(async (res) => {
                                const services =
                                    await tyron.SmartUtil.default.intoMap(
                                        res.result.services
                                    )
                                return services
                            })

                        const ssnaddr = services.get(ssn)
                        const ssnAddr = {
                            vname: 'ssnaddr',
                            type: 'ByStr20',
                            value: ssnaddr,
                        }
                        contractAddress = services.get('zilstaking')
                        tx_params.push(ssnAddr)
                    } else {
                        tx_params.push(tx_username)
                        tx_params.push(stakeId)
                        tx_params.push(ssnId)
                        tx_params.push(tyron__)
                    }
                    break
                case 'withdrawStakeAmount':
                    txID = 'WithdrawStakeAmt'
                    tx_params.push(tx_username)
                    tx_params.push(stakeId)
                    tx_params.push(ssnId)
                    tx_params.push(amount)
                    tx_params.push(tyron__)
                    break
                case 'completeStakeWithdrawal':
                    txID = 'CompleteWithdrawal'
                    tx_params.push(tx_username)
                    tx_params.push(stakeId)
                    tx_params.push(tyron__)
                    break
                case 'redelegateStake':
                    txID = 'ReDelegateStake'
                    tx_params.push(tx_username)
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
                    tx = await tx.confirm(res.ID)
                    resetState()
                    if (tx.isConfirmed()) {
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
            toast.error(String(err), {
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

    useEffect(() => {
        fetchPause()
        fetchZilBalance()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const optionSSI = [
        {
            key: '',
            name: 'Select SSI',
        },
        {
            key: 'username',
            name: t('NFT_USERNAME'),
        },
        {
            key: 'address',
            name: t('ADDRESS'),
        },
    ]

    const optionSsn = [
        {
            key: '',
            name: 'Select SSN',
        },
        {
            key: 'ssncex.io',
            name: 'CEX.IO',
        },
        {
            key: 'ssnmoonlet.io',
            name: 'Moonlet.io',
        },
        {
            key: 'ssnatomicwallet',
            name: 'AtomicWallet',
        },
        {
            key: 'ssnbinancestaking',
            name: 'Binance Staking',
        },
        {
            key: 'ssnzillet',
            name: 'Zillet',
        },
        {
            key: 'ssnignitedao',
            name: 'Ignite DAO',
        },
        {
            key: 'ssnvalkyrie2',
            name: 'Valkyrie2',
        },
        {
            key: 'ssnviewblock',
            name: 'ViewBlock',
        },
        {
            key: 'ssnkucoin',
            name: 'KuCoin',
        },
        {
            key: 'ssnzilliqa',
            name: 'Zilliqa',
        },
        {
            key: 'ssnhuobistaking',
            name: 'Huobi Staking',
        },
        {
            key: 'ssnshardpool.io',
            name: 'Shardpool.io',
        },
        {
            key: 'ssnezil.me',
            name: 'Ezil.me',
        },
        {
            key: 'ssnnodamatics.com',
            name: 'Nodamatics.com',
        },
        {
            key: 'ssneverstake.one',
            name: 'Everstake.one',
        },
        {
            key: 'ssnzilliqa2',
            name: 'Zilliqa2',
        },
    ]

    const spinner = <Spinner />

    const optionWallet = [
        {
            key: '',
            name: 'Wallet',
        },
        {
            key: 'tyron',
            name: 'TYRON',
        },
        {
            key: 'zilliqa',
            name: 'Zilliqa',
        },
    ]

    const optionWalletSource = [
        {
            key: '',
            name: 'Select source',
        },
        {
            key: 'tyron',
            name: 'TYRON',
        },
        {
            key: 'zilliqa',
            name: 'Zilliqa',
        },
    ]

    const handleOnChangeCurrentD = (value: any) => {
        updateDonation(null)
        setCurrentD(value)
    }

    return (
        <div className={styles.container}>
            {active !== '' && (
                <div
                    className={styles.closeWrapper}
                    onClick={() => toggleActive('')}
                />
            )}
            <h4 className={styles.title}>ZIL STAKING WALLET</h4>
            {!loading && <DashboardStake balance={zilBal[0]} />}
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
                                                        handleSubmit('unpause')
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        marginTop: '24px',
                                                    }}
                                                    className="actionBtnBlue"
                                                >
                                                    <div
                                                        className={
                                                            styles.txtBtn
                                                        }
                                                    >
                                                        UNPAUSE {username}.
                                                        {domain}
                                                    </div>
                                                </div>
                                                <div className={styles.gasTxt}>
                                                    Cost is less than 1 ZIL
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.cardActiveWrapper}>
                                <div
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
                                </div>
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
                                                        handleSubmit('pause')
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        marginTop: '24px',
                                                    }}
                                                    className="actionBtnBlue"
                                                >
                                                    <div
                                                        className={
                                                            styles.txtBtn
                                                        }
                                                    >
                                                        PAUSE {username}.
                                                        {domain}
                                                    </div>
                                                </div>
                                                <div className={styles.gasTxt}>
                                                    Cost is less than 2 ZIL
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('withdrawalZil')}
                                className={
                                    active === 'withdrawalZil'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>SEND ZIL</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={ContinueArrow}
                                        alt="withdrawal-zil-ico"
                                    />
                                </div>
                            </div>
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
                                    <div
                                        style={{
                                            marginTop: '16px',
                                            width: '100%',
                                        }}
                                    >
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
                                                    option={optionSSI}
                                                    onChange={
                                                        handleOnChangeRecipient
                                                    }
                                                    value={recipient}
                                                />
                                            </div>
                                            {recipient === 'username' ? (
                                                <SearchBarWallet
                                                    resolveUsername={
                                                        resolveBeneficiaryUser
                                                    }
                                                    handleInput={
                                                        handleOnChangeUsername
                                                    }
                                                    input={searchInput}
                                                    loading={loadingUser}
                                                    saved={legend2 === 'SAVED'}
                                                />
                                            ) : recipient === 'address' ? (
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
                                                        autoFocus
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
                                                            className={
                                                                legend2 ===
                                                                'CONTINUE'
                                                                    ? 'continueBtnBlue'
                                                                    : ''
                                                            }
                                                        >
                                                            {legend2 ===
                                                            'CONTINUE' ? (
                                                                <Image
                                                                    src={
                                                                        ContinueArrow
                                                                    }
                                                                    alt="arrow"
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
                                    {legend2 === 'SAVED' ? (
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
                                                        className="actionBtnBlue"
                                                    >
                                                        <div
                                                            className={
                                                                styles.txtBtn
                                                            }
                                                        >
                                                            WITHDRAW {input} ZIL
                                                            from{' '}
                                                            {source === 'tyron'
                                                                ? `${username}.${domain}`
                                                                : 'DID Controller'}
                                                        </div>
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
                                    ) : (
                                        <></>
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
                                        title="Staked Seed Node ID"
                                        value={ssn}
                                    />
                                    {ssn !== '' && (
                                        <div style={{ marginTop: '16px' }}>
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
                                                        style={{
                                                            marginTop: '16px',
                                                        }}
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
                                    {donation !== null && legend === 'SAVED' && (
                                        <>
                                            <div
                                                style={{ width: '100%' }}
                                                onClick={() =>
                                                    handleSubmit(
                                                        'delegateStake'
                                                    )
                                                }
                                                className="actionBtnBlue"
                                            >
                                                <div className={styles.txtBtn}>
                                                    DELEGATE {input} ZIL to{' '}
                                                    {getSsnName(ssn)}
                                                </div>
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
                                        }}
                                    >
                                        <div>
                                            Current Delegator&apos;s wallet
                                        </div>
                                        <Selector
                                            option={optionWallet}
                                            onChange={handleOnChangeCurrentD}
                                            value={currentD}
                                        />
                                    </div>
                                    {currentD !== '' && (
                                        <SSNSelector
                                            onChange={handleOnChangeSsn}
                                            title="Staked Seed Node ID"
                                            value={ssn}
                                        />
                                    )}
                                    {ssn !== '' && (
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
                                                        'withdrawStakeRewards'
                                                    )
                                                }
                                                className="actionBtnBlue"
                                            >
                                                <div className={styles.txtBtn}>
                                                    WITHDRAW REWARDS
                                                </div>
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
                                        value={ssn}
                                    />
                                    {ssn !== '' && (
                                        <div style={{ marginTop: '16px' }}>
                                            <InputZil
                                                onChange={handleInput}
                                                legend={legend}
                                                handleSave={handleSave}
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
                                                className="actionBtnBlue"
                                            >
                                                <div className={styles.txtBtn}>
                                                    WITHDRAW {input} ZIL
                                                    from&nbsp;
                                                    {getSsnName(ssn)}
                                                </div>
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
                                                    marginTop: '24px',
                                                    width: '100%',
                                                }}
                                                className="actionBtnBlue"
                                            >
                                                <div className={styles.txtBtn}>
                                                    COMPLETE WITHDRAWAL
                                                </div>
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
                                        value={ssn}
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
                                                    value={ssn2}
                                                />
                                            </div>
                                            {ssn2 !== '' && (
                                                <>
                                                    <div
                                                        style={{
                                                            marginTop: '16px',
                                                        }}
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
                                                                        className="actionBtnBlue"
                                                                    >
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
                                    <Image
                                        src={ContinueArrow}
                                        alt="delegatorSwap-ico"
                                    />
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
