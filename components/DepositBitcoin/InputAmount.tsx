'use client'

import React, { useEffect } from 'react'
import styles from './InputAmount.module.scss'

interface InputAmountProps {
    label?: string
    info?: string
    placeholder?: string
    min?: number
    max?: number
    value: string
    onChange: (value: string) => void
    isValidAmount?: boolean
    isFeeTooHigh?: boolean
    unit?: string
    className?: string
    onValidationChange?: (amount: number) => void
}

export function InputAmount({
    label,
    info,
    placeholder = 'Enter amount in sats',
    min = 1000,
    max = 2999,
    value,
    onChange,
    isFeeTooHigh,
    unit = 'sats',
    className = '',
    onValidationChange,
}: InputAmountProps) {
    const displaySubtitle = info || `Recommended: ${min} - ${max} ${unit}`

    const isValidAmount = React.useMemo(() => {
        const numericValue = Math.floor(parseFloat(value) || 0)
        return (
            !isNaN(numericValue) && numericValue >= min && numericValue <= max
        )
    }, [value, min, max])

    // Validate amount and notify parent
    useEffect(() => {
        if (onValidationChange) {
            const numericValue = Math.floor(parseFloat(value) || 0)
            onValidationChange(numericValue)
        }
    }, [value, min, max, isFeeTooHigh, onValidationChange])

    return (
        <div className={`${styles.inputAmountContainer} ${className}`}>
            <div className={styles.inputAmountHeader}>
                {label && (
                    <span className={styles.inputAmountLabel}>{label}</span>
                )}
                <span className={styles.inputAmountInfo}>
                    {displaySubtitle}
                </span>
            </div>
            <div className={styles.inputAmountWrapper}>
                <input
                    type="number"
                    className={styles.inputAmount}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={1}
                    value={value}
                    onChange={(e) => {
                        const inputValue = e.target.value

                        if (inputValue === '') {
                            onChange(inputValue)
                        } else {
                            // Handle decimal values by rounding down to lower integer
                            const numericValue = parseFloat(inputValue)
                            if (!isNaN(numericValue) && numericValue >= 0) {
                                const roundedValue =
                                    Math.floor(numericValue).toString()
                                onChange(roundedValue)
                            }
                        }
                    }}
                />
                <span className={styles.inputAmountUnit}>{unit}</span>
            </div>
            <div className={styles.inputAmountValidation}>
                {isFeeTooHigh ? (
                    <span
                        className={`${styles.validationMessage} ${styles.invalid}`}
                    >
                        ⚠ Network fees are currently too high. Please try again
                        later.
                    </span>
                ) : value ? (
                    <span
                        className={`${styles.validationMessage} ${
                            isValidAmount ? styles.valid : styles.invalid
                        }`}
                    >
                        {isValidAmount
                            ? '✓ Valid amount'
                            : `⚠ Amount should be between ${min} and ${max} ${unit}`}
                    </span>
                ) : null}
            </div>
        </div>
    )
}
