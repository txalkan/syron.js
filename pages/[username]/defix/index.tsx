import Layout from '../../../components/Layout'
import { Defix, DomainName, Headline, Tydra } from '../../../components'
import styles from '../../styles.module.scss'
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSidePropsContext, GetStaticPaths, NextPage } from 'next/types'
import React from 'react'
import { updateRate } from '../../../src/store/settings'
import { ListedTokenResponse } from '../../../src/types/token'
import { SwapPair } from '../../../src/types/swap'
import { DragonDex } from '../../../src/mixins/dex'
import { ZilPayBackend } from '../../../src/mixins/backend'
import { updateDexPools } from '../../../src/store/shares'
import { loadFromServer } from '../../../src/store/tokens'
import {
    s$i_tokenState,
    tyron_tokenState,
} from '../../../src/constants/tokens-states'
import { $wallet } from '../../../src/store/wallet'
import { useStore } from 'react-stores'
//@ssibrowser
import { useStore as effectorStore } from 'effector-react'
import useFetch from '../../../src/hooks/fetch'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { $props, updateProps } from '../../../src/store/props'
type Prop = {
    data: ListedTokenResponse
    pair: SwapPair[]
}

const dex = new DragonDex()
const backend = new ZilPayBackend()

export const PageSwap: NextPage<Prop> = (props) => {
    //const { t } = useTranslation(`swap`);

    const wallet = useStore($wallet)

    //@ssibrowser
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    const { resolveUser } = useFetch()
    const path = decodeURI(window.location.pathname)
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')

    React.useEffect(() => {
        if (!path.includes('/getstarted')) {
            resolveUser()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet])

    //@zilpay
    React.useEffect(() => {
        if (props.data) {
            updateDexPools(props.data.pools)
            updateRate(props.data.rate)
            loadFromServer(props.data.tokens.list)
        }
    }, [props])

    const handleUpdate = React.useCallback(async () => {
        if (typeof window !== 'undefined' && props.data) {
            updateRate(props.data.rate)
            try {
                await dex.updateTokens() //@reviewed: added SSI tokens
                await dex.updateState()
            } catch (error) {
                console.error(error)
            }
        }
    }, [props])

    React.useEffect(() => {
        if (wallet) {
            handleUpdate()
        }
    }, [handleUpdate, wallet])

    React.useEffect(() => {
        console.log('props', JSON.stringify(props, null, 2))
    }, [])

    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                <Headline data={data} />
                <DomainName />
                <Tydra type="account" />
            </div>
            {Array.isArray(props.pair) && <Defix startPair={props.pair} />}
        </Layout>
    )
}

// @review export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
//     return {
//         paths: [],
//         fallback: 'blocking',
//     }
// }

// export const getStaticProps = async ({ locale }) => ({
//     props: {
//         ...(await serverSideTranslations(locale, ['common'])),
//     },
// })

export default PageSwap

export async function getServerSideProps(context: GetServerSidePropsContext) {
    if (context.res) {
        // res available only at server
        // no-store disable bfCache for any browser. So your HTML will not be cached
        context.res.setHeader(`Cache-Control`, `no-store`)
    }

    const data = await backend.getListedTokens()
    // let pair = [
    //     {
    //         value: '0',
    //         meta: data.tokens.list[0],
    //     },
    //     {
    //         value: '0',
    //         meta: data.tokens.list[1],
    //     },
    // ]
    console.log('Server Data', JSON.stringify(data, null, 2))

    //@ssibrowser
    const pair = [
        {
            value: '0',
            meta: data.tokens.list[0],
        },
        // {
        //     value: '0',
        //     meta: s$i_tokenState,
        // },
        {
            value: '0',
            meta: tyron_tokenState,
        },
    ]

    const ref_pools = {
        //@S$I
        '0xf0cb60c75a3d075969e35bf6749bb3f58e484c72': [
            '62814772743218038',
            '634978402620139773',
        ],
        //@TYRON
        '0x4f76adebaf4ab6c55e4483c6d10eb0dd1a319165': [
            '25325608536430145',
            '153963706725760245',
        ],
    }

    if (context.query) {
        if (context.query['tokenIn']) {
            const found = data.tokens.list.find(
                (t) => t.bech32 === context.query['tokenIn']
            )
            if (found) {
                pair[0].meta = found
            }
        }

        if (context.query['tokenOut']) {
            const found = data.tokens.list.find(
                (t) => t.bech32 === context.query['tokenOut']
            )
            if (found) {
                pair[1].meta = found
            }
        }
    }

    // updateDexPools(data.pools)
    // updateRate(data.rate)
    // loadFromServer(data.tokens.list)

    //@ssibrowser @review tyron addition
    const zlp_data = data
    const zlp_tokens = zlp_data.tokens.list
    const zlp_pools = zlp_data.pools
    const ssi_tokens = [s$i_tokenState, tyron_tokenState, ...zlp_tokens]
    const ssi_pools = { ...ref_pools, ...zlp_pools }

    updateDexPools(ssi_pools)
    updateRate(data.rate)
    loadFromServer(ssi_tokens)

    return {
        props: {
            data,
            pair,
            ...(await serverSideTranslations(context.locale || `en`, [
                // `swap`,
                `common`,
            ])),
        },
    }
}
