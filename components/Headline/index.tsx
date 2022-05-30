import React from 'react'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { $user } from '../../src/store/user'
import styles from './styles.module.scss'
import Image from 'next/image'
import backLogo from '../../src/assets/logos/left-arrow.png'

function Component({ data }) {
    const Router = useRouter()
    const username = useStore($user)?.name
    const domain = useStore($user)?.domain

    return (
        <div className={styles.wrapper}>
            <div className={styles.wrapperBreadcrumbs}>
                <h6 className={styles.txtBreadcrumbs}>
                    <span
                        onClick={() => Router.push('/')}
                        className={styles.txtBreadcrumbsSpan}
                    >
                        HOMEPAGE
                    </span>{' '}
                    {data[0]?.name !== 'did' && (
                        <>
                            &gt;{' '}
                            <span
                                onClick={() => Router.push(`/${username}`)}
                                className={styles.txtBreadcrumbsSpan}
                            >
                                {username}.{domain}
                            </span>{' '}
                            {data.map((val) => (
                                <>
                                    &gt;{' '}
                                    <span
                                        onClick={() =>
                                            Router.push(
                                                `/${username}${val.route}`
                                            )
                                        }
                                        className={styles.txtBreadcrumbsSpan}
                                    >
                                        {val.name}
                                    </span>{' '}
                                </>
                            ))}
                        </>
                    )}
                </h6>
            </div>
            {data[0]?.name !== 'did' && (
                <h1 className={styles.headline}>
                    <span style={{ textTransform: 'lowercase' }}>
                        {username}.{domain}
                    </span>{' '}
                </h1>
            )}
        </div>
    )
}

export default Component
