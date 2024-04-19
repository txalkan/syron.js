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
Big.PE = 999
const _0 = Big(0)

function Component() {
    const tyron = useStore($syron)
    const { t } = useTranslation()
    const [active, setActive] = useState('syron')

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

    // @dev (syron)
    return (
        <div className={styles.container}>
            {/* @dev: trade */}
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('syron')}
                    className={
                        active === 'syron' ? styles.cardActive : styles.card
                    }
                >
                    <div className={styles.icoWrapper2}>
                        <div className={styles.titleX}>Be Your Own ₿ank</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'syron' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'syron' && (
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
                                height="17"
                                width="17"
                            />
                            <span
                                style={{
                                    paddingLeft: '4px',
                                    paddingRight: '8px',
                                }}
                            >
                                BTC: {Number(tyron?.box_balance.div(1e8))}
                            </span>
                            <Image
                                src={icoBTC}
                                alt={'BTC'}
                                height="17"
                                width="17"
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
                                height="17"
                                width="17"
                            />
                            <span style={{ paddingLeft: '4px' }}>
                                <span
                                    onClick={() =>
                                        window.open(
                                            `https://mempool.space/testnet/address/${tyron?.ssi_box}`
                                        )
                                    }
                                    style={{
                                        paddingLeft: '4px',
                                        cursor: 'pointer',
                                        textDecorationLine: 'underline',
                                        textDecorationColor: '#ffff32',
                                    }}
                                >
                                    {tyron?.ssi_box}
                                </span>
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
