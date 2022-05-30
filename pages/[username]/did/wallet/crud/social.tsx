import Layout from '../../../../../components/Layout'
import { DidSocialRecovery, Headline } from '../../../../../components'
import styles from '../../../../styles.module.scss'

function Social() {
    const data = [
        {
            name: 'wallet',
            route: '/did/wallet',
        },
        {
            name: 'did operations',
            route: '/did/wallet/crud',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 style={{ color: '#ffff32', margin: '10%' }}>
                        DID social recovery
                    </h2>
                    <h4>
                        With this transaction, you will configure Social
                        Recovery.
                    </h4>
                </div>
                <DidSocialRecovery />
            </Layout>
        </>
    )
}

export default Social
