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
import { $wallet, updateWallet } from '../../../src/store/wallet'
import { useStore } from 'react-stores'
//@ssibrowser
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { useStore as effectorStore } from 'effector-react'
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

    const resolvedInfo = effectorStore($resolvedInfo)
    const resolvedAddr =
        resolvedInfo?.addr && resolvedInfo.addr ? resolvedInfo.addr : ''

    //@zilpay
    React.useEffect(() => {
        if (props.data) {
            updateDexPools(props.data.pools)
            updateRate(props.data.rate)
            loadFromServer(props.data.tokens.list)
        }
    }, [props])
    const handleUpdate = React.useCallback(async () => {
        console.log('TYRON_UPDATE')
        if (typeof window !== 'undefined') {
            console.log('TYRON_UPDATE_')
            updateWallet({ base16: resolvedAddr })
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

    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                <Headline data={data} />
                <DomainName />
                <div style={{ marginBottom: '3%' }}>
                    <Tydra type="account" />
                </div>
            </div>
            <Defix startPair={props.pair} />
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
    //@ssibrowser
    // {"bech32":
    // "zil1z5l74hwy3pc3pr3gdh3nqju4jlyp0dzkhq2f5y",
    // "base16":"0x153feaddc48871108e286de3304b9597c817b456",
    // "scope":40,
    // "name":"XCAD Network Token",
    // "symbol":"XCAD",
    // "token_type":1,
    // "decimals":18,
    // "listed":true,
    // "status":1
    // },
    const pools = {
        '0xeb1a63176106731757cb52e2f703620b247fc663': [
            '62814772743218038',
            '634978402620139773',
        ],
        '0xc23ca8be034b27b0d5d80cb08ce0ef10e336865d': [
            '25325608536430145',
            '153963706725760245',
        ],
    }
    // const ssi_data: ListedTokenResponse = {
    //     tokens: {
    //         count: 2, //@review count after append
    //         list: [tyron_token, ssi_token],
    //     },
    //     pools: pools,
    //     rate: 0.018, //@review exchange rate
    // }
    const pair = [
        {
            value: '0',
            meta: s$i_tokenState,
            // {
            //     bech32: 'zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz',
            //     base16: '0x0000000000000000000000000000000000000000',
            //     scope: 100,
            //     name: 'Zilliqa',
            //     symbol: 'ZIL',
            //     token_type: 1,
            //     decimals: 12,
            //     listed: true,
            //     status: 1,
            // },
        },
        {
            value: '0',
            meta: tyron_tokenState,
            // {
            //     bech32: 'zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4',
            //     base16: '0xfbd07e692543d3064b9cf570b27faabfd7948da4',
            //     scope: 101,
            //     name: 'ZilPay wallet',
            //     symbol: 'ZLP',
            //     token_type: 1,
            //     decimals: 18,
            //     listed: true,
            //     status: 1,
            // },
        },
    ]
    //@zilpay

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

    //@ssibrowser
    console.log('TYRON_')
    const zlp_data = data
    const zlp_tokens = zlp_data.tokens.list
    const zlp_pools = zlp_data.pools
    const ssi_tokens = [s$i_tokenState, tyron_tokenState, ...zlp_tokens]
    const ssi_pools = { ...pools, ...zlp_pools }
    updateDexPools(ssi_pools)
    updateRate(data.rate)
    loadFromServer(ssi_tokens)
    //@zilpay
    return {
        props: {
            data,
            pair,
            // ...(await serverSideTranslations(context.locale || `en`, [
            //     `swap`,
            //     `common`,
            // ])),
        },
    }
}
