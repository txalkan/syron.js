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

import styles from '../../../../styles/scss/pages/swap.module.scss'

import type { ListedTokenResponse } from '../../../../src/types/token'

import Head from 'next/head'
import { useRouter } from 'next/router'
import { useStore } from 'react-stores'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { GetServerSidePropsContext, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { RemovePoolForm } from '../../../../components/pool'
import { $tokens, loadFromServer } from '../../../../src/store/tokens'

import { DragonDex } from '../../../../src/mixins/dex'
//import { ThreeDots } from 'react-loader-spinner';
import { ZilPayBackend } from '../../../../src/mixins/backend'
import { updateRate } from '../../../../src/store/settings'
import { updateDexPools } from '../../../../src/store/shares'
//import { $wallet } from '/store/wallet';

// @ref: ssibrowser ---
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import ThreeDots from '../../../../components/Spinner/ThreeDots'
//---

type Prop = {
    data: ListedTokenResponse
}

const backend = new ZilPayBackend()
const dex = new DragonDex()

export const PageRemovePool: NextPage<Prop> = (props) => {
    const pool = useTranslation(`pool`)

    const router = useRouter()
    const tokensStore = useStore($tokens)
    //const wallet = useStore($wallet);

    //@ref: ssibrowser ---
    const loginInfo = useSelector((state: RootState) => state.modal)
    const wallet = loginInfo.zilAddr //@review: use DEFIx & add connect verification
    //---

    const token = React.useMemo(() => {
        return tokensStore.tokens.find(
            (t) => t.meta.base16 === String(router.query.addr).toLowerCase()
        )
    }, [tokensStore, router])

    React.useEffect(() => {
        if (props.data) {
            updateDexPools(props.data.pools)
            updateRate(props.data.rate)
            loadFromServer(props.data.tokens.list)
        }
    }, [props])

    React.useEffect(() => {
        if (wallet) {
            dex.updateState()
        }
    }, [wallet])

    return (
        <div className={styles.container}>
            <Head>
                <title>{pool.t('remove_pool.head')}</title>
                <meta
                    property="og:title"
                    content={pool.t('remove_pool.title')}
                    key="title"
                />
            </Head>
            <div>
                {token ? (
                    <RemovePoolForm token={token} />
                ) : (
                    <ThreeDots color="yellow" />
                    //<ThreeDots color='var(--text-color)'/>
                )}
            </div>
        </div>
    )
}

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    if (context.res) {
        // res available only at server
        // no-store disable bfCache for any browser. So your HTML will not be cached
        context.res.setHeader(`Cache-Control`, `no-store`)
    }

    const data = await backend.getListedTokens()

    updateDexPools(data.pools)
    updateRate(data.rate)
    loadFromServer(data.tokens.list)

    return {
        props: {
            data,
            ...(await serverSideTranslations(context.locale || `en`, [
                `pool`,
                `common`,
            ])),
        },
    }
}

export default PageRemovePool
