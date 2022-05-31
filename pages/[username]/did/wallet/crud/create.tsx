import Layout from '../../../../../components/Layout'
import { Headline, NewDoc } from '../../../../../components'
import styles from '../../../../styles.module.scss'

function Create() {
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
                    <h2 style={{ color: '#ffff32', margin: '7%' }}>
                        DID create
                    </h2>
                    <h4>
                        With this transaction, you will generate a globally
                        unique Decentralized Identifier (DID) and its DID
                        Document.
                    </h4>
                </div>
                <NewDoc typeInput="create" />
            </Layout>
        </>
    )
}

export default Create
