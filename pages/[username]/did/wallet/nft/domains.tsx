import Layout from '../../../../../components/Layout'
import { Headline, DIDDomains } from '../../../../../components'
import { useRouter } from 'next/router'
import { updateIsController } from '../../../../../src/store/controller'
import { useStore } from 'effector-react'
import { $user } from '../../../../../src/store/user'
import styles from '../../../../styles.module.scss'

function Header() {
    const Router = useRouter()
    const username = useStore($user)?.name

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline />
                    <div style={{ textAlign: 'left', paddingLeft: '2%' }}>
                        <button
                            className="button"
                            onClick={() => {
                                updateIsController(true)
                                Router.push(`/${username}/did/wallet`)
                            }}
                        >
                            <p>wallet menu</p>
                        </button>
                    </div>
                    <h2 style={{ color: '#ffff32', margin: '10%' }}>
                        DID Domains
                    </h2>
                </div>
                <DIDDomains />
            </Layout>
        </>
    )
}

export default Header
