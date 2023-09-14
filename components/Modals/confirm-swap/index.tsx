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
// import { useTranslation } from 'next-i18next'
// import { Modal, ModalHeader } from '../../modal'
// import { FormInput } from '../../swap-form'
import { DragonDex, SwapDirection } from '../../../src//mixins/dex'
import { TokensMixine } from '../../../src//mixins/token'
import { DEFAULT_CURRENCY, ZERO_ADDR } from '../../../src/config/const'
import { $settings } from '../../../src//store/settings'
import { DEFAULT_GAS } from '../../../src//mixins/zilpay-base'
import { PriceInfo } from '../../price-info'
import { formatNumber } from '../../../src//filters/n-format'
import { SwapPair } from '../../../src/types/swap'
import ThreeDots from '../../Spinner/ThreeDots'
import {
    $aswap_liquidity,
    $liquidity,
    $tyron_liquidity,
    $zilswap_liquidity,
} from '../../../src/store/shares'
import { $tokens } from '../../../src/store/tokens'
import { $wallet } from '../../../src/store/wallet'
// import { ThreeDots } from "react-loader-spinner";
//@ssibrowser
import { useStore as effectorStore } from 'effector-react'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { $doc } from '../../../src/store/did-doc'
import fetch from '../../../src/hooks/fetch'
import { toast } from 'react-toastify'
import iconTYRON from '../../../src/assets/icons/ssi_token_Tyron.svg'
import iconS$I from '../../../src/assets/icons/SSI_dollar.svg'
import Image from 'next/image'
import { getIconURL } from '../../../src/lib/viewblock'

const Big = toformat(_Big)
Big.PE = 999

