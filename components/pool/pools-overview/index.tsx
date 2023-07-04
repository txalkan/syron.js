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
import React from 'react'
import { useStore } from 'react-stores' //@review: fully migrate to react-stores
import classNames from 'classnames'
import Big from 'big.js'
import Link from 'next/link'
import { Puff } from 'react-loader-spinner'
import { useTranslation } from 'next-i18next'
import { ImagePair } from '../../pair-img'
// import { $wallet } from '@/store/wallet';
import { $liquidity } from '../../../src/store/shares'
import { $tokens } from '../../../src/store/tokens'
import { nPool } from '../../../src/filters/n-pool'
import { formatNumber } from '../../../src/filters/n-format'
import {
    DEFAULT_CURRENCY,
    SHARE_PERCENT_DECIMALS,
} from '../../../src/config/const'
import { DragonDex } from '../../../src/mixins/dex'
import { $settings } from '../../../src/store/settings'
// @ref: ssibrowser ---
import routerHook from '../../../src/hooks/router'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { useStore as effectorStore } from 'effector-react'
import { BackIcon } from '../../icons/back'
//---
type Prop = {
    loading: boolean
}

const dex = new DragonDex()
export const PoolOverview: React.FC<Prop> = ({ loading }) => {
    const pool = useTranslation(`pool`)
    const { navigate } = routerHook()

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
    const settings = useStore($settings)

    const list = React.useMemo(() => {
        if (!wallet || tokensStore.tokens.length === 0) {
            return []
        }
        const tokens: any = []
        const zilToken = tokensStore.tokens[0].meta
        const { pools, shares } = liquidity
        const rate = Big(settings.rate)

        for (const token in shares) {
            try {
                const share = Big(String(shares[token]))
                    .div(Big(SHARE_PERCENT_DECIMALS))
                    .round(2)
                const foundIndex = tokensStore.tokens.findIndex(
                    (t) => t.meta.base16 === token
                )
                const pool = pools[token]
                const limitToken = tokensStore.tokens[foundIndex]
                const [x, y] = nPool(pool, shares[token])
                const zilReserve = Big(x.toString()).div(
                    dex.toDecimals(zilToken.decimals)
                )
                const tokenReserve = Big(y.toString()).div(
                    dex.toDecimals(limitToken.meta.decimals)
                )
                const zilsTokens = dex.tokensToZil(
                    tokenReserve,
                    limitToken.meta
                )
                const zils = zilReserve.add(zilsTokens)

                tokens.push({
                    share: share.lt(0.001) ? '0.01<' : String(share),
                    token: limitToken.meta,
                    zilReserve: formatNumber(String(zilReserve)),
                    tokenReserve: formatNumber(String(tokenReserve)),
                    price: formatNumber(
                        String(zils.mul(rate)),
                        DEFAULT_CURRENCY
                    ),
                })
            } catch {
                continue
            }
        }

        return tokens
    }, [wallet, liquidity, tokensStore, settings])

    // @review: majin translates
    return (
        <div className={styles.container}>
            <div className={styles.row}>
                {/* @ref: ssibrowser --- */}
                {/* @review: back arrow functioning */}
                <Link
                    href={`/${subdomainNavigate}${resolvedDomain}/defix`}
                    passHref
                >
                    <div className={styles.hoverd}>
                        <BackIcon />
                    </div>
                </Link>
                {/* --- */}
                <div>POOLS<br/>OVERVIEW</div>
                <div
                    onClick={() =>
                        navigate(
                            `/${subdomainNavigate}${resolvedDomain}/defix/pool/add`
                        )
                    }
                    className="button primary"
                >
                    Add liquidity
                </div>
            </div>
            {list.length === 0 ? (
                <div className={styles.wrapper}>
                    {loading ? (
                        <Puff color="var(--primary-color)" />
                    ) : (
                        <>
                            {/* Dummy list */}
                            <div className={styles.listPoolWrapper}>
                                <div
                                    onClick={() =>
                                        navigate(
                                            '/defi@ilhamb/defix/pool/asdjfu328rqksn'
                                        )
                                    }
                                    className={styles.listPool}
                                >
                                    <div>
                                        <div className={styles.dummy2ico} />
                                        <div className={styles.txtRate}>
                                            53.094 / 1=$2.1045
                                        </div>
                                    </div>
                                    <div className={styles.listPoolRight}>
                                        <div className={styles.txtPoolRight}>
                                            ZIL/ZWAP -&nbsp;
                                        </div>
                                        <div
                                            className={
                                                styles.txtPoolRightPercent
                                            }
                                        >
                                            4.5%
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--muted-color)"
                                strokeWidth="1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                            </svg>
                            <div className={styles.txtPoolInfo}>
                                Your active liquidity positions will appear
                                here.
                            </div> */}
                        </>
                    )}
                </div>
            ) : (
                <div className={classNames(styles.wrapper, styles.cardwrapper)}>
                    {list.map((el) => (
                        <Link
                            href={`/pool/${el.token.base16}`}
                            key={el.token.base16}
                            passHref
                        >
                            <div className={styles.poolcard}>
                                <div className={styles.cardrow}>
                                    <ImagePair
                                        tokens={[
                                            tokensStore.tokens[0].meta,
                                            el.token,
                                        ]}
                                    />
                                    <p>
                                        ZIL / {el.token.symbol} -{' '}
                                        <span>{el.share}%</span>
                                    </p>
                                </div>
                                <div className={styles.cardrow}>
                                    <p className={styles.amount}>
                                        {el.zilReserve} / {el.tokenReserve} ≈{' '}
                                        {el.price}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
