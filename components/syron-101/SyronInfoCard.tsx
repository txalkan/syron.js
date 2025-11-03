import React from 'react'
import styles from './SyronInfoCard.module.scss'
import TypingEffect from './TypingEffect'

const SyronInfoCard = ({ theme }: { theme: 'btc' | 'susd' | 'classic' }) => {
    const mainDesc = 'SAVE YOUR BITCOIN, BORROW BTC•DOLLAR'

    return (
        <div className={styles.classic} data-theme={theme}>
            <h2>
                <TypingEffect text={mainDesc} speed={45} />
            </h2>
            <ul>
                <li>
                    <strong>150% Collateral Ratio</strong> Keep your Bitcoin.
                    Lock $1.50 in BTC to mint $1.00 in SUSD — your BTC stays in
                    your Vault — your Safety Deposit Box on Bitcoin.
                </li>
                <li>
                    <strong>66% Loan-to-Value</strong> Borrow up to 66% of your
                    Bitcoin’s value in Syron stablecoins (SUSD).
                </li>
                <li>
                    <strong>Native Bitcoin Support</strong>{' '}
                    <span>
                        Withdraw SUSD as Runes (BTC•DOLLAR) or{' '}
                        <span className={styles.noWrap}>BRC-20</span> (SYRON) —
                        directly to your self-custodial Bitcoin wallet.
                    </span>
                </li>
            </ul>
        </div>
    )
}

export default SyronInfoCard
