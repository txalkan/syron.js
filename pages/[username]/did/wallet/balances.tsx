import Layout from '../../../../components/Layout'
import { Headline, Balances } from '../../../../components'
import { $loadingDoc } from '../../../../src/store/loading'
import { useStore } from 'effector-react'
import styles from '../../../styles.module.scss'

function Header() {
    const loadingDoc = useStore($loadingDoc)

    const data = [
        {
            name: 'wallet',
            route: '/did/wallet',
        },
    ]

    return (
        <>
            <Layout>
                {!loadingDoc && (
                    <div className={styles.headlineWrapper}>
                        <Headline data={data} />
                        <h2 style={{ color: '#ffff32', margin: '10%' }}>
                            balances
                        </h2>
                    </div>
                )}
                <Balances />
            </Layout>
        </>
    )
}

export default Header
