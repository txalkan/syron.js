import Layout from '../../../../components/Layout'
import { Headline, Services } from '../../../../components'
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
                    <h2
                        style={{ textAlign: 'left', marginLeft: '5%' }}
                        className={styles.title}
                    >
                        DID social tree
                    </h2>
                </div>
                <Services />
            </Layout>
        </>
    )
}

export default Header
