import React, { useState } from 'react'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { $loading } from '../../src/store/loading'
import styles from './styles.module.scss'
import rightChrome from '../../src/assets/icons/arrow_right_chrome.svg'
import rightDark from '../../src/assets/icons/arrow_right_dark.svg'
import leftChrome from '../../src/assets/icons/arrow_left_chrome.svg'
import { useTranslation } from 'next-i18next'
import { $prev, updatePrev } from '../../src/store/router'
import routerHook from '../../src/hooks/router'
import fetchDoc from '../../src/hooks/fetchDoc'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

function Component({ data }) {
    const Router = useRouter()
    const loading = useStore($loading)
    const prev = useStore($prev)
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const path = window.location.pathname
    const { fetch } = fetchDoc()
    const resolvedInfo = useSelector(
        (state: RootState) => state.modal.resolvedInfo
    )
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain

    const goBack = () => {
        updatePrev(window.location.pathname)
        fetch()
        alert(resolvedInfo.name)
        alert(resolvedInfo.domain)
        alert(resolvedInfo.addr)
        Router.back()
    }

    const goForward = () => {
        fetch()
        alert(resolvedInfo.name)
        alert(resolvedInfo.domain)
        alert(resolvedInfo.addr)
        Router.push(prev)
    }

    const possibleForward = () => {
        const prevLength = prev?.split('/').length
        const pathLength = path.split('/').length
        if (prevLength > pathLength) {
            return true
        } else if (prevLength === pathLength && prev !== path) {
            return true
        } else {
            return false
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.wrapperBreadcrumbs}>
                {!loading && (
                    <h6 className={styles.txtBreadcrumbs}>
                        <span
                            onClick={() => {
                                Router.push('/')
                                updatePrev('/')
                            }}
                            className={styles.txtBreadcrumbsSpan}
                        >
                            {t('HOMEPAGE')}
                        </span>{' '}
                        {data[0]?.name !== 'DidDomains' && (
                            <>
                                &gt;{' '}
                                <span
                                    onClick={() =>
                                        navigate(
                                            `/${username}/${path.includes('zil')
                                                ? 'zil'
                                                : 'did'
                                            }`
                                        )
                                    }
                                    className={styles.txtNameBreadcrumbsSpan}
                                >
                                    {username}
                                    {domain !== '' &&
                                        `.${path.includes('zil') ? 'zil' : 'did'
                                        }`}
                                </span>{' '}
                                {data.map((val) => (
                                    <span key={val.name}>
                                        &gt;{' '}
                                        <span
                                            key={val.name}
                                            onClick={() =>
                                                navigate(
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
                <div style={{ display: 'flex' }}>
                    <div onClick={goBack} style={{ cursor: 'pointer' }}>
                        <Image src={leftChrome} alt="arrow" />
                    </div>
                    &nbsp;&nbsp;
                    {possibleForward() ? (
                        <div onClick={goForward} style={{ cursor: 'pointer' }}>
                            <Image src={rightChrome} alt="arrow" />
                        </div>
                    ) : (
                        <div>
                            <Image src={rightDark} alt="arrow" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Component
