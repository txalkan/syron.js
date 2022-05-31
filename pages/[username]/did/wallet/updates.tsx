import Layout from '../../../../components/Layout'
import { Headline, Updates } from '../../../../components'
import styles from '../../../styles.module.scss'

function Header() {
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
                    <h2 className={styles.title}>Updates</h2>
                </div>
                <Updates />
            </Layout>
        </>
    )
}

export default Header
