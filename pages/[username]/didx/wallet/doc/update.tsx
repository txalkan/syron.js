import Layout from '../../../../../components/Layout'
import { DidUpdate, Headline } from '../../../../../components'
import styles from '../../../../styles.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

function Create() {
    const { t } = useTranslation()
    const data = [
        {
            name: 'wallet',
            route: '/didx/wallet',
        },
        {
            name: 'did operations',
            route: '/didx/wallet/doc',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>{t('DID UPDATE')}</h2>
                    <h4>
                        {t(
                            'WITH THIS TRANSACTION, YOU WILL UPLOAD A BRAND NEW DID DOCUMENT'
                        )}
                    </h4>
                </div>
                <DidUpdate />
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

export default Create
