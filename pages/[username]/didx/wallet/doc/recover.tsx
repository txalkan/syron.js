import Image from 'next/image'
import Layout from '../../../../../components/Layout'
import { NewDoc, Headline } from '../../../../../components'
import styles from '../../../../styles.module.scss'
import WarningReg from '../../../../../src/assets/icons/warning.svg'
import WarningPurple from '../../../../../src/assets/icons/warning_purple.svg'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'

function Recover() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const Warning = isLight ? WarningPurple : WarningReg
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
                    <h2 className={styles.title}>{t('DID UPDATE')}</h2>
                    <h4>
                        {t(
                            'WITH THIS TRANSACTION, YOU WILL UPDATE YOUR DID DOCUMENT'
                        )}
                        <span className={styles.tooltip}>
                            <Image
                                alt="warning-ico"
                                src={Warning}
                                width={20}
                                height={20}
                            />
                            <span className={styles.tooltiptext}>
                                <h5 className={styles.modalInfoTitle}>
                                    {t('INFO')}
                                </h5>
                                <div>
                                    {t(
                                        'THIS TRANSACTION IS A SPECIFIC TYPE OF DID UPDATE OPERATION THAT IS ONLY POSSIBLE AFTER A SOCIAL RECOVERY OPERATION.'
                                    )}
                                </div>
                            </span>
                        </span>
                    </h4>
                </div>
                <NewDoc typeInput="recover" />
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

export default Recover
