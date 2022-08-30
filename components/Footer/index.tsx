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
import { useRouter } from 'next/router'

function Footer() {
    const Router = useRouter()
    const dispatch = useDispatch()
    const language = useSelector((state: RootState) => state.modal.lang)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

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

    const resolvedInfo = useStore($resolvedInfo)
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
                onClick={() => {
                    console.log(resolvedInfo)
                    // @info why the router here does not work? URL update but UI not: because when we're pushing to the
                    // same page e.g /ilhamb to /ssiprotocol it'll not trigger useeffect (but if from ilhamb/didx to /ssiprotocol this is works)
                    // Router.push('/ssiprotocol/tree')
                    window.open('http://tyron.network/ssiprotocol', '_self')
                }}
                className={styles.tyronLg}
            >
                <Image src={TyronLogo} alt="tyron-logo" />
            </div>
        </footer>
    )
}

export default Footer
