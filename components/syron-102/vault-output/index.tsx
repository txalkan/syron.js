import styles from '../../swap-form/dex-output/index.module.scss'
import React, { useState } from 'react'
import Big from 'big.js'
import Image from 'next/image'
import tydradexSvg from '../../../src/assets/icons/ssi_tydradex.svg'
import { CryptoState } from '../../../src/types/vault'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import icoSU$D from '../../../src/assets/icons/ssi_SU$D_iso.svg'

Big.PE = 999

type Prop = {
    amount: Big
    token: CryptoState
}

export const VaultOutput: React.FC<Prop> = ({ amount, token }) => {
    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.formActive}>
                    <div className={styles.content}>
                        <div className={styles.tokenDexRow}>
                            <div className={styles.dummyIco2}>
                                <Image
                                    src={tydradexSvg}
                                    alt="SSI Vault"
                                    layout="responsive"
                                />
                            </div>
                            <div className={styles.dexName}>₿e Your ₿ank</div>
                        </div>
                        <div className={styles.output}>
                            <input
                                disabled
                                value={'56000'} //String(amount)}
                                placeholder="0"
                                type="text"
                                className={styles.inputDex}
                            />
                            <Image
                                src={token.symbol === 'BTC' ? icoBTC : icoSU$D}
                                alt={token.symbol}
                                key={token.symbol}
                                height="35"
                                width="35"
                                className={styles.symbol}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
