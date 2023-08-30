import Layout from '../../../components/Layout'
import stylesDark from '../../styles.module.scss'
import stylesLight from '../../styleslight.module.scss'
import {
    Account,
    DIDxWallet,
    DomainName,
    Headline,
    Social,
} from '../../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import Tydra from '../../../components/SSI/Tydra'
import React from 'react'
import { useStore } from 'react-stores'
import { $wallet } from '../../../src/store/wallet'
import fetch from '../../../src/hooks/fetch'

function Header() {
    //@review: loading tydra
    // const [loadingTydra_, setLoadingTydra_] = useState(true)
    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    // useEffect(() => {
    //     setTimeout(() => {
    //         setLoadingTydra_(false)
    //     }, 2000)
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    const wallet = useStore($wallet)
    const { resolveUser } = fetch()
    React.useEffect(() => {
        console.log('/didx: wallet updated')
        resolveUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet])
    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                {/* {!loadingTydra_ && ( */}
                <Headline data={data} />
                <DomainName />
                {/* )} */}
                <div style={{ marginBottom: '3%' }}>
                    <Tydra type="account" />
                </div>
            </div>
            <Social />
            <Account />
            <DIDxWallet>
                <div />
            </DIDxWallet>
        </Layout>
    )
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default Header
