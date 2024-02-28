import Layout from '../../components/Layout'
import {
    Account,
    DIDxWallet,
    DomainName,
    Headline,
    Social,
} from '../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import stylesDark from '../styles.module.scss'
import stylesLight from '../styleslight.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import Tydra from '../../components/SSI/Tydra'
import { useEffect } from 'react'
import useFetch from '../../src/hooks/fetch'
import { useStore } from 'react-stores'
import { $wallet } from '../../src/store/wallet'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { useRouter } from 'next/router'

function Header() {
    const Router = useRouter()
    const resolvedInfo = useStore($resolvedInfo)

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    const path = decodeURI(window.location.pathname)
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')

    const wallet = useStore($wallet)

    const { resolveUser } = useFetch(resolvedInfo)
    useEffect(() => {
        if (!path.includes('/getstarted')) {
            // if (path.includes('did@') || path.includes('.did')) {
            //     fetchDoc()
            //     setShow(true)
            // } else if (path.includes('@')) {
            console.log('wallet updated')

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

            // } else {
            //     fetchDoc()
            //     setShow(true)
            // }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                <Headline data={data} />
                <DomainName />
                <Tydra type="account" />
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
