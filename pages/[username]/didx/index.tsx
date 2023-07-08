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
                                    <span
                                        style={{
                                            textTransform: 'none',
                                        }}
                                    >
                                        {resolvedSubdomain !== '' &&
                                            `${resolvedSubdomain}@`}
                                    </span>
                                    {resolvedSubdomain!?.length > 7 && (
                                        <div className={styles.usernameMobile}>
                                            <br />
                                        </div>
                                    )}
                                    <span
                                        style={{
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {resolvedDomain}
                                    </span>
                                    {resolvedDomain!?.length > 7 && (
                                        <div className={styles.usernameMobile}>
                                            <br />
                                        </div>
                                    )}
                                    <span
                                        style={{
                                            textTransform: 'lowercase',
                                        }}
                                    >
                                        .
                                        {resolvedTLD === ''
                                            ? 'ssi'
                                            : resolvedTLD}
                                    </span>
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
