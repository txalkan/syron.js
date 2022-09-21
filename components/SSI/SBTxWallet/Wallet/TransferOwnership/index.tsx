import styles from './styles.module.scss'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import * as tyron from 'tyron'
import TickIco from '../../../../../src/assets/icons/tick.svg'
import ContinueArrow from '../../../../../src/assets/icons/continue_arrow.svg'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import { useStore } from 'effector-react'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import Donate from '../../../../Donate'
import toastTheme from '../../../../../src/hooks/toastTheme'
import { toast } from 'react-toastify'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import smartContract from '../../../../../src/utils/smartContract'
import Spinner from '../../../../Spinner'

function Component() {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { getSmartContract } = smartContract()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const donation = useStore($donation)
    const resolvedInfo = useStore($resolvedInfo)

    const [saved, setSaved] = useState(false)
    const [loading, setLoading] = useState(false)
    const [input, setInput] = useState('')

    const handleInput = (event: { target: { value: any } }) => {
        setSaved(false)
        updateDonation(null)
        const input = event.target.value
        setInput(String(input).toLowerCase())
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleSave = async () => {
        setLoading(true)
        const input_ = input.replace('.did', '')
        if (tyron.SearchBarUtil.default.isValidUsername(input_)) {
            const addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            const get_services = await getSmartContract(addr, 'services')
            const services = await tyron.SmartUtil.default.intoMap(
                get_services.result.services
            )
            getSmartContract(services.get('init'), 'did_dns').then(
                async (res) => {
                    const val = Object.values(res.result.did_dns)
                    const key = Object.keys(res.result.did_dns)
                    let list: any = []
                    for (let i = 0; i < val.length; i += 1) {
                        if (val[i] === loginInfo.address.toLowerCase()) {
                            list.push(key[i])
                        }
                    }
                    if (list.some((val) => val === input_)) {
                        setSaved(true)
                    } else {
                        toast.error("Username doesn't exists", {
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
                    }
                }
            )
        } else {
            toast.error('Unavailable username', {
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
        }
        setLoading(false)
    }

    const handleSubmit = async () => {
        try {
            const zilpay = new ZilPayBase()

            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            let tx = await tyron.Init.default.transaction(net)

            const params: any = []

            const username = {
                vname: 'username',
                type: 'String',
                value: input,
            }
            params.push(username)

            const tyron__ = await tyron.Donation.default.tyron(donation!)
            const tyron_ = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: tyron__,
            }
            params.push(tyron_)

            await zilpay
                .call({
                    contractAddress: resolvedInfo?.addr!,
                    transition: 'UpdateUsername',
                    params: params as unknown as Record<string, unknown>[],
                    amount: String(donation),
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
    }

    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    className={styles.input}
                    onChange={handleInput}
                    onKeyPress={handleOnKeyPress}
                    placeholder={t('TYPE_USERNAME')}
                    autoFocus
                />
                <div className={styles.arrowWrapper}>
                    <div
                        className={
                            saved || loading
                                ? 'continueBtnSaved'
                                : 'continueBtn'
                        }
                        onClick={() => {
                            if (!saved) {
                                handleSave()
                            }
                        }}
                    >
                        {loading ? (
                            <Spinner />
                        ) : (
                            <Image
                                width={35}
                                height={35}
                                src={saved ? TickIco : ContinueArrow}
                                alt="arrow"
                            />
                        )}
                    </div>
                </div>
            </div>
            {saved && (
                <>
                    <Donate />
                    {donation !== null && (
                        <div className={styles.btnWrapper}>
                            <div
                                style={{ width: '100%' }}
                                className={
                                    isLight ? 'actionBtnLight' : 'actionBtn'
                                }
                                onClick={handleSubmit}
                            >
                                Transfer Ownership
                            </div>
                            <p className={styles.gascost}>
                                Gas: around 1.3 ZIL
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
