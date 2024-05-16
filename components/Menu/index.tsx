import React from 'react'
import Image from 'next/image'
import { useStore } from 'effector-react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import menu from '../../src/assets/logos/menu.png'
import back from '../../src/assets/logos/back.png'
// import incognito from '../../src/assets/icons/incognito.svg'
// import incognitoActive from '../../src/assets/icons/incognito_active.svg'
import { $menuOn, updateMenuOn } from '../../src/store/menuOn'
import {
    $modalBuyNft,
    $modalNewSsi,
    updateModalGetStarted,
} from '../../src/store/modal'
import { Selector, SocialIcon, TransactionStatusMinimized } from '..'
import { useTranslation } from 'next-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import useRouterHook from '../../src/hooks/router'
import { UpdateLang } from '../../src/app/actions'
// import { toast } from 'react-toastify'
// import toastTheme from '../../src/hooks/toastTheme'
// import { UpdateIsIncognito } from '../../src/app/actions'
import stylesDarkFooter from '../../styles/css/Footer.module.css'
import stylesLightFooter from '../../styles/css/FooterLight.module.css'

function Component() {
    // const { logOff } = routerHook()
    // const dispatch = useDispatch()
    const menuOn = useStore($menuOn)
    const modalBuyNft = useStore($modalBuyNft)
    const modalNewSsi = useStore($modalNewSsi)
    // const [activeMenu, setActiveMenu] = useState('')
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    // const isIncognito = useSelector(
    //     (state: RootState) => state.modal.isIncognito
    // )
    const styles = isLight ? stylesLight : stylesDark
    const stylesFooter = isLight ? stylesLightFooter : stylesDarkFooter

    // const incognitoIco = isIncognito ? incognitoActive : incognito

    const resetModal = () => {
        updateModalGetStarted(false)
    }

    const language = useSelector((state: RootState) => state.modal.lang)
    const dispatch = useDispatch()

    const changeLang = (val: string) => {
        // setShowDropdown(false)
        dispatch(UpdateLang(val))
    }
    const langDropdown = [
        {
            value: 'en',
            label: '🇬🇧 English',
        },
        {
            value: 'es',
            label: '🇪🇸 Spanish',
        },
        {
            value: 'cn',
            label: '🇨🇳 Chinese',
        },
        {
            value: 'id',
            label: '🇮🇩 Indonesian',
        },
        {
            value: 'ru',
            label: '🇷🇺 Russian',
        },
    ]

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
                            width={33}
                            height={33}
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
                            // setActiveMenu('')
                        }}
                    />
                    <div className={styles.menu}>
                        <div
                            onClick={() => {
                                updateMenuOn(false)
                                // setActiveMenu('')
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
                                <div
                                    className={
                                        stylesFooter.languageSelectorWrapper
                                    }
                                >
                                    <div
                                        className={
                                            stylesFooter.dropdownCheckListWrapper
                                        }
                                    >
                                        <Selector
                                            option={langDropdown}
                                            onChange={changeLang}
                                            placeholder={
                                                langDropdown.filter(
                                                    (val_) =>
                                                        val_.value === language
                                                )[0]?.label
                                            }
                                            menuPlacement="top"
                                            searchable={false}
                                            type="language"
                                        />
                                    </div>
                                </div>
                                <div className={styles.menuItems}>
                                    <h4
                                        onClick={() => {
                                            resetModal()
                                            updateModalGetStarted(true)
                                            updateMenuOn(false)
                                        }}
                                        className={styles.menuItemText}
                                        style={{ marginTop: '30px' }}
                                    >
                                        {t('GET STARTED')}
                                    </h4>
                                    {/* {activeMenu !== 'ssiprotocol' ? (
                                    <div
                                        onClick={() => setActiveMenu('ssiprotocol')}
                                        style={{ display: 'flex' }}
                                    >
                                        <h4 className={styles.menuItemText}>
                                            {t('SSI_PROTOCOL')}
                                        </h4>
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
                                                <h4
                                                    className={
                                                        styles.menuItemTextActive
                                                    }
                                                >
                                                    {t('SSI_PROTOCOL')}
                                                </h4>
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
                                    {/* <h4
                                        style={{ textTransform: 'lowercase' }}
                                        onClick={() =>
                                            window.open(
                                                'https://ssiprotocol.com'
                                            )
                                        }
                                        className={styles.menuItemText}
                                    >
                                        ssiprotocol.com&#x2197;
                                    </h4> */}
                                    <h4
                                        style={{ textTransform: 'none' }}
                                        onClick={() =>
                                            window.open('https://tyrondao.org')
                                        }
                                        className={styles.menuItemText}
                                    >
                                        TyronDAO.org&#x2197;
                                    </h4>
                                    {/* <h4
                                        onClick={() =>
                                            window.open(
                                                'https://ssiprotocol.notion.site/TYRON-Whitepaper-5ca16fc254b343fb90cfeb725cbfa2c3'
                                            )
                                        }
                                        className={styles.menuItemText}
                                    >
                                        {t('WHITEPAPER')}&#x2197;
                                    </h4> */}
                                    <h4
                                        onClick={() =>
                                            window.open(
                                                'https://ssiprotocol.notion.site/Frequently-Asked-Questions-4887d24a3b314fda8ff9e3c6c46def30'
                                            )
                                        }
                                        className={styles.menuItemText}
                                    >
                                        {t('FAQ')}&#x2197;
                                    </h4>
                                </div>
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
                            <SocialIcon type="mobile" />
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

export default Component
