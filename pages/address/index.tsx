import Layout from '../../components/Layout'
import { Headline, Services } from '../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import styles from '../styles.module.scss'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { updateModalNewSsi } from '../../src/store/modal'

function Address() {
    const { t } = useTranslation()
    const loginInfo = useSelector((state: RootState) => state.modal)

    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                <Headline data={data} />
                <div>
                    <h2 className={styles.title}>{t('ADDRESS')}</h2>
                    <div style={{ color: '#ffff32', marginBottom: '50px' }}>
                        {loginInfo.address}
                    </div>
                    <div
                        onClick={() => updateModalNewSsi(true)}
                        className="button"
                    >
                        {t('BUY NFT USERNAME')}
                    </div>
                </div>
                <h2 className={styles.title}>{t('SOCIAL TREE')}</h2>
            </div>
            <Services />
        </Layout>
    )
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default Address
