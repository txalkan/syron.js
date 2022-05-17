import { useStore } from 'effector-react'
import { $loading } from '../../../src/store/loading'
import Layout from '../../../components/Layout'
import { Headline, SocialRecovery } from '../../../components'
import styles from '../../styles.module.scss'

function Header() {
    //const loading = useStore($loading);

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline />
                    <h2 style={{ color: '#ffff32', margin: '7%' }}>
                        DID social recovery
                    </h2>
                </div>
                <SocialRecovery />
            </Layout>
        </>
    )
}

export default Header
