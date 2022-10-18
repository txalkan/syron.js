import { useStore } from 'effector-react'
import { $loading } from '../../../../src/store/loading'
import Layout from '../../../../components/Layout'
import { Headline, SocialRecovery } from '../../../../components'
import styles from '../../../styles.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={[]} />
                    <h2 style={{ color: '#ffff32', margin: '7%' }}>
                        {t('DID SOCIAL RECOVERY')}
                    </h2>
                </div>
                <SocialRecovery />
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
