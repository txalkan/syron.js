import Layout from '../../../../components/Layout'
import { DIDDocument, Headline } from '../../../../components'
import styles from '../../../styles.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useTranslation } from 'next-i18next'

function Header() {
    const { t } = useTranslation()
    const data = []

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>
                        {t('DECENTRALIZED IDENTITY')}
                    </h2>
                    <h2 style={{ color: '#dbe4eb', marginBottom: '4%' }}>
                        {t('DOCUMENT')}
                    </h2>
                </div>
                <DIDDocument />
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
