import Layout from '../../../components/Layout'
import stylesDark from '../../styles.module.scss'
import stylesLight from '../../styleslight.module.scss'
import { DIDxWallet, Headline } from '../../../components'
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
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const styles = isLight ? stylesLight : stylesDark

    useEffect(() => {
        setTimeout(() => {
            setLoadingTydra_(false)
        }, 2000)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Layout>
                <div style={{ width: '100%', marginTop: '10%' }}>
                    {!loadingTydra_ && <Headline data={data} />}
                </div>
                {
                    !loadingTydra_ && (
                        <h1>
                            <div className={styles.username}>
                                <span
                                    style={{
                                        textTransform: 'none',
                                    }}
                                >
                                    {domain !== '' &&
                                        domain !== 'did' &&
                                        `${domain}@`}
                                </span>
                                {username!?.length > 12 && (
                                    <div
                                        className={
                                            styles.usernameMobile
                                        }
                                    >
                                        <br />
                                    </div>
                                )}
                                <span
                                    style={{
                                        textTransform:
                                            'uppercase',
                                    }}
                                >
                                    {username}
                                </span>
                                {username!?.length > 12 && (
                                    <div
                                        className={
                                            styles.usernameMobile
                                        }
                                    >
                                        <br />
                                    </div>
                                )}
                                <span
                                    style={{
                                        textTransform:
                                            'uppercase',
                                    }}
                                >
                                    .
                                    {domain === 'did'
                                        ? 'did'
                                        : 'ssi'}
                                </span>
                            </div>
                        </h1>
                    )
                }
                <div style={{ marginTop: '2%', marginBottom: '10%' }}>
                    <Tydra type="account" />
                </div>
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
