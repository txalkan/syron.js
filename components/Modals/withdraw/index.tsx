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

type Prop = {
    ssi: string
    sdb: string
    balance: Big
    show: boolean
    onClose: () => void
}

const token: CryptoState = {
    name: 'Syron USD',
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

    const [amount, setAmount] = React.useState(balance)

    const handleOnInput = React.useCallback((value: Big) => {
        setAmount(value)
    }, [])

    const [isDisabled, setIsDisabled] = React.useState(false)
    const icpTx = useStore($icpTx)

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

    const handleConfirm = React.useCallback(async () => {
        if (isLoading) return

        setIsLoading(true)

        try {
            if (amount.lt(0.2)) {
                throw new Error('Insufficient Amount')
            }
            await syron_withdrawal(ssi, sdb, amount)
            await getBox(ssi, false)
        } catch (error) {
            console.error('Withdraw Modal: ', error)

            if (error == 'Error: Insufficient Amount') {
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
                    </div>,
                    {
                        autoClose: false,
                    }
                )
            }
        }

        setIsLoading(false)
    }, [amount, isLoading])

    let inscriptionTx = useStore($inscriptionTx)
    const retryWithdrawal = React.useCallback(async () => {
        if (isLoading) return

        setIsLoading(true)

        //inscriptionTx = 'b1fcf5ac8a5c8013a52e24458c8298b7e97a7431f9f1db1cc90fb8c98f90fcfc'

        try {
            await syron_withdrawal(
                ssi,
                sdb,
                amount,
                typeof inscriptionTx === 'string' ? inscriptionTx : undefined
            )
            await getBox(ssi, false)
        } catch (error) {
            console.error('Withdraw Modal: ', error)
        }

        setIsLoading(false)
    }, [amount, isLoading, inscriptionTx])

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div onClick={onClose} className="closeIcon">
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <div className={styles.headerTxt}>
                            {/* <Image
                                alt="power-ico"
                                src={PowerIcon}
                                width={30}
                                height={30}
                            /> */}
                            {t('Withdraw SYRON')}
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
                                        {t('Deposit Bitcoin')}
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
                                        <div
                                            style={{ marginBottom: '2rem' }}
                                            className={styles.rowContentTxt}
                                        >
                                            {t(
                                                'Send BTC into your Safety Deposit Box.'
                                            )}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
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
                                        style={{ marginBottom: '2rem' }}
                                        className={styles.rowContentTxt}
                                    >
                                        {t(
                                            'Send BTC into your Safety Deposit Box.'
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
                                        {t('Borrow SYRON')}
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
                                        <div
                                            style={{ marginBottom: '2rem' }}
                                            className={styles.rowContentTxt}
                                        >
                                            {t('Update your SYRON balance.')}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
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
                                        style={{ marginBottom: '2rem' }}
                                        className={styles.rowContentTxt}
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
                                        {t('Withdraw SYRON')}
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
                                        <div
                                            style={{ marginBottom: '2rem' }}
                                            className={styles.rowContentTxt}
                                        >
                                            {t(
                                                'Transfer SYRON from your balance to your wallet.'
                                            )}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
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
                                        style={{ marginBottom: '2rem' }}
                                        className={styles.rowContentTxt}
                                    >
                                        {t(
                                            'Transfer SYRON from your balance to your wallet.'
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
                        <div
                            className={
                                isDisabled || isLoading
                                    ? styles.btnConfirmDisabled
                                    : styles.btnConfirm
                            }
                            onClick={handleConfirm}
                        >
                            {isLoading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                <div className={styles.txt}>CONFIRM</div>
                            )}
                        </div>
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
                                has failed, possibly due to technical issues
                                with the Internet Computer.
                            </div>
                            <div className={styles.withdrawalTxt}>
                                Please try again after a moment. If the problem
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
                                    fontFamily: 'GeistMono, monospace',
                                    fontSize: 'small',
                                    backgroundColor: 'rgb(75, 0, 130)',
                                }}
                                onClick={retryWithdrawal}
                                className={'button secondary'}
                            >
                                {isLoading ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    <div className={styles.txt}>retry</div>
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
