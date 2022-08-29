import styles from './styles.module.scss'
import Image from 'next/image'
import { useStore } from 'effector-react'
import {
    $modalWithdrawal,
    updateModalWithdrawal,
} from '../../../src/store/modal'
import { Withdrawals } from '../../'
import Close from '../../../src/assets/icons/ic_cross.svg'
import { useTranslation } from 'next-i18next'

function Modal() {
    const modalWithdrawal = useStore($modalWithdrawal)
    const { t } = useTranslation()

    if (!modalWithdrawal) {
        return null
    }

    return (
        <>
            <div className={styles.outerWrapper}>
                <div
                    className={styles.containerClose}
                    onClick={() => updateModalWithdrawal(false)}
                />
                <div className={styles.container}>
                    <div className={styles.innerContainer}>
                        <div className="closeIcon">
                            <Image
                                alt="close-ico"
                                src={Close}
                                onClick={() => updateModalWithdrawal(false)}
                            />
                        </div>
                        <h2>{t('WITHDRAW FUNDS')}</h2>
                        <div className={styles.contentWrapper}>
                            <Withdrawals />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Modal
