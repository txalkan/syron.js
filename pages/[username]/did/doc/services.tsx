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
                    <h2 style={{ color: '#ffff32', margin: '10%' }}>
                        social tree
                    </h2>
                </div>
                <Services />
            </Layout>
        </>
    )
}

export default Header
