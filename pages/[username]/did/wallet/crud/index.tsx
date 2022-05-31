import Layout from '../../../../../components/Layout'
import { Headline, DIDOperations } from '../../../../../components'
import styles from '../../../../styles.module.scss'

function Index() {
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
                    <h2 className={styles.title}>Decentralized Identifier</h2>
                    <h2 style={{ color: '#dbe4eb', marginBottom: '4%' }}>
                        operations
                    </h2>
                </div>
                <DIDOperations />
            </Layout>
        </>
    )
}

export default Index
