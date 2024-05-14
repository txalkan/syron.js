import styles from './styles.module.scss'
// import stylesDark from '../../styles/css/Footer.module.css'
// import stylesLight from '../../styles/css/FooterLight.module.css'
import Image from 'next/image'
import TyronLogo from '../../src/assets/logos/tyron_black_circle_horizontal.png'
// import upDown from '../../src/assets/icons/up_down_arrow.svg'
// import { useState } from 'react'
import { RootState } from '../../src/app/reducers'
import { useSelector } from 'react-redux'
// import { UpdateLang } from '../../src/app/actions'
import { useStore } from 'effector-react'
import { $menuOn } from '../../src/store/menuOn'
import {
    $modalBuyNft,
    $modalDashboard,
    $modalGetStarted,
    $modalInvestor,
    $modalNewDefi,
    $modalNewMotions,
    $modalNewSsi,
    $modalNft,
    $modalTransfer,
    $modalTydra,
} from '../../src/store/modal'

function Footer() {
    // const dispatch = useDispatch()
    // const language = useSelector((state: RootState) => state.modal.lang)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    // const styles = isLight ? stylesLight : stylesDark

    const menuOn = useStore($menuOn)
    const modalDashboard = useStore($modalDashboard)
    const modalNewSsi = useStore($modalNewSsi)
    const modalGetStarted = useStore($modalGetStarted)
    const modalBuyNft = useStore($modalBuyNft)
    const modalNewMotions = useStore($modalNewMotions)
    const modalInvestor = useStore($modalInvestor)
    const modalTydra = useStore($modalTydra)
    const modalNft = useStore($modalNft)
    const modalTransfer = useStore($modalTransfer)
    const modalNewDefi = useStore($modalNewDefi)

    // const [showDropdown, setShowDropdown] = useState(false)

    // const changeLang = (val: string) => {
    //     // setShowDropdown(false)
    //     dispatch(UpdateLang(val))
    // }

    // const langDropdown = [
    //     {
    //         value: 'en',
    //         label: '🇬🇧 English',
    //     },
    //     {
    //         value: 'es',
    //         label: '🇪🇸 Spanish',
    //     },
    //     {
    //         value: 'cn',
    //         label: '🇨🇳 Chinese',
    //     },
    //     {
    //         value: 'id',
    //         label: '🇮🇩 Indonesian',
    //     },
    //     {
    //         value: 'ru',
    //         label: '🇷🇺 Russian',
    //     },
    // ]

    if (
        menuOn ||
        modalDashboard ||
        modalNewSsi ||
        modalGetStarted ||
        modalBuyNft ||
        modalNewMotions ||
        modalInvestor ||
        modalTydra ||
        modalNft ||
        modalNewDefi ||
        modalTransfer
    ) {
        return <div className={styles.footer} />
    }

    return (
        <>
            {/* <div className={styles.wrapper}>
            <div className={styles.footer}> */}
            {/* <div className={styles.languageSelectorWrapper}>
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
                </div> */}
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
                    window.open('http://tyrondao.org', '_self')
                }}
                className={styles.tyronLg}
            >
                <Image
                    priority={true}
                    src={TyronLogo}
                    alt="tyron-logo"
                    className={styles.tyronImg}
                />
            </div>
            {/* <div className={styles.dummy} />
            </div>
        </div> */}
        </>
    )
}

export default Footer
