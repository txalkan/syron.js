import React from 'react'
import styles from './styles.module.scss'
import WalletDisconnect from '../WalletDisconnect'
import { Big } from '../../src/utils/big'

interface WalletDropdownProps {
    isOpen: boolean
    wallet: {
        type: 'unisat' | 'okx' | null
        address: string | null
        balance: Big | number | null
    }
    onClose: () => void
}

const WalletDropdown: React.FC<WalletDropdownProps> = ({
    isOpen,
    wallet,
    onClose,
}) => {
    if (!isOpen) return null

    return (
        <div className={styles.dropdown}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.walletType}>
                    {wallet.type === 'unisat'
                        ? 'UniSat Wallet'
                        : wallet.type === 'okx'
                          ? 'OKX Wallet'
                          : 'Wallet'}
                </div>
                <div className={styles.connectedStatus}>
                    <div className={styles.statusDot} />
                    Connected
                </div>
            </div>

            {/* Address */}
            {wallet.address && (
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Address</div>
                    <div className={styles.addressValue}>{wallet.address}</div>
                </div>
            )}

            {/* Balance */}
            {wallet.balance !== undefined && wallet.balance !== null && (
                <div className={styles.section}>
                    <div className={styles.sectionLabel}>Balance</div>
                    <div className={styles.balanceValue}>
                        {(() => {
                            try {
                                // Handle both Big object and number types
                                const balanceValue =
                                    wallet.balance instanceof Big
                                        ? wallet.balance
                                        : Big(wallet.balance || 0)
                                return balanceValue.div(1e8).toFixed(8)
                            } catch (error) {
                                console.error(
                                    'Error formatting balance:',
                                    error
                                )
                                return '0'
                            }
                        })()}{' '}
                        BTC
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
                <WalletDisconnect onDisconnect={onClose} />
            </div>
        </div>
    )
}

export default WalletDropdown
