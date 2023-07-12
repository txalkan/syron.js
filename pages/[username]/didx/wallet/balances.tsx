import Layout from '../../../../components/Layout'
import { Headline, Balances } from '../../../../components'
import { $loadingDoc } from '../../../../src/store/loading'
import { useStore } from 'effector-react'
import stylesDark from '../../../styles.module.scss'
import stylesLight from '../../../styleslight.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useTranslation } from 'next-i18next'
import {
    $modalInvestor,
    $modalWithdrawal,
} from '../../../../src/store/modal'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'

function Header() {
    const { t } = useTranslation()
    const loadingDoc = useStore($loadingDoc)
    const modalWithdrawal = useStore($modalWithdrawal)
    const modalInvestor = useStore($modalInvestor)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
    ]

    return (
        <>
            <Layout>
                {!loadingDoc &&
                    !modalWithdrawal &&
                    !modalInvestor && (
                        <div className={styles.headlineWrapper}>
                            <Headline data={data} />
                        </div>
                    )}
                <Balances />
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
