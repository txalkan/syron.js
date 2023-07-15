import { useStore } from 'effector-react'
import {
    $domainAddr,
    $modalNewDefi,
    $newDefiStep,
    updateDomainAddr,
    updateModalDashboard,
    updateModalTx,
    updateModalTxMinimized,
    updateNewDefiModal,
    updateNewDefiStep,
} from '../../../src/store/modal'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import CloseIcoReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../src/assets/icons/ic_cross_black.svg'
import { $donation, updateDonation } from '../../../src/store/donation'
import { toast } from 'react-toastify'
import toastTheme from '../../../src/hooks/toastTheme'
import fetch from '../../../src/hooks/fetch'
import { $arconnect } from '../../../src/store/arconnect'
import useArConnect from '../../../src/hooks/useArConnect'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { TransitionParams } from 'tyron/dist/blockchain/tyronzil'
import { operationKeyPair } from '../../../src/lib/dkms'
import { updateResolvedInfo } from '../../../src/store/resolvedInfo'
import { useRouter } from 'next/router'
import { $net } from '../../../src/store/network'
import { updateSmartWallet } from '../../../src/store/wallet'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { connect } = useArConnect()

    const dispatch = useDispatch()
    const net = $net.state.net as 'mainnet' | 'testnet'

    const loginInfo = useSelector((state: RootState) => state.modal)
    const loggedInDomain = loginInfo.loggedInDomain
    const loggedInVersion = loginInfo.loggedInVersion
    const { checkVersion } = fetch()
    const version = checkVersion(loggedInVersion)

    const modalNewDefi = useStore($modalNewDefi)
    const step = useStore($newDefiStep)
    const xWALLET = useStore($domainAddr)
    const donation = useStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const Router = useRouter()

    // @reviewed: less clicks
    const outerClose = () => {
        //if (window.confirm('Are you sure about closing this window?')) {
        updateNewDefiStep(1)
        updateDonation(null)
        updateNewDefiModal(false)
        //}
    }

    const newWallet = async (wallet_id: string) => {
        try {
            if (loginInfo.zilAddr !== null && net !== null) {
                const zilpay = new ZilPayBase()
                const zp = await zilpay.zilpay()
                await zp.wallet.connect()

                updateModalDashboard(false)
                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                await zilpay
                    //.deployDomainBeta(net, loggedInDomain)
                    .deployDomain(net, wallet_id, loggedInDomain!)
                    .then(async (deploy: any) => {
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
                                toast.warn(t('Transaction failed.'), {
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
            toast.warn(String(error), {
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
                        addr: loginInfo?.loggedInAddress,
                    })
                    did_key = result.element.key.key
                    encrypted = result.element.key.encrypted
                }
            })

            const zilpay = new ZilPayBase()
            const txID = 'Dns'
            const xwallet_addr = zcrypto.toChecksumAddress(xWALLET)

            //@review add Donate component
            let tyron_: tyron.TyronZil.TransitionValue
            tyron_ = await tyron.Donation.default.tyron(0)

            const tx_params = await tyron.TyronZil.default.Dns(
                xwallet_addr,
                'defi',
                did_key,
                encrypted,
                tyron_
            )
            if (version >= 6) {
                let nft_ = 'nawelito'
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
                    contractAddress: loginInfo?.loggedInAddress!,
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
                            updateNewDefiModal(false)

                            //@review
                            updateResolvedInfo({
                                user_tld: '',
                                user_domain: loggedInDomain,
                                user_subdomain: 'defi',
                                addr: xwallet_addr,
                            })
                            updateNewDefiStep(1)
                            updateSmartWallet({ base16: xwallet_addr })
                            Router.push(`/defi@${loggedInDomain}/defix`)
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                            setTimeout(() => {
                                toast.warn(t('Transaction failed.'), {
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
                        toast.warn(String(err), {
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
                    toast.warn(String(error), {
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
            toast.warn(String(error), {
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

    if (!modalNewDefi) {
        return null
    }

    return (
        <>
            <div /*onClick={outerClose}*/ className={styles.outerWrapper} />
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
