import Layout from '../../../components/Layout'
import { Headline, XPoints } from '../../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'

function Component() {
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    return (
        <>
            <Layout>
                <div
                    style={{
                        width: '100%',
                        marginTop: '10%',
                        marginBottom: '-10%',
                    }}
                >
                    <Headline data={data} />
                </div>
                <XPoints />
            </Layout>
        </>
    )
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default Component
