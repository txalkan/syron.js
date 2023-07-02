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

import _Big from 'big.js'
import { useStore } from 'react-stores'
import React from 'react'
import toformat from 'toformat'

import { DragonDex } from '../../src/mixins/dex'
import { DEFAULT_CURRENCY, ZERO_ADDR } from '../../src/config/const'
import { $tokens } from '../../src/store/tokens'
import { $liquidity } from '../../src/store/shares'
import { SwapPair } from '../../src/types/swap'
import { $settings } from '../../src/store/settings'
import { formatNumber } from '../../src/filters/n-format'
import Arrow from '../Arrow'

const Big = toformat(_Big)

Big.PE = 999

type Prop = {
    tokens: SwapPair[]
    onClick?: () => void
    onShow?: () => void
}

const dex = new DragonDex()
export var PriceInfo: React.FC<Prop> = function ({
    tokens,
    onShow,
    onClick = () => null,
}) {
    const tokensStore = useStore($tokens)
    const settingsStore = useStore($settings)
    const liquidity = useStore($liquidity)

    const price = React.useMemo(() => {
        const [x, y] = tokens
        const one = Big(1)
        let price = Big(0)

        if (Number(x.value) > 0 && Number(y.value) > 0) {
            return Big(y.value).div(x.value)
        }

        try {
            if (x.meta.base16 === ZERO_ADDR && y.meta.base16 !== ZERO_ADDR) {
                const [bigZil, bigTokens] = liquidity.pools[y.meta.base16]
                const zilReserve = Big(String(bigZil)).div(
                    dex.toDecimals(x.meta.decimals)
                )
                const tokensReserve = Big(String(bigTokens)).div(
                    dex.toDecimals(y.meta.decimals)
                )

                price = tokensReserve.div(zilReserve)
            } else if (
                y.meta.base16 === ZERO_ADDR &&
                x.meta.base16 !== ZERO_ADDR
            ) {
                const [bigZil, bigTokens] = liquidity.pools[x.meta.base16]
                const zilReserve = Big(String(bigZil)).div(
                    dex.toDecimals(y.meta.decimals)
                )
                const tokensReserve = Big(String(bigTokens)).div(
                    dex.toDecimals(x.meta.decimals)
                )

                price = zilReserve.div(tokensReserve)
            } else {
                const [zilliqa] = tokensStore.tokens
                const [inputZils, inputTokens] = liquidity.pools[x.meta.base16]
                const [outpuZils, outputTokens] = liquidity.pools[y.meta.base16]

                const bigInputZils = Big(String(inputZils)).div(
                    dex.toDecimals(zilliqa.meta.decimals)
                )
                const bigInputTokens = Big(String(inputTokens)).div(
                    dex.toDecimals(x.meta.decimals)
                )

                const bigOutpuZils = Big(String(outpuZils)).div(
                    dex.toDecimals(zilliqa.meta.decimals)
                )
                const bigOutputTokens = Big(String(outputTokens)).div(
                    dex.toDecimals(y.meta.decimals)
                )

                const inputRate = bigInputTokens.div(bigInputZils)
                const outpuRate = bigOutputTokens.div(bigOutpuZils)
                const value = one.mul(outpuRate).div(inputRate)

                price = value.div(one)
            }
        } catch {
            ///
        }

        return price
    }, [tokens, tokensStore, liquidity])

    const converted = React.useMemo(() => {
        const [x] = tokens
        const { rate } = settingsStore

        if (x.meta.base16 === ZERO_ADDR) {
            return formatNumber(rate, DEFAULT_CURRENCY)
        }

        return formatNumber(Number(price) * rate, DEFAULT_CURRENCY)
    }, [tokens, settingsStore, price])

    return (
        <div className={styles.container}>
            <p onClick={onClick}>
                1 {tokens[0].meta.symbol} = {price.round(4).toFormat()}{' '}
                {tokens[1].meta.symbol} <span>{/* ({converted}) */}</span>
            </p>
            {/* {onShow ? (
        <span onClick={onShow}>
          <Arrow />
        </span>
      ) : null} */}
        </div>
    )
}
