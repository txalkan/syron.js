import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from '../styles.module.scss'
import stylesLight from '../styleslight.module.scss'
import Image from 'next/image'
import { useStore } from 'effector-react'
import { $selectedCurrency } from '../../../src/store/modal'

import { Modal } from '../../modal'
import { AddFunds } from '../..'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { updateOriginatorAddress } from '../../../src/store/originatorAddress'

type Prop = {
    show: boolean
    onClose: () => void
}

var AddFundsModal: React.FC<Prop> = function ({ show, onClose }) {
    const currency = useStore($selectedCurrency)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg

    const closeModal = () => {
        updateOriginatorAddress(null)
        onClose()
    }

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.container}>
                <div className="closeIcon">
                    <Image alt="close-ico" src={Close} onClick={closeModal} />
                </div>
                <div className={styles.contentWrapper}>
                    <AddFunds type="modal" token={currency!} />
                </div>
            </div>
        </Modal>
    )
}

export default AddFundsModal
