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

    const onDataChange = (index) => {
        setSelectedIndex(index)
    }

    const onConfirm = () => {
        setSelectedData(tokenList[selectedIndex])
        onClose()
    }

    const getTokenList = async () => {
        setLoading(true)
        await fetch(`/api/get-all-sdb`)
            .then(async (response) => {
                const res = await response.json()
                const sdbs = res.data
                    .map(
                        (item: {
                            ratio: number
                            btc: number
                            susd: number
                        }) => ({
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
                    .sort((a, b) => a.ratio - b.ratio)

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

    return (
        <Modal show={show} onClose={onClose}>
            <div
                className={`${styles.modalContainerPurple} ${styles.centered}`}
            >
                <div
                    className={`${styles.modalHeaderPurple} ${styles.centered}`}
                >
                    <div>Select SDB to liquidate</div>
                    <span className={styles.closeIco} onClick={onClose}>
                        <Image width={14} src={CloseIcon} alt="close-ico" />
                    </span>
                </div>
                <div className={`${styles.wrapperToken} ${styles.centered}`}>
                    <div
                        className={`${styles.wrapperTokenList} ${styles.centered}`}
                    >
                        {loading ? (
                            <div className={styles.spinner}>
                                <Spinner />
                            </div>
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
                                        onClick={() =>
                                            val.ratio <= 1.2
                                                ? onDataChange(i)
                                                : {}
                                        }
                                    >
                                        <div
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
                                        <div className={styles.wrapperColumn}>
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
                                            <div
                                                className={styles.tokenWrapper}
                                            >
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
                                        <div className={styles.wrapperColumn}>
                                            <div className={styles.sdbTxt}>
                                                {val.address.slice(0, 17)}
                                                ...
                                            </div>

                                            <div
                                                className={styles.tokenWrapper}
                                            >
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
                        <div className={styles.btnConfirm} onClick={onConfirm}>
                            <div className={styles.txt}>CONFIRMAR</div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
