import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import styles from './styles.module.scss'

function Component() {
    const { t } = useTranslation()
    return (
        <div
            onClick={() =>
                toast(t('Coming soon'), {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                })
            }
            className={styles.wrapper}
        >
            Get TYRON for testnet
        </div>
    )
}

export default Component
