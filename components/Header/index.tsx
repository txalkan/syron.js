import { useStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { Dashboard, Menu, SearchBar, ZilPay } from '..'
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
    $modalAddFunds,
    $modalWithdrawal,
    $modalNewMotions,
    $showSearchBar,
    updateShowSearchBar,
    $modalInvestor,
    updateModalGetStarted,
    $modalTydra,
    $modalTransfer,
    $modalNft,
    $showZilpay,
} from '../../src/store/modal'
import { updateOriginatorAddress } from '../../src/store/originatorAddress'
import styles from './styles.module.scss'
import fetch from '../../src/hooks/fetch'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import toastTheme from '../../src/hooks/toastTheme'

function Header() {
    const Router = useRouter()
    const { t } = useTranslation('common')
    const { resolveUser } = fetch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const url = window.location.pathname
    const menuOn = useStore($menuOn)
    const modalDashboard = useStore($modalDashboard)
    const modalNewSsi = useStore($modalNewSsi)
    const modalTx = useStore($modalTx)
    const modalGetStarted = useStore($modalGetStarted)
    const modalBuyNft = useStore($modalBuyNft)
    const modalAddFunds = useStore($modalAddFunds)
    const modalWithdrawal = useStore($modalWithdrawal)
    const modalNewMotions = useStore($modalNewMotions)
    const modalInvestor = useStore($modalInvestor)
    const modalTydra = useStore($modalTydra)
    const modalNft = useStore($modalNft)
    const modalTransfer = useStore($modalTransfer)
    const showSearchBar = useStore($showSearchBar)
    const loading = useStore($loading)
    const loadingDoc = useStore($loadingDoc)
    const loadingBreadcrumbs = useStore($loadingBreadcrumbs)
    const resolvedInfo = useStore($resolvedInfo)
    const showZilpay = useStore($showZilpay)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedTLD = resolvedInfo?.user_tld
    const version = resolvedInfo?.version
    const version_ = version?.toLowerCase()
    const [headerClassName, setHeaderClassName] = useState('first-load')
    const [contentClassName, setContentClassName] = useState('first-load')
    const [innerClassName, setInnerClassName] = useState('first-load')
    const loginInfo = useSelector((state: RootState) => state.modal)

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

        if (
            path !== '/' &&
            !url.includes('/address') &&
            !url.includes('/getstarted') &&
            !url.includes('/resolvedAddress')
        ) {
            if (!resolvedDomain) {
                // handle fetch if user accessing /username directly
                if (path.split('/').length > 2) {
                    updateLoading(true)
                    if (!path.includes('/didx')) {
                        // handle resolve username/didx directly
                        Router.push(`/${first}`)
                    }
                    setTimeout(() => {
                        resolveUser()
                    }, 1000)
                } else {
                    resolveUser()
                }
            } else if (
                resolvedDomain !== path.split('/')[1].split('@')[1] &&
                path.split('/')[1].split('@')[1] !== undefined
            ) {
                // handling fetch when resolved username changes
                resolveUser()
            } else if (resolvedTLD === 'did' && path.split('/')[2] === 'zil') {
                // handling navigation from did to zil
                resolveUser()
            } else if (
                resolvedTLD !== 'did' &&
                resolvedTLD !== '' &&
                path.split('/')[2] === 'didx'
            ) {
                // handling navigation from zil to did
                resolveUser()
            } else if (
                !version_?.includes('zilx') &&
                !version_?.includes('zils') &&
                path.split('/')[2] === 'zil'
            ) {
                // handling zilxwallet navigation
                resolveUser()
            } else if (
                !version_?.includes('sbtx') &&
                !version_?.includes('vcx') &&
                path.split('/')[2] === 'sbt'
            ) {
                // handling soulbound navigation
                resolveUser()
            }
        }

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

    //@todo-x review subdomain use
    useEffect(() => {
        const path = replaceLangPath()
        if (
            version_?.includes('sbtx') ||
            (version_?.includes('vcx') && path.split('/')[2] === 'sbt') ||
            version_?.includes('zilx') ||
            (version_?.includes('zils') && path.split('/')[2] === 'zil')
        ) {
            if (!loading && !loadingDoc && loadingBreadcrumbs && path !== '/') {
                if (resolvedDomain !== path.split('/')[1].split('@')[1]) {
                    resolveUser()
                    updateLoadingBreadcrumbs(false)
                } else if (resolvedTLD !== path.split('/')[1].split('@')[0]) {
                    resolveUser()
                    updateLoadingBreadcrumbs(false)
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [replaceLangPath])

    return (
        <>
            {showZilpay && <ZilPay />}
            {!modalNewSsi &&
                !modalGetStarted &&
                !modalBuyNft &&
                !modalAddFunds &&
                !modalWithdrawal &&
                !modalInvestor &&
                !modalTransfer &&
                !modalNewMotions && (
                    <>
                        <Menu />
                        <Dashboard />
                    </>
                )}
            <ToastContainer
                className={styles.containerToast}
                closeButton={false}
                progressStyle={{
                    backgroundColor: isLight ? '#6c00ad' : '#eeeeee',
                }}
            />
            {!loadingDoc && (
                <>
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
                                    !modalAddFunds &&
                                    !modalWithdrawal &&
                                    !modalNewMotions &&
                                    !modalInvestor &&
                                    !modalTydra &&
                                    !modalNft &&
                                    !modalTransfer &&
                                    !modalDashboard && (
                                        <div className={innerClassName}>
                                            <SearchBar />
                                        </div>
                                    )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {!menuOn &&
                                !modalTx &&
                                !modalGetStarted &&
                                !modalNewSsi &&
                                !modalBuyNft &&
                                !modalAddFunds &&
                                !modalWithdrawal &&
                                !modalNewMotions &&
                                !modalDashboard &&
                                !modalInvestor &&
                                !modalTydra &&
                                !modalNft &&
                                !modalTransfer &&
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
                                                        marginTop:
                                                            searchBarMargin,
                                                        width: '100%',
                                                    }}
                                                    className={contentClassName}
                                                >
                                                    <div
                                                        className={
                                                            innerClassName
                                                        }
                                                    >
                                                        <SearchBar />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    onClick={() => {
                                                        setHeaderClassName(
                                                            'first-load'
                                                        )
                                                        setContentClassName(
                                                            'first-load'
                                                        )
                                                        setInnerClassName(
                                                            'first-load'
                                                        )
                                                        updateShowSearchBar(
                                                            true
                                                        )
                                                        setTimeout(() => {
                                                            setHeaderClassName(
                                                                'header'
                                                            )
                                                            setContentClassName(
                                                                'content'
                                                            )
                                                            setInnerClassName(
                                                                'inner'
                                                            )
                                                        }, 10)
                                                    }}
                                                    className={
                                                        styles.searchBarIco
                                                    }
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
            )}
        </>
    )
}

export default Header
