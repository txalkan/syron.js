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
                    <h2 className={styles.title}>nft management</h2>
                </div>
                <ManageNFT />
            </Layout>
        </>
    )
}

export default Header
