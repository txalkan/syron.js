import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import styles from './styles.module.scss'
import { Donate } from '../..'
import { useCallback, useState } from 'react'
import { useStore } from 'effector-react'
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

function StakeWallet() {
    const { t } = useTranslation()
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])
    const user = useStore($user)
    const donation = useStore($donation)
    const [active, setActive] = useState('')
    const [legend, setLegend] = useState(t('CONTINUE'))
    const [button, setButton] = useState('button primary')
    const [legend2, setLegend2] = useState(t('CONTINUE'))
    const [button2, setButton2] = useState('button primary')
    const [source, setSource] = useState('')
    const [beneficiary, setBeneficiary] = useState('')
    const [input, setInput] = useState(0)
    const [recipient, setRecipient] = useState('')
    const [username, setUsername] = useState('')
    const [domain, setDomain] = useState('')
    const [ssn, setSsn] = useState('')

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
            toast.error('The input is not a number.', {
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

    const handleSave = () => {
        if (input === 0) {
            toast.error('The amount cannot be zero.', {
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

    const handleOnChangeSource = (event: { target: { value: any } }) => {
        resetState()
        setSource(event.target.value)
    }

    const handleOnChangeBeneficiary = (event: { target: { value: any } }) => {
        setBeneficiary(event.target.value)
    }

    const handleOnChangeRecipient = (event: { target: { value: any } }) => {
        setRecipient(event.target.value)
    }

    const handleOnChangeUsername = (event: { target: { value: any } }) => {
        setUsername(event.target.value)
    }

    const handleOnChangeDomain = (event: { target: { value: any } }) => {
        setDomain(event.target.value)
    }

    const handleOnChangeSsn = (event: { target: { value: any } }) => {
        setSsn(event.target.value)
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
        setSource('')
        setBeneficiary('')
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
                            <select onChange={handleOnChangeSource}>
                                <option value="">Select source</option>
                                <option value="zilpay">Zilpay</option>
                                <option value="didxwallet">DIDxWallet</option>
                            </select>
                            {source !== '' && (
                                <>
                                    <div
                                        style={{
                                            marginTop: '16px',
                                            width: '100%',
                                        }}
                                        className={styles.formAmount}
                                    >
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
                                    </div>
                                    {source === 'zilpay' && (
                                        <div
                                            style={{ marginTop: '16px' }}
                                            className={styles.formAmount}
                                        >
                                            <input
                                                style={{ width: '70%' }}
                                                type="text"
                                                placeholder={t(
                                                    'Type beneficiary'
                                                )}
                                                onChange={
                                                    handleOnChangeBeneficiary
                                                }
                                                onKeyPress={handleOnKeyPress}
                                                autoFocus
                                            />
                                            <input
                                                style={{
                                                    marginLeft: '5%',
                                                }}
                                                type="button"
                                                className={button}
                                                value={String(legend)}
                                                onClick={() => {
                                                    handleSave()
                                                }}
                                            />
                                        </div>
                                    )}
                                    {source === 'didxwallet' && (
                                        <>
                                            <select
                                                style={{ marginTop: '16px' }}
                                                onChange={
                                                    handleOnChangeRecipient
                                                }
                                            >
                                                <option value="">
                                                    Select recipient
                                                </option>
                                                <option value="nft">
                                                    NFT Username
                                                </option>
                                                <option value="address">
                                                    Address
                                                </option>
                                            </select>
                                            {recipient !== '' && (
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
                                                        }}
                                                        onChange={
                                                            handleOnChangeUsername
                                                        }
                                                        onKeyPress={
                                                            handleOnKeyPress
                                                        }
                                                        placeholder={t(
                                                            'TYPE_USERNAME'
                                                        )}
                                                        autoFocus
                                                    />
                                                    <select
                                                        style={{ width: '50%' }}
                                                        onChange={
                                                            handleOnChangeDomain
                                                        }
                                                    >
                                                        <option value="default">
                                                            {t('DOMAIN')}
                                                        </option>
                                                        <option value="">
                                                            NFT
                                                        </option>
                                                        <option value="did">
                                                            .did
                                                        </option>
                                                        <option value="defi">
                                                            .defi
                                                        </option>
                                                    </select>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                            {domain !== '' ||
                            (beneficiary !== '' &&
                                String(legend) === 'SAVED') ? (
                                <div>
                                    <Donate />
                                </div>
                            ) : (
                                <></>
                            )}
                            {donation !== null && (
                                <>
                                    <div className="buttonBlack">
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
                            <div className={styles.titleCardRight}>
                                Staked Seed Node ID
                            </div>
                            <select
                                style={{ marginTop: '16px' }}
                                onChange={handleOnChangeSsn}
                            >
                                <option value="">Select SSN</option>
                                <option value="SSN#1">SSN#1</option>
                                <option value="SSN#2">SSN#2</option>
                            </select>
                            {ssn !== '' && (
                                <div
                                    style={{ marginTop: '16px' }}
                                    className={styles.formAmount}
                                >
                                    <code>ZIL</code>
                                    <input
                                        ref={callbackRef}
                                        style={{ width: '40%' }}
                                        type="text"
                                        placeholder={t('Type amount')}
                                        onChange={handleInput}
                                        onKeyPress={handleOnKeyPress}
                                        autoFocus
                                    />
                                    <input
                                        style={{
                                            marginLeft: '5%',
                                        }}
                                        type="button"
                                        className={button}
                                        value={String(legend)}
                                        onClick={() => {
                                            handleSave()
                                        }}
                                    />
                                </div>
                            )}
                            {String(legend) === 'SAVED' && <Donate />}
                            {donation !== null && (
                                <>
                                    <div className="buttonBlack">
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
                            <div style={{ width: '100%' }}>
                                <div className={styles.titleCardRight}>
                                    USERNAME
                                </div>
                                <input
                                    ref={callbackRef}
                                    type="text"
                                    style={{ width: '100%', marginTop: '8px' }}
                                    onChange={handleOnChangeUsername}
                                    onKeyPress={handleOnKeyPress}
                                    placeholder={t('TYPE_USERNAME')}
                                    autoFocus
                                />
                            </div>
                            <div style={{ width: '100%', marginTop: '30px' }}>
                                <div className={styles.titleCardRight}>
                                    ssnID
                                </div>
                                <select onChange={handleOnChangeSsn}>
                                    <option value="">Select one</option>
                                    <option value="SSN#1">SSN#1</option>
                                    <option value="SSN#2">SSN#2</option>
                                </select>
                                <input
                                    style={{ marginTop: '16px' }}
                                    type="button"
                                    className={button2}
                                    value={String(legend2)}
                                    onClick={() => {
                                        handleSave2()
                                    }}
                                />
                            </div>
                            {String(legend2) === 'SAVED' && (
                                <div
                                    style={{ marginTop: '16px' }}
                                    className={styles.formAmount}
                                >
                                    <code>ZIL</code>
                                    <input
                                        ref={callbackRef}
                                        style={{ width: '40%' }}
                                        type="text"
                                        placeholder={t('Type amount')}
                                        onChange={handleInput}
                                        onKeyPress={handleOnKeyPress}
                                        autoFocus
                                    />
                                    <input
                                        style={{
                                            marginLeft: '5%',
                                        }}
                                        type="button"
                                        className={button}
                                        value={String(legend)}
                                        onClick={() => {
                                            handleSave()
                                        }}
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
                                    <div className="buttonBlack">
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
                            <div style={{ width: '100%' }}>
                                <div className={styles.titleCardRight}>
                                    ssnID
                                </div>
                                <select onChange={handleOnChangeSsn}>
                                    <option value="">Select one</option>
                                    <option value="SSN#1">SSN#1</option>
                                    <option value="SSN#2">SSN#2</option>
                                </select>
                                <input
                                    style={{ marginTop: '16px' }}
                                    type="button"
                                    className={button2}
                                    value={String(legend2)}
                                    onClick={() => {
                                        handleSave2()
                                    }}
                                />
                            </div>
                            {String(legend2) === 'SAVED' && (
                                <div
                                    style={{ marginTop: '16px' }}
                                    className={styles.formAmount}
                                >
                                    <code>ZIL</code>
                                    <input
                                        ref={callbackRef}
                                        style={{ width: '40%' }}
                                        type="text"
                                        placeholder={t('Type amount')}
                                        onChange={handleInput}
                                        onKeyPress={handleOnKeyPress}
                                        autoFocus
                                    />
                                    <input
                                        style={{
                                            marginLeft: '5%',
                                        }}
                                        type="button"
                                        className={button}
                                        value={String(legend)}
                                        onClick={() => {
                                            handleSave()
                                        }}
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
                                    <div className="buttonBlack">
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
            </div>
        </div>
    )
}

export default StakeWallet
