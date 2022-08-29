import { useStore } from 'effector-react'
import { $loading } from '../../../src/store/loading'
import Layout from '../../../components/Layout'
import { AddFunds, Headline } from '../../../components'
import styles from '../../styles.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

function Header() {
    const loading = useStore($loading)

    return (
        <>
            <Layout>
                {!loading && (
                    <>
                        <div className={styles.headlineWrapper}>
                            <Headline data={[]} />
                        </div>
                        <AddFunds type="funds" />
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

export default Header
