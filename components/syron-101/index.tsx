import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { Big, _0 } from '../../src/utils/big'
import { $syron } from '../../src/store/syron'
import { useSiwbSessionStore } from '../../src/store/siwb_session'
import { useStore } from 'react-stores'
import useICPHook from '../../src/hooks/useICP'
import { toast } from 'react-toastify'
import { extractRejectText } from '../../src/utils/unisat/utils'
import { unisatBalance } from '../../src/utils/unisat/httpUtils'
import { WithdrawModal, SendModal, BuyModal, WalletConnection } from '..'
import ThreeDots from '../Spinner/ThreeDots'
import LoadingSpinner from '../LoadingSpinner'
import icoPrint from '../../src/assets/icons/ico_print_syron.svg'
import icoEarn from '../../src/assets/icons/ico_earn_bitcoin.svg'
import AuthGuard from '../AuthGuard'
import { useSiwbIdentity } from 'ic-use-siwb-identity'
import { DelegationIdentity } from '@dfinity/identity'
import SyronInfoCard from './SyronInfoCard'
import { DepositRunes } from '../DepositRunes'
import { useMempoolHook } from '../../src/hooks/useMempool'
import { $xr } from '../../src/store/xr'
import CollateralRatioProgressBar from './CollateralRatioProgressBar'
import { useWalletInfoStore } from '../../src/store/wallet_info'
import { getMempoolUrl, getWalletWindow } from '../../src/config/wallet'
import { DepositBTC } from '../DepositBitcoin/DepositPsbt'
import SessionTransactions from '../Transactions/SessionTransactions'

const isDev = process.env.NODE_ENV !== 'production'

