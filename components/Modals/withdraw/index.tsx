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
import useSyronWithdrawal from '../../../src/utils/icp/syron_withdrawal'
import { $icpTx, $inscriptionTx, updateIcpTx } from '../../../src/store/syron'
import { useStore } from 'react-stores'
import Spinner from '../../Spinner'
import useICPHook from '../../../src/hooks/useICP'
import { toast } from 'react-toastify'
import { extractRejectText } from '../../../src/utils/unisat/utils'
import icoThunder from '../../../src/assets/icons/ssi_icon_thunder.svg'
import icoCopy from '../../../src/assets/icons/copy.svg'

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

    const { syron_withdrawal } = useSyronWithdrawal()
    const { getBox } = useICPHook()

    const [txError, setTxError] = React.useState('')
    let inscriptionTx = useStore($inscriptionTx)

    const handleConfirm = React.useCallback(async () => {
        if (isLoading || isDisabled) return // @review (ui) even if disabled, it runs the first time (not the second)

        try {
            if (process.env.NEXT_PUBLIC_MINTING_PAUSE === 'true') {
                throw new Error('Withdrawing SYRON is currently paused.')
            }
            setIsLoading(true)

            if (amount.lt(0.2)) {
                throw new Error('Insufficient Amount')
            }

            // @test
            // const inscriptionTx = {
            //     value: 'e93bef47349172691cf810af296776c8467a966979d0ed7e2c3dc4c1dc051281',
            // }

            await syron_withdrawal(
                ssi,
                sdb,
                amount,
                typeof inscriptionTx.value === 'string'
                    ? inscriptionTx.value
                    : undefined
            )
            await getBox(ssi, false)
        } catch (error) {
            console.error('Syron Withdrawal', error)
            setTxError(extractRejectText(String(error)))

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
    }, [ssi, sdb, amount, inscriptionTx, isLoading, isDisabled])

    const retryWithdrawal = React.useCallback(async () => {
        if (isLoading) return

        try {
            setIsLoading(true)

            if (!inscriptionTx.value) {
                throw new Error('The inscribe-transfer transaction is missing.')
            }

            updateIcpTx(null)
            await syron_withdrawal(ssi, sdb, amount, inscriptionTx.value)
            await getBox(ssi, false)
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
    }, [ssi, sdb, amount, isLoading, inscriptionTx])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.info(
            `Your Safety Deposit ₿ox (SDB) address has been copied to your clipboard.`
        )
    }

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div className={styles.headerTxt}>
                            {/* <Image
                                src={icoThunder}
                                alt={'Withdraw SYRON SUSD'}
                                height="32"
                                width="32"
                            /> */}
                            {t('Withdraw Syron SUSD')}
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
                                            {t('Send bitcoin into your SDB:')}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'You can easily transfer BTC from any wallet to your SDB address. Just copy your SDB address below & follow the instructions in your wallet.'
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
                                        {t('Send bitcoin into your SDB')}
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
                                        {t('Borrow Syron SUSD')}
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
                                            {t('Update your SUSD balance:')}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t(
                                                        'To keep your balance up to date, click the UPDATE button in your Safety Deposit ₿ox.'
                                                    )}
                                                </li>
                                                <li className={styles.li}>
                                                    {t(
                                                        'This will show you how much SYRON dollars you can withdraw.'
                                                    )}
                                                </li>
                                                <li className={styles.li}>
                                                    {t(
                                                        'Remember to click UPDATE each time you make a BTC deposit into your Safety Deposit ₿ox.'
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
                                        {t('Update your SUSD balance')}
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
                                        {t('Withdraw Syron SUSD')}
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
                                                'Transfer SUSD from your balance to your wallet:'
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
                                                        'You can withdraw dollars from your SYRON balance to your wallet.'
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
                                                        'SYRON withdrawals are based on the balance in your Safety Deposit ₿ox.'
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
                                                        'Syron SUSD is implemented as a BRC-20 token named SYRON, which can be used freely on Bitcoin mainnet.'
                                                    )}
                                                </li>
                                                <li className={styles.li}>
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
                                                </li>
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
                                            'Transfer SUSD from your balance to your wallet'
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <SyronInput
                        balance={balance}
                        token={token}
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
                            onClick={handleConfirm}
                        >
                            {isLoading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                <>Confirm</>
                            )}
                        </button>
                    </div>

                    {icpTx.value === false ? (
                        <div className={styles.failedWithdrawal}>
                            {/* <div className={styles.icoColor}>
                                <Image
                                    alt="warning-ico"
                                    src={Warning}
                                    width={20}
                                    height={20}
                                />
                            </div> */}
                            <div className={styles.withdrawalTxt}>
                                We are very sorry, but your withdrawal request
                                has failed.
                            </div>
                            {txError !== '' && (
                                <div
                                    style={{
                                        color: 'red',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    Error: {txError}
                                </div>
                            )}
                            <div className={styles.withdrawalTxt}>
                                Please try again after a moment. If the error
                                persists, do not hesitate to contact us for
                                support on Telegram{' '}
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
                            <div className={styles.withdrawalTxt}>
                                We appreciate your patience and understanding!
                            </div>
                            <button
                                style={{
                                    backgroundColor: 'rgb(75, 0, 130)',
                                }}
                                onClick={retryWithdrawal}
                                className={'button secondary'}
                            >
                                {isLoading ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    <>retry</>
                                )}
                            </button>
                        </div>
                    ) : (
                        <>
                            {isLoading ? (
                                <div>
                                    <div className={styles.withdrawalTxt}>
                                        Your withdrawal request is currently
                                        being processed. Please allow a few
                                        moments for completion. Thank you for
                                        your patience!
                                    </div>
                                    <Spinner />
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
                                                className={styles.withdrawalTxt}
                                            >
                                                Congratulations! Your withdrawal
                                                was successful, and{' '}
                                                {String(amount)} SYRON has been
                                                sent to your wallet.
                                            </div>
                                            <div
                                                className={styles.withdrawalTxt}
                                            >
                                                You can check your wallet to
                                                verify the transaction.
                                            </div>
                                            <div
                                                className={styles.withdrawalTxt}
                                            >
                                                Thank you for using Tyron!
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
