import styles from './index.module.scss'
import React from 'react'
import Big from 'big.js'
import Image from 'next/image'
import tydradexSvg from '../../../src/assets/icons/ssi_tydradex.svg'
import { CryptoState } from '../../../src/types/vault'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import icoSYRON from '../../../src/assets/icons/ssi_SYRON_iso.svg'
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
                {/* <Image src={icoArrow} alt="arrow-icon" className={styles.img} /> */}
                <div className={styles.outputContainer}>
                    <div className={styles.output}>
                        <input
                            disabled
                            value={
                                Number(amount) == 0
                                    ? 0
                                    : Number(amount).toLocaleString('en-US', {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                      })
                            }
                            placeholder="0"
                            type="text"
                            className={styles.outputAmt}
                        />
                        <Image
                            className={styles.tokenImage}
                            src={token.symbol === 'BTC' ? icoBTC : icoSYRON}
                            alt={token.symbol}
                            key={token.symbol}
                        />
                    </div>
                    {/* <div className={styles.tokenInfo}>| SYRON</div> */}
                </div>
            </div>
        </div>
    )
}
