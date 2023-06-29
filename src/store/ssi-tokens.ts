//@review
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
