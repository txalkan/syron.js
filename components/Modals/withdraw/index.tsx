import React, { useEffect, useState } from 'react'
import { Modal } from '../../modal'
import styles from './styles.module.scss'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import PowerIcon from '../../../src/assets/icons/power_icon_black.svg'
import ArrowDown from '../../../src/assets/icons/dashboard_arrow_down_icon_black.svg'
import ArrowUp from '../../../src/assets/icons/arrow_up_icon_purple.svg'
import Warning from '../../../src/assets/icons/warning_purple.svg'
import InfoDefault from '../../../src/assets/icons/info_default_black.svg'
import c1 from '../../../src/assets/icons/checkpoint_1_dark.svg'
import c2 from '../../../src/assets/icons/checkpoint_2_dark.svg'
import c3 from '../../../src/assets/icons/checkpoint_3_dark.svg'
import cs from '../../../src/assets/icons/checkpoint_selected_dark.svg'
import Close from '../../../src/assets/icons/ic_cross_black.svg'
import { SyronInput } from '../../syron-102/input/syron-input'
import Big from 'big.js'
import { CryptoState } from '../../../src/types/vault'
import ThreeDots from '../../Spinner/ThreeDots'
import LoadingSpinner from '../../LoadingSpinner'
import useSyronWithdrawal from '../../../src/utils/icp/syron_withdrawal'
import { $icpTx, $inscriptionTx, updateIcpTx } from '../../../src/store/syron'
import { useStore } from 'react-stores'
import { useBitcoinTransactionStore } from '../../../src/store/bitcoin_transactions'
import Spinner from '../../Spinner'
import useICPHook from '../../../src/hooks/useICP'
import { toast } from 'react-toastify'
import { extractRejectText } from '../../../src/utils/unisat/utils'
import icoThunder from '../../../src/assets/icons/ssi_icon_thunder.svg'
import icoCopy from '../../../src/assets/icons/copy.svg'
import ConfirmTransactionModal from '../confirm-txn'
import { mempoolFeeRate } from '../../../src/utils/unisat/httpUtils'

Big.PE = 999
const _0 = Big(0)

type Prop = {
    ssi: string
    sdb: string
    balance: Big
    show: boolean
    onClose: () => void
    stablecoin?: 'BRC-20' | 'RUNES'
}

