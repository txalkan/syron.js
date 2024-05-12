import { useStore as effectorStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Dashboard, Footer, Menu, SearchBar, Stats, Syron, ZilPay } from '..'
import {
    $loading,
    $loadingBreadcrumbs,
    $loadingDoc,
    updateLoading,
    updateLoadingBreadcrumbs,
} from '../../src/store/loading'
import { $menuOn } from '../../src/store/menuOn'
import {
    $modalDashboard,
    $modalNewSsi,
    $modalTx,
    $modalGetStarted,
    $modalBuyNft,
    $modalNewMotions,
    $showSearchBar,
    updateShowSearchBar,
    $modalInvestor,
    updateModalGetStarted,
    $modalTydra,
    $modalTransfer,
    $modalNft,
    $showZilpay,
    $modalNewDefi,
} from '../../src/store/modal'
import { updateOriginatorAddress } from '../../src/store/originatorAddress'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import toastTheme from '../../src/hooks/toastTheme'
import { useStore } from 'react-stores'

function Header() {
    const Router = useRouter()
    const { t } = useTranslation('common')
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const url = window.location.pathname
    const menuOn = effectorStore($menuOn)
    const modalDashboard = effectorStore($modalDashboard)
    const modalNewSsi = effectorStore($modalNewSsi)
    const modalTx = effectorStore($modalTx)
    const modalGetStarted = effectorStore($modalGetStarted)
    const modalBuyNft = effectorStore($modalBuyNft)
    const modalNewMotions = effectorStore($modalNewMotions)
    const modalInvestor = effectorStore($modalInvestor)
    const modalTydra = effectorStore($modalTydra)
    const modalNft = effectorStore($modalNft)
    const modalNewDefi = effectorStore($modalNewDefi)
    const modalTransfer = effectorStore($modalTransfer)
    const showSearchBar = effectorStore($showSearchBar)
    const loading = effectorStore($loading)
    const loadingDoc = effectorStore($loadingDoc)
    const loadingBreadcrumbs = effectorStore($loadingBreadcrumbs)
    const showZilpay = effectorStore($showZilpay)
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    //@review: subdomain
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const resolvedTLD =
        resolvedInfo?.user_tld! && resolvedInfo.user_tld
            ? resolvedInfo.user_tld
            : ''
    const version = resolvedInfo?.version
    const version_ = version?.toLowerCase()
    const [headerClassName, setHeaderClassName] = useState('first-load')
    const [contentClassName, setContentClassName] = useState('first-load')
    const [innerClassName, setInnerClassName] = useState('first-load')

    const replaceLangPath = () => {
        let path: string
        if (
            (url.includes('es') ||
                url.includes('cn') ||
                url.includes('id') ||
                url.includes('ru')) &&
            url.split('/').length === 2
        ) {
            path = url
                .replace('es', '')
                .replace('cn', '')
                .replace('id', '')
                .replace('ru', '')
        } else {
            path = url
                .replace('/es', '')
                .replace('/cn', '')
                .replace('/id', '')
                .replace('/ru', '')
        }

        return path
    }

    const searchBarMargin = replaceLangPath() === '/' ? '20vh' : '15%'

    useEffect(() => {
        if (replaceLangPath() === '/') {
            setTimeout(() => {
                setHeaderClassName('header')
                setContentClassName('content')
                setInnerClassName('inner')
            }, 10)
        }
        const path = replaceLangPath()
        const first = path.split('/')[1]

        if (first === 'getstarted') {
            Router.push('/')
            setTimeout(() => {
                updateModalGetStarted(true)
            }, 1000)
        }

        //@reviewed: need to simplify
        // if (
        //     path !== '/' &&
        //     !url.includes('/address') &&
        //     !url.includes('/getstarted') &&
        //     !url.includes('/resolvedAddress')
        // ) {
        //     //@review: breadcrumbs are not working perfectly
        //     if (resolvedDomain !== '') {
        //         // handle fetch if user accessing /username directly
        //         if (path.split('/').length > 2) {
        //             updateLoading(true)
        //             if (!path.includes('/didx')) {
        //                 // handle resolve username/didx directly
        //                 Router.push(`/${first}`)
        //             }
        //             setTimeout(() => {
        //                 resolveUser()
        //             }, 1000)
        //         } else {
        //             resolveUser()
        //         }
        //     } else if (
        //         resolvedDomain !== path.split('/')[1].split('@')[1] &&
        //         path.split('/')[1].split('@')[1] !== undefined
        //     ) {
        //         // handling fetch when resolved username changes
        //         resolveUser()
        //     } else if (resolvedTLD === 'did' && path.split('/')[2] === 'zil') {
        //         // handling navigation from did to zil
        //         resolveUser()
        //     } else if (
        //         resolvedTLD !== 'did' &&
        //         resolvedTLD !== '' &&
        //         path.split('/')[2] === 'didx'
        //     ) {
        //         // handling navigation from zil to did
        //         resolveUser()
        //     } else if (
        //         !version_?.includes('zilx') &&
        //         !version_?.includes('zils') &&
        //         path.split('/')[2] === 'zil'
        //     ) {
        //         // handling zilxwallet navigation
        //         resolveUser()
        //     } else if (
        //         !version_?.includes('sbtx') &&
        //         !version_?.includes('vcx') &&
        //         path.split('/')[2] === 'sbt'
        //     ) {
        //         // handling soulbound navigation
        //         resolveUser()
        //     }
        // }

        const third = path.split('/')[3]
        const fourth = path.split('/')[4]
        if (third === 'funds' || fourth === 'balances') {
            toast.warning(
                t('For your security, make sure you’re at tyron.network'),
                {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 3,
                }
            )
            updateOriginatorAddress(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //@review: subdomain use
    // useEffect(() => {
    //     const path = replaceLangPath()
    //     if (
    //         version_?.includes('defix') ||
    //         version_?.includes('sbtx') ||
    //         (version_?.includes('vcx') && path.split('/')[2] === 'sbt') ||
    //         version_?.includes('zilx') ||
    //         (version_?.includes('zils') && path.split('/')[2] === 'zil')
    //     ) {
    //         if (!loading && !loadingDoc && loadingBreadcrumbs && path !== '/') {
    //             if (resolvedDomain !== path.split('/')[1].split('@')[1]) {
    //                 resolveUser()
    //                 updateLoadingBreadcrumbs(false)
    //             } else if (resolvedTLD !== path.split('/')[1].split('@')[0]) {
    //                 resolveUser()
    //                 updateLoadingBreadcrumbs(false)
    //             }
    //         }
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [replaceLangPath])

    return (
        <>
            {showZilpay && <ZilPay />}
            {!modalNewSsi &&
                !modalGetStarted &&
                !modalBuyNft &&
                !modalInvestor &&
                !modalTransfer &&
                !modalNewMotions && (
                    <div className={styles.header}>
                        {/* <Menu /> */}
                        <Footer />
                        <Dashboard />
                    </div>
                )}
            <ToastContainer
                className={styles.containerToast}
                closeButton={false}
                progressStyle={{
                    backgroundColor: isLight ? '#ffff32' : '#eeeeee',
                }}
            />
            {replaceLangPath() === '/' ? (
                <div id={headerClassName}>
                    <div
                        style={{
                            marginTop: searchBarMargin,
                            width: '100%',
                        }}
                        className={contentClassName}
                    >
                        {!menuOn &&
                            !modalTx &&
                            !modalGetStarted &&
                            !modalNewSsi &&
                            !modalBuyNft &&
                            !modalNewMotions &&
                            !modalInvestor &&
                            !modalTydra &&
                            !modalNft &&
                            !modalTransfer &&
                            !modalNewDefi &&
                            !modalDashboard && <Syron />}
                    </div>
                </div>
            ) : (
                <div>
                    {!menuOn &&
                        !modalTx &&
                        !modalGetStarted &&
                        !modalNewSsi &&
                        !modalBuyNft &&
                        !modalNewMotions &&
                        !modalDashboard &&
                        !modalInvestor &&
                        !modalTydra &&
                        !modalNft &&
                        !modalTransfer &&
                        !modalNewDefi &&
                        !loadingDoc &&
                        !loading && (
                            <>
                                {showSearchBar ? (
                                    <div
                                        className={styles.magSearchbar}
                                        id={headerClassName}
                                    >
                                        <div
                                            style={{
                                                marginTop: searchBarMargin,
                                                width: '100%',
                                            }}
                                            className={contentClassName}
                                        >
                                            <div className={innerClassName}>
                                                <SearchBar />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            onClick={() => {
                                                setHeaderClassName('first-load')
                                                setContentClassName(
                                                    'first-load'
                                                )
                                                setInnerClassName('first-load')
                                                updateShowSearchBar(true)
                                                setTimeout(() => {
                                                    setHeaderClassName('header')
                                                    setContentClassName(
                                                        'content'
                                                    )
                                                    setInnerClassName('inner')
                                                }, 10)
                                            }}
                                            className={styles.searchBarIco}
                                        >
                                            <div className="button">
                                                <i className="fa fa-search"></i>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                </div>
            )}
        </>
    )
}

export default Header
