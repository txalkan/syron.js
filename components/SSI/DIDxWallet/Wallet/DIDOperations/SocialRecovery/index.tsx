import React, { useState, useCallback, useEffect } from 'react'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import * as zcrypto from '@zilliqa-js/crypto'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $net } from '../../../../../../src/store/wallet-network'
import { HashGuardians } from '../../../../../../src/lib/util'
import { Donate } from '../../../../..'
import { $arconnect } from '../../../../../../src/store/arconnect'
import { $doc } from '../../../../../../src/store/did-doc'
import { decryptKey } from '../../../../../../src/lib/dkms'
import { $user } from '../../../../../../src/store/user'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../src/store/modal'
import { setTxStatusLoading, setTxId } from '../../../../../../src/app/actions'
import controller from '../../../../../../src/hooks/isController'
import { RootState } from '../../../../../../src/app/reducers'

function Component() {
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const Router = useRouter()
    const dispatch = useDispatch()
    const arConnect = useStore($arconnect)
    const resolvedUsername = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const dkms = useStore($doc)?.dkms
    const donation = useStore($donation)
    const net = useStore($net)
    const username = useStore($user)?.name

    const [input, setInput] = useState(0) // the amount of guardians
    const input_ = Array(input)
    const select_input = Array()
    for (let i = 0; i < input_.length; i += 1) {
        select_input[i] = i
    }
    const [input2, setInput2] = useState([])
    const guardians: string[] = input2

    const [legend, setLegend] = useState('continue')
    const [button, setButton] = useState('button primary')

    const [hideDonation, setHideDonation] = useState(true)
    const [hideSubmit, setHideSubmit] = useState(true)
    const [txID, setTxID] = useState('')
    const { isController } = controller()

    useEffect(() => {
        isController()
    })

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setInput2([])
        setHideSubmit(true)
        setHideDonation(true)
        setLegend('continue')
        setButton('button primary')
        let _input = event.target.value
        const re = /,/gi
        _input = _input.replace(re, '.')
        const input = Number(_input)

        if (!isNaN(input) && Number.isInteger(input) && input >= 3) {
            setInput(input)
        } else if (isNaN(input)) {
            toast.error('the input is not a number', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        } else if (!Number.isInteger(input)) {
            toast.error('The number of guardians must be an integer.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        } else if (input < 3 && input !== 0) {
            toast.error('The number of guardians must be at least three.', {
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
    }

    const handleSave = async () => {
        if (guardians.length === input_.length) {
            for (let i = 0; i < guardians.length; i++) {
                await resolveDid(guardians[i].toLowerCase())
            }
            setButton('button')
            setLegend('saved')
            setHideDonation(false)
            setHideSubmit(false)
        } else {
            toast.error('The input is incomplete.', {
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
    }

    const handleSubmit = async () => {
        if (
            arConnect !== null &&
            resolvedUsername !== null &&
            donation !== null
        ) {
            try {
                const zilpay = new ZilPayBase()
                const txID = 'ConfigureSocialRecovery'
                const tyron_ = await tyron.Donation.default.tyron(donation)
                const [guardians_, hash] = await HashGuardians(guardians)
                const encrypted_key = dkms.get('update')
                const update_private_key = await decryptKey(
                    arConnect,
                    encrypted_key
                )
                const update_public_key =
                    zcrypto.getPubKeyFromPrivateKey(update_private_key)
                const sig =
                    '0x' +
                    zcrypto.sign(
                        Buffer.from(hash, 'hex'),
                        update_private_key,
                        update_public_key
                    )

                const params =
                    await tyron.TyronZil.default.ConfigureSocialRecovery(
                        guardians_,
                        sig,
                        tyron_
                    )

                //const tx_params: tyron.TyronZil.TransitionValue[] = [tyron_];
                const _amount = String(donation)

                toast.info(
                    `You're about to submit a transaction to configure DID Social Recovery`,
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
                                Router.push(`/${username}/did/recovery`)
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
                            throw err
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
            } catch (error) {
                toast.error('Identity verification unsuccessful.', {
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
        }
    }

    const resolveDid = async (_username: string) => {
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, 'did')
            .then(async () => {})
            .catch(() => {
                toast.error(`${_username} not found`, {
                    position: 'top-left',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 3,
                })
            })
    }

    return (
        <div>
            {txID === '' && (
                <>
                    <p className={styles.container}>
                        How many guardians would you like?
                        <input
                            ref={callbackRef}
                            style={{ width: '30%', marginLeft: '2%' }}
                            type="text"
                            placeholder="Type amount"
                            onChange={handleInput}
                            autoFocus
                        />
                    </p>
                    {input >= 3 &&
                        select_input.map((res: any) => {
                            return (
                                <section key={res} className={styles.container}>
                                    <code style={{ width: '50%' }}>
                                        Guardian #{res + 1}
                                    </code>
                                    <input
                                        ref={callbackRef}
                                        style={{ width: '70%' }}
                                        type="text"
                                        placeholder="Type NFT Username"
                                        onChange={(
                                            event: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                            setButton('button primary')
                                            setLegend('continue')
                                            setHideDonation(true)
                                            setHideSubmit(true)
                                            guardians[res] =
                                                event.target.value.toLowerCase()
                                        }}
                                        autoFocus
                                    />
                                    <code>.did</code>
                                </section>
                            )
                        })}
                    {input >= 3 && (
                        <input
                            style={{ marginTop: '7%' }}
                            type="button"
                            className={button}
                            value={legend}
                            onClick={() => {
                                handleSave()
                            }}
                        />
                    )}
                    {!hideDonation && <Donate />}
                    {!hideSubmit && donation !== null && (
                        <div
                            style={{
                                marginTop: '10%',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <button
                                className="button secondary"
                                onClick={handleSubmit}
                            >
                                Configure{' '}
                                <span className={styles.x}>
                                    did social recovery
                                </span>
                            </button>
                            <p className={styles.gascost}>Gas: 1-2 ZIL</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
