import React, { useState } from 'react'
import styles from './styles.module.scss'
import { updateDonation } from '../../src/store/donation'
import Image from 'next/image'
import icoDown from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import icoUp from '../../src/assets/icons/ssi_icon_3arrowsUp.svg'
import { useTranslation } from 'next-i18next'
import { SyronForm } from '../syron-102'
import icoBalance from '../../src/assets/icons/ssi_icon_balance.svg'
import icoBTC from '../../src/assets/icons/bitcoin.png'
import icoThunder from '../../src/assets/icons/ssi_icon_thunder.svg'
import Big from 'big.js'
import { $syron } from '../../src/store/syron'
import { useStore } from 'react-stores'
import useICPHook from '../../src/hooks/useICP'
import { toast } from 'react-toastify'
Big.PE = 999
const _0 = Big(0)

function Component() {
    const tyron = useStore($syron)
    const { t } = useTranslation()
    const [active, setActive] = useState('GetSyron')

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            setActive(id)
        }
    }
    const resetState = () => {
        updateDonation(null)
    }

    const start_pair = [
        {
            value: _0,
            meta: {
                name: 'Bitcoin',
                symbol: 'BTC',
                decimals: 8,
            },
        },
        {
            value: _0,
            meta: {
                name: 'Syron U$D',
                symbol: 'SU$D',
                decimals: 8,
            },
        },
    ]

    const { redeemBTC } = useICPHook()
    const [isLoading, setIsLoading] = useState(false)
    const handleRedeem = async () => {
        setIsLoading(true)
        toast.info('Coming soon', {
            position: 'bottom-center',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            toastId: 1,
        })
        // await redeemBTC(tyron?.ssi_box!)
        setIsLoading(false)
    }

    return (
        <div className={styles.container}>
            {/* @dev: trade */}
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('GetSyron')}
                    className={
                        active === 'GetSyron' ? styles.cardSelect : styles.card
                    }
                >
                    Withdraw Syron
                </div>
                <div
                    className={
                        active === 'GetSyron'
                            ? styles.cardTitle
                            : styles.cardBeYourBank
                    }
                >
                    <div className={styles.title}>Be Your Own ₿ank ᛞ</div>

                    {/* <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'GetSyron' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div> */}
                </div>
                {active === 'GetSyron' && (
                    <div className={styles.cardSub}>
                        <div className={styles.wrapper}>
                            <SyronForm startPair={start_pair} />
                        </div>
                    </div>
                )}
                {tyron?.ssi_box && (
                    <div className={styles.boxWrapper}>
                        <p className={styles.boxTitle}>
                            Your Safety Deposit ₿ox
                            {/* <span @review
                                    onClick={updateBitcoinVault}
                                    style={{
                                        cursor: 'pointer',
                                        paddingLeft: '8px',
                                    }}
                                >
                                    {loading ? (
                                        <Spinner />
                                    ) : (
                                        <Image
                                            src={refreshIco}
                                            alt="refresh-ico"
                                            height="12"
                                            width="12"
                                        />
                                    )}
                                </span> */}
                        </p>
                        <p className={styles.info}>
                            <Image
                                src={icoBalance}
                                alt={'BTC'}
                                height="18"
                                width="18"
                            />
                            <span className={styles.sdb}>
                                BTC: {Number(tyron?.box_balance.div(1e8))}
                            </span>
                            <Image
                                src={icoBTC}
                                alt={'BTC'}
                                height="18"
                                width="18"
                            />
                        </p>
                        <p
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                            }}
                        >
                            <Image
                                src={icoThunder}
                                alt={'Wallet'}
                                height="18"
                                width="18"
                            />
                            <span style={{ paddingLeft: '4px' }}>
                                <span
                                    onClick={() =>
                                        window.open(
                                            `https://mempool.space/testnet/address/${tyron?.ssi_box}`
                                        )
                                    }
                                    className={styles.sdb}
                                >
                                    {tyron?.ssi_box}
                                </span>
                            </span>
                        </p>
                        <button
                            style={{
                                width: '56%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '1rem',
                                cursor: 'pointer',
                                borderRadius: '14px',
                                // @design-shadow-3d
                                backgroundImage:
                                    'linear-gradient(to right, #ffffff2e, #333333)', // Added gradient background
                                boxShadow:
                                    '0 0 14px rgba(255, 255, 50, 0.6), inset 0 -3px 7px rgba(0, 0, 0, 0.4)', // Added 3D effect
                            }}
                            disabled={isLoading}
                            onClick={handleRedeem}
                        >
                            <div className={styles.txt}>redeem btc</div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
