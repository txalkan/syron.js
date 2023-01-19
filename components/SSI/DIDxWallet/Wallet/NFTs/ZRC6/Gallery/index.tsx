/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import { Arrow, ModalImg, Spinner, ThunderIco } from '../../../../../..'
import { updateSelectedCollectiblesDropdown } from '../../../../../../../src/app/actions'
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkReg from '../../../../../../../src/assets/icons/selected_checkmark.svg'
import selectedCheckmarkPurple from '../../../../../../../src/assets/icons/selected_checkmark_purple.svg'
import arrowDown from '../../../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../../../src/assets/icons/arrow_up_white.svg'
import fetch from '../../../../../../../src/hooks/fetch'
import {
    updateNftModal,
    updateSelectedNft,
} from '../../../../../../../src/store/modal'
import CloseReg from '../../../../../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../../../../../src/assets/icons/ic_cross_black.svg'

function Component() {
    const dispatch = useDispatch()
    const { getNftsWallet } = fetch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = isLight ? stylesLight : stylesDark
    const selectedCheckmark = isLight
        ? selectedCheckmarkPurple
        : selectedCheckmarkReg
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const [loadingNftList, setLoadingNftList] = useState(false)
    const [tokenUri, setTokenUri] = useState(Array())
    const selectedCollectiblesDropdown = loginInfo?.selectedCollectiblesDropdown
    const [showCollectiblesDropdown, setShowCollectiblesDropdown] =
        useState(false)
    const [showModalImg, setShowModalImg] = useState(false)
    const [dataModalImg, setDataModalImg] = useState('')
    const tydras = ['nawelito', 'nawelitoonfire', 'nessy']

    const checkIsExist = (val) => {
        if (selectedCollectiblesDropdown?.some((arr) => arr === val)) {
            return true
        } else {
            return false
        }
    }

    const selectCollectibles = (val) => {
        if (!checkIsExist(val)) {
            let arr = selectedCollectiblesDropdown
            arr.push(val)
            dispatch(updateSelectedCollectiblesDropdown(arr))
        } else {
            let arr = selectedCollectiblesDropdown.filter((arr) => arr !== val)
            dispatch(updateSelectedCollectiblesDropdown(arr))
            let arrToken = tokenUri.filter((arr) => arr.type !== val)
            setTokenUri(arrToken)
        }
    }

    const fetchAllNft = async (data) => {
        try {
            for (let i = 0; i < data?.length; i += 1) {
                setLoadingNftList(true)
                getNftsWallet(data[i]).then((res) => {
                    for (i = 0; i < res?.token.length; i += 1) {
                        if (res?.token?.[i]) {
                            if (
                                !tokenUri?.some(
                                    (arr) => arr.name === res?.token[i]?.name
                                )
                            ) {
                                let arr = tokenUri
                                arr.push(res?.token[i])
                                setTokenUri(arr)
                            }
                        }
                    }
                    setTimeout(() => {
                        setLoadingNftList(false)
                    }, 3000)
                })
            }
        } catch (err) {
            console.log(err)
            setLoadingNftList(false)
        }
    }

    const showAll = () => {
        let arr: any = []
        for (let i = 0; i < optionNft.length; i += 1) {
            const val = optionNft[i].value
            arr.push(val)
            dispatch(updateSelectedCollectiblesDropdown(arr))
        }
        fetchAllNft(arr)
    }

    const hideAll = () => {
        dispatch(updateSelectedCollectiblesDropdown([]))
        setTokenUri([])
    }

    const doubleClickMobile = (val) => {
        if (screen.width < 700) {
            setDataModalImg(val)
            if (dataModalImg == val) {
                setShowModalImg(true)
            }
        }
    }

    useEffect(() => {
        fetchAllNft(selectedCollectiblesDropdown)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const optionNft = [
        {
            value: 'nawelito',
            label: 'Nawelito',
        },
        {
            value: 'nawelitoonfire',
            label: 'Nawelito ON FIRE',
        },
        {
            value: 'nessy',
            label: 'Nessy',
        },
        {
            value: 'lexicassi',
            label: 'Lexica.art SSI NFTs',
        },
        {
            value: 'ddk10',
            label: 'DDK10',
        },
    ]

    return (
        <div className={styles.content}>
            <h3>
                <div style={{ marginBottom: '1rem' }}>Gallery</div>
            </h3>
            {loadingNftList ? (
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className={styles.dropdownCheckListWrapper}>
                        <div style={{ display: 'flex' }}>
                            <div
                                onClick={() =>
                                    setShowCollectiblesDropdown(
                                        !showCollectiblesDropdown
                                    )
                                }
                                className={styles.dropdownCheckList}
                            >
                                Show other collectables&nbsp;&nbsp;
                                <Image
                                    src={
                                        showCollectiblesDropdown
                                            ? arrowUp
                                            : arrowDown
                                    }
                                    alt="arrow"
                                />
                            </div>
                            <div className={styles.wrapperIcoContinue}>
                                <div
                                    onClick={() => {
                                        fetchAllNft(
                                            selectedCollectiblesDropdown
                                        )
                                        setShowCollectiblesDropdown(false)
                                    }}
                                >
                                    <Arrow />
                                </div>
                            </div>
                        </div>
                        {showCollectiblesDropdown && (
                            <>
                                <div
                                    className={styles.closeWrapper}
                                    onClick={() => {
                                        fetchAllNft(
                                            selectedCollectiblesDropdown
                                        )
                                        setShowCollectiblesDropdown(false)
                                    }}
                                />
                                <div className={styles.wrapperOption}>
                                    {optionNft.map((val, i) => (
                                        <div
                                            key={i}
                                            className={styles.option}
                                            onClick={() =>
                                                selectCollectibles(val.value)
                                            }
                                        >
                                            {checkIsExist(val.value) ? (
                                                <div
                                                    className={styles.optionIco}
                                                >
                                                    <Image
                                                        src={selectedCheckmark}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className={styles.optionIco}
                                                >
                                                    <Image
                                                        src={defaultCheckmark}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            )}
                                            <div className={styles.txt}>
                                                {val.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div>
                        {tokenUri.length === 0 && (
                            <div>You don&apos;t have any NFTs</div>
                        )}
                        <div className={styles.wrapperGallery}>
                            {tokenUri.map((val, i) => (
                                <div
                                    className={styles.wrapperNftOption}
                                    key={i}
                                >
                                    {tydras?.some(
                                        (val_) => val_ === val.type
                                    ) ? (
                                        <div className={styles.wrapperNftImg}>
                                            <img
                                                style={{ cursor: 'pointer' }}
                                                onDoubleClick={() => {
                                                    setDataModalImg(
                                                        `data:image/png;base64,${val.name}`
                                                    )
                                                    setShowModalImg(true)
                                                }}
                                                onClick={() =>
                                                    doubleClickMobile(
                                                        `data:image/png;base64,${val.name}`
                                                    )
                                                }
                                                width={100}
                                                src={`data:image/png;base64,${val.name}`}
                                                alt="tydra-img"
                                            />
                                            {dataModalImg?.slice(-10) ===
                                                val.name?.slice(-10) && (
                                                <ModalImg
                                                    showModalImg={showModalImg}
                                                    setShowModalImg={
                                                        setShowModalImg
                                                    }
                                                    dataModalImg={dataModalImg}
                                                    setDataModalImg={
                                                        setDataModalImg
                                                    }
                                                />
                                            )}
                                            <ThunderIco
                                                onClick={() => {
                                                    updateSelectedNft(
                                                        val.type + '#' + val.id
                                                    )
                                                    updateNftModal(true)
                                                }}
                                                type="regular"
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.wrapperNftImg}>
                                            <img
                                                style={{ cursor: 'pointer' }}
                                                onDoubleClick={() => {
                                                    setDataModalImg(
                                                        `${val.uri}${val.name}`
                                                    )
                                                    setShowModalImg(true)
                                                }}
                                                onClick={() =>
                                                    doubleClickMobile(
                                                        `${val.uri}${val.name}`
                                                    )
                                                }
                                                width={100}
                                                src={`${val.uri}${val.name}`}
                                                alt="lexica-img"
                                            />
                                            {dataModalImg ===
                                                `${val.uri}${val.name}` && (
                                                <ModalImg
                                                    showModalImg={showModalImg}
                                                    setShowModalImg={
                                                        setShowModalImg
                                                    }
                                                    dataModalImg={dataModalImg}
                                                    setDataModalImg={
                                                        setDataModalImg
                                                    }
                                                />
                                            )}
                                            <ThunderIco
                                                onClick={() => {
                                                    updateSelectedNft(
                                                        val.type + '#' + val.id
                                                    )
                                                    updateNftModal(true)
                                                }}
                                                type="regular"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginTop: '1rem',
                            justifyContent: 'center',
                        }}
                    >
                        <div onClick={showAll} className="button small">
                            SHOW ALL
                        </div>
                        &nbsp;
                        <div onClick={hideAll} className="button small">
                            HIDE ALL
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Component
