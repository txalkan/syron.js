import * as tyron from 'tyron'
import styles from './index.module.scss'
import { useCallback, useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import SwapIcon from '../../icons/swap'
import icoSU$D from '../../../src/assets/icons/ssi_SU$D_iso.svg'
import icoORDI from '../../../src/assets/icons/brc-20-ORDI.png'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import { CryptoState } from '../../../src/types/vault'
import { useStore } from 'react-stores'
import { $syron } from '../../../src/store/syron'
import Big from 'big.js'
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
}

const list = [25, 50, 75, 100]

export const VaultInput: React.FC<Prop> = ({
    value,
    token,
    disabled = false,
    noSwap = false,
    onInput = () => null,
    onSelect = () => null,
    onMax = () => null,
    onSwap = () => {},
}) => {
    const syron = useStore($syron)
    const addr_name = token?.symbol.toLowerCase()
    let balance = _0
    let bal = _0
    if (addr_name == 'btc') {
        if (syron?.ssi_balance) balance = syron.ssi_balance
        bal = balance!.div(Big(100000000))!
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

                let _value = balance.mul(percent).div(Big(100))

                //@review: decimals
                // const decimals = token.decimals)
                onMax(_value.div(Big(1e8)))
            }
        },
        [syron, token, onMax]
    )

    const handleOnInput = useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            const target = event.target as HTMLInputElement
            try {
                if (target.value) {
                    onInput(Big(target.value))
                } else {
                    onInput(Big(0))
                }
            } catch {
                ////
            }
        },
        [onInput]
    )
    return (
        <label>
            <div className={classNames(styles.container)}>
                <div className={styles.formTxtInfoWrapper}>
                    <div className={styles.balanceTxt}>
                        &nbsp;| Balance:{' '}
                        {isNaN(Number(bal))
                            ? 'Connect Wallet'
                            : `${Number(bal)} ${token?.symbol}`}
                    </div>
                </div>
                <div>
                    {disabled ? null : (
                        <div className={styles.percentWrapper}>
                            <div className={styles.row}>
                                {list.map((n) => (
                                    <div
                                        key={n}
                                        className={
                                            n === selectedPercent
                                                ? styles.percentActive
                                                : styles.percent
                                        }
                                        onClick={() => handlePercent(n)}
                                    >
                                        <div
                                            className={
                                                n === selectedPercent
                                                    ? styles.percentTxtActive
                                                    : styles.percentTxt
                                            }
                                        >
                                            {n}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.wrapper}>
                    <div className={styles.container2}>
                        <input
                            className={styles.inputAmount}
                            type="number"
                            placeholder="0"
                            onInput={handleOnInput}
                            value={Number(value)}
                            disabled={disabled}
                            step={0.00000001}
                        />
                    </div>
                    {token && (
                        <div
                            className={classNames(styles.dropdown)}
                            // onClick={onSelect}
                        >
                            <Image
                                src={token.symbol === 'BTC' ? icoBTC : icoSU$D}
                                alt="tokens-logo"
                                height="35"
                                width="35"
                            />
                            <div className={styles.symbol}>{token.symbol}</div>
                            {/* <div className={styles.arrowIco}>
                                <Image alt="arrow-ico" src={ArrowDownReg} />
                            </div> */}
                        </div>
                    )}
                </div>
                {/* @review (burn) */}
                {/* <div>
                    {disabled ? null : (
                        <div className={styles.btnSwapWrapper}>
                            {!noSwap && (
                                <div className={styles.btnSwap}>
                                    <SwapIcon onClick={onSwap} />
                                </div>
                            )}
                        </div>
                    )}
                </div> */}
            </div>
        </label>
    )
}
