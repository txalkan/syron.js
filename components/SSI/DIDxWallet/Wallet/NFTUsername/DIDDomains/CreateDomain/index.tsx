import * as zcrypto from '@zilliqa-js/crypto'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { $user } from '../../../../../../../src/store/user'
import { operationKeyPair } from '../../../../../../../src/lib/dkms'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { Donate } from '../../../../../..'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import { $net } from '../../../../../../../src/store/wallet-network'
import { $arconnect } from '../../../../../../../src/store/arconnect'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import {
    setTxStatusLoading,
    setTxId,
} from '../../../../../../../src/app/actions'
import { RootState } from '../../../../../../../src/app/reducers'

function Component({ domain }: { domain: string }) {
    const dispatch = useDispatch()
    const Router = useRouter()
    const user = useStore($user)
    const resolvedUsername = useSelector((state: RootState) => state.modal.resolvedUsername)
    const donation = useStore($donation)
    const net = useStore($net)
    const arConnect = useStore($arconnect)

    const [input, setInput] = useState('') // the domain address
    const [legend, setLegend] = useState('Save')
    const [button, setButton] = useState('button primary')
    const [deployed, setDeployed] = useState(false)

    const handleSave = async () => {
        setLegend('saved')
        setButton('button')
    }

    const handleInput = (event: { target: { value: any } }) => {
        updateDonation(null)
        setInput('')
        setLegend('save')
        setButton('button primary')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
            setInput(addr)
            handleSave()
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
            handleSubmit
        }
    }

    const handleDeploy = async () => {
        if (resolvedUsername !== null && net !== null) {
            const zilpay = new ZilPayBase()
            await zilpay
                .deployDomain(net, domain, resolvedUsername.addr)
                .then((deploy: any) => {
                    let addr = deploy[1].address
                    addr = zcrypto.toChecksumAddress(addr)
                    setInput(addr)
                    setDeployed(true)
                })
        } else {
            toast.error('Some data is missing.', {
                position: 'top-right',
                autoClose: 6000,
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
        try {
            if (arConnect === null) {
                toast.warning('Connect with ArConnect.', {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                })
            } else if (resolvedUsername !== null && donation !== null) {
                const zilpay = new ZilPayBase()
                const txID = 'Dns'
                let addr: string
                if (deployed === true) {
                    addr = zcrypto.toChecksumAddress(input)
                } else {
                    addr = input
                }
                const result = await operationKeyPair({
                    arConnect: arConnect,
                    id: domain,
                    addr: resolvedUsername.addr,
                })
                const did_key = result.element.key.key
                const encrypted = result.element.key.encrypted

                let tyron_: tyron.TyronZil.TransitionValue
                tyron_ = await tyron.Donation.default.tyron(donation)

                const tx_params = await tyron.TyronZil.default.Dns(
                    addr,
                    domain,
                    did_key,
                    encrypted,
                    tyron_
                )

                const _amount = String(donation)

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)
                await zilpay
                    .call({
                        contractAddress: resolvedUsername.addr,
                        transition: txID,
                        params: tx_params as unknown as Record<
                            string,
                            unknown
                        >[],
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
                                    `https://devex.zilliqa.com/tx/${res.ID
                                    }?network=https%3A%2F%2F${net === 'mainnet' ? '' : 'dev-'
                                    }api.zilliqa.com`
                                )
                                Router.push(`/${user?.name}.${domain}`)
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
                            updateModalTx(false)
                            toast.error(String(err), {
                                position: 'top-right',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                            })
                        }
                    })
                    .catch((error) => {
                        dispatch(setTxStatusLoading('rejected'))
                        toast.error(String(error), {
                            position: 'top-right',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: 'dark',
                        })
                    })
            }
        } catch (error) {
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }

    return (
        <div style={{ textAlign: 'center' }}>
            {input === '' && (
                <button
                    className="button"
                    value={`new ${user?.name}.${domain} domain`}
                    style={{ marginBottom: '10%' }}
                    onClick={handleDeploy}
                >
                    <p>
                        New{' '}
                        <span className={styles.username}>
                            {user?.name}.{domain}
                        </span>{' '}
                        DID Domain
                    </p>
                </button>
            )}
            {!deployed && (
                <div style={{ marginTop: '5%' }}>
                    <p>
                        Or type your .{domain} domain address to save it in your
                        DIDxWallet:
                    </p>
                    <section className={styles.container}>
                        <input
                            style={{ width: '70%' }}
                            type="text"
                            placeholder="Type domain address"
                            onChange={handleInput}
                            onKeyPress={handleOnKeyPress}
                            autoFocus
                        />
                        <input
                            style={{ marginLeft: '2%' }}
                            type="button"
                            className={button}
                            value={legend}
                            onClick={() => {
                                handleSubmit
                            }}
                        />
                    </section>
                </div>
            )}
            {input !== '' && <Donate />}
            {input !== '' && donation !== null && (
                <div style={{ marginTop: '14%', textAlign: 'center' }}>
                    <button className="button" onClick={handleSubmit}>
                        <p>
                            Save{' '}
                            <span className={styles.username}>
                                {user?.name}.{domain}
                            </span>{' '}
                            DID Domain
                        </p>
                    </button>
                </div>
            )}
        </div>
    )
}

export default Component
