/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import { Spinner } from '../../../../../..'
import { updateSelectedCollectiblesDropdown } from '../../../../../../../src/app/actions'
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmark from '../../../../../../../src/assets/icons/selected_checkmark.svg'
import arrowDown from '../../../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../../../src/assets/icons/arrow_up_white.svg'
import ContinueArrow from '../../../../../../../src/assets/icons/continue_arrow.svg'
import fetch from '../../../../../../../src/hooks/fetch'
import {
    updateNftModal,
    updateSelectedNft,
} from '../../../../../../../src/store/modal'

function Component({ defaultOpt }) {
    const dispatch = useDispatch()
    const { getNftsWallet } = fetch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = isLight ? stylesLight : stylesDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const [loadingNftList, setLoadingNftList] = useState(false)
    const [tokenUri, setTokenUri] = useState(Array())
    const selectedCollectiblesDropdown = loginInfo?.selectedCollectiblesDropdown
    const selectedCollectibles = [defaultOpt, ...selectedCollectiblesDropdown]
    const [showCollectiblesDropdown, setShowCollectiblesDropdown] =
        useState(false)
    const tydras = ['nawelito', 'nawelitoonfire', 'nessy']

    const checkIsExist = (val) => {
        if (selectedCollectibles.some((arr) => arr === val)) {
            return true
        } else {
            return false
        }
    }

    const selectCollectibles = (val) => {
        if (!checkIsExist(val)) {
            let arr = selectedCollectiblesDropdown.filter(
                (arr) => arr !== defaultOpt
            )
            arr.push(val)
            dispatch(updateSelectedCollectiblesDropdown(arr))
        } else {
            let arr = selectedCollectiblesDropdown.filter((arr) => arr !== val)
            dispatch(updateSelectedCollectiblesDropdown(arr))
            if (val !== defaultOpt) {
                let arrToken = tokenUri.filter((arr) => arr.type !== val)
                setTokenUri(arrToken)
            }
        }
    }

    const fetchAllNft = async (data) => {
        for (let i = 0; i < data.length; i += 1) {
            console.log(data[i])
            setLoadingNftList(true)
            getNftsWallet(data[i]).then((res) => {
                for (i = 0; i < res?.token.length; i += 1) {
                    console.log(tokenUri)
                    if (res?.token?.[i]) {
                        if (
                            !tokenUri.some(
                                (arr) => arr.name === res?.token[i]?.name
                            )
                        ) {
                            let arr = tokenUri
                            arr.push(res?.token[i])
                            setTokenUri(arr)
                        }
                    }
                }
                setLoadingNftList(false)
            })
        }
    }

    const showAll = () => {
        let arr: any = []
        for (let i = 0; i < optionNft.length; i += 1) {
            const val = optionNft[i].value
            arr.push(val)
            dispatch(updateSelectedCollectiblesDropdown(arr))
        }
        fetchAllNft([defaultOpt, ...arr])
    }

    const hideAll = () => {
        dispatch(updateSelectedCollectiblesDropdown([]))
        let arrToken = tokenUri.filter((arr) => arr.type === defaultOpt)
        setTokenUri(arrToken)
        fetchAllNft([defaultOpt])
    }

    useEffect(() => {
        fetchAllNft([defaultOpt, ...selectedCollectiblesDropdown])
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
        <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>Gallery</div>
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
                                Show other collectibles&nbsp;&nbsp;
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
                                    className={'continueBtn'}
                                    onClick={() => {
                                        fetchAllNft([
                                            defaultOpt,
                                            ...selectedCollectiblesDropdown,
                                        ])
                                        setShowCollectiblesDropdown(false)
                                    }}
                                >
                                    <Image src={ContinueArrow} alt="arrow" />
                                </div>
                            </div>
                        </div>
                        {showCollectiblesDropdown && (
                            <>
                                <div
                                    className={styles.closeWrapper}
                                    onClick={() => {
                                        fetchAllNft([
                                            defaultOpt,
                                            ...selectedCollectiblesDropdown,
                                        ])
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
                                    {tydras.some(
                                        (val_) => val_ === val.type
                                    ) ? (
                                        <div className={styles.wrapperNftImg}>
                                            <img
                                                width={100}
                                                src={`data:image/png;base64,${val.name}`}
                                                alt="tydra-img"
                                            />
                                            <div
                                                onClick={() => {
                                                    updateSelectedNft(
                                                        val.type + '#' + val.id
                                                    )
                                                    updateNftModal(true)
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                &#9889;
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.wrapperNftImg}>
                                            <img
                                                width={100}
                                                src={`${val.uri}${val.name}`}
                                                alt="lexica-img"
                                            />
                                            <div
                                                onClick={() => {
                                                    updateSelectedNft(
                                                        val.type + '#' + val.id
                                                    )
                                                    updateNftModal(true)
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                &#9889;
                                            </div>
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
