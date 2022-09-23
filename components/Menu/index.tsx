import React, { useState } from 'react'
import Image from 'next/image'
import { useStore } from 'effector-react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import menu from '../../src/assets/logos/menu.png'
import back from '../../src/assets/logos/back.png'
import plus from '../../src/assets/icons/add_icon.svg'
import minus from '../../src/assets/icons/minus_icon.svg'
import { $menuOn, updateMenuOn } from '../../src/store/menuOn'
import {
    $modalBuyNft,
    $modalNewSsi,
    updateModalGetStarted,
} from '../../src/store/modal'
import { SocialIcon, TransactionStatusMinimized } from '..'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

function Component() {
    const menuOn = useStore($menuOn)
    const modalBuyNft = useStore($modalBuyNft)
    const modalNewSsi = useStore($modalNewSsi)
    const [activeMenu, setActiveMenu] = useState('')
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

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
                    <SocialIcon />
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
                            {/* {activeMenu !== 'ssiprotocol' ? (
                                <div
                                    onClick={() => setActiveMenu('ssiprotocol')}
                                    style={{ display: 'flex' }}
                                >
                                    <h3 className={styles.menuItemText}>
                                        {t('SSI_PROTOCOL')}
                                    </h3>
                                    <div
                                        style={{
                                            cursor: 'pointer',
                                            marginLeft: '20px',
                                        }}
                                    >
                                        <Image src={plus} alt="plus-ico" />
                                    </div>
                                </div>
                            ) : (
                                activeMenu === 'ssiprotocol' && (
                                    <>
                                        <div
                                            onClick={() => setActiveMenu('')}
                                            style={{ display: 'flex' }}
                                        >
                                            <h3
                                                className={
                                                    styles.menuItemTextActive
                                                }
                                            >
                                                {t('SSI_PROTOCOL')}
                                            </h3>
                                            <div
                                                style={{
                                                    cursor: 'pointer',
                                                    marginLeft: '20px',
                                                }}
                                            >
                                                <Image
                                                    src={minus}
                                                    alt="minus-ico"
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                styles.subMenuItemWrapper
                                            }
                                        >
                                            <div
                                                onClick={() =>
                                                    window.open(
                                                        'https://www.tyron.io'
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
                                                    {'Blog'}
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
                            )} */}
                            <h3
                                onClick={() =>
                                    window.open('https://www.tyron.io')
                                }
                                className={styles.menuItemText}
                            >
                                {'Blog'}
                            </h3>
                            <h3
                                onClick={() =>
                                    window.open(
                                        'https://ssiprotocol.notion.site/TYRON-Whitepaper-5ca16fc254b343fb90cfeb725cbfa2c3'
                                    )
                                }
                                className={styles.menuItemText}
                            >
                                {t('WHITEPAPER')}
                            </h3>
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
