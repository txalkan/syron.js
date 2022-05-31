import Layout from '../../../../components/Layout'
import { DIDDocument, Headline } from '../../../../components'
import styles from '../../../styles.module.scss'

function Header() {
    const data = []

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>Decentralized Identifier</h2>
                    <h2 style={{ color: '#dbe4eb', marginBottom: '4%' }}>
                        document
                    </h2>
                </div>
                <DIDDocument />
            </Layout>
        </>
    )
}

export default Header
