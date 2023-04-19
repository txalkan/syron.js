import React, { useState, useCallback } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { $donation, $extraZil, updateDonation } from '../../src/store/donation'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import TickIcoYellow from '../../src/assets/icons/tick.svg'
import TickIcoPurple from '../../src/assets/icons/tick_purple.svg'
import TickIcoBlue from '../../src/assets/icons/tick_blue.svg'
import Image from 'next/image'
import smartContract from '../../src/utils/smartContract'
import { $zilpayBalance } from '../../src/store/modal'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import toastTheme from '../../src/hooks/toastTheme'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import isZil from '../../src/hooks/isZil'
import Arrow from '../Arrow'
import CloseIcoReg from '../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../src/assets/icons/ic_cross_black.svg'
import ArrowReg from '../../src/assets/icons/right_down.svg'
import ArrowDark from '../../src/assets/icons/right_down_black.svg'

function Component() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()

    const donation = $donation.getState()
    const zilBal = $zilpayBalance.getState()
    const extraZil = $extraZil.getState()
    const resolvedInfo = $resolvedInfo.getState()
    let donation_: string | undefined
    const isZil_ = isZil(resolvedInfo?.version)

    if (donation === null) {
        donation_ = t('Amount')
    } else {
        donation_ = String(donation)
    }

    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = loginInfo.isLight
    const TickIco = isZil_
        ? TickIcoBlue
        : isLight
        ? TickIcoPurple
        : TickIcoYellow
    const styles = isLight ? stylesLight : stylesDark
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const ArrowIco = isLight ? ArrowDark : ArrowReg

    const [input, setInput] = useState(0) // donation amount
    const [hide, setHide] = useState(false) // donation amount
    const handleInput = (event: { target: { value: any } }) => {
        updateDonation(null)
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        input = Number(input)
        setInput(input)
        if (isNaN(input)) {
            input = 0
        }
        setInput(input)
    }
    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        if (Number(extraZil) > 0 && Number(zilBal) < input + Number(extraZil)) {
            toast.error('Insufficient balance', {
                position: 'top-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        } else {
            updateDonation(input)
            const donation = $donation.getState()
            if (input !== 0) {
                try {
                    const domainId =
                        '0x' + (await tyron.Util.default.HashString('donate'))
                    await tyron.SearchBarUtil.default
                        .fetchAddr(net, domainId, '')
                        .then(async (donate_addr) => {
                            return await getSmartContract(
                                donate_addr,
                                'xpoints'
                            )
                        })
                        .then(async (balances) => {
                            return await tyron.SmartUtil.default.intoMap(
                                balances.result.xpoints
                            )
                        })
                        .then((balances_) => {
                            // Get balance of the logged in address
                            const balance = balances_.get(
                                loginInfo.zilAddr?.base16.toLowerCase()
                            )
                            if (balance !== undefined) {
                                toast.info(
                                    t(
                                        'Thank you! You are getting X xPoints. Current balance: X xPoints',
                                        {
                                            value: donation!.toFixed(2),
                                            balance: (balance / 1e12).toFixed(
                                                2
                                            ),
                                            s:
                                                Number(donation) === 1
                                                    ? ''
                                                    : 's',
                                            s2:
                                                Number(balance / 1e12) === 1
                                                    ? ''
                                                    : 's',
                                        }
                                    ),
                                    {
                                        position: 'bottom-center',
                                        autoClose: 4000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: toastTheme(isLight),
                                        toastId: 2,
                                    }
                                )
                            }
                        })
                        .catch(() => {
                            throw new Error(
                                'Donate DApp: Not able to fetch balance.'
                            )
                        })
                } catch (error) {
                    toast.warn(String(error), {
                        position: 'bottom-right',
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 3,
                    })
                }
            } else {
                toast.info(t('Donating 0'), {
                    position: 'bottom-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 4,
                })
            }
        }
    }

    const toggleHideDonate = () => {
        if (hide) {
            setHide(false)
            setInput(0)
            updateDonation(null)
        } else {
            setHide(true)
            updateDonation(0)
        }
    }

    return (
        <>
            {hide ? (
                <div className={styles.wrapper0}>
                    <div
                        onClick={toggleHideDonate}
                        className={styles.componentMinimized}
                    >
                        <div>SUPPORT TYRON</div>
                        <div className={styles.restoreIcoWrapper}>
                            <div className={styles.restoreIco}>
                                <Image
                                    alt="ico-restore"
                                    src={ArrowIco}
                                    width={30}
                                    height={30}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.wrapper}>
                    <div className={styles.closeIcoWrapper}>
                        <div
                            onClick={toggleHideDonate}
                            className={styles.closeIco}
                        >
                            <Image width={10} src={CloseIco} alt="close-ico" />
                        </div>
                    </div>
                    <div
                        style={{
                            color: isLight ? '#000' : '#fff',
                            marginBottom: '2rem',
                        }}
                    >
                        {t('Donating_')}{' '}
                        <a
                            href="https://ssiprotocol.notion.site/TYRON-a-decentralized-network-of-self-sovereign-identities-7bddd99a648c4849bbf270ce86c48dac#ab77747b414b42fc8feacf7d4cef3650"
                            rel="noreferrer"
                            target="_blank"
                        >
                            Donate.ssi
                        </a>
                        ?
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div className={styles.wrapperInput}>
                            <code style={{ color: isLight ? '#000' : '#fff' }}>
                                $ZIL
                            </code>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder={donation_}
                                onChange={handleInput}
                                onKeyPress={handleOnKeyPress}
                            />
                            <div
                                className={styles.btnDesktop}
                                onClick={() => {
                                    if (donation === null) {
                                        handleSubmit()
                                    }
                                }}
                            >
                                {donation === null ? (
                                    <Arrow isBlue={isZil_} />
                                ) : (
                                    <div style={{ marginTop: '5px' }}>
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
                    <div
                        className={styles.btnMobile}
                        onClick={() => {
                            if (donation === null) {
                                handleSubmit()
                            }
                        }}
                    >
                        {donation === null ? (
                            <Arrow isBlue={isZil_} />
                        ) : (
                            <div style={{ marginTop: '-15px' }}>
                                <Image width={40} src={TickIco} alt="tick" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default Component
