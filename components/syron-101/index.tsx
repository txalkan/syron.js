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
import icoSYRON from '../../src/assets/icons/ssi_SYRON_iso.svg'
import icoThunder from '../../src/assets/icons/ssi_icon_thunder.svg'
import icoShield from '../../src/assets/icons/ssi_icon_shield.svg'
import icoCopy from '../../src/assets/icons/copy.svg'
import Big from 'big.js'
import { $btc_wallet, $syron, $walletConnected } from '../../src/store/syron'
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

Big.PE = 999
const _0 = Big(0)

function Component() {
    const walletConnected = useStore($walletConnected).isConnected
    const syron = useStore($syron)

    const { t } = useTranslation()
    const [active, setActive] = useState('GetSyron')

    const [sdb, setSDB] = useState('')
    const [satsDeposited, setSatsDeposited] = useState(_0)
    const [loan, setLoan] = useState('')
    const [syronBal, setSyronBal] = useState('')

    useEffect(() => {
        if (syron !== null) {
            console.log('Syron State: ', JSON.stringify(syron, null, 2))

            setSDB(syron.sdb)
            setSatsDeposited(syron.sdb_btc)

            const loan_ = syron.syron_usd_loan.div(1e8).round(2, 0).toString()
            setLoan(loan_)
            console.log('SYRON Printed: ', loan_)

            const bal_ = syron.syron_usd_bal.div(1e8).round(2, 0).toString()
            setSyronBal(bal_)
            console.log('SYRON Balance: ', bal_)
        }
    }, [syron?.sdb_btc, syron?.syron_usd_loan, syron?.syron_usd_bal])

    // @dev Read for new BTC deposits every half minute
    useEffect(() => {
        async function readDeposits() {
            await unisatBalance(syron?.sdb!)
                .then((balance) => {
                    console.log('SDB BTC Deposit', balance)
                    setSatsDeposited(Big(balance))
                })
                .catch((error) => {
                    console.error('readDeposits', error)
                })
        }

        if (syron?.sdb) readDeposits()

        const intervalId = setInterval(readDeposits, 0.5 * 60 * 1000)

        return () => clearInterval(intervalId) // Cleanup on unmount
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
                symbol: 'SYRON',
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

            if (sdb === '') {
                throw new Error('SDB Loading error')
            } else if (Number(loan) <= 0) {
                throw new Error('Loan amount is invalid')
            } else {
                await fetch(`/api/get-unisat-brc20-balance?id=${sdb}`)
                    .then(async (response) => {
                        const res = await response.json()
                        if (res.error) {
                            throw new Error(res.error)
                        }

                        console.log(
                            'outcall response - SDB SYRON balance',
                            JSON.stringify(res, null, 2)
                        )

                        const overallBalance = parseFloat(
                            res.detail[0].overallBalance
                        ) // @review make sure that the balance has at least 1 confirmation

                        const loanAmount = parseFloat(loan)

                        const limit = 0.02 // @governance
                        if (overallBalance < loanAmount - limit) {
                            const depositAmount = (
                                loanAmount - overallBalance
                            ).toFixed(2)
                            throw new Error(
                                `You have to repay the full amount of your SYRON loan to redeem your BTC collateral. You need to deposit ${depositAmount} SYRON into your SDB before proceeding.`
                            )
                        }

                        //return await redemptionGas(btc_wallet?.btc_addr!)
                    })
                    .catch((error) => {
                        throw error
                    })

                // @dev Inscribe the loan amount to the SDB
                // 1. The transaction fee rate in sat/vB @gas @network
                let feeRate = await mempoolFeeRate()
                if (!feeRate) {
                    feeRate = 5
                }
                console.log('Fee Rate', feeRate)

                // 2. Add a fee to cover the redeption gas from SDB - let deposit = (Number(gas) + 50).toString()
                let deposit = (700).toString()

                const tick = 'SYRON' // @brc20

                // 3. Get inscription order
                let order = await fetch(
                    `/api/post-unisat-brc20-transfer?receiveAddress=${sdb}&feeRate=${feeRate}&devAddress=${sdb}&devFee=${deposit}&brc20Ticker=${tick}&brc20Amount=${loan}`
                    //`/api/post-unisat-brc20-transfer?receiveAddress=${sdb}&feeRate=${feeRate}&brc20Ticker=${tick}&brc20Amount=${loan}`
                )
                    .then((response) => response.json())
                    .then((res) => {
                        console.log(JSON.stringify(res, null, 2))
                        return res.data
                    })
                    .catch((error) => {
                        throw error
                    })

                // @dev Send inscription transaction on Bitcoin (#1)
                await unisat
                    .sendBitcoin(order.payAddress, order.amount, order.feeRate)
                    .then(async (txId) => {
                        console.log('Transaction ID #1', txId)

                        // @dev 2) Make sure that the Bitcoin transaction (#2) is confirmed
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
                                            { autoClose: false }
                                        )
                                    }
                                )
                            })
                    })
            }
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
                    `Repay the SYRON loan to redeem your BTC collateral. You have to deposit ${loan} SYRON in total to your SDB.`,
                    { autoClose: false }
                )
            } else if (
                typeof err === 'object' &&
                Object.keys(err!).length !== 0
            ) {
                toast.error(
                    <div className={styles.error}>
                        <p>
                            Your request was rejected. For assistance, please
                            let us know on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                @TyronDAO
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
                                className={styles.link}
                            >
                                @TyronDAO
                            </a>
                            .
                        </p>
                    </div>,
                    { autoClose: false }
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
        await getBox(address, false)
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
                                className={styles.link}
                            >
                                @TyronDAO
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
                    }
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <p style={{ color: 'red' }}>
                            {extractRejectText(String(error))}
                        </p>
                        <p>
                            For assistance with this error, please join us on
                            Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                @TyronDAO
                            </a>
                            .
                        </p>
                    </div>,
                    { autoClose: false }
                )
            }
        } finally {
            setIsLoading(false)
        }
    }

    const [showWithdrawModal, setWithdrawModal] = React.useState(false)
    const updateWithdraw = async () => {
        setWithdrawModal(true)
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(syron?.sdb as string)

            toast.info(
                `Your Safety Deposit ₿ox (SDB) address has been copied to your clipboard.`
            )
        } catch (error) {
            console.error('Failed to copy text:', error)
        }
    }

    // const { setWalletProvider } = useSiwbIdentity()

    const [showSendModal, setSendModal] = React.useState(false)
    const updateSend = async () => {
        setSendModal(true)
    }

    const [showBuyModal, setBuyModal] = React.useState(false)
    const updateBuy = async () => {
        setBuyModal(true)
    }

    if (showWithdrawModal) {
        return (
            <WithdrawModal
                ssi={btc_wallet?.btc_addr!}
                sdb={sdb}
                balance={syronBal ? Big(syronBal) : _0}
                show={showWithdrawModal}
                onClose={() => setWithdrawModal(false)}
            />
        )
    } else if (showSendModal) {
        return (
            <SendModal
                ssi={btc_wallet?.btc_addr!}
                sdb={sdb}
                balance={syronBal ? Big(syronBal) : _0}
                show={showSendModal}
                onClose={() => setSendModal(false)}
            />
        )
    } else if (showBuyModal) {
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
                <div className={styles.boxWrapper}>
                    {walletConnected ? (
                        <>
                            {sdb ? (
                                <div>
                                    <div className={styles.boxTitle}>
                                        Your Safety Deposit ₿ox
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

                                <div className={styles.boxWrapperInner}>
                                    <div className={styles.subtitle}>
                                        SDB Address
                                    </div>
                                        <div className={styles.sdbAddr}>
                                            <div
                                                className={styles.sdb}
                                                onClick={handleCopy}
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
                                                SDB History ↗
                                            </div>
                                    </div>
                                
                                <div className={styles.boxWrapperInner}>
                                    <div className={styles.subtitle}>
                                        {/* <div className={styles.iconContainer}>
                                            <Image
                                                src={icoBalance}
                                                alt={'btc-deposited'}
                                                className={styles.icon}
                                            />
                                        </div> */}
                                        BTC Deposited
                                    </div>
                                    <div className={styles.subsection}>
                                        <button
                                            onClick={handleRedeem}
                                            className={`button ${
                                                isRedeeming
                                                    ? 'disabled'
                                                    : 'secondary'
                                            }`}
                                        >
                                            {isRedeeming ? (
                                                <div className={styles.loading}>
                                                    Loading
                                                    <ThreeDots color="black" />
                                                </div>
                                            ) : (
                                                <>redeem btc</>
                                            )}
                                        </button>
                                        <div className={styles.value}>
                                            <span className={styles.color}>
                                                {Number(satsDeposited.div(1e8))}
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
                                </div>

                                <div className={styles.boxWrapperInner}>
                                    <div className={styles.subtitle}>
                                        {/* <div className={styles.iconContainer}>
                                            <Image
                                                src={icoThunder}
                                                alt={'syron-usd'}
                                                className={styles.icon}
                                            />
                                        </div> */}
                                        Syron SUSD
                                    </div>
                                        <div className={styles.subsection}>
                                            <div className={styles.info}>
                                                | LOAN
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
                                        <button
                                            onClick={updateBalance}
                                            className={`button ${
                                                isLoading
                                                    ? 'disabled'
                                                    : 'secondary'
                                            }`}
                                        >
                                            {isLoading ? (
                                                <div className={styles.loading}>
                                                    Loading
                                                    <ThreeDots color="black" />
                                                </div>
                                            ) : (
                                                <>borrow susd</>
                                            )}
                                        </button>
                                    </div>
                                    <div className={styles.subsection}>
                                        <div className={styles.info}>
                                            | BALANCE
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
                                        <button
                                            onClick={updateWithdraw}
                                            className={'button secondary'}
                                        >
                                            Withdraw SUSD
                                        </button>
                                    </div>
                                    <div className={styles.buttons}>
                                        <AuthGuard>
                                            <button
                                                onClick={updateSend}
                                                // className={`button secondary ${styles.customButton}`}
                                                className={`button secondary`}
                                            >
                                                send to sdb
                                            </button>
                                            <button
                                                onClick={updateBuy}
                                                className={`button secondary`}
                                            >
                                                buy btc
                                            </button>
                                          </AuthGuard>
                                        </div>
                                    </div>
                            </div>
                        ) : (
                            <div
                                className={styles.boxWrapper}
                                style={{ fontSize: '0.8rem' }}
                            >
                                Loading your Safety Deposit ₿ox...
                            </div>
                        )}
                    </>
                ) : (
                    <div
                        className={styles.boxWrapper}
                        style={{ fontSize: '0.8rem' }}
                    >
                        Connect Wallet to access your Safety Deposit ₿ox
                    </div>
                )}

                {/* @dev: trade */}
                <div className={styles.cardActiveWrapper}>
                    <div
                        className={
                            active === 'GetSyron' || active === 'LiquidSyron'
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
                            Borrow SYRON
                        </div>
                        <div
                            onClick={() =>
                                // toast.info('Coming soon')
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
                            {/* <div className={styles.iconGoldContainer}>
                                <Image
                                    src={icoEarn}
                                    alt={'earn-bitcoin'}
                                    className={styles.icon}
                                />
                            </div> */}
                            Earn Bitcoin
                        </div>
                    </div>

                    {active === 'GetSyron' && (
                        <div className={styles.cardSub}>
                            <div className={styles.wrapper}>
                                <SyronForm type="get" startPair={start_pair} />
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
