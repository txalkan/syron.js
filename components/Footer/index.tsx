import styles from '../../styles/css/Footer.module.css'
import Image from 'next/image'
import TyronLogo from '../../src/assets/logos/tyron_logo.png'
import Link from 'next/link'

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.languageSelectorWrapper}>
                <Link href="/" locale={'en'} passHref>
                    <div className={styles.languageLink}>EN</div>
                </Link>
                <Link href="/" locale={'es'} passHref>
                    <div>
                        &nbsp;|&nbsp;
                        <span className={styles.languageLink}>ES</span>
                    </div>
                </Link>
                <Link href="/" locale={'cn'} passHref>
                    <div>
                        &nbsp;|&nbsp;
                        <span className={styles.languageLink}>CN</span>
                    </div>
                </Link>
                <Link href="/" locale={'id'} passHref>
                    <div>
                        &nbsp;|&nbsp;
                        <span className={styles.languageLink}>ID</span>
                    </div>
                </Link>
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
