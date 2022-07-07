import styles from '../../styles/css/Footer.module.css'
import Image from 'next/image'
import TyronLogo from '../../src/assets/logos/tyron_logo.png'
import upDown from '../../src/assets/logos/up_down_arrow.png'
import arrowUp from '../../src/assets/icons/arrow_up_white.svg'
import { useRouter } from 'next/router'
import { useStore } from 'effector-react'
import { $language, updateLanguage } from '../../src/store/language'
import { useState } from 'react'

function Footer() {
    const Router = useRouter()
    const language = useStore($language)
    const { asPath } = useRouter()

    const [showDropdown, setShowDropdown] = useState(false)

    const changeLang = (val: string) => {
        setShowDropdown(false)
        Router.push({}, asPath, { locale: val })
        updateLanguage(val)
    }

    const langDropdown = [
        {
            key: 'en',
            name: '🇬🇧 English',
        },
        {
            key: 'es',
            name: '🇪🇸 Spanish',
        },
        {
            key: 'cn',
            name: '🇨🇳 Chinese',
        },
        {
            key: 'id',
            name: '🇮🇩 Indonesian',
        },
        {
            key: 'ru',
            name: '🇷🇺 Russian',
        },
    ]

    return (
        <footer className={styles.footer}>
            {showDropdown && (
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
                            )[0].name
                        }
                        <Image
                            width={15}
                            height={10}
                            src={upDown}
                            alt="arrow"
                        />
                    </div>
                </div>
                {/* <select
                    value={language}
                    className={styles.languageSelector}
                    onChange={handleOnChange}
                >
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="cn">🇨🇳 Chinese</option>
                    <option value="id">🇮🇩 Indonesian</option>
                    <option value="ru">🇷🇺 Russian</option>
                </select> */}
            </div>
            <div
                onClick={() =>
                    window.open(
                        'http://tyron.network/ssiprotocol/tree',
                        '_self'
                    )
                }
                style={{ cursor: 'pointer' }}
            >
                <Image src={TyronLogo} alt="tyron-logo" />
            </div>
        </footer>
    )
}

export default Footer
