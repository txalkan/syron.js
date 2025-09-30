import React from 'react'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { CloseIcon } from '../../icons/close'
import unisatLogo from '../../../src/assets/logos/unisat.svg'
import okxLogo from '../../../src/assets/logos/okx.svg'
import styles from './styles.module.scss'
import { isOKXMobileBrowser } from '../../../src/config/wallet'

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

    // Check if we're in OKX mobile browser
    const isInOKXBrowser = isOKXMobileBrowser()

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
                    {/* Show info message when in OKX browser */}
                    {isInOKXBrowser && (
                        <div
                            style={{
                                padding: '12px',
                                marginBottom: '16px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '8px',
                                border: '1px solid #bae6fd',
                            }}
                        >
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '13px',
                                    color: '#0c4a6e',
                                    lineHeight: '1.5',
                                }}
                            >
                                {t(
                                    'You are using OKX Wallet browser. Connect with OKX for the best experience.'
                                )}
                            </p>
                        </div>
                    )}

                    {/* Only show UniSat option if NOT in OKX mobile browser */}
                    {!isInOKXBrowser && (
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
                                    <div className={styles.walletName}>
                                        UniSat
                                    </div>
                                    {!isUnisatInstalled && (
                                        <span
                                            className={styles.notInstalledLabel}
                                        >
                                            {t('Not Installed')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.walletAction}>
                                {isUnisatInstalled ? (
                                    <button
                                        className={styles.connectButton}
                                        onClick={async (e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            try {
                                                onConnectUnisat()
                                                // Small delay to ensure state updates are processed
                                                setTimeout(() => {
                                                    onClose()
                                                }, 100)
                                            } catch (error) {
                                                console.error(
                                                    'Error in Unisat connection:',
                                                    error
                                                )
                                            }
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
                    )}

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

                <div className={styles.legalContainer}>
                    <div className={styles.legalText}>
                        By connecting your wallet, you agree to TyronDAO&apos;s{' '}
                        <span
                            className={styles.legalLink}
                            onClick={() =>
                                window.open(
                                    'https://docs.tyrondao.org/legal/terms-of-service'
                                )
                            }
                        >
                            Terms of Service
                        </span>{' '}
                        &{' '}
                        <span
                            className={styles.legalLink}
                            onClick={() =>
                                window.open(
                                    'https://docs.tyrondao.org/legal/privacy-policy'
                                )
                            }
                        >
                            Privacy Policy
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WalletOptionsModal