function Component() {
    const { getXR } = useMempoolHook()
    const { wallet, setWalletBalance } = useWalletInfoStore()
    // Derive connection state from wallet address
    const isWalletConnected = !!wallet.address
    const syron = useStore($syron)
    const xr = useStore($xr)
    const { siwb_identity, setSiwbIdentity, clearSiwbSession } =
        useSiwbSessionStore()
    const { identity, clear } = useSiwbIdentity()
    const { t } = useTranslation()
    const { redemptionGas, redeemBTC, getBox, updateSyronBalance } =
        useICPHook()

    const [active, setActive] = useState('')
    const [sdb, setSDB] = useState('')
    const [satsDeposited, setSatsDeposited] = useState(_0)
    const [satsCollateral, setSatsCollateral] = useState('')
    const [collateralRatio, setCollateralRatio] = useState('')
    const [loan, setLoan] = useState('')
    const [syronBal, setSyronBal] = useState('')
    const [isIdentified, setIsIdentified] = useState(false)
    const [isRedeeming, setIsRedeeming] = useState(false)
    const [showWithdrawModal, setWithdrawModal] = React.useState(false)
    const [stablecoin, setStablecoin] = React.useState<'BRC-20' | 'RUNES'>(
        'BRC-20'
    )
    const [showSendModal, setSendModal] = React.useState(false)
    const [isICP, setIsICP] = React.useState(false)
    const [showBuyModal, setBuyModal] = React.useState(false)
    const [showDepositRunesModal, setShowDepositRunesModal] =
        React.useState(false)
    const [showDepositBTCModal, setShowDepositBTCModal] = React.useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshingCollateral, setIsRefreshingCollateral] = useState(false)
    const [isRefreshingBalance, setIsRefreshingBalance] = useState(false)

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
                symbol: 'SUSD',
                decimals: 8,
            },
        },
    ]
    const clearRef = useRef(clear)

    const closeAllModals = useCallback(() => {
        setWithdrawModal(false)
        setSendModal(false)
        setShowDepositRunesModal(false)
        setShowDepositBTCModal(false)
        setBuyModal(false)
    }, [])

    const closeSiwbModals = useCallback(() => {
        setSendModal(false)
        setBuyModal(false)
    }, [])

    useEffect(() => {
        clearRef.current = clear
    }, [clear])

    useEffect(() => {
        closeAllModals()
    }, [closeAllModals])

    useEffect(() => {
        closeSiwbModals()
    }, [closeSiwbModals])

    useEffect(() => {
        // Reset authentication if wallet is disconnected
        if (!isWalletConnected) {
            console.log('Wallet disconnected, resetting authentication')
            setIsIdentified(false)
            closeAllModals()
            clearSiwbSession()
            clearRef.current?.() // Clear the SIWB identity from the hook
            return
        }

        let current_id: DelegationIdentity
        if (siwb_identity !== null) {
            current_id = siwb_identity
            console.log('SIWB session still present')
        } else if (identity) {
            current_id = identity
        } else {
            console.log('SIWB session is invalid')
            setIsIdentified(false)
            closeSiwbModals()
            clearSiwbSession()
            clearRef.current?.() // Clear the SIWB identity from the hook
            return
        }

        const id_str = JSON.stringify(current_id, null, 2)
        console.log('SIWB Identity: ', id_str)
        const match = id_str.match(/"expiration":\s*"([0-9a-fA-F]+)"/)
        const expiration = match ? match[1] : null

        if (expiration !== null) {
            const exp = parseInt(expiration, 16) / 1e6
            console.log(
                `SIWB Expiration is ${new Date(exp).toISOString()} and current time is ${new Date().toISOString()}`
            )

            const now = Math.floor(Date.now())
            if (exp > now) {
                console.log('SIWB session not expired')
                setIsIdentified(true)

                if (siwb_identity === null && identity) {
                    setSiwbIdentity(identity)
                    console.log('SIWB session saved')
                }
            } else {
                console.log('SIWB session has expired')
                setIsIdentified(false)
                closeSiwbModals()
                clearSiwbSession()
                clearRef.current?.() // Clear the SIWB identity from the hook
            }
        } else {
            console.error('SIWB session not found')
        }
    }, [
        identity,
        siwb_identity,
        isWalletConnected,
        showSendModal,
        showWithdrawModal,
        showDepositRunesModal,
        showDepositBTCModal,
        clearSiwbSession,
        closeSiwbModals,
        closeAllModals,
        setSiwbIdentity,
    ])

    useEffect(() => {
        if (syron.sdb === '' || !isWalletConnected) {
            return
        }

        if (isDev) {
            console.log('Syron State: ', JSON.stringify(syron, null, 2))
        }

        setSDB(syron!.sdb)
        setSatsDeposited(syron!.sdb_btc)

        const collateral = syron.syron_btc.div(1e8).round(8, 0).toString()
        setSatsCollateral(collateral)

        const loan_ = syron.syron_usd_loan.div(1e8).round(2, 0).toString()
        setLoan(loan_)

        const bal_ = syron.syron_usd_bal.div(1e8).round(2, 0).toString()
        setSyronBal(bal_)

        const applyExchangeRate = (btcPrice: number) => {
            if (syron!.syron_usd_loan.eq(0)) {
                setCollateralRatio('')
                return
            }

            if (!Number.isFinite(btcPrice) || btcPrice <= 0) {
                return
            }

            const collateral_ratio = syron.syron_btc
                .mul(btcPrice)
                .div(syron!.syron_usd_loan)
                .mul(100)
                .round(1, 1)
                .toString()
            setCollateralRatio(collateral_ratio)
        }

        const cachedRate = xr?.rate
        if (Number.isFinite(cachedRate) && cachedRate! > 0) {
            applyExchangeRate(cachedRate!)
            return
        }

        let cancelled = false

        getXR()
            .then((btcPrice) => {
                if (!cancelled) {
                    applyExchangeRate(btcPrice)
                }
            })
            .catch((error) => {
                console.error('Error fetching BTC price:', error)
            })

        return () => {
            cancelled = true
        }
    }, [syron, xr?.rate, getXR, isWalletConnected])

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

    const updateWithdraw = (token: 'BRC-20' | 'RUNES') => {
        setStablecoin(token)
        setWithdrawModal(true)
    }
    const updateSend = (is_icp: boolean) => {
        setSendModal(true)
        setIsICP(is_icp)
    }
    const updateBuy = () => {
        setBuyModal(true)
    }
    const updateDepositRunes = () => {
        setShowDepositRunesModal(true)
    }
    const updateDepositBTC = () => {
        setShowDepositBTCModal(true)
    }

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
                    "You don't have an active loan. Click the 'DRAW SUSD' button first to borrow Syron against your BTC deposits.",
                    { autoClose: false, closeOnClick: true }
                )
                return
            } else if (balance >= loan_amt) {
                await redeemBTC(wallet.address!)
                toast.info(`You have redeemed your BTC!`, {
                    autoClose: false,
                    closeOnClick: true,
                })
            } else {
                toast.info(
                    `You have to repay the full amount of your loan to redeem your BTC deposit, and your current balance is $${balance.toFixed(
                        2
                    )}. Deposit $${(loan_amt - balance).toFixed(
                        2
                    )} into your Safety Deposit ₿ox before proceeding.`,
                    { autoClose: false, closeOnClick: true }
                )
            }
            // else if (balance < loan_amt) {
            //     // @dev the SUSD balance will be used to repay the loan
            //     let loan_balance = loan_amt - balance

            //     // @dev Check SYRON BRC-20 balance in Box address
            //     console.log('Checking SYRON BRC-20 balance in Box...')
            //     await fetch(`/api/get-unisat-brc20-balance?id=${sdb}`)
            //         .then(async (response) => {
            //             const res = await response.json()
            //             if (res.error) {
            //                 throw new Error(res.error)
            //             }

            //             console.log(
            //                 'outcall response: SYRON BRC-20 balance in box',
            //                 JSON.stringify(res, null, 2)
            //             )

            //             const brc20_balance = parseFloat(
            //                 res.detail[0].overallBalance
            //             ) // @review make sure that the balance has at least 1 confirmation

            //             const limit = 0.02 // @governance
            //             if (brc20_balance < loan_balance - limit) {
            //                 loan_balance = loan_balance - brc20_balance

            //                 throw new Error(
            //                     `You have to repay the full amount of your loan to redeem your BTC collateral, and your current SYRON BRC-20 balance is $${brc20_balance.toFixed(
            //                         2
            //                     )}. Deposit $${loan_balance.toFixed(
            //                         2
            //                     )} SYRON BRC-20 into your Deposit ₿ox before proceeding.`
            //                 )
            //             }

            //             //return await redemptionGas(btc_wallet?.btc_addr!)
            //         })
            //         .catch((error) => {
            //             throw error
            //         })
            //     // @dev Send inscribe-transfer UTXO transaction on Bitcoin
            //     console.log('Sending inscribe-transfer UTXO transaction...')

            //     // Inscribe the loan_balance amount to the box address
            //     const tick = 'SYRON' // @brc20

            //     let feeRate = await mempoolFeeRate()
            //     // Add a fee to cover the redeption gas from deposit box
            //     let deposit = (150 * feeRate).toString() // @vb

            //     // Get inscription order
            //     let order = await fetch(
            //         `/api/post-unisat-brc20-transfer?receiveAddress=${sdb}&feeRate=${feeRate}&devAddress=${sdb}&devFee=${deposit}&brc20Ticker=${tick}&brc20Amount=${loan_balance}`
            //     )
            //         .then((response) => response.json())
            //         .then((res) => {
            //             console.log(JSON.stringify(res, null, 2))
            //             return res.data
            //         })
            //         .catch((error) => {
            //             throw error
            //         })

            //     // @dev Send inscribe-transfer UTXO transaction on Bitcoin (#1)
            //     await unisat
            //         .sendBitcoin(order.payAddress, order.amount, order.feeRate)
            //         .then(async (txId) => {
            //             console.log('Transaction ID #1', txId)

            //             // @dev Make sure that the Bitcoin transaction (#2) is confirmed
            //             await transaction_status(txId)
            //                 .then(async (_res) => {
            //                     const order_ = await fetch(
            //                         `/api/get-unisat-brc20-order?id=${order.orderId}`
            //                     )
            //                         .then((response) => response.json())
            //                         .then((res) => {
            //                             return res.data
            //                         })
            //                         .catch((error) => {
            //                             throw error
            //                         })

            //                     console.log(
            //                         'Order From OrderId',
            //                         JSON.stringify(order_, null, 2)
            //                     )
            //                     const inscription_id =
            //                         order_.files[0].inscriptionId

            //                     return inscription_id.slice(0, -2)
            //                 })
            //                 .then(async (txId2) => {
            //                     console.log('Transaction ID #2', txId2)
            //                     await transaction_status(txId2).then(
            //                         async () => {
            //                             await redeemBitcoin(txId2)
            //                             // @review add retry option when the canister fails but the SDB received the inscription
            //                             toast.info(
            //                                 `You have redeemed your BTC!`,
            //                                 {
            //                                     autoClose: false,
            //                                     closeOnClick: true,
            //                                 }
            //                             )
            //                         }
            //                     )
            //                 })
            //         })
            // }
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

            // await redeemBTC(btc_wallet?.btc_addr!, tx_id)

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

    const updateSession = async () => {
        const walletWindow = getWalletWindow(wallet.type)

        // Update wallet balance using the latest balance value
        const balance = await walletWindow.getBalance()
        if (balance) {
            const balanceAmount =
                typeof balance === 'number' ? balance : balance.total
            if (balanceAmount !== undefined) {
                setWalletBalance(Big(balanceAmount))
            }
        }

        await getBox(wallet.address!)
        console.log('Account up to date.')
    }

    const refreshCollateral = async () => {
        try {
            setIsRefreshingCollateral(true)
            // Refresh BTC deposits
            if (syron?.sdb) {
                const balance = await unisatBalance(syron.sdb)
                setSatsDeposited(Big(balance))
            }
            await updateSession()
        } catch (error) {
            console.error('Error refreshing collateral:', error)
            toast.error('Failed to refresh collateral data')
        } finally {
            setIsRefreshingCollateral(false)
        }
    }

    const refreshBalance = async () => {
        try {
            setIsRefreshingBalance(true)
            await updateSession()
        } catch (error) {
            console.error('Error refreshing balance:', error)
            toast.error('Failed to refresh balance data')
        } finally {
            setIsRefreshingBalance(false)
        }
    }

    const updateBalance = async () => {
        try {
            setIsLoading(true)
            await updateSyronBalance(wallet.address!)
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

    const MetallicRefreshIcon = () => {
        return (
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Outer metallic effect glow */}
                <defs>
                    <linearGradient
                        id="refreshMetallic"
                        x1="0"
                        y1="0"
                        x2="24"
                        y2="24"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#f8fafc" />
                        <stop offset="0.35" stopColor="#e2e8f0" />
                        <stop offset="0.7" stopColor="#cbd5f5" />
                        <stop offset="1" stopColor="#94a3b8" />
                    </linearGradient>
                    <linearGradient
                        id="refreshMetallicSecondary"
                        x1="24"
                        y1="24"
                        x2="0"
                        y2="0"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#94a3b8" />
                        <stop offset="0.45" stopColor="#dbeafe" />
                        <stop offset="1" stopColor="#f8fafc" />
                    </linearGradient>
                    <filter
                        id="metallicShadow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="1"
                            stdDeviation="0.8"
                            floodColor="rgba(148, 163, 184, 0.45)"
                        />
                        <feDropShadow
                            dx="0"
                            dy="0"
                            stdDeviation="1.5"
                            floodColor="rgba(255, 255, 255, 0.6)"
                        />
                    </filter>
                </defs>
                <path
                    d="M1 4v6h6"
                    stroke="url(#refreshMetallic)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#metallicShadow)"
                />
                <path
                    d="M23 20v-6h-6"
                    stroke="url(#refreshMetallic)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#metallicShadow)"
                />
                <path
                    d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                    stroke="url(#refreshMetallicSecondary)"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#metallicShadow)"
                />
            </svg>
        )
    }

    if (isWalletConnected && showWithdrawModal) {
        return (
            <WithdrawModal
                ssi={wallet.address!}
                sdb={sdb}
                balance={syronBal ? Big(syronBal) : _0}
                stablecoin={stablecoin}
                show={showWithdrawModal}
                onClose={() => setWithdrawModal(false)}
            />
        )
    } else if (isWalletConnected && showSendModal) {
        return (
            <SendModal
                ssi={wallet.address!}
                sdb={sdb}
                balance={syronBal ? Big(syronBal) : _0}
                show={showSendModal}
                onClose={() => setSendModal(false)}
                isICP={isICP}
            />
        )
    } else if (isWalletConnected && showBuyModal) {
        return (
            <BuyModal
                ssi={wallet.address!}
                sdb={sdb}
                balance={syronBal ? Big(syronBal) : _0}
                show={showBuyModal}
                onClose={() => setBuyModal(false)}
            />
        )
    } else if (isWalletConnected && showDepositRunesModal) {
        return (
            <DepositRunes
                open={showDepositRunesModal}
                onClose={() => setShowDepositRunesModal(false)}
                sdbAddress={syron?.sdb}
            />
        )
    } else if (isWalletConnected && showDepositBTCModal) {
        return (
            <DepositBTC
                open={showDepositBTCModal}
                onClose={() => setShowDepositBTCModal(false)}
                sdbAddress={syron?.sdb}
            />
        )
    } else {
        return (
            <div className={styles.container}>
                <div className={styles.heroSection}>
                    <SyronInfoCard />
                    <div className={styles.heroCTA}>
                        <WalletConnection variant="hero" />
                    </div>
                </div>

                {/* @dev: private SDB */}
                <div className={styles.boxWrapper}>
                    {isWalletConnected ? (
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

                                    {/* <div className={styles.subtitleLabel}>
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
                                                    const url = getMempoolUrl(
                                                        `/address/${syron?.sdb}`
                                                    )
                                                    window.open(url)
                                                }}
                                            >
                                                Box Explorer ↗
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
                                                        wallet.address as string
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
                                                    {wallet.address}
                                                </div>
                                            </div>
                                            <div
                                                className={styles.link}
                                                onClick={() => {
                                                    const url = getMempoolUrl(
                                                        `/address/${wallet.address}`
                                                    )
                                                    window.open(url)
                                                }}
                                            >
                                                Wallet Explorer ↗
                                            </div>
                                        </div>
                                    </div> */}

                                    <div className={styles.subtitleLabel}>
                                        {/* <div className={styles.iconContainer}>
                                                <Image
                                                    src={icoBalance}
                                                    alt={'btc-deposited'}
                                                    className={styles.icon}
                                                />
                                            </div> */}
                                        <div
                                            className={styles.titleWithRefresh}
                                        >
                                            <span>
                                                manage collateral & loan
                                            </span>
                                            <button
                                                onClick={refreshCollateral}
                                                disabled={
                                                    isRefreshingCollateral
                                                }
                                                className={styles.refreshButton}
                                                title="Refresh collateral data"
                                            >
                                                {isRefreshingCollateral ? (
                                                    <LoadingSpinner size="md" />
                                                ) : (
                                                    <MetallicRefreshIcon />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.boxWrapperInner}>
                                        <div className={styles.stepIndicator}>
                                            <div className={styles.step}>
                                                <span
                                                    className={
                                                        styles.stepNumber
                                                    }
                                                >
                                                    1
                                                </span>
                                                <span
                                                    className={styles.stepLabel}
                                                >
                                                    DEPOSIT
                                                </span>
                                            </div>
                                            <div className={styles.stepArrow}>
                                                →
                                            </div>
                                            <div className={styles.step}>
                                                <span
                                                    className={
                                                        styles.stepNumber
                                                    }
                                                >
                                                    2
                                                </span>
                                                <span
                                                    className={styles.stepLabel}
                                                >
                                                    BORROW
                                                </span>
                                            </div>
                                        </div>
                                        <div className={styles.txtRowsInfo}>
                                            <div className={styles.stepRow}>
                                                <span
                                                    className={
                                                        styles.stepNumber
                                                    }
                                                >
                                                    1
                                                </span>{' '}
                                                <span
                                                    className={styles.stepLabel}
                                                >
                                                    deposit bitcoin
                                                </span>
                                            </div>
                                            To add collateral, send Bitcoin to
                                            your Safety Deposit ₿ox address.
                                            <br />- Minimum deposit: 3,000 sats
                                            (0.00003 BTC).
                                            <div className={styles.buttons}>
                                                <div
                                                    className={
                                                        styles.buttonLabel
                                                    }
                                                >
                                                    <button
                                                        onClick={
                                                            updateDepositBTC
                                                        }
                                                        className={`button primary ${styles.mainButton}`}
                                                    >
                                                        <span
                                                            className={
                                                                styles.mainButtonIcon
                                                            }
                                                        >
                                                            ₿
                                                        </span>
                                                    </button>
                                                    <div
                                                        className={
                                                            styles.buttonLabelText
                                                        }
                                                    >
                                                        Deposit BTC
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={styles.quickTip}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        marginRight: 4,
                                                    }}
                                                >
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 20 20"
                                                        fill="none"
                                                        style={{
                                                            marginRight:
                                                                '0.35em',
                                                        }}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <defs>
                                                            <radialGradient
                                                                id="metalGradient"
                                                                cx="50%"
                                                                cy="35%"
                                                                r="70%"
                                                            >
                                                                <stop
                                                                    offset="0%"
                                                                    stopColor="#f8fafc"
                                                                />
                                                                <stop
                                                                    offset="65%"
                                                                    stopColor="#94a3b8"
                                                                />
                                                                <stop
                                                                    offset="97%"
                                                                    stopColor="#64748b"
                                                                />
                                                            </radialGradient>
                                                            <linearGradient
                                                                id="infoOutlineGradient"
                                                                x1="0"
                                                                y1="0"
                                                                x2="20"
                                                                y2="20"
                                                                gradientUnits="userSpaceOnUse"
                                                            >
                                                                <stop stopColor="#f8fafc" />
                                                                <stop
                                                                    offset="0.45"
                                                                    stopColor="#e2e8f0"
                                                                />
                                                                <stop
                                                                    offset="0.8"
                                                                    stopColor="#94a3b8"
                                                                />
                                                                <stop
                                                                    offset="1"
                                                                    stopColor="#64748b"
                                                                />
                                                            </linearGradient>
                                                            <filter
                                                                id="metalShadow"
                                                                x="-20%"
                                                                y="-20%"
                                                                width="170%"
                                                                height="170%"
                                                            >
                                                                <feDropShadow
                                                                    dx="0"
                                                                    dy="1"
                                                                    stdDeviation="0.7"
                                                                    floodColor="rgba(148,163,184,0.14)"
                                                                />
                                                                <feDropShadow
                                                                    dx="0"
                                                                    dy="0"
                                                                    stdDeviation="2.1"
                                                                    floodColor="rgba(255,255,255,0.38)"
                                                                />
                                                            </filter>
                                                        </defs>
                                                        <circle
                                                            cx="10"
                                                            cy="10"
                                                            r="8"
                                                            fill="url(#metalGradient)"
                                                            stroke="url(#infoOutlineGradient)"
                                                            strokeWidth="1.4"
                                                            filter="url(#metalShadow)"
                                                        />
                                                        <text
                                                            x="10"
                                                            y="15"
                                                            textAnchor="middle"
                                                            fontSize="10.2"
                                                            fill="#525875"
                                                            fontWeight="bold"
                                                            fontFamily="Arial, Helvetica, sans-serif"
                                                            filter="url(#metalShadow)"
                                                        >
                                                            i
                                                        </text>
                                                    </svg>
                                                </span>
                                                Deposits under 3,000 sats are
                                                automatically set aside for
                                                network fees.
                                            </span>
                                        </div>
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                BTC deposited
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
                                        {Number(satsDeposited.div(1e8)) ===
                                            0 && (
                                            <div
                                                className={
                                                    styles.placeholderMessage
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.placeholderText
                                                    }
                                                >
                                                    Deposit BTC to get started
                                                </span>
                                            </div>
                                        )}
                                        <div className={styles.txtRowsInfo}>
                                            <div className={styles.stepRow}>
                                                <span
                                                    className={
                                                        styles.stepNumber
                                                    }
                                                >
                                                    2
                                                </span>{' '}
                                                <span
                                                    className={styles.stepLabel}
                                                >
                                                    BORROW STABLECOIN
                                                </span>
                                            </div>
                                            Borrow SUSD with your Bitcoin
                                            collateral &mdash; it&rsquo;s
                                            instantly added to your account
                                            balance.
                                            <div className={styles.buttons}>
                                                <div
                                                    className={
                                                        styles.buttonLabel
                                                    }
                                                >
                                                    <button
                                                        onClick={() =>
                                                            updateBalance()
                                                        }
                                                        className={`button primary ${styles.mainButton} ${
                                                            isLoading
                                                                ? 'disabled'
                                                                : ''
                                                        }`}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <div
                                                                className={
                                                                    styles.loading
                                                                }
                                                            >
                                                                <ThreeDots color="white" />
                                                            </div>
                                                        ) : (
                                                            <span
                                                                className={
                                                                    styles.mainButtonIcon
                                                                }
                                                            >
                                                                +
                                                            </span>
                                                        )}
                                                    </button>
                                                    <div
                                                        className={
                                                            styles.buttonLabelText
                                                        }
                                                    >
                                                        borrow susd
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                | Collateral balance
                                            </div>
                                            <div className={styles.value}>
                                                <span className={styles.color}>
                                                    {satsCollateral}
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
                                        {/* <div className={styles.buttons}>
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
                                        </div> */}
                                        {/* @dev Subsection Loan */}
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                | Current loan
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
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                • Collateralization
                                            </div>
                                            <div className={styles.value}>
                                                <span className={styles.color}>
                                                    {collateralRatio}%
                                                </span>

                                                {/* Collateral ratio indicator */}
                                                {collateralRatio && (
                                                    <div
                                                        className={
                                                            styles.collateralIndicator
                                                        }
                                                    >
                                                        {parseFloat(
                                                            collateralRatio
                                                        ) >= 150 ? (
                                                            <span
                                                                className={
                                                                    styles.greenCheckmark
                                                                }
                                                                title="Excellent collateral ratio"
                                                            >
                                                                ✓
                                                            </span>
                                                        ) : parseFloat(
                                                              collateralRatio
                                                          ) >= 130 ? (
                                                            <span
                                                                className={
                                                                    styles.yellowWarning
                                                                }
                                                                title="Moderate collateral ratio"
                                                            >
                                                                ⚠
                                                            </span>
                                                        ) : (
                                                            <span
                                                                className={
                                                                    styles.redAlert
                                                                }
                                                                title="Low collateral ratio - consider adding more collateral"
                                                            >
                                                                ⚠
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Collateral ratio progress bar */}
                                        {collateralRatio && (
                                            <div
                                                className={
                                                    styles.collateralProgressBar
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.progressBarContainer
                                                    }
                                                >
                                                    <CollateralRatioProgressBar
                                                        collateralRatio={
                                                            collateralRatio
                                                        }
                                                        syron={syron}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.subtitleLabel}>
                                        {/* <div className={styles.iconContainer}>
                                                <Image
                                                    src={icoThunder}
                                                    alt={'syron-usd'}
                                                    className={styles.icon}
                                                />
                                            </div> */}
                                        <div
                                            className={styles.titleWithRefresh}
                                        >
                                            <span>account balance</span>
                                            <button
                                                onClick={refreshBalance}
                                                disabled={isRefreshingBalance}
                                                className={styles.refreshButton}
                                                title="Refresh account balance"
                                            >
                                                {isRefreshingBalance ? (
                                                    <LoadingSpinner size="md" />
                                                ) : (
                                                    <MetallicRefreshIcon />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.boxWrapperInner}>
                                        {/* @dev Subsection Balance */}
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                | SUSD balance
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
                                                    onClick={updateDepositRunes}
                                                    className={`${styles.mechanicalButton} ${styles.mechanicalWithdraw}`}
                                                >
                                                    <i className="ri-align-bottom"></i>
                                                </button>
                                                <div
                                                    className={
                                                        styles.buttonLabelText
                                                    }
                                                >
                                                    Deposit RUNES
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={styles.buttonSeparator}
                                        />
                                        <div className={styles.buttons}>
                                            <div className={styles.buttonLabel}>
                                                <button
                                                    onClick={() =>
                                                        updateWithdraw('RUNES')
                                                    }
                                                    className={`${styles.mechanicalButton} ${styles.mechanicalWithdraw}`}
                                                >
                                                    <i className="ri-align-top"></i>
                                                </button>
                                                <div
                                                    className={
                                                        styles.buttonLabelText
                                                    }
                                                >
                                                    Withdraw RUNES
                                                </div>
                                            </div>
                                        </div>
                                        {wallet.type === 'unisat' && (
                                            <div className={styles.buttons}>
                                                <div
                                                    className={
                                                        styles.buttonLabel
                                                    }
                                                >
                                                    <button
                                                        onClick={() =>
                                                            updateWithdraw(
                                                                'BRC-20'
                                                            )
                                                        }
                                                        className={`${styles.mechanicalButton} ${styles.mechanicalWithdraw}`}
                                                    >
                                                        <i className="ri-arrow-up-long-line"></i>
                                                    </button>
                                                    <div
                                                        className={
                                                            styles.buttonLabelText
                                                        }
                                                    >
                                                        Withdraw BRC-20
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {!isIdentified && (
                                        <div className={styles.subtitleLabel}>
                                            Unlock more features — sign in with
                                            your wallet
                                        </div>
                                    )}
                                    <div className={styles.boxWrapperInner}>
                                        <div
                                            className={
                                                isIdentified
                                                    ? ''
                                                    : styles.secondaryCardNotSignedIn
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.subsectionSIWB
                                                }
                                            >
                                                <div className={styles.buttons}>
                                                    {!isIdentified ? (
                                                        <AuthGuard>
                                                            <></>
                                                        </AuthGuard>
                                                    ) : (
                                                        <>
                                                            <div
                                                                className={
                                                                    styles.buttonLabel
                                                                }
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        updateSend(
                                                                            false
                                                                        )
                                                                    }
                                                                    className={`${styles.mechanicalButton} ${styles.mechanicalAction}`}
                                                                >
                                                                    <i className="ri-flashlight-line"></i>
                                                                </button>
                                                                <div
                                                                    className={
                                                                        styles.buttonLabelText
                                                                    }
                                                                >
                                                                    send susd
                                                                </div>
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.buttonSeparator
                                                                }
                                                            />
                                                            <div
                                                                className={
                                                                    styles.buttonLabel
                                                                }
                                                            >
                                                                <button
                                                                    onClick={
                                                                        updateBuy
                                                                    }
                                                                    className={`${styles.mechanicalButton} ${styles.mechanicalAction}`}
                                                                >
                                                                    ₿
                                                                </button>
                                                                <div
                                                                    className={
                                                                        styles.buttonLabelText
                                                                    }
                                                                >
                                                                    buy bitcoin
                                                                </div>
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.buttonSeparator
                                                                }
                                                            />
                                                            <div
                                                                className={
                                                                    styles.buttonLabel
                                                                }
                                                            >
                                                                <button
                                                                    onClick={
                                                                        handleRedeem
                                                                    }
                                                                    className={`${styles.mechanicalButton} ${styles.mechanicalAction} ${
                                                                        isRedeeming
                                                                            ? styles.mechanicalDisabled
                                                                            : ''
                                                                    }`}
                                                                    disabled={
                                                                        isRedeeming
                                                                    }
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
                                                                        <i className="ri-user-minus-line"></i>
                                                                    )}
                                                                </button>
                                                                <div
                                                                    className={
                                                                        styles.buttonLabelText
                                                                    }
                                                                >
                                                                    redeem btc
                                                                </div>
                                                            </div>
                                                            {/* <button
                                                            onClick={() =>
                                                                updateSend(true)
                                                            }
                                                            className={`button secondary`}
                                                        >
                                                            send syron to icp
                                                            address
                                                        </button> */}
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
                                    </div>
                                </>
                            ) : (
                                <div style={{ fontSize: '0.8rem' }}>
                                    Loading your Tyron account...
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
                    {/* <div className={styles.tabWrapper}>
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
                            <div className={styles.iconGoldContainer}>
                                <Image
                                    src={icoPrint}
                                    alt={'print-syron'}
                                    className={styles.icon}
                                />
                            </div>
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
                            <div className={styles.iconGoldContainer}>
                                <Image
                                    src={icoEarn}
                                    alt={'earn-bitcoin'}
                                    className={styles.icon}
                                />
                            </div>
                            mint RUNE•DOLLAR
                        </div>
                        <div
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
                        </div>
                    </div> */}

                    {active === 'GetSyronIsOff' && (
                        <div className={styles.cardSub}>
                            <div className={styles.wrapper}>
                                <SyronForm
                                    type={active}
                                    startPair={start_pair}
                                />
                            </div>
                            Earn Bitcoin
                        </div>
                    )}
                    {active === 'GetSyronRunesIsOff' && (
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

                {isWalletConnected && <SessionTransactions />}
            </div>
        )
    }
}

export default Component
