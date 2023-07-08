import * as tyron from 'tyron'
import Layout from '../../components/Layout'
import { Headline, Services } from '../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import stylesDark from '../styles.module.scss'
import stylesLight from '../styleslight.module.scss'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { updateModalNewSsi } from '../../src/store/modal'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import toastTheme from '../../src/hooks/toastTheme'
import { $net } from '../../src/store/network'

function Address() {
    const { t } = useTranslation()
    const Router = useRouter()
    const net = $net.state.net as 'mainnet' | 'testnet'

    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const zcrypto = tyron.Util.default.Zcrypto()
    let DIDxWALLET
    try {
        DIDxWALLET = zcrypto.toBech32Address(loginInfo.loggedInAddress)
    } catch (error) {
        toast.warn(`${error}.`, {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: toastTheme(isLight),
        })
    }

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
                {loginInfo.loggedInAddress !== null && (
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
                                href={`https://viewblock.io/zilliqa/address/${DIDxWALLET}?network=${net}`}
                                rel="noreferrer"
                                target="_blank"
                            >
                                {DIDxWALLET}
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
