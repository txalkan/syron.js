import Layout from '../../../../../../../components/Layout'
import { Headline, TransferNFTUsername } from '../../../../../../../components'
import styles from '../../../../../../styles.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

function Header() {
    const { t } = useTranslation()
    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
        {
            name: 'NFT',
            route: '/didx/wallet/nft',
        },
        {
            name: 'DNS',
            route: '/didx/wallet/nft/dns',
        },
        // {
        //     name: t('MANAGE NFT'),
        //     route: '/didx/wallet/nft/dns/manage',
        // },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                </div>
                <TransferNFTUsername />
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
