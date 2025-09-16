import React from 'react'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { CloseIcon } from '../../icons/close'
import unisatLogo from '../../../src/assets/logos/unisat.svg'
import okxLogo from '../../../src/assets/logos/okx.svg'
import styles from './styles.module.scss'

interface WalletOptionsModalProps {
    isOpen: boolean
    onClose: () => void
    onConnectUnisat: () => void
    isUnisatInstalled: boolean
    onConnectOKX: () => void
    isOKXInstalled: boolean
}

const WalletOptionsModal: React.FC<WalletOptionsModalProps> = ({
    isOpen,
    onClose,
    onConnectUnisat,
    isUnisatInstalled,
    onConnectOKX,
    isOKXInstalled,
}) => {
    const { t } = useTranslation()

    if (!isOpen) return null

    return (
        <div className={styles.overlay}>
            <div
                className={styles.overlayClickArea}
                onClick={() => {
                    console.log('Overlay clicked - closing modal')
                    onClose()
                }}
            />
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <p>{t('Select Bitcoin Wallet')}</p>
                    <button className={styles.closeButton} onClick={onClose}>
                        <CloseIcon width={20} height={20} color="#6b7280" />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.walletOption}>
                        <div className={styles.walletInfo}>
                            <div className={styles.walletIcon}>
                                <Image
                                    src={unisatLogo}
                                    alt="UniSat Wallet"
                                    width={24}
                                    height={24}
                                />
                            </div>
                            <div className={styles.walletDetails}>
                                <div className={styles.walletName}>UniSat</div>
                                {!isUnisatInstalled && (
                                    <span className={styles.notInstalledLabel}>
                                        {t('Not Installed')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.walletAction}>
                            {isUnisatInstalled ? (
                                <button
                                    className={styles.connectButton}
                                    onClick={async () => {
                                        onConnectUnisat()
                                        // Small delay to ensure state updates are processed
                                        setTimeout(() => {
                                            onClose()
                                        }, 100)
                                    }}
                                >
                                    {t('Connect')}
                                </button>
                            ) : (
                                <button
                                    className={styles.installButton}
                                    onClick={() =>
                                        window.open(
                                            'https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo',
                                            '_blank'
                                        )
                                    }
                                >
                                    {t('Add to Chrome')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.walletOption}>
                        <div className={styles.walletInfo}>
                            <div className={styles.walletIcon}>
                                <Image
                                    src={okxLogo}
                                    alt="OKX Wallet"
                                    width={24}
                                    height={24}
                                />
                            </div>
                            <div className={styles.walletDetails}>
                                <div className={styles.walletName}>
                                    OKX Web3
                                </div>
                                {!isOKXInstalled && (
                                    <span className={styles.notInstalledLabel}>
                                        {t('Not Installed')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.walletAction}>
                            {isOKXInstalled ? (
                                <button
                                    className={styles.connectButton}
                                    onClick={async () => {
                                        onConnectOKX()
                                        // Small delay to ensure state updates are processed
                                        setTimeout(() => {
                                            onClose()
                                        }, 100)
                                    }}
                                >
                                    {t('Connect')}
                                </button>
                            ) : (
                                <button
                                    className={styles.installButton}
                                    onClick={() =>
                                        window.open(
                                            'https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge',
                                            '_blank'
                                        )
                                    }
                                >
                                    {t('Add to Chrome')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WalletOptionsModal
