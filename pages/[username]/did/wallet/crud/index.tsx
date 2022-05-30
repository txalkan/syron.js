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
                    <h2 style={{ color: '#ffff32', margin: '7%' }}>
                        DID operations
                    </h2>
                </div>
                <DIDOperations />
            </Layout>
        </>
    )
}

export default Index
