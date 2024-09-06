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
import icoThunder from '../../src/assets/icons/ssi_icon_thunder.svg'
import Big from 'big.js'
import { $btc_wallet, $syron } from '../../src/store/syron'
import { useStore } from 'react-stores'
import useICPHook from '../../src/hooks/useICP'
import { toast } from 'react-toastify'
import { extractRejectText } from '../../src/utils/unisat/utils'
import {
    mempoolFeeRate,
    transaction_status,
} from '../../src/utils/unisat/httpUtils'
import { useBTCWalletHook } from '../../src/hooks/useBTCWallet'
Big.PE = 999
const _0 = Big(0)

function Component() {
    const syron = useStore($syron)

    const { t } = useTranslation()
    const [active, setActive] = useState('GetSyron')

    const [sdb, setSDB] = useState('')
    const [loan, setLoan] = useState('')
    useEffect(() => {
        if (syron !== null) {
            console.log('Syron', JSON.stringify(syron, null, 2))

            setSDB(syron.sdb)

            const loan_ = syron.syron_usd_loan.div(1e8).toFixed(2).toString()
            setLoan(loan_)
            console.log('loan', loan_)
        }
    }, [syron])

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
                name: 'Syron USD',
                symbol: 'SUSD',
                decimals: 8,
            },
        },
    ]

    const { redemptionGas, redeemBTC, getBox } = useICPHook()
    const [isLoading, setIsLoading] = useState(false)

    const btc_wallet = useStore($btc_wallet)

    const unisat = (window as any).unisat
    const handleRedeem = async () => {
        setIsLoading(true)

        try {
            // await redeemBitcoin(
            //     'c56d3e6d6aaf79a7adf25e9241b13c73dd60c307ed1e89b66696ae8d4b111019'
            // )

            // @pause
            throw new Error('Coming soon!')

            if (sdb === '') {
                throw new Error('SDB Loading error')
            } else {
                let gas = await fetch(`/api/get-unisat-brc20-balance?id=${sdb}`)
                    .then(async (response) => {
                        const res = await response.json()
                        console.log(
                            'outcall response - SDB SUSD balance',
                            JSON.stringify(res, null, 2)
                        )

                        const overallBalance = parseFloat(
                            res.detail[0].overallBalance
                        )
                        const loanAmount = parseFloat(loan)

                        if (overallBalance < loanAmount) {
                            throw new Error(
                                `Please deposit ${
                                    loanAmount - overallBalance
                                } into your SDB before proceeding.`
                            )
                        }

                        return await redemptionGas(btc_wallet?.btc_addr!)
                    })
                    .catch((error) => {
                        throw error
                    })

                // @dev The transaction fee rate in sat/vB @mainnet
                let feeRate = await mempoolFeeRate()
                if (!feeRate) {
                    feeRate = 5
                }
                console.log('Fee Rate', feeRate)

                let deposit = (Number(gas) + 50).toString()
                console.log(deposit)
                const tick = 'SYRON' // @mainnet

                let order = await fetch(
                    `/api/post-unisat-brc20-transfer?receiveAddress=${sdb}&feeRate=${feeRate}&devAddress=${sdb}&devFee=${deposit}&brc20Ticker=${tick}&brc20Amount=${loan}`
                )
                    .then((response) => response.json())
                    .then((res) => {
                        console.log(JSON.stringify(res, null, 2))
                        return res.data
                    })
                    .catch((error) => {
                        throw error
                    })

                // @dev 1) Send Bitcoin transaction (#1)
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
                                        setIsLoading(false)

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
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @tyronDAO
                            </a>
                        </p>
                        <p style={{ color: 'red' }}>
                            {JSON.stringify(err, null, 2)}
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
                        <p>
                            Please let us know about this error on Telegram{' '}
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
                        </p>
                        <p style={{ color: 'red' }}>
                            {extractRejectText(String(err))}
                        </p>
                    </div>,
                    { autoClose: false }
                )
            }
            setIsLoading(false)
        }
    }

    const redeemBitcoin = async (tx_id: string) => {
        // Txn: Inscription to SDB
        console.log('Read Transaction', tx_id)

        // @dev Add inscription info to Tyron indexer
        await fetch(`/api/get-unisat-inscription-info?id=${tx_id + 'i0'}`)
            .then((response) => response.json())
            .then((data) => console.log(JSON.stringify(data, null, 2)))
            .catch((error) => {
                throw error
            })

        await redeemBTC(btc_wallet?.btc_addr!, tx_id)

        // @dev Update inscription info in Tyron indexer
        await fetch(`/api/update-unisat-inscription-info?id=${tx_id + 'i0'}`)
            .then((response) => response.json())
            .then((data) => console.log(JSON.stringify(data, null, 2)))
            .catch((error) => {
                throw error
            })

        await updateBalance()
    }

    // @review (mainnet)
    const { updateWallet } = useBTCWalletHook()

    const updateBalance = async () => {
        const [address] = await unisat.getAccounts()
        const balance = await unisat.getBalance()
        const network = await unisat.getNetwork()
        await updateWallet(address, Number(balance.confirmed), network)
        await getBox(address, Number(balance.confirmed), network, false)
        console.log('balance updated')
    }
    return (
        <div className={styles.container}>
            {/* @dev: trade */}
            <div className={styles.cardActiveWrapper}>
                <div className={styles.tabWrapper}>
                    <div
                        onClick={() => toggleActive('GetSyron')}
                        className={
                            active === 'GetSyron'
                                ? styles.cardSelect
                                : styles.card
                        }
                    >
                        Borrow Syron
                    </div>
                    <div
                        onClick={() => toggleActive('LiquidSyron')}
                        className={
                            active === 'LiquidSyron'
                                ? styles.cardSelect
                                : styles.card
                        }
                    >
                        Earn Bitcoin
                    </div>
                </div>
                <div
                    className={
                        active === 'GetSyron' || active === 'LiquidSyron'
                            ? styles.cardTitle
                            : styles.cardBeYourBank
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
                            <SyronForm type="liquid" startPair={start_pair} />
                        </div>
                    </div>
                )}
                {sdb && (
                    <div className={styles.boxWrapper}>
                        <p className={styles.boxTitle}>
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
                        </p>
                        <p className={styles.info}>
                            <Image
                                src={icoBalance}
                                alt={'BTC'}
                                height="18"
                                width="18"
                            />
                            <span className={styles.plain}>
                                Deposit:{' '}
                                <span className={styles.yellow}>
                                    {Number(syron?.syron_btc.div(1e8))}
                                </span>
                            </span>
                            <Image
                                src={icoBTC}
                                alt={'BTC'}
                                height="18"
                                width="18"
                            />
                        </p>
                        <p
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                            }}
                        >
                            <Image
                                src={icoThunder}
                                alt={'Wallet'}
                                height="18"
                                width="18"
                            />
                            <span style={{ paddingLeft: '4px' }}>
                                <span className={styles.plain}>SDB:</span>
                                <span
                                    onClick={() =>
                                        window.open(
                                            `https://mempool.space/address/${syron?.sdb}`
                                        )
                                    }
                                    className={styles.sdb}
                                >
                                    {syron?.sdb}
                                    <span
                                        style={{
                                            marginLeft: '5px',
                                            fontSize: '1rem',
                                        }}
                                    >
                                        ↗
                                    </span>
                                </span>
                            </span>
                        </p>
                        <button
                            style={{
                                width: '56%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '1rem',
                                cursor: 'pointer',
                                borderRadius: '14px',
                                // @design-shadow-3d
                                backgroundImage:
                                    'linear-gradient(to right, #ffffff2e, #333333)', // Added gradient background
                                boxShadow:
                                    '0 0 14px rgba(255, 255, 50, 0.6), inset 0 -3px 7px rgba(0, 0, 0, 0.4)', // Added 3D effect
                            }}
                            disabled={isLoading}
                            onClick={handleRedeem}
                        >
                            <div className={styles.txt}>redeem btc</div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
