import React, { useState } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import styles from './styles.module.scss'
import { $net } from '../../../../../src/store/wallet-network'
import { Donate } from '../../../..'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { $doc } from '../../../../../src/store/did-doc'
import { $user } from '../../../../../src/store/user'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import { setTxStatusLoading, setTxId } from '../../../../../src/app/actions'
import { RootState } from '../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const user = useStore($user)
    const _guardians = useStore($doc)?.guardians.length as number

    let min_guardians = parseInt(String(_guardians / 2 + 1))
    if (min_guardians < 3) {
        min_guardians = 3
    }
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const donation = useStore($donation)
    const net = useStore($net)

    const input_ = Array(min_guardians)
    const select_input = Array()
    for (let i = 0; i < input_.length; i += 1) {
        select_input[i] = i
    }
    const guardians_: string[][] = []
    const [guardians, setGuardians] = useState(guardians_)

    const empty_tx_value = [
        {
            argtypes: ['String', 'ByStr64'],
            arguments: ['', ''],
            constructor: 'Pair',
        },
    ]
    const [txvalue, setTxValue] = useState(empty_tx_value)

    const [legendB, setLegendB] = useState('continue')
    const [buttonB, setButtonB] = useState('button primary')

    const [hideDonation, setHideDonation] = useState(true)
    const [hideSubmit, setHideSubmit] = useState(true)

    const [input, setInput] = useState('') //the new address
    const [legend, setLegend] = useState('Save')
    const [button, setButton] = useState('button primary')

    const handleInput = (event: { target: { value: any } }) => {
        setInput('')
        setLegend('save')
        setButton('button primary')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
            setInput(addr)
        } else {
            toast.error('Wrong address.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 5,
            })
        }
    }
    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }
    const handleSave = async () => {
        if (input !== '') {
            setLegend('saved')
            setButton('button')
        }
    }

    const handleReset = async () => {
        setButtonB('button primary')
        setLegendB('continue')
        setHideDonation(true)
        setHideSubmit(true)
    }
    const handleContinue = async () => {
        const signatures: any[] = []
        if (guardians.length !== 0) {
            for (let i = 0; i < guardians.length; i += 1) {
                const this_input = guardians[i]
                if (this_input[0] !== '' && this_input[1] !== '') {
                    signatures.push({
                        argtypes: ['String', 'ByStr64'],
                        arguments: [`${this_input[0]}`, `${this_input[1]}`],
                        constructor: 'Pair',
                    })
                }
            }
        }
        if (signatures.length !== min_guardians) {
            toast.error('the input is incomplete.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        } else {
            setTxValue(signatures)
            setButtonB('button')
            setLegendB('saved')
            setHideDonation(false)
            setHideSubmit(false)
        }
    }

    const handleSubmit = async () => {
        if (resolvedUsername !== null && donation !== null) {
            const zilpay = new ZilPayBase()
            const txID = 'DidSocialRecovery'

            const tyron_: tyron.TyronZil.TransitionValue =
                await tyron.Donation.default.tyron(donation)

            const params = await tyron.TyronZil.default.DidSocialRecovery(
                input,
                txvalue,
                tyron_
            )

            const _amount = String(donation)

            toast.info(
                `You're about to submit a DID Social Recovery operation!`,
                {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                }
            )

            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            let tx = await tyron.Init.default.transaction(net)
            await zilpay
                .call({
                    contractAddress: resolvedUsername.addr,
                    transition: txID,
                    params: params as unknown as Record<string, unknown>[],
                    amount: _amount,
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    try {
                        tx = await tx.confirm(res.ID)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            updateDonation(null)
                            window.open(
                                `https://devex.zilliqa.com/tx/${
                                    res.ID
                                }?network=https%3A%2F%2F${
                                    net === 'mainnet' ? '' : 'dev-'
                                }api.zilliqa.com`
                            )
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                            setTimeout(() => {
                                toast.error('Transaction failed.', {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: 'dark',
                                })
                            }, 1000)
                        }
                    } catch (err) {
                        dispatch(setTxStatusLoading('rejected'))
                        toast.error(String(err), {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: 'dark',
                        })
                    }
                })
                .catch((err) => {
                    updateModalTx(false)
                    toast.error(err, {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    })
                })
        }
    }

    return (
        <div style={{ marginTop: '14%' }}>
            <h3 style={{ marginBottom: '7%', color: 'silver' }}>
                {t('SOCIAL RECOVER YOUR SELF-SOVEREIGN IDENTITY')}
            </h3>
            <section className={styles.container}>
                <h4>
                    {t(
                        'UPDATE X’S DID CONTROLLER ADDRESS WITH THE HELP OF THEIR GUARDIANS',
                        { name: user?.name }
                    )}
                </h4>
                <div className={styles.containerInput}>
                    <input
                        type="text"
                        placeholder={t('Type new address')}
                        onChange={handleInput}
                        onKeyPress={handleOnKeyPress}
                        autoFocus
                    />
                    <input
                        style={{ marginLeft: '2%' }}
                        type="button"
                        className={button}
                        value={t(legend.toUpperCase())}
                        onClick={() => {
                            handleSave()
                        }}
                    />
                </div>
            </section>
            {input !== '' && legend === 'saved' && (
                <>
                    <p style={{ marginTop: '7%' }}>
                        You need {min_guardians} guardian signatures:
                    </p>
                    {select_input.map((res: number) => {
                        return (
                            <section key={res} className={styles.containerX}>
                                <input
                                    style={{ width: '40%' }}
                                    type="text"
                                    placeholder={t('Guardian’s NFT Username')}
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        handleReset()
                                        const value = event.target.value
                                        if (guardians[res] === undefined) {
                                            guardians[res] = ['', '']
                                        }
                                        guardians[res][0] = value.toLowerCase()
                                        setGuardians(guardians)
                                    }}
                                />
                                <input
                                    style={{ width: '80%' }}
                                    type="text"
                                    placeholder={t(
                                        'Paste guardian’s signature'
                                    )}
                                    onChange={(
                                        event: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        handleReset()
                                        const value = event.target.value
                                        if (guardians[res] === undefined) {
                                            guardians[res] = ['', '']
                                        }
                                        guardians[res][1] = value.toLowerCase()
                                        setGuardians(guardians)
                                    }}
                                />
                            </section>
                        )
                    })}
                    {
                        <input
                            type="button"
                            className={buttonB}
                            value={t(legendB.toUpperCase())}
                            onClick={() => {
                                handleContinue()
                            }}
                        />
                    }
                </>
            )}
            {!hideDonation && <Donate />}
            {!hideSubmit && donation !== null && txvalue !== empty_tx_value && (
                <div style={{ marginTop: '10%' }}>
                    <button className="button secondary" onClick={handleSubmit}>
                        {t('EXECUTE')}{' '}
                        <span className={styles.x}>
                            {t('DID SOCIAL RECOVERY')}
                        </span>
                    </button>
                    <p className={styles.gascost}>{t('GAS_AROUND')} 1.5 ZIL</p>
                </div>
            )}
        </div>
    )
}

export default Component
