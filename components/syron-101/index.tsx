import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { updateDonation } from '../../src/store/donation'
import Image from 'next/image'
import icoDown from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import icoUp from '../../src/assets/icons/ssi_icon_3arrowsUp.svg'
import { useTranslation } from 'next-i18next'
import { SyronForm } from '../syron-102'
import icoBalance from '../../src/assets/icons/ssi_icon_balance.svg'
import icoBTC from '../../src/assets/icons/bitcoin.png'
import icoSYRON from '../../src/assets/logos/syron_susd_brand_mark.png'
import icoThunder from '../../src/assets/icons/ssi_icon_thunder.svg'
import icoShield from '../../src/assets/icons/ssi_icon_shield.svg'
import icoCopy from '../../src/assets/icons/copy.svg'
import Big from 'big.js'
import {
    $btc_wallet,
    $siwb,
    $syron,
    $walletConnected,
    updateSiwb,
} from '../../src/store/syron'
import { useStore } from 'react-stores'
import useICPHook from '../../src/hooks/useICP'
import { toast } from 'react-toastify'
import { extractRejectText } from '../../src/utils/unisat/utils'
import {
    mempoolFeeRate,
    transaction_status,
    unisatBalance,
} from '../../src/utils/unisat/httpUtils'
import { useBTCWalletHook } from '../../src/hooks/useBTCWallet'
import { WithdrawModal, SendModal, BuyModal } from '..'
import ThreeDots from '../Spinner/ThreeDots'
import icoPrint from '../../src/assets/icons/ico_print_syron.svg'
import icoEarn from '../../src/assets/icons/ico_earn_bitcoin.svg'
import AuthGuard from '../AuthGuard'
import { useSiwbIdentity } from 'ic-use-siwb-identity'
import { DelegationIdentity } from '@dfinity/identity'
import SyronInfoCard from './SyronInfoCard'

Big.PE = 999
const _0 = Big(0)

