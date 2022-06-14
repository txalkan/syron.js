import Layout from '../../../../../components/Layout'
import { DidUpdate, Headline } from '../../../../../components'
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
                    <div className={styles.headlineUpdate}>
                        <h2 className={styles.title}>DID update</h2>
                        <h4>
                            With this transaction, you will update your DID
                            Document.
                        </h4>
                    </div>
                </div>
                <DidUpdate />
            </Layout>
        </>
    )
}

export default Create
