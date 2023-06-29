/*
ZilPay.io
Copyright (c) 2023 by Rinat <https://github.com/hicaru>
All rights reserved.
You acknowledge and agree that ZilPay owns all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this file (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this software.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of ZilPay; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by ZilPay in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of ZilPay or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*/

import styles from './index.module.scss'
import React, { useState } from 'react'
import Big from 'big.js'
import Image from 'next/image'
import { getIconURL } from '../../../src/lib/viewblock'
import classNames from 'classnames'
import { DEFAULT_CURRENCY, ZERO_ADDR } from '../../../src/config/const'
import { DragonDex } from '../../../src/mixins/dex'
import { formatNumber } from '../../../src/filters/n-format'
import { useStore } from 'react-stores'
import { $settings } from '../../../src/store/settings'
import { $tokens } from '../../../src/store/tokens'
import { DEFAUL_GAS } from '../../../src/mixins/zilpay-base'
import { TokenState } from '../../../src/types/token'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import SwapIcon from '../../icons/swap'

Big.PE = 999

type Prop = {
    token: TokenState
    value: Big
    balance?: string
    disabled?: boolean
    noSwap?: boolean
    gasLimit?: Big
    onInput?: (value: Big) => void
    onSelect?: () => void
    onMax?: (b: Big) => void
    onSwap?: () => void
}

const list = [25, 50, 75, 100]
const dex = new DragonDex()
export const FormInput: React.FC<Prop> = ({
    value,
    token,
    balance = BigInt(0),
    disabled = false,
    noSwap = false,
    gasLimit = Big(0),
    onInput = () => null,
    onSelect = () => null,
    onMax = () => null,
    onSwap = () => {},
}) => {
    const settings = useStore($settings)
    const tokensStore = useStore($tokens)

    const [selectedPercent, setSelectedPercent] = useState(0)

    const converted = React.useMemo(() => {
        const rate = Big(settings.rate)

        if (token.base16 === ZERO_ADDR) {
            return formatNumber(String(value.mul(rate)), DEFAULT_CURRENCY)
        }

        const zils = dex.tokensToZil(value, token)
        return formatNumber(String(zils.mul(rate)), DEFAULT_CURRENCY)
    }, [settings, value, tokensStore, token])

    const handlePercent = React.useCallback(
        (n: number) => {
            setSelectedPercent(n)
            // const percent = BigInt(n)
            // let value = (BigInt(balance) * percent) / BigInt(100)

            // if (token.base16 === ZERO_ADDR) {
            //     const gasPrice = Big(DEFAUL_GAS.gasPrice)
            //     const li = gasLimit.mul(gasPrice)
            //     const fee = BigInt(
            //         li.mul(dex.toDecimails(6)).round().toString()
            //     )

            //     if (fee > value) {
            //         value = BigInt(0)
            //     } else {
            //         value -= fee
            //     }
            // }

            // const decimals = dex.toDecimails(token.decimals)

            // onMax(Big(String(value)).div(decimals))
        },
        [balance, token, onMax, gasLimit]
    )

    const handleOnInput = React.useCallback(
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
                    <div className={styles.worthTxt}>Worth: {converted}</div>
                    <div className={styles.balanceTxt}>
                        &nbsp;| Balance: 0 ZIL
                    </div>
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
                            {!noSwap && (
                                <div className={styles.btnSwapWrapper}>
                                    <div className={styles.btnSwap}>
                                        <SwapIcon onClick={onSwap} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </label>
    )
}
