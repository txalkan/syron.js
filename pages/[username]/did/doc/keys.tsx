import Layout from '../../../../components/Layout'
import { Headline, Keys } from '../../../../components'
import styles from '../../../styles.module.scss'

function Header() {
    const data = [
        {
            name: 'doc',
            route: '/did/doc',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>DID keys</h2>
                </div>
                <Keys />
            </Layout>
        </>
    )
}

export default Header
