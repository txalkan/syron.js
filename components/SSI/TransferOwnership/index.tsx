import styles from './styles.module.scss'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import * as tyron from 'tyron'
import TickIcoYellow from '../../../src/assets/icons/tick.svg'
import TickIcoBlue from '../../../src/assets/icons/tick_blue.svg'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useStore as effectorStore } from 'effector-react'
import { $donation, updateDonation } from '../../../src/store/donation'
import Donate from '../../Donate'
import toastTheme from '../../../src/hooks/toastTheme'
import { toast } from 'react-toastify'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import Spinner from '../../Spinner'
import isZil from '../../../src/hooks/isZil'
import ThreeDots from '../../Spinner/ThreeDots'
import { Arrow } from '../..'
import { $net } from '../../../src/store/network'
import { useStore } from 'react-stores'

function Component() {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const { t } = useTranslation()
    const dispatch = useDispatch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const donation = effectorStore($donation)
    const resolvedInfo = useStore($resolvedInfo)
    const isZil_ = isZil(resolvedInfo?.version)
    const TickIco = isZil_ ? TickIcoBlue : TickIcoYellow

    const [saved, setSaved] = useState(false)
    const [loading, setLoading] = useState(false)
    const [input_, setInput] = useState('')
    const [loadingSubmit, setLoadingSubmit] = useState(false)

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
        //@todo-x review/test
        const input = input_.replace('.did', '').replace('.ssi', '')
        tyron.SearchBarUtil.default
            .fetchAddr(net, 'did', input)
            .then(async () => {
                setSaved(true)
                const domainId =
                    '0x' + (await tyron.Util.default.HashString(input))

                //setInput(input)
                setInput(domainId)
            })
            .catch(() => {
                toast.error('The given NFT Domain Name is not registered.', {
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
            })
        setLoading(false)
    }

    const handleSubmit = async () => {
        setLoadingSubmit(true)
        try {
            const zilpay = new ZilPayBase()

            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            let tx = await tyron.Init.default.transaction(net)

            const params: any = []

            //@review: older versions
            // const username = {
            //     vname: 'username',
            //     type: 'String',
            //     value: input_,
            // }
            const username = {
                vname: 'domain',
                type: 'ByStr32',
                value: input_,
            }
            params.push(username)

            const tyron__ = await tyron.Donation.default.tyron(donation!)
            const tyron_ = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: tyron__,
            }
            params.push(tyron_)
            let _amount = '0'
            if (donation !== null) {
                _amount = String(donation)
            }
            console.log('TXN_PARAMS', JSON.stringify(params, null, 2))
            await zilpay
                .call({
                    contractAddress: resolvedInfo?.addr!,
                    transition: 'UpdateDomain', //'UpdateUsername', @review: older versions
                    params: params as unknown as Record<string, unknown>[],
                    amount: _amount,
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    try {
                        tx = await tx.confirm(res.ID, 33)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            window.open(
                                `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                        }
                    } catch (err) {
                        dispatch(setTxStatusLoading('rejected'))
                        updateModalTxMinimized(false)
                        updateModalTx(true)
                        toast.warn(t(String(err)), {
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
            toast.warn(t(String(error)), {
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
        setLoadingSubmit(false)
    }

    const btnClassName = () => {
        if (isZil_) {
            if (isLight) {
                return 'actionBtnBlueLight'
            } else {
                return 'actionBtnBlue'
            }
        } else {
            if (isLight) {
                return 'actionBtnLight'
            } else {
                return 'actionBtn'
            }
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
                    placeholder={t('TYPE DOMAIN')}
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
                            <>
                                {saved ? (
                                    <Image
                                        width={35}
                                        height={35}
                                        src={TickIco}
                                        alt="arrow"
                                    />
                                ) : (
                                    <Arrow width={35} height={35} />
                                )}
                            </>
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
                                className={btnClassName()}
                                onClick={handleSubmit}
                            >
                                {loadingSubmit ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    <>Transfer Ownership</>
                                )}
                            </div>
                            <div className={styles.gasTxt}>
                                Gas lower than 2 ZIL
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
