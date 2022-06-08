import Layout from '../../../components/Layout'
import {
    DIDxWallet,
    Treasury,
    VerifiableCredentials,
    Defi,
    Headline,
} from '../../../components'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { $loading } from '../../../src/store/loading'
import { useStore } from 'effector-react'
import { $user, updateUser } from '../../../src/store/user'

function Header() {
    const loading = useStore($loading)
    const user = useStore($user)
    const Router = useRouter()
    const path = window.location.pathname.toLowerCase()
    const first = path.split('/')[1]
    const username = first.split('.')[0]

    const data = [
        {
            name: 'did',
            router: '',
        },
    ]

    useEffect(() => {
        updateUser({
            name: username,
            domain: 'did',
        })
    }, [])

    return (
        <>
            <Layout>
                <div style={{ width: '100%', marginTop: '10%' }}>
                    <Headline data={data} />
                </div>
                <DIDxWallet>
                    <div />
                </DIDxWallet>
            </Layout>
        </>
    )
}

export default Header
