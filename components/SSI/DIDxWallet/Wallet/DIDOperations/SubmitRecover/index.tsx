import * as tyron from 'tyron'
import { useStore as effectorStore } from 'effector-react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
import { operationKeyPair } from '../../../../../../src/lib/dkms'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import { $doc } from '../../../../../../src/store/did-doc'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../src/store/modal'
import { setTxStatusLoading, setTxId } from '../../../../../../src/app/actions'
import { RootState } from '../../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../src/hooks/router'
import { $arconnect } from '../../../../../../src/store/arconnect'
import toastTheme from '../../../../../../src/hooks/toastTheme'
import ThreeDots from '../../../../../Spinner/ThreeDots'
import { $net } from '../../../../../../src/store/network'
import { useStore } from 'react-stores'

function Component({
    services,
}: {
    services: tyron.DocumentModel.ServiceModel[]
}) {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const { t } = useTranslation()
    const { navigate } = routerHook()
    const dispatch = useDispatch()
    const donation = effectorStore($donation)
    const resolvedInfo = useStore($resolvedInfo)
    const arConnect = effectorStore($arconnect)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const doc = effectorStore($doc)?.doc

    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const subdomainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''

    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            if (
                arConnect !== null &&
                resolvedInfo !== null &&
                donation !== null
            ) {
                const zilpay = new ZilPayBase()

                let key_domain = Array()
                const vc = doc?.filter(
                    (val) => val[0] === 'verifiable-credential key'
                ) as any
                const defi = doc?.filter(
                    (val) => val[0] === 'decentralized-finance key'
                ) as any
                if (vc?.length !== 0) {
                    const id = { id: 'vc' }
                    key_domain.push(id)
                }
                if (defi?.length !== 0) {
                    const id = { id: 'defi' }
                    key_domain.push(id)
                }
                const key_input = [
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose.Update,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .SocialRecovery,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose.General,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose.Auth,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .Assertion,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .Agreement,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .Invocation,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .Delegation,
                    },
                    ...key_domain,
                ]

                const verification_methods: tyron.TyronZil.TransitionValue[] =
                    []
                for (const input of key_input) {
                    // Creates the cryptographic DID key pair
                    const doc = await operationKeyPair({
                        arConnect: arConnect,
                        id: input.id,
                        addr: resolvedInfo?.addr!,
                    })
                    verification_methods.push(doc.parameter)
                }
                for (const service of services) {
                    const doc_element: tyron.DocumentModel.DocumentElement = {
                        constructor:
                            tyron.DocumentModel.DocumentConstructor.Service,
                        action: tyron.DocumentModel.Action.Add,
                        service: service,
                    }
                }

                // Donation
                const tyron_: tyron.TyronZil.TransitionValue =
                    await tyron.Donation.default.tyron(donation)

                const tx_params = await tyron.DidCrud.default.Create({
                    addr: resolvedInfo?.addr!,
                    verificationMethods: verification_methods,
                    services: services,
                    tyron_: tyron_,
                })

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                const message = t(
                    'You’re about to submit a DID Update operation!'
                )
                toast.info(message, {
                    position: 'top-center',
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
                await zilpay
                    .call(
                        {
                            contractAddress: resolvedInfo?.addr!,
                            transition: 'DidUpdate',
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
                            tx = await tx.confirm(res.ID, 33)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                updateDonation(null)
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                                navigate(
                                    `${subdomainNavigate}${resolvedDomain}/didx/doc`
                                )
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                            }
                        } catch (err) {
                            throw err
                        }
                    })
                    .catch((err) => {
                        throw err
                    })
            }
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.warn(String(error), {
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 12,
            })
        }
        setLoading(false)
    }

    return (
        <>
            {donation !== null && (
                <div style={{ marginTop: '14%', textAlign: 'center' }}>
                    <div
                        className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        onClick={handleSubmit}
                    >
                        {loading ? (
                            <ThreeDots color="yellow" />
                        ) : (
                            <>{t('RECOVER DID')}</>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default Component
