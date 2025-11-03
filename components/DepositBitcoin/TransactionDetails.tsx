import React from 'react'
import styles from './TransactionDetails.module.scss'
import { _0, Big } from '../../src/utils/big'

const TXN_VB = 172 // Virtual bytes for the transaction (1 input, 3 outputs including change)

interface TransactionDetailsProps {
    collateralAmount: Big
    feeAmount: Big
    feeRate: number
}

export function TransactionDetails({
    collateralAmount,
    feeAmount,
    feeRate,
}: TransactionDetailsProps) {
    // State for gas fee calculation
    const [totalDeposit, setTotalDeposit] = React.useState<Big>(_0)
    const [minerFee, setMinerFee] = React.useState<Big>(_0)
    const [depositStatus, setDepositStatus] = React.useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })

    // Update minerFee whenever feeRate changes
    React.useEffect(() => {
        const minerFee = Big(feeRate).mul(TXN_VB)
        setMinerFee(minerFee)
    }, [feeRate])

    // Update total deposit whenever any value changes
    React.useEffect(() => {
        const totalDeposit = collateralAmount.add(feeAmount).add(minerFee)
        setTotalDeposit(totalDeposit)
    }, [
        // Use numeric values for Big objects to ensure change detection
        collateralAmount,
        feeAmount,
        minerFee,
    ])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSubtitle}>
                        Review your collateral deposit and the amount reserved
                        for future transaction fees
                    </div>
                </div>
                <div className={styles.amountDisplay}>
                    <div className={styles.amountSection}>
                        <div className={styles.amountInfo}>
                            <span className={styles.amountLabel}>
                                AMOUNT FOR COLLATERAL{' '}
                            </span>
                            <span className={styles.amountDescription}>
                                Bitcoin to be deposited as collateral
                            </span>
                        </div>
                        <div className={styles.amountValue}>
                            <div className={styles.amountWithLogo}>
                                <span className={styles.amount}>
                                    {collateralAmount
                                        .div(1e8)
                                        .round(8, 0)
                                        .toString()}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={styles.bitcoinIcon}
                                >
                                    <path
                                        d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.362c6.43 1.605 10.342 8.115 8.738 14.542z"
                                        fill="#f7931a"
                                    />
                                    <path
                                        d="M17.464 9.546c.26-1.763-.999-2.704-2.696-3.333l.55-2.207-1.344-.334-.536 2.15c-.354-.088-.717-.171-1.078-.253l.539-2.16-1.344-.334-.55 2.206c-.293-.067-.58-.132-.86-.2l.001-.007-1.853-.462-.357 1.433s.999.23.977.244c.545.136.643.497.627.784l-1.508 6.047c-.037.093-.131.232-.343.179.007.01-.978-.244-.978-.244l-.669 1.51 1.752.436c.326.081.644.165.958.24l-.562 2.253 1.343.334.554-2.22c.37.1.726.192 1.073.278l-.553 2.217 1.344.334.562-2.25c2.295.434 4.02.259 4.747-1.815.591-1.675-.029-2.641-1.249-3.27.889-.205 1.558-.79 1.737-2.001zm-3.006 4.219c-.42 1.685-3.264.866-4.185.61l.747-2.993c.92.229 3.872.68 3.438 2.383zm.42-4.242c-.383 1.537-2.749.758-3.516.565l.676-2.708c.767.191 3.24.549 2.84 2.143z"
                                        fill="#fff"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className={styles.amountSection}>
                        <div className={styles.amountInfo}>
                            <span className={styles.amountLabel}>
                                AMOUNT FOR FEES
                            </span>
                            <span className={styles.amountDescription}>
                                To cover Safety Deposit ₿ox transaction fees
                            </span>
                        </div>
                        <div className={styles.amountValue}>
                            <div className={styles.amountWithLogo}>
                                <span className={styles.amount}>
                                    {feeAmount.div(1e8).round(8, 0).toString()}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={styles.bitcoinIcon}
                                >
                                    <path
                                        d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.362c6.43 1.605 10.342 8.115 8.738 14.542z"
                                        fill="#f7931a"
                                    />
                                    <path
                                        d="M17.464 9.546c.26-1.763-.999-2.704-2.696-3.333l.55-2.207-1.344-.334-.536 2.15c-.354-.088-.717-.171-1.078-.253l.539-2.16-1.344-.334-.55 2.206c-.293-.067-.58-.132-.86-.2l.001-.007-1.853-.462-.357 1.433s.999.23.977.244c.545.136.643.497.627.784l-1.508 6.047c-.037.093-.131.232-.343.179.007.01-.978-.244-.978-.244l-.669 1.51 1.752.436c.326.081.644.165.958.24l-.562 2.253 1.343.334.554-2.22c.37.1.726.192 1.073.278l-.553 2.217 1.344.334.562-2.25c2.295.434 4.02.259 4.747-1.815.591-1.675-.029-2.641-1.249-3.27.889-.205 1.558-.79 1.737-2.001zm-3.006 4.219c-.42 1.685-3.264.866-4.185.61l.747-2.993c.92.229 3.872.68 3.438 2.383zm.42-4.242c-.383 1.537-2.749.758-3.516.565l.676-2.708c.767.191 3.24.549 2.84 2.143z"
                                        fill="#fff"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={styles.amountSection}>
                        <div className={styles.amountInfo}>
                            <span className={styles.amountLabel}>
                                Miner Fee
                            </span>
                            <span className={styles.amountDescription}>
                                The payment required by the miner to process
                                this transaction
                            </span>
                        </div>
                        <div className={styles.amountValue}>
                            <div className={styles.amountWithLogo}>
                                <span className={styles.amount}>
                                    {minerFee === _0
                                        ? '-'
                                        : minerFee
                                              .div(1e8)
                                              .round(8, 0)
                                              .toString()}
                                </span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={styles.bitcoinIcon}
                                >
                                    <path
                                        d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.362c6.43 1.605 10.342 8.115 8.738 14.542z"
                                        fill="#f7931a"
                                    />
                                    <path
                                        d="M17.464 9.546c.26-1.763-.999-2.704-2.696-3.333l.55-2.207-1.344-.334-.536 2.15c-.354-.088-.717-.171-1.078-.253l.539-2.16-1.344-.334-.55 2.206c-.293-.067-.58-.132-.86-.2l.001-.007-1.853-.462-.357 1.433s.999.23.977.244c.545.136.643.497.627.784l-1.508 6.047c-.037.093-.131.232-.343.179.007.01-.978-.244-.978-.244l-.669 1.51 1.752.436c.326.081.644.165.958.24l-.562 2.253 1.343.334.554-2.22c.37.1.726.192 1.073.278l-.553 2.217 1.344.334.562-2.25c2.295.434 4.02.259 4.747-1.815.591-1.675-.029-2.641-1.249-3.27.889-.205 1.558-.79 1.737-2.001zm-3.006 4.219c-.42 1.685-3.264.866-4.185.61l.747-2.993c.92.229 3.872.68 3.438 2.383zm.42-4.242c-.383 1.537-2.749.758-3.516.565l.676-2.708c.767.191 3.24.549 2.84 2.143z"
                                        fill="#fff"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className={styles.totalAmountSection}>
                        <div className={styles.totalAmountInfo}>
                            <div className={styles.totalAmountLabel}>
                                Total Deposit
                            </div>
                            <div className={styles.totalAmountDescription}>
                                Total BTC needed for this transaction
                            </div>
                        </div>
                        <div className={styles.totalAmountValue}>
                            <span className={styles.totalAmount}>
                                {totalDeposit.div(1e8).round(8, 0).toString()}{' '}
                                BTC
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Display */}
            {depositStatus.type && (
                <div
                    className={`${styles.statusMessage} ${styles[depositStatus.type]}`}
                >
                    <div className={styles.statusIcon}>
                        {depositStatus.type === 'success' ? (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M20 6L9 17l-5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        ) : (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <line
                                    x1="15"
                                    y1="9"
                                    x2="9"
                                    y2="15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                                <line
                                    x1="9"
                                    y1="9"
                                    x2="15"
                                    y2="15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                            </svg>
                        )}
                    </div>
                    <span className={styles.statusText}>
                        {depositStatus.message}
                    </span>
                </div>
            )}
        </div>
    )
}
