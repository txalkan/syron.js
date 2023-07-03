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
import type { Token } from '../../../src/types/token'
import React from 'react'
import { useStore } from 'react-stores'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import Big from 'big.js'
//import { $wallet } from '@/store/wallet';
import { $liquidity } from '../../../src/store/shares'
import { $tokens } from '../../../src/store/tokens'
import { DragonDex } from '../../../src/mixins/dex'
import { ImagePair } from '../../pair-img'
import { BackIcon } from '../../icons/back'
import Slider from 'rc-slider'
import { nPool } from '../../../src/filters/n-pool'
import { ThreeDots } from 'react-loader-spinner'
import { formatNumber } from '../../../src/filters/n-format'
import { TokensMixine } from '../../../src/mixins/token'
// @ref: ssibrowser ---
import { useStore as effectorStore } from 'effector-react'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
//---

Big.PE = 999

type Prop = {
    token: Token
}

const tokensMixin = new TokensMixine()
const dex = new DragonDex()
export const RemovePoolForm: React.FC<Prop> = ({ token }) => {
    const pool = useTranslation(`pool`)

    //const wallet = useStore($wallet);
    //@ref: ssibrowser ---
    const resolvedInfo = effectorStore($resolvedInfo)
    const wallet = resolvedInfo?.addr
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const subdomainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''
    //---

    const liquidity = useStore($liquidity)
    const tokensStore = useStore($tokens)

    const [loading, setLoading] = React.useState(false)

    const [zilReserve, setZilReserve] = React.useState(Big(0))
    const [tokenReserve, setTokenReserve] = React.useState(Big(0))

    const [zil, setZil] = React.useState(Big(0))
    const [zrc, setZrc] = React.useState(Big(0))
    const [range, setRange] = React.useState(1)
    const [userContributions, setUserContributions] = React.useState(Big(0))

    const tokenAddress = React.useMemo(() => {
        return String(token.meta.base16).toLowerCase()
    }, [token])
    const owner = React.useMemo(() => {
        return String(wallet).toLowerCase()
    }, [wallet])

    const hanldeOnRemove = React.useCallback(async () => {
        setLoading(true)
        try {
            const zilpay = await tokensMixin.zilpay.zilpay()

            if (!wallet || !zilpay.wallet.isEnable) {
                await zilpay.wallet.connect()
            }

            const zilToken = tokensStore.tokens[0].meta
            const minZIL = zil.mul(dex.toDecimals(zilToken.decimals))
            const minZrc = zrc.mul(dex.toDecimals(token.meta.decimals))
            const res = await dex.removeLiquidity(
                minZIL,
                minZrc,
                userContributions,
                tokenAddress,
                owner
            )

            console.log(res)
        } catch (err) {
            console.error(err)
        }
        setLoading(false)
    }, [
        zil,
        zrc,
        tokenAddress,
        userContributions,
        owner,
        token,
        tokensStore,
        wallet,
    ])

    const hanldeRange = React.useCallback(
        (range: number | number[]) => {
            try {
                const _100 = BigInt(100)
                const percent = BigInt(Number(range))
                const zil = tokensStore.tokens[0].meta
                const userContributions = BigInt(
                    (liquidity.balances[owner] &&
                        liquidity.balances[owner][tokenAddress]) ||
                        0
                )
                const newZil = (BigInt(String(zilReserve)) * percent) / _100
                const newTokens =
                    (BigInt(String(tokenReserve)) * percent) / _100
                const newUserContributions =
                    (userContributions * percent) / _100

                setZil(Big(String(newZil)).div(dex.toDecimals(zil.decimals)))
                setZrc(
                    Big(String(newTokens)).div(
                        dex.toDecimals(token.meta.decimals)
                    )
                )
                setRange(Number(range))
                setUserContributions(Big(String(newUserContributions)))
            } catch (error) {
                console.error(error)
            }
        },
        [
            zilReserve,
            tokenReserve,
            tokensStore,
            owner,
            token,
            liquidity,
            tokenAddress,
        ]
    )

    React.useEffect(() => {
        try {
            const pool =
                liquidity.pools[String(token.meta.base16).toLowerCase()]
            const [x, y] = nPool(pool, liquidity.shares[tokenAddress])

            const zilReserve = Big(x.toString())
            const tokenReserve = Big(y.toString())

            setZilReserve(zilReserve)
            setTokenReserve(tokenReserve)
            setUserContributions(
                Big(liquidity.balances[owner][tokenAddress] || 0)
            )
        } catch (err) {
            // console.error(err);
        }
        // @ts-ignore
    }, [wallet, liquidity, tokenAddress, tokensStore, token, owner])

    return (
        <div className={styles.container}>
            <div className={styles.row}>
                <Link
                    href={`/${subdomainNavigate}${resolvedDomain}/defix/pool`}
                    passHref
                >
                    <div className={styles.hoverd}>
                        <BackIcon />
                    </div>
                </Link>
                <div>Remove liquidity</div>
                {/* @review: tokensStore.tokens[0] only valid for DragonDEX & ZilSwap */}
                <ImagePair tokens={[tokensStore.tokens[0].meta, token.meta]} />
            </div>
            {/* @review
            <p>{JSON.stringify(token)}</p> */}
            <div className={styles.wrapper}>
                <Slider
                    min={1}
                    max={100}
                    railStyle={{
                        backgroundColor: '#fff',
                        height: '6px',
                    }}
                    trackStyle={{
                        backgroundColor: '#ffff32',
                        height: '6px',
                    }}
                    handleStyle={{
                        height: '17px',
                        width: '17px',
                        borderColor: '#ffff32',
                        backgroundColor: '#000',
                        opacity: '1',
                    }}
                    step={1}
                    onChange={hanldeRange}
                />
                <div className={styles.txtRange}>{range}%</div>
                <div className={styles.cards}>
                    <div className={styles.card}>
                        {formatNumber(Number(zil))}{' '}
                        <span>{tokensStore.tokens[0].meta.symbol}</span>
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
                            fill="#ffff32"
                        />
                    </svg>
                    <div className={styles.card}>
                        {formatNumber(Number(zrc))}{' '}
                        <span>{token.meta.symbol}</span>
                    </div>
                </div>
            </div>
            <div className={styles.btnWrapper}>
                <div
                    style={{ width: '100%' }}
                    className={`button ${loading ? 'disabled' : 'secondary'}`}
                    onClick={hanldeOnRemove}
                >
                    {loading ? (
                        <ThreeDots
                            color="var(--primary-color)"
                            height={25}
                            width={50}
                        />
                    ) : (
                        'REMOVE'
                    )}
                </div>
            </div>
        </div>
    )
}
