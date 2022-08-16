import Layout from '../../../../../components/Layout'
import { Headline, DIDOperations } from '../../../../../components'
import styles from '../../../../styles.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

function Index() {
    const { t } = useTranslation()
    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>
                        {t('DECENTRALIZED IDENTIFIER')}
                    </h2>
                    <h2 style={{ color: '#dbe4eb', marginBottom: '4%' }}>
                        {t('OPERATIONS')}
                    </h2>
                </div>
                <DIDOperations />
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
