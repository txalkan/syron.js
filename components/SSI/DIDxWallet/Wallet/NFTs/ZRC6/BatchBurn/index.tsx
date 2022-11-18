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
} from '../../../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import smartContract from '../../../../../../../src/utils/smartContract'
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmark from '../../../../../../../src/assets/icons/selected_checkmark.svg'

function Component({ addrName }) {
    const { getSmartContract } = smartContract()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = isLight ? stylesLight : stylesDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [selectedNft, setSelectedNft] = useState([])
    const [loadingNftList, setLoadingNftList] = useState(false)
    const [baseUri, setBaseUri] = useState('')
    const [tokenUri, setTokenUri] = useState(Array())

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
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            const get_services = await getSmartContract(init_addr, 'services')
            const services = await tyron.SmartUtil.default.intoMap(
                get_services.result.services
            )
            const tokenAddr = services.get(addrName)
            const base_uri = await getSmartContract(tokenAddr, 'base_uri')
            const baseUri = base_uri.result.base_uri
            setBaseUri(baseUri)
            const get_owners = await getSmartContract(tokenAddr, 'token_owners')
            const get_tokenUris = await getSmartContract(
                tokenAddr,
                'token_uris'
            )

            const owners = get_owners.result.token_owners
            const keyOwner = Object.keys(owners)
            const valOwner = Object.values(owners)
            let token_id: any = []
            for (let i = 0; i < valOwner.length; i += 1) {
                if (
                    valOwner[i] === resolvedInfo?.addr ||
                    valOwner[i] === loginInfo?.zilAddr?.base16.toLowerCase()
                ) {
                    token_id.push(keyOwner[i])
                }
            }

            const tokenUris = get_tokenUris.result.token_uris
            const keyUris = Object.keys(tokenUris)
            const valUris = Object.values(tokenUris)
            let token_uris: any = []
            for (let i = 0; i < valUris.length; i += 1) {
                if (token_id.some((arr) => arr === keyUris[i])) {
                    const obj = {
                        id: keyUris[i],
                        name: valUris[i],
                    }
                    token_uris.push(obj)
                }
            }
            console.log(token_uris)
            setTokenUri(token_uris)
        } catch {
            setTokenUri([])
        }
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
                            `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
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
                                        className="actionBtn"
                                    >
                                        {loadingSubmit ? (
                                            <ThreeDots color="basic" />
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
