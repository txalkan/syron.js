import React from 'react'
import styles from './SyronInfoCard.module.scss'
import TypingEffect from './TypingEffect'

const SyronInfoCard = () => {
    const mainDesc = 'SYRON • SAVE YOUR BITCOIN, BORROW STABLECOINS'

    return (
        <div className={styles.classic}>
            <h2>
                <TypingEffect text={mainDesc} speed={50} />
            </h2>
            <ul>
                <li>
                    <strong>
                        Over-
                        <span className={styles.nowrap}>Collateralization</span>
                    </strong>{' '}
                    Each dollar borrowed is backed by a minimum of $1.50 in BTC
                    held in your Safety Deposit ₿ox
                </li>
                <li>
                    <strong>Loan-to-Value</strong> You can borrow Syron
                    stablecoins up to 66,6% of your Bitcoin collateral value
                </li>
                <li>
                    <strong>Multi-Token Support</strong> Withdrawals are
                    supported as both BRC-20 & Rune tokens to your
                    self-custodial Bitcoin wallet
                </li>
            </ul>
        </div>
    )
}

export default SyronInfoCard
