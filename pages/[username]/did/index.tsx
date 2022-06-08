import Layout from '../../../components/Layout'
import { DIDxWallet, Headline } from '../../../components'
import { useEffect } from 'react'
import { updateUser } from '../../../src/store/user'

function Header() {
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
