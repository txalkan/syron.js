import React, { useState } from 'react'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../src/store/modal'
import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import toastTheme from '../../src/hooks/toastTheme'
import ThreeDots from '../Spinner/ThreeDots'
import { $net } from '../../src/store/network'
import { useStore } from 'react-stores'

function Component() {
    const { t } = useTranslation()

    const dispatch = useDispatch()

    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)

    const [input, setInput] = useState(0) // the lockup period
    const [loading, setLoading] = useState(false)

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        if (!isNaN(input_)) {
            if (input_ === 0) {
                const message = t('The amount cannot be zero.')
                toast.warn(message, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 1,
                })
            } else {
                setInput(input_)
            }
        } else {
            const message = t('The input is not a number.')
            toast.warn(message, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }
    }
    const handleSubmit = async () => {
        if (resolvedInfo !== null!) {
            try {
                const txID = 'UpdateLockup'
                const zilpay = new ZilPayBase()
                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                const tx_params = Array()

                const val_ = {
                    vname: 'val',
                    type: 'Uint128',
                    value: String(input),
                }
                tx_params.push(val_)

                const tyron_ = await tyron.Donation.default.tyron(0)
                const _tyron: tyron.TyronZil.TransitionParams = {
                    vname: 'tyron',
                    type: 'Option Uint128',
                    value: tyron_,
                }
                tx_params.push(_tyron)

                await zilpay
                    .call({
                        contractAddress: resolvedInfo?.addr!,
                        transition: txID,
                        params: tx_params as unknown as Record<
                            string,
                            unknown
                        >[],
                        amount: String(0),
                    })
                    .then(async (res: any) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        tx = await tx.confirm(res.ID, 33)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            window.open(
                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                        }
                    })
                    .catch((err: any) => {
                        dispatch(setTxStatusLoading('idle'))
                        throw new Error('Could not confirm the transaction.')
                    })
            } catch (error) {
                dispatch(setTxStatusLoading('rejected'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                toast.warn(String(error), {
                    position: 'bottom-right',
                    autoClose: 3000,
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

    return (
        <div style={{ textAlign: 'center', marginTop: '7%' }}>
            <div>
                <input
                    type="text"
                    placeholder="Type lockup period"
                    onChange={handleInput}
                />
            </div>
            <button
                className={isLight ? 'actionBtnLight' : 'actionBtn'}
                onClick={handleSubmit}
            >
                {loading ? <ThreeDots color="#fffd32" /> : <span>submit</span>}
            </button>
        </div>
    )
}

export default Component
