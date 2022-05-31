import Layout from '../../../../../components/Layout'
import { Headline, DIDDomains } from '../../../../../components'
import styles from '../../../../styles.module.scss'

function Header() {
    const data = [
        {
            name: 'wallet',
            route: '/did/wallet',
        },
        {
            name: 'nft operations',
            route: '/did/wallet/nft',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>DID Domains</h2>
                </div>
                <DIDDomains />
            </Layout>
        </>
    )
}

export default Header
