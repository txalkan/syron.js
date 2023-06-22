import { useStore } from 'effector-react'
import {
    $domainAddr,
    $modalNewDefi,
    $modalNft,
    $modalTydra,
    $newDefiStep,
    $selectedNft,
    $tydra,
    updateDomainAddr,
    updateDomainTx,
    updateModalDashboard,
    updateModalTx,
    updateModalTxMinimized,
    updateNewDefiModal,
    updateNewDefiStep,
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
import {
    $resolvedInfo,
    updateResolvedInfo,
} from '../../../src/store/resolvedInfo'
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
import { TransitionParams } from 'tyron/dist/blockchain/tyronzil'
import { operationKeyPair } from '../../../src/lib/dkms'
import { updateLoading } from '../../../src/store/loading'

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
    const modalNewDefi = useStore($modalNewDefi)
    const selectedNft = useStore($selectedNft)
    const step = useStore($newDefiStep)
    const input = useStore($domainAddr)
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const donation = useStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const version = checkVersion(resolvedInfo?.version)

    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const [loading, setLoading] = useState(false)
    const [didDomain, setDidDomain] = useState(Array())
    const [selectedDomain, setSelectedDomain] = useState('')
    const [nft, setNft] = useState('')
    const [tokenId, setTokenId] = useState('')

    const outerClose = () => {
        if (window.confirm('Are you sure about closing this window?')) {
            updateNewDefiStep(1)
            updateDonation(null)
            updateNewDefiModal(false)
        }
    }

    const newWallet = async (wallet: string) => {
        try {
            if (loginInfo.zilAddr !== null && net !== null) {
                const zilpay = new ZilPayBase()
                const zp = await zilpay.zilpay()
                await zp.wallet.connect()

                updateModalDashboard(false)
                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                const arConnect = $arconnect.getState()
                await zilpay
                    //.deployDomainBeta(net, resolvedDomain!)
                    .deployDomain(net, wallet, resolvedDomain!)
                    .then(async (deploy: any) => {
                        setLoading(false)

                        dispatch(setTxId(deploy[0].ID))
                        dispatch(setTxStatusLoading('submitted'))

                        let tx = await tyron.Init.default.transaction(net)
                        tx = await tx.confirm(deploy[0].ID, 33)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))

                            let link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}`
                            if (net === 'testnet') {
                                link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
                            }
                            setTimeout(() => {
                                window.open(link)
                            }, 1000)

                            const txn = await tyron.Init.default.contract(
                                deploy[0].ID,
                                net
                            )
                            let addr = '0x' + txn //deploy[0].ContractAddress
                            addr = zcrypto.toChecksumAddress(addr)
                            updateDomainAddr(addr)
                            updateNewDefiStep(2)
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                            setTimeout(() => {
                                toast.error(t('Transaction failed.'), {
                                    position: 'bottom-right',
                                    autoClose: 4000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 4,
                                })
                            }, 1000)
                        }
                    })
                    .catch((error) => {
                        throw error
                    })
            } else {
                toast.warn('Connect your ZilPay wallet.', {
                    position: 'bottom-left',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 2,
                })
            }
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.error(String(error), {
                position: 'bottom-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 3,
            })
        }
    }

    const handleSubmit = async () => {
        try {
            let did_key =
                '0x000000000000000000000000000000000000000000000000000000000000000000'
            let encrypted = 'null'
            await connect().then(async () => {
                const arConnect = $arconnect.getState()
                if (arConnect) {
                    const result = await operationKeyPair({
                        arConnect: arConnect,
                        id: 'defi',
                        addr: loginInfo?.address,
                    })
                    did_key = result.element.key.key
                    encrypted = result.element.key.encrypted
                }
            })
            //@todo-x-check: continue after the user select arconnect or rejects: tested action below only run after connect(),
            // but when reject arconnect atm we reload the page so can't continue
            // if (resolvedInfo !== null && donation !== null) {
            const zilpay = new ZilPayBase()
            const txID = 'Dns'
            const addr = zcrypto.toChecksumAddress(input)
            let tyron_: tyron.TyronZil.TransitionValue
            tyron_ = await tyron.Donation.default.tyron(1)

            const tx_params = await tyron.TyronZil.default.Dns(
                addr,
                'defi',
                did_key,
                encrypted,
                tyron_
            )
            alert(version)
            //@review pass version from login dashboard
            if (version >= 6) {
                let nft_ = nft
                if (nft !== 'nawelito') {
                    nft_ = nft + '#' + tokenId
                }
                const nftID: TransitionParams = {
                    vname: 'nftID',
                    type: 'String',
                    value: nft_,
                }
                tx_params.push(nftID)
            }
            const _amount = String(0) //@review add Donate component
            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            let tx = await tyron.Init.default.transaction(net)
            await zilpay
                .call({
                    contractAddress: loginInfo?.address!,
                    transition: txID,
                    params: tx_params as unknown as Record<string, unknown>[],
                    amount: _amount,
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    try {
                        tx = await tx.confirm(res.ID, 33)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            updateDonation(null)
                            window.open(
                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                            // update prev is needed here?: yes, it would be better to use global navigation
                            // we already use navigate() on resolveDid() and that's enough

                            updateDomainTx('')
                            updateNewDefiModal(false)
                            // resolveDid('defi', loginInfo?.username, '')
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                            setTimeout(() => {
                                toast.error(t('Transaction failed.'), {
                                    position: 'bottom-right',
                                    autoClose: 4000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 13,
                                })
                            }, 1000)
                        }
                    } catch (err) {
                        updateModalTx(false)
                        toast.error(String(err), {
                            position: 'bottom-right',
                            autoClose: 4000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 14,
                        })
                    }
                })
                .catch((error) => {
                    dispatch(setTxStatusLoading('rejected'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    toast.error(String(error), {
                        position: 'bottom-right',
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 15,
                    })
                })
            // }
        } catch (error) {
            toast.error(String(error), {
                position: 'bottom-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 16,
            })
        }
    }

    const resolveDid = async (
        this_tld: string,
        this_domain: string,
        this_subdomain: string
    ) => {
        updateLoading(true)
        let _subdomain
        if (this_subdomain !== '') {
            _subdomain = this_subdomain
        }
        await tyron.SearchBarUtil.default
            .fetchAddr(net, this_tld, this_domain, _subdomain)
            .then(async (addr) => {
                const res = await getSmartContract(addr, 'version')
                updateLoading(false)
                updateResolvedInfo({
                    user_tld: this_tld,
                    user_domain: this_domain,
                    user_subdomain: this_subdomain,
                    addr: addr,
                    version: res?.result?.version,
                })
                switch (res?.result?.version?.slice(0, 8).toLowerCase()) {
                    case 'defixwal':
                        navigate(`/${this_tld}@${this_domain}/defi`)
                        break
                    // case 'zilstake':
                    //     navigate(`/${this_tld}@${resolvedDomain}/zil`)
                    //     break
                    // case '.stake--':
                    //     navigate(`/${this_tld}@${resolvedDomain}/zil`)
                    //     break
                    // case 'zilxwall':
                    //     navigate(`/${this_tld}@${resolvedDomain}/zil`)
                    //     break
                    // case 'vcxwalle':
                    //     navigate(`/${this_tld}@${resolvedDomain}/sbt`)
                    //     break
                    // case 'sbtxwall':
                    //     navigate(`/${this_tld}@${resolvedDomain}/sbt`)
                    //     break
                    // case 'didxwall':
                    //     navigate(`/${this_tld}@${resolvedDomain}`)
                    //     break
                    default:
                        navigate(`/${this_tld}@${this_domain}/defi`)
                        break
                }
                updateNewDefiModal(false)
            })
            .catch((err) => {
                toast.error(String(err), {
                    position: 'bottom-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 12,
                })
                updateLoading(false)
            })
    }

    if (!modalNewDefi) {
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
                        <h5 className={styles.headerTxt}>DEFIxWALLET</h5>
                    </div>
                    <div className={styles.content}>
                        {step === 1 ? (
                            <div
                                onClick={() =>
                                    newWallet('Decentralised Finance xWALLET')
                                }
                                // onClick={() => alert(JSON.stringify(resolvedInfo))}
                                className={
                                    isLight ? 'actionBtnLight' : 'actionBtn'
                                }
                                style={{ width: '300px' }}
                            >
                                <div>CREATE</div>
                            </div>
                        ) : (
                            <div
                                onClick={handleSubmit}
                                className={
                                    isLight ? 'actionBtnLight' : 'actionBtn'
                                }
                                style={{ width: '300px' }}
                            >
                                <div>Save SUBDOMAIN</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
