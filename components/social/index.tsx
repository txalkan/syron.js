import React, { useState, useEffect } from 'react'
import styles from './styles.module.scss'
import { updateDonation } from '../../src/store/donation'
import Image from 'next/image'
import icoDown from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import icoUp from '../../src/assets/icons/ssi_icon_3arrowsUp.svg'
import icoDown2 from '../../src/assets/icons/ssi_icon_2arrowsDown.svg'
import icoUp2 from '../../src/assets/icons/ssi_icon_2arrowsUP.svg'
import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoDrop from '../../src/assets/icons/ssi_icon_drop.svg'
import icoZap from '../../src/assets/icons/ssi_icon_thunder.svg'
import icoFire from '../../src/assets/icons/ssi_icon_fire.svg'
import icoTree from '../../src/assets/icons/ssi_icon_didx_social-tree.svg'
import icoRecSoc from '../../src/assets/icons/ssi_icon_didx_rec-social.svg'

import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import CloseIcoReg from '../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../src/assets/icons/ic_cross_black.svg'

import { SocialRecovery, SocialTree } from '..'
function Component() {
    const [active, setActive] = useState('')
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            setActive(id)
        }
    }
    const resetState = () => {
        updateDonation(null)
    }

    const [activeAcc, setActiveAcc] = useState('')
    const toggleActiveAcc = (id: string) => {
        if (id === activeAcc) {
            setActiveAcc('')
        } else {
            setActiveAcc(id)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('account')}
                    className={
                        active === 'account' ? styles.cardActive : styles.card
                    }
                >
                    <div className={styles.icoWrapper2}>
                        <Image src={icoFire} alt="fire-ico" />
                        <div className={styles.title}>social</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'account' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'account' && (
                    <div className={styles.cardSub}>
                        <div className={styles.closeIcoWrapper}>
                            <div
                                onClick={() => toggleActive('')}
                                className={styles.closeIco}
                            >
                                <Image
                                    width={10}
                                    src={CloseIco}
                                    alt="close-ico"
                                />
                            </div>
                        </div>
                        <div className={styles.wrapper}>
                            <div className={styles.subWrapper}>
                                <div
                                    onClick={() => toggleActiveAcc('tree')}
                                    className={
                                        activeAcc === 'tree'
                                            ? styles.cardActive2
                                            : styles.card2
                                    }
                                >
                                    {/* @review: majin translates */}
                                    <div className={styles.icoWrapper2}>
                                        <Image src={icoTree} alt="tree-ico" />
                                        <div className={styles.title2}>
                                            {' '}
                                            social tree
                                        </div>
                                    </div>
                                    <div className={styles.icoWrapper}>
                                        <Image
                                            src={
                                                activeAcc === 'tree'
                                                    ? icoUp2
                                                    : icoDown2
                                            }
                                            alt="toggle-ico"
                                        />
                                    </div>
                                </div>
                                {activeAcc === 'tree' && (
                                    <div className={styles.cardSub2}>
                                        <div className={styles.closeIcoWrapper}>
                                            <div
                                                onClick={() =>
                                                    toggleActiveAcc('')
                                                }
                                                className={styles.closeIco}
                                            >
                                                <Image
                                                    width={10}
                                                    src={CloseIco}
                                                    alt="close-ico"
                                                />
                                            </div>
                                        </div>
                                        <SocialTree />
                                    </div>
                                )}
                            </div>
                            {/* @dev: social recovery */}
                            <div className={styles.subWrapper}>
                                <div
                                    onClick={() => toggleActiveAcc('recovery')}
                                    className={
                                        activeAcc === 'recovery'
                                            ? styles.cardActive2
                                            : styles.card2
                                    }
                                >
                                    {/* @review: translates */}
                                    <div className={styles.icoWrapper2}>
                                        <Image
                                            src={icoRecSoc}
                                            alt="recsoc-ico"
                                        />
                                        <div className={styles.title2}>
                                            social recovery
                                        </div>
                                    </div>
                                    {/* </div> */}
                                    <div className={styles.icoWrapper}>
                                        <Image
                                            src={
                                                activeAcc === 'recovery'
                                                    ? icoUp2
                                                    : icoDown2
                                            }
                                            alt="toggle-ico"
                                        />
                                    </div>
                                </div>
                                {activeAcc === 'recovery' && (
                                    <div className={styles.cardSub2}>
                                        <div className={styles.closeIcoWrapper}>
                                            <div
                                                onClick={() =>
                                                    toggleActiveAcc('')
                                                }
                                                className={styles.closeIco}
                                            >
                                                <Image
                                                    width={10}
                                                    src={CloseIco}
                                                    alt="close-ico"
                                                />
                                            </div>
                                        </div>
                                        <SocialRecovery />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
