import Layout from '../../../components/Layout'
import stylesDark from '../../styles.module.scss'
import stylesLight from '../../styleslight.module.scss'
import {
    Account,
    DIDxWallet,
    DomainName,
    Headline,
    Social,
} from '../../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import Tydra from '../../../components/SSI/Tydra'
import React, { useEffect } from 'react'
import { useStore } from 'react-stores'
import { $wallet } from '../../../src/store/wallet'
import { useRouter } from 'next/router'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import useFetch from '../../../src/hooks/fetch'

function Header() {
    const Router = useRouter()
    const resolvedInfo = useStore($resolvedInfo)

    //@review: loading tydra
    // const [loadingTydra_, setLoadingTydra_] = useState(true)
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    // useEffect(() => {
    //     setTimeout(() => {
    //         setLoadingTydra_(false)
    //     }, 2000)
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    const wallet = useStore($wallet)
    const { resolveUser } = useFetch(resolvedInfo)
    useEffect(() => {
        console.log('/didx: wallet updated')

        const fetch = async () => {
            const res = await resolveUser()
                .then((res) => {
                    Router.push(res)
                })
                .catch((err) => {
                    console.error(err)
                    Router.push('/')
                })
        }
        fetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                {/* {!loadingTydra_ && ( */}
                <Headline data={data} />
                <DomainName />
                {/* )} */}
                <div style={{ marginBottom: '3%' }}>
                    <Tydra type="account" />
                </div>
            </div>
            <Social />
            <Account />
            <DIDxWallet>
                <div />
            </DIDxWallet>
        </Layout>
    )
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default Header
