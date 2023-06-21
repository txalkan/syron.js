import styles from './index.module.scss'

import React from 'react'
import Big from 'big.js'
import Image from 'next/image'

import { getIconURL } from '../../../src/lib/viewblock'
import classNames from 'classnames'
import { TokenState } from '../../../src/types/token'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'

Big.PE = 999

type Prop = {
    token: TokenState
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
                        onClick={onSelect}
                    >
                        <Image
                            src={getIconURL(token.bech32)}
                            alt="tokens-logo"
                            height="30"
                            width="30"
                        />
                        <div>{token.symbol}</div>
                        <div className={styles.arrowIco}>
                            <Image alt="arrow-ico" src={ArrowDownReg} />
                        </div>
                    </div>
                </div>
            </div>
        </label>
    )
}
