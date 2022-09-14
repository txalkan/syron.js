import React, { useState, useCallback } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { setTxStatusLoading, setTxId } from '../../../src/app/actions'
import { RootState } from '../../../src/app/reducers'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import toastTheme from '../../../src/hooks/toastTheme'

function Component({ txName }) {
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const [input, setInput] = useState('')
    const [inputB, setInputB] = useState('')

    const handleInput = (event: { target: { value: any } }) => {
        const input = event.target.value
        setInput(String(input).toLowerCase())
    }
    const handleInputB = (event: { target: { value: any } }) => {
        const input = event.target.value
        setInputB(String(input).toLowerCase())
    }

    const handleSubmit = async () => {
        if (resolvedInfo !== null) {
            try {
                const zilpay = new ZilPayBase()
                let params = Array()
                let is_complete
                is_complete = input !== '' && inputB !== ''
                if (is_complete) {
                    params = await tyron.TyronZil.default.VerifiableCredential(
                        input,
                        inputB
                    )
                } else {
                    throw new Error('input data is missing')
                }

                if (is_complete) {
                    toast.info(
                        `You're about to submit ${username}'s DID signature to authenticate your Verifiable Credential.`,
                        {
                            position: 'top-center',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                        }
                    )

                    dispatch(setTxStatusLoading('true'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    let tx = await tyron.Init.default.transaction(net)
                    await zilpay
                        .call({
                            contractAddress: resolvedInfo?.addr!,
                            transition: txName,
                            params: params,
                            amount: '0',
                        })
                        .then(async (res) => {
                            dispatch(setTxId(res.ID))
                            dispatch(setTxStatusLoading('submitted'))
                            tx = await tx.confirm(res.ID)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
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
                                        theme: toastTheme(isLight),
                                    })
                                }, 1000)
                            }
                        })
                        .catch((err) => {
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
                                theme: toastTheme(isLight),
                            })
                        })
                }
            } catch (error) {
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 12,
                })
            }
        }
    }

    return (
        <div className={styles.container}>
            <section className={styles.containerX}>
                <input
                    ref={callbackRef}
                    type="text"
                    placeholder="Type your NFT Username without .did"
                    onChange={handleInput}
                    value={input}
                    autoFocus
                    style={{ width: '55%' }}
                />
                <input
                    style={{ width: '80%' }}
                    type="text"
                    placeholder={`Paste ${username}'s signature`}
                    ref={callbackRef}
                    onChange={handleInputB}
                />
            </section>
            <div style={{ marginTop: '10%' }}>
                <div
                    className={isLight ? 'actionBtnLight' : 'actionBtn'}
                    onClick={handleSubmit}
                >
                    Submit&nbsp;<span>{username}&apos;s</span>&nbsp;DID signature
                </div>
                <p className={styles.gascost}>Gas: around 1.3 ZIL</p>
            </div>
        </div>
    )
}

export default Component
