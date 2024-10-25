import styles from './index.module.scss'

import React from 'react'
import Big from 'big.js'
import Image from 'next/image'

import { getIconURL } from '../../../src/lib/viewblock'
import classNames from 'classnames'
import { TokenState } from '../../../src/types/token'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
//@ssibrowser
import icoSYRON from '../../../src/assets/icons/ssi_SYRON_iso.svg'
import icoORDI from '../../../src/assets/icons/brc-20-ORDI.png'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import { CryptoState } from '../../../src/types/vault'

Big.PE = 999

type Prop = {
    token: CryptoState
    onSelect?: () => void
}

export const TokenInput: React.FC<Prop> = ({
    token,
    onSelect = () => null,
}) => {
    return (
        <label>
            <div className={classNames(styles.container)}>
                <div className={styles.wrapper}>
                    <div
                        className={classNames(styles.dropdown)}
                        // onClick={onSelect}
                    >
                        <Image
                            src={token.symbol === 'BTC' ? icoBTC : icoSYRON}
                            alt="tokens-logo"
                            height="35"
                            width="35"
                        />
                        <div className={styles.symbol}>{token.symbol}</div>
                        {/* <div className={styles.arrowIco}>
                            <Image alt="arrow-ico" src={ArrowDownReg} />
                        </div> */}
                    </div>
                </div>
            </div>
        </label>
    )
}
