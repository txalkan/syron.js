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
import { useStore } from 'react-stores'
import React from 'react'
import Big from 'big.js'
import { useTranslation } from 'next-i18next'
import classNames from 'classnames'
import Link from 'next/link'
import { FormInput, SwapSettings } from '../../swap-form'
import { TokensModal } from '../../Modals/tokens'
import { BackIcon } from '../../icons/back'
import { $tokens } from '../../../src/store/tokens'
import { DragonDex } from '../../../src/mixins/dex'
import { ZERO_ADDR } from '../../../src/config/const'
import { AddPoolPreviewModal } from '../../Modals/add-pool-preview'
import { SwapSettingsModal } from '../../Modals/settings'
import { $liquidity } from '../../../src/store/shares'
import { TokenState } from '../../../src/types/token'
//import { $wallet } from '@/store/wallet';
// @ref: ssibrowser ---
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { useStore as effectorStore } from 'effector-react'
//---

type Prop = {
    index: number
}

const dex = new DragonDex()
export const AddPoolForm: React.FC<Prop> = ({ index }) => {
    const pool = useTranslation(`pool`)

    const tokensStore = useStore($tokens)
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

    const [amount, setAmount] = React.useState(Big(0))
    const [limitAmount, setLimitAmount] = React.useState(Big(0))

    const [token, setToken] = React.useState(index)
    const [tokensModal, setTokensModal] = React.useState(false)
    const [previewModal, setPreviewModal] = React.useState(false)
    const [settingsModal, setSettingsModal] = React.useState(false)

    const tokenBalance = React.useMemo(() => {
        let balance = '0'
        const owner = String(wallet).toLowerCase()

        if (
            tokensStore.tokens[token] &&
            tokensStore.tokens[token].balance[owner]
        ) {
            balance = tokensStore.tokens[token].balance[owner]
        }

        return Big(balance)
    }, [wallet, tokensStore, token])

    const exceptions = React.useMemo(() => {
        return [ZERO_ADDR, tokensStore.tokens[token].meta.base16]
    }, [tokensStore, token])

    const hasPool = React.useMemo(() => {
        return Boolean(liquidity.pools[tokensStore.tokens[token].meta.base16])
    }, [liquidity, tokensStore, token])

    const disabled = React.useMemo(() => {
        const decimals = dex.toDecimals(tokensStore.tokens[token].meta.decimals)
        const qa = amount.mul(decimals)
        let isLess = false

        if (!hasPool) {
            const zilDecimals = dex.toDecimals(
                tokensStore.tokens[0].meta.decimals
            )
            isLess =
                BigInt(String(limitAmount.mul(zilDecimals).round())) < dex.lp
        }

        return Number(amount) === 0 || tokenBalance.lt(qa) || isLess
    }, [tokenBalance, amount, limitAmount, tokensStore, token, hasPool])

    const hanldeSelectToken0 = React.useCallback(
        (t: TokenState) => {
            const foundIndex = tokensStore.tokens.findIndex(
                (p) => p.meta.base16 === t.base16
            )

            if (foundIndex >= 0 && t.base16 !== ZERO_ADDR) {
                setToken(foundIndex)
                setTokensModal(false)
            }
        },
        [tokensStore]
    )

    const handleSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            setPreviewModal(true)
        },
        []
    )

    React.useEffect(() => {
        const tokenMeta = tokensStore.tokens[token].meta
        const pool = liquidity.pools[tokenMeta.base16]

        if (pool && pool.length >= 2) {
            setLimitAmount(dex.calcVirtualAmount(amount, tokenMeta, pool))
        }
    }, [amount, token, liquidity, tokensStore])

    return (
        <>
            <SwapSettingsModal
                show={settingsModal}
                onClose={() => setSettingsModal(false)}
            />
            <TokensModal
                show={tokensModal}
                exceptions={exceptions}
                warn
                include
                onClose={() => setTokensModal(false)}
                onSelect={hanldeSelectToken0}
            />
            <AddPoolPreviewModal
                show={previewModal}
                amount={amount}
                limit={limitAmount}
                tokenIndex={token}
                hasPool={hasPool}
                onClose={() => setPreviewModal(false)}
            />
            <form className={styles.container} onSubmit={handleSubmit}>
                <div className={styles.row}>
                    <Link
                        href={`/${subdomainNavigate}${resolvedDomain}/defix/pool`}
                        passHref
                    >
                        <div className={styles.hoverd}>
                            <BackIcon />
                        </div>
                    </Link>
                    <div>ADD LIQUIDITY</div>
                    <SwapSettings onClick={() => setSettingsModal(true)} />
                </div>
                <div
                    className={classNames(styles.row, {
                        border: true,
                    })}
                >
                    <div className={styles.column}>
                        <div className={styles.txtSubtitle}>
                            Select pair and amount:
                        </div>
                        <FormInput
                            value={amount}
                            token={tokensStore.tokens[token].meta}
                            balance={
                                tokensStore.tokens[token].balance[
                                    String(wallet).toLowerCase()
                                ]
                            }
                            onSelect={() => setTokensModal(true)}
                            onInput={setAmount}
                            onMax={setAmount}
                            noSwap={true}
                        />
                        {/* @review: only valid for ZIL-based DEXs (not TydraDEX, which is S$I based) */}
                        <FormInput
                            value={limitAmount}
                            token={tokensStore.tokens[0].meta}
                            balance={
                                tokensStore.tokens[0].balance[
                                    String(wallet).toLowerCase()
                                ]
                            }
                            onInput={setLimitAmount}
                            onMax={setLimitAmount}
                            noSwap={true}
                        />
                    </div>
                </div>
                <div
                    onClick={() => setPreviewModal(true)}
                    className={styles.btnWrapper}
                >
                    <div className="button secondary">PREVIEW</div>
                </div>
            </form>
        </>
    )
}
