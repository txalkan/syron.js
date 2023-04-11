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
import { Donate, ModalImg, Spinner } from '../../../../../..'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import {
    setTxId,
    setTxStatusLoading,
} from '../../../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import smartContract from '../../../../../../../src/utils/smartContract'
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkDark from '../../../../../../../src/assets/icons/selected_checkmark.svg'
import selectedCheckmarkLight from '../../../../../../../src/assets/icons/selected_checkmark_purple.svg'
import fetch from '../../../../../../../src/hooks/fetch'
import AddIconBlack from '../../../../../../../src/assets/icons/add_icon_black.svg'
import AddIconReg from '../../../../../../../src/assets/icons/add_icon.svg'

function Component({ addrName }) {
    // const { getSmartContract } = smartContract()
    const { getNftsWallet } = fetch()
    // const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const AddIcon = isLight ? AddIconBlack : AddIconReg
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const selectedCheckmark = isLight
        ? selectedCheckmarkLight
        : selectedCheckmarkDark
    const [selectedNft, setSelectedNft] = useState('')
    const [showModalImg, setShowModalImg] = useState(false)
    const [dataModalImg, setDataModalImg] = useState('')

    const toggleSelectNft = (val) => {
        if (selectedNft === val) {
            setSelectedNft('')
        } else {
            setSelectedNft(val)
        }
    }

    const [loadingNftList, setLoadingNftList] = useState(false)
    const [tokenIds, setTokenIds] = useState(Array())
    const [tokenUris, setTokenUris] = useState(Array())
    const [baseUri, setBaseUri] = useState('')
    const checkTokenId = async () => {
        setLoadingNftList(true)
        const res = await getNftsWallet(addrName)
        setTokenIds(res.tokenIds)
        setTokenUris(res.tokenUris)
        setBaseUri(res.baseUri)
        setTimeout(() => {
            setLoadingNftList(false)
        }, 400)
    }

    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const handleSubmit = async () => {
        setLoadingSubmit(true)
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        let params: any = []
        const addrName_ = {
            vname: 'addrName',
            type: 'String',
            value: addrName,
        }
        params.push(addrName_)
        const token_id = {
            vname: 'token_id',
            type: 'Uint256',
            value: selectedNft,
        }
        params.push(token_id)
        const donation_ = await tyron.Donation.default.tyron(donation!)
        const tyron_ = {
            vname: 'tyron',
            type: 'Option Uint128',
            value: donation_,
        }
        params.push(tyron_)

        setLoadingSubmit(false)
        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        await zilpay
            .call({
                contractAddress: resolvedInfo?.addr!,
                transition: 'ZRC6_Burn',
                params: params as unknown as Record<string, unknown>[],
                amount: String(donation),
            })
            .then(async (res) => {
                dispatch(setTxId(res.ID))
                dispatch(setTxStatusLoading('submitted'))
                tx = await tx.confirm(res.ID)
                if (tx.isConfirmed()) {
                    dispatch(setTxStatusLoading('confirmed'))
                    setTimeout(() => {
                        window.open(
                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                        )
                    }, 1000)
                } else if (tx.isRejected()) {
                    dispatch(setTxStatusLoading('failed'))
                }
            })
            .catch((err) => {
                dispatch(setTxStatusLoading('rejected'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                throw err
            })
    }

    useEffect(() => {
        checkTokenId()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
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
                    {tokenIds.length === 0 ? (
                        <div
                            style={{
                                marginTop: '10%',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'left',
                            }}
                        >
                            This xWALLET doesn&apos;t have any NFTs.
                        </div>
                    ) : (
                        <>
                            {addrName !== '.gzil' ? (
                                <>
                                    {tokenUris.map((val, i) => (
                                        <div
                                            className={styles.wrapperNftOption}
                                            key={i}
                                        >
                                            {val.id === selectedNft ? (
                                                <div
                                                    onClick={() =>
                                                        toggleSelectNft(val.id)
                                                    }
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
                                                    onClick={() =>
                                                        toggleSelectNft(val.id)
                                                    }
                                                >
                                                    <Image
                                                        src={defaultCheckmark}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            )}
                                            <img
                                                onClick={() =>
                                                    toggleSelectNft(val.id)
                                                }
                                                style={{ cursor: 'pointer' }}
                                                width={200}
                                                src={`${baseUri}${val.name}`}
                                                alt="nft-img"
                                            />
                                            {dataModalImg ===
                                                `${baseUri}${val.name}` && (
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
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div
                                                    onClick={() => {
                                                        setDataModalImg(
                                                            `${baseUri}${val.name}`
                                                        )
                                                        setShowModalImg(true)
                                                    }}
                                                    style={{
                                                        marginLeft: '5px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Image
                                                        alt="arrow-ico"
                                                        src={AddIcon}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <div>
                                        You can burn any of the following NFTs
                                    </div>
                                    {tokenIds.map((val, i) => (
                                        <div
                                            className={styles.wrapperNftOption}
                                            key={i}
                                        >
                                            {val.id === selectedNft ? (
                                                <div
                                                    onClick={() =>
                                                        toggleSelectNft(val.id)
                                                    }
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
                                                    onClick={() =>
                                                        toggleSelectNft(val.id)
                                                    }
                                                >
                                                    <Image
                                                        src={defaultCheckmark}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            )}
                                            <code>{val.id}</code>
                                        </div>
                                    ))}
                                </>
                            )}
                            {selectedNft !== '' && (
                                <>
                                    <Donate />
                                    {donation !== null && (
                                        <div
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <div
                                                onClick={handleSubmit}
                                                className={
                                                    isLight
                                                        ? 'actionBtnLight'
                                                        : 'actionBtn'
                                                }
                                            >
                                                {loadingSubmit ? (
                                                    <ThreeDots color="black" />
                                                ) : (
                                                    'BURN NFT'
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    )
}

export default Component
