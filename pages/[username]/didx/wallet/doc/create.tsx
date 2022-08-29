import Layout from '../../../../../components/Layout'
import { Headline, NewDoc } from '../../../../../components'
import styles from '../../../../styles.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

function Create() {
    const { t } = useTranslation()
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
                    <h2 style={{ color: '#ffff32', margin: '7%' }}>
                        DID create
                    </h2>
                    <h4>
                        With this transaction, you will generate a globally
                        unique Decentralized Identifier (DID) and its DID
                        Document.
                    </h4>
                </div>
                <NewDoc typeInput="create" />
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

export default Create
