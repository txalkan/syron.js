import Layout from '../../../../../../components/Layout'
import { Headline, TransferNFTUsername } from '../../../../../../components'
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
        {
            name: 'manage nft',
            route: '/did/wallet/nft/manage',
        },
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

export default Header
