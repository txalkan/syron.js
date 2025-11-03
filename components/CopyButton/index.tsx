'use client'

import React from 'react'
import clsx from 'clsx'
import 'remixicon/fonts/remixicon.css'

import styles from './styles.module.scss'

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

            className,
            disabled,
            children,
            onClick,
            onMouseEnter,
            onMouseLeave,
            ...rest
        },
        ref
    ) => {
        const [copied, setCopied] = React.useState(false)
        const [announcement, setAnnouncement] = React.useState('')
        const [hovered, setHovered] = React.useState(false)

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

        const isDisabled = disabled || !value

        const clipboardIcon = (
            <i
                className={clsx(
                    hovered ? 'ri-file-copy-fill' : 'ri-file-copy-line',
                    styles.icon
                )}
                aria-hidden="true"
            />
        )

        const handleMouseEnter = React.useCallback(
            (event: React.MouseEvent<HTMLButtonElement>) => {
                setHovered(true)
                onMouseEnter?.(event)
            },
            [onMouseEnter]
        )

        const handleMouseLeave = React.useCallback(
            (event: React.MouseEvent<HTMLButtonElement>) => {
                setHovered(false)
                onMouseLeave?.(event)
            },
            [onMouseLeave]
        )

        return (
            <>
                <button
                    ref={ref}
                    type="button"
                    className={clsx(
                        styles.copyButton,
                        hovered && styles.isHovered,
                        className
                    )}
                    title={copied ? copiedLabel : copyLabel}
                    aria-label={copied ? copiedLabel : copyLabel}
                    aria-live="polite"
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    onClick={handleCopy}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onFocus={() => setHovered(true)}
                    onBlur={() => setHovered(false)}
                    {...rest}
                >
                    {children ?? clipboardIcon}
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