type Prop = {
    show: boolean
    pair: SwapPair[]
    direction: SwapDirection
    gasLimit: _Big
    onClose: () => void
    //@ssibrowser
    selectedDex: string
    isDEFIx: boolean
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
    isDEFIx,
}) {
    //@ssibrowser
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const resolvedTLD =
        resolvedInfo?.user_tld! && resolvedInfo.user_tld
            ? resolvedInfo.user_tld
            : ''

    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const controller_ = effectorStore($doc)?.controller!.toLowerCase()

    const { fetchDoc } = fetch()
    React.useEffect(() => {
        fetchDoc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDomain, resolvedSubdomain, resolvedTLD])
    const liquidity_ = useStore($liquidity)
    const liquidity_tydradex = useStore($tyron_liquidity)
    const liquidity_zilswap = useStore($zilswap_liquidity)
    const liquidity_aswap = useStore($aswap_liquidity)

    //@zilpay
    const wallet = useStore($wallet)
    // const common = useTranslation(`common`)
    // const swap = useTranslation(`swap`)
    const settings = useStore($settings)
    // const liquidity = useStore($liquidity)

    const [loading, setLoading] = React.useState(true)
    // const [isAllow, setIsAllow] = React.useState(false)
    // const [priceRevert, setPriceRevert] = React.useState(true)

    const exact = React.useMemo(
        () =>
            BigInt(
                Big(pair[0].value).mul(
                    dex.toDecimals(pair[0].meta.decimals).round()
                )
            ),
        [pair]
    )
    const limit = React.useMemo(
        () =>
            BigInt(
                Big(pair[1].value).mul(
                    dex.toDecimals(pair[1].meta.decimals).round()
                )
            ),
        [pair]
    )

    //@review
    // const tokensPrices = React.useMemo(() => {
    //     if (priceRevert) {
    //         return [pair[0], pair[1]]
    //     } else {
    //         return [pair[1], pair[0]]
    //     }
    // }, [priceRevert, pair])

    // const gasFee = React.useMemo(() => {
    //     if (!show) {
    //         return Big(0)
    //     }

    //     const gasPrice = Big(DEFAULT_GAS.gasPrice)
    //     const li = gasLimit.mul(gasPrice)

    //     return li.div(dex.toDecimals(4))
    // }, [direction, show, gasLimit])

    const expectedOutput = React.useMemo(() => {
        const [, limitToken] = pair
        const limit = Big(limitToken.value)
        return limit.round(12).toFormat()
    }, [pair])

    const priceInfo = React.useMemo(() => {
        //const priceImpact = React.useMemo(() => {
        const [exactToken, limitToken] = pair
        const exactInput = Big(exactToken.value)
        const limitInput = Big(limitToken.value)
        let price = Big(0)
        let x = String(0)
        let y = String(0)
        let baseReserve = Big(0)
        let tokensReserve = Big(0)

        //@ssibrowser
        let liquidity
        switch (selectedDex) {
            case 'dragondex':
                liquidity = liquidity_
                break
            case 'tydradex':
                liquidity = liquidity_tydradex
                break
            case 'zilswap':
                liquidity = liquidity_zilswap
                break
            case 'aswap':
                liquidity = liquidity_aswap
                break
        }
        console.log('SELECTED_DEX_LIQUIDITY', selectedDex, liquidity)
        //@zilpay
        try {
            console.log('SwapDirection:', direction)

            switch (direction) {
                case SwapDirection.ZilToToken:
                    ;[x, y] = liquidity.pools[limitToken.meta.base16]
                    baseReserve = Big(String(x)).div(
                        dex.toDecimals(exactToken.meta.decimals)
                    )
                    tokensReserve = Big(String(y)).div(
                        dex.toDecimals(limitToken.meta.decimals)
                    )
                    price = baseReserve.div(tokensReserve)
                    console.log('CURRENT_PRICE', String(price))
                    return {
                        impact: dex.calcPriceImpact(
                            exactInput,
                            limitInput,
                            price
                        ),
                        input: baseReserve.round(2),
                        output: tokensReserve.round(2),
                    }
                case SwapDirection.TokenToZil:
                    ;[x, y] = liquidity.pools[exactToken.meta.base16]
                    baseReserve = Big(String(x)).div(
                        dex.toDecimals(limitToken.meta.decimals)
                    )
                    tokensReserve = Big(String(y)).div(
                        dex.toDecimals(exactToken.meta.decimals)
                    )
                    price = tokensReserve.div(baseReserve)
                    //return dex.calcPriceImpact(exactInput, limitInput, price)
                    return {
                        impact: dex.calcPriceImpact(
                            exactInput,
                            limitInput,
                            price
                        ),
                        input: tokensReserve.round(2),
                        output: baseReserve.round(2),
                    }
                case SwapDirection.TokenToTokens:
                    const [zilliqa] = $tokens.state.tokens
                    const [inputZils, inputTokens] =
                        liquidity.pools[exactToken.meta.base16]
                    const [outpuZils, outputTokens] =
                        liquidity.pools[limitToken.meta.base16]

                    const bigInputZils = Big(String(inputZils)).div(
                        dex.toDecimals(zilliqa.meta.decimals)
                    )
                    const bigInputTokens = Big(String(inputTokens)).div(
                        dex.toDecimals(exactToken.meta.decimals)
                    )

                    const bigOutpuZils = Big(String(outpuZils)).div(
                        dex.toDecimals(zilliqa.meta.decimals)
                    )
                    const bigOutputTokens = Big(String(outputTokens)).div(
                        dex.toDecimals(limitToken.meta.decimals)
                    )

                    const inputRate = bigInputTokens.div(bigInputZils)
                    const outpuRate = bigOutputTokens.div(bigOutpuZils)
                    price = inputRate.div(outpuRate)

                    //return dex.calcPriceImpact(exactInput, limitInput, price)
                    return {
                        impact: dex.calcPriceImpact(
                            exactInput,
                            limitInput,
                            price
                        ),
                        input: 'coming soon',
                        output: 'coming soon',
                    }
                case SwapDirection.DEFIxTokensForTokens:
                    ;[x, y] = liquidity.reserves['tyron_s$i']
                    baseReserve = Big(String(x)).div(dex.toDecimals(18))
                    tokensReserve = Big(String(y)).div(dex.toDecimals(12))
                    return {
                        impact: dex.calculatePriceImpact(
                            exactToken,
                            baseReserve,
                            tokensReserve,
                            exactInput,
                            limitInput
                        ),
                        input: baseReserve.round(2),
                        output: tokensReserve.round(2),
                    }

                default:
                    //return 0
                    return {
                        impact: 0,
                        input: '0',
                        output: '0',
                    }
            }
        } catch (err) {
            console.error(err)
            //return 0
            return {
                impact: 0,
                input: '0',
                output: '0',
            }
        }
    }, [
        direction,
        pair,
        selectedDex,
        liquidity_,
        liquidity_zilswap,
        liquidity_aswap,
    ])

    const expectedOutputAfterSleepage = React.useMemo(() => {
        const [, limitToken] = pair
        return Big(dex.sleepageCalc(String(limitToken.value)))
            .round(4)
            .toFormat()
    }, [pair, settings])

    const disabled = React.useMemo(() => {
        return loading || Big(priceInfo.impact) > 10
    }, [priceInfo, loading])

    // const approveToken = React.useCallback(async () => {
    //     const [exactToken] = pair
    //     const owner = String(wallet?.base16).toLowerCase()
    //     const token = $tokens.state.tokens.find(
    //         (t) => t.meta.base16 === exactToken.meta.base16
    //     )
    //     const balance = token?.balance[owner] || '0'
    //     await tokensMixin.increaseAllowance(
    //         dex.contract,
    //         exactToken.meta.base16,
    //         balance
    //     )
    // }, [wallet, pair])

    //@review: asap dex
    const hanldeUpdate = React.useCallback(async () => {
        const [exactToken] = pair
        if (exactToken.meta.base16 === ZERO_ADDR) {
            // setIsAllow(true)
            setLoading(false)
            return
        }

        setLoading(true)
        // try {
        //     const allowances = await tokensMixin.getAllowances(
        //         dex.contract,
        //         exactToken.meta.base16
        //     )
        //     // setIsAllow(tokensMixin.isAllow(String(exact), String(allowances)))
        // } catch (err) {
        //     console.error('hanldeUpdate', err)
        // }
        setLoading(false)
    }, [pair, exact])

    //@mainnet-dex
    //@ssibrowser
    const lazyRoot = React.useRef(null)

    const hanldeOnSwap = React.useCallback(async () => {
        setLoading(true)
        try {
            const zilpay = await tokensMixin.zilpay.zilpay()

            if (!wallet || !zilpay.wallet.isEnable) {
                await zilpay.wallet.connect()
            }
            switch (direction) {
                case SwapDirection.ZilToToken:
                    // if (controller_ === zilpay_addr) {
                    await dex.swapExactZILForTokens(
                        selectedDex,
                        exact,
                        limit,
                        pair[1].meta,
                        resolvedDomain,
                        zilpay_addr,
                        isDEFIx
                    )
                    setLoading(false)
                    onClose()
                    return
                // } else {
                //     toast('Use your own defi@account.ssi', {
                //         position: 'bottom-center',
                //         autoClose: 2222,
                //         hideProgressBar: false,
                //         closeOnClick: true,
                //         pauseOnHover: true,
                //         draggable: true,
                //         progress: undefined,
                //         toastId: 1,
                //     })
                //     setLoading(false)
                //     return
                // }
                case SwapDirection.TokenToZil:
                    // toast('Coming soon', {
                    //     position: 'bottom-center',
                    //     autoClose: 2222,
                    //     hideProgressBar: false,
                    //     closeOnClick: true,
                    //     pauseOnHover: true,
                    //     draggable: true,
                    //     progress: undefined,
                    //     toastId: 2,
                    // })
                    // setLoading(false)
                    // return
                    // if (!isAllow) {
                    //     await approveToken()
                    //     setLoading(false)
                    //     setIsAllow(true)
                    //     return
                    // }
                    if (controller_ === zilpay_addr) {
                        await dex.swapExactTokensForZIL(
                            selectedDex,
                            exact,
                            limit,
                            pair[0].meta
                        )
                        setLoading(false)
                        onClose()
                        return
                    } else {
                        toast('Use your own defi@account.ssi', {
                            position: 'bottom-center',
                            autoClose: 2222,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            toastId: 4,
                        })
                        setLoading(false)
                        return
                    }
                case SwapDirection.TokenToTokens:
                    toast('Coming soon', {
                        position: 'bottom-center',
                        autoClose: 2222,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        toastId: 3,
                    })
                    setLoading(false)
                    return
                //     // if (!isAllow) {
                //     //     await approveToken()
                //     //     setLoading(false)
                //     //     setIsAllow(true)
                //     //     return
                //     // }
                //     await dex.swapExactTokensForTokens(
                //         exact,
                //         limit,
                //         pair[0].meta,
                //         pair[1].meta
                //     )
                //     setLoading(false)
                //     onClose()
                //     return
                //@ssibrowser ---
                case SwapDirection.DEFIxTokensForTokens:
                    if (controller_ === zilpay_addr) {
                        await dex.swapDEFIxTokensForTokens(
                            exact,
                            limit,
                            pair[0].meta,
                            pair[1].meta
                        )
                        setLoading(false)
                        onClose()
                        return
                    } else {
                        toast('Use your own defi@account.ssi', {
                            position: 'bottom-center',
                            autoClose: 2222,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            toastId: 4,
                            theme: 'dark',
                        })
                        setLoading(false)
                        return
                    }
                case SwapDirection.TydraDeFi:
                    if (controller_ === zilpay_addr) {
                        await dex.swapTydraDeFi(limit)
                        setLoading(false)
                        onClose()
                        return
                    } else {
                        toast('Use your own defi@account.ssi', {
                            position: 'bottom-center',
                            autoClose: 2222,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            toastId: 5,
                        })
                        setLoading(false)
                        return
                    }
                case SwapDirection.TydraDEX:
                    if (pair[0].meta.symbol === 'ZIL') {
                        toast('Incoming! Currently not available.', {
                            position: 'bottom-center',
                            autoClose: 2222,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            toastId: 6,
                        })
                    } else {
                        if (
                            pair[0].meta.symbol === 'ZIL' &&
                            (resolvedDomain === 'tydradex' ||
                                resolvedDomain === 'tyrondex')
                        ) {
                            await dex.swapTydraDEX(
                                exact,
                                limit,
                                pair[0].meta,
                                pair[1].meta,
                                resolvedDomain,
                                zilpay_addr
                            )
                            setLoading(false)
                            onClose()
                            return
                        } else if (controller_ === zilpay_addr) {
                            await dex.swapTydraDEX(
                                exact,
                                limit,
                                pair[0].meta,
                                pair[1].meta,
                                resolvedDomain,
                                zilpay_addr
                            )
                            setLoading(false)
                            onClose()
                            return
                        } else {
                            toast('Use your own defi@account.ssi', {
                                position: 'bottom-center',
                                autoClose: 2222,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                toastId: 6,
                            })
                            setLoading(false)
                            return
                        }
                    }
            }
        } catch (err) {
            console.error(err)
        }

        setLoading(false)
    }, [
        pair,
        /*isAllow,*/ exact,
        limit,
        direction,
        wallet,
        onClose,
        /*approveToken,*/
    ])

    React.useEffect(() => {
        hanldeUpdate()
    }, [])

    return (
        <>
            {String(expectedOutput) !== '0' && (
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
                                <div className={styles.txtRow}>DEX</div>
                                <div className={styles.txtRow2}>
                                    {selectedDex === 'tydradex'
                                        ? 'TyronDEX'
                                        : selectedDex}
                                </div>
                            </div>
                            {pair[0].meta.symbol !== 'XSGD' && (
                                <>
                                    <div className={styles.rowLiq}>
                                        <div className={styles.txtRow}>
                                            {pair[0].meta.symbol} LIQUIDITY
                                        </div>
                                        <div className={styles.txtRow2}>
                                            {Number(
                                                priceInfo.input
                                            ).toLocaleString()}{' '}
                                            {/* {pair[0].meta.symbol} */}
                                            <Image
                                                src={
                                                    pair[0].meta.symbol ===
                                                    'S$I'
                                                        ? iconS$I
                                                        : getIconURL(
                                                              pair[0].meta
                                                                  .bech32
                                                          )
                                                }
                                                alt={pair[0].meta.symbol}
                                                lazyRoot={lazyRoot}
                                                height="14"
                                                width="14"
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.rowLiq}>
                                        <div className={styles.txtRow}>
                                            {pair[1].meta.symbol} LIQUIDITY
                                        </div>
                                        <div className={styles.txtRow2}>
                                            {Number(
                                                priceInfo.output
                                            ).toLocaleString()}{' '}
                                            {/* {pair[1].meta.symbol} */}
                                            <Image
                                                src={
                                                    pair[1].meta.symbol ===
                                                    'S$I'
                                                        ? iconS$I
                                                        : getIconURL(
                                                              pair[1].meta
                                                                  .bech32
                                                          )
                                                }
                                                alt={pair[1].meta.symbol}
                                                lazyRoot={lazyRoot}
                                                height="14"
                                                width="14"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            <br />
                            <div className={styles.row}>
                                <div className={styles.txtRowEO}>
                                    EXPECTED OUTPUT
                                </div>
                                <div className={styles.txtRow2}>
                                    {expectedOutput}{' '}
                                    {/* {pair[1].meta.symbol} */}
                                    <Image
                                        src={
                                            pair[1].meta.symbol ===
                                            // 'TYRON'
                                            //     ? iconTYRON
                                            //     : pair[1].meta.symbol ===
                                            'S$I'
                                                ? iconS$I
                                                : getIconURL(
                                                      pair[1].meta.bech32
                                                  )
                                        }
                                        alt={pair[1].meta.symbol}
                                        lazyRoot={lazyRoot}
                                        height="14"
                                        width="14"
                                    />
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.txtRow}>
                                    PRICE IMPACT
                                </div>
                                <div className={styles.txtRow2}>
                                    {String(priceInfo.impact)}%
                                </div>
                            </div>
                        </div>
                        <div className={classNames(styles.column, 'muted')}>
                            <div className={styles.row}>
                                <div className={styles.txtRow}>SLIPPAGE</div>
                                <div className={styles.txtRow2}>
                                    -{settings.slippage}%
                                </div>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.txtRow}>
                                    MINIMUM OUTPUT
                                </div>
                                <div className={styles.txtRow2}>
                                    {expectedOutputAfterSleepage}{' '}
                                    {/* {pair[1].meta.symbol} */}
                                    <Image
                                        src={
                                            pair[1].meta.symbol === 'S$I'
                                                ? iconS$I
                                                : getIconURL(
                                                      pair[1].meta.bech32
                                                  )
                                        }
                                        alt={pair[1].meta.symbol}
                                        lazyRoot={lazyRoot}
                                        height="14"
                                        width="14"
                                    />
                                </div>
                            </div>
                            {/* @review: dex asap */}
                            {/* <div className={styles.row}>
                   <div className={styles.txtRow}>fee</div>
                   <div className={styles.txtRow}>
                       {String(gasFee)} ZIL ={' '}
                       {formatNumber(
                           Number(gasFee) * settings.rate,
                           DEFAULT_CURRENCY
                       )}
                   </div>
               </div> */}
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
                            className={`button ${
                                disabled ? 'disabled' : 'primary'
                            }`}
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
                                // <>{isAllow ? 'CONFIRM SWAP' : 'APPROVE'}</>
                                'trade'
                            )}
                        </div>
                    </div>
                    <div onClick={onClose} className={styles.cancel}>
                        Cancel
                    </div>
                </div>
            )}
        </>
    )
}
