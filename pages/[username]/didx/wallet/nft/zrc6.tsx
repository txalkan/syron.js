import * as tyron from 'tyron'
import Layout from '../../../../../components/Layout'
import { Headline, Spinner, ZRC6 } from '../../../../../components'
import stylesDark from '../../../../styles.module.scss'
import stylesLight from '../../../../styleslight.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import smartContract from '../../../../../src/utils/smartContract'
import { useEffect, useState } from 'react'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { $net } from '../../../../../src/store/network'
import { useStore } from 'react-stores'

function Header() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const [isLoading, setIsLoading] = useState(true)
    const [isToT, setIsToT] = useState('')
    const net = $net.state.net as 'mainnet' | 'testnet'

    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedAddr = resolvedInfo?.addr?.toLowerCase()

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
        {
            name: 'NFT',
            route: '/didx/wallet/nft',
        },
    ]

    useEffect(() => {
        async function isTydra(isTriple: Boolean) {
            try {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'did',
                    'init'
                )
                const get_state = await getSmartContract(init_addr, 'balances')
                const state: Array<string> = get_state!.result.balances
                const state_map = await tyron.SmartUtil.default.intoMap(state)

                //@tydras-gate
                const nawelitos = state_map.get('nawelitoonfire')
                const merxeks = state_map.get('merxek')
                const nessies = state_map.get('nessy')

                const nawelito_map =
                    await tyron.SmartUtil.default.intoMap(nawelitos)
                const merxek_map =
                    await tyron.SmartUtil.default.intoMap(merxeks)
                const nessy_map = await tyron.SmartUtil.default.intoMap(nessies)

                let condition
                if (isTriple) {
                    condition =
                        (nawelito_map.get(zilpay_addr) ||
                            nawelito_map.get(resolvedAddr!)) &&
                        (merxek_map.get(zilpay_addr) ||
                            merxek_map.get(resolvedAddr!)) &&
                        (nessy_map.get(zilpay_addr) ||
                            nessy_map.get(resolvedAddr!))
                } else {
                    condition =
                        nawelito_map.get(zilpay_addr) ||
                        nawelito_map.get(resolvedAddr!) ||
                        merxek_map.get(zilpay_addr) ||
                        merxek_map.get(resolvedAddr!) ||
                        nessy_map.get(zilpay_addr) ||
                        nessy_map.get(resolvedAddr!)
                }
                if (condition) {
                    setIsToT('ToT')
                    setIsLoading(false)
                } else {
                    setIsLoading(false)
                }
            } catch (error) {
                setIsLoading(false)
            }
        }
        isTydra(false)
    }, [])

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    {/* <h2 style={{ color: '#dbe4eb', marginBottom: '4%' }}>
                        {t('OPERATIONS')}
                    </h2> */}
                </div>
                {isLoading ? <Spinner /> : <ZRC6 type={isToT} />}
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
