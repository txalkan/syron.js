import React from 'react'
import styles from '../../styles/css/Footer.module.css'
import Image from 'next/image'
import TyronLogo from '../../src/assets/logos/tyron_logo.png'

function Footer() {
    return (
        <footer className={styles.footer} style={{ marginLeft: '4%' }}>
            <div
                onClick={() => window.open('http://tyron.network')}
                style={{ cursor: 'pointer' }}
            >
                <Image
                    width={75}
                    height={50}
                    src={TyronLogo}
                    alt="tyron-logo"
                />
            </div>
        </footer>
    )
}

export default Footer
