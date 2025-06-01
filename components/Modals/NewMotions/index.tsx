import React, { useState } from 'react'
import * as tyron from 'tyron'
import { useStore as effectorStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import {
    $modalNewMotions,
    $xpointsBalance,
    updateModalTx,
    updateModalTxMinimized,
    updateNewMotionsModal,
} from '../../../src/store/modal'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { RootState } from '../../../src/app/reducers'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import toastTheme from '../../../src/hooks/toastTheme'
import ThreeDots from '../../Spinner/ThreeDots'
import { sendTelegramNotification } from '../../../src/telegram'
import { $net } from '../../../src/store/network'
import { useStore } from 'react-stores'

function Component() {
    const { t } = useTranslation()
    const modalNewMotions = effectorStore($modalNewMotions)
    const net = $net.state.net as 'mainnet' | 'testnet'
    const resolvedInfo = useStore($resolvedInfo)
    const xpointsBalance = effectorStore($xpointsBalance)
    const dispatch = useDispatch()
    const [motion, setMotion] = useState()
    const [amount, setAmount] = useState(0)
    const [loading, setLoading] = useState(false)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg

    if (!modalNewMotions) {
        return null
    }

    const handleChange = (e: { target: { value: any; name: string } }) => {
        let value = e.target.value
        if (e.target.name === 'motion') {
            if (
                value.includes('á') ||
                value.includes('é') ||
                value.includes('í') ||
                value.includes('ú') ||
                value.includes('ó')
            ) {
                toast.warn('Please input a valid string.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 1,
                })
            } else {
                setMotion(value)
            }
        } else {
            if (isNaN(value)) {
                toast.warn('Please input a valid number.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 1,
                })
            } else if (Number(value) > xpointsBalance!) {
                toast.warn('Not enough xPoints.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 1,
                })
            } else {
                setAmount(value)
            }
        }
    }

    const webHook = async (txid, motion) => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: `TYRON ${net}\n\nNEW xPOINT motion: "${motion.replaceAll(
                new RegExp('\\\\n', 'g'),
                `\n`
            )}"
            \n\nxPOINT tokens balance: $xP ${Number(amount)?.toFixed(2)}
            \n\nxPOINTS.ssi dApp: https://tyron.network/xpoints`,
        }
        await sendTelegramNotification(request.body)
        // \n\nTransaction: ${txid}
        //await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_URL}`, request)
    }

    const handleSubmit = async () => {
        setLoading(true)

        if (loginInfo.zilAddr !== null) {
            try {
                const zilpay = new ZilPayBase()

                const tx_params = Array()

                const tx_action = {
                    vname: 'action',
                    type: 'String',
                    value: 'new',
                }
                tx_params.push(tx_action)

                let id = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.none,
                    'ByStr32'
                )
                const tx_id = {
                    vname: 'id',
                    type: 'Option ByStr32',
                    value: id,
                }
                tx_params.push(tx_id)

                let motion_ = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'String',
                    motion
                )
                const tx_motion = {
                    vname: 'motion',
                    type: 'Option String',
                    value: motion_,
                }
                tx_params.push(tx_motion)

                const tx_amount = {
                    vname: 'amount',
                    type: 'Uint128',
                    value: String(Number(amount) * 1e12),
                }
                tx_params.push(tx_amount)

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                await zilpay
                    .call({
                        contractAddress: resolvedInfo?.addr!,
                        transition: 'RaiseYourVoice',
                        params: tx_params as unknown as Record<
                            string,
                            unknown
                        >[],
                        amount: String(0),
                    })
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        try {
                            tx = await tx.confirm(res.ID, 33)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                const txUrl = `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                webHook(txUrl, motion)
                                window.open(txUrl)
                                updateNewMotionsModal(false)
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                            }
                        } catch (err) {
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
                        }
                    })
            } catch (error) {
                updateModalTx(false)
                dispatch(setTxStatusLoading('idle'))
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
        } else {
            toast.warn('some data is missing.', {
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
        setLoading(false)
    }

    const outerClose = () => {
        if (window.confirm('Are you sure about closing this window?')) {
            updateNewMotionsModal(false)
        }
    }

    return (
        <>
            <div onClick={outerClose} className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div onClick={outerClose} className="closeIcon">
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <h5 className={styles.headerTxt}>{t('NEW MOTIONS')}</h5>
                    </div>
                    <div className={styles.contentWrapper}>
                        <div>
                            <h6 className={styles.headerInput}>
                                {t('MOTION')}
                            </h6>
                            <textarea
                                name="motion"
                                onChange={handleChange}
                                className={styles.txtArea}
                            />
                        </div>
                        <div>
                            <h6 className={styles.headerInput}>
                                {t('AMOUNT (BALANCE:')}{' '}
                                <span
                                    style={{
                                        color: isLight ? '#000' : '#ffff32',
                                    }}
                                >
                                    {xpointsBalance?.toFixed(2)}
                                </span>{' '}
                                <span style={{ textTransform: 'none' }}>x</span>
                                Point{xpointsBalance! > 1 ? 's' : ''})
                            </h6>
                            <input
                                name="amount"
                                onChange={handleChange}
                                className={styles.inputAmount}
                            />
                        </div>
                        <div
                            onClick={handleSubmit}
                            style={{ marginTop: '5%' }}
                            className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        >
                            {loading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                <span>{t('SUBMIT')}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
