import Layout from '../../../../components/Layout'
import { Headline } from '../../../../components'
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
                    <h2 style={{ color: '#ffff32', margin: '10%' }}>Upgrade</h2>
                </div>
                {/* <Upgrade /> */}
                <h4>Coming soon</h4>
            </Layout>
        </>
    )
}

export default Header
