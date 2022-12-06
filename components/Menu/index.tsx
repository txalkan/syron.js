import React, { useState } from 'react'
import Image from 'next/image'
import { useStore } from 'effector-react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import menu from '../../src/assets/logos/menu.png'
import back from '../../src/assets/logos/back.png'
import incognito from '../../src/assets/icons/incognito.svg'
import incognitoActive from '../../src/assets/icons/incognito_active.svg'
import { $menuOn, updateMenuOn } from '../../src/store/menuOn'
import {
    $modalBuyNft,
    $modalNewSsi,
    updateModalGetStarted,
} from '../../src/store/modal'
import { SocialIcon, TransactionStatusMinimized } from '..'
import { useTranslation } from 'next-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import routerHook from '../../src/hooks/router'
import { toast } from 'react-toastify'
import toastTheme from '../../src/hooks/toastTheme'
import { UpdateIsIncognito } from '../../src/app/actions'

function Component() {
    const { logOff } = routerHook()
    const dispatch = useDispatch()
    const menuOn = useStore($menuOn)
    const modalBuyNft = useStore($modalBuyNft)
    const modalNewSsi = useStore($modalNewSsi)
    const [activeMenu, setActiveMenu] = useState('')
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    // const isIncognito = useSelector(
    //     (state: RootState) => state.modal.isIncognito
    // )
    const styles = isLight ? stylesLight : stylesDark
    // const incognitoIco = isIncognito ? incognitoActive : incognito

    const resetModal = () => {
        updateModalGetStarted(false)
    }

    // const toggleIncognito = () => {
    //     if (!isIncognito) {
    //         logOff()
    //         toast.warning("You're in incognito mode", {
    //             position: 'top-center',
    //             autoClose: 3000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: true,
    //             draggable: true,
    //             progress: undefined,
    //             theme: toastTheme(isLight),
    //             toastId: 3,
    //         })
    //     }
    //     dispatch(UpdateIsIncognito(!isIncognito))
    //     updateMenuOn(false)
    // }

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
                    <SocialIcon type="desktop" />
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
                        <div className={styles.wrapperContent}>
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
                                                    <div
                                                        className={
                                                            styles.subMenuItemListText
                                                        }
                                                    >
                                                        {'Blog'}
                                                    </div>
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
                                                    <div
                                                        className={
                                                            styles.subMenuItemListText
                                                        }
                                                    >
                                                        {t('CONTACT')}
                                                    </div>
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
                                                    <div
                                                        className={
                                                            styles.subMenuItemListText
                                                        }
                                                    >
                                                        {t('DIDXWALLET')}
                                                    </div>
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
                                                    <div
                                                        className={
                                                            styles.subMenuItemListText
                                                        }
                                                    >
                                                        {t('WHITEPAPER')}
                                                    </div>
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
                            {/* <div className={styles.incognito}>
                                <div
                                    onClick={toggleIncognito}
                                    className={styles.incognitoIco}
                                >
                                    <Image
                                        src={incognitoIco}
                                        alt="incognito-ico"
                                    />
                                </div>
                                <div className={styles.txtIncognito}>
                                    Incognito Mode: {isIncognito ? 'ON' : 'OFF'}
                                </div>
                            </div> */}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Component
