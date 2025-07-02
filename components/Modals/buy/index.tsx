import React, { useEffect, useState } from 'react'
import { Modal } from '../../modal'
import styles from './styles.module.scss'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import Close from '../../../src/assets/icons/ic_cross_black.svg'
import { SyronInput } from '../../syron-102/input/syron-input'
import Big from 'big.js'
import { CryptoState } from '../../../src/types/vault'
import ThreeDots from '../../Spinner/ThreeDots'
import useSyronWithdrawal from '../../../src/utils/icp/syron_withdrawal'
import Spinner from '../../Spinner'
import useICPHook from '../../../src/hooks/useICP'
import { toast } from 'react-toastify'
import { extractRejectText } from '../../../src/utils/unisat/utils'
import { useStore } from 'react-stores'
import { $xr } from '../../../src/store/xr'
import { TransactionOutput } from '../../syron-102/txn-output'
import { mempoolFeeRate } from '../../../src/utils/unisat/httpUtils'
import ConfirmTransactionModal from '../confirm-txn'
import {
    $btc_wallet,
    $syron,
    updateSusdBalance,
} from '../../../src/store/syron'

Big.PE = 999
const _0 = Big(0)

type Prop = {
    ssi: string
    sdb: string
    balance: Big
    show: boolean
    onClose: () => void
}

const token: CryptoState = {
    name: 'Syron SUSD',
    symbol: 'Syron SUSD',
    decimals: 8,
}

