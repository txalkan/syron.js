import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useStore } from 'effector-react'
import {
    $modalAddFunds,
    $selectedCurrency,
    updateModalAddFunds,
} from '../../../src/store/modal'
import { AddFunds } from '../..'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useState } from 'react'
import { updateOriginatorAddress } from '../../../src/store/originatorAddress'

function Modal() {
    const modalAddFunds = useStore($modalAddFunds)
    const currency = useStore($selectedCurrency)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg

    const closeModal = () => {
        updateOriginatorAddress(null)
        updateModalAddFunds(false)
    }

    const outerClose = () => {
        //@todo-l
        if (window.confirm('Are you sure about closing this window?')) {
            closeModal()
        }
    }

    if (!modalAddFunds) {
        return null
    }

    return (
        <>
            <div className={styles.containerClose} onClick={outerClose} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className="closeIcon">
                        <Image
                            alt="close-ico"
                            src={Close}
                            onClick={outerClose}
                        />
                    </div>
                    <div className={styles.contentWrapper}>
                        <AddFunds type="modal" token={currency!} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Modal
