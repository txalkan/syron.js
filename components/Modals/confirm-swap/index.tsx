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
import classNames from 'classnames'
import { useStore } from 'react-stores'
import toformat from 'toformat'
import React from 'react'
import { useTranslation } from 'next-i18next'

import { Modal, ModalHeader } from '../../modal'
import { FormInput } from '../../swap-form'

import { DragonDex, SwapDirection } from '../../../src//mixins/dex'

import { TokensMixine } from '../../../src//mixins/token'
import { DEFAULT_CURRENCY, ZERO_ADDR } from '../../../src/config/const'
import { $settings } from '../../../src//store/settings'
import { DEFAUL_GAS } from '../../../src//mixins/zilpay-base'
import { PriceInfo } from '../../price-info'
import { formatNumber } from '../../../src//filters/n-format'
import { SwapPair } from '../../../src/types/swap'
import ThreeDots from '../../Spinner/ThreeDots'
import { $liquidity } from '../../../src/store/shares'
import { $tokens } from '../../../src/store/tokens'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
// @rinat import { ThreeDots } from "react-loader-spinner";

const Big = toformat(_Big)
Big.PE = 999

type Prop = {
    show: boolean
    pair: SwapPair[]
    direction: SwapDirection
    gasLimit: _Big
    onClose: () => void
    selectedDex: String
}

