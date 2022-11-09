import Layout from '../../../../../../components/Layout'
import { Headline, TransferNFTUsername } from '../../../../../../components'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import stylesDark from '../../../../styles.module.scss'
import stylesLight from '../../../../styleslight.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'

function Header() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
        {
            name: t('NFT OPERATIONS'),
            route: '/didx/wallet/dns',
        },
        // {
        //     name: t('MANAGE NFT'),
        //     route: '/didx/wallet/dns/manage',
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
