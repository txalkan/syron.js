import Layout from '../../../../components/Layout'
import { Headline, SBTxWallet } from '../../../../components'
import styles from '../../../styles.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'

function Component() {
    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={[]} />
                </div>
                <SBTxWallet type="public" />
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

export default Component
