import Layout from '../../../../../components/Layout'
import { DidSocialRecovery, Headline } from '../../../../../components'
import stylesDark from '../../../../styles.module.scss'
import stylesLight from '../../../../styleslight.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'

function Social() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
        {
            name: t('DID OPERATIONS'),
            route: '/didx/wallet/doc',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>{t('DID SOCIAL RECOVERY')}</h2>
                    <h4 className={styles.txt}>
                        {t(
                            'WITH THIS TRANSACTION, YOU WILL CONFIGURE SOCIAL RECOVERY.'
                        )}
                    </h4>
                </div>
                <DidSocialRecovery />
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

export default Social
