import { useStore } from 'effector-react'
import { $loading } from '../../src/store/loading'
import Layout from '../../components/Layout'
import { Headline, P2P } from '../../components'
import styles from '../styles.module.scss'

function Header() {
    const loading = useStore($loading)

    return (
        <>
            <Layout>
                {!loading && (
                    <>
                        <div className={styles.headlineWrapper}>
                            <Headline data={[]} />
                        </div>
                        <P2P />
                    </>
                )}
            </Layout>
        </>
    )
}

export default Header
