import Layout from '../../../../components/Layout'
import { Headline, SocialRecover } from '../../../../components'
import stylesDark from '../../../styles.module.scss'
import stylesLight from '../../../styleslight.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'

function Component() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const data = [
        {
            name: 'SOCIAL RECOVERY',
            route: '/didx/recovery',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.txtYellow} style={{ margin: '7%' }}>
                        {t('SOCIAL RECOVERY')}
                    </h2>
                </div>
                <SocialRecover />
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
