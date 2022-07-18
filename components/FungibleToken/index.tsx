import React, { useCallback, useState } from 'react'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../src/store/modal'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const dispatch = useDispatch()

    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const resolvedUsername = loginInfo.resolvedUsername

    const [input, setInput] = useState(0) // the lockup period

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        if (!isNaN(input_)) {
            if (input_ === 0) {
                toast.error(t('The amount cannot be zero.'), {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 1,
                })
            } else {
                setInput(input_)
            }
        } else {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 2,
            })
        }
    }
    const handleSubmit = async () => {
        if (resolvedUsername !== null) {
            console.log(resolvedUsername.addr)
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
                        contractAddress: resolvedUsername.addr,
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
                        tx = await tx.confirm(res.ID)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            window.open(
                                `https://devex.zilliqa.com/tx/${
                                    res.ID
                                }?network=https%3A%2F%2F${
                                    net === 'mainnet' ? '' : 'dev-'
                                }api.zilliqa.com`
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
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 7,
                })
            }
        }
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '7%' }}>
            <div>
                <input
                    ref={callbackRef}
                    type="text"
                    placeholder="Type lockup period"
                    onChange={handleInput}
                    autoFocus
                />
            </div>
            <button className="actionBtn" onClick={handleSubmit}>
                <span>submit</span>
            </button>
        </div>
    )
}

export default Component