var ThisModal: React.FC<Prop> = function ({
    ssi,
    sdb,
    balance,
    show,
    onClose,
}) {
    const { t } = useTranslation()
    const { buy_btc } = useSyronWithdrawal()
    const { getBox } = useICPHook()
    const xr = useStore($xr)
    const syron = useStore($syron)

    const [isDisabled, setIsDisabled] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isTxnRes, setIsTxnRes] = React.useState('')
    const [isTxnErr, setIsTxnErr] = React.useState(false)
    const [isBtcAmt, setIsBtcAmt] = React.useState('')

    useEffect(() => {
        if (balance.eq(0)) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [balance])

    const [amount, setAmount] = React.useState(_0)
    const [btcAmount, setBtcAmount] = React.useState(_0)
    const handleOnInput = React.useCallback(
        (value: Big) => {
            setAmount(value)
            const amt = value.div(xr!.rate).round(8)
            setBtcAmount(amt)
        },
        [xr]
    )

    const handleConfirm = React.useCallback(async () => {
        if (isLoading || isDisabled) return // @review (ui) even if disabled, it runs the first time (not the second)

        try {
            setIsLoading(true)

            const res = await buy_btc(ssi, amount, btcAmount.times(0.99))
            console.log('BTC Purchase Result', res)

            if (Array.isArray(res) && res.length > 0) {
                setIsTxnErr(false)
                setIsTxnRes(res[0])

                const btc_amt = Big(Number(res[2])).div(1e8).round(8)
                setIsBtcAmt(btc_amt.toString())
                updateSusdBalance(syron!, Big(Number(res[3])))

                toast.info('Your Bitcoin transaction was sent successfully', {
                    autoClose: false,
                    closeOnClick: true,
                    toastId: 1,
                })
            } else {
                console.log('Wrong BTC Purchase Result', res)
                throw new Error(
                    typeof res === 'string' ? res : JSON.stringify(res)
                )
            }
        } catch (error) {
            console.error('BTC Purchase Error', error)
            setIsTxnErr(true)

            const error_msg =
                error && (error as Error).message
                    ? (error as Error).message
                    : JSON.stringify(error, null, 2)

            setIsTxnRes(error_msg)

            if (
                (error as Error).message.includes(
                    'sender delegation has expired'
                ) ||
                (error as Error).message.includes(
                    'anonymous caller not allowed'
                )
            ) {
                onClose()
                // await siwb()
                toast.warn(
                    "Your Sign In With Bitcoin session is no longer valid. Please 'SIGN IN' again.",
                    {
                        autoClose: false,
                        closeOnClick: true,
                    }
                )
            } else if (
                (error as Error).message.includes(
                    'signature could not be verified'
                )
            ) {
                setIsTxnRes('')
            } else if (
                (error as Error).message.includes(
                    'anonymous caller not allowed'
                )
            ) {
                toast.warn(
                    "Your Sign In With Bitcoin authentication is no longer valid. Please go back and 'SIGN IN' again.",
                    {
                        autoClose: false,
                        closeOnClick: true,
                    }
                )
            } else if (
                typeof error === 'object' &&
                Object.keys(error!).length !== 0
            ) {
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
                                    color: '#0000ff',
                                    textDecoration: 'underline',
                                }}
                            >
                                @tyronDAO
                            </a>
                            .
                        </div>
                        <br />
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {error && (error as Error).message
                                ? (error as Error).message
                                : JSON.stringify(error, null, 2)}
                        </div>
                    </div>,
                    {
                        autoClose: false,
                        closeOnClick: true,
                    }
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
                    {
                        autoClose: false,
                        closeOnClick: true,
                    }
                )
            }

            await getBox(ssi)
        } finally {
            setIsConfirmationOpen(false)
            setIsLoading(false)
        }
    }, [ssi, sdb, amount, btcAmount, isLoading, isDisabled, isTxnRes, isTxnErr])

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
    const [onDetails, setOnDetails] = useState({})
    const btc_wallet = useStore($btc_wallet)

    const handleContinue = React.useCallback(async () => {
        if (isDisabled) return
        try {
            setIsTxnRes('')
            setIsTxnErr(false)
            toast.dismiss(1)
            toast.dismiss(500)

            // @pause
            if (process.env.NEXT_PUBLIC_SWAP_PAUSE === 'true') {
                throw new Error('Swap is paused')
            }

            if (amount.lt(1)) {
                throw new Error('Insufficient Amount')
            }

            const fee = await mempoolFeeRate()
            if (fee === 0)
                throw new Error(
                    'The Bitcoin network is experiencing some congestion. During our testing campaign, the maximum allowed gas fee is 3 sats/vB (satoshis per virtual byte). Please try again later when network conditions improve and fees are lower.'
                )

            const dao_fee = 0.000001
            const gas_fee = (fee * 152) / 1e8 // @vb
            const total_min = Number(btcAmount.times(0.99)) - gas_fee - dao_fee
            const details = {
                title: 'Confirm BTC Purchase',
                info: `You are about to purchase bitcoin (BTC) using your Syron SUSD and receive it directly in your connected Bitcoin wallet.`,
                amount: `$${Number(amount).toFixed(2)} SUSD`,
                btcAmount: `+${Number(btcAmount.times(0.99)).toFixed(8)} BTC`,
                gas: `-${gas_fee.toFixed(8)} BTC`,
                fee: `-${dao_fee.toFixed(8)} BTC`,
                total_min: `${total_min.toFixed(8)} BTC`,
                receiver: btc_wallet?.btc_addr,
            }
            setOnDetails(details)

            setIsConfirmationOpen(true)
        } catch (error) {
            if (error == 'Error: Swap is paused') {
                toast.info('Purchasing BTC is currently paused.', {
                    autoClose: false,
                    closeOnClick: true,
                    toastId: 500,
                })
            } else if (error == 'Error: Insufficient Amount') {
                toast.warn(
                    <div className={styles.error}>
                        The minimum spend amount is $1 SUSD. Please adjust the
                        amount of SUSD to spend. If you need assistance, feel
                        free to reach out on Telegram{' '}
                        <a
                            href="https://t.me/tyrondao"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            @tyronDAO
                        </a>
                        .
                    </div>,
                    { autoClose: false, closeOnClick: true, toastId: 500 }
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
    }, [isDisabled, btcAmount])

    const handleCloseConfirmation = () => {
        setIsConfirmationOpen(false)
        setIsLoading(false)
    }

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div className={styles.headerTxt}>
                            {t('Buy Bitcoin with Syron SUSD')}
                        </div>
                        <div onClick={onClose} className={styles.closeIcon}>
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                    </div>

                    <div className={styles.diagramContainer}>
                        <p className={styles.diagramLineLabel}>
                            YOUR SUSD BALANCE (Sender)
                        </p>
                        <p className={styles.diagramFlowSymbol}>|</p>
                        <p className={styles.diagramFlowSymbol}>Syron SUSD</p>
                        <p className={styles.diagramFlowSymbol2}>{'<->'} </p>
                        <p className={styles.diagramFlowSymbol}>Bitcoin</p>
                        <p className={styles.diagramFlowSymbol}>|</p>
                        <p className={styles.diagramFlowSymbol}>▼</p>
                        <p className={styles.diagramLineLabel}>
                            YOUR BITCOIN WALLET (Receiver)
                        </p>
                        <p className={styles.diagramCaption}>
                            BTC will be sent to your connected Bitcoin wallet
                            address
                        </p>
                    </div>

                    <div className={styles.formTxtInfoWrapper}>
                        <div className={styles.info}>
                            | BTC Price:
                            <span className={styles.infoPurple}>
                                <span style={{ paddingRight: '0.2rem' }}>
                                    $
                                </span>
                                {xr?.rate
                                    ? xr.rate.toLocaleString('en-US')
                                    : '...'}
                            </span>
                        </div>
                    </div>

                    <div className={styles.label}>amount to spend (susd)</div>
                    <SyronInput
                        balance={balance}
                        token={token}
                        onInput={handleOnInput}
                        disabled={isDisabled}
                    />

                    <div className={styles.label}>amount to receive (btc)</div>
                    <div className={styles.txtRow}>
                        You will buy the BTC amount shown below and receive it
                        directly in your connected Bitcoin wallet.
                    </div>
                    <TransactionOutput
                        amount={btcAmount}
                        token={{
                            name: 'Bitcoin',
                            symbol: 'BTC',
                            decimals: 8,
                        }}
                    />
                    <div className={styles.txtRow}>Slippage: 1%</div>
                    {btcAmount.gt(0) && (
                        <div className={styles.txtRow}>
                            Minimum before fees:{' '}
                            <>{btcAmount.times(0.99).toFixed(8)} BTC</>
                        </div>
                    )}
                    <div className={styles.btnConfirmWrapper}>
                        <button
                            className={`button ${
                                isDisabled || isLoading || isConfirmationOpen
                                    ? 'disabled'
                                    : 'primary'
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
                    />

                    {isLoading ? (
                        <div>
                            <div className={styles.withdrawalTxt}>
                                Your BTC purchase is being processed. Please
                                allow a few moments for completion.
                            </div>
                            <Spinner />
                        </div>
                    ) : isTxnRes != '' ? (
                        <>
                            {!isTxnErr ? (
                                <div className={styles.succeededWithdrawal}>
                                    <div className={styles.withdrawalTxt}>
                                        Your BTC purchase was successful, and{' '}
                                        <strong>{isBtcAmt} BTC</strong> has been
                                        sent to your wallet.
                                    </div>
                                    <div className={styles.withdrawalTxt}>
                                        You can check the explorer to verify the
                                        transaction:
                                    </div>
                                    <div
                                        className={styles.link}
                                        onClick={() => {
                                            //@network defaults to mainnet
                                            let url: URL = new URL(
                                                `https://mempool.space/tx/${isTxnRes}`
                                            )
                                            const version =
                                                process.env
                                                    .NEXT_PUBLIC_SYRON_VERSION
                                            if (version === 'testnet') {
                                                url = new URL(
                                                    `https://mempool.space/testnet4/tx/${isTxnRes}`
                                                )
                                            }
                                            window.open(url)
                                        }}
                                    >
                                        {isTxnRes}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.failedWithdrawal}>
                                    <div className={styles.withdrawalTxt}>
                                        The transaction was not successful.
                                        Please try again.
                                    </div>
                                    <strong>{isTxnRes}</strong>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {isTxnErr && (
                                <div className={styles.succeededWithdrawal}>
                                    <div className={styles.withdrawalTxt}>
                                        Your BTC purchase was successful!
                                    </div>
                                    <div className={styles.withdrawalTxt}>
                                        You can check your wallet to verify the
                                        transaction:
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
                                        {btc_wallet?.btc_addr}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default ThisModal
