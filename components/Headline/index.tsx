import React, { useState } from 'react'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { $resolvedInfo, updateResolvedInfo } from '../../src/store/resolvedInfo'
import {
    $loading,
    $loadingDoc,
    loadingDoc,
    updateLoadingDoc,
} from '../../src/store/loading'
import styles from './styles.module.scss'
import rightChrome from '../../src/assets/icons/arrow_right_chrome.svg'
import rightDark from '../../src/assets/icons/arrow_right_dark.svg'
import leftChrome from '../../src/assets/icons/arrow_left_chrome.svg'
import { useTranslation } from 'next-i18next'
import { $prev, updatePrev } from '../../src/store/router'
import routerHook from '../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import fetchDoc from '../../src/hooks/fetchDoc'

function Component({ data }) {
    const Router = useRouter()
    const loading = useStore($loading)
    const loadingDoc = useStore($loadingDoc)
    const prev = useStore($prev)
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { fetch } = fetchDoc()
    const path = window.location.pathname
    const isDidx = path.split('/')[2] === 'didx' && path.split('/').length === 3
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const prevName = prev?.split('/')[1]
    const prevDomain = prev?.split('/')[2]?.replace('didx', 'did')

    const goBack = () => {
        if (prev && domain !== prev?.split('/')[2]?.replace('didx', 'did')) {
            updateLoadingDoc(true)
            updateResolvedInfo({ name: prevName, domain: prevDomain })
            setTimeout(() => {
                fetch()
            }, 1000)
        }
        updatePrev(window.location.pathname)
        Router.back()
    }

    const goForward = () => {
        Router.push(prev)
        if (prev && domain !== prev?.split('/')[2]?.replace('didx', 'did')) {
            updateLoadingDoc(true)
            updateResolvedInfo({ name: prevName, domain: prevDomain })
            setTimeout(() => {
                fetch()
            }, 1000)
        }
        updatePrev(window.location.pathname)
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

    if (loading || loadingDoc) {
        return null
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.wrapperBreadcrumbs}>
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
                            {isDidx ? (
                                <span
                                    onClick={() => navigate(`/${username}`)}
                                    className={styles.txtBreadcrumbsSpan}
                                >
                                    SOCIAL TREE
                                </span>
                            ) : (
                                <span
                                    style={{
                                        color: path.includes('zil')
                                            ? '#0000FF'
                                            : '',
                                    }}
                                    onClick={() =>
                                        navigate(
                                            `/${username}/${
                                                path.includes('zil')
                                                    ? 'zil'
                                                    : 'didx'
                                            }`
                                        )
                                    }
                                    className={styles.txtNameBreadcrumbsSpan}
                                >
                                    {username}
                                    {domain !== '' &&
                                        `.${
                                            path.includes('zil')
                                                ? resolvedInfo?.domain
                                                : 'did'
                                        }`}
                                </span>
                            )}{' '}
                            {data.map((val) => (
                                <span key={val.name}>
                                    &gt;{' '}
                                    <span
                                        key={val.name}
                                        onClick={() =>
                                            navigate(`/${username}${val.route}`)
                                        }
                                        className={styles.txtBreadcrumbsSpan}
                                    >
                                        {val.name}
                                    </span>{' '}
                                </span>
                            ))}
                        </>
                    )}
                </h6>
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
