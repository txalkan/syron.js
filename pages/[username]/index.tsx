import Layout from '../../components/Layout'
import { Headline, Services } from '../../components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useEffect, useState } from 'react'
import styles from '../styles.module.scss'
import { useTranslation } from 'next-i18next'
import routerHook from '../../src/hooks/router'
import fetch from '../../src/hooks/fetch'

function Header() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { fetchDoc } = fetch()
    const [show, setShow] = useState(false)
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')

    const data = []

    useEffect(() => {
        const name = path.replace('/', '').split('.')[0]
        if (path.includes('.did')) {
            navigate(`${name}/didx`)
        } else if (path.includes('.')) {
            navigate(`${name}/zil`)
        } else {
            fetchDoc()
            setShow(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Layout>
                {show && (
                    <>
                        <div className={styles.headlineWrapper}>
                            <Headline data={data} />
                            <h2 className={styles.title}>{t('SOCIAL TREE')}</h2>
                        </div>
                        <Services />
                    </>
                )}
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
