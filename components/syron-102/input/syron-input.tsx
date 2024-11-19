import * as tyron from 'tyron'
import styles from './index.module.scss'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import icoSYRON from '../../../src/assets/icons/ssi_SYRON_iso.svg'
import { CryptoState } from '../../../src/types/vault'
import { useStore } from 'react-stores'
import { $btc_wallet, $syron } from '../../../src/store/syron'
import Big from 'big.js'
import { $xr } from '../../../src/store/xr'
import icoArrow from '../../../src/assets/icons/ssi_icon_3arrowsDown.svg'

Big.PE = 999
const _0 = Big(0)

type Prop = {
    balance: Big
    token: CryptoState
    onInput?: (value: Big) => void
    disabled?: boolean
}

const list = [25, 50, 75, 100]

export const SyronInput: React.FC<Prop> = ({
    balance,
    token,
    disabled,
    onInput = () => null,
}) => {
    const [val_, setVal_] = useState<Big>(_0)

    const [selectedPercent, setSelectedPercent] = useState<number | null>(null)

    const handlePercent = useCallback(
        async (n: number) => {
            if (balance) {
                setSelectedPercent(n)
                const percent = Big(n)

                let input = balance.mul(percent).div(100).round(2)
                onInput(input)
                setVal_(input)
            }
        },
        [balance, onInput]
    )

    const handleOnInput = useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            setSelectedPercent(null)
            const target = event.target as HTMLInputElement
            try {
                if (target.value) {
                    let input = Big(target.value).round(2)

                    if (input.gt(balance)) {
                        input = balance
                    }

                    setVal_(input)
                    onInput(input)
                } else {
                    onInput(_0)
                }
            } catch (err) {
                console.error('HandleOnInput', err)
            }
        },
        [balance, onInput]
    )

    const handleOnBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            try {
                if (value) {
                    const input = Big(value)

                    // Handle zero case
                    if (input.eq(_0)) {
                        return target.value
                    }

                    target.value = input.toFixed(8).replace(/\.?0+$/, '') // Format to 8 decimal places on blur and remove trailing zeros
                }
            } catch (err) {
                console.error('HandleOnBlur', err)
            }
        },
        []
    )

    return (
        <label>
            <div className={classNames(styles.container)}>
                <div className={styles.formTxtInfoWrapper}>
                    <div className={styles.info}>
                        | Balance:
                        <span className={styles.infoPurple}>
                            {Number(balance).toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                            })}{' '}
                            {token?.symbol}
                        </span>
                    </div>
                </div>
                <div className={styles.inputWrapper}>
                    <Image
                        src={icoArrow}
                        alt="arrow-icon"
                        className={styles.img}
                    />
                    <div className={styles.inputContainer}>
                        {/* @dev Percentage buttons */}
                        <div>
                            {disabled ? null : (
                                <div className={styles.percentWrapper}>
                                    <div className={styles.row}>
                                        {list.map((n) => (
                                            <div
                                                key={n}
                                                className={
                                                    n === selectedPercent
                                                        ? styles.percentActive
                                                        : styles.percent
                                                }
                                                onClick={() => handlePercent(n)}
                                            >
                                                {n}%
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* @dev Input Box */}
                        <div className={styles.flexContainer}>
                            <div className={styles.wrapper}>
                                <input
                                    className={styles.inputAmt}
                                    type="number"
                                    placeholder="0"
                                    onInput={handleOnInput}
                                    value={Number(val_)}
                                    disabled={disabled}
                                    step="0.01"
                                    min="0"
                                    onBlur={handleOnBlur}
                                />
                                {token && (
                                    <Image
                                        className={styles.tokenImage}
                                        src={icoSYRON}
                                        alt="token-logo"
                                    />
                                )}
                            </div>
                            <div className={styles.tokenInfo}>| SYRON</div>
                        </div>
                    </div>
                </div>
            </div>
        </label>
    )
}
