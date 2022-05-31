import Layout from '../../../../components/Layout'
import { Headline, Allowances } from '../../../../components'
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
                    <h2 className={styles.title}>Allowances</h2>
                </div>
                <Allowances />
            </Layout>
        </>
    )
}

export default Header
