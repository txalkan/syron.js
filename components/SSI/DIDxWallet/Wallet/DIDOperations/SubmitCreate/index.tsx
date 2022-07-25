import React from 'react'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
import { operationKeyPair } from '../../../../../../src/lib/dkms'
import { $arconnect } from '../../../../../../src/store/arconnect'
import { $net } from '../../../../../../src/store/wallet-network'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../src/store/modal'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import { $user } from '../../../../../../src/store/user'
import { setTxStatusLoading, setTxId } from '../../../../../../src/app/actions'
import { RootState } from '../../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../src/hooks/router'

function Component({
    services,
}: {
    services: tyron.DocumentModel.ServiceModel[]
}) {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const dispatch = useDispatch()
    const username = useStore($user)?.name
    const donation = useStore($donation)
    const resolvedInfo = useSelector(
        (state: RootState) => state.modal.resolvedInfo
    )
    const arConnect = useStore($arconnect)
    const net = useStore($net)

    const handleSubmit = async () => {
        const key_input = [
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.SocialRecovery,
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.General,
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Auth,
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Assertion,
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Agreement,
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Invocation,
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Delegation,
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Update,
            },
            {
                id: tyron.VerificationMethods.PublicKeyPurpose.Recovery,
            },
        ]

        if (
            arConnect !== null &&
            resolvedInfo !== null &&
            donation !== null
        ) {
            const zilpay = new ZilPayBase()
            const verification_methods: tyron.TyronZil.TransitionValue[] = []
            for (const input of key_input) {
                // Creates the cryptographic DID key pair
                const doc = await operationKeyPair({
                    arConnect: arConnect,
                    id: input.id,
                    addr: resolvedInfo.addr,
                })
                verification_methods.push(doc.parameter)
            }

            let tyron_: tyron.TyronZil.TransitionValue
            tyron_ = await tyron.Donation.default.tyron(donation)

            const tx_params = await tyron.DidCrud.default.Create({
                addr: resolvedInfo.addr,
                verificationMethods: verification_methods,
                services: services,
                tyron_: tyron_,
            })
            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)

            let tx = await tyron.Init.default.transaction(net)

            toast.info(`You're about to submit a DID Create transaction!`, {
                position: 'top-center',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
            await zilpay
                .call(
                    {
                        contractAddress: resolvedInfo.addr,
                        transition: 'DidCreate',
                        params: tx_params.txParams as unknown as Record<
                            string,
                            unknown
                        >[],
                        amount: String(donation),
                    },
                    {
                        gasPrice: '2000',
                        gaslimit: '20000',
                    }
                )
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    try {
                        tx = await tx.confirm(res.ID)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            updateDonation(null)
                            window.open(
                                `https://devex.zilliqa.com/tx/${res.ID
                                }?network=https%3A%2F%2F${net === 'mainnet' ? '' : 'dev-'
                                }api.zilliqa.com`
                            )
                            navigate(`/${username}/did/doc`)
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                            setTimeout(() => {
                                toast.error(t('Transaction failed.'), {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: 'dark',
                                })
                            }, 1000)
                        }
                    } catch (err) {
                        dispatch(setTxStatusLoading('rejected'))
                        updateModalTxMinimized(false)
                        updateModalTx(true)
                        toast.error(String(err), {
                            position: 'top-right',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: 'dark',
                        })
                    }
                })
                .catch(() => {
                    updateModalTx(false)
                })
        }
    }

    return (
        <>
            {donation !== null && (
                <div style={{ marginTop: '14%', textAlign: 'center' }}>
                    <div className="actionBtn" onClick={handleSubmit}>
                        create did
                    </div>
                    <h5 style={{ marginTop: '3%', color: 'lightgrey' }}>
                        around 7 ZIL
                    </h5>
                </div>
            )}
        </>
    )
}

export default Component
