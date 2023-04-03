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
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import { Arrow, Donate, Spinner } from '../../../../../..'
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
import { toast } from 'react-toastify'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'
import fetch from '../../../../../../../src/hooks/fetch'

function Component({ addrName }) {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const selectedCheckmark = isLight
        ? selectedCheckmarkLight
        : selectedCheckmarkDark
    const [selectedNft, setSelectedNft] = useState('')
    const [input, setInput] = useState('')
    const [savedInput, setSavedInput] = useState('')

    const toggleSelectNft = (val) => {
        if (selectedNft === val) {
            setSelectedNft('')
        } else {
            setSelectedNft(val)
        }
    }

    const saveInput = () => {
        setSavedInput(input)
        checkTokenId()
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            saveInput()
        }
    }

    const { getNftsWallet } = fetch()
    const [loadingNftList, setLoadingNftList] = useState(false)
    const [tokenIds, setTokenIds] = useState(Array())
    const checkTokenId = async () => {
        setLoadingNftList(true)
        const res = await getNftsWallet(addrName)
        setTokenIds(res.tokenIds)
        setTimeout(() => {
            setLoadingNftList(false)
        }, 400)
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        setInput(value)
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
        const token_uri_ = {
            vname: 'token_uri',
            type: 'String',
            value: input,
        }
        params.push(token_uri_)

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
                transition: 'UpdateTokenURI',
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

    return (
        <>
            <h6 className={styles.txt}>TOKEN URI</h6>
            <div
                style={{
                    marginTop: '16px',
                }}
            >
                <div className={styles.containerInput}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="URI"
                        onChange={handleInput}
                        onKeyPress={handleOnKeyPress}
                    />
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <div onClick={saveInput}>
                            {!savedInput ? (
                                <Arrow />
                            ) : (
                                <div
                                    style={{
                                        marginTop: '5px',
                                    }}
                                >
                                    <Image
                                        width={40}
                                        src={TickIco}
                                        alt="tick"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {savedInput && (
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
                                    <div
                                        style={{
                                            marginTop: '10%',
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'left',
                                        }}
                                    >
                                        You can update the token URI of any of
                                        the following NFTs:
                                    </div>
                                    <div
                                        style={{
                                            marginTop: '10%',
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'left',
                                        }}
                                    >
                                        NFT IDs
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
                                                    'UPDATE URI'
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