var ThisModal: React.FC<Prop> = function ({
    ssi,
    sdb,
    balance,
    stablecoin,
    show,
    onClose,
}) {
    // Create CryptoState object based on token type
    const tokenState: CryptoState = {
        name: stablecoin === 'BRC-20' ? 'Syron BRC-20' : 'RUNE•DOLLAR',
        symbol: stablecoin === 'BRC-20' ? 'SYRON BRC-20' : 'RUNE•DOLLAR',
        decimals: 8,
    }
    useEffect(() => {
        if (show) updateIcpTx(null)
    }, [show])

    const { t } = useTranslation()
    const [active, setActive] = useState(0)
    const [checkedStep, setCheckedStep] = useState(Array())

    const menuActive = (id) => {
        setCheckedStep([...checkedStep, active])
        if (active === id) {
            setActive(0)
        } else {
            setActive(id)
        }
    }

    const isChecked = (id) => {
        if (checkedStep.some((val) => val === id)) {
            return true
        } else {
            return false
        }
    }

    const [amount, setAmount] = React.useState(_0)

    const handleOnInput = React.useCallback((value: Big) => {
        setAmount(value)
    }, [])

    const [isDisabled, setIsDisabled] = React.useState(false)
    const icpTx = useStore($icpTx) //{ value: false } //

    useEffect(() => {
        if (balance.eq(0) || icpTx.value === false) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [balance, icpTx])

    const [isLoading, setIsLoading] = React.useState(false)
    const [feeRate, setFeeRate] = React.useState<number>(0)
    const [isLoadingFee, setIsLoadingFee] = React.useState(false)

    // Fee multipliers for different transaction types
    const BRC20_FEE_MULTIPLIER = 220 * 2
    const RUNES_FEE_MULTIPLIER = 300 * 1.5
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
    const [onDetails, setOnDetails] = useState({})
    const [txError, setTxError] = React.useState('')
    let inscriptionTx = useStore($inscriptionTx)

    // Zustand store for transaction state persistence
    const { runningTransactions, setTransactionRunning, clearTransaction } =
        useBitcoinTransactionStore()
    const transactionKey = `withdraw_${stablecoin?.toLowerCase() || 'unknown'}`
    const isTransactionRunning = runningTransactions[transactionKey] || false

    // Use Zustand state for transaction status when modal reopens
    useEffect(() => {
        if (isTransactionRunning && !isLoading) {
            setIsLoading(true)
        }
    }, [isTransactionRunning])

    // Cleanup transaction state when modal unmounts (but keep running transactions)
    useEffect(() => {
        return () => {
            // Don't clear running transactions - let them persist
            // Only clear if they're completed/failed
        }
    }, [])

    const { syron_withdrawal, runes_withdrawal } = useSyronWithdrawal()
    const { getBox } = useICPHook()

    // Single function to calculate all fee information
    const calculateFeeDetails = React.useCallback(
        (
            amount: Big,
            currentFeeRate: number,
            currentStablecoin: string | undefined
        ) => {
            if (currentFeeRate === 0) return null

            let fee = '546 sats' // Default for BRC-20
            let feeDescription = 'There will be a 546 sats withdrawal fee.'
            let gas_fee = currentFeeRate * BRC20_FEE_MULTIPLIER + 330 // Default for BRC-20

            if (currentStablecoin === 'RUNES') {
                if (Number(amount) >= 2) {
                    fee = '$0.5'
                    feeDescription =
                        'There will be a 0.5 SUSD withdrawal fee for amounts of 2 SUSD and above.'
                } else {
                    fee = '0'
                    feeDescription =
                        'No withdrawal fee for amounts under 2 SUSD.'
                }
                gas_fee = currentFeeRate * RUNES_FEE_MULTIPLIER + 330 // @vb for RUNES
            }

            return {
                fee,
                feeDescription,
                gas_fee: `${gas_fee} sats`,
            }
        },
        []
    )

    // Function to fetch fee rate and calculate network fee
    const fetchFeeRate = React.useCallback(async () => {
        try {
            setIsLoadingFee(true)
            const rate = await mempoolFeeRate()

            setFeeRate(rate)
        } catch (error) {
            console.error('Error fetching fee rate:', error)
            toast.error('Failed to fetch network fee rate. Please try again.')
        } finally {
            setIsLoadingFee(false)
        }
    }, [])

    // Fetch fee rate when modal opens
    useEffect(() => {
        if (show) {
            fetchFeeRate()
        }
    }, [show, fetchFeeRate])

    // Update onDetails when fee rate changes and confirmation modal is open
    useEffect(() => {
        if (
            isConfirmationOpen &&
            feeRate > 0 &&
            onDetails &&
            typeof onDetails === 'object' &&
            'amount' in onDetails
        ) {
            const feeDetails = calculateFeeDetails(amount, feeRate, stablecoin)
            if (feeDetails) {
                setOnDetails((prev) => ({
                    ...prev,
                    gas: feeDetails.gas_fee,
                }))
            }
        }
    }, [feeRate, isConfirmationOpen, amount, stablecoin, calculateFeeDetails])

    const handleConfirm = React.useCallback(async () => {
        if (isLoading || isDisabled) return // @review (ui) even if disabled, it runs the first time (not the second)

        try {
            setIsLoading(true)
            setTransactionRunning(transactionKey, true)

            // @test
            // const inscriptionTx = {
            //     value: '68f079d9fd70a19ff43c5e057bceb348e8d0d9d13a53367887390ce4ab7c0c9c',
            // }

            await fetchFeeRate()

            if (stablecoin === 'RUNES') {
                const version = process.env.NEXT_PUBLIC_SYRON_VERSION
                // Choose minter id based on version
                let minterId =
                    process.env.NEXT_PUBLIC_SYRON_RUNES_MINTER_MAINNET
                if (version === '2') {
                    minterId =
                        process.env.NEXT_PUBLIC_SYRON_RUNES_MINTER_MAINNET2
                } else if (version === 'testnet') {
                    minterId =
                        process.env.NEXT_PUBLIC_SYRON_RUNES_MINTER_TESTNET
                }
                let receiveAddress = minterId!

                const unisat = (window as any).unisat
                const txId = await unisat.sendBitcoin(
                    receiveAddress,
                    feeRate * RUNES_FEE_MULTIPLIER + 330,
                    feeRate
                )

                toast.success(
                    `Transaction submitted successfully! Transaction ID: ${txId.slice(0, 8)}...${txId.slice(-8)}`
                )

                await runes_withdrawal(ssi, amount)
            } else {
                await syron_withdrawal(
                    ssi,
                    sdb,
                    amount,
                    typeof inscriptionTx.value === 'string'
                        ? inscriptionTx.value
                        : undefined,
                    feeRate,
                    feeRate * BRC20_FEE_MULTIPLIER
                )
            }
            await getBox(ssi)

            // Transaction successful - clear loading state and show success
            setIsLoading(false)
            clearTransaction(transactionKey)
            toast.success('Withdrawal transaction submitted successfully!')
        } catch (error) {
            console.error('Syron Withdrawal', error)
            setTxError(extractRejectText(String(error)))

            if (typeof error === 'object' && Object.keys(error!).length !== 0) {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            Your request was rejected. For assistance, please
                            let us know on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
                            </a>
                            .
                        </div>
                        <br />
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {error && (error as Error).message
                                ? (error as Error).message
                                : JSON.stringify(error, null, 2)}
                        </div>
                    </div>
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            You can let us know about this error on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @tyronDAO
                            </a>
                            .
                        </div>
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {extractRejectText(String(error))}
                        </div>
                    </div>
                )
            }
            setIsLoading(false)
            clearTransaction(transactionKey)
        }
    }, [
        ssi,
        sdb,
        amount,
        inscriptionTx,
        isLoading,
        isDisabled,
        stablecoin,
        feeRate,
        fetchFeeRate,
        getBox,
        runes_withdrawal,
        syron_withdrawal,
    ])

    const retryWithdrawal = React.useCallback(async () => {
        if (isLoading) return

        try {
            setIsLoading(true)

            updateIcpTx(null)

            if (stablecoin === 'RUNES') {
                console.log('Running Runes Withdrawal')
                await runes_withdrawal(ssi, amount)
            } else {
                if (!inscriptionTx.value) {
                    throw new Error(
                        'The inscribe-transfer transaction is missing.'
                    )
                }
                await syron_withdrawal(
                    ssi,
                    sdb,
                    amount,
                    inscriptionTx.value,
                    feeRate,
                    feeRate * BRC20_FEE_MULTIPLIER
                )
            }

            await getBox(ssi)
        } catch (error) {
            console.error('Retry Syron Withdrawal', error)
            setTxError(extractRejectText(String(error)))

            if (typeof error === 'object' && Object.keys(error!).length !== 0) {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            Your request was rejected. For assistance, please
                            let us know on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
                            </a>
                            .
                        </div>
                        <br />
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {error && (error as Error).message
                                ? (error as Error).message
                                : JSON.stringify(error, null, 2)}
                        </div>
                    </div>
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            You can let us know about this error on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @tyronDAO
                            </a>
                            .
                        </div>
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {extractRejectText(String(error))}
                        </div>
                    </div>
                )
            }
        } finally {
            setIsLoading(false)
        }
    }, [
        ssi,
        sdb,
        amount,
        isLoading,
        inscriptionTx,
        feeRate,
        stablecoin,
        getBox,
        runes_withdrawal,
        syron_withdrawal,
    ])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.info(
            `Your Safety Deposit ₿ox address has been copied to your clipboard.`
        )
    }

    const handleContinue = React.useCallback(async () => {
        if (isLoading) return
        try {
            if (process.env.NEXT_PUBLIC_MINTING_PAUSE === 'true') {
                throw new Error('Withdrawing SUSD is currently paused.')
            }
            if (amount.lt(0.2)) {
                throw new Error('Insufficient Amount')
            }

            // Refresh fee information before opening confirmation modal
            await fetchFeeRate()

            if (feeRate === 0) {
                throw new Error(
                    'The Bitcoin network is experiencing some congestion. During our testing campaign, the maximum allowed gas fee is 4 sats/vB (satoshis per virtual byte). Please try again later when network conditions improve and fees are lower.'
                )
            }

            // Use the single fee calculation function
            const feeDetails = calculateFeeDetails(amount, feeRate, stablecoin)
            if (!feeDetails) {
                throw new Error('Unable to calculate fee information')
            }

            const details = {
                title: 'Confirm Transaction',
                stablecoin: stablecoin,
                info:
                    stablecoin === 'BRC-20'
                        ? `You are about to withdraw SUSD from your account balance. To receive these funds in your self-custodial Bitcoin wallet, by clicking on 'CONFIRM', you will mint a SYRON BRC-20 transfer inscription and send it to the Syron minter along with a fee to cover the Bitcoin gas.`
                        : `You are about to withdraw SUSD from your account balance. To receive these funds in your self-custodial Bitcoin wallet, by clicking on 'CONFIRM', you will send a request to withdraw RUNE•DOLLAR tokens to your wallet.`,
                amount: `$${amount}`,
                fee: feeDetails.fee,
                feeDescription: feeDetails.feeDescription,
                gas: feeDetails.gas_fee,
            }
            setOnDetails(details)

            setIsConfirmationOpen(true)
        } catch (error) {
            if (error == 'Error: Withdrawing SYRON is currently paused.') {
                toast.info('Withdrawing SYRON is currently paused.')
            } else if (error == 'Error: Insufficient Amount') {
                toast.error(
                    <div className={styles.error}>
                        The minimum amount for withdrawal is 20 cents. Please
                        adjust your request accordingly. If you need assistance,
                        feel free to reach out on Telegram{' '}
                        <a
                            href="https://t.me/tyrondao"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'blue',
                                textDecoration: 'underline',
                            }}
                        >
                            @tyronDAO
                        </a>
                        .
                    </div>
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            You can let us know about this error on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#0000ff',
                                    textDecoration: 'underline',
                                }}
                            >
                                @tyronDAO
                            </a>
                        </div>
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {extractRejectText(String(error))}
                        </div>
                    </div>,
                    { autoClose: false, closeOnClick: true, toastId: 500 }
                )
            }
        }
    }, [amount, feeRate, stablecoin, fetchFeeRate, calculateFeeDetails])

    const handleCloseConfirmation = () => {
        // Always close the confirmation modal
        setIsConfirmationOpen(false)
        // Don't reset isLoading - let the transaction continue in the background
    }
    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div className={styles.headerTxt}>
                            {t('Withdraw SUSD as ')}
                            {stablecoin === 'BRC-20'
                                ? 'SYRON BRC-20'
                                : 'RUNE•DOLLAR'}
                        </div>
                        <div
                            onClick={
                                isLoading || isTransactionRunning
                                    ? undefined
                                    : onClose
                            }
                            className={`${styles.closeIcon} ${isLoading || isTransactionRunning ? styles.disabled : ''}`}
                            style={{
                                cursor:
                                    isLoading || isTransactionRunning
                                        ? 'not-allowed'
                                        : 'pointer',
                            }}
                        >
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                    </div>

                    {/* Transaction Status Indicator */}
                    {(isLoading || isTransactionRunning) && (
                        <div className={styles.transactionStatus}>
                            <div className={styles.statusIcon}>
                                <LoadingSpinner size="sm" />
                            </div>
                            <div className={styles.statusContent}>
                                <div className={styles.statusTitle}>
                                    Transaction in Progress
                                </div>
                                <div className={styles.statusText}>
                                    Your withdrawal is being processed. Please
                                    wait for completion.
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.contentWrapper}>
                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(1)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(1) ? (
                                            <Image
                                                alt="point-1"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-1"
                                                src={c1}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('Deposit BTC in your')}
                                        <br />
                                        {t('Safety Deposit ₿ox')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 1 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 1 ? (
                                    <>
                                        <div className={styles.rowContentTxt}>
                                            {t(
                                                'Send bitcoin into your Deposit ₿ox address:'
                                            )}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'You can easily transfer BTC from any wallet to your Deposit ₿ox address. Just copy your address below & follow the instructions in your personal wallet.'
                                                    )}
                                                </li>

                                                <div
                                                    className={styles.sdb}
                                                    onClick={() =>
                                                        copyToClipboard(sdb)
                                                    }
                                                >
                                                    <Image
                                                        src={icoCopy}
                                                        alt={'copy'}
                                                        height="25"
                                                        width="25"
                                                    />
                                                    <div
                                                        className={
                                                            styles.sdbText
                                                        }
                                                    >
                                                        {sdb}
                                                    </div>
                                                </div>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        "During this testing phase, please limit your deposits to a maximum of 5,000 sats (0.00005 BTC). These small amounts are covered by TyronDAO's insurance."
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className={styles.rowContentTxt}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => menuActive(1)}
                                    >
                                        {t(
                                            'Send bitcoin into your Deposit ₿ox address.'
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(2)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(2) ? (
                                            <Image
                                                alt="point-1"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-1"
                                                src={c2}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('Borrow Syron SUSD stablecoins')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 2 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 2 ? (
                                    <>
                                        <div className={styles.rowContentTxt}>
                                            {t(
                                                'Draw SUSD into your Tyron account balance:'
                                            )}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        "To keep your balance up to date, click the 'DRAW SUSD' button in your Syron account."
                                                    )}
                                                </li>
                                                <li className={styles.li}>
                                                    {t(
                                                        "This will update your 'Available SUSD balance'."
                                                    )}
                                                </li>
                                                <li className={styles.li}>
                                                    {t(
                                                        "Remember to click 'DRAW SUSD' each time you make a BTC deposit into your Safety Deposit ₿ox."
                                                    )}
                                                </li>
                                            </ul>
                                            {/* <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul> */}
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className={styles.rowContentTxt}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => menuActive(2)}
                                    >
                                        {t(
                                            'Draw SUSD into your Tyron account balance.'
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.rowWrapper}>
                            <div
                                onClick={() => menuActive(3)}
                                className={styles.rowHeader}
                            >
                                <div className={styles.rowHeaderContent}>
                                    <div>
                                        {isChecked(3) ? (
                                            <Image
                                                alt="point-3"
                                                src={cs}
                                                width={25}
                                                height={25}
                                            />
                                        ) : (
                                            <Image
                                                alt="point-3"
                                                src={c3}
                                                width={25}
                                                height={25}
                                            />
                                        )}
                                    </div>
                                    <div className={styles.rowHeaderTitle}>
                                        {t('Withdraw Syron SUSD stablecoins')}
                                    </div>
                                </div>
                                <div className={styles.wrapperDropdownIco}>
                                    {active === 3 ? (
                                        <Image
                                            alt="arrow-up"
                                            src={ArrowUp}
                                            width={20}
                                            height={20}
                                        />
                                    ) : (
                                        <Image
                                            alt="arrow-down"
                                            src={ArrowDown}
                                            width={20}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={styles.rowContent}>
                                {active === 3 ? (
                                    <>
                                        <div className={styles.rowContentTxt}>
                                            {t(
                                                'Mint Syron SUSD as BRC-20 or runes stablecoins, and send them to your personal Bitcoin wallet:'
                                            )}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    <span
                                                        style={{
                                                            color: 'rgb(75, 0, 130)',
                                                        }}
                                                    >
                                                        {t('Transfer Process:')}
                                                    </span>{' '}
                                                    {t(
                                                        'You can withdraw Syron SUSD from your balance to your self-custodial wallet and receive SYRON BRC-20 or RUNE•DOLLAR tokens.'
                                                    )}
                                                </li>
                                                <li className={styles.li}>
                                                    <span
                                                        style={{
                                                            color: 'rgb(75, 0, 130)',
                                                        }}
                                                    >
                                                        {t(
                                                            'Withdrawal Limits:'
                                                        )}
                                                    </span>{' '}
                                                    {t(
                                                        "SUSD withdrawals are limited by your account's available balance. There is a stable deposit of $0.1 per rune withdrawal."
                                                    )}
                                                </li>
                                                <li className={styles.li}>
                                                    <span
                                                        style={{
                                                            color: 'rgb(75, 0, 130)',
                                                        }}
                                                    >
                                                        {t(
                                                            'Token Implementation:'
                                                        )}
                                                    </span>{' '}
                                                    {t(
                                                        'Syron SUSD can be withdrawn on Bitcoin Mainnet as a BRC-20 token named SYRON, or as a rune token called RUNE•DOLLAR, both running natively on the Bitcoin L1 network.'
                                                    )}
                                                </li>
                                                {/* <li className={styles.li}>
                                                    <span
                                                        style={{
                                                            color: 'rgb(75, 0, 130)',
                                                        }}
                                                    >
                                                        {t(
                                                            'Cross-Network Bridging:'
                                                        )}
                                                    </span>{' '}
                                                    {t(
                                                        'You can bridge Syron SUSD to other networks, such as Bitlayer, using the Omnity Network.'
                                                    )}
                                                </li> */}
                                                {/* <li className={styles.li}>
                                                    <span
                                                        style={{
                                                            color: 'rgb(75, 0, 130)',
                                                        }}
                                                    >
                                                        {t(
                                                            'Future Enhancements:'
                                                        )}
                                                    </span>{' '}
                                                    {t(
                                                        'Soon, we will be able to send lightning-fast payments powered by the Internet Computer!'
                                                    )}
                                                </li> */}
                                            </ul>
                                            {/* <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul> */}
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className={styles.rowContentTxt}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => menuActive(3)}
                                    >
                                        {t(
                                            'Mint Syron SUSD as BRC-20 or runes stablecoins, and send them to your personal Bitcoin wallet.'
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.diagramContainer}>
                        <p className={styles.diagramLineLabel}>
                            TYRON ACCOUNT BALANCE (Sender)
                        </p>
                        <p className={styles.diagramFlowSymbol}>|</p>
                        <p className={styles.diagramFlowSymbol}>
                            SUSD{' '}
                            {stablecoin === 'BRC-20'
                                ? '(SYRON BRC-20)'
                                : '(RUNE•DOLLAR)'}
                        </p>
                        <p className={styles.diagramFlowSymbol}>|</p>
                        <p className={styles.diagramFlowSymbol}>▼</p>
                        <p className={styles.diagramLineLabel}>
                            SELF-CUSTODIAL BITCOIN WALLET (Receiver)
                        </p>
                        <p className={styles.diagramCaption}>
                            Syron SUD will be sent to your connected Bitcoin
                            Wallet Address.
                        </p>
                    </div>

                    <div className={styles.label}>
                        amount to withdraw{' '}
                        {stablecoin === 'BRC-20'
                            ? '(SYRON BRC-20)'
                            : '(RUNE•DOLLAR)'}
                    </div>
                    <SyronInput
                        balance={balance}
                        token={tokenState}
                        onInput={handleOnInput}
                        disabled={isDisabled}
                    />
                    <div className={styles.btnConfirmWrapper}>
                        <button
                            // className={
                            //     isDisabled || isLoading
                            //         ? styles.btnConfirmDisabled
                            //         : styles.btnConfirm
                            // }
                            className={`button ${
                                isDisabled || isLoading ? 'disabled' : 'primary'
                            }`}
                            onClick={handleContinue}
                        >
                            {isLoading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                <>Continue</>
                            )}
                        </button>
                    </div>

                    <ConfirmTransactionModal
                        isOpen={isConfirmationOpen}
                        onClose={handleCloseConfirmation}
                        onDetails={onDetails}
                        onConfirm={handleConfirm}
                        isLoading={isLoading}
                        onReloadFees={fetchFeeRate}
                        isReloadingFees={isLoadingFee}
                    />

                    {icpTx.value === false ? (
                        <div className={styles.failedWithdrawal}>
                            <div className={styles.failedHeader}>
                                <div className={styles.failedIcon}>
                                    <svg
                                        width="56"
                                        height="56"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="#ef4444"
                                            strokeWidth="2"
                                            fill="#fef2f2"
                                        />
                                        <path
                                            d="M15 9l-6 6m0-6l6 6"
                                            stroke="#ef4444"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>

                                <div className={styles.failedTitle}>
                                    Withdrawal Failed
                                </div>

                                <div className={styles.failedMessage}>
                                    We're sorry, but your withdrawal request
                                    could not be completed.
                                </div>
                            </div>

                            {txError !== '' && (
                                <div className={styles.errorDetails}>
                                    <div className={styles.errorLabel}>
                                        Error Details
                                    </div>
                                    <div className={styles.errorText}>
                                        {txError}
                                    </div>
                                </div>
                            )}

                            <div className={styles.failedInstructions}>
                                <div className={styles.instructionText}>
                                    Please try again after a moment. If the
                                    error persists, you can contact us for
                                    support.
                                </div>
                                <div className={styles.supportLink}>
                                    <span>Get help on </span>
                                    <a
                                        href="https://t.me/tyrondao"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.telegramLink}
                                    >
                                        Telegram @TyronDAO
                                    </a>
                                </div>
                            </div>

                            <div className={styles.failedActions}>
                                <button
                                    onClick={retryWithdrawal}
                                    className={styles.retryButton}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className={styles.loadingState}>
                                            <ThreeDots color="white" />
                                            <span>Retrying...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M1 4v6h6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M23 20v-6h-6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <span>Try Again</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isLoading ? (
                                <div className={styles.processingWithdrawal}>
                                    <div className={styles.processingHeader}>
                                        <div className={styles.processingIcon}>
                                            <div
                                                className={styles.spinner}
                                            ></div>
                                        </div>

                                        <div className={styles.processingTitle}>
                                            Processing Withdrawal
                                        </div>

                                        <div
                                            className={styles.processingMessage}
                                        >
                                            Your withdrawal request is being
                                            processed...
                                        </div>
                                    </div>

                                    <div className={styles.processingDetails}>
                                        <div className={styles.processingNote}>
                                            Please wait while we confirm your
                                            transaction on the blockchain. This
                                            may take a few moments.
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {icpTx.value === true ? (
                                        <div
                                            className={
                                                styles.succeededWithdrawal
                                            }
                                        >
                                            <div
                                                className={styles.successHeader}
                                            >
                                                <div
                                                    className={
                                                        styles.successIcon
                                                    }
                                                >
                                                    <svg
                                                        width="56"
                                                        height="56"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="#10b981"
                                                            strokeWidth="2"
                                                            fill="#ecfdf5"
                                                        />
                                                        <path
                                                            d="M9 12l2 2 4-4"
                                                            stroke="#10b981"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </div>
                                                <div
                                                    className={
                                                        styles.successTitle
                                                    }
                                                >
                                                    Withdrawal Completed
                                                </div>
                                                <div
                                                    className={
                                                        styles.successSubtitle
                                                    }
                                                >
                                                    Your transaction has been
                                                    processed successfully
                                                </div>
                                            </div>

                                            <div
                                                className={
                                                    styles.successDetails
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.amountSection
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.amountLabel
                                                        }
                                                    >
                                                        Amount Withdrawn
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.amountValue
                                                        }
                                                    >
                                                        {String(amount)}{' '}
                                                        {stablecoin === 'RUNES'
                                                            ? 'RUNE•DOLLAR'
                                                            : 'SYRON'}
                                                    </div>
                                                </div>

                                                <div
                                                    className={
                                                        styles.statusSection
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.statusItem
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.statusIcon
                                                            }
                                                        >
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M9 12l2 2 4-4"
                                                                    stroke="#10b981"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.statusText
                                                            }
                                                        >
                                                            Transaction
                                                            confirmed on
                                                            blockchain
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.statusItem
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.statusIcon
                                                            }
                                                        >
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M9 12l2 2 4-4"
                                                                    stroke="#10b981"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.statusText
                                                            }
                                                        >
                                                            Funds sent to your
                                                            wallet
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={
                                                    styles.successActions
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.successNote
                                                    }
                                                >
                                                    You can check your wallet to
                                                    verify the transaction. It
                                                    may take a few minutes to
                                                    appear depending on network
                                                    conditions.
                                                </div>
                                                <button
                                                    onClick={onClose}
                                                    className={
                                                        styles.closeButton
                                                    }
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default ThisModal
