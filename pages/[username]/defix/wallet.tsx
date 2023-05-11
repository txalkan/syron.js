import { useStore } from 'effector-react'
import { $loading } from '../../../src/store/loading'
import Layout from '../../../components/Layout'
import { Headline, ZILxWALLET } from '../../../components'
import styles from '../../styles.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function Index() {
    const loading = useStore($loading)

    return (
        <>
            <Layout>
                {!loading && (
                    <>
                        <div className={styles.headlineWrapper}>
                            <Headline data={[]} />
                        </div>
                        <ZILxWALLET />
                    </>
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

export default Index
