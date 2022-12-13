import { useStore } from 'effector-react'
import {
    $modalNft,
    $modalTydra,
    $selectedNft,
    $tydra,
    updateModalTx,
    updateModalTxMinimized,
    updateNftModal,
    updateTydraModal,
} from '../../../src/store/modal'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import Spinner from '../../Spinner'
import { AddFunds, Donate, SearchBarWallet, Selector } from '../..'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../src/utils/smartContract'
import routerHook from '../../../src/hooks/router'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import CloseIcoReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../src/assets/icons/ic_cross_black.svg'
import { $donation, updateDonation } from '../../../src/store/donation'
import { toast } from 'react-toastify'
import toastTheme from '../../../src/hooks/toastTheme'
import fetch from '../../../src/hooks/fetch'
import { $arconnect } from '../../../src/store/arconnect'
import useArConnect from '../../../src/hooks/useArConnect'
import { updateOriginatorAddress } from '../../../src/store/originatorAddress'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { connect } = useArConnect()
    const { getSmartContract } = smartContract()
    const { navigate } = routerHook()
    const { checkVersion } = fetch()
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const modalNft = useStore($modalNft)
    const selectedNft = useStore($selectedNft)
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const [loading, setLoading] = useState(false)
    const [didDomain, setDidDomain] = useState(Array())
    const [selectedDomain, setSelectedDomain] = useState('')

    const outerClose = () => {
        if (window.confirm('Are you sure about closing this window?')) {
            setSelectedDomain('')
            updateDonation(null)
            updateNftModal(false)
        }
    }

    const fetchSubDomain = async () => {
        setLoading(true)
        try {
            const domainId =
                '0x' +
                (await tyron.Util.default.HashString(resolvedInfo?.name!))
            const addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                domainId,
                'did'
            )
            getSmartContract(addr, 'did_domain_dns').then(async (res) => {
                const key = Object.keys(res.result.did_domain_dns)
                let arr: any = []
                for (let i = 0; i < key.length; i += 1) {
                    if (key[i] !== 'did') {
                        const obj = {
                            value: key[i],
                            label: key[i] + '@',
                        }
                        arr.push(obj)
                    }
                }
                setDidDomain(arr)
            })
        } catch {
            setDidDomain([])
        }
        setLoading(false)
    }

    const handleOnChangeDomain = (value) => {
        updateDonation(null)
        setSelectedDomain(value)
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
            value: selectedNft,
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
                    updateNftModal(false)
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
        fetchSubDomain()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const optionDidDomain = [
        {
            value: 'ssi',
            label: '.ssi',
        },
        {
            value: 'did',
            label: '.did',
        },
        ...didDomain,
    ]

    if (!modalNft) {
        return null
    }

    return (
        <>
            <div onClick={outerClose} className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div onClick={outerClose} className="closeIcon">
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <h5 className={styles.headerTxt}>UPDATE NFT DNS</h5>
                    </div>
                    {loading ? (
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
                        <div>
                            <div className={styles.picker}>
                                <Selector
                                    option={optionDidDomain}
                                    onChange={handleOnChangeDomain}
                                    placeholder="Select subdomain"
                                />
                            </div>
                            {selectedDomain !== '' && (
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
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Component
