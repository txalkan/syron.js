import Layout from '../../components/Layout'
import {
    DIDxWallet,
    Treasury,
    VerifiableCredentials,
    Defi,
} from '../../components'
import { useEffect } from 'react'
import { $loading } from '../../src/store/loading'
import { useStore } from 'effector-react'
import { $user, updateUser } from '../../src/store/user'

function Header() {
    const loading = useStore($loading)
    const user = useStore($user)
    const path = window.location.pathname.toLowerCase()
    const first = path.split('/')[1]
    const username = first.split('.')[0]

    useEffect(() => {
        let domain = 'did'
        if (first.split('.')[1] !== undefined) {
            domain = first.split('.')[1]
        }
        updateUser({
            name: username,
            domain: domain,
        })
    }, [first, username])

    return (
        <>
            <Layout>
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
                                    <DIDxWallet>
                                        <div />
                                    </DIDxWallet>
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
