import React from 'react'
import { useWalletDisconnect } from '../../src/hooks/useWalletDisconnect'
import styles from './styles.module.scss'

interface WalletDisconnectProps {
    onDisconnect?: () => void
}

export function WalletDisconnect({ onDisconnect }: WalletDisconnectProps) {
    const { disconnectWallet, isDisconnecting } = useWalletDisconnect()

    const handleDisconnect = async () => {
        await disconnectWallet('user request')
        // Call optional callback
        onDisconnect?.()
    }

    return (
        <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className={styles.disconnectButton}
        >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}
        </button>
    )
}

export default WalletDisconnect
