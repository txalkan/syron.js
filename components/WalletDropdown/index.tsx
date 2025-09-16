import React from 'react'
import styles from './styles.module.scss'
import Big from 'big.js'

interface WalletDropdownProps {
    isOpen: boolean
    wallet: {
        type: 'unisat' | 'okx' | null
        address: string | null
        balance: Big | null
    }
    isDisconnecting: boolean
    onDisconnect: () => Promise<void>
    onClose: () => void
}

const WalletDropdown: React.FC<WalletDropdownProps> = ({
    isOpen,
    wallet,
    isDisconnecting,
    onDisconnect,
    onClose,
}) => {
    if (!isOpen) return null

    const handleDisconnect = async () => {
        await onDisconnect()
        onClose()
    }

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
                        {wallet.balance.div(1e8).toFixed(8)} BTC
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className={`${styles.disconnectButton} ${
                        isDisconnecting ? styles.disabled : ''
                    }`}
                >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}
                </button>
            </div>
        </div>
    )
}

export default WalletDropdown
