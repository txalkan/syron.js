import * as tyron from 'tyron'
import * as zcrypto from '@zilliqa-js/crypto'
import { useStore } from 'effector-react'
import React from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { Donate } from '../../../../..'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
import { decryptKey, operationKeyPair } from '../../../../../../src/lib/dkms'
import { $arconnect } from '../../../../../../src/store/arconnect'
import { $doc } from '../../../../../../src/store/did-doc'
import { $net } from '../../../../../../src/store/wallet-network'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../src/store/modal'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import { $user } from '../../../../../../src/store/user'
import { setTxStatusLoading, setTxId } from '../../../../../../src/app/actions'
import { RootState } from '../../../../../../src/app/reducers'
import fetchDoc from '../../../../../../src/hooks/fetchDoc'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../src/hooks/router'

function Component({
    ids,
    patches,
}: {
    ids: string[]
    patches: tyron.DocumentModel.PatchModel[]
}) {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const dispatch = useDispatch()
    const username = useStore($user)?.name
    const donation = useStore($donation)
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const arConnect = useStore($arconnect)
    const dkms = useStore($doc)?.dkms
    const net = useStore($net)

    const { fetch } = fetchDoc()

    const handleSubmit = async () => {
        try {
            if (
                arConnect !== null &&
                resolvedUsername !== null &&
                donation !== null
            ) {
                const zilpay = new ZilPayBase()

                let key_input: Array<{ id: string }> = []
                for (let i = 0; i < ids.length; i += 1) {
                    key_input.push({
                        id: ids[i],
                    })
                }
                const verification_methods: tyron.TyronZil.TransitionValue[] =
                    []
                const elements: tyron.DocumentModel.DocumentElement[] = []

                for (const input of key_input) {
                    // Creates the cryptographic DID key pair
                    const doc = await operationKeyPair({
                        arConnect: arConnect,
                        id: input.id,
                        addr: resolvedUsername.addr,
                    })
                    elements.push(doc.element)
                    verification_methods.push(doc.parameter)
                }

                let document = verification_methods
                await tyron.Sidetree.Sidetree.processPatches(
                    resolvedUsername.addr,
                    patches
                )
                    .then(async (res) => {
                        for (let i = 0; i < res.updateDocument.length; i++) {
                            document.push(res.updateDocument[i])
                            elements.push(res.documentElements[i])
                        }
                        const hash = await tyron.DidCrud.default.HashDocument(
                            elements
                        )
                        let signature: string = ''
                        try {
                            const encrypted_key = dkms.get('update')
                            const private_key = await decryptKey(
                                arConnect,
                                encrypted_key
                            )
                            const public_key =
                                zcrypto.getPubKeyFromPrivateKey(private_key)
                            signature = zcrypto.sign(
                                Buffer.from(hash, 'hex'),
                                private_key,
                                public_key
                            )
                        } catch (error) {
                            throw Error('Identity verification unsuccessful.')
                        }
                        // Donation
                        const tyron_ = await tyron.Donation.default.tyron(
                            donation
                        )

                        const tx_params =
                            await tyron.TyronZil.default.CrudParams(
                                resolvedUsername.addr,
                                document,
                                await tyron.TyronZil.default.OptionParam(
                                    tyron.TyronZil.Option.some,
                                    'ByStr64',
                                    '0x' + signature
                                ),
                                tyron_
                            )

                        dispatch(setTxStatusLoading('true'))
                        updateModalTxMinimized(false)
                        updateModalTx(true)

                        let tx = await tyron.Init.default.transaction(net)

                        toast.info(
                            t('You’re about to submit a DID Update operation!'),
                            {
                                position: 'top-center',
                                autoClose: 6000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                            }
                        )
                        await zilpay
                            .call({
                                contractAddress: resolvedUsername.addr,
                                transition: 'DidUpdate',
                                params: tx_params as unknown as Record<
                                    string,
                                    unknown
                                >[],
                                amount: String(donation),
                            })
                            .then(async (res) => {
                                dispatch(setTxId(res.ID))
                                dispatch(setTxStatusLoading('submitted'))

                                tx = await tx.confirm(res.ID)
                                if (tx.isConfirmed()) {
                                    dispatch(setTxStatusLoading('confirmed'))
                                    updateDonation(null)
                                    window.open(
                                        `https://devex.zilliqa.com/tx/${
                                            res.ID
                                        }?network=https%3A%2F%2F${
                                            net === 'mainnet' ? '' : 'dev-'
                                        }api.zilliqa.com`
                                    )
                                    if (ids.length > 1) {
                                        navigate(`/${username}/did/doc`)
                                    } else {
                                        fetch().then(() => {
                                            navigate(
                                                `/${username}/did/doc/services`
                                            )
                                        })
                                    }
                                } else if (tx.isRejected()) {
                                    dispatch(setTxStatusLoading('failed'))
                                }
                            })
                            .catch((err) => {
                                throw err
                            })
                    })
                    .catch((err) => {
                        throw err
                    })
            }
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 12,
            })
        }
    }

    return (
        <div>
            <Donate />
            {donation !== null && (
                <div
                    style={{
                        marginTop: '14%',
                        textAlign: 'center',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <div className="actionBtn" onClick={handleSubmit}>
                        {t('UPDATE')} did
                    </div>
                </div>
            )}
        </div>
    )
}

export default Component
