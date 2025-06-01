import React, { useState } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import { setTxStatusLoading, setTxId } from '../../../../../../src/app/actions'
import { RootState } from '../../../../../../src/app/reducers'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import toastTheme from '../../../../../../src/hooks/toastTheme'
import { Arrow, Spinner } from '../../../../..'
import TickIco from '../../../../../../src/assets/icons/tick.svg'
import ThreeDots from '../../../../../Spinner/ThreeDots'
import { $net } from '../../../../../../src/store/network'
import { useStore } from 'react-stores'

function Component({
    txName,
    handleIssuer,
    issuerDomain,
    issuerSubdomain,
    setIssuerInput,
    savedIssuer,
    setSavedIssuer,
    loading,
}) {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedSubdomain = resolvedInfo?.user_subdomain
    const resolvedTLD = resolvedInfo?.user_tld
    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const [issuerSignature, setIssuerSignature] = useState('')
    const [savedSignature, setSavedSignature] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const onChangeIssuer = (event: { target: { value: any } }) => {
        setSavedIssuer(false)
        setIssuerSignature('')
        const input = String(event.target.value).toLowerCase()
        setIssuerInput(input)
    }

    const handleOnKeyPressIssuer = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleIssuer()
        }
    }

    const handleOnKeyPressSignature = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSaveSignature()
        }
    }

    const handleSaveSignature = () => {
        if (
            issuerSignature.length > 2 &&
            issuerSignature.slice(0, 2) !== '0x'
        ) {
            toast.warn('A DID Signature must start with 0x', {
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
            setSavedSignature(true)
        }
    }

    const handleIssuerSignature = (event: { target: { value: any } }) => {
        setSavedSignature(false)
        const input = event.target.value
        setIssuerSignature(String(input).toLowerCase())
    }

    const handleSubmit = async () => {
        setLoadingSubmit(true)
        if (resolvedInfo !== null) {
            try {
                const zilpay = new ZilPayBase()
                let params = Array()
                let is_complete: boolean
                is_complete = is_complete =
                    issuerDomain !== '' && issuerSignature !== ''
                if (is_complete) {
                    params = await tyron.TyronZil.default.VerifiableCredential(
                        issuerDomain,
                        issuerSubdomain,
                        issuerSignature
                    )
                } else {
                    throw new Error('input data is missing')
                }

                if (is_complete) {
                    toast.info(
                        `You're about to mint a Soulbound Token for ${resolvedSubdomain}@${resolvedDomain}.${resolvedTLD}`,
                        {
                            position: 'top-center',
                            autoClose: 3000,
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
                            tx = await tx.confirm(res.ID, 33)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                                setTimeout(() => {
                                    const message = t('Transaction failed.')
                                    toast.warn(message, {
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
                        })
                }
            } catch (error) {
                toast.warn(String(error), {
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
        setLoadingSubmit(false)
    }

    return (
        <div className={styles.container}>
            <section className={styles.containerX}>
                <label className={styles.label}>SBT Issuer</label>
                <div>
                    <section className={styles.container2}>
                        <input
                            className={styles.input}
                            type="text"
                            //placeholder={issuerSubdomain}
                            onChange={onChangeIssuer}
                            onKeyPress={handleOnKeyPressIssuer}
                            //value={}
                        />
                        <div className={styles.arrowWrapper}>
                            <div
                                className={
                                    savedIssuer || loading
                                        ? 'continueBtnSaved'
                                        : ''
                                }
                                onClick={() => {
                                    if (!savedIssuer) {
                                        handleIssuer()
                                    }
                                }}
                            >
                                {loading ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        {savedIssuer ? (
                                            <Image
                                                width={50}
                                                height={50}
                                                src={TickIco}
                                                alt="arrow"
                                            />
                                        ) : (
                                            <Arrow width={50} height={50} />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </section>
                    {savedIssuer && (
                        <section className={styles.container2}>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder={`DID signature`}
                                onChange={handleIssuerSignature}
                                onKeyPress={handleOnKeyPressSignature}
                            />
                            <div className={styles.arrowWrapper}>
                                <div
                                    onClick={handleSaveSignature}
                                    className={
                                        savedSignature ? 'continueBtnSaved' : ''
                                    }
                                >
                                    {savedSignature ? (
                                        <Image
                                            width={50}
                                            height={50}
                                            src={TickIco}
                                            alt="arrow"
                                        />
                                    ) : (
                                        <Arrow width={50} height={50} />
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </section>
            {savedIssuer && savedSignature && (
                <div className={styles.btnWrapper}>
                    <div
                        style={{ width: '100%' }}
                        className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        onClick={handleSubmit}
                    >
                        {loadingSubmit ? (
                            <ThreeDots color="yellow" />
                        ) : (
                            <>MINT SBT</>
                        )}
                    </div>
                    <div className={styles.gascost}>Gas lower than 1 ZIL</div>
                </div>
            )}
        </div>
    )
}

export default Component
