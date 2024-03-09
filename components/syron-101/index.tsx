import React, { useState } from 'react'
import styles from './styles.module.scss'
import { updateDonation } from '../../src/store/donation'
import Image from 'next/image'
import icoDown from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import icoUp from '../../src/assets/icons/ssi_icon_3arrowsUp.svg'
import { useTranslation } from 'next-i18next'
import { SyronForm } from '../syron-102'
import Big from 'big.js'
Big.PE = 999
const _0 = Big(0)

function Component() {
    const { t } = useTranslation()
    const [active, setActive] = useState('trade')

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
                    onClick={() => toggleActive('trade')}
                    className={
                        active === 'trade' ? styles.cardActive : styles.card
                    }
                >
                    {/* @review (translate) */}
                    <div className={styles.icoWrapper2}>
                        {/* <Image
                            src={icoDex}
                            alt="trade-ico"
                            height="44"
                            width="44"
                        /> */}
                        <div className={styles.titleX}>Syron Vault</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'trade' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'trade' && (
                    <div className={styles.cardSub}>
                        <div className={styles.wrapper}>
                            <SyronForm startPair={start_pair} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
