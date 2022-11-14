import stylesDark from '../../styles/css/Footer.module.css'
import stylesLight from '../../styles/css/FooterLight.module.css'
import Image from 'next/image'
import TyronLogo from '../../src/assets/logos/tyron_logo.png'
import upDown from '../../src/assets/icons/up_down_arrow.svg'
import { useState } from 'react'
import { RootState } from '../../src/app/reducers'
import { useDispatch, useSelector } from 'react-redux'
import { UpdateLang } from '../../src/app/actions'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { useStore } from 'effector-react'
import { $menuOn } from '../../src/store/menuOn'
import {
    $modalAddFunds,
    $modalBuyNft,
    $modalDashboard,
    $modalGetStarted,
    $modalInvestor,
    $modalNewMotions,
    $modalNewSsi,
    $modalTransfer,
    $modalTydra,
    $modalWithdrawal,
} from '../../src/store/modal'
import { Selector, SocialIcon } from '..'

function Footer() {
    const dispatch = useDispatch()
    const language = useSelector((state: RootState) => state.modal.lang)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const resolvedInfo = useStore($resolvedInfo)
    const menuOn = useStore($menuOn)
    const modalDashboard = useStore($modalDashboard)
    const modalNewSsi = useStore($modalNewSsi)
    const modalGetStarted = useStore($modalGetStarted)
    const modalBuyNft = useStore($modalBuyNft)
    const modalAddFunds = useStore($modalAddFunds)
    const modalWithdrawal = useStore($modalWithdrawal)
    const modalNewMotions = useStore($modalNewMotions)
    const modalInvestor = useStore($modalInvestor)
    const modalTydra = useStore($modalTydra)
    const modalTransfer = useStore($modalTransfer)

    const [showDropdown, setShowDropdown] = useState(false)

    const changeLang = (val: string) => {
        setShowDropdown(false)
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

    if (
        menuOn ||
        modalDashboard ||
        modalNewSsi ||
        modalGetStarted ||
        modalBuyNft ||
        modalAddFunds ||
        modalWithdrawal ||
        modalNewMotions ||
        modalInvestor ||
        modalTydra ||
        modalTransfer
    ) {
        return <div className={styles.footer} />
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.footer}>
                <div className={styles.languageSelectorWrapper}>
                    <div className={styles.dropdownCheckListWrapper}>
                        <Selector
                            option={langDropdown}
                            onChange={changeLang}
                            placeholder={
                                langDropdown.filter(
                                    (val_) => val_.value === language
                                )[0]?.label
                            }
                            menuPlacement="top"
                            searchable={false}
                            type="language"
                        />
                    </div>
                </div>
                {/* {showDropdown && (
                    <div
                        className={styles.closeWrapper}
                        onClick={() => setShowDropdown(false)}
                    />
                )}
                <div className={styles.languageSelectorWrapper}>
                    <div className={styles.dropdownCheckListWrapper}>
                        {showDropdown && (
                            <>
                                <div className={styles.wrapperOption}>
                                    {langDropdown.map((val, i) => (
                                        <div
                                            onClick={() => changeLang(val.key)}
                                            key={i}
                                            className={styles.option}
                                        >
                                            <div>
                                                {val.name}{' '}
                                                {val.key === language ? (
                                                    <span>&#10004;</span>
                                                ) : (
                                                    ''
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        <div
                            onClick={() => setShowDropdown(!showDropdown)}
                            className={styles.dropdownCheckList}
                        >
                            {
                                langDropdown.filter(
                                    (val_) => val_.key === language
                                )[0]?.name
                            }
                            <Image
                                width={15}
                                height={10}
                                src={upDown}
                                alt="arrow"
                            />
                        </div>
                    </div>
                </div> */}
                <div
                    onClick={() => {
                        console.log(resolvedInfo)
                        // @info why the router here does not work? URL update but UI not: because when we're pushing to the
                        // same page e.g /ilhamb to /ssiprotocol it'll not trigger useeffect (but if from ilhamb/didx to /ssiprotocol this is works)
                        // Router.push('/ssiprotocol/tree')
                        window.open('http://tyron.network/ssiprotocol', '_self')
                    }}
                    className={styles.tyronLg}
                >
                    <Image priority={true} src={TyronLogo} alt="tyron-logo" />
                </div>
                <div className={styles.dummy} />
            </div>
            <SocialIcon type="mobile" />
        </div>
    )
}

export default Footer
