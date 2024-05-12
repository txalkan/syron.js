import styles from './index.module.scss'
import React from 'react'
import Big from 'big.js'
import Image from 'next/image'
import tydradexSvg from '../../../src/assets/icons/ssi_tydradex.svg'
import { CryptoState } from '../../../src/types/vault'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import icoSU$D from '../../../src/assets/icons/ssi_SU$D_iso.svg'
import icoArrow from '../../../src/assets/icons/ssi_icon_3arrowsDown.svg'

Big.PE = 999

type Prop = {
    amount: Big
    token: CryptoState
}

export const TransactionOutput: React.FC<Prop> = ({ amount, token }) => {
    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <Image
                    src={icoArrow}
                    alt="deposit-icon"
                    className={styles.img}
                />
                <div className={styles.outputContainer}>
                    <div className={styles.output}>
                        <Image
                            className={styles.tokenImage}
                            src={token.symbol === 'BTC' ? icoBTC : icoSU$D}
                            alt={token.symbol}
                            key={token.symbol}
                        />
                        <input
                            disabled
                            value={
                                Number(amount) == 0
                                    ? 0
                                    : Number(amount).toLocaleString('de-DE', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                      })
                            }
                            placeholder="0"
                            type="text"
                            className={styles.outputAmt}
                        />
                    </div>
                    <div className={styles.tokenInfo}>| SU$D</div>
                </div>
            </div>
        </div>
    )
}
