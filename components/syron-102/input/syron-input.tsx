import styles from './index.module.scss'
import { useCallback, useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import icoSYRON from '../../../src/assets/logos/syron_susd_brand_mark.png'
import { CryptoState } from '../../../src/types/vault'
import Big from 'big.js'

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
                    setVal_(_0)
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

    const formattedBalance = Number(balance).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })

    return (
        <div className={classNames(styles.container)}>
            <div className={styles.glassPanel}>
                <div className={styles.availableRow}>
                    <span className={styles.availableLabel}>
                        Available balance
                    </span>
                </div>
                <div
                    className={styles.availableRow}
                    style={{ justifyContent: 'flex-end' }}
                >
                    <span className={styles.availableValue}>
                        {formattedBalance}
                    </span>
                    <span className={styles.availableToken}>
                        {token.symbol}
                    </span>
                </div>

                {!disabled && (
                    <div className={styles.percentWrapper}>
                        {list.map((n) => {
                            const isActive = n === selectedPercent
                            return (
                                <div
                                    key={n}
                                    className={
                                        isActive
                                            ? styles.percentActiveSyron
                                            : styles.percentSyron
                                    }
                                    onClick={() => handlePercent(n)}
                                    title={`Withdraw ${n}% of your available balance.`}
                                    aria-label={`Withdraw ${n}% of your available balance.`}
                                >
                                    {n}%
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className={styles.dottedRail} aria-hidden="true"></div>

                <div className={styles.flexContainer}>
                    <div className={styles.wrapper}>
                        <input
                            className={styles.inputAmt}
                            type="number"
                            lang="en"
                            placeholder="0"
                            onInput={handleOnInput}
                            value={val_.toString()}
                            disabled={disabled}
                            step="0.01"
                            inputMode="decimal"
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
                </div>
            </div>
        </div>
    )
}
