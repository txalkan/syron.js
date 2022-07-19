import styles from '../../styles/css/Footer.module.css'
import Image from 'next/image'
import TyronLogo from '../../src/assets/logos/tyron_logo.png'
import upDown from '../../src/assets/icons/up_down_arrow.svg'
import { useState } from 'react'
import { RootState } from '../../src/app/reducers'
import { useDispatch, useSelector } from 'react-redux'
import { UpdateLang } from '../../src/app/actions'

function Footer() {
    const dispatch = useDispatch()
    const language = useSelector((state: RootState) => state.modal.lang)

    const [showDropdown, setShowDropdown] = useState(false)

    const changeLang = (val: string) => {
        setShowDropdown(false)
        dispatch(UpdateLang(val))
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
            </div>
            <div
                onClick={() =>
                    window.open(
                        'http://tyron.network/ssiprotocol/tree',
                        '_self'
                    )
                }
                className={styles.tyronLg}
            >
                <Image src={TyronLogo} alt="tyron-logo" />
            </div>
        </footer>
    )
}

export default Footer
