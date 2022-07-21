import Image from 'next/image'
import Layout from '../../../../../components/Layout'
import { NewDoc, Headline } from '../../../../../components'
import styles from '../../../../styles.module.scss'
import Warning from '../../../../../src/assets/icons/warning.svg'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

function Recover() {
    const { t } = useTranslation()
    const data = [
        {
            name: 'wallet',
            route: '/did/wallet',
        },
        {
            name: 'did operations',
            route: '/did/wallet/crud',
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
                                <p>
                                    {t(
                                        'THIS TRANSACTION IS A SPECIFIC TYPE OF DID UPDATE OPERATION THAT IS ONLY POSSIBLE AFTER A DID SOCIAL RECOVERY OPERATION.'
                                    )}
                                </p>
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
