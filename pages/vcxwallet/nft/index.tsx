import Layout from '../../../components/Layout'
import { Headline, VerifiableCredentials } from '../../../components'
import styles from '../../styles.module.scss'

function Header() {
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                <Headline data={data} />
                <VerifiableCredentials />
            </div>
        </Layout>
    )
}

export default Header
