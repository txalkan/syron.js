import Layout from '../../../../components/Layout'
import { Headline, DIDxWallet, CardList } from '../../../../components'
import styles from '../../../styles.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'

function Header() {
    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={[]} />
                    <h1 className={styles.title}>
                        DID<span style={{ textTransform: 'lowercase' }}>x</span>
                        Wallet
                    </h1>
                    <h3 style={{ color: '#dbe4eb', marginBottom: '4%' }}>
                        Decentralized Identifier smart contract wallet
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
