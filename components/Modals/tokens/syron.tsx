/*
ZilPay.io
Copyright (c) 2023 by Rinat <https://github.com/hicaru>
All rights reserved.
You acknowledge and agree that ZilPay owns all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this file (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this software.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of ZilPay; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by ZilPay in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of ZilPay or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*/

import styles from './index.module.scss'

import { useStore } from 'react-stores'
import React, { useEffect, useState } from 'react'
import { Modal, ModalHeader } from '../../modal'
import Image from 'next/image'
import CloseIcon from '../../../src/assets/icons/ic_cross_black.svg'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import icoSU$D from '../../../src/assets/icons/ssi_SU$D_iso.svg'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../src/utils/firebase/firebaseConfig'
import Spinner from '../../Spinner'

type Prop = {
    show: boolean
    onClose: () => void
    selectedIndex: number
    setSelectedIndex: (index) => void
    setSelectedData: (data) => void
}

export var SyronTokenModal: React.FC<Prop> = function ({
    show,
    onClose,
    setSelectedIndex,
    setSelectedData,
    selectedIndex,
}) {
    const [tokenList, setTokenList] = useState<any>([])
    const [loading, setLoading] = useState(false)

    const onDataChange = (data, index) => {
        setSelectedIndex(index)
        setSelectedData(data)
    }

    const getTokenList = async () => {
        setLoading(true)
        await fetch(`/api/get-all-sdb`)
            .then(async (response) => {
                const res = await response.json()
                const sdbs = res.data.map(
                    (item: { ratio: number; btc: number; susd: number }) => ({
                        ...item,
                        ratio: item.ratio / 10000,
                        btc: (item.btc / 1e8).toLocaleString('de-DE', {
                            minimumFractionDigits: 8,
                            maximumFractionDigits: 8,
                        }),
                        susd: (item.susd / 1e8).toLocaleString('de-DE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        }),
                    })
                )
                setTokenList(sdbs)
                setLoading(false)
            })
            .catch((error) => {
                setLoading(false)
                console.log(error)
            })
    }

    useEffect(() => {
        getTokenList()
    }, [])

    // const tokenList = [
    //     {
    //         ratio: 1.15,
    //         btc: 0.143242,
    //         address: 'tajb35766dhasdas6d675asdas7d',
    //         susd: 152.3,
    //     },
    //     {
    //         ratio: 1.16,
    //         btc: 0.143242,
    //         address: 'tajb35766dhasdas6d675asdas7d',
    //         susd: 154.3,
    //     },
    //     {
    //         ratio: 1.17,
    //         btc: 0.143242,
    //         address: 'tajb35766dhasdas6d675asdas7d',
    //         susd: 134.3,
    //     },
    //     {
    //         ratio: 1.18,
    //         btc: 0.143242,
    //         address: 'tajb35766dhasdas6d675asdas7d',
    //         susd: 786.3,
    //     },
    //     {
    //         ratio: 1.18,
    //         btc: 0.143242,
    //         address: 'tajb35766dhasdas6d675asdas7d',
    //         susd: 666.3,
    //     },
    //     {
    //         ratio: 1.25,
    //         btc: 0.143242,
    //         address: 'tajb35766dhasdas6d675asdas7d',
    //         susd: 152.3,
    //     },
    // ]

    return (
        <Modal show={show} onClose={onClose}>
            <div className={styles.modalContainerPurple}>
                <div className={styles.modalHeaderPurple}>
                    <div>Select SDB to liquidate</div>
                    <span className={styles.closeIco} onClick={onClose}>
                        <Image width={14} src={CloseIcon} alt="close-ico" />
                    </span>
                </div>
                <div className={styles.wrapperToken}>
                    <div className={styles.wrapperTokenList}>
                        {loading ? (
                            <Spinner />
                        ) : (
                            <>
                                {tokenList.map((val, i) => (
                                    <div
                                        key={i}
                                        className={
                                            val.ratio <= 1.2
                                                ? styles.tokenRow
                                                : styles.tokenRowDisabled
                                        }
                                    >
                                        <div
                                            onClick={() =>
                                                val.ratio <= 1.2
                                                    ? onDataChange(val, i)
                                                    : {}
                                            }
                                            className={
                                                val.ratio <= 1.2
                                                    ? styles.outerRadio
                                                    : styles.outerRadioDisabled
                                            }
                                        >
                                            {i === selectedIndex && (
                                                <div
                                                    className={
                                                        styles.innerRadio
                                                    }
                                                />
                                            )}
                                        </div>
                                        <div
                                            className={styles.tokenInfoWrapper}
                                        >
                                            <div className={styles.cRatioTxt}>
                                                C. Ratio ={' '}
                                                {val.ratio.toLocaleString(
                                                    'de-DE',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </div>
                                            <div className={styles.btcWrapper}>
                                                <Image
                                                    className={
                                                        styles.tokenImage
                                                    }
                                                    src={icoBTC}
                                                    alt="tokens-logo"
                                                />
                                                <div className={styles.btcTxt}>
                                                    {val.btc}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className={styles.tokenInfoWrapper}
                                        >
                                            <div className={styles.sdbTxt}>
                                                SDB: {val.address.slice(0, 25)}
                                                ...
                                            </div>
                                            <div
                                                className={styles.sdbTxtMobile}
                                            >
                                                SDB: {val.address.slice(0, 14)}
                                                ...
                                            </div>
                                            <div className={styles.btcWrapper}>
                                                <Image
                                                    className={
                                                        styles.tokenImage
                                                    }
                                                    src={icoSU$D}
                                                    alt="tokens-logo"
                                                />
                                                <div className={styles.susdTxt}>
                                                    {val.susd}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <div className={styles.btnConfirmWrapper}>
                        <div className={styles.btnConfirm} onClick={onClose}>
                            <div className={styles.txt}>CONFIRMAR</div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
