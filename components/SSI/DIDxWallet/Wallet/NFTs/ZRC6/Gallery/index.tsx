/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import { Arrow, ModalImg, ThunderIco } from '../../../../../..'
import { updateSelectedCollectiblesDropdown } from '../../../../../../../src/app/actions'
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkReg from '../../../../../../../src/assets/icons/selected_checkmark.svg'
// import selectedCheckmarkPurple from '../../../../../../../src/assets/icons/selected_checkmark_purple.svg'
import arrowDown from '../../../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../../../src/assets/icons/arrow_up_white.svg'
import fetch from '../../../../../../../src/hooks/fetch'
import {
    updateNftModal,
    updateSelectedNft,
} from '../../../../../../../src/store/modal'
import ThreeDots from '../../../../../../Spinner/ThreeDots'
import { optionAddr } from '../../../../../../../src/constants/mintDomainName'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { getNftsWallet } = fetch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = isLight ? stylesLight : stylesDark
    const selectedCheckmark =
        // isLight
        //     ? selectedCheckmarkPurple
        //     :
        selectedCheckmarkReg
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const [loading, setLoading] = useState(false)
    const [tokenUri, setTokenUri] = useState(Array())
    const selectedCollectiblesDropdown = loginInfo?.selectedCollectiblesDropdown
    const [showCollectiblesDropdown, setShowCollectiblesDropdown] =
        useState(false)
    const [showModalImg, setShowModalImg] = useState(false)
    const [dataModalImg, setDataModalImg] = useState('')

    //@tydras-mainnet
    const tydras = [
        'nawelito',
        'nawelitoonfire',
        'nessy',
        'merxek',
        'ognawelito',
    ]

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
                setLoading(true)
                getNftsWallet(data[i])
                    .then((res) => {
                        // console.log('NFT GALLERY:', JSON.stringify(res))
                        for (i = 0; i < res?.tokenUris.length; i += 1) {
                            if (res?.tokenUris?.[i]) {
                                if (
                                    !tokenUri?.some(
                                        (arr) =>
                                            arr.name === res?.tokenUris[i]?.name
                                    )
                                ) {
                                    let arr = tokenUri
                                    arr.push(res?.tokenUris[i])
                                    setTokenUri(arr)
                                }
                            }
                        }
                        setTimeout(() => {
                            setLoading(false)
                        }, 3000)
                    })
                    .catch((e) => {
                        throw e
                    })
            }
        } catch (err) {
            console.log('ERROR fetchAllNft', err)
            setLoading(false)
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

    //@mainnet-tydras
    const optionTydras = [
        {
            value: 'nawelito',
            label: 'OG Nawelito SBT',
        },
        {
            value: 'nawelitoonfire',
            label: 'Nawelito ToT NFT',
        },
        {
            value: 'nessy',
            label: 'Nessy ToT NFT',
        },
        {
            value: 'merxek',
            label: 'MerXek ToT NFT',
        },
        {
            value: 'ognawelito',
            label: 'OG Nawelito ToT NFT',
        },
    ]
    const optionNft = [...optionTydras, ...optionAddr]
    return (
        <div className={styles.content}>
            <div className={styles.title}>{t('NFT GALLERY')}</div>
            {loading ? (
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <ThreeDots color="#fffd32" />
                </div>
            ) : (
                <>
                    <div className={styles.dropdownCheckListWrapper}>
                        <div className={styles.selector}>
                            <div
                                onClick={() =>
                                    setShowCollectiblesDropdown(
                                        !showCollectiblesDropdown
                                    )
                                }
                                className={styles.dropdownCheckList}
                            >
                                Show collectables&nbsp;&nbsp;
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
                            <div className={styles.list}>
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
                            </div>
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
                                                // @review: paused
                                                // style={{ cursor: 'pointer' }}
                                                // onDoubleClick={() => {
                                                //     setDataModalImg(
                                                //         `data:image/png;base64,${val.name}`
                                                //     )
                                                //     setShowModalImg(true)
                                                // }}
                                                // onClick={() =>
                                                //     doubleClickMobile(
                                                //         `data:image/png;base64,${val.name}`
                                                //     )
                                                // }
                                                width={111}
                                                src={`data:image/png;base64,${val.name}`}
                                                alt="nft-gallery-img"
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
                                                // @review: paused
                                                // style={{ cursor: 'pointer' }}
                                                // onDoubleClick={() => {
                                                //     setDataModalImg(
                                                //         `${val.uri}${val.name}`
                                                //     )
                                                //     setShowModalImg(true)
                                                // }}
                                                // onClick={() =>
                                                //     doubleClickMobile(
                                                //         `${val.uri}${val.name}`
                                                //     )
                                                // }
                                                width={155}
                                                src={`${val.uri}${val.name}`}
                                                alt="nft-gallery-img"
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
