import Layout from '../components/Layout'
import { Headline, XPoints } from '../components'

function Component() {
    const data = [
        {
            name: 'did',
            router: '',
        },
    ]

    return (
        <>
            <Layout>
                <div
                    style={{
                        width: '100%',
                        marginTop: '10%',
                        marginBottom: '-10%',
                    }}
                >
                    <Headline data={data} />
                </div>
                <XPoints />
            </Layout>
        </>
    )
}

export default Component
