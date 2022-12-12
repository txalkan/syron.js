import Layout from '../../components/Layout'
import { Headline, Services } from '../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import stylesDark from '../styles.module.scss'
import stylesLight from '../styleslight.module.scss'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { updateModalNewSsi } from '../../src/store/modal'
import { Router, useRouter } from 'next/router'

function Address() {
    const { t } = useTranslation()
    const Router = useRouter()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    return (
        <Layout>
            <div
                style={{ width: '100%', marginTop: '7%', textAlign: 'center' }}
            >
                <Headline data={data} />
                {loginInfo.address !== null && (
                    <div className={styles.addressWrapper}>
                        <div style={{ marginBottom: '4%' }}>
                            <div
                                style={{ marginBottom: '5%' }}
                                className={styles.titleAddress}
                            >
                                {t('YOUR_W3C_DID')}
                            </div>
                            <a
                                className={styles.address}
                                href={`https://v2.viewblock.io/zilliqa/address/${loginInfo.address}?network=${net}`}
                                rel="noreferrer"
                                target="_blank"
                            >
                                did:tyron:zil...{loginInfo.address.slice(-10)}
                            </a>
                        </div>
                        <div
                            onClick={() => {
                                Router.push('/')
                                updateModalNewSsi(true)
                            }}
                            className={
                                isLight ? 'shortcutBtnLight' : 'shortcutBtn'
                            }
                        >
                            {t('MINT DNS')}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default Address
