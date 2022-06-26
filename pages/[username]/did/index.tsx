import Layout from '../../../components/Layout'
import { DIDxWallet, Headline } from '../../../components'
import { useEffect } from 'react'
import { $user, updateUser } from '../../../src/store/user'
import { useStore } from 'effector-react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'

function Header() {
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
    const user = useStore($user)
    const username = path.split('/')[1]
    const domain = path.split('/')[2]

    const data = [
        {
            name: 'did',
            router: '',
        },
    ]

    useEffect(() => {
        if (!user?.name) {
            updateUser({
                name: username,
                domain: domain,
            })
        }
    }, [domain, username, user?.name])

    return (
        <>
            <Layout>
                <div style={{ width: '100%', marginTop: '10%' }}>
                    <Headline data={data} />
                </div>
                <DIDxWallet>
                    <div />
                </DIDxWallet>
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
