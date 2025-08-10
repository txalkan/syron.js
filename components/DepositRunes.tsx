'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from 'antd'
import { Button } from './Button'
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableHeaderCell,
} from './Table'
import { TransactionDetails } from './DepositRunes/TransactionDetails'
import LoadingSpinner from './LoadingSpinner'
import styles from './DepositRunes.module.scss'

// Constants
const STABLE_DEPOSIT_THRESHOLD = 0.1

type StateType = [boolean, () => void, () => void, () => void] & {
    state: boolean
    open: () => void
    close: () => void
    toggle: () => void
}

const useToggleState = (initial = false) => {
    const [state, setState] = React.useState<boolean>(initial)

    const close = () => {
        setState(false)
    }

    const open = () => {
        setState(true)
    }

    const toggle = () => {
        setState((state) => !state)
    }

    const hookData = [state, open, close, toggle] as StateType
    hookData.state = state
    hookData.open = open
    hookData.close = close
    hookData.toggle = toggle
    return hookData
}

interface RunesDepositBalance {
    depositedAmount: string
    runeId: string
    runeName: string
    summary: string
}

interface DepositRunesProps {
    open: boolean
    onClose: () => void
    sdbAddress?: string // SDB address to fetch balances
}

export function DepositRunes({ open, onClose, sdbAddress }: DepositRunesProps) {
    const [editOpen, showEdit, closeEdit] = useToggleState()
    const [balanceToEdit, setBalanceToEdit] =
        React.useState<RunesDepositBalance | null>(null)
    const [runesBalances, setRunesBalances] = React.useState<
        RunesDepositBalance[]
    >([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [isCopied, setIsCopied] = React.useState(false)

    // Runes deposit balance books
    const runesDepositBalances: RunesDepositBalance[] = [
        {
            depositedAmount: '0',
            runeId: '902268:517', // @review (alpha)
            runeName: 'RUNE•DOLLAR',
            summary:
                'Current runes balance in your Safety Deposit Box. This balance represents the total amount of RUNE•DOLLAR runes available for deposits.',
        },
        {
            depositedAmount: '0',
            runeId: '908838:2480', // @review (alpha)
            runeName: 'BTC•DOLLAR',
            summary:
                'Current runes balance in your Safety Deposit Box. This balance represents the total amount of BTC•DOLLAR runes available for deposits.',
        },
    ]

    // Fetch runes balances from API
    const fetchRunesBalances = React.useCallback(async () => {
        if (!sdbAddress) return

        setIsLoading(true)
        try {
            const fetches = runesDepositBalances.map((rune) =>
                fetch(
                    `/api/get-unisat-runes-addr-balance?addr=${sdbAddress}&runeid=${rune.runeId}`
                ).then((res) =>
                    res.json().then((data) => ({ data, runeId: rune.runeId }))
                )
            )
            const results = await Promise.all(fetches)

            // Combine all data into a single array
            const allData = results
                .filter((result) => result.data && result.data.data)
                .flatMap((result) => [result.data.data])

            if (allData.length > 0) {
                const updatedBalances = runesDepositBalances.map((rune) => {
                    const result = results.find((r) => r.runeId === rune.runeId)
                    const balance =
                        result &&
                        result.data &&
                        result.data.data &&
                        result.data.data.amount !== undefined
                            ? result.data.data.amount
                            : '0'
                    return {
                        ...rune,
                        depositedAmount: balance,
                    }
                })
                setRunesBalances(updatedBalances)
                console.log(
                    '✅ Runes balances updated:',
                    updatedBalances
                        .map((b) => `${b.runeName}: ${b.depositedAmount}`)
                        .join(', ')
                )
            } else {
                setRunesBalances(runesDepositBalances)
            }
        } catch (error) {
            console.error(
                '❌ Error fetching runes balances:',
                error instanceof Error ? error.message : 'Unknown error'
            )
            setRunesBalances(runesDepositBalances)
        } finally {
            setIsLoading(false)
        }
    }, [sdbAddress])

    // Fetch balances on component mount and when sdbAddress changes
    React.useEffect(() => {
        if (open && sdbAddress) {
            fetchRunesBalances()
        }
    }, [open, sdbAddress, fetchRunesBalances])

    const editBalance = async (balance: RunesDepositBalance) => {
        if (sdbAddress) {
            try {
                const response = await fetch(
                    `/api/get-unisat-runes-addr-balance?addr=${sdbAddress}&runeid=${balance.runeId}`
                )
                const data = await response.json()

                if (data && data.data) {
                    const apiBalance = data.data
                    const updatedBalance = apiBalance
                        ? apiBalance.amount || '0'
                        : '0'

                    const updatedRunesBalances = runesBalances.map((rune) =>
                        rune.runeId === balance.runeId
                            ? { ...rune, depositedAmount: updatedBalance }
                            : rune
                    )
                    setRunesBalances(updatedRunesBalances)

                    setBalanceToEdit({
                        ...balance,
                        depositedAmount: updatedBalance,
                    })

                    console.log(
                        `✅ ${balance.runeName} balance updated: ${updatedBalance}`
                    )
                } else {
                    setBalanceToEdit(balance)
                }
            } catch (error) {
                console.error(
                    `❌ Error fetching ${balance.runeName} balance:`,
                    error instanceof Error ? error.message : 'Unknown error'
                )
                setBalanceToEdit(balance)
            }
        } else {
            setBalanceToEdit(balance)
        }

        showEdit()
    }

    const onSave = () => {
        // update balance
        closeEdit()
    }

    // Use fetched balances or fallback to default
    const displayBalances =
        runesBalances.length > 0 ? runesBalances : runesDepositBalances

    if (!open) return null

    return (
        <div className={styles.container} onClick={onClose}>
            <div
                className={styles.drawerContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.drawerHeader}>
                    <h3>
                        {editOpen
                            ? 'Deposit' + ' ' + balanceToEdit?.runeName
                            : 'Deposit Runes'}
                    </h3>
                    <div className={styles.headerActions}>
                        {!editOpen && (
                            <button
                                onClick={fetchRunesBalances}
                                disabled={isLoading}
                                className={styles.refreshButton}
                                title="Refresh balances"
                            >
                                {isLoading ? (
                                    <LoadingSpinner size="md" />
                                ) : (
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M1 4v6h6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M23 20v-6h-6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        )}
                        <span onClick={onClose}>&times;</span>
                    </div>
                </div>
                <div className={styles.drawerBody}>
                    {editOpen ? (
                        <TransactionDetails
                            runeName={balanceToEdit?.runeName || ''}
                            depositedAmount={
                                balanceToEdit?.depositedAmount || '0'
                            }
                            onClose={closeEdit}
                            onConfirm={() => onSave()}
                            sdbAddress={sdbAddress || ''}
                        />
                    ) : (
                        <>
                            <div className={styles.tableContainer}>
                                <Table className={styles.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>
                                                Rune Name
                                            </TableHeaderCell>
                                            <TableHeaderCell>
                                                Deposited Amount
                                            </TableHeaderCell>
                                            {/* <TableHeaderCell>
                                                Rune ID
                                            </TableHeaderCell> */}
                                            {/* <TableHeaderCell
                                                className={styles.actionsCell}
                                            >
                                                Actions
                                            </TableHeaderCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {displayBalances.map(
                                            (balance, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <span
                                                            className={
                                                                styles.runeName
                                                            }
                                                        >
                                                            {balance.runeName}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection:
                                                                    'column',
                                                                alignItems:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius:
                                                                    '8px',
                                                                padding:
                                                                    '8px 0',
                                                                minWidth:
                                                                    '120px',
                                                                background:
                                                                    '#fafbfc',
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontWeight: 600,
                                                                    fontSize:
                                                                        '1.1em',
                                                                    marginBottom:
                                                                        '4px',
                                                                    letterSpacing:
                                                                        '0.5px',
                                                                }}
                                                            >
                                                                {
                                                                    balance.depositedAmount
                                                                }
                                                            </span>
                                                            <span
                                                                className={
                                                                    isLoading
                                                                        ? styles.loadingTag
                                                                        : parseFloat(
                                                                                balance.depositedAmount
                                                                            ) ===
                                                                            STABLE_DEPOSIT_THRESHOLD
                                                                          ? styles.confirmedTag
                                                                          : parseFloat(
                                                                                  balance.depositedAmount
                                                                              ) >
                                                                              0
                                                                            ? styles.pendingTag
                                                                            : styles.confirmedTag
                                                                }
                                                                style={{
                                                                    display:
                                                                        'inline-block',
                                                                    minWidth:
                                                                        '80px',
                                                                    textAlign:
                                                                        'center',
                                                                    borderRadius:
                                                                        '6px',
                                                                    padding:
                                                                        '2px 10px',
                                                                    fontSize:
                                                                        '0.95em',
                                                                    background:
                                                                        isLoading
                                                                            ? '#f0f9ff'
                                                                            : parseFloat(
                                                                                    balance.depositedAmount
                                                                                ) ===
                                                                                STABLE_DEPOSIT_THRESHOLD
                                                                              ? '#e6fff2'
                                                                              : parseFloat(
                                                                                      balance.depositedAmount
                                                                                  ) >
                                                                                  0
                                                                                ? '#fffbe6'
                                                                                : '#e6fff2',
                                                                    color: isLoading
                                                                        ? '#0369a1'
                                                                        : parseFloat(
                                                                                balance.depositedAmount
                                                                            ) ===
                                                                            STABLE_DEPOSIT_THRESHOLD
                                                                          ? '#1a7f37'
                                                                          : parseFloat(
                                                                                  balance.depositedAmount
                                                                              ) >
                                                                              0
                                                                            ? '#bfa100'
                                                                            : '#1a7f37',
                                                                    border: isLoading
                                                                        ? '1px solid #7dd3fc'
                                                                        : parseFloat(
                                                                                balance.depositedAmount
                                                                            ) ===
                                                                            STABLE_DEPOSIT_THRESHOLD
                                                                          ? '1px solid #b7eb8f'
                                                                          : parseFloat(
                                                                                  balance.depositedAmount
                                                                              ) >
                                                                              0
                                                                            ? '1px solid #ffe58f'
                                                                            : '1px solid #b7eb8f',
                                                                }}
                                                            >
                                                                {isLoading ? (
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            gap: '6px',
                                                                        }}
                                                                    >
                                                                        <LoadingSpinner size="sm" />
                                                                        <span>
                                                                            Loading...
                                                                        </span>
                                                                    </div>
                                                                ) : parseFloat(
                                                                      balance.depositedAmount
                                                                  ) ===
                                                                  STABLE_DEPOSIT_THRESHOLD ? (
                                                                    'Stable Deposit'
                                                                ) : parseFloat(
                                                                      balance.depositedAmount
                                                                  ) > 0 ? (
                                                                    'Pending'
                                                                ) : (
                                                                    'Confirmed'
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    {/* <TableCell>
                                                        <span
                                                            className={
                                                                styles.runeId
                                                            }
                                                        >
                                                            {balance.runeId.replace(
                                                                ':',
                                                                ':\n'
                                                            )}
                                                        </span>
                                                    </TableCell> */}
                                                    <TableCell
                                                        className={
                                                            styles.actionsCell
                                                        }
                                                    >
                                                        <Button
                                                            variant="primary"
                                                            onClick={() =>
                                                                editBalance(
                                                                    balance
                                                                )
                                                            }
                                                            className={`${styles.confirmButton} ${
                                                                parseFloat(
                                                                    balance.depositedAmount
                                                                ) === 0 ||
                                                                parseFloat(
                                                                    balance.depositedAmount
                                                                ) ===
                                                                    STABLE_DEPOSIT_THRESHOLD
                                                                    ? styles.confirmed
                                                                    : ''
                                                            }`}
                                                            disabled={
                                                                parseFloat(
                                                                    balance.depositedAmount
                                                                ) === 0 ||
                                                                parseFloat(
                                                                    balance.depositedAmount
                                                                ) ===
                                                                    STABLE_DEPOSIT_THRESHOLD
                                                            }
                                                        >
                                                            {parseFloat(
                                                                balance.depositedAmount
                                                            ) ===
                                                            STABLE_DEPOSIT_THRESHOLD
                                                                ? 'Confirmed'
                                                                : parseFloat(
                                                                        balance.depositedAmount
                                                                    ) > 0
                                                                  ? 'CONFIRM'
                                                                  : 'Confirmed'}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Always show SDB address section */}
                            <div className={styles.sdbAddressSection}>
                                {displayBalances.some(
                                    (balance) =>
                                        parseFloat(balance.depositedAmount) >
                                        STABLE_DEPOSIT_THRESHOLD
                                ) ? (
                                    // Show message for pending deposits
                                    <div
                                        className={
                                            styles.pendingDepositsMessage
                                        }
                                    >
                                        <div
                                            className={
                                                styles.pendingDepositsIcon
                                            }
                                        >
                                            <svg
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="#fbbf24"
                                                    strokeWidth="2"
                                                    fill="#fef3c7"
                                                />
                                                <path
                                                    d="M12 8v8M8 12h8"
                                                    stroke="#f59e0b"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <h4
                                            className={
                                                styles.pendingDepositsTitle
                                            }
                                        >
                                            Pending Deposits Available
                                        </h4>
                                        <p
                                            className={
                                                styles.pendingDepositsText
                                            }
                                        >
                                            Click on CONFIRM to credit your
                                            pending deposits.
                                        </p>
                                    </div>
                                ) : displayBalances.every(
                                      (balance) =>
                                          parseFloat(
                                              balance.depositedAmount
                                          ) === 0
                                  ) ? (
                                    // Show message for no deposits
                                    <div className={styles.noDepositsMessage}>
                                        <div className={styles.noDepositsIcon}>
                                            <svg
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="#d1d5db"
                                                    strokeWidth="2"
                                                    fill="#f9fafb"
                                                />
                                                <path
                                                    d="M12 8v8M8 12h8"
                                                    stroke="#9ca3af"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <h4 className={styles.noDepositsTitle}>
                                            No deposits found
                                        </h4>
                                        <p className={styles.noDepositsText}>
                                            No deposits are confirmed in your
                                            Safety Deposit Box.
                                        </p>
                                    </div>
                                ) : null}

                                <p className={styles.sdbAddressLabel}>
                                    To make a new deposit, send a rune transfer
                                    to your Safety Deposit Box address:
                                </p>
                                <div className={styles.sdbAddressContainer}>
                                    <code className={styles.sdbAddress}>
                                        {sdbAddress || 'Loading...'}
                                    </code>
                                    <button
                                        onClick={() => {
                                            if (sdbAddress) {
                                                navigator.clipboard.writeText(
                                                    sdbAddress
                                                )
                                                setIsCopied(true)
                                                // Reset the copied state after 2 seconds
                                                setTimeout(() => {
                                                    setIsCopied(false)
                                                }, 2000)
                                            }
                                        }}
                                        className={`${styles.copyButton} ${isCopied ? styles.copied : ''}`}
                                        title={
                                            isCopied
                                                ? 'Copied!'
                                                : 'Copy SDB address'
                                        }
                                    >
                                        {isCopied ? (
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M20 6L9 17l-5-5"
                                                    stroke="#10b981"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <rect
                                                    x="8"
                                                    y="2"
                                                    width="8"
                                                    height="4"
                                                    rx="1"
                                                    ry="1"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className={styles.drawerFooter}>
                    {!editOpen && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    if (sdbAddress) {
                                        window.open(
                                            `https://mempool.space/address/${sdbAddress}`,
                                            '_blank'
                                        )
                                    }
                                }}
                                className={styles.explorerButton}
                                disabled={!sdbAddress}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <polyline
                                        points="15,3 21,3 21,9"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <line
                                        x1="10"
                                        y1="14"
                                        x2="21"
                                        y2="3"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                View on Mempool
                            </Button>
                            {/* <Button variant="secondary" onClick={onClose}>
                                Close
                            </Button> */}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
