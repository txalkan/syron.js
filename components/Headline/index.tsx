import React from 'react'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { $user } from '../../src/store/user'
import { $loading } from '../../src/store/loading'
import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'

function Component({ data }) {
    const Router = useRouter()
    const username = useStore($user)?.name
    const domain = useStore($user)?.domain
    const loading = useStore($loading)
    const { t } = useTranslation()

    return (
        <div className={styles.wrapper}>
            <div className={styles.wrapperBreadcrumbs}>
                {!loading && (
                    <h6 className={styles.txtBreadcrumbs}>
                        <span
                            onClick={() => Router.push('/')}
                            className={styles.txtBreadcrumbsSpan}
                        >
                            {t('HOMEPAGE')}
                        </span>{' '}
                        {data[0]?.name !== 'did' && (
                            <>
                                &gt;{' '}
                                <span
                                    onClick={() =>
                                        Router.push(`/${username}/did`)
                                    }
                                    className={styles.txtNameBreadcrumbsSpan}
                                >
                                    {username}
                                    {domain !== '' && `.${domain}`}
                                </span>{' '}
                                {data.map((val) => (
                                    <span key={val.name}>
                                        &gt;{' '}
                                        <span
                                            key={val.name}
                                            onClick={() =>
                                                Router.push(
                                                    `/${username}${val.route}`
                                                )
                                            }
                                            className={
                                                styles.txtBreadcrumbsSpan
                                            }
                                        >
                                            {val.name}
                                        </span>{' '}
                                    </span>
                                ))}
                            </>
                        )}
                    </h6>
                )}
            </div>
        </div>
    )
}

export default Component
