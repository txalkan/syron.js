import Layout from '../../components/Layout'
import { Airdrop, Headline } from '../../components'

function Page() {
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]
    return (
        <Layout>
            <div
                style={{ width: '100%', marginTop: '7%', textAlign: 'center' }}
            >
                <Headline data={data} />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Airdrop />
                </div>
            </div>
        </Layout>
    )
}

export default Page
