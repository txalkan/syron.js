import Layout from '../../../../components/Layout'
import { Headline, Balances } from '../../../../components'
import { $loadingDoc } from '../../../../src/store/loading'
import { useStore } from 'effector-react'
import styles from '../../../styles.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useTranslation } from 'next-i18next'

function Header() {
    const { t } = useTranslation()
    const loadingDoc = useStore($loadingDoc)

    const data = [
        {
            name: 'wallet',
            route: '/did/wallet',
        },
    ]

    return (
        <>
            <Layout>
                {!loadingDoc && (
                    <div className={styles.headlineWrapper}>
                        <Headline data={data} />
                        <h2 className={styles.title}>{t('BALANCES')}</h2>
                    </div>
                )}
                <Balances />
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
