import Layout from '../../../components/Layout'
import stylesDark from '../../styles.module.scss'
import stylesLight from '../../styleslight.module.scss'
import {
    Account,
    DIDxWallet,
    Headline,
    Services,
    SocialTree,
} from '../../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import Tydra from '../../../components/SSI/Tydra'

function Header() {
    const [loadingTydra_, setLoadingTydra_] = useState(true)
    const data = []
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const resolvedTLD = resolvedInfo?.user_tld
    const styles = isLight ? stylesLight : stylesDark

    // useEffect(() => {
    //     setTimeout(() => {
    //         setLoadingTydra_(false)
    //     }, 2000)
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])
    const subdomain_length = resolvedSubdomain!.length
    const full_length = subdomain_length + resolvedDomain!.length
    let break_ = false
    if (resolvedSubdomain && (subdomain_length > 7 || full_length > 10)) {
        break_ = true
    }
    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    {/* {!loadingTydra_ && ( */}
                    <>
                        <Headline data={data} />
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                width: '100%',
                                marginTop: '40px',
                            }}
                        >
                            <h1>
                                <div className={styles.username}>
                                    {resolvedSubdomain &&
                                        resolvedSubdomain !== '' &&
                                        `${resolvedSubdomain}@`}
                                    {break_ && (
                                        <div className={styles.usernameMobile}>
                                            <br />
                                        </div>
                                    )}
                                    {resolvedDomain}
                                    {resolvedDomain!?.length > 7 && (
                                        <div className={styles.usernameMobile}>
                                            <br />
                                        </div>
                                    )}
                                    .{resolvedTLD === '' ? 'ssi' : resolvedTLD}
                                </div>
                            </h1>
                        </div>
                    </>
                    {/* )} */}
                </div>
                <div style={{ marginBottom: '4%' }}>
                    <Tydra type="account" />
                </div>
                <SocialTree />
                <Account />
                <DIDxWallet>
                    <div />
                </DIDxWallet>
            </Layout>
        </>
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
