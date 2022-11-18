import Layout from '../../../components/Layout'
import { DIDxWallet, Headline } from '../../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { $loadingTydra } from '../../../src/store/loading'
import { useStore } from 'effector-react'

function Header() {
    const loadingTydra = useStore($loadingTydra)
    const data = []

    return (
        <>
            <Layout>
                {!loadingTydra && (
                    <div style={{ width: '100%', marginTop: '10%' }}>
                        <Headline data={data} />
                    </div>
                )}
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
