import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { RootState } from '../../../src/app/reducers'
import toastTheme from '../../../src/hooks/toastTheme'
import styles from './styles.module.scss'

function Component() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    return (
        <div
            onClick={() =>
                toast('Coming soon', {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
            }
            className={styles.wrapper}
        >
            Testnet TYRON
        </div>
    )
}

export default Component
