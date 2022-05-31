import Layout from '../../../../../../components/Layout'
import { Headline } from '../../../../../../components'
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
                    <h2 className={styles.title}>update nft did</h2>
                </div>
                {/* <UpdateNftDid /> */}
                <h4>Coming soon</h4>
            </Layout>
        </>
    )
}

export default Header
