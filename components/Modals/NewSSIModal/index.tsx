import { useStore } from 'effector-react'
import Image from 'next/image'
import CloseIcon from '../../../src/assets/icons/ic_cross.svg'
import styles from './styles.module.scss'
import { $modalNewSsi, updateModalNewSsi } from '../../../src/store/modal'
import { BuyNFTSearchBar } from '../..'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const modalNewSsi = useStore($modalNewSsi)

    if (!modalNewSsi) {
        return null
    }

    return (
        <>
            <div
                onClick={() => updateModalNewSsi(false)}
                className={styles.outerWrapper}
            />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div
                        className="closeIcon"
                        onClick={() => {
                            updateModalNewSsi(false)
                        }}
                    >
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
