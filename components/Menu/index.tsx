import React, { useState } from 'react'
import Image from 'next/image'
import { useStore } from 'effector-react'
import styles from './styles.module.scss'
import menu from '../../src/assets/logos/menu.png'
import back from '../../src/assets/logos/back.png'
import { $menuOn, updateMenuOn } from '../../src/store/menuOn'
import {
    $modalBuyNft,
    $modalNewSsi,
    updateModalGetStarted,
} from '../../src/store/modal'
import { TransactionStatusMinimized } from '..'
import { useTranslation } from 'react-i18next'

function Component() {
    const menuOn = useStore($menuOn)
    const modalBuyNft = useStore($modalBuyNft)
    const modalNewSsi = useStore($modalNewSsi)
    const [activeMenu, setActiveMenu] = useState('')
    const { t } = useTranslation()

    const resetModal = () => {
        updateModalGetStarted(false)
    }

    return (
        <>
            {!menuOn ? (
                <div className={styles.wrapperMenuBtn}>
                    <div
                        className={styles.button}
                        onClick={() => updateMenuOn(true)}
                    >
                        <Image
                            alt="menu-ico"
                            width={25}
                            height={25}
                            src={menu}
                        />
                    </div>
                    {!modalBuyNft && !modalNewSsi && (
                        <TransactionStatusMinimized />
                    )}
                </div>
            ) : (
                <>
                    <div
                        className={styles.outerWrapper}
                        onClick={() => {
                            updateMenuOn(false)
                            setActiveMenu('')
                        }}
                    />
                    <div className={styles.menu}>
                        <div
                            onClick={() => {
                                updateMenuOn(false)
                                setActiveMenu('')
                            }}
                            className={styles.back}
                        >
                            <Image
                                alt="back-ico"
                                width={25}
                                height={25}
                                src={back}
                            />
                        </div>
                        <div className={styles.menuItemWrapper}>
                            <h3
                                onClick={() => {
                                    resetModal()
                                    updateModalGetStarted(true)
                                    updateMenuOn(false)
                                }}
                                className={styles.menuItemText}
                            >
                                {t('GET_STARTED')}
                            </h3>
                            {activeMenu !== 'ssiprotocol' ? (
                                <h3
                                    onClick={() => setActiveMenu('ssiprotocol')}
                                    className={styles.menuItemText}
                                >
                                    {t('SSI_PROTOCOL')}
                                </h3>
                            ) : (
                                activeMenu === 'ssiprotocol' && (
                                    <>
                                        <h3
                                            onClick={() => setActiveMenu('')}
                                            className={
                                                styles.menuItemTextActive
                                            }
                                        >
                                            {t('SSI_PROTOCOL')}
                                        </h3>
                                        <div
                                            className={
                                                styles.subMenuItemWrapper
                                            }
                                        >
                                            <div
                                                onClick={() =>
                                                    window.open(
                                                        'https://www.ssiprotocol.com/#/about'
                                                    )
                                                }
                                                className={
                                                    styles.subMenuItemListWrapper
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.subMenuItemListText
                                                    }
                                                >
                                                    {t('ABOUT')}
                                                </p>
                                            </div>
                                            <div
                                                onClick={() =>
                                                    window.open(
                                                        'https://www.ssiprotocol.com/#/contact'
                                                    )
                                                }
                                                className={
                                                    styles.subMenuItemListWrapper
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.subMenuItemListText
                                                    }
                                                >
                                                    {t('CONTACT')}
                                                </p>
                                            </div>
                                            <div
                                                onClick={() =>
                                                    window.open(
                                                        'https://www.ssiprotocol.com/#/wallets'
                                                    )
                                                }
                                                className={
                                                    styles.subMenuItemListWrapper
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.subMenuItemListText
                                                    }
                                                >
                                                    {t('DIDXWALLET')}
                                                </p>
                                            </div>
                                            <div
                                                onClick={() =>
                                                    window.open(
                                                        'https://ssiprotocol.notion.site/TYRON-Whitepaper-5ca16fc254b343fb90cfeb725cbfa2c3'
                                                    )
                                                }
                                                className={
                                                    styles.subMenuItemListWrapper
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.subMenuItemListText
                                                    }
                                                >
                                                    {t('WHITEPAPER')}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )
                            )}
                            <h3
                                onClick={() =>
                                    window.open(
                                        'https://ssiprotocol.notion.site/Frequently-Asked-Questions-4887d24a3b314fda8ff9e3c6c46def30'
                                    )
                                }
                                className={styles.menuItemText}
                            >
                                {t('FAQ')}
                            </h3>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Component