function Component() {
    const walletConnected = useStore($walletConnected).isConnected
    const syron = useStore($syron)
    const siwb = useStore($siwb).value
    const { identity } = useSiwbIdentity()
    const { t } = useTranslation()

    const [active, setActive] = useState('GetSyron')
    const [sdb, setSDB] = useState('')
    const [satsDeposited, setSatsDeposited] = useState(_0)
    const [loan, setLoan] = useState('')
    const [syronBal, setSyronBal] = useState('')
    const [isIdentified, setIsIdentified] = useState(false)

    const [showWithdrawModal, setWithdrawModal] = React.useState(false)
    const updateWithdraw = async () => {
        setWithdrawModal(true)
    }
    const [showSendModal, setSendModal] = React.useState(false)
    const [isICP, setIsICP] = React.useState(false)
    const updateSend = async (is_icp: boolean) => {
        setSendModal(true)
        setIsICP(is_icp)
    }
    const [showBuyModal, setBuyModal] = React.useState(false)
    const updateBuy = async () => {
        setBuyModal(true)
    }

    useEffect(() => {
        console.log('SIWB identity: ', identity)
        console.log('SIWB saved identity: ', siwb)

        let current_id: DelegationIdentity
        if (siwb !== null) {
            current_id = siwb
            console.log('SIWB session still present')
        } else if (identity) {
            current_id = identity
        } else {
            console.log('SIWB session is invalid')
            setIsIdentified(false)
            updateSiwb(null)
            return
        }

        const id_str = JSON.stringify(current_id, null, 2)
        // console.log('SIWB Identity: ', id_str)
        const match = id_str.match(/"expiration":\s*"([0-9a-fA-F]+)"/)
        const expiration = match ? match[1] : null

        if (expiration !== null) {
            const exp = parseInt(expiration, 16) / 1e6
            //console.log('Expiration: ', exp)

            const now = Math.floor(Date.now())
            // console.log(now)
            if (exp > now) {
                console.log('SIWB session not expired')
                setIsIdentified(true)

                if (siwb === null && identity) {
                    updateSiwb(identity)
                    console.log('SIWB session saved')
                }
            } else {
                console.log('SIWB session has expired')
                setIsIdentified(false)
                updateSiwb(null)
            }
        } else {
            console.error('SIWB session not found')
        }
    }, [identity, siwb, showSendModal, showBuyModal])

    useEffect(() => {
        if (syron !== null) {
            console.log('Syron State: ', JSON.stringify(syron, null, 2))

            setSDB(syron.sdb)
            setSatsDeposited(syron.sdb_btc)

            const loan_ = syron.syron_usd_loan.div(1e8).round(2, 0).toString()
            setLoan(loan_)
            console.log('SUSD printed: ', loan_)

            const bal_ = syron.syron_usd_bal.div(1e8).round(2, 0).toString()
            setSyronBal(bal_)
            console.log('SUSD balance: ', bal_)
        }
    }, [syron?.sdb_btc, syron?.syron_usd_loan, syron?.syron_usd_bal])

    // @dev Read for new BTC deposits every half minute @review
    useEffect(() => {
        async function readDeposits() {
            // @review use api route
            await unisatBalance(syron?.sdb!)
                .then((balance) => {
                    console.log(
                        'Box BTC Deposit',
                        balance,
                        'sats, for SDB:',
                        syron?.sdb
                    )
                    setSatsDeposited(Big(balance))
                })
                .catch((error) => {
                    console.error('readDeposits', error)
                })
        }

        if (syron?.sdb) {
            readDeposits()
            //intervalId = setInterval(readDeposits, 0.5 * 60 * 1000)
        }
        // return () => {
        //     if (intervalId) {
        //         clearInterval(intervalId) // Clear the interval if it exists
        //     }
        // }
    }, [syron?.sdb])

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            setActive(id)
        }
    }
    const resetState = () => {
        updateDonation(null)
    }

    const start_pair = [
        {
            value: _0,
            meta: {
                name: 'Bitcoin',
                symbol: 'BTC',
                decimals: 8,
            },
        },
        {
            value: _0,
            meta: {
                name: 'Syron SUSD',
                symbol: 'Syron SUSD',
                decimals: 8,
            },
        },
    ]

    const { redemptionGas, redeemBTC, getBox, updateSyronBalance } =
        useICPHook()

    const btc_wallet = useStore($btc_wallet)

    const unisat = (window as any).unisat

    const [isRedeeming, setIsRedeeming] = useState(false)
    const handleRedeem = async () => {
        try {
            setIsRedeeming(true)
            // await redeemBitcoin(
            //     'c56d3e6d6aaf79a7adf25e9241b13c73dd60c307ed1e89b66696ae8d4b111019'
            // )

            // @pause
            if (process.env.NEXT_PUBLIC_BURNING_PAUSE === 'true') {
                throw new Error('Burning is paused')
            }

            let loan_amt = parseFloat(loan)
            let balance = parseFloat(syronBal)

            if (sdb === '') {
                throw new Error('Deposit Box Loading error')
            } else if (loan_amt <= 0) {
                toast.info(
                    "You don't have an active loan. Click the 'DRAW SUSD' button first to borrow Syron SUSD against your BTC collateral.",
                    { autoClose: false, closeOnClick: true }
                )
                return
            } else if (balance >= loan_amt) {
                await redeemBTC(btc_wallet?.btc_addr!, '')
            } else if (balance < loan_amt) {
                // @dev the SUSD balance will be used to repay the loan
                let loan_balance = loan_amt - balance

                // @dev Check SYRON BRC-20 balance in Box address
                console.log('Checking SYRON BRC-20 balance in Box...')
                await fetch(`/api/get-unisat-brc20-balance?id=${sdb}`)
                    .then(async (response) => {
                        const res = await response.json()
                        if (res.error) {
                            throw new Error(res.error)
                        }

                        console.log(
                            'outcall response: SYRON BRC-20 balance in box',
                            JSON.stringify(res, null, 2)
                        )

                        const brc20_balance = parseFloat(
                            res.detail[0].overallBalance
                        ) // @review make sure that the balance has at least 1 confirmation

                        const limit = 0.02 // @governance
                        if (brc20_balance < loan_balance - limit) {
                            loan_balance = loan_balance - brc20_balance

                            throw new Error(
                                `You have to repay the full amount of your loan to redeem your BTC collateral, and your current SYRON BRC-20 balance is $${brc20_balance.toFixed(
                                    2
                                )}. Deposit $${loan_balance.toFixed(
                                    2
                                )} SYRON BRC-20 into your Deposit ₿ox before proceeding.`
                            )
                        }

                        //return await redemptionGas(btc_wallet?.btc_addr!)
                    })
                    .catch((error) => {
                        throw error
                    })
                // @dev Send inscribe-transfer UTXO transaction on Bitcoin
                console.log('Sending inscribe-transfer UTXO transaction...')

                // Inscribe the loan_balance amount to the box address
                const tick = 'SYRON' // @brc20

                let feeRate = await mempoolFeeRate()
                // Add a fee to cover the redeption gas from deposit box
                let deposit = (150 * feeRate).toString() // @vb

                // Get inscription order
                let order = await fetch(
                    `/api/post-unisat-brc20-transfer?receiveAddress=${sdb}&feeRate=${feeRate}&devAddress=${sdb}&devFee=${deposit}&brc20Ticker=${tick}&brc20Amount=${loan_balance}`
                )
                    .then((response) => response.json())
                    .then((res) => {
                        console.log(JSON.stringify(res, null, 2))
                        return res.data
                    })
                    .catch((error) => {
                        throw error
                    })

                // @dev Send inscribe-transfer UTXO transaction on Bitcoin (#1)
                await unisat
                    .sendBitcoin(order.payAddress, order.amount, order.feeRate)
                    .then(async (txId) => {
                        console.log('Transaction ID #1', txId)

                        // @dev Make sure that the Bitcoin transaction (#2) is confirmed
                        await transaction_status(txId)
                            .then(async (_res) => {
                                const order_ = await fetch(
                                    `/api/get-unisat-brc20-order?id=${order.orderId}`
                                )
                                    .then((response) => response.json())
                                    .then((res) => {
                                        return res.data
                                    })
                                    .catch((error) => {
                                        throw error
                                    })

                                console.log(
                                    'Order From OrderId',
                                    JSON.stringify(order_, null, 2)
                                )
                                const inscription_id =
                                    order_.files[0].inscriptionId

                                return inscription_id.slice(0, -2)
                            })
                            .then(async (txId2) => {
                                console.log('Transaction ID #2', txId2)
                                await transaction_status(txId2).then(
                                    async () => {
                                        await redeemBitcoin(txId2)
                                        // @review add retry option when the canister fails but the SDB received the inscription
                                        toast.info(
                                            `You have redeemed your BTC!`,
                                            {
                                                autoClose: false,
                                                closeOnClick: true,
                                            }
                                        )
                                    }
                                )
                            })
                    })
            }
            toast.info(`You have redeemed your BTC!`, {
                autoClose: false,
                closeOnClick: true,
            })
        } catch (err) {
            console.error('handleRedeem', err)

            if (err == 'Error: Coming soon!') {
                toast.info('Coming soon!', { autoClose: 2000 })
            } else if ((err as Error).message.includes('SDB Loading Error')) {
                toast.info(
                    'Loading your Safety Deposit ₿ox… Please wait a moment and try again shortly.',
                    { autoClose: 2000 }
                )
            } else if ((err as Error).message.includes('balance is zero')) {
                toast.warn(
                    `Repay your loan to redeem your BTC collateral. Deposit ${(
                        Number(loan) - Number(syronBal)
                    ).toFixed(
                        2
                    )} Syron SUSD into your Safety Deposit Box address.`,
                    { autoClose: false, closeOnClick: true }
                )
            } else if (
                typeof err === 'object' &&
                Object.keys(err!).length !== 0
            ) {
                toast.error(
                    <div className={styles.error}>
                        <p>
                            Your request was rejected. For assistance, you can
                            let us know on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'blue' }}
                            >
                                @tyronDAO
                            </a>
                            .
                        </p>
                        <p style={{ color: 'red' }}>
                            {err && (err as Error).message
                                ? (err as Error).message
                                : JSON.stringify(err, null, 2)}
                        </p>
                    </div>,
                    {
                        autoClose: false,
                        closeOnClick: true,
                        toastId: 4,
                    }
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <p style={{ color: 'red' }}>
                            {extractRejectText(String(err))}
                        </p>
                        <p>
                            For assistance with this error, join us on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'blue' }}
                            >
                                @tyronDAO
                            </a>
                            .
                        </p>
                    </div>,
                    {
                        autoClose: false,
                        closeOnClick: true,
                    }
                )
            }
        } finally {
            setIsRedeeming(false)
        }
    }

    const redeemBitcoin = async (tx_id: string) => {
        try {
            // @dev Add inscription info to Tyron indexer
            const balance = await fetch(
                `/api/get-unisat-brc20-balance?id=${sdb}`
            )

            if (!balance.ok) {
                throw new Error(`Indexer error! status: 500`)
            }

            const balance_data = await balance.json()
            console.log(JSON.stringify(balance_data, null, 2))

            // Txn: Inscription to SDB
            console.log('Read Transaction', tx_id)

            // @dev Add inscription info to Tyron indexer
            const add = await fetch(
                `/api/get-unisat-inscription-info?id=${tx_id + 'i0'}`
            )

            if (!add.ok) {
                throw new Error(`Indexer error! status: 501`)
            }

            const add_data = await add.json()
            console.log(JSON.stringify(add_data, null, 2))

            // @dev Update inscription info in Tyron indexer
            let update = await fetch(
                `/api/update-unisat-inscription-info?id=${tx_id + 'i0'}`
            )

            if (!update.ok) {
                throw new Error(`Indexer error! status: 502`)
            }

            let update_data = await update.json()
            console.log(JSON.stringify(update_data, null, 2))

            await redeemBTC(btc_wallet?.btc_addr!, tx_id)

            // @dev Update inscription info in Tyron indexer
            update = await fetch(
                `/api/update-unisat-inscription-info?id=${tx_id + 'i0'}`
            )

            if (!update.ok) {
                throw new Error(`Indexer error! status: 503`)
            }

            update_data = await update.json()
            console.log(JSON.stringify(update_data, null, 2))

            await updateSession()
        } catch (error) {
            console.error('redeemBitcoin', error)
            throw error
        }
    }

    // @review (mainnet)
    const { updateWallet } = useBTCWalletHook()

    const updateSession = async () => {
        const [address] = await unisat.getAccounts()
        const balance = await unisat.getBalance()
        const network = await unisat.getNetwork()
        await updateWallet(address, Number(balance.confirmed), network)
        await getBox(address)
        console.log('Session updated.')
    }

    const [isLoading, setIsLoading] = useState(false)
    const updateBalance = async () => {
        try {
            setIsLoading(true)
            await updateSyronBalance(btc_wallet?.btc_addr!)
            await updateSession()
        } catch (error) {
            if (typeof error === 'object' && Object.keys(error!).length !== 0) {
                toast.error(
                    <div className={styles.error}>
                        <p>
                            Your request was rejected. For assistance, please
                            let us know on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'blue' }}
                            >
                                @tyronDAO
                            </a>
                            .
                        </p>
                        <p style={{ color: 'red' }}>
                            {error && (error as Error).message
                                ? (error as Error).message
                                : JSON.stringify(error, null, 2)}
                        </p>
                    </div>,
                    {
                        autoClose: false,
                        closeOnClick: true,
                    }
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <p style={{ color: 'red' }}>
                            {extractRejectText(String(error))}
                        </p>
                        <p>
                            For assistance with this error, you can join us on
                            Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'blue' }}
                            >
                                @tyronDAO
                            </a>
                            .
                        </p>
                    </div>,
                    { autoClose: false, closeOnClick: true }
                )
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value)

            toast.info(`Address has been copied to clipboard`)
        } catch (error) {
            console.error('Failed to copy text:', error)
        }
    }

    if (walletConnected && showWithdrawModal) {
        return (
            <WithdrawModal
                ssi={btc_wallet?.btc_addr!}
                sdb={sdb}
                balance={syronBal ? Big(syronBal) : _0}
                show={showWithdrawModal}
                onClose={() => setWithdrawModal(false)}
            />
        )
    } else if (walletConnected && showSendModal) {
        return (
            <SendModal
                ssi={btc_wallet?.btc_addr!}
                sdb={sdb}
                balance={syronBal ? Big(syronBal) : _0}
                show={showSendModal}
                onClose={() => setSendModal(false)}
                isICP={isICP}
            />
        )
    } else if (walletConnected && showBuyModal) {
        return (
            <BuyModal
                ssi={btc_wallet?.btc_addr!}
                sdb={sdb}
                balance={syronBal ? Big(syronBal) : _0}
                show={showBuyModal}
                onClose={() => setBuyModal(false)}
            />
        )
    } else {
        return (
            <div className={styles.container}>
                <SyronInfoCard />

                {/* @dev: private SDB */}
                <div className={styles.boxWrapper}>
                    {walletConnected ? (
                        <>
                            {sdb ? (
                                <>
                                    <div className={styles.boxTitle}>
                                        {/* <Image
                                            src={SyronLogo}
                                            alt="syron-logo"
                                            height="111"
                                            width="111"
                                        /> */}
                                        {/* <span @review
                                          onClick={updateBitcoinVault}
                                          style={{
                                              cursor: 'pointer',
                                              paddingLeft: '8px',
                                          }}
                                      >
                                          {loading ? (
                                              <Spinner />
                                          ) : (
                                              <Image
                                                  src={refreshIco}
                                                  alt="refresh-ico"
                                                  height="12"
                                                  width="12"
                                              />
                                          )}
                                      </span> */}
                                    </div>

                                    <div className={styles.subtitleLabel}>
                                        addresses
                                    </div>
                                    <div className={styles.boxWrapperInner}>
                                        <div className={styles.subtitle}>
                                            Safety Deposit ₿ox
                                        </div>
                                        <div className={styles.sdbAddr}>
                                            <div
                                                className={styles.sdb}
                                                onClick={() =>
                                                    handleCopy(
                                                        syron?.sdb as string
                                                    )
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.iconContainer
                                                    }
                                                >
                                                    <Image
                                                        src={icoCopy}
                                                        alt={'copy-sdb'}
                                                        className={styles.icon}
                                                    />
                                                </div>
                                                <div className={styles.sdbText}>
                                                    {syron?.sdb}
                                                </div>
                                            </div>
                                            <div
                                                className={styles.link}
                                                onClick={() => {
                                                    //@network defaults to mainnet
                                                    let url: URL = new URL(
                                                        `https://mempool.space/address/${syron?.sdb}`
                                                    )
                                                    const version =
                                                        process.env
                                                            .NEXT_PUBLIC_SYRON_VERSION
                                                    if (version === 'testnet') {
                                                        url = new URL(
                                                            `https://mempool.space/testnet4/address/${syron?.sdb}`
                                                        )
                                                    }
                                                    window.open(url)
                                                }}
                                            >
                                                ₿ox History ↗
                                            </div>
                                        </div>
                                        <br />
                                        <div className={styles.subtitle}>
                                            <span className={styles.noBreak}>
                                                self-custodial
                                            </span>{' '}
                                            wallet
                                        </div>
                                        <div className={styles.sdbAddr}>
                                            <div
                                                className={styles.sdb}
                                                onClick={() =>
                                                    handleCopy(
                                                        btc_wallet?.btc_addr as string
                                                    )
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.iconContainer
                                                    }
                                                >
                                                    <Image
                                                        src={icoCopy}
                                                        alt={'copy-sdb'}
                                                        className={styles.icon}
                                                    />
                                                </div>
                                                <div className={styles.sdbText}>
                                                    {btc_wallet?.btc_addr}
                                                </div>
                                            </div>
                                            <div
                                                className={styles.link}
                                                onClick={() => {
                                                    //@network defaults to mainnet
                                                    let url: URL = new URL(
                                                        `https://mempool.space/address/${btc_wallet?.btc_addr}`
                                                    )
                                                    const version =
                                                        process.env
                                                            .NEXT_PUBLIC_SYRON_VERSION
                                                    if (version === 'testnet') {
                                                        url = new URL(
                                                            `https://mempool.space/testnet4/address/${btc_wallet?.btc_addr}`
                                                        )
                                                    }
                                                    window.open(url)
                                                }}
                                            >
                                                Wallet History ↗
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.subtitleLabel}>
                                        {/* <div className={styles.iconContainer}>
                                                <Image
                                                    src={icoBalance}
                                                    alt={'btc-deposited'}
                                                    className={styles.icon}
                                                />
                                            </div> */}
                                        manage collateral & loan
                                    </div>
                                    <div className={styles.boxWrapperInner}>
                                        <div className={styles.txtRow}>
                                            To add collateral, send Bitcoin to
                                            your Safety Deposit ₿ox address.
                                        </div>
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                | BTC collateral in ₿ox
                                            </div>
                                            <div className={styles.value}>
                                                <span className={styles.color}>
                                                    {Number(
                                                        satsDeposited.div(1e8)
                                                    )}
                                                </span>
                                                <div
                                                    className={
                                                        styles.iconTokenContainer
                                                    }
                                                >
                                                    <Image
                                                        src={icoBTC}
                                                        alt={'btc-token'}
                                                        className={styles.icon}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.buttons}>
                                            <div className={styles.buttonLabel}>
                                                <button
                                                    onClick={handleRedeem}
                                                    className={`button ${
                                                        isRedeeming
                                                            ? 'disabled'
                                                            : 'secondary'
                                                    }`}
                                                >
                                                    {isRedeeming ? (
                                                        <div
                                                            className={
                                                                styles.loading
                                                            }
                                                        >
                                                            Loading
                                                            <ThreeDots color="black" />
                                                        </div>
                                                    ) : (
                                                        <>-</>
                                                    )}
                                                </button>
                                                <div>redeem btc</div>
                                            </div>
                                        </div>
                                        {/* @dev Subsection Loan */}
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                | Current SUSD loan
                                            </div>
                                            <div className={styles.value}>
                                                <span className={styles.color}>
                                                    {loan === '0.00'
                                                        ? '0'
                                                        : loan}
                                                </span>
                                                <div
                                                    className={
                                                        styles.iconTokenContainer
                                                    }
                                                >
                                                    <Image
                                                        src={icoSYRON}
                                                        alt={'syron-token'}
                                                        className={styles.icon}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.buttons}>
                                            <div className={styles.buttonLabel}>
                                                <button
                                                    onClick={updateBalance}
                                                    className={`button ${
                                                        isLoading
                                                            ? 'disabled'
                                                            : 'secondary'
                                                    }`}
                                                >
                                                    {isLoading ? (
                                                        <div
                                                            className={
                                                                styles.loading
                                                            }
                                                        >
                                                            Loading
                                                            <ThreeDots color="black" />
                                                        </div>
                                                    ) : (
                                                        <>+</>
                                                    )}
                                                </button>
                                                <div>draw susd</div>
                                            </div>
                                        </div>
                                        <div className={styles.txtRow}>
                                            This action borrows Syron SUSD
                                            against your BTC collateral, adding
                                            it to your account&apos;s SUSD
                                            balance.
                                        </div>
                                    </div>

                                    <div className={styles.subtitleLabel}>
                                        {/* <div className={styles.iconContainer}>
                                                <Image
                                                    src={icoThunder}
                                                    alt={'syron-usd'}
                                                    className={styles.icon}
                                                />
                                            </div> */}
                                        account balance
                                    </div>
                                    <div className={styles.boxWrapperInner}>
                                        {/* @dev Subsection Balance */}
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                | Available SUSD balance
                                            </div>
                                            <div className={styles.value}>
                                                <span className={styles.color}>
                                                    {syronBal === '0.00'
                                                        ? '0'
                                                        : syronBal}
                                                </span>
                                                <div
                                                    className={
                                                        styles.iconTokenContainer
                                                    }
                                                >
                                                    <Image
                                                        src={icoSYRON}
                                                        alt={'syron-token'}
                                                        className={styles.icon}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.buttons}>
                                            <div className={styles.buttonLabel}>
                                                <button
                                                    onClick={updateWithdraw}
                                                    className={
                                                        'button secondary'
                                                    }
                                                >
                                                    ↗
                                                </button>
                                                <div>Withdraw on bitcoin</div>
                                            </div>
                                        </div>
                                        <div className={styles.subsectionSIWB}>
                                            <div className={styles.buttons}>
                                                {!isIdentified ? (
                                                    <AuthGuard>
                                                        <button
                                                            onClick={() =>
                                                                updateSend(
                                                                    false
                                                                )
                                                            }
                                                            // className={`button secondary ${styles.customButton}`}
                                                            className={`button secondary`}
                                                        >
                                                            send syron to btc
                                                            address
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateSend(true)
                                                            }
                                                            className={`button secondary`}
                                                        >
                                                            send syron to icp
                                                            address
                                                        </button>
                                                        <button
                                                            onClick={updateBuy}
                                                            className={`button secondary`}
                                                        >
                                                            convert syron to
                                                            bitcoin
                                                        </button>
                                                    </AuthGuard>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                updateSend(
                                                                    false
                                                                )
                                                            }
                                                            // className={`button secondary ${styles.customButton}`}
                                                            className={`button secondary`}
                                                        >
                                                            send syron to btc
                                                            address
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                updateSend(true)
                                                            }
                                                            className={`button secondary`}
                                                        >
                                                            send syron to icp
                                                            address
                                                        </button>
                                                        <button
                                                            onClick={updateBuy}
                                                            className={`button secondary`}
                                                        >
                                                            convert syron to
                                                            bitcoin
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {/* <div className={styles.txtRow}>
                                            To buy BTC with your &apos;Available
                                            SUSD balance&apos;, make sure to
                                            Sign In With Bitcoin & click the
                                            &apos;Buy BTC&apos; button.
                                        </div> */}
                                    </div>
                                </>
                            ) : (
                                <div style={{ fontSize: '0.8rem' }}>
                                    Loading your Syron account...
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ fontSize: '0.8rem' }}>
                            Connect Wallet to access your Tyron account
                        </div>
                    )}
                </div>

                {/* @dev: public */}
                <div className={styles.cardActiveWrapper}>
                    <div
                        className={
                            active === 'GetSyron' ||
                            active === 'GetSyronRunes' ||
                            active === 'LiquidSyron'
                                ? styles.cardTitle
                                : styles.cardNoTitle
                        }
                    >
                        <div className={styles.title}>Be Your Own ₿ank</div>

                        {/* <div className={styles.icoWrapper}>
                            <Image
                                src={active === 'GetSyron' ? icoUp : icoDown}
                                alt="toggle-ico"
                            />
                        </div> */}
                    </div>
                    {/* <br />
                    <div className={styles.titleForm2}>
                        Syron is a Bitcoin-backed stablecoin protocol - Deposit
                        BTC to borrow stablecoins
                    </div>
                    <div className={styles.txtRowInfo}>
                        Every loan is secured with 150% collateral in BTC:
                    </div>
                    <ul>
                        <li className={styles.txtRowInfo}>
                            Your Safety Deposit ₿ox holds $1.50 in BTC for every
                            dollar you receive
                        </li>
                        <li className={styles.txtRowInfo}>
                            Two-thirds of your BTC deposits can be borrowed in{' '}
                            <span className={styles.noBreak}>Syron SUSD</span>
                        </li>
                    </ul>
                    <div className={styles.txtRowInfo}>
                        You can withdraw Syron to your self-custodial Bitcoin
                        wallet as <span className={styles.noBreak}>BRC-20</span>{' '}
                        or Runes:
                    </div>
                    <br /> */}
                    <div className={styles.tabWrapper}>
                        <div
                            onClick={() =>
                                active !== 'GetSyron'
                                    ? toggleActive('GetSyron')
                                    : null
                            }
                            className={
                                active === 'GetSyron'
                                    ? styles.cardSelect
                                    : styles.card
                            }
                        >
                            {/* <div className={styles.iconGoldContainer}>
                                    <Image
                                        src={icoPrint}
                                        alt={'print-syron'}
                                        className={styles.icon}
                                    />
                                </div> */}
                            Mint SYRON BRC-20
                        </div>
                        <div
                            onClick={() =>
                                active !== 'GetSyronRunes'
                                    ? toggleActive('GetSyronRunes')
                                    : null
                            }
                            className={
                                active === 'GetSyronRunes'
                                    ? styles.cardSelect
                                    : styles.card
                            }
                        >
                            {/* <div className={styles.iconGoldContainer}>
                                    <Image
                                        src={icoPrint}
                                        alt={'print-syron'}
                                        className={styles.icon}
                                    />
                                </div> */}
                            mint RUNE•DOLLAR
                        </div>
                        {/* <div
                            onClick={() =>
                                //toast.info('Coming soon')
                                active !== 'LiquidSyron'
                                    ? toggleActive('LiquidSyron')
                                    : null
                            }
                            className={
                                active === 'LiquidSyron'
                                    ? styles.cardSelect
                                    : styles.card
                            }
                        >
                            <div className={styles.iconGoldContainer}>
                                    <Image
                                        src={icoEarn}
                                        alt={'earn-bitcoin'}
                                        className={styles.icon}
                                    />
                                </div>
                            Earn Bitcoin
                        </div> */}
                    </div>

                    {active === 'GetSyron' && (
                        <div className={styles.cardSub}>
                            <div className={styles.wrapper}>
                                <SyronForm
                                    type={active}
                                    startPair={start_pair}
                                />
                            </div>
                        </div>
                    )}
                    {active === 'GetSyronRunes' && (
                        <div className={styles.cardSub}>
                            <div className={styles.wrapper}>
                                <SyronForm
                                    type={active}
                                    startPair={start_pair}
                                />
                            </div>
                        </div>
                    )}
                    {active === 'LiquidSyron' && (
                        <div className={styles.cardSub}>
                            <div className={styles.wrapper}>
                                <SyronForm
                                    type="liquid"
                                    startPair={start_pair}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

export default Component
