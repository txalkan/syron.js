import Layout from '../../components/Layout'
import {
    Treasury,
    VerifiableCredentials,
    Defi,
    Headline,
} from '../../components'
import { $loading } from '../../src/store/loading'
import { useStore } from 'effector-react'
import { $user } from '../../src/store/user'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'

function Header() {
    const loading = useStore($loading)
    const user = useStore($user)
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')
    const first = path.split('/')[1]
    const username = first.split('.')[0]

    const data = [
        {
            name: 'web3wallet',
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
                        {user?.name !== '' ? (
                            <>
                                {user?.domain === 'defi' ? (
                                    <Defi />
                                ) : user?.domain === 'vc' ? (
                                    <VerifiableCredentials />
                                ) : user?.domain === 'treasury' ? (
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
