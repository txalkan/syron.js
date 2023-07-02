import Layout from '../../../components/Layout'
import { Balances, Headline, SBTx, Tydra, ZILx } from '../../../components'
import styles from '../../styles.module.scss'
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSidePropsContext, GetStaticPaths, NextPage } from 'next/types'
import { SwapForm } from '../../../components/swap-form'
import React from 'react'
import { updateRate } from '../../../src/store/settings'
import { ListedTokenResponse, TokenState } from '../../../src/types/token'
import { SwapPair } from '../../../src/types/swap'
import { DragonDex } from '../../../src/mixins/dex'
import { ZilPayBackend } from '../../../src/mixins/backend'
import { updateDexPools } from '../../../src/store/shares'
import { loadFromServer } from '../../../src/store/tokens'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import routerHook from '../../../src/hooks/router'
import Image from 'next/image'
import addIco from '../../../src/assets/icons/add_icon.svg'

type Prop = {
    data: ListedTokenResponse
    pair: SwapPair[]
}

const dex = new DragonDex()
const backend = new ZilPayBackend()
export const PageSwap: NextPage<Prop> = (props) => {
    const { navigate } = routerHook()
    //function Page() {
    const tyron_token: TokenState = {
        decimals: 12,
        bech32: 'zil10j88w3qkvl8pug3urfdavkpg02c7h4wvrawpsf',
        base16: '0xeb1a63176106731757cb52e2f703620b247fc663',
        name: 'Tyron SSI Token',
        symbol: 'TYRON',
        scope: 100,
    }

    const ssi_token: TokenState = {
        decimals: 18,
        bech32: 'zil1cg7230srfvnmp4wcpjcgec80zr3ndpja9qjusk',
        base16: '0xc23ca8be034b27b0d5d80cb08ce0ef10e336865d',
        name: 'Self-Sovereign Identity (SSI) Dollar',
        symbol: 'S$I',
        scope: 100,
    }
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
    const ssi_pair = [
        {
            value: '0',
            meta: ssi_token,
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
            meta: tyron_token,
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
    const zlp_data = props.data
    const zlp_tokens = zlp_data.tokens.list
    const zlp_pools = zlp_data.pools

    const ssi_tokens = [tyron_token, ssi_token, ...zlp_tokens]

    const ssi_pools = { ...pools, ...zlp_pools }

    updateDexPools(ssi_pools) //props.data.pools)
    updateRate(props.data.rate)
    loadFromServer(ssi_tokens) //props.data.tokens.list)

    // updateDexPools(ssi_data.pools)
    // updateRate(ssi_data.rate)
    // loadFromServer(ssi_data.tokens.list)
    // // const props = {
    //     data: ssi_data,
    //     pair: ssi_pair,
    // }
    console.log('DATA')
    // console.log(JSON.stringify(ssi_data))

    console.log('PAIR')
    // console.log(JSON.stringify(ssi_pair))
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]
    const loginInfo = useSelector((state: RootState) => state.modal)
    const wallet = loginInfo.zilAddr //@review: use DEFIx & add connect verification
    const resolvedInfo = useStore($resolvedInfo)

    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const resolvedTLD = resolvedInfo?.user_tld

    const handleUpdate = React.useCallback(async () => {
        if (typeof window !== 'undefined') {
            updateRate(props.data.rate)

            try {
                await dex.updateTokens() //@review
                await dex.updateState()
            } catch {
                ///
            }
        }
    }, [props])
    React.useEffect(() => {
        if (wallet) {
            handleUpdate()
        }
    }, [handleUpdate, wallet])

    const subdomainNavigate =
        resolvedInfo?.user_subdomain !== ''
            ? resolvedInfo?.user_subdomain + '@'
            : ''

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    {/* @review: create new component for sub@domain.ssi */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            marginTop: '40px',
                        }}
                    >
                        <h1>
                            <div className={styles.username}>
                                <span
                                    style={{
                                        textTransform: 'lowercase',
                                    }}
                                >
                                    {resolvedSubdomain !== '' &&
                                        `${resolvedSubdomain}@`}
                                </span>
                                {resolvedSubdomain!?.length > 7 && (
                                    <div className={styles.usernameMobile}>
                                        <br />
                                    </div>
                                )}
                                <span
                                    style={{
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {resolvedDomain}
                                </span>
                                {resolvedDomain!?.length > 7 && (
                                    <div className={styles.usernameMobile}>
                                        <br />
                                    </div>
                                )}
                                <span
                                    style={{
                                        textTransform: 'lowercase',
                                    }}
                                >
                                    .
                                    {resolvedTLD === '' || 'did'
                                        ? 'ssi'
                                        : resolvedTLD}
                                </span>
                            </div>
                        </h1>
                    </div>
                </div>
                <Tydra />
                <div>
                    {/* @dev: SWAP */}
                    <SwapForm startPair={ssi_pair} />

                    {/* dev: POOLS */}
                    <div onClick={() => navigate('/defi@ilhamb/defix/pool')}>
                        <h3>POOLS</h3>
                    </div>

                    {/* @dev: DEPOSIT */}
                    {/* @review: majin css (idem /services) & translate */}
                    <div className={styles.tooltip}>
                        <div className={styles.tooltiptext}>
                            <div
                                style={{
                                    fontSize: '12px',
                                }}
                            >
                                add funds
                                {/* {t('Send money to', {
                            name: resolvedDomain,
                        })} */}
                            </div>
                        </div>
                        <div
                            onClick={() =>
                                navigate(
                                    `/${subdomainNavigate}${resolvedDomain}/defix/funds`
                                )
                            }
                            className={styles.addFunds}
                        >
                            <div className={styles.addFundsIco}>
                                <Image src={addIco} alt="ico-add" />
                            </div>
                            <div
                                style={{
                                    textAlign: 'center',
                                    textTransform: 'uppercase',
                                }}
                            >
                                <code>
                                    deposit
                                    {/* {t('DID_1')} */}
                                </code>
                            </div>
                        </div>
                    </div>
                    {/* ---end--- */}

                    {/* @dev: balances */}
                    {/* @review: majin los balances y varios elementos de esta UI deberian ser privados (?) */}
                    <Balances />

                    {/* @dev: ZILxWALLET */}
                    <ZILx />

                    {/* @dev: SBTxWALLET */}
                    <SBTx />
                </div>
            </Layout>
        </>
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
    let pair = [
        {
            value: '0',
            meta: data.tokens.list[0],
        },
        {
            value: '0',
            meta: data.tokens.list[1],
        },
    ]

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

    updateDexPools(data.pools)
    updateRate(data.rate)
    loadFromServer(data.tokens.list)

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
