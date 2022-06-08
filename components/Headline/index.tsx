import React from 'react'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { $user } from '../../src/store/user'
import styles from './styles.module.scss'

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
                                className={styles.txtNameBreadcrumbsSpan}
                            >
                                {username}.{domain}
                            </span>{' '}
                            {data.map((val) => (
                                <div key={val.name}>
                                    &gt;{' '}
                                    <span
                                        key={val.name}
                                        onClick={() =>
                                            Router.push(
                                                `/${username}${val.route}`
                                            )
                                        }
                                        className={styles.txtBreadcrumbsSpan}
                                    >
                                        {val.name}
                                    </span>{' '}
                                </div>
                            ))}
                        </>
                    )}
                </h6>
            </div>
        </div>
    )
}

export default Component
