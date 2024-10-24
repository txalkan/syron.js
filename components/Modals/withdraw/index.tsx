import React, { useEffect, useState } from 'react'
import { useStore } from 'effector-react'
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

    const [disabled, setDisabled] = React.useState(false)
    useEffect(() => {
        if (balance.eq(0)) {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [balance])

    const [isLoading, setIsLoading] = React.useState(false)

    const { syron_withdrawal } = useSyronWithdrawal()

    const handleConfirm = React.useCallback(async () => {
        setIsLoading(true)
        setDisabled(true)
        try {
            console.log('amount', String(amount))
            await syron_withdrawal(ssi, sdb, Number(amount))
        } catch (error) {}
        setIsLoading(false)
        setDisabled(false)
    }, [amount])

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
                            <Image
                                alt="power-ico"
                                src={PowerIcon}
                                width={30}
                                height={30}
                            />
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
                                        {t('Info')}
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
                                            {t('Info')}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        style={{ marginBottom: '2rem' }}
                                        className={styles.rowContentTxt}
                                    >
                                        {t('Info')}
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
                                        {t('Info')}
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
                                            {t('Info')}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        style={{ marginBottom: '2rem' }}
                                        className={styles.rowContentTxt}
                                    >
                                        {t('Info')}
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
                                        {t('Info')}
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
                                            {t('Info')}
                                        </div>
                                        <div className={styles.rowContentTxt}>
                                            <br />
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul>
                                            <ul className={styles.ul}>
                                                <li className={styles.li}>
                                                    {t('Info')}
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        style={{ marginBottom: '2rem' }}
                                        className={styles.rowContentTxt}
                                    >
                                        {t('Info')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <SyronInput
                        balance={balance}
                        token={token}
                        onInput={handleOnInput}
                        disabled={disabled}
                    />
                    <div className={styles.btnConfirmWrapper}>
                        <div
                            className={
                                disabled
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
                </div>
            </div>
        </Modal>
    )
}

export default ThisModal
