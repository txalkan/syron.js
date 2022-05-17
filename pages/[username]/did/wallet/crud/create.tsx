import Layout from '../../../../../components/Layout'
import { Headline, NewDoc } from '../../../../../components'
import { useRouter } from 'next/router'
import { updateIsController } from '../../../../../src/store/controller'
import { useStore } from 'effector-react'
import { $user } from '../../../../../src/store/user'
import styles from '../../../../styles.module.scss'

function Create() {
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
                                Router.push(`/${username}/did/wallet/crud`)
                            }}
                        >
                            <p style={{ color: 'silver' }}>operations menu</p>
                        </button>
                    </div>
                    <h2 style={{ color: '#ffff32', margin: '7%' }}>
                        DID create
                    </h2>
                    <h4>
                        With this transaction, you will generate a globally
                        unique Decentralized Identifier (DID) and its DID
                        Document.
                    </h4>
                </div>
                <NewDoc typeInput="create" />
            </Layout>
        </>
    )
}

export default Create
