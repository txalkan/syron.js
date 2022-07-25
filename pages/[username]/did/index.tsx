import Layout from '../../../components/Layout'
import {
    Treasury,
    VerifiableCredentials,
    Defi,
    Headline,
    Services,
} from '../../../components'
import { $user, updateUser } from '../../../src/store/user'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths } from 'next/types'
import { useEffect } from 'react'
import styles from '../../styles.module.scss'
import { useTranslation } from 'next-i18next'

function Header() {
    const { t } = useTranslation()
    const path = window.location.pathname
        .toLowerCase()
        .replace('/es', '')
        .replace('/cn', '')
        .replace('/id', '')
        .replace('/ru', '')
    const first = path.split('/')[1]
    const username = first.split('.')[0]

    const data = []

    useEffect(() => {
        updateUser({
            name: username,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>{t('SOCIAL TREE')}</h2>
                </div>
                <Services />
                {/* {!loading ? (
                    <>
                        {user?.name !== '' ? (
                            <>
                                {user?.domain === 'defi' ? (
                                    <Defi />
                                ) : user?.domain === 'vc' ? (
                                    <VerifiableCredentials />
                                ) : user?.domain === 'treasury' ? (
                                    <Treasury />
                                ) : username === 'getstarted' ? (
                                    <div />
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <></>
                        )}
                    </>
                ) : (
                    <></>
                )} */}
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
