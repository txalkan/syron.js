import React from 'react'
import { useStore } from 'effector-react'
import {
    $modalTxMinimized,
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
import ArrowReg from '../../../../src/assets/icons/right_down.svg'
import ArrowDark from '../../../../src/assets/icons/right_down_black.svg'
import Tick from '../../../../src/assets/icons/tick.svg'
import Close from '../../../../src/assets/logos/close.png'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'

function Component() {
    const modalTxMinimized = useStore($modalTxMinimized)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Arrow = isLight ? ArrowDark : ArrowReg

    const restore = () => {
        updateModalTxMinimized(false)
        updateModalTx(true)
    }

    const spinner = (
        <i
            style={{ color: 'silver', fontSize: '30px' }}
            className="fa fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    if (!modalTxMinimized) {
        return null
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div onClick={restore} className={styles.closeIco}>
                            <Image
                                alt="ico-restore"
                                src={Arrow}
                                width={20}
                                height={20}
                            />
                        </div>
                        <div className={styles.contentWrapper}>
                            <h5 className={styles.headerTxt}>
                                Transaction Status
                            </h5>
                            {loginInfo.txStatusLoading === 'confirmed' ? (
                                <div
                                    style={{
                                        height: '40px',
                                        width: '40px',
                                        marginBottom: '-1px',
                                    }}
                                >
                                    <Image
                                        alt="ico-restore"
                                        src={Tick}
                                        width={40}
                                        height={40}
                                    />
                                </div>
                            ) : loginInfo.txStatusLoading === 'failed' ||
                              loginInfo.txStatusLoading === 'rejected' ? (
                                <div>
                                    <Image
                                        alt="ico-restore"
                                        src={Close}
                                        width={15}
                                        height={15}
                                    />
                                </div>
                            ) : (
                                <div style={{ padding: '3px' }}>{spinner}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
