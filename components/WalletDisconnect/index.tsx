import React from 'react'
import { useWalletDisconnect } from '../../src/hooks/useWalletDisconnect'
import styles from './styles.module.scss'
import powerIconBlack from '../../src/assets/icons/power_icon_black.svg'
import Image from 'next/image'

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
            <Image
                src={powerIconBlack}
                alt="Power Off Icon"
                width={20}
                height={20}
                style={{
                    filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
                }}
            />
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}
        </button>
    )
}

export default WalletDisconnect
