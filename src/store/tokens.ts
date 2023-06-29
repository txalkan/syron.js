/*
ZilPay.io
Copyright (c) 2022 by Rinat <https://github.com/hicaru>
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

import type { ListedTokenResponse, Token, TokenState } from '../types/token'

import { Store } from 'react-stores'

// import { StorageFields } from '@/config/storage-fields';

let initState: {
    tokens: Token[]
} = {
    tokens: [],
}

if (typeof window !== 'undefined' && window.__NEXT_DATA__.props) {
    try {
        const listedTokens = window.__NEXT_DATA__.props.pageProps
            .data as ListedTokenResponse

        if (
            listedTokens &&
            listedTokens.tokens.list &&
            listedTokens.tokens.list.length > 0
        ) {
            initState.tokens = listedTokens.tokens.list.map((meta) => ({
                meta,
                balance: {},
            }))
        }
    } catch (err) {
        console.warn(err)
    }
}

export const $tokens = new Store(initState)

export function addToken(token: Token) {
    const has = $tokens.state.tokens.some(
        (t) => token.meta.base16 === t.meta.base16
    )

    if (has) {
        throw new Error('Token registered already')
    }

    const tokens = [...$tokens.state.tokens, token]
    $tokens.setState({
        tokens,
    })
}

export function updateTokens(tokens: Token[]) {
    const newTokens = $tokens.state.tokens.map((token) => {
        const found = tokens.find((t) => t.meta.base16 === token.meta.base16)

        if (found) {
            token.balance = found.balance
        }

        return token
    })

    $tokens.setState({
        tokens: newTokens,
    })
}

export function loadFromServer(listedTokens: TokenState[]) {
    if (listedTokens && listedTokens.length > 0) {
        const list: Token[] = listedTokens.map((t) => ({
            balance: {},
            meta: t,
        }))
        const state = {
            tokens: list,
        }

        $tokens.setState(state)
    }
}
