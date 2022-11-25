/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import ThreeDots from '../../../../../../Spinner/ThreeDots'
import { $donation } from '../../../../../../../src/store/donation'
import { Donate, Spinner } from '../../../../../..'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import {
    setTxId,
    setTxStatusLoading,
    updateSelectedCollectiblesDropdown,
} from '../../../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import smartContract from '../../../../../../../src/utils/smartContract'
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmark from '../../../../../../../src/assets/icons/selected_checkmark.svg'
import arrowDown from '../../../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../../../src/assets/icons/arrow_up_white.svg'
import ContinueArrow from '../../../../../../../src/assets/icons/continue_arrow.svg'
import fetch from '../../../../../../../src/hooks/fetch'

function Component({ defaultOpt }) {
    const dispatch = useDispatch()
    const { getNftsWallet } = fetch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = isLight ? stylesLight : stylesDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [selectedNft, setSelectedNft] = useState('')
    const [loadingNftList, setLoadingNftList] = useState(false)
    const [baseUri, setBaseUri] = useState('')
    const [tokenUri, setTokenUri] = useState(Array())
    const selectedCollectiblesDropdown = loginInfo?.selectedCollectiblesDropdown
    const selectedCollectibles = [defaultOpt, ...selectedCollectiblesDropdown]
    const [showCollectiblesDropdown, setShowCollectiblesDropdown] =
        useState(false)

    const checkTokenId = async () => {
        setLoadingNftList(true)
        const res = await getNftsWallet(defaultOpt)
        setTokenUri(res.token)
        setLoadingNftList(false)
    }

    const checkIsExist = (val) => {
        if (selectedCollectibles.some((arr) => arr === val)) {
            return true
        } else {
            return false
        }
    }

    const selectCollectibles = (val) => {
        console.log('val', val)
        console.log('selected', selectedCollectibles)
        if (!checkIsExist(val)) {
            console.log('masuk')
            let arr = selectedCollectiblesDropdown.filter(
                (arr) => arr !== defaultOpt
            )
            arr.push(val)
            dispatch(updateSelectedCollectiblesDropdown(arr))
        } else {
            console.log('out')
            let arr = selectedCollectiblesDropdown.filter((arr) => arr !== val)
            dispatch(updateSelectedCollectiblesDropdown(arr))
        }
    }

    const fetchAllNft = async () => {
        for (let i = 0; i < selectedCollectibles.length; i += 1) {
            console.log(selectedCollectibles)
            setLoadingNftList(true)
            const res = await getNftsWallet(selectedCollectibles[i])
            setLoadingNftList(false)
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
        }
    }

    useEffect(() => {
        checkTokenId()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const optionNft = [
        // {
        //     value: 'nawelito',
        //     label: 'Nawelito',
        // },
        // {
        //     value: 'nawelitoonfire',
        //     label: 'Nawelito ON FIRE',
        // },
        // {
        //     value: 'nessy',
        //     label: 'Nessy',
        // },
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
            <div>Gallery</div>
            {loadingNftList ? (
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '1rem',
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
                                        fetchAllNft()
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
                                        fetchAllNft()
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
                                    <img
                                        width={100}
                                        src={`${val.uri}${val.name}`}
                                        alt="lexica-img"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Component
