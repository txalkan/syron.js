import Layout from '../../components/Layout'
import {
    Account,
    DIDxWallet,
    DomainName,
    Headline,
    SocialTree,
} from '../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import stylesDark from '../styles.module.scss'
import stylesLight from '../styleslight.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import Tydra from '../../components/SSI/Tydra'
import { useEffect } from 'react'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import fetch from '../../src/hooks/fetch'

function Header() {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    const { resolveUser } = fetch()
    const path = decodeURI(window.location.pathname)
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')

    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const resolvedTLD =
        resolvedInfo?.user_tld! && resolvedInfo.user_tld
            ? resolvedInfo.user_tld
            : ''
    useEffect(() => {
        if (!path.includes('/getstarted')) {
            // if (path.includes('did@') || path.includes('.did')) {
            //     fetchDoc()
            //     setShow(true)
            // } else if (path.includes('@')) {
            resolveUser()
            // } else {
            //     fetchDoc()
            //     setShow(true)
            // }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDomain, resolvedSubdomain, resolvedTLD])
    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                <Headline data={data} />
                <DomainName />
                <Tydra type="account" />
            </div>
            <SocialTree />
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
