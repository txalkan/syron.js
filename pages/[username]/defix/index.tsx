import Layout from '../../../components/Layout'
import { DeFi, Headline, ZILx } from '../../../components'
import styles from '../../styles.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSidePropsContext, GetStaticPaths, NextPage } from 'next/types'
import { SwapForm } from '../../../components/swap-form'
import React from 'react'
import { updateRate } from '../../../src/store/settings'
import { ListedTokenResponse } from '../../../src/types/token'
import { SwapPair } from '../../../src/types/swap'
import { DragonDex } from '../../../src/mixins/dex'
import { ZilPayBackend } from '../../../src/mixins/backend'
import { updateDexPools } from '../../../src/store/shares'
import { loadFromServer } from '../../../src/store/tokens'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
// import { ZilPayBackend } from '../../../src/mixins/backend'

type Prop = {
    data: ListedTokenResponse;
    pair: SwapPair[];
};

const dex = new DragonDex();
const backend = new ZilPayBackend();
export const PageSwap: NextPage<Prop> = (props) => {
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]
    const loginInfo = useSelector((state: RootState) => state.modal)
    const wallet = loginInfo.zilAddr; //@review add connect verification

    const handleUpdate = React.useCallback(async () => {
        if (typeof window !== 'undefined') {
            updateRate(props.data.rate);

            try {
                await dex.updateTokens();
                await dex.updateState();
            } catch {
                ///
            }
        }
    }, [props]);
    React.useEffect(() => {
        if (wallet) {
            handleUpdate();
        }
    }, [handleUpdate, wallet]);

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                </div>
                <div>
                    <SwapForm startPair={props.pair} />
                    <DeFi />
                    <ZILx />
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
        context.res.setHeader(`Cache-Control`, `no-store`);
    }

    const data = await backend.getListedTokens();
    let pair = [
        {
            value: '0',
            meta: data.tokens.list[0]
        },
        {
            value: '0',
            meta: data.tokens.list[1]
        }
    ];

    if (context.query) {
        if (context.query['tokenIn']) {
            const found = data.tokens.list.find((t) => t.bech32 === context.query['tokenIn']);
            if (found) {
                pair[0].meta = found;
            }
        }

        if (context.query['tokenOut']) {
            const found = data.tokens.list.find((t) => t.bech32 === context.query['tokenOut']);
            if (found) {
                pair[1].meta = found;
            }
        }
    }

    updateDexPools(data.pools);
    updateRate(data.rate);
    loadFromServer(data.tokens.list);

    return {
        props: {
            data,
            pair,
            ...(await serverSideTranslations(context.locale || `en`, [`swap`, `common`]))
        }
    };
}
