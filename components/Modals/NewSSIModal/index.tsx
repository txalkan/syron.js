import { useStore } from 'effector-react'
import Image from 'next/image'
import CloseIconReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIconBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $modalNewSsi, updateModalNewSsi } from '../../../src/store/modal'
import { BuyNFTSearchBar } from '../..'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'

function Component() {
    const { t } = useTranslation()
    const modalNewSsi = useStore($modalNewSsi)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const CloseIcon = isLight ? CloseIconBlack : CloseIconReg

    if (!modalNewSsi) {
        return null
    }

    const outerClose = () => {
        if (window.confirm('Do you really want to close the modal?')) {
            updateModalNewSsi(false)
        }
    }

    return (
        <>
            <div onClick={outerClose} className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className="closeIcon" onClick={outerClose}>
                        <Image alt="close-ico" src={CloseIcon} />
                    </div>
                    <div className={styles.contentWrapper}>
                        <BuyNFTSearchBar />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
