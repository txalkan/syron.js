import React, { useState, useCallback } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { setTxStatusLoading, setTxId } from '../../../../src/app/actions'
import { RootState } from '../../../../src/app/reducers'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import toastTheme from '../../../../src/hooks/toastTheme'

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

    const [issuerSignature, setIssuerSignature] = useState('')
    const [issuerName, setIssuerName] = useState('')
    const [issuerDomain, setIssuerDomain] = useState('')

    const handleIssuer = async (event: { target: { value: any } }) => {
        const input = String(event.target.value).toLowerCase()
        let username_ = ''
        let domain_ = ''
        if (input.includes('@')) {
            const [domain = '', username = ''] = input.split('@')
            username_ = username.replace('.did', '')
            domain_ = domain
        } else {
            if (input.includes('.')) {
                toast.error(t('Invalid'), {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
            } else {
                username_ = input
            }
        }
        setIssuerName(username_)
        setIssuerDomain(domain_)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, username_, domain_)
            .then(async (addr) => {
                //continue
            })
            .catch(() => {
                //@todo-i add continue/saved and do this verification then
                // add @todo-i#2 to this verification
                // toast.error(t('Invalid'), {
                //     position: 'top-right',
                //     autoClose: 3000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: toastTheme(isLight),
                //     toastId: 1
                // })
            })
    }

    const handleIssuerSignature = (event: { target: { value: any } }) => {
        const input = event.target.value
        setIssuerSignature(String(input).toLowerCase())
    }

    const handleSubmit = async () => {
        if (resolvedInfo !== null) {
            try {
                const zilpay = new ZilPayBase()
                let params = Array()
                let is_complete: boolean
                is_complete = is_complete =
                    issuerName !== '' && issuerSignature !== ''
                if (is_complete) {
                    params = await tyron.TyronZil.default.VerifiableCredential(
                        issuerName,
                        issuerDomain,
                        issuerSignature
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
                <section className={styles.container2}>
                    <label>VC Issuer</label>
                </section>
                <div>
                    <input
                        ref={callbackRef}
                        className={styles.input}
                        type="text"
                        placeholder="Type domain name, e.g. sbt@tyron.did"
                        onChange={handleIssuer}
                        // value={ }
                        autoFocus
                    />
                    <input
                        className={styles.input}
                        type="text"
                        placeholder={`Paste ${issuerName}'s signature`}
                        ref={callbackRef}
                        onChange={handleIssuerSignature}
                    />
                </div>
            </section>
            <div className={styles.btnWrapper}>
                <div
                    style={{ width: '100%' }}
                    className={isLight ? 'actionBtnLight' : 'actionBtn'}
                    onClick={handleSubmit}
                >
                    Submit {username}&apos;s DID signature
                </div>
                <p className={styles.gascost}>Gas: around 1.3 ZIL</p>
            </div>
        </div>
    )
}

export default Component
