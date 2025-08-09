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
    isICP: boolean
}

const token: CryptoState = {
    name: 'Syron Dollar',
    symbol: 'SUSD',
    decimals: 8,
}

var ThisModal: React.FC<Prop> = function ({
    ssi,
    sdb,
    balance,
    show,
    onClose,
    isICP,
}) {
    const { t } = useTranslation()
    const { send_syron } = useSyronWithdrawal()
    const { getBox } = useICPHook()

    const [active, setActive] = useState(0)
    const [checkedStep, setCheckedStep] = useState(Array())
    const [isDisabled, setIsDisabled] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [recipient, setRecipient] = useState('')

    useEffect(() => {
        if (balance.eq(0)) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [balance])

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

    const handleRecipient = (event: { target: { value: any } }) => {
        let addr = event.target.value
        try {
            // addr_input = zcrypto.fromBech32Address(addr_input)
            setRecipient(addr) // @review address format
        } catch (error) {
            toast.warn('Wrong address format.')
        }
    }

    const handleConfirm = React.useCallback(async () => {
        if (isLoading || isDisabled) return // @review (ui) even if disabled, it runs the first time (not the second)

        try {
            setIsLoading(true)

            if (recipient === '') {
                throw new Error('The recipient address is missing')
            }

            if (amount.lt(0.2)) {
                throw new Error('Insufficient Amount')
            }

            await send_syron(ssi, recipient, amount, isICP)
            toast.info(
                <div className={styles.toastMessage}>
                    Your payment of {amount.toString()} SUSD to {recipient} was
                    sent successfully
                </div>,
                { autoClose: false, closeOnClick: true }
            )
            await getBox(ssi)
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
                    </div>,
                    { autoClose: false, closeOnClick: true }
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
                    </div>,
                    { autoClose: false, closeOnClick: true }
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
                    </div>,
                    { autoClose: false, closeOnClick: true }
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            You can let know about this error on Telegram{' '}
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
                    </div>,
                    { autoClose: false, closeOnClick: true }
                )
            }
        } finally {
            setIsLoading(false)
        }
    }, [ssi, recipient, sdb, amount, isLoading, isDisabled])

    // const copyToClipboard = (text: string) => {
    //     navigator.clipboard.writeText(text)
    //     toast.info(
    //         `Your Safety Deposit ₿ox (SDB) address has been copied to your clipboard.`
    //     )
    // }

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div className={styles.headerTxt}>
                            {/* <Image
                                src={icoThunder}
                                alt={'Send Syron'}
                                height="32"
                                width="32"
                            /> */}
                            {t('Send Syron')}
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

                    {/* <div className={styles.txt}>
                        {t(
                            'Transfer Syron via ICPayments: lightning-fast transfers on the Internet Computer'
                        )}
                    </div> */}

                    {/* <div className={styles.contentWrapper}>
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
                                            {t('Send bitcoin into your SDB.')}
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
                                                        "During this testing phase, please limit your deposits to a maximum of 5,000 sats (0.00005 BTC). Small amounts are covered by TyronDAO's insurance."
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
                                        {t('Send bitcoin into your SDB.')}
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
                                        {t('Print SYRON')}
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
                                            {t('Update your SYRON balance.')}
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
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className={styles.rowContentTxt}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => menuActive(2)}
                                    >
                                        {t('Update your SYRON balance.')}
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
                                        {t('Withdraw')}
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
                                                'Withdrawal Overview for Syron USD'
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
                                                        'Withdrawals of Syron USD are based on the balance in your Safety Deposit ₿ox.'
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
                                                        'Syron USD is implemented as a BRC-20 token named SYRON, which can be used freely on Bitcoin mainnet.'
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
                                                        'You can bridge Syron USD to other networks, such as Bitlayer, using the Omnity Network.'
                                                    )}
                                                </li>
                                                <li className={styles.li}>
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
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        className={styles.rowContentTxt}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => menuActive(3)}
                                    >
                                        {t(
                                            'Transfer Syron USD from your balance to your wallet.'
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div> */}

                    <div className={styles.diagramContainer}>
                        <p className={styles.diagramLineLabel}>
                            YOUR account&apos;s BALANCE (Sender)
                        </p>
                        <p className={styles.diagramFlowSymbol}>|</p>
                        <p className={styles.diagramFlowSymbol}>Syron SUSD</p>
                        <p className={styles.diagramFlowSymbol}>|</p>
                        <p className={styles.diagramFlowSymbol}>▼</p>
                        {isICP ? (
                            <p className={styles.diagramLineLabel}>
                                Recipient&apos;s SUSD address (Receiver)
                            </p>
                        ) : (
                            <p className={styles.diagramLineLabel}>
                                Recipient&apos;s Tyron account (Receiver)
                            </p>
                        )}
                        {isICP ? (
                            <p className={styles.diagramCaption}>
                                Enter the receiver&apos;s SUSD address below
                                (Internet Computer addresses only)
                            </p>
                        ) : (
                            <p className={styles.diagramCaption}>
                                Enter the receiver&apos;s self-custodial wallet
                                address below (Bitcoin addresses only)
                            </p>
                        )}
                    </div>

                    <div className={styles.label}>Recipient&apos;s Address</div>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={t('Paste address')}
                            value={recipient} // Bind the input value to the recipient state
                            onChange={handleRecipient} // Update the recipient state on change
                        />
                        {recipient && (
                            <button
                                className={styles.clearButton}
                                onClick={() => setRecipient('')} // Clear the recipient state
                                aria-label="Clear input"
                            >
                                ✕
                            </button>
                        )}
                        <button
                            className={styles.pasteButton}
                            onClick={async () => {
                                try {
                                    const text =
                                        await navigator.clipboard.readText() // Read text from clipboard
                                    setRecipient(text) // Set the recipient state with the pasted text
                                } catch (error) {
                                    console.error(
                                        'Failed to paste text:',
                                        error
                                    )
                                }
                            }}
                            aria-label="Paste address"
                        >
                            Paste
                        </button>
                    </div>

                    {isICP ? null : (
                        <div className={styles.txt}>
                            Syron will be transferred from your available SUSD
                            balance to the recipient&apos;s Tyron account. The
                            recipient must log in with their Bitcoin personal
                            wallet to access the funds.
                        </div>
                    )}

                    <div className={styles.label}>
                        amount to transfer (susd)
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

                    {isLoading ? (
                        <div>
                            <div className={styles.txt}>
                                Your Syron transfer is being processed. Please
                                allow a few moments for completion.
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
