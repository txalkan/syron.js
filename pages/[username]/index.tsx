import Layout from '../../components/Layout'
import {
    Treasury,
    VerifiableCredentials,
    Defi,
    Headline,
} from '../../components'
import { $loading } from '../../src/store/loading'
import { useStore } from 'effector-react'
import { $user } from '../../src/store/user'

function Header() {
    const loading = useStore($loading)
    const user = useStore($user)
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')
    const first = path.split('/')[1]
    const username = first.split('.')[0]

    const data = [
        {
            name: 'did',
            router: '',
        },
    ]

    return (
        <>
            <Layout>
                <div style={{ width: '100%', marginTop: '10%' }}>
                    <Headline data={data} />
                </div>
                {!loading ? (
                    <>
                        {user?.name !== '' ? (
                            <>
                                {user?.domain === 'defi' ? (
                                    <Defi />
                                ) : user?.domain === 'vc' ? (
                                    <VerifiableCredentials />
                                ) : user?.domain === 'treasury' ? (
                                    <Treasury />
                                ) : username === 'getstarted' ? (
                                    <div />
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <></>
                        )}
                    </>
                ) : (
                    <></>
                )}
            </Layout>
        </>
    )
}

export default Header
