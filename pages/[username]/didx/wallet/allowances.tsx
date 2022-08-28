import Layout from '../../../../components/Layout'
import { Headline, Allowances } from '../../../../components'
import styles from '../../../styles.module.scss'
import { useTranslation } from 'next-i18next'

function Header() {
    const { t } = useTranslation()
    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>Allowances</h2>
                </div>
                <Allowances />
            </Layout>
        </>
    )
}

export default Header
