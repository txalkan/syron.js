import * as tyron from 'tyron'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { useState } from 'react'
import toastTheme from '../../../src/hooks/toastTheme'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import smartContract from '../../../src/utils/smartContract'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import ThreeDots from '../../Spinner/ThreeDots'
import isZil from '../../../src/hooks/isZil'
import { $net } from '../../../src/store/network'
import { useStore } from 'react-stores'

function Component({ title }) {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const zcrypto = tyron.Util.default.Zcrypto()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const net = $net.state.net as 'mainnet' | 'testnet'

    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const resolvedInfo = useStore($resolvedInfo)
    const [isLoading, setIsLoading] = useState(false)
    const isZil_ = isZil(resolvedInfo?.version)

    const handleSubmit = async () => {
        try {
            if (resolvedInfo !== null) {
                //@info aren't we using a global variable for loading?: yes, but this one we need local loading so it won't trigger useeffect
                setIsLoading(true)
                const res: any = await getSmartContract(
                    resolvedInfo?.addr!,
                    'pending_domain' //'pending_username' @review: older v
                )
                const pending_domain = String(
                    res?.result?.pending_domain
                ).toLowerCase() //username @review: older v
                console.log('PENDING_DOMAIN:', pending_domain)
                if (
                    pending_domain === '' ||
                    !pending_domain // === undefined
                ) {
                    toast.warn('There is no pending NFT Domain Name', {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 1,
                    })
                } else {
                    const addrPendingUsername =
                        await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            'did',
                            pending_domain
                        )
                    console.log('PENDING_DIDxWALLET:', addrPendingUsername)
                    const result: any =
                        await tyron.SearchBarUtil.default.Resolve(
                            net,
                            addrPendingUsername
                        )
                    const pending_controller = zcrypto.toChecksumAddress(
                        result.controller
                    )
                    console.log('PENDING_SSI_CONTROLER:', pending_controller)

                    if (pending_controller !== zilAddr?.base16) {
                        toast.error(
                            'Wrong caller',
                            // t('Only X’s DID Controller can access this wallet.', {
                            //     name: pending_domain,
                            // }),
                            {
                                position: 'bottom-right',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 2,
                            }
                        )
                        setIsLoading(false)
                    } else {
                        try {
                            const zilpay = new ZilPayBase()
                            const txID = 'AcceptPendingDomain' //'AcceptPendingUsername'@review: older v

                            dispatch(setTxStatusLoading('true'))
                            updateModalTxMinimized(false)
                            updateModalTx(true)
                            let tx = await tyron.Init.default.transaction(net)
                            await zilpay
                                .call({
                                    contractAddress: resolvedInfo?.addr!,
                                    transition: txID,
                                    params: [],
                                    amount: String(0),
                                })
                                .then(async (res) => {
                                    dispatch(setTxId(res.ID))
                                    dispatch(setTxStatusLoading('submitted'))
                                    try {
                                        tx = await tx.confirm(res.ID, 33)
                                        if (tx.isConfirmed()) {
                                            dispatch(
                                                setTxStatusLoading('confirmed')
                                            )
                                            window.open(
                                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                            )
                                        } else if (tx.isRejected()) {
                                            dispatch(
                                                setTxStatusLoading('failed')
                                            )
                                        }
                                        setIsLoading(false)
                                    } catch (err) {
                                        dispatch(setTxStatusLoading('rejected'))
                                        updateModalTxMinimized(false)
                                        updateModalTx(true)
                                        toast.warn(String(err), {
                                            position: 'top-right',
                                            autoClose: 2000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: toastTheme(isLight),
                                        })
                                    }
                                })
                        } catch (error) {
                            dispatch(setTxStatusLoading('idle'))
                            throw error
                        }
                    }
                }
            } else {
                toast.warn('Some data is missing.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 3,
                })
            }
        } catch (error) {
            setIsLoading(false)
            console.error(error)
            toast.warn('There is no new owner.', {
                position: 'top-right',
                autoClose: 2222,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 4,
            })
        }
    }

    const handleSubmitDIDxWallet = async () => {
        if (resolvedInfo !== null) {
            setIsLoading(true)
            const res: any = await getSmartContract(
                resolvedInfo?.addr!,
                'pending_controller'
            )
            setIsLoading(false)
            const pending_controller = res.result.pending_controller
            if (
                pending_controller ===
                '0x0000000000000000000000000000000000000000'
            ) {
                toast.warn('There is no new controlling wallet.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 5,
                })
            } else {
                console.log(
                    '@claim-wallet: pending controller - ',
                    pending_controller
                )
                if (pending_controller !== zilAddr?.base16.toLowerCase()) {
                    toast.warn(
                        // @todo-t Only username's pending DID Controller can claim this wallet.
                        // t('Only X’s DID Controller can access this wallet.', {
                        //     name: resolvedInfo?.name,
                        // }),
                        'Only the pending controller can claim this wallet.',

                        {
                            position: 'bottom-right',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 6,
                        }
                    )
                } else {
                    try {
                        const zilpay = new ZilPayBase()
                        const txID = 'AcceptPendingController'

                        dispatch(setTxStatusLoading('true'))
                        updateModalTxMinimized(false)
                        updateModalTx(true)
                        let tx = await tyron.Init.default.transaction(net)

                        await zilpay
                            .call({
                                contractAddress: resolvedInfo?.addr!,
                                transition: txID,
                                params: [],
                                amount: String(0),
                            })
                            .then(async (res) => {
                                dispatch(setTxId(res.ID))
                                dispatch(setTxStatusLoading('submitted'))
                                try {
                                    tx = await tx.confirm(res.ID, 33)
                                    if (tx.isConfirmed()) {
                                        dispatch(
                                            setTxStatusLoading('confirmed')
                                        )
                                        window.open(
                                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                        )
                                    } else if (tx.isRejected()) {
                                        dispatch(setTxStatusLoading('failed'))
                                    }
                                } catch (err) {
                                    dispatch(setTxStatusLoading('rejected'))
                                    updateModalTxMinimized(false)
                                    updateModalTx(true)
                                    toast.warn(String(err), {
                                        position: 'top-right',
                                        autoClose: 2000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: toastTheme(isLight),
                                    })
                                }
                            })
                    } catch (error) {
                        updateModalTx(false)
                        dispatch(setTxStatusLoading('idle'))
                        toast.warn(String(error), {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 7,
                        })
                    }
                }
            }
        } else {
            toast.warn('Some data is missing.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 8,
            })
        }
    }

    return (
        <div
            onClick={
                title === 'CLAIM DIDxWALLET'
                    ? handleSubmitDIDxWallet
                    : handleSubmit
            }
            className={styles.button}
        >
            <div className={styles.title}>
                {isLoading ? <ThreeDots color="basic" /> : title}
            </div>
        </div>
    )
}

export default Component
