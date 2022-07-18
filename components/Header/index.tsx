import { useStore } from 'effector-react'
import React, { useState, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import { SearchBar } from '../'
import { $loading } from '../../src/store/loading'
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
} from '../../src/store/modal'
import styles from './styles.module.scss'

function Header() {
    const url = window.location.pathname.toLowerCase()
    const menuOn = useStore($menuOn)
    const modalDashboard = useStore($modalDashboard)
    const modalNewSsi = useStore($modalNewSsi)
    const modalTx = useStore($modalTx)
    const modalGetStarted = useStore($modalGetStarted)
    const modalBuyNft = useStore($modalBuyNft)
    const modalAddFunds = useStore($modalAddFunds)
    const modalWithdrawal = useStore($modalWithdrawal)
    const modalNewMotions = useStore($modalNewMotions)
    const loading = useStore($loading)
    const [headerClassName, setHeaderClassName] = useState('first-load')
    const [contentClassName, setContentClassName] = useState('first-load')
    const [innerClassName, setInnerClassName] = useState(
        url === '/' ? 'first-load' : 'inner'
    )
    let path
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
    const searchBarMargin = path === '/' ? '-10%' : '15%'

    useEffect(() => {
        setTimeout(() => {
            setHeaderClassName('header')
            setContentClassName('content')
            setInnerClassName('inner')
        }, 10)
    })

    return (
        <>
            <ToastContainer
                className={styles.containerToast}
                closeButton={false}
                progressStyle={{ backgroundColor: '#eeeeee' }}
            />
            {url === '/' ? (
                <div id={headerClassName}>
                    <div
                        style={{ marginTop: searchBarMargin, width: '100%' }}
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
                            !modalDashboard && (
                                <div className={innerClassName}>
                                    <SearchBar />
                                </div>
                            )}
                    </div>
                </div>
            ) : (
                <div style={{ width: '100%' }}>
                    {!menuOn &&
                        !modalTx &&
                        !modalGetStarted &&
                        !modalNewSsi &&
                        !modalBuyNft &&
                        !modalAddFunds &&
                        !modalWithdrawal &&
                        !modalNewMotions &&
                        !modalDashboard &&
                        !loading && (
                            <div className={styles.searchBarWrapperLeft}>
                                <div className={innerClassName}>
                                    <SearchBar />
                                </div>
                            </div>
                        )}
                </div>
            )}
        </>
    )
}

export default Header
