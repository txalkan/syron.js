import * as tyron from 'tyron'
import styles from './index.module.scss'
import { useCallback, useState } from 'react'
import Big from 'big.js'
import Image from 'next/image'
import classNames from 'classnames'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import SwapIcon from '../../icons/swap'
import icoSU$D from '../../../src/assets/icons/ssi_SU$D_iso.svg'
import icoORDI from '../../../src/assets/icons/brc-20-ORDI.png'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import { CryptoState } from '../../../src/types/vault'
import { SSIVault } from '../../../src/mixins/vault'

Big.PE = 999

type Prop = {
    token: CryptoState
    value: Big
    balance: string
    disabled?: boolean
    noSwap?: boolean
    onInput?: (value: Big) => void
    onSelect?: () => void
    onMax?: (b: Big) => void
    onSwap?: () => void
}

const vault = new SSIVault()
const list = [25, 50, 75, 100]

export const VaultInput: React.FC<Prop> = ({
    value,
    token,
    balance,
    disabled = false,
    noSwap = false,
    onInput = () => null,
    onSelect = () => null,
    onMax = () => null,
    onSwap = () => {},
}) => {
    const addr_name = token?.symbol.toLowerCase()
    let balance_ = '0'
    if (addr_name && balance) {
        const _currency = tyron.Currency.default.tyron(addr_name)
        balance_ = (Number(balance) / _currency.decimals).toFixed(2)
    }
    const [selectedPercent, setSelectedPercent] = useState(0)

    const handlePercent = useCallback(
        async (n: number) => {
            if (balance) {
                setSelectedPercent(n)
                const percent = BigInt(n)

                let _value = (BigInt(balance) * percent) / BigInt(100)

                //@review: gas paid by zlp wallet
                // if (token.base16 === ZERO_ADDR) {
                //     const gasPrice = Big(DEFAULT_GAS.gasPrice)
                //     const li = gasLimit.mul(gasPrice)
                //     const fee = BigInt(
                //         li.mul(dex.toDecimals(6)).round(2).toString()
                //     )
                //     if (fee > value) {
                //         value = BigInt(0)
                //     } else {
                //         value -= fee
                //     }
                // }

                const decimals = vault.toDecimals(token.decimals)
                onMax(Big(String(_value)).div(decimals)) //@review: decimals
            }
        },
        [balance, token, onMax]
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
                        &nbsp;| Balance: {balance_} {token?.symbol}
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
                            type="text"
                            placeholder="0"
                            onInput={handleOnInput}
                            value={String(value)}
                            disabled={disabled}
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
                <div>
                    {disabled ? null : (
                        <div className={styles.btnSwapWrapper}>
                            {!noSwap && (
                                <div className={styles.btnSwap}>
                                    <SwapIcon onClick={onSwap} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </label>
    )
}
