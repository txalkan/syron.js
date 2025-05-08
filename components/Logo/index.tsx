import styles from './styles.module.scss'
import Image from 'next/image'
import TyronDAOLogo from '../../src/assets/logos/tyrondao_logotype_dark.svg'

function Component() {
    return (
        <div
            onClick={() => {
                window.open('http://tyrondao.org')
            }}
            className={styles.tyronLg}
        >
            <Image
                priority={true}
                src={TyronDAOLogo}
                alt="tyrondao-logo"
                className={styles.tyronImg}
            />
        </div>
    )
}

export default Component
