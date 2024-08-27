import * as tyron from 'tyron'
import styles from './index.module.scss'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import SwapIcon from '../../icons/swap'
import icoSU$D from '../../../src/assets/icons/ssi_SU$D_iso.svg'
import icoORDI from '../../../src/assets/icons/brc-20-ORDI.png'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import { CryptoState } from '../../../src/types/vault'
import { useStore } from 'react-stores'
import { $btc_wallet, $syron } from '../../../src/store/syron'
import Big from 'big.js'
import { $xr } from '../../../src/store/xr'
import icoArrow from '../../../src/assets/icons/ssi_icon_3arrowsDown.svg'

Big.PE = 999
const _0 = Big(0)

type Prop = {
    token: CryptoState
    value: Big
    disabled?: boolean
    noSwap?: boolean
    onInput?: (value: Big) => void
    onSelect?: () => void
    onMax?: (b: Big) => void
    onSwap?: () => void
    selectedData
}

const list = [10, 25, 50, 75]

export const BoxLiquidInput: React.FC<Prop> = ({
    value: value_,
    token,
    disabled,
    noSwap = false,
    onInput = () => null,
    onSelect = () => null,
    onMax = () => null,
    onSwap = () => {},
    selectedData,
}) => {
    const syron = useStore($syron)
    const btc_wallet = useStore($btc_wallet)
    const xr = useStore($xr)

    const addr_name = token?.symbol.toLowerCase()
    let balance = _0
    let bal = _0
    let val = _0
    let worth_ = _0

    if (addr_name == 'btc') {
        const dec = 1e8
        val = value_.div(dec)

        if (btc_wallet?.btc_balance) balance = btc_wallet.btc_balance
        bal = balance.div(dec)

        if (xr != null) worth_ = bal.mul(xr.rate)
    }
    // else {
    //     const _currency = tyron.Currency.default.tyron(addr_name)
    //     // bal = balance.div(Big(_currency.decimals))
    // }

    const [selectedPercent, setSelectedPercent] = useState(0)

    const handlePercent = useCallback(
        async (n: number) => {
            if (balance) {
                setSelectedPercent(n)
                const percent = Big(n)

                let input = balance.mul(percent).div(100)

                //@review (dec)
                // const decimals = token.decimals)
                onMax(input)
            }
        },
        [syron, token, onMax]
    )

    const handleOnInput = useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            const target = event.target as HTMLInputElement
            try {
                if (target.value) {
                    const input = Big(target.value).mul(1e8)
                    onInput(input)
                } else {
                    onInput(Big(0))
                }
            } catch (err) {
                console.error('HandleOnInput', err)
            }
        },
        [onInput]
    )

    return (
        <label>
            <div className={classNames(styles.container)}>
                <div className={styles.formWrapper}>
                    <div className={styles.inputTitle}>You&apos;ll win</div>
                    <div className={styles.inputWrapper}>
                        <Image
                            src={icoArrow}
                            alt="arrow-icon"
                            className={styles.img}
                        />
                        <div className={styles.inputContainer}>
                            {/* @dev Input Box */}
                            <div className={styles.flexContainer}>
                                <div className={styles.wrapperDisabled}>
                                    {token && (
                                        <Image
                                            className={styles.tokenImage}
                                            src={icoBTC}
                                            alt="tokens-logo"
                                        />
                                    )}
                                    <input
                                        className={styles.inputAmt}
                                        value={
                                            selectedData ? selectedData?.btc : 0
                                        }
                                        disabled={true}
                                    />
                                </div>
                                <div className={styles.tokenInfo}>| BTC</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.inputTitle}>You&apos;ll pay</div>
                    <div className={styles.inputWrapper}>
                        <Image
                            src={icoArrow}
                            alt="arrow-icon"
                            className={styles.img}
                        />
                        <div className={styles.inputContainer}>
                            {/* @dev Input Box */}
                            <div className={styles.flexContainer}>
                                <div className={styles.wrapperDisabled}>
                                    <input
                                        className={styles.inputAmtSusd}
                                        value={
                                            selectedData
                                                ? selectedData?.susd
                                                : 0
                                        }
                                        disabled={true}
                                    />
                                    {token && (
                                        <Image
                                            className={styles.tokenImage}
                                            src={icoSU$D}
                                            alt="tokens-logo"
                                        />
                                    )}
                                </div>
                                <div className={styles.tokenInfo}>| SUSD</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </label>
    )
}
