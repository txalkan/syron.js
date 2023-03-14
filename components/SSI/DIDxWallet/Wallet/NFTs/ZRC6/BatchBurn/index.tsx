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
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkDark from '../../../../../../../src/assets/icons/selected_checkmark.svg'
import selectedCheckmarkLight from '../../../../../../../src/assets/icons/selected_checkmark_purple.svg'
import fetch from '../../../../../../../src/hooks/fetch'
import AddIconBlack from '../../../../../../../src/assets/icons/add_icon_black.svg'
import AddIconReg from '../../../../../../../src/assets/icons/add_icon.svg'

function Component({ addrName }) {
    const { getNftsWallet } = fetch()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = isLight ? stylesLight : stylesDark
    const AddIcon = isLight ? AddIconBlack : AddIconReg
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const selectedCheckmark = isLight
        ? selectedCheckmarkLight
        : selectedCheckmarkDark
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [selectedNft, setSelectedNft] = useState([])
    const [loadingNftList, setLoadingNftList] = useState(false)
    const [baseUri, setBaseUri] = useState('')
    const [tokenUri, setTokenUri] = useState(Array())
    const [showModalImg, setShowModalImg] = useState(false)
    const [dataModalImg, setDataModalImg] = useState('')

    const checkIsSelectedNft = (id) => {
        if (selectedNft.some((val) => val === id)) {
            return true
        } else {
            return false
        }
    }

    const selectNft = (id: string) => {
        if (!checkIsSelectedNft(id)) {
            let arr: any = selectedNft
            arr.push(id)
            setSelectedNft(arr)
        } else {
            let arr = selectedNft.filter((arr) => arr !== id)
            setSelectedNft(arr)
        }
    }

    const checkTokenId = async () => {
        setLoadingNftList(true)
        const res = await getNftsWallet(addrName)
        setTokenUri(res.token)
        setBaseUri(res.baseUri)
        setLoadingNftList(false)
    }

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
        const token_id_list = {
            vname: 'token_id_list',
            type: 'List Uint256',
            value: selectedNft,
        }
        params.push(token_id_list)
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
                transition: 'ZRC6_BatchBurn',
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
                    {tokenUri.length === 0 && (
                        <div>You don&apos;t have any NFTs</div>
                    )}
                    {tokenUri.map((val, i) => (
                        <div className={styles.wrapperNftOption} key={i}>
                            {checkIsSelectedNft(val.id) ? (
                                <div
                                    onClick={() => selectNft(val.id)}
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
                                    onClick={() => selectNft(val.id)}
                                >
                                    <Image src={defaultCheckmark} alt="arrow" />
                                </div>
                            )}
                            <img
                                onClick={() => selectNft(val.id)}
                                style={{ cursor: 'pointer' }}
                                width={200}
                                src={`${baseUri}${val.name}`}
                                alt="lexica-img"
                            />
                            {dataModalImg === `${baseUri}${val.name}` && (
                                <ModalImg
                                    showModalImg={showModalImg}
                                    setShowModalImg={setShowModalImg}
                                    dataModalImg={dataModalImg}
                                    setDataModalImg={setDataModalImg}
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
                                        setDataModalImg(`${baseUri}${val.name}`)
                                        setShowModalImg(true)
                                    }}
                                    style={{
                                        marginLeft: '5px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Image alt="arrow-ico" src={AddIcon} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {selectedNft.length > 0 && (
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
                                            'BATCH BURN'
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    )
}

export default Component
