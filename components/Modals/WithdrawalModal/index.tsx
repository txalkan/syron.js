import stylesDark from '../styles.module.scss'
import stylesLight from '../styleslight.module.scss'
import Image from 'next/image'
import { Withdrawals } from '../..'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { Modal } from '../../modal'

type Prop = {
    show: boolean
    onClose: () => void
}
var SendModal: React.FC<Prop> = function ({ show, onClose }) {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg

    const closeModal = () => {
        onClose()
    }

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.container}>
                <div className="closeIcon">
                    <Image alt="close-ico" src={Close} onClick={closeModal} />
                </div>
                <div className={styles.txt}>{t('WITHDRAW FUNDS')}</div>
                <div className={styles.contentWrapper}>
                    <Withdrawals />
                </div>
            </div>
        </Modal>
    )
}

export default SendModal
