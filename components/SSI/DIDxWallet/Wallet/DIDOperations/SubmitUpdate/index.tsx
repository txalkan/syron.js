import * as tyron from 'tyron'
import * as zcrypto from '@zilliqa-js/crypto'
import { useStore } from 'effector-react'
import React from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { Donate } from '../../../../..'
import { $contract } from '../../../../../../src/store/contract'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
import { decryptKey, operationKeyPair } from '../../../../../../src/lib/dkms'
import { $arconnect } from '../../../../../../src/store/arconnect'
import { $doc } from '../../../../../../src/store/did-doc'
import { $net } from '../../../../../../src/store/wallet-network'
import { updateModalTx } from '../../../../../../src/store/modal'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import { $user } from '../../../../../../src/store/user'
import { setTxStatusLoading, setTxId } from '../../../../../../src/app/actions'

function Component({
    ids,
    patches,
}: {
    ids: string[]
    patches: tyron.DocumentModel.PatchModel[]
}) {
    const Router = useRouter()
    const dispatch = useDispatch()
    const username = useStore($user)?.name
    const donation = useStore($donation)
    const contract = useStore($contract)
    const arConnect = useStore($arconnect)
    const dkms = useStore($doc)?.dkms
    const net = useStore($net)

    const handleSubmit = async () => {
        try {
            if (arConnect !== null && contract !== null && donation !== null) {
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
                        addr: contract.addr,
                    })
                    elements.push(doc.element)
                    verification_methods.push(doc.parameter)
                }

                let document = verification_methods
                await tyron.Sidetree.Sidetree.processPatches(
                    contract.addr,
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
                                contract.addr,
                                document,
                                await tyron.TyronZil.default.OptionParam(
                                    tyron.TyronZil.Option.some,
                                    'ByStr64',
                                    '0x' + signature
                                ),
                                tyron_
                            )

                        dispatch(setTxStatusLoading('true'))
                        updateModalTx(true)

                        let tx = await tyron.Init.default.transaction(net)

                        toast.info(
                            `You're about to submit a DID Update operation!`,
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
                                contractAddress: contract.addr,
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
                                    Router.push(`/${username}/did/doc`)
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
            updateModalTx(false)
            toast.error(String(error), {
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
    }

    return (
        <div>
            <Donate />
            {donation !== null && (
                <div style={{ marginTop: '14%', textAlign: 'center' }}>
                    <button
                        type="button"
                        className="button"
                        onClick={handleSubmit}
                    >
                        <strong style={{ color: '#ffff32' }}>update did</strong>
                    </button>
                </div>
            )}
        </div>
    )
}

export default Component
