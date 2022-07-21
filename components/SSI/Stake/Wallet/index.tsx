import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import styles from './styles.module.scss'
import {
    Donate,
    InputZil,
    OriginatorSelector,
    Selector,
    SSNSelector,
} from '../../..'
import { useCallback, useEffect, useState } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { $user } from '../../../../src/store/user'
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
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import { setTxId, setTxStatusLoading } from '../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
import controller from '../../../../src/hooks/isController'

function StakeWallet() {
    const { t } = useTranslation()
    const { isController } = controller()
    const dispatch = useDispatch()
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const user = useStore($user)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const [active, setActive] = useState('')
    const [legend, setLegend] = useState('CONTINUE')
    const [legend2, setLegend2] = useState('CONTINUE')
    const [input, setInput] = useState(0)
    const [recipient, setRecipient] = useState('')
    const [username, setUsername] = useState('')
    const [domain, setDomain] = useState('default')
    const [ssn, setSsn] = useState('')
    const [ssn2, setSsn2] = useState('')
    const [originator, setOriginator] = useState<any>(null)
    const [originator2, setOriginator2] = useState<any>(null)
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            if (isPaused) {
                if (id === 'unpause') {
                    setActive(id)
                } else {
                    toast.error('To continue, unpause your Web3 wallet.', {
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
            if (addr === resolvedUsername.addr) {
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

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
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

    const handleSave2 = () => {
        setLegend2('SAVED')
    }

    const handleOnChangeRecipient = (value) => {
        setDomain('default')
        setLegend2('CONTINUE')
        updateDonation(null)
        setRecipient(value)
    }

    const handleOnChangeUsername = (event: { target: { value: any } }) => {
        setUsername(event.target.value)
        if (user?.name === event.target.value && user?.domain === domain) {
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
        }
    }

    const handleOnChangeDomain = (value) => {
        setDomain(value)
        if (user?.name === username && user?.domain === value) {
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
        }
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

    const setOriginator_ = (val) => {
        setOriginator(val)
        setOriginator2(null)
    }

    const setOriginator2_ = (val) => {
        setAddress('')
        setLegend2('CONTINUE')
        updateDonation(null)
        setOriginator2(val)
    }

    const resetState = () => {
        updateDonation(null)
        setLegend('CONTINUE')
        setLegend2('CONTINUE')
        setInput(0)
        setRecipient('')
        setUsername('')
        setDomain('default')
        setSsn('')
        setSsn2('')
        setOriginator(null)
        setOriginator2(null)
    }

    const fetchPause = async () => {
        setLoading(true)
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        init.API.blockchain
            .getSmartContractSubState(resolvedUsername.addr, 'paused')
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
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        let txID
        let tx_params: any = []
        let contractAddress = resolvedUsername?.addr!

        const tyron_ = await tyron.Donation.default.tyron(donation!)
        const tyron__ = {
            vname: 'tyron',
            type: 'Option Uint128',
            value: tyron_,
        }
        const username_ = {
            vname: 'username',
            type: 'String',
            value: user?.name, // '0x' + await HashString(user?.name!),
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
        const requestor = {
            vname: 'requestor',
            type: 'ByStr20',
            value: address,
        }

        switch (id) {
            case 'pause':
                txID = 'Pause'
                tx_params.push(username_)
                tx_params.push(tyron__)
                break
            case 'unpause':
                txID = 'Unpause'
                tx_params.push(username_)
                tx_params.push(tyron__)
                break
            case 'withdrawZil':
                txID = 'SendFunds'
                let beneficiary: tyron.TyronZil.Beneficiary
                if (recipient === 'nft') {
                    beneficiary = {
                        constructor:
                            tyron.TyronZil.BeneficiaryConstructor.NftUsername,
                        username: username,
                        domain: domain,
                    }
                } else {
                    beneficiary = {
                        constructor:
                            tyron.TyronZil.BeneficiaryConstructor.Recipient,
                        addr: address,
                    }
                }
                tx_params = await tyron.TyronZil.default.SendFunds(
                    resolvedUsername.addr,
                    'AddFunds',
                    beneficiary!,
                    String(input * 1e12),
                    tyron_
                )
                const usernameWithdraw = {
                    vname: 'username',
                    type: 'String',
                    value: user?.name,
                }
                tx_params.push(usernameWithdraw)
                break
            case 'delegateStake':
                txID = 'DelegateStake'
                tx_params.push(username_)
                tx_params.push(stakeId)
                tx_params.push(ssnId)
                tx_params.push(amount)
                tx_params.push(tyron__)
                break
            case 'withdrawStakeRewards':
                txID = 'WithdrawStakeRewards'
                tx_params.push(username_)
                tx_params.push(stakeId)
                tx_params.push(ssnId)
                tx_params.push(tyron__)
                break
            case 'withdrawStakeAmount':
                txID = 'WithdrawStakeAmt'
                tx_params.push(username_)
                tx_params.push(stakeId)
                tx_params.push(ssnId)
                tx_params.push(amount)
                tx_params.push(tyron__)
                break
            case 'completeStakeWithdrawal':
                txID = 'CompleteWithdrawal'
                tx_params.push(username_)
                tx_params.push(stakeId)
                tx_params.push(tyron__)
                break
            case 'redelegateStake':
                txID = 'ReDelegateStake'
                tx_params.push(username_)
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
            case 'requestDelegatorSwap':
                txID = 'RequestDelegatorSwap'

                //@todo-i-checked different params (tyron vs zilliqa wallet)
                let newAddr
                if (originator.value === 'zilpay') {
                    newAddr = {
                        vname: 'new_deleg_addr',
                        type: 'ByStr20',
                        value: address, //@todo-i-checked in this case the vname must be "new_deleg_addr"
                    }
                } else {
                    newAddr = {
                        vname: 'newDelegAddr',
                        type: 'ByStr20',
                        value: originator2.value,
                    }
                    tx_params.push(username_)
                    tx_params.push(stakeId)
                    tx_params.push(tyron__)
                }
                tx_params.push(newAddr)
                if (originator?.value === 'zilpay') {
                    let network = tyron.DidScheme.NetworkNamespace.Mainnet
                    if (net === 'testnet') {
                        network = tyron.DidScheme.NetworkNamespace.Testnet
                    }
                    const init = new tyron.ZilliqaInit.default(network)
                    await tyron.SearchBarUtil.default
                        .fetchAddr(net, 'init', 'did')
                        .then(async (init_addr) => {
                            return await init.API.blockchain.getSmartContractSubState(
                                init_addr,
                                'services'
                            )
                        })
                        .then((res) => {
                            contractAddress = res.result.services.zilstaking
                        })
                }
                break
            case 'confirmDelegatorSwap':
                txID = 'ConfirmDelegatorSwap'
                tx_params.push(username_)
                tx_params.push(stakeId)
                tx_params.push(requestor)
                tx_params.push(tyron__)
                break
            case 'revokeDelegatorSwap':
                txID = 'RevokeDelegatorSwap'
                tx_params.push(username_)
                tx_params.push(stakeId)
                tx_params.push(tyron__)
                break
            case 'rejectDelegatorSwap':
                txID = 'RejectDelegatorSwap'
                tx_params.push(username_)
                tx_params.push(stakeId)
                tx_params.push(requestor)
                tx_params.push(tyron__)
                break
        }

        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        await zilpay
            .call({
                contractAddress: contractAddress,
                transition: txID,
                params: tx_params as unknown as Record<string, unknown>[],
                amount: String(donation),
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
            })
    }

    useEffect(() => {
        fetchPause()
        isController()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const option = [
        {
            key: '',
            name: 'Address',
        },
        {
            key: 'nft',
            name: ' NFT Username',
        },
        {
            key: 'address',
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
        // {
        //     key: 'defi',
        //     name: '.defi',
        // },
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

    const spinner = (
        <i
            style={{ color: 'silver' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    return (
        <div className={styles.container}>
            {active !== '' && (
                <div
                    className={styles.closeWrapper}
                    onClick={() => toggleActive('')}
                />
            )}
            <h4 className={styles.title}>ZIL STAKING WALLET</h4>
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
                                                        UNPAUSE {user?.name}
                                                        .zil
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
                                                        PAUSE {user?.name}
                                                        .zil
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
                                    <div>
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
                                                    option={option}
                                                    onChange={
                                                        handleOnChangeRecipient
                                                    }
                                                    value={recipient}
                                                />
                                            </div>
                                            {recipient === 'nft' ? (
                                                <div
                                                    className={
                                                        styles.domainSelectorWrapper
                                                    }
                                                >
                                                    <input
                                                        ref={callbackRef}
                                                        type="text"
                                                        style={{
                                                            width: '100%',
                                                            marginRight: '10px',
                                                        }}
                                                        onChange={
                                                            handleOnChangeUsername
                                                        }
                                                        placeholder={t(
                                                            'TYPE_USERNAME'
                                                        )}
                                                        autoFocus
                                                    />
                                                    <div
                                                        style={{ width: '50%' }}
                                                    >
                                                        <Selector
                                                            option={
                                                                optionDomain
                                                            }
                                                            onChange={
                                                                handleOnChangeDomain
                                                            }
                                                            value={domain}
                                                        />
                                                    </div>
                                                </div>
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
                                                        style={{ width: '70%' }}
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
                                    {legend2 === 'SAVED' ||
                                    (recipient === 'nft' &&
                                        username !== '' &&
                                        domain !== 'default') ? (
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
                                                            from {user?.name}
                                                            .zil
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
                                    {legend === 'SAVED' && <Donate />}
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
                                    <SSNSelector
                                        onChange={handleOnChangeSsn}
                                        title="Staked Seed Node ID"
                                        value={ssn}
                                    />
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
                                                    WITHDRAW {input} ZIL from
                                                    SSN
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
                                onClick={() =>
                                    toggleActive('requestDelegatorSwap')
                                }
                                className={
                                    active === 'requestDelegatorSwap'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>REQUEST DELEGATOR SWAP</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={ContinueArrow}
                                        alt="requestDelegatorSwap-ico"
                                    />
                                </div>
                            </div>
                            {active === 'requestDelegatorSwap' && (
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
                                        <div>Current Delegator</div>
                                        <OriginatorSelector
                                            updateOriginator={setOriginator_}
                                        />
                                    </div>
                                    {originator !== null && (
                                        <>
                                            <div style={{ width: '100%' }}>
                                                <div>New Delegator</div>
                                                <OriginatorSelector
                                                    updateOriginator={
                                                        setOriginator2_
                                                    }
                                                />
                                            </div>
                                            {originator2?.value ===
                                                'zilpay' && (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        justifyContent:
                                                            'space-between',
                                                    }}
                                                    className={
                                                        styles.formAmount
                                                    }
                                                >
                                                    <input
                                                        style={{ width: '70%' }}
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
                                                            className={
                                                                legend2 ===
                                                                'CONTINUE'
                                                                    ? 'continueBtnBlue'
                                                                    : ''
                                                            }
                                                            onClick={() => {
                                                                handleSaveAddress()
                                                            }}
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
                                            )}
                                        </>
                                    )}
                                    {originator !== null &&
                                    ((originator2?.value !== 'zilpay' &&
                                        originator2 !== null) ||
                                        (originator2?.value === 'zilpay' &&
                                            legend2 === 'SAVED')) ? (
                                        <>
                                            <Donate />
                                            {donation !== null && (
                                                <>
                                                    <div
                                                        onClick={() =>
                                                            handleSubmit(
                                                                'requestDelegatorSwap'
                                                            )
                                                        }
                                                        style={{
                                                            width: '100%',
                                                            marginTop: '24px',
                                                        }}
                                                        className="actionBtnBlue"
                                                    >
                                                        <div>
                                                            REQUEST DELEGATOR
                                                            SWAP
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.gasTxt
                                                        }
                                                    >
                                                        {t('GAS_AROUND')} 1-2
                                                        ZIL
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
                                onClick={() =>
                                    toggleActive('confirmDelegatorSwap')
                                }
                                className={
                                    active === 'confirmDelegatorSwap'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>CONFIRM DELEGATOR SWAP</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={ContinueArrow}
                                        alt="confirmDelegatorSwap-ico"
                                    />
                                </div>
                            </div>
                            {active === 'confirmDelegatorSwap' && (
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
                                            justifyContent: 'space-between',
                                        }}
                                        className={styles.formAmount}
                                    >
                                        <input
                                            style={{ width: '70%' }}
                                            type="text"
                                            placeholder={t('Type address')}
                                            onChange={handleInputAddress}
                                            onKeyPress={handleOnKeyPressAddr}
                                            autoFocus
                                        />
                                        <div
                                            onClick={handleSaveAddress}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div
                                                className={
                                                    legend2 === 'CONTINUE'
                                                        ? 'continueBtnBlue'
                                                        : ''
                                                }
                                            >
                                                {legend2 === 'CONTINUE' ? (
                                                    <Image
                                                        src={ContinueArrow}
                                                        alt="arrow"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            marginTop: '5px',
                                                        }}
                                                    >
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
                                    {legend2 === 'SAVED' && <Donate />}
                                    {donation !== null && (
                                        <>
                                            <div
                                                onClick={() =>
                                                    handleSubmit(
                                                        'confirmDelegatorSwap'
                                                    )
                                                }
                                                style={{
                                                    marginTop: '24px',
                                                    width: '100%',
                                                }}
                                                className="actionBtnBlue"
                                            >
                                                <div className={styles.txtBtn}>
                                                    CONFIRM DELEGATOR SWAP
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
                                    toggleActive('revokeDelegatorSwap')
                                }
                                className={
                                    active === 'revokeDelegatorSwap'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>REVOKE DELEGATOR SWAP</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={ContinueArrow}
                                        alt="revokeDelegatorSwap-ico"
                                    />
                                </div>
                            </div>
                            {active === 'revokeDelegatorSwap' && (
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
                                                        'revokeDelegatorSwap'
                                                    )
                                                }
                                                style={{
                                                    marginTop: '24px',
                                                    width: '100%',
                                                }}
                                                className="actionBtnBlue"
                                            >
                                                <div className={styles.txtBtn}>
                                                    REVOKE DELEGATOR SWAP
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
                                    toggleActive('rejectDelegatorSwap')
                                }
                                className={
                                    active === 'rejectDelegatorSwap'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>REJECT DELEGATOR SWAP</div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={ContinueArrow}
                                        alt="rejectDelegatorSwap-ico"
                                    />
                                </div>
                            </div>
                            {active === 'rejectDelegatorSwap' && (
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
                                            justifyContent: 'space-between',
                                        }}
                                        className={styles.formAmount}
                                    >
                                        <input
                                            style={{ width: '70%' }}
                                            type="text"
                                            placeholder={t('Type address')}
                                            onChange={handleInputAddress}
                                            onKeyPress={handleOnKeyPressAddr}
                                            autoFocus
                                        />
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div
                                                onClick={handleSaveAddress}
                                                className={
                                                    legend2 === 'CONTINUE'
                                                        ? 'continueBtnBlue'
                                                        : ''
                                                }
                                            >
                                                {legend2 === 'CONTINUE' ? (
                                                    <Image
                                                        src={ContinueArrow}
                                                        alt="arrow"
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            marginTop: '5px',
                                                        }}
                                                    >
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
                                    {legend2 === 'SAVED' && <Donate />}
                                    {donation !== null && (
                                        <>
                                            <div
                                                onClick={() =>
                                                    handleSubmit(
                                                        'rejectDelegatorSwap'
                                                    )
                                                }
                                                style={{
                                                    marginTop: '24px',
                                                    width: '100%',
                                                }}
                                                className="actionBtnBlue"
                                            >
                                                <div className={styles.txtBtn}>
                                                    REJECT DELEGATOR SWAP
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
                    </>
                )}
            </div>
        </div>
    )
}

export default StakeWallet
