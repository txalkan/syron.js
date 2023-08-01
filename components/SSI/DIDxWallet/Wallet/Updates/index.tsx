import React, { useEffect, useRef, useState } from 'react'
import { useStore as effectorStore } from 'effector-react'
import { toast } from 'react-toastify'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { setTxId, setTxStatusLoading } from '../../../../../src/app/actions'
import { Arrow, Donate } from '../../../../index'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import { RootState } from '../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import backIco from '../../../../../src/assets/icons/arrow_left_chrome.svg'
import TickIco from '../../../../../src/assets/icons/tick.svg'
import toastTheme from '../../../../../src/hooks/toastTheme'
import ThreeDots from '../../../../Spinner/ThreeDots'
import { $net } from '../../../../../src/store/network'
import { useStore } from 'react-stores'

function Component() {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = effectorStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const [menu, setMenu] = useState('')
    const [input, setInput] = useState('')
    const [legend, setLegend] = useState('save')
    const [loading, setLoading] = useState(false)

    const submitUpdate = async () => {
        if (resolvedInfo !== null && donation !== null) {
            try {
                const zilpay = new ZilPayBase()

                const tyron_ = await tyron.Donation.default.tyron(donation)

                let params = Array()
                let transition: string
                switch (menu) {
                    case 'username':
                        transition = 'UpdateUsername'
                        const username_ = {
                            vname: 'username',
                            type: 'String',
                            value: input,
                        }
                        params.push(username_)
                        break
                    case 'deadline':
                        transition = 'UpdateDeadline'
                        const val_ = {
                            vname: 'val',
                            type: 'Uint128',
                            value: input,
                        }
                        params.push(val_)
                        break
                    default:
                        transition = 'UpdateController'
                        const addr_ = {
                            vname: 'addr',
                            type: 'ByStr20',
                            value: input,
                        }
                        params.push(addr_)
                        break
                }

                const tyron__ = {
                    vname: 'tyron',
                    type: 'Option Uint128',
                    value: tyron_,
                }
                params.push(tyron__)

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)
                await zilpay
                    .call({
                        contractAddress: resolvedInfo?.addr!,
                        transition: transition,
                        params: params as unknown as Record<string, unknown>[],
                        amount: String(donation),
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
                                toast.warn(t('Transaction failed.'), {
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
            } catch (error) {
                dispatch(setTxStatusLoading('rejected'))
                updateModalTxMinimized(false)
                updateModalTx(true)
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
                toastId: 13,
            })
        }
        updateDonation(null)
    }

    const handleInput = (event: { target: { value: any; name: any } }) => {
        setInput('')
        setLegend('save')
        updateDonation(null)

        let input = event.target.value

        if (menu === 'controller') {
            setInput(input)
        } else if (menu === 'username') {
            setInput(input)
        } else if (menu === 'deadline') {
            input = Number(input)
            if (isNaN(input)) {
                toast.warn(t('The input is not a number.'), {
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
                setInput(String(input))
            }
        }
    }

    const validateInputAddr = () => {
        const addr = tyron.Address.default.verification(input)
        if (addr !== '') {
            setLegend('saved')
            setInput(addr)
        } else {
            toast.warn(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            validateInputAddr()
        }
    }

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {menu === '' && (
                <>
                    <h2>
                        <div
                            onClick={() => setMenu('controller')}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <div className={styles.cardTitle3}>
                                        {t('CONTROLLER')}
                                    </div>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <div className={styles.cardTitle2}>
                                        {t(
                                            'CHANGE THE ADDRESS OF THE DID CONTROLLER'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </h2>
                    {/* <h2>
                        <div
                            onClick={() => setMenu('username')}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <div className={styles.cardTitle3}>
                                        {t('USERNAME')}
                                    </div>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <div className={styles.cardTitle2}>
                                        {t(
                                            'UPDATE THE PUBLIC NAME OF YOUR SSI'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </h2>
                    <h2>
                        <div
                            onClick={() => setMenu('deadline')}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <div className={styles.cardTitle3}>
                                        {t('DEADLINE')}
                                    </div>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <div className={styles.cardTitle2}>
                                        {t(
                                            'UPDATE THE MAXIMUM AMOUNT OF BLOCKS THAT YOUR SSI IS WILLING TO WAIT FOR A TRANSACTION TO GET CONFIRMED'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </h2> */}
                </>
            )}
            {menu !== '' && (
                <button
                    onClick={() => {
                        setMenu('')
                        setInput('')
                    }}
                    style={{
                        marginBottom: '10%',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    className="button"
                >
                    <Image src={backIco} alt="back-ico" />
                </button>
            )}
            {menu === 'controller' && (
                <>
                    <h3 className={styles.txt}>{t('UPDATE DID CONTROLLER')}</h3>
                    <div
                        style={{ marginBottom: '2rem' }}
                        className={styles.txt}
                    >
                        {t('New DID Controller address:')}
                    </div>
                    <div style={{ display: 'flex', marginTop: '5%' }}>
                        <input
                            name="controller"
                            className={styles.input}
                            type="text"
                            onChange={handleInput}
                            onKeyPress={handleOnKeyPress}
                            placeholder={t('Type address')}
                        />
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginLeft: '20px',
                            }}
                        >
                            <div onClick={validateInputAddr}>
                                {legend === 'save' ? (
                                    <Arrow />
                                ) : (
                                    <div
                                        style={{
                                            marginTop: '5px',
                                        }}
                                    >
                                        <Image
                                            width={40}
                                            src={TickIco}
                                            alt="tick"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {legend !== 'save' && (
                        <div className={styles.donateWrapper}>
                            <Donate />
                        </div>
                    )}
                    {legend !== 'save' && donation !== null && (
                        <div
                            onClick={submitUpdate}
                            className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        >
                            {loading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                <span>{t('UPDATE DID CONTROLLER')}</span>
                            )}
                        </div>
                    )}
                </>
            )}
            {menu === 'username' && (
                <>
                    <h3>{t('UPDATE SSI USERNAME')}</h3>
                    <div style={{ marginBottom: '2rem' }}>
                        {t(
                            'This username is a public name that other dApps can use to verify data about your SSI.'
                        )}
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        {t(
                            'Only the owner of the NFT Username is allowed to confirm this update by calling the Accept Pending Username transaction.'
                        )}
                    </div>
                    <div style={{ display: 'flex' }}>
                        <input
                            name="username"
                            style={{
                                width: '100%',
                                marginLeft: '2%',
                                marginRight: '2%',
                                marginTop: '14%',
                            }}
                            type="text"
                            onChange={handleInput}
                            placeholder={t('Type username')}
                        />
                    </div>
                    {input !== '' && (
                        <div className={styles.donateWrapper}>
                            <Donate />
                        </div>
                    )}
                    {input !== '' && donation !== null && (
                        <div
                            onClick={submitUpdate}
                            className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        >
                            {loading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                <span>{t('UPDATE SSI USERNAME')}</span>
                            )}
                        </div>
                    )}
                </>
            )}
            {menu === 'deadline' && (
                <>
                    <h3>{t('UPDATE DEADLINE')}</h3>
                    <div style={{ marginBottom: '2rem' }}>
                        {t(
                            'The deadline is the number of blocks you are willing to wait for a transaction to get processed on the blockchain (each block is approximately 2min).'
                        )}
                    </div>
                    <h4>{t('TYPE THE NUMBER OF BLOCKS:')}</h4>
                    <div style={{ display: 'flex' }}>
                        <input
                            name="deadline"
                            style={{
                                width: '100%',
                                marginLeft: '2%',
                                marginRight: '2%',
                                marginTop: '14%',
                            }}
                            type="text"
                            onChange={handleInput}
                            placeholder="Type number"
                        />
                    </div>
                    {input !== '' && input !== '0' && (
                        <div className={styles.donateWrapper}>
                            <Donate />
                        </div>
                    )}
                    {input !== '' && input !== '0' && donation !== null && (
                        <div
                            onClick={submitUpdate}
                            className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        >
                            {loading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                <span>{t('UPDATE DEADLINE')}</span>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
