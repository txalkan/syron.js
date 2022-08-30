import Close from '../../../src/assets/icons/ic_cross.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useStore } from 'effector-react'
import {
    $modalAddFunds,
    $selectedCurrency,
    updateModalAddFunds,
} from '../../../src/store/modal'
import { AddFunds } from '../../'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useState } from 'react'
import { updateOriginatorAddress } from '../../../src/store/originatorAddress'

function Modal() {
    const modalAddFunds = useStore($modalAddFunds)
    const currency = useStore($selectedCurrency)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const closeModal = () => {
        updateOriginatorAddress(null)
        updateModalAddFunds(false)
    }

    if (!modalAddFunds) {
        return null
    }

    return (
        <>
            <div className={styles.outerWrapper}>
                <div className={styles.containerClose} onClick={closeModal} />
                <div className={styles.container}>
                    <div className={styles.innerContainer}>
                        <div className="closeIcon">
                            <Image
                                alt="close-ico"
                                src={Close}
                                onClick={closeModal}
                            />
                        </div>
                        <div className={styles.contentWrapper}>
                            <AddFunds type="modal" coin={currency!} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Modal
