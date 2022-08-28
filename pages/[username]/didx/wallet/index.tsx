import Layout from '../../../../components/Layout'
import { Headline, DIDxWallet, CardList } from '../../../../components'
import stylesDark from '../../../styles.module.scss'
import stylesLight from '../../../styleslight.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'

function Header() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={[]} />
                    <h1 className={styles.title}>
                        DID<span style={{ textTransform: 'lowercase' }}>x</span>
                        Wallet
                    </h1>
                    <h3 className={styles.subtitle}>
                        {t('DECENTRALIZED IDENTIFIER WEB3 WALLET')}
                    </h3>
                </div>
                <CardList />
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
