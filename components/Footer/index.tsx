import styles from '../../styles/css/Footer.module.css'
import Image from 'next/image'
import TyronLogo from '../../src/assets/logos/tyron_logo.png'
import { useRouter } from 'next/router'
import { useStore } from 'effector-react'
import { $language, updateLanguage } from '../../src/store/language'

function Footer() {
    const Router = useRouter()
    const language = useStore($language)
    const { asPath } = useRouter()

    const handleOnChange = (event: { target: { value: any } }) => {
        const val = event.target.value
        Router.push({}, asPath, { locale: val })
        updateLanguage(val)
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.languageSelectorWrapper}>
                <select
                    value={language}
                    className={styles.languageSelector}
                    onChange={handleOnChange}
                >
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="cn">🇨🇳 Chinese</option>
                    <option value="id">🇮🇩 Indonesian</option>
                    <option value="ru">🇷🇺 Russian</option>
                </select>
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
