import Layout from '../../components/Layout'
import { Headline, Services } from '../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import styles from '../styles.module.scss'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { useRouter } from 'next/router'
import ssi_$tyronzlp from '../../src/assets/icons/ssi_$tyronzlp.ssi_60px.svg'
import ssi_DIDxSSI from '../../src/assets/icons/ssi_DIDxSSI_60px.svg'
import Image from 'next/image'
import { $net } from '../../src/store/network'

function ResolvedAddress() {
    const Router = useRouter()
    const { t } = useTranslation()
    const zcrypto = tyron.Util.default.Zcrypto()
    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const resolvedTLD = resolvedInfo?.user_tld

    let resolvedAddr
    let blockExplorer
    try {
        resolvedAddr = zcrypto.toChecksumAddress(resolvedInfo?.addr!)
        resolvedAddr = zcrypto?.toBech32Address(resolvedInfo?.addr!)
        blockExplorer = `https://viewblock.io/zilliqa/address/${resolvedAddr}?network=${net}`
    } catch (error) {
        console.log('resolvedAddress_addr:', 'ZILEVM')
        resolvedAddr = resolvedInfo?.addr
        switch (net) {
            case 'testnet':
                blockExplorer = `https://evmx-dev.zilliqa.com/address/${resolvedAddr}`
                break
            default:
                blockExplorer = `https://evmx.zilliqa.com/address/${resolvedAddr}`
                break
        }
    }
    console.log('resolvedAddress_addr:', resolvedInfo?.addr, resolvedAddr)

    const data = [
        {
            name: 'DidDomains',
            router: '',
        },
    ]

    return (
        <Layout>
            <div className={styles.headlineWrapper}>
                <Headline data={data} />
                <div className={styles.addressWrapper}>
                    {resolvedInfo && (
                        <>
                            {resolvedTLD === 'zlp' ? (
                                <Image
                                    src={ssi_$tyronzlp}
                                    alt="$tyronzlp.ssi"
                                />
                            ) : (
                                <Image src={ssi_DIDxSSI} alt="DIDx NFTs" />
                            )}
                            <div className={styles.username}>
                                <span
                                    style={{
                                        textTransform: 'none',
                                    }}
                                >
                                    {resolvedSubdomain !== '' &&
                                        `${resolvedSubdomain}@`}
                                </span>
                                {resolvedDomain}.
                                {resolvedTLD === '' ? 'ssi' : resolvedTLD}
                            </div>
                        </>
                    )}
                    {resolvedInfo?.addr ? (
                        <div>
                            <h3 className={styles.headerSubTitle}>
                                RESOLVED ADDRESS
                            </h3>
                            <a
                                className={styles.address}
                                href={blockExplorer}
                                rel="noreferrer"
                                target="_blank"
                            >
                                {
                                    resolvedAddr
                                    // ?.slice(-10)
                                }
                            </a>
                        </div>
                    ) : (
                        <div
                            onClick={() => Router.push('/')}
                            className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        >
                            NO RESOLVED INFO
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default ResolvedAddress
