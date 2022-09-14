import Layout from '../../../components/Layout'
import { Headline, VerifiableCredentials } from '../../../components'
import styles from '../../styles.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'

function VCIndex() {
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]
    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                </div>
                <VerifiableCredentials />
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

export default VCIndex
