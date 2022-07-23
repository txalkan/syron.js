import Layout from '../../components/Layout'
import {
    Treasury,
    VerifiableCredentials,
    Defi,
    Headline,
    DIDxWallet,
} from '../../components'
import { $loading } from '../../src/store/loading'
import { useStore } from 'effector-react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

function Header() {
    const loading = useStore($loading)
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')
    const first = path.split('/')[1]
    const username = first.split('.')[0]
    const resolvedInfo = useSelector(
        (state: RootState) => state.modal.resolvedInfo
    )
    const domain = resolvedInfo.domain

    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    return (
        <>
            <Layout>
                <div style={{ width: '100%', marginTop: '10%' }}>
                    <Headline data={data} />
                </div>
                {!loading ? (
                    <>
                        {username !== '' ? (
                            <>
                                {domain === 'defi' ? (
                                    <Defi />
                                ) : domain === 'vc' ? (
                                    <VerifiableCredentials />
                                ) : domain === 'treasury' ? (
                                    <Treasury />
                                ) : username === 'getstarted' ? (
                                    <div />
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <></>
                        )}
                    </>
                ) : (
                    <></>
                )}
            </Layout>
        </>
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