const tokensMixin = new TokensMixine()
const dex = new DragonDex()
export var ConfirmSwapModal: React.FC<Prop> = function ({
    show,
    pair,
    direction,
    gasLimit,
    onClose,
    selectedDex,
}) {
    const common = useTranslation(`common`)
    const swap = useTranslation(`swap`)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const wallet = loginInfo.zilAddr
    const settings = useStore($settings)
    const liquidity = useStore($liquidity)

    const [loading, setLoading] = React.useState(true)
    const [isAllow, setIsAllow] = React.useState(false)
    const [priceRevert, setPriceRevert] = React.useState(true)

    const exact = React.useMemo(
        () =>
            BigInt(
                Big(pair[0].value).mul(
                    dex.toDecimails(pair[0].meta.decimals).round()
                )
            ),
        [pair]
    )
    const limit = React.useMemo(
        () =>
            BigInt(
                Big(pair[1].value).mul(
                    dex.toDecimails(pair[1].meta.decimals).round()
                )
            ),
        [pair]
    )

    const tokensPrices = React.useMemo(() => {
        if (priceRevert) {
            return [pair[0], pair[1]]
        } else {
            return [pair[1], pair[0]]
        }
    }, [priceRevert, pair])

    const gasFee = React.useMemo(() => {
        if (!show) {
            return Big(0)
        }

        const gasPrice = Big(DEFAUL_GAS.gasPrice)
        const li = gasLimit.mul(gasPrice)

        return li.div(dex.toDecimails(6))
    }, [direction, show, gasLimit])

    const expectedOutput = React.useMemo(() => {
        const [, limitToken] = pair
        const limit = Big(limitToken.value)
        return limit.round(12).toFormat()
    }, [pair])

    const priceImpact = React.useMemo(() => {
        const [exactToken, limitToken] = pair
        const expectInput = Big(exactToken.value)
        const limitInput = Big(limitToken.value)
        let price = Big(0)
        let x = String(0)
        let y = String(0)
        let zilReserve = Big(0)
        let tokensReserve = Big(0)

        try {
            switch (direction) {
                case SwapDirection.ZilToToken:
                    ;[x, y] = liquidity.pools[limitToken.meta.base16]
                    zilReserve = Big(String(x)).div(
                        dex.toDecimails(exactToken.meta.decimals)
                    )
                    tokensReserve = Big(String(y)).div(
                        dex.toDecimails(limitToken.meta.decimals)
                    )
                    price = zilReserve.div(tokensReserve)
                    return dex.calcPriceImpact(expectInput, limitInput, price)
                case SwapDirection.TokenToZil:
                    ;[x, y] = liquidity.pools[exactToken.meta.base16]
                    zilReserve = Big(String(x)).div(
                        dex.toDecimails(limitToken.meta.decimals)
                    )
                    tokensReserve = Big(String(y)).div(
                        dex.toDecimails(exactToken.meta.decimals)
                    )
                    price = tokensReserve.div(zilReserve)
                    return dex.calcPriceImpact(expectInput, limitInput, price)
                case SwapDirection.TokenToTokens:
                    const [zilliqa] = $tokens.state.tokens
                    const [inputZils, inputTokens] =
                        liquidity.pools[exactToken.meta.base16]
                    const [outpuZils, outputTokens] =
                        liquidity.pools[limitToken.meta.base16]

                    const bigInputZils = Big(String(inputZils)).div(
                        dex.toDecimails(zilliqa.meta.decimals)
                    )
                    const bigInputTokens = Big(String(inputTokens)).div(
                        dex.toDecimails(exactToken.meta.decimals)
                    )

                    const bigOutpuZils = Big(String(outpuZils)).div(
                        dex.toDecimails(zilliqa.meta.decimals)
                    )
                    const bigOutputTokens = Big(String(outputTokens)).div(
                        dex.toDecimails(limitToken.meta.decimals)
                    )

                    const inputRate = bigInputTokens.div(bigInputZils)
                    const outpuRate = bigOutputTokens.div(bigOutpuZils)
                    price = inputRate.div(outpuRate)

                    return dex.calcPriceImpact(expectInput, limitInput, price)
                default:
                    return 0
            }
        } catch (err) {
            // console.error(err);
            return 0
        }
    }, [direction, pair, liquidity])

    const expectedOutputAfterSleepage = React.useMemo(() => {
        const [, limitToken] = pair
        return Big(dex.sleepageCalc(String(limitToken.value)))
            .round(12)
            .toFormat()
    }, [pair])

    const disabled = React.useMemo(() => {
        return loading || priceImpact > 10
    }, [priceImpact, loading])

    const approveToken = React.useCallback(async () => {
        const [exactToken] = pair
        const owner = String(wallet?.base16).toLowerCase()
        const token = $tokens.state.tokens.find(
            (t) => t.meta.base16 === exactToken.meta.base16
        )
        const balance = token?.balance[owner] || '0'
        await tokensMixin.increaseAllowance(
            dex.contract,
            exactToken.meta.base16,
            balance
        )
    }, [wallet, pair])

    const hanldeUpdate = React.useCallback(async () => {
        const [exactToken] = pair
        if (exactToken.meta.base16 === ZERO_ADDR) {
            setIsAllow(true)
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const allowances = await tokensMixin.getAllowances(
                dex.contract,
                exactToken.meta.base16
            )
            setIsAllow(tokensMixin.isAllow(String(exact), String(allowances)))
        } catch (err) {
            console.error('hanldeUpdate', err)
        }
        setLoading(false)
    }, [pair, exact])

    const hanldeOnSwap = React.useCallback(async () => {
        setLoading(true)

        try {
            const zilpay = await tokensMixin.zilpay.zilpay()

            if (!wallet || !zilpay.wallet.isEnable) {
                await zilpay.wallet.connect()
            }

            switch (direction) {
                case SwapDirection.ZilToToken:
                    await dex.swapExactZILForTokens(exact, limit, pair[1].meta)
                    setLoading(false)
                    onClose()
                    return
                case SwapDirection.TokenToZil:
                    if (!isAllow) {
                        await approveToken()
                        setLoading(false)
                        setIsAllow(true)
                        return
                    }
                    await dex.swapExactTokensForZIL(exact, limit, pair[0].meta)
                    setLoading(false)
                    onClose()
                    return
                case SwapDirection.TokenToTokens:
                    if (!isAllow) {
                        await approveToken()
                        setLoading(false)
                        setIsAllow(true)
                        return
                    }
                    await dex.swapExactTokensForTokens(
                        exact,
                        limit,
                        pair[0].meta,
                        pair[1].meta
                    )
                    setLoading(false)
                    onClose()
                    return
            }
        } catch (err) {
            console.error(err)
        }

        setLoading(false)
    }, [pair, isAllow, exact, limit, direction, wallet, onClose, approveToken])

    React.useEffect(() => {
        hanldeUpdate()
    }, [])

    return (
        <div className={styles.container}>
            {/* <FormInput
                value={Big(pair[0].value)}
                token={pair[0].meta}
                disabled
            />
            <br />
            <FormInput
                value={Big(pair[1].value)}
                token={pair[1].meta}
                disabled
            /> */}
            {/* <PriceInfo
                tokens={tokensPrices}
                onClick={() => setPriceRevert(!priceRevert)}
            /> */}
            <div className={styles.info}>
                <div className={styles.column}>
                    <div className={styles.row}>
                        <div className={styles.txtRow}>Expected Output</div>
                        <div className={styles.txtRow}>
                            {expectedOutput} {pair[1].meta.symbol}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.txtRow}>Price Impact</div>
                        <div className={styles.txtRow}>
                            {String(priceImpact)}%
                        </div>
                    </div>
                </div>
                <div className={classNames(styles.column, 'muted')}>
                    <div className={styles.row}>
                        <div className={styles.txtRow}>
                            Min received after slippage ({settings.slippage}%)
                        </div>
                        <div className={styles.txtRow}>
                            {expectedOutputAfterSleepage} {pair[1].meta.symbol}
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.txtRow}>Network Fee</div>
                        <div className={styles.txtRow}>
                            {String(gasFee)}ZIL (
                            {formatNumber(
                                Number(gasFee) * settings.rate,
                                DEFAULT_CURRENCY
                            )}
                            )
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.btnWrapper}>
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '1rem',
                    }}
                    className={`button ${disabled ? 'disabled' : 'primary'}`}
                    onClick={hanldeOnSwap}
                    // disabled={disabled}
                >
                    {loading ? (
                        <ThreeDots color="yellow" />
                    ) : (
                        // <ThreeDots
                        //   color="var(--button-color)"
                        //   height={25}
                        //   width={50}
                        // />
                        <>{isAllow ? 'CONFIRM SWAP' : 'APPROVE'}</>
                    )}
                </div>
            </div>
            <div onClick={onClose} className={styles.cancel}>
                Cancel
            </div>
        </div>
    )
}
