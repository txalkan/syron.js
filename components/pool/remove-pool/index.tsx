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

import 'rc-slider/assets/index.css'
import styles from './index.module.scss'
//import type { Token } from '../../../src/types/token'
import React from 'react'
import { useStore } from 'react-stores'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

//import { $wallet } from '@/store/wallet';
import { $liquidity } from '../../../src/store/shares'
import { $tokens } from '../../../src/store/tokens'
import { DragonDex } from '../../../src/mixins/dex'
//import { ImagePair } from '../../pair-img'
//import { BackIcon } from '../../icons/back'
import Slider from 'rc-slider'
//import { nPool } from '../../../src/filters/n-pool'
//import { ThreeDots } from 'react-loader-spinner'
import { formatNumber } from '../../../src/filters/n-format'
import { TokensMixine } from '../../../src/mixins/token'
import { $wallet } from '../../../src/store/wallet'
import ThreeDots from '../../Spinner/ThreeDots'
import { toast } from 'react-toastify'
import Big from 'big.js'
Big.PE = 999

type Prop = {
    el: any
}

const tokensMixin = new TokensMixine()
const dex = new DragonDex()
export const RemovePoolForm: React.FC<Prop> = ({ el }) => {
    //const pool = useTranslation(`pool`)
    const wallet = useStore($wallet)
    const liquidity = useStore($liquidity)
    const tokensStore = useStore($tokens)

    const [loading, setLoading] = React.useState(false)

    // const [baseReserve, setBaseReserve] = React.useState(Big(0))
    // const [tokenReserve, setTokenReserve] = React.useState(Big(0))

    const [base_amt, setBaseAmt] = React.useState(Big(0))
    const [token_amt, setTokenAmt] = React.useState(Big(0))
    const [range, setRange] = React.useState(0)

    //@ssibrowser
    const [dao_amt, setDAOAmt] = React.useState(Big(0))
    const [rangeDAO, setRangeDAO] = React.useState(0)

    const [userContributions, setUserContributions] = React.useState(Big(0))

    const tokenAddress = React.useMemo(() => {
        return String(el.token.base16).toLowerCase()
    }, [el.token])
    const owner = React.useMemo(() => {
        return String(wallet).toLowerCase()
    }, [wallet])

    const handleSubmit = React.useCallback(async () => {
        setLoading(true)
        try {
            console.log('LP_values', el.base_lp, el.token_lp)
            console.log('dao_amt', Number(dao_amt))
            console.log('dao_bal', el.daobalance)
            const zilpay = await tokensMixin.zilpay.zilpay()

            if (!wallet || !zilpay.wallet.isEnable) {
                await zilpay.wallet.connect()
            }

            // const zilToken = tokensStore.tokens[0].meta

            //const minBaseAmt = base_amt
            //.mul(dex.toDecimals(el.base.decimals))
            //const minTokenAmt = token_amt
            //.mul(dex.toDecimals(el.token.decimals))

            // const res = await dex.removeLiquidity(
            //     minZIL,
            //     minZrc,
            //     userContributions,
            //     tokenAddress,
            //     owner
            // )

            if (Number(dao_amt) === 0) {
                const res = await dex.removeLiquiditySSI(
                    base_amt, //minBaseAmt,
                    token_amt, //minTokenAmt,
                    //userContributions,
                    el.token.symbol
                )
            } else {
                const res = await dex.LeaveCommunity(dao_amt)
            }
        } catch (err) {
            console.error('@remove-pool: ', err)
        }
        setLoading(false)
    }, [
        base_amt,
        token_amt,
        dao_amt,
        tokenAddress,
        userContributions,
        owner,
        el.token,
        tokensStore,
        wallet,
    ])

    const hanldeRange = React.useCallback(
        (range: number | number[]) => {
            try {
                // const _100 = BigInt(100)
                const percent = Number(range)
                //const zil = tokensStore.tokens[0].meta
                // const userContributions = BigInt(
                //     (liquidity.balances[owner] &&
                //         liquidity.balances[owner][tokenAddress]) ||
                //     0
                // )
                const base_amount = (Number(el.base_lp) * percent) / 100
                const token_amount = (Number(el.token_lp) * percent) / 100

                // const newUserContributions =
                // (userContributions * percent) / _100

                setBaseAmt(Big(base_amount))
                setTokenAmt(Big(token_amount))
                // setBaseAmt(
                //     Big(String(base_amount)).div(
                //         dex.toDecimals(el.base.decimals)
                //     )
                // )
                // setTokenAmt(
                //     Big(String(token_amount)).div(
                //         dex.toDecimals(el.token.decimals)
                //     )
                // )
                //setRange(Number(range))
                setRange(percent)

                setUserContributions(Big(String(base_amount)))
            } catch (error) {
                console.error(error)
            }
        },
        [
            el,
            //el.base_lp,
            //el.token_lp,
            tokensStore,
            owner,
            //token,
            liquidity,
            tokenAddress,
        ]
    )

    const hanldeRangeDAO = React.useCallback(
        (range: number | number[]) => {
            try {
                const percent = Number(range)
                const dao_amount = (Number(el.daobalance) * percent) / 100

                setDAOAmt(Big(dao_amount))
                setRangeDAO(percent)
            } catch (error) {
                console.error(error)
            }
        },
        [el, tokensStore, owner, liquidity, tokenAddress]
    )

    // React.useEffect(() => {
    //     try {
    //         const pool =
    //             liquidity.pools[String(el.token.base16).toLowerCase()]
    //         const [x, y] = nPool(pool, liquidity.shares[tokenAddress])

    //         const zilReserve = Big(x.toString())
    //         const tokenReserve = Big(y.toString())

    //         setBaseReserve(zilReserve)
    //         setTokenReserve(tokenReserve)
    //         setUserContributions(
    //             Big(liquidity.balances[owner][tokenAddress] || 0)
    //         )
    //     } catch (err) {
    //         // console.error(err);
    //     }
    //     // @ts-ignore
    // }, [wallet, liquidity, tokenAddress, tokensStore, el.token, owner])

    return (
        <div className={styles.container}>
            <div className={styles.row}>
                {/* <Link
                    href={`/${subdomainNavigate}${resolvedDomain}/defix/pool`}
                    passHref
                >
                    <div className={styles.hoverd}>
                        <BackIcon />
                    </div>
                </Link> */}
                <div className={styles.title}>Remove liquidity</div>
                {/* @review: tokensStore.tokens[0] only valid for DragonDEX & ZilSwap */}
                {/* <ImagePair tokens={[tokensStore.tokens[0].meta, token]} /> */}
            </div>
            <div className={styles.title}>DEX</div>
            <div className={styles.wrapper}>
                <Slider
                    min={1}
                    max={100}
                    railStyle={{
                        backgroundColor: '#fff',
                        height: '7px',
                    }}
                    trackStyle={{
                        backgroundColor: '#000',
                        height: '7px',
                    }}
                    handleStyle={{
                        height: '17px',
                        width: '17px',
                        borderColor: '#000',
                        backgroundColor: '#dbe4eb',
                        opacity: '1',
                    }}
                    step={1}
                    onChange={hanldeRange}
                />
                <div className={styles.txtRange}>{range}%</div>
                <div className={styles.cards}>
                    <div className={styles.card}>
                        <span>
                            {formatNumber(
                                Number(
                                    token_amt.div(
                                        dex.toDecimals(el.token.decimals)
                                    )
                                )
                            )}
                        </span>
                        <span>{el.token.symbol}</span>
                    </div>
                    <svg
                        focusable="false"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        height="30"
                        width="30"
                    >
                        <path
                            d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"
                            fill="#dbe4eb"
                        />
                    </svg>
                    <div className={styles.card}>
                        <span>
                            {formatNumber(
                                Number(
                                    base_amt.div(
                                        dex.toDecimals(el.base.decimals)
                                    )
                                )
                            )}
                        </span>
                        <span>{el.base.symbol}</span>
                        {/* <span>{tokensStore.tokens[0].meta.symbol}</span> */}
                    </div>
                </div>
            </div>
            <div className={styles.title}>DAO</div>
            <div className={styles.wrapper}>
                <Slider
                    min={1}
                    max={100}
                    railStyle={{
                        backgroundColor: '#ffff32',
                        height: '7px',
                    }}
                    trackStyle={{
                        backgroundColor: '#000',
                        height: '7px',
                    }}
                    handleStyle={{
                        height: '17px',
                        width: '17px',
                        borderColor: '#000',
                        backgroundColor: '#dbe4eb',
                        opacity: '1',
                    }}
                    step={1}
                    onChange={hanldeRangeDAO}
                />
                <div className={styles.txtRange}>{rangeDAO}%</div>
                <div className={styles.cards}>
                    {/* <div className={styles.card}>
                        <span>
                            {formatNumber(Number(token_amt))}</span>
                        <span>{el.token.symbol}</span>
                    </div> */}
                    <svg
                        focusable="false"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        height="30"
                        width="30"
                    >
                        <path
                            d="M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"
                            fill="#ffff32"
                        />
                    </svg>
                    <div className={styles.card}>
                        <span>
                            {formatNumber(
                                Number(
                                    dao_amt
                                        .div(dex.toDecimals(el.base.decimals))
                                        .round(4)
                                )
                            )}
                        </span>
                        <span>LP tokens</span>
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
                    className={`button ${loading ? 'disabled' : 'primary'}`}
                    onClick={
                        () => toast('Incoming!')
                        //handleSubmit
                    }
                >
                    {loading ? (
                        <ThreeDots color="black" />
                    ) : (
                        // <ThreeDots
                        //     color="var(--primary-color)"
                        //     height={25}
                        //     width={50}
                        // />
                        'REMOVE'
                    )}
                </div>
            </div>
        </div>
    )
}
