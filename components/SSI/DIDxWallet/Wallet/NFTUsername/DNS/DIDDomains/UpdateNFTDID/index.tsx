import React, { useState, useRef, useEffect } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { ZilPayBase } from '../../../../../../../ZilPay/zilpay-base'
import { $resolvedInfo } from '../../../../../../../../src/store/resolvedInfo'
import { $doc } from '../../../../../../../../src/store/did-doc'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../../src/store/modal'
import {
    setTxStatusLoading,
    setTxId,
} from '../../../../../../../../src/app/actions'
import { Donate, Selector, Spinner } from '../../../../../../..'
import {
    $donation,
    updateDonation,
} from '../../../../../../../../src/store/donation'
import { RootState } from '../../../../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import ContinueArrow from '../../../../../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../../../../../src/assets/icons/tick.svg'
import toastTheme from '../../../../../../../../src/hooks/toastTheme'
import routerHook from '../../../../../../../../src/hooks/router'
import ThreeDots from '../../../../../../../Spinner/ThreeDots'
import smartContract from '../../../../../../../../src/utils/smartContract'

function Component() {
    const { getSmartContract } = smartContract()
    const { navigate } = routerHook()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const resolvedInfo = useStore($resolvedInfo)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const doc = useStore($doc)
    const net = useSelector((state: RootState) => state.modal.net)
    const donation = useStore($donation)
    const domain = resolvedInfo?.domain

    const [nft, setNft] = useState('')
    const [selectedDomain, setSelectedDomain] = useState('')
    const [loading, setLoading] = useState(true)
    const [didDomain, setDidDomain] = useState(Array())

    const handleOnChangeDomain = (value) => {
        setNft('')
        updateDonation(null)
        setSelectedDomain(value)
    }

    const handleOnChangeNft = (value) => {
        updateDonation(null)
        setNft(value)
    }

    const fetchSubDomain = async () => {
        setLoading(true)
        const domainId =
            '0x' + (await tyron.Util.default.HashString(loginInfo.username))
        const addr = await tyron.SearchBarUtil.default.fetchAddr(
            net,
            domainId,
            'did'
        )
        getSmartContract(addr, 'did_domain_dns').then(async (res) => {
            const key = Object.keys(res.result.did_domain_dns)
            let arr: any = []
            for (let i = 0; i < key.length; i += 1) {
                const obj = {
                    value: key[i],
                    label: key[i],
                }
                arr.push(obj)
            }
            setDidDomain(arr)
        })
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }

    const handleSubmit = async () => {
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        let params: any = []
        const domain = {
            vname: 'domain',
            type: 'String',
            value: selectedDomain,
        }
        params.push(domain)
        const nftID = {
            vname: 'nftID',
            type: 'String',
            value: nft,
        }
        params.push(nftID)
        const donation_ = await tyron.Donation.default.tyron(donation!)
        const tyron_ = {
            vname: 'tyron',
            type: 'Option Uint128',
            value: donation_,
        }
        params.push(tyron_)

        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        await zilpay
            .call({
                contractAddress: resolvedInfo?.addr!,
                transition: 'UpdateNftDns',
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

    const optionNft = [
        {
            value: 'nawelito',
            label: 'Nawelito',
        },
        {
            value: 'ddk10',
            label: 'DDK10',
        },
    ]

    useEffect(() => {
        fetchSubDomain()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.wrapper}>
            {loading ? (
                <Spinner />
            ) : (
                <div className={styles.contentWrapper}>
                    <div className={styles.picker}>
                        <Selector
                            option={didDomain}
                            onChange={handleOnChangeDomain}
                            placeholder="Select Sub Domain"
                        />
                    </div>
                    {selectedDomain !== '' && (
                        <>
                            <div className={styles.picker}>
                                <Selector
                                    option={optionNft}
                                    onChange={handleOnChangeNft}
                                    placeholder="Select NFT"
                                />
                            </div>
                            {nft !== '' && (
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
                                                UPDATE NFT DNS
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Component
