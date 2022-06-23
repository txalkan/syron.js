import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styles from '../../styles/css/Footer.module.css'
import Image from 'next/image'
import TyronLogo from '../../src/assets/logos/tyron_logo.png'
import { $language, updateLanguage } from '../../src/store/language'
import { useStore } from 'effector-react'

function Footer() {
    const { i18n } = useTranslation()
    const language = useStore($language)

    const handleOnChange = (event: { target: { value: any } }) => {
        updateLanguage(event.target.value)
        i18n.changeLanguage(event.target.value)
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.languageSelectorWrapper}>
                <select value={language} onChange={handleOnChange}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="zh">Chinese</option>
                    <option value="id">Indonesian</option>
                    <option value="ru">Russian</option>
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
