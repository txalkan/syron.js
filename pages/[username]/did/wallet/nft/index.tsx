import Layout from '../../../../../components/Layout'
import { Headline, NFTUsername } from '../../../../../components'
import styles from '../../../../styles.module.scss'

function Header() {
    const data = [
        {
            name: 'wallet',
            route: '/did/wallet',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>NFT Username</h2>
                    <h2 style={{ color: '#dbe4eb', marginBottom: '4%' }}>
                        operations
                    </h2>
                </div>
                <NFTUsername />
            </Layout>
        </>
    )
}

export default Header
