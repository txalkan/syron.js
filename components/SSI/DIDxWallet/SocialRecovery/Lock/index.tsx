import React from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import styles from './styles.module.scss'
import { $net } from '../../../../../src/store/wallet-network'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { Donate } from '../../../..'
import { $doc } from '../../../../../src/store/did-doc'
import { $user } from '../../../../../src/store/user'
import { $arconnect } from '../../../../../src/store/arconnect'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import { decryptKey } from '../../../../../src/lib/dkms'
import { HashString } from '../../../../../src/lib/util'
import { setTxStatusLoading, setTxId } from '../../../../../src/app/actions'
import { RootState } from '../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const user = useStore($user)
    const doc = useStore($doc)
    const arConnect = useStore($arconnect)
    const resolvedInfo = useSelector(
        (state: RootState) => state.modal.resolvedInfo
    )
    const donation = useStore($donation)
    const net = useStore($net)

    const handleSubmit = async () => {
        if (
            doc?.did !== undefined &&
            arConnect !== null &&
            resolvedInfo !== null &&
            donation !== null
        ) {
            try {
                const zilpay = new ZilPayBase()
                const txID = 'Lock'
                const encrypted_key = doc?.dkms.get('socialrecovery')
                const sr_private_key = await decryptKey(
                    arConnect,
                    encrypted_key
                )
                const sr_public_key =
                    zcrypto.getPubKeyFromPrivateKey(sr_private_key)

                const hash = await HashString(doc?.did)

                const signature =
                    '0x' +
                    zcrypto.sign(
                        Buffer.from(hash, 'hex'),
                        sr_private_key,
                        sr_public_key
                    )

                let tyron_
                const donation_ = donation * 1e12
                switch (donation) {
                    case 0:
                        tyron_ = await tyron.TyronZil.default.OptionParam(
                            tyron.TyronZil.Option.none,
                            'Uint128'
                        )
                        break
                    default:
                        tyron_ = await tyron.TyronZil.default.OptionParam(
                            tyron.TyronZil.Option.some,
                            'Uint128',
                            donation_
                        )
                        break
                }

                const tx_params: tyron.TyronZil.TransitionParams[] = [
                    {
                        vname: 'signature',
                        type: 'ByStr64',
                        value: signature,
                    },
                    {
                        vname: 'tyron',
                        type: 'Option Uint128',
                        value: tyron_,
                    },
                ]
                const _amount = String(donation)

                toast.info(
                    t(
                        'You’re about to submit a transaction to lock your DIDxWallet. You are also donating X ZIL to donate.did, which gives you 0 xPoints!',
                        { donate: donation, points: donation }
                    ),
                    {
                        position: 'top-center',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    }
                )

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)
                await zilpay
                    .call({
                        contractAddress: resolvedInfo.addr,
                        transition: txID,
                        params: tx_params as unknown as Record<
                            string,
                            unknown
                        >[],
                        amount: _amount,
                    })
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
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                            })
                        }
                    })
                    .catch((err) => {
                        updateModalTx(false)
                        toast.error(String(err), {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: 'dark',
                        })
                    })
            } catch (error) {
                toast.error('Identity verification unsuccessful.', {
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
    }

    return (
        <div className={styles.container}>
            <h3 style={{ color: 'red' }}>{t('LOCK SSI')}</h3>
            {/** @todo-x pause all DID Domains */}
            <p style={{ marginTop: '7%', marginBottom: '7%' }}>
                {t('Only the owner of X’s SSI can lock it.', {
                    name: user?.name,
                })}
            </p>
            <div>
                <Donate />
            </div>
            {donation !== null && (
                <button className={styles.button} onClick={handleSubmit}>
                    <span className={styles.x}>{t('LOCK')}</span>{' '}
                    <span style={{ textTransform: 'lowercase' }}>
                        {user?.name}
                    </span>
                </button>
            )}
        </div>
    )
}

export default Component
