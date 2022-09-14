import React, { useState } from 'react'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { RootState } from '../../../src/app/reducers'
import Selector from '../../Selector'
import { $arconnect } from '../../../src/store/arconnect'
import toastTheme from '../../../src/hooks/toastTheme'
import Ivms101 from './Ivms101'
import VC from './VC'
import { useTranslation } from 'next-i18next'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import UpdateUsername from './UpdateUsername'
import Pause from './Pause'
import UpdatePublicEncryption from './UpdatePublicEncryption'

function Component() {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const arConnect = useStore($arconnect)
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const net = useSelector((state: RootState) => state.modal.net)

    const [txName, setTxName] = useState('')

    const handleOnChange = (value) => {
        const selection = value
        if (zilAddr === null) {
            toast.info('To continue, connect with ZilPay.', {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        } else {
            if (selection === 'Ivms101') {
                if (arConnect === null) {
                    toast.warning('Connect with ArConnect.', {
                        position: 'top-center',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                    })
                } else {
                    setTxName(selection)
                }
            } else if (selection === 'AcceptPendingUsername') {
                handleSubmit(selection)
            } else {
                setTxName(selection)
            }
        }
    }

    const handleSubmit = async (value: any) => {
        if (resolvedInfo !== null) {
            try {
                const zilpay = new ZilPayBase()
                const txID = value

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                await zilpay
                    .call({
                        contractAddress: resolvedInfo?.addr!,
                        transition: txID,
                        params: [],
                        amount: String(0),
                    })
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        try {
                            tx = await tx.confirm(res.ID)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                            }
                        } catch (err) {
                            dispatch(setTxStatusLoading('rejected'))
                            updateModalTxMinimized(false)
                            updateModalTx(true)
                            toast.error(t(String(err)), {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                            })
                        }
                    })
            } catch (error) {
                updateModalTx(false)
                dispatch(setTxStatusLoading('idle'))
                toast.error(t(String(error)), {
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
        } else {
            toast.error('some data is missing.', {
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

    const option = [
        {
            key: '',
            name: 'Select action',
        },
        {
            key: 'Ivms101',
            name: 'Upload Travel Rule',
        },
        {
            key: 'Verifiable_Credential',
            name: `Mint Issuer's SBT`,
        },

        {
            key: 'UpdatePublicEncryption',
            name: 'Update Public Encryption',
        },
        {
            key: 'UpdateUsername',
            name: 'Update Username',
        },
        {
            key: 'AcceptPendingUsername',
            name: t('Accept pending username'),
        },
        {
            key: 'Pause',
            name: 'Pause',
        },
        {
            key: 'Unpause',
            name: 'Unpause',
        },
    ]

    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '10%',
                    }}
                >
                    <div
                        style={{
                            textAlign: 'left',
                            marginTop: '10%',
                        }}
                    >
                        <div className={styles.cardHeadline}>
                            <h3 style={{ color: '#dbe4eb', textTransform: 'none' }}>
                                Soulbound xWallet{' '}
                            </h3>{' '}
                        </div>
                        <h1>
                            <p className={styles.username}>
                                {domain}@{username}.did
                            </p>{' '}
                        </h1>
                    </div>
                </div>
                <div className={styles.selector}>
                    <Selector
                        option={option}
                        onChange={handleOnChange}
                        value={txName}
                    />
                </div>
                {txName === 'Ivms101' && <Ivms101 txName={txName} />}
                {txName === 'Verifiable_Credential' && <VC txName={txName} />}
                {txName === 'UpdateUsername' && <UpdateUsername />}
                {txName === 'Pause' && <Pause pause={true} />}
                {txName === 'Unpause' && <Pause pause={false} />}
                {txName === 'UpdatePublicEncryption' && (
                    <UpdatePublicEncryption />
                )}
            </div>
        </div>
    )
}

export default Component
