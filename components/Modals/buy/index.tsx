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
    symbol: 'SYRON',
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
    const { send_syron } = useSyronWithdrawal()
    const { getBox } = useICPHook()
    const xr = useStore($xr)

    const [isDisabled, setIsDisabled] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    useEffect(() => {
        if (balance.eq(0)) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [balance])

    const [amount, setAmount] = React.useState(_0)
    const handleOnInput = React.useCallback((value: Big) => {
        setAmount(value)
    }, [])

    const handleConfirm = React.useCallback(async () => {
        if (isLoading || isDisabled) return // @review (ui) even if disabled, it runs the first time (not the second)

        try {
            setIsLoading(true)

            if (amount.lt(0.2)) {
                throw new Error('Insufficient Amount')
            }

            // await send_syron(ssi, recipient, amount)
            toast.info('Your SYRON payment was sent successfully.')

            await getBox(ssi, false)
        } catch (error) {
            console.error('Syron Payment', error)

            if (error == 'Error: Withdrawing SYRON is currently paused.') {
                toast.info('Withdrawing SYRON is currently paused.')
            } else if (error == 'Error: The recipient address is missing') {
                toast.warn(
                    <div className={styles.error}>
                        The recipient address is missing. If you need
                        assistance, feel free to reach out on Telegram{' '}
                        <a
                            href="https://t.me/tyrondao"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            @TyronDAO
                        </a>
                        .
                    </div>
                )
            } else if (error == 'Error: Insufficient Amount') {
                toast.warn(
                    <div className={styles.error}>
                        The minimum amount for withdrawal is 20 cents. Please
                        adjust your request accordingly. If you need assistance,
                        feel free to reach out on Telegram{' '}
                        <a
                            href="https://t.me/tyrondao"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            @TyronDAO
                        </a>
                        .
                    </div>
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
                            Please let us know about this error on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#0000ff',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
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
    }, [ssi, sdb, amount, isLoading, isDisabled])

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

                    <div className={styles.formTxtInfoWrapper}>
                        <div className={styles.info}>
                            | BTC Price:
                            <span className={styles.infoPurple}>
                                <span style={{ paddingRight: '0.2rem' }}>
                                    $
                                </span>
                                {Number(Big(xr!.rate)).toLocaleString('en-US')}
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

                    <div className={styles.btnConfirmWrapper}>
                        <button
                            className={`button ${
                                isDisabled || isLoading ? 'disabled' : 'primary'
                            }`}
                            onClick={handleConfirm}
                        >
                            {isLoading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                <>Confirm</>
                            )}
                        </button>
                    </div>

                    {isLoading ? (
                        <div>
                            <div className={styles.withdrawalTxt}>
                                Your BTC purchase is being processed. Please
                                allow a few moments for completion. Thank you
                                for your patience!
                            </div>
                            <Spinner />
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    )
}

export default ThisModal
