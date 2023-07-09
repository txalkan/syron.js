import React, { useState } from 'react'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import {
    $loading,
    $loadingDoc,
    updateLoadingBreadcrumbs,
} from '../../src/store/loading'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import rightChrome from '../../src/assets/icons/arrow_right_chrome.svg'
import rightDarkReg from '../../src/assets/icons/arrow_right_dark.svg'
import rightDarkLight from '../../src/assets/icons/arrow_right_dark_light.svg'
import leftChrome from '../../src/assets/icons/arrow_left_chrome.svg'
import { useTranslation } from 'next-i18next'
import { $prev, updatePrev } from '../../src/store/router'
import routerHook from '../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { $modalTxMinimized, updateShowSearchBar } from '../../src/store/modal'
import isZil from '../../src/hooks/isZil'
import ThreeDots from '../Spinner/ThreeDots'

function Component({ data }) {
    const Router = useRouter()
    const loading = useStore($loading)
    const loadingDoc = useStore($loadingDoc)
    const prev = useStore($prev)
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const path = window.location.pathname
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const subdomainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''
    const resolvedTLD =
        resolvedInfo?.user_tld! && resolvedInfo.user_tld
            ? resolvedInfo.user_tld
            : ''

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const rightDark = isLight ? rightDarkLight : rightDarkReg
    const [loadingHeadline, setLoadingHeadline] = useState(false)

    const replaceLangPath = () => {
        return path
            .replace('/es', '')
            .replace('/cn', '')
            .replace('/id', '')
            .replace('/ru', '')
    }

    //@review: use
    const isDidx =
        replaceLangPath().split('/')[2] === 'didx' &&
        replaceLangPath().split('/').length === 3

    const isSocialTree = replaceLangPath().split('/').length === 2

    const goBack = () => {
        updatePrev(window.location.pathname)
        updateLoadingBreadcrumbs(true)
        Router.back()
        setLoadingHeadline(true)
        setTimeout(() => {
            setLoadingHeadline(false)
        }, 1000)
    }

    const goForward = () => {
        updateLoadingBreadcrumbs(true)
        Router.push(prev)
        setLoadingHeadline(true)
        setTimeout(() => {
            setLoadingHeadline(false)
        }, 1000)
    }

    const possibleForward = () => {
        const prevLength = prev?.split('/').length
        const pathLength = path.split('/').length
        if (prev === '/') {
            return false
        } else if (prevLength > pathLength) {
            return true
        } else if (prevLength === pathLength && prev !== path) {
            return true
        } else {
            return false
        }
    }

    const isZil_ = isZil(resolvedInfo?.version)
    const isSbt = replaceLangPath().replace('/', '').includes('/sbt')
    const isAirx = replaceLangPath().replace('/', '').includes('/airx')

    if (loading || loadingDoc) {
        return null
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.wrapperBreadcrumbs}>
                {loadingHeadline ? (
                    <ThreeDots color="basic" />
                ) : (
                    <>
                        <h6 className={styles.txtBreadcrumbs}>
                            <span
                                onClick={() => {
                                    Router.push('/')
                                    updatePrev('/')
                                    setLoadingHeadline(true)
                                    setTimeout(() => {
                                        setLoadingHeadline(false)
                                    }, 1000)
                                }}
                                className={styles.txtBreadcrumbsSpan}
                            >
                                {t('HOMEPAGE')}
                            </span>{' '}
                            <span>
                                {data[0]?.name !== 'DidDomains' && (
                                    <>
                                        {!isSocialTree && (
                                            <>
                                                |{' '}
                                                {
                                                    /*isDidx ? (
                                            <span
                                                onClick={() => {
                                                    navigate(
                                                        `/${domainNavigate}${resolvedDomain}`
                                                    )
                                                    setLoadingHeadline(true)
                                                    setTimeout(() => {
                                                        updateShowSearchBar(
                                                            false
                                                        )
                                                        setLoadingHeadline(
                                                            false
                                                        )
                                                    }, 1000)
                                                }}
                                                className={
                                                    styles.txtBreadcrumbsSpan
                                                }
                                            >
                                                {t('SOCIAL TREE')}
                                            </span>
                                        ) : isSocialTree ? (
                                            <span
                                                onClick={() => {
                                                    navigate(
                                                        `/${domainNavigate}${resolvedDomain}/didx`
                                                    )
                                                    setLoadingHeadline(true)
                                                    setTimeout(() => {
                                                        updateShowSearchBar(
                                                            false
                                                        )
                                                        setLoadingHeadline(
                                                            false
                                                        )
                                                    }, 1000)
                                                }}
                                                className={
                                                    styles.txtBreadcrumbsSpan
                                                }
                                            >
                                                DID
                                                <span
                                                    style={{
                                                        textTransform: 'none',
                                                    }}
                                                >
                                                    x
                                                </span>
                                                WALLET
                                            </span>
                                        ) :*/ <span
                                                        onClick={() => {
                                                            navigate(
                                                                `/${subdomainNavigate}${resolvedDomain}/${
                                                                    isZil_
                                                                        ? 'zil'
                                                                        : isSbt
                                                                        ? 'sbt'
                                                                        : isAirx
                                                                        ? 'airx'
                                                                        : '' //didx'
                                                                }`
                                                            )
                                                            setLoadingHeadline(
                                                                true
                                                            )
                                                            setTimeout(() => {
                                                                updateShowSearchBar(
                                                                    false
                                                                )
                                                                setLoadingHeadline(
                                                                    false
                                                                )
                                                            }, 1000)
                                                        }}
                                                        className={
                                                            isZil_
                                                                ? styles.txtBreadcrumbsSpanBlue
                                                                : styles.txtBreadcrumbsSpan
                                                        }
                                                        style={{
                                                            textTransform:
                                                                'lowercase',
                                                        }}
                                                    >
                                                        {resolvedSubdomain !==
                                                            '' &&
                                                            `${resolvedSubdomain}@`}
                                                        {resolvedDomain}.
                                                        {resolvedTLD === ''
                                                            ? 'ssi'
                                                            : resolvedTLD}
                                                    </span>
                                                }{' '}
                                                {data.map((val) => (
                                                    <span key={val.name}>
                                                        &gt;{' '}
                                                        <span
                                                            key={val.name}
                                                            onClick={() => {
                                                                navigate(
                                                                    `/${subdomainNavigate}${resolvedDomain}${val.route}`
                                                                )
                                                                setLoadingHeadline(
                                                                    true
                                                                )
                                                                setTimeout(
                                                                    () => {
                                                                        updateShowSearchBar(
                                                                            false
                                                                        )
                                                                        setLoadingHeadline(
                                                                            false
                                                                        )
                                                                    },
                                                                    1000
                                                                )
                                                            }}
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
                                    </>
                                )}
                            </span>
                        </h6>
                        {/* @review: Breadcrumbs */}
                        {/* <div style={{ display: 'flex' }}>
                            <div onClick={goBack} style={{ cursor: 'pointer' }}>
                                <Image src={leftChrome} alt="arrow" />
                            </div>
                            &nbsp;&nbsp;
                            {possibleForward() ? (
                                <div
                                    onClick={goForward}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Image src={rightChrome} alt="arrow" />
                                </div>
                            ) : (
                                <div>
                                    <Image src={rightDark} alt="arrow" />
                                </div>
                            )}
                        </div> */}
                    </>
                )}
            </div>
        </div>
    )
}

export default Component
