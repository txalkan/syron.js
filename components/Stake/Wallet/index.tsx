import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import styles from './styles.module.scss'
import { Donate, InputZil, OriginatorAddress, SSNSelector } from '../..'
import { useCallback, useState } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { $user } from '../../../src/store/user'
import { $donation, updateDonation } from '../../../src/store/donation'
import PauseIco from '../../../src/assets/icons/pause.svg'
import WithdrawZil from '../../../src/assets/icons/withdraw_stake.svg'
import DelegateStake from '../../../src/assets/icons/delegate_stake.svg'
import WithdrawStakeRewards from '../../../src/assets/icons/withdraw_stake_rewards.svg'
import WithdrawStakeAmount from '../../../src/assets/icons/withdraw_stake_amount.svg'
import CompleteStakeWithdrawal from '../../../src/assets/icons/complete_stake_withdrawal.svg'
import RedelegateStake from '../../../src/assets/icons/redelegate_stake.svg'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { $net } from '../../../src/store/wallet-network'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../src/store/originatorAddress'

function StakeWallet() {
    const { t } = useTranslation()
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
    const net = useStore($net)
    const originatorAddress = useStore($originatorAddress)
    const [active, setActive] = useState('')
    const [legend, setLegend] = useState(t('CONTINUE'))
    const [button, setButton] = useState('button primary')
    const [legend2, setLegend2] = useState(t('CONTINUE'))
    const [button2, setButton2] = useState('button primary')
    const [input, setInput] = useState(0)
    const [recipient, setRecipient] = useState('')
    const [username, setUsername] = useState('')
    const [domain, setDomain] = useState('')
    const [ssn, setSsn] = useState('')
    const [ssn2, setSsn2] = useState('')
    const [address, setAddress] = useState('')

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            setActive(id)
        }
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setLegend(t('CONTINUE'))
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

    const handleInputAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAddress('')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
            setAddress(addr)
            handleSave2()
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

    const handleInputAddress2 = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setAddress('')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
            if (addr === resolvedUsername.addr) {
                toast.error('Recipient and sender must be different', {
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
                setAddress(addr)
                handleSave2()
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

    const handleSave = () => {
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
            setLegend(t('SAVED'))
            setButton('button')
        }
    }

    const handleSave2 = () => {
        setLegend2(t('SAVED'))
        setButton2('button')
    }

    const handleOnChangeRecipient = (event: { target: { value: any } }) => {
        setRecipient(event.target.value)
    }

    const handleOnChangeUsername = (event: { target: { value: any } }) => {
        setUsername(event.target.value)
        if (user?.name === event.target.value && user?.domain === domain) {
            toast.error('Recipient and sender must be different', {
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

    const handleOnChangeDomain = (event: { target: { value: any } }) => {
        setDomain(event.target.value)
        if (user?.name === username && user?.domain === event.target.value) {
            toast.error('Recipient and sender must be different', {
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

    const handleOnChangeSsn = (event: { target: { value: any } }) => {
        setSsn(event.target.value)
    }

    const handleOnChangeSsn2 = (event: { target: { value: any } }) => {
        setSsn2(event.target.value)
    }

    const resetState = () => {
        updateDonation(null)
        setLegend(t('CONTINUE'))
        setButton('button primary')
        setLegend2(t('CONTINUE'))
        setButton2('button primary')
        setInput(0)
        setRecipient('')
        setUsername('')
        setDomain('')
        setSsn('')
        setSsn2('')
        updateOriginatorAddress(null)
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
            value: user?.name,
        }
        const stakeId = {
            vname: 'stakeID',
            type: 'String',
            value: '1',
        }
        const ssnId = {
            vname: 'ssnID',
            type: 'String',
            value: ssn,
        }
        const amount = {
            vname: 'amount',
            type: 'Uint128',
            value: String(input),
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
            case 'withdrawZil':
                txID = 'SendFunds'
                let beneficiary: tyron.TyronZil.Beneficiary
                if (recipient === 'nft') {
                    await tyron.SearchBarUtil.default
                        .Resolve(net, resolvedUsername.addr!)
                        .then(async (res: any) => {
                            console.log(Number(res?.version.slice(8, 11)))
                            if (Number(res?.version.slice(8, 11)) < 5.6) {
                                const recipient =
                                    await tyron.SearchBarUtil.default.fetchAddr(
                                        net,
                                        username,
                                        domain
                                    )
                                beneficiary = {
                                    constructor:
                                        tyron.TyronZil.BeneficiaryConstructor
                                            .Recipient,
                                    addr: recipient,
                                }
                            } else {
                                beneficiary = {
                                    constructor:
                                        tyron.TyronZil.BeneficiaryConstructor
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
                            tyron.TyronZil.BeneficiaryConstructor.Recipient,
                        addr: address,
                    }
                }
                tx_params = await tyron.TyronZil.default.SendFunds(
                    resolvedUsername.addr,
                    'AddFunds',
                    beneficiary!,
                    String(input),
                    tyron_
                )
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
                tx_params.push(username_)
                tx_params.push(stakeId)
                tx_params.push(tyron__)
                const newAddr = {
                    vname: 'newDelegAddr',
                    type: 'ByStr20',
                    value: address,
                }
                tx_params.push(newAddr)
                if (originatorAddress?.value === 'zilpay') {
                    contractAddress = contractAddress // @todo: provide addr @tralkan
                } else {
                    contractAddress = originatorAddress?.value
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
                amount: '0',
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
                throw err
            })
    }

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>WEB3 WALLET</h4>
            <p className={styles.subTitle}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className={styles.cardWrapper}>
                <div className={styles.cardActiveWrapper}>
                    <div
                        onClick={() => toggleActive('pause')}
                        className={
                            active === 'pause' ? styles.cardActive : styles.card
                        }
                    >
                        <div>PAUSE</div>
                        <div className={styles.icoWrapper}>
                            <Image src={PauseIco} alt="pause-ico" />
                        </div>
                    </div>
                    {active === 'pause' && (
                        <div className={styles.cardRight}>
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
                                        onClick={() => handleSubmit('pause')}
                                        style={{ marginTop: '24px' }}
                                        className="buttonBlack"
                                    >
                                        <div>
                                            PAUSE {user?.name}
                                            .stake
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
                        onClick={() => toggleActive('withdrawalZil')}
                        className={
                            active === 'withdrawalZil'
                                ? styles.cardActive
                                : styles.card
                        }
                    >
                        <div>WITHDRAWAL ZIL</div>
                        <div className={styles.icoWrapper}>
                            <Image src={WithdrawZil} alt="withdrawal-zil-ico" />
                        </div>
                    </div>
                    {active === 'withdrawalZil' && (
                        <div className={styles.cardRight}>
                            <div>
                                <InputZil
                                    onChange={handleInput}
                                    button={button}
                                    legend={legend}
                                    handleSave={handleSave}
                                />
                            </div>
                            {String(legend) === 'SAVED' && (
                                <>
                                    <select
                                        className={styles.selector}
                                        style={{ marginTop: '16px' }}
                                        onChange={handleOnChangeRecipient}
                                    >
                                        <option value="">
                                            Select recipient
                                        </option>
                                        <option value="nft">
                                            NFT Username
                                        </option>
                                        <option value="address">Address</option>
                                    </select>
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
                                                onKeyPress={handleOnKeyPress}
                                                placeholder={t('TYPE_USERNAME')}
                                                autoFocus
                                            />
                                            <select
                                                className={styles.selector}
                                                style={{ width: '50%' }}
                                                onChange={handleOnChangeDomain}
                                            >
                                                <option value="default">
                                                    {t('DOMAIN')}
                                                </option>
                                                <option value="">NFT</option>
                                                <option value="did">
                                                    .did
                                                </option>
                                                <option value="defi">
                                                    .defi
                                                </option>
                                                <option value="stake">
                                                    .stake
                                                </option>
                                            </select>
                                        </div>
                                    ) : recipient === 'address' ? (
                                        <div
                                            style={{
                                                marginTop: '16px',
                                                width: '100%',
                                            }}
                                            className={styles.formAmount}
                                        >
                                            <input
                                                style={{ width: '70%' }}
                                                type="text"
                                                placeholder={t('Type address')}
                                                onChange={handleInputAddress2}
                                                onKeyPress={handleOnKeyPress}
                                                autoFocus
                                            />
                                            <input
                                                style={{
                                                    marginLeft: '5%',
                                                }}
                                                type="button"
                                                className={button2}
                                                value={String(legend2)}
                                                onClick={() => {
                                                    handleSave2()
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                </>
                            )}
                            {domain !== '' || String(legend2) === 'SAVED' ? (
                                <div>
                                    <Donate />
                                </div>
                            ) : (
                                <></>
                            )}
                            {donation !== null && (
                                <>
                                    <div
                                        onClick={() =>
                                            handleSubmit('withdrawZil')
                                        }
                                        className="buttonBlack"
                                    >
                                        <div>
                                            WITHDRAW {input} ZIL from{' '}
                                            {user?.name}
                                            .stake
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
                            <SSNSelector
                                onChange={handleOnChangeSsn}
                                title="Staked Seed Node ID"
                            />
                            {ssn !== '' && (
                                <div style={{ marginTop: '16px' }}>
                                    <InputZil
                                        onChange={handleInput}
                                        button={button}
                                        legend={legend}
                                        handleSave={handleSave}
                                    />
                                </div>
                            )}
                            {String(legend) === 'SAVED' && <Donate />}
                            {donation !== null && (
                                <>
                                    <div
                                        onClick={() =>
                                            handleSubmit('delegateStake')
                                        }
                                        className="buttonBlack"
                                    >
                                        <div>
                                            DELEGATE {input} ZIL to {ssn}
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
                        onClick={() => toggleActive('withdrawStakeRewards')}
                        className={
                            active === 'withdrawStakeRewards'
                                ? styles.cardActive
                                : styles.card
                        }
                    >
                        <div>WITHDRAW STAKE REWARDS</div>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={WithdrawStakeRewards}
                                alt="withdrwa-stake-ico"
                            />
                        </div>
                    </div>
                    {active === 'withdrawStakeRewards' && (
                        <div className={styles.cardRight}>
                            <SSNSelector
                                onChange={handleOnChangeSsn}
                                title="Staked Seed Node ID"
                            />
                            {ssn !== '' && (
                                <div>
                                    <Donate />
                                </div>
                            )}
                            {donation !== null && (
                                <>
                                    <div
                                        onClick={() =>
                                            handleSubmit('withdrawStakeRewards')
                                        }
                                        className="buttonBlack"
                                    >
                                        <div>WITHDRAW REWARDS</div>
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
                        onClick={() => toggleActive('withdrawStakeAmount')}
                        className={
                            active === 'withdrawStakeAmount'
                                ? styles.cardActive
                                : styles.card
                        }
                    >
                        <div>WITHDRAW STAKE AMOUNT</div>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={WithdrawStakeAmount}
                                alt="withdraw-stake-amount-ico"
                            />
                        </div>
                    </div>
                    {active === 'withdrawStakeAmount' && (
                        <div className={styles.cardRight}>
                            <SSNSelector
                                onChange={handleOnChangeSsn}
                                title="Staked Seed Node ID"
                            />
                            {ssn !== '' && (
                                <div style={{ marginTop: '16px' }}>
                                    <InputZil
                                        onChange={handleInput}
                                        button={button}
                                        legend={legend}
                                        handleSave={handleSave}
                                    />
                                </div>
                            )}
                            {String(legend) === 'SAVED' && (
                                <div>
                                    <Donate />
                                </div>
                            )}
                            {donation !== null && (
                                <>
                                    <div
                                        onClick={() =>
                                            handleSubmit('withdrawStakeAmount')
                                        }
                                        className="buttonBlack"
                                    >
                                        <div>WITHDRAW {input} ZIL from SSN</div>
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
                        onClick={() => toggleActive('completeStakeWithdrawal')}
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
                                        style={{ marginTop: '24px' }}
                                        className="buttonBlack"
                                    >
                                        <div>COMPLETE WITHDRAWAL</div>
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
                            <SSNSelector
                                onChange={handleOnChangeSsn}
                                title="Current Staked Seed Node ID"
                            />
                            {ssn !== '' && (
                                <div
                                    style={{ marginTop: '16px', width: '100%' }}
                                >
                                    <SSNSelector
                                        onChange={handleOnChangeSsn2}
                                        title="New Staked Seed Node ID"
                                    />
                                </div>
                            )}
                            {ssn2 !== '' && (
                                <div style={{ marginTop: '16px' }}>
                                    <InputZil
                                        onChange={handleInput}
                                        button={button}
                                        legend={legend}
                                        handleSave={handleSave}
                                    />
                                </div>
                            )}
                            {String(legend) === 'SAVED' && <Donate />}
                            {donation !== null && (
                                <>
                                    <div
                                        onClick={() =>
                                            handleSubmit('redelegateStake')
                                        }
                                        style={{ marginTop: '24px' }}
                                        className="buttonBlack"
                                    >
                                        <div>
                                            REDELEGATE {input} ZIL from {ssn} to{' '}
                                            {ssn2}
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
                        onClick={() => toggleActive('requestDelegatorSwap')}
                        className={
                            active === 'requestDelegatorSwap'
                                ? styles.cardActive
                                : styles.card
                        }
                    >
                        <div>REQUEST DELEGATOR SWAP</div>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={WithdrawZil}
                                alt="requestDelegatorSwap-ico"
                            />
                        </div>
                    </div>
                    {active === 'requestDelegatorSwap' && (
                        <div className={styles.cardRight}>
                            <div
                                style={{
                                    width: '100%',
                                }}
                                className={styles.formAmount}
                            >
                                <input
                                    style={{ width: '70%' }}
                                    type="text"
                                    placeholder={t('Type address')}
                                    onChange={handleInputAddress}
                                    onKeyPress={handleOnKeyPress}
                                    autoFocus
                                />
                                <input
                                    style={{
                                        marginLeft: '5%',
                                    }}
                                    type="button"
                                    className={button2}
                                    value={String(legend2)}
                                    onClick={() => {
                                        handleSave2()
                                    }}
                                />
                            </div>
                            {String(legend2) === 'SAVED' && (
                                <div style={{ width: '100%' }}>
                                    <OriginatorAddress type="stake" />
                                </div>
                            )}
                            {originatorAddress?.value && <Donate />}
                            {donation !== null && (
                                <>
                                    <div
                                        onClick={() =>
                                            handleSubmit('requestDelegatorSwap')
                                        }
                                        style={{ marginTop: '24px' }}
                                        className="buttonBlack"
                                    >
                                        <div>REQUEST DELEGATOR SWAP</div>
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
                        onClick={() => toggleActive('confirmDelegatorSwap')}
                        className={
                            active === 'confirmDelegatorSwap'
                                ? styles.cardActive
                                : styles.card
                        }
                    >
                        <div>CONFIRM DELEGATOR SWAP</div>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={WithdrawZil}
                                alt="confirmDelegatorSwap-ico"
                            />
                        </div>
                    </div>
                    {active === 'confirmDelegatorSwap' && (
                        <div className={styles.cardRight}>
                            <div
                                style={{
                                    width: '100%',
                                }}
                                className={styles.formAmount}
                            >
                                <input
                                    style={{ width: '70%' }}
                                    type="text"
                                    placeholder={t('Type address')}
                                    onChange={handleInputAddress}
                                    onKeyPress={handleOnKeyPress}
                                    autoFocus
                                />
                                <input
                                    style={{
                                        marginLeft: '5%',
                                    }}
                                    type="button"
                                    className={button2}
                                    value={String(legend2)}
                                    onClick={() => {
                                        handleSave2()
                                    }}
                                />
                            </div>
                            {String(legend2) === 'SAVED' && <Donate />}
                            {donation !== null && (
                                <>
                                    <div
                                        onClick={() =>
                                            handleSubmit('confirmDelegatorSwap')
                                        }
                                        style={{ marginTop: '24px' }}
                                        className="buttonBlack"
                                    >
                                        <div>CONFIRM DELEGATOR SWAP</div>
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
                        onClick={() => toggleActive('revokeDelegatorSwap')}
                        className={
                            active === 'revokeDelegatorSwap'
                                ? styles.cardActive
                                : styles.card
                        }
                    >
                        <div>REVOKE DELEGATOR SWAP</div>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={WithdrawZil}
                                alt="revokeDelegatorSwap-ico"
                            />
                        </div>
                    </div>
                    {active === 'revokeDelegatorSwap' && (
                        <div className={styles.cardRight}>
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
                                            handleSubmit('revokeDelegatorSwap')
                                        }
                                        style={{ marginTop: '24px' }}
                                        className="buttonBlack"
                                    >
                                        <div>REVOKE DELEGATOR SWAP</div>
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
                        onClick={() => toggleActive('rejectDelegatorSwap')}
                        className={
                            active === 'rejectDelegatorSwap'
                                ? styles.cardActive
                                : styles.card
                        }
                    >
                        <div>REJECT DELEGATOR SWAP</div>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={WithdrawZil}
                                alt="rejectDelegatorSwap-ico"
                            />
                        </div>
                    </div>
                    {active === 'rejectDelegatorSwap' && (
                        <div className={styles.cardRight}>
                            <div
                                style={{
                                    width: '100%',
                                }}
                                className={styles.formAmount}
                            >
                                <input
                                    style={{ width: '70%' }}
                                    type="text"
                                    placeholder={t('Type address')}
                                    onChange={handleInputAddress}
                                    onKeyPress={handleOnKeyPress}
                                    autoFocus
                                />
                                <input
                                    style={{
                                        marginLeft: '5%',
                                    }}
                                    type="button"
                                    className={button2}
                                    value={String(legend2)}
                                    onClick={() => {
                                        handleSave2()
                                    }}
                                />
                            </div>
                            {String(legend2) === 'SAVED' && <Donate />}
                            {donation !== null && (
                                <>
                                    <div
                                        onClick={() =>
                                            handleSubmit('rejectDelegatorSwap')
                                        }
                                        style={{ marginTop: '24px' }}
                                        className="buttonBlack"
                                    >
                                        <div>REJECT DELEGATOR SWAP</div>
                                    </div>
                                    <div className={styles.gasTxt}>
                                        {t('GAS_AROUND')} 1-2 ZIL
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StakeWallet
