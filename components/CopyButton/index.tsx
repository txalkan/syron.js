'use client'

import React from 'react'
import clsx from 'clsx'

import styles from './styles.module.scss'

type CopyButtonSize = 'sm' | 'md' | 'lg'
type CopyButtonVariant = 'surface' | 'ghost'

interface CopyButtonProps
    extends Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        'value' | 'children'
    > {
    /** Text value that will be copied to the clipboard */
    value?: string
    /** Optional callback invoked after attempting to copy */
    onCopied?: (success: boolean) => void
    /** Label used for accessibility and title when ready to copy */
    copyLabel?: string
    /** Label used when the value has been copied */
    copiedLabel?: string
    /** Delay before resetting the copied state */
    resetDelay?: number
    /** Visual size of the button */
    size?: CopyButtonSize
    /** Visual variant of the button */
    variant?: CopyButtonVariant
    /** Override for the default copy icon */
    copyIcon?: React.ReactNode
    /** Override for the default copied icon */
    copiedIcon?: React.ReactNode
    /** Allow providing custom children as button content */
    children?: React.ReactNode
}

function legacyCopy(text: string) {
    if (typeof document === 'undefined') return false

    try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        const result = document.execCommand('copy')
        document.body.removeChild(textarea)
        return result
    } catch (error) {
        console.error('CopyButton: fallback copy failed', error)
        return false
    }
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
    (
        {
            value,
            onCopied,
            copyLabel = 'Copy to clipboard',
            copiedLabel = 'Copied!',
            resetDelay = 2000,
            size = 'md',
            variant = 'surface',
            copyIcon,
            copiedIcon,
            className,
            disabled,
            children,
            onClick,
            ...rest
        },
        ref
    ) => {
        const [copied, setCopied] = React.useState(false)
        const [announcement, setAnnouncement] = React.useState('')
        const iconId = React.useId()

        React.useEffect(() => {
            if (!copied) return

            const timeout = window.setTimeout(() => {
                setCopied(false)
            }, resetDelay)

            return () => {
                window.clearTimeout(timeout)
            }
        }, [copied, resetDelay])

        const handleCopy = React.useCallback(
            async (event: React.MouseEvent<HTMLButtonElement>) => {
                onClick?.(event)
                if (event.defaultPrevented) return

                if (!value) {
                    setAnnouncement('Nothing to copy')
                    onCopied?.(false)
                    return
                }

                if (disabled) return

                const text = String(value)
                let success = false

                try {
                    if (
                        typeof navigator !== 'undefined' &&
                        navigator.clipboard &&
                        typeof navigator.clipboard.writeText === 'function'
                    ) {
                        await navigator.clipboard.writeText(text)
                        success = true
                    } else {
                        success = legacyCopy(text)
                    }
                } catch (error) {
                    console.error('CopyButton: copy failed', error)
                    success = false
                }

                if (success) {
                    setCopied(true)
                    setAnnouncement(copiedLabel)
                } else {
                    setAnnouncement('Failed to copy')
                }

                onCopied?.(success)
            },
            [value, disabled, onClick, copiedLabel, onCopied]
        )

        const sizeClass =
            size === 'sm'
                ? styles.sizeSm
                : size === 'lg'
                  ? styles.sizeLg
                  : undefined

        const variantClass =
            variant === 'ghost' ? styles.variantGhost : styles.variantSurface

        const isDisabled = disabled || !value

        const fallbackCopyIcon = copyIcon ?? (
            <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <rect
                    x="2"
                    y="3.5"
                    width="12.5"
                    height="16"
                    rx="3"
                    fill="#eef2ff"
                    stroke="#1f2937"
                    strokeWidth="1.2"
                />
                <rect
                    x="6.5"
                    y="1.5"
                    width="12.8"
                    height="16.5"
                    rx="3.2"
                    fill="#ffffff"
                    stroke="#1f2937"
                    strokeWidth="1.2"
                />
                <path
                    d="M16 1.5v3.2h3.5"
                    stroke="#1f2937"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
                <path
                    d="M9.5 9.8h8.5"
                    stroke="#1f2937"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />
                <path
                    d="M9.5 13.5h5.5"
                    stroke="#111827"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />
                <circle
                    cx="18.5"
                    cy="13.5"
                    r="2.7"
                    fill="#e0e7ff"
                    stroke="#4338ca"
                    strokeWidth="0.9"
                />
                <path
                    d="M18.5 12v3m-1.5-1.5h3"
                    stroke="#312e81"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
            </svg>
        )

        const fallbackCopiedIcon = copiedIcon ?? (
            <svg
                className={styles.icon}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <rect
                    x="2.5"
                    y="4"
                    width="12.5"
                    height="16"
                    rx="3"
                    fill="#bef7d0"
                    stroke="#047857"
                    strokeWidth="1.1"
                />
                <rect
                    x="6.7"
                    y="2"
                    width="12"
                    height="16.4"
                    rx="3.1"
                    fill="#f0fdf4"
                    stroke="#047857"
                    strokeWidth="1.1"
                />
                <circle
                    cx="17.8"
                    cy="13.5"
                    r="3"
                    fill="#bbf7d0"
                    stroke="#047857"
                    strokeWidth="0.95"
                />
                <path
                    d="M17.8 12.1 15.8 14l-1.2-1.1"
                    stroke="#065f46"
                    strokeWidth="1.45"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M9.8 9.8h7"
                    stroke="#047857"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
                <path
                    d="M9.8 13h4.4"
                    stroke="#10b981"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
            </svg>
        )

        const content = copied ? fallbackCopiedIcon : fallbackCopyIcon

        return (
            <>
                <button
                    ref={ref}
                    type="button"
                    data-copied={copied}
                    className={clsx(
                        styles.copyButton,
                        variantClass,
                        sizeClass,
                        className
                    )}
                    title={copied ? copiedLabel : copyLabel}
                    aria-label={copied ? copiedLabel : copyLabel}
                    aria-live="polite"
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    onClick={handleCopy}
                    {...rest}
                >
                    {children ?? content}
                </button>
                <span className={styles.srOnly} aria-live="polite">
                    {announcement}
                </span>
            </>
        )
    }
)

CopyButton.displayName = 'CopyButton'

export { CopyButton }
