import Layout from '../../../../../../components/Layout'
import { Headline, ManageNFT } from '../../../../../../components'
import styles from '../../../../../styles.module.scss'

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
                    <h2 style={{ color: '#ffff32', margin: '10%' }}>
                        DID Domains
                    </h2>
                </div>
                <ManageNFT />
            </Layout>
        </>
    )
}

export default Header
