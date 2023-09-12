import styles from './styles.module.scss'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'

//@review: paused -- zoom not working (see NFT gallery)
function Component({
    showModalImg,
    setShowModalImg,
    dataModalImg,
    setDataModalImg,
}) {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const Close = isLight ? CloseBlack : CloseReg
    return (
        <>
            {showModalImg && (
                <>
                    <div className={styles.overlay} />
                    <div className={styles.imgModalWrapper}>
                        <div
                            onClick={() => {
                                setShowModalImg(false)
                                setDataModalImg('')
                            }}
                            className={styles.closeIco}
                        >
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={14}
                                height={14}
                            />
                        </div>
                        <Image
                            className={styles.imgModal}
                            src={dataModalImg}
                            alt="modal-img"
                            layout="fill"
                        />
                    </div>
                </>
            )}
        </>
    )
}

export default Component
