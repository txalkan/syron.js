import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { $user } from '../../../../../../../src/store/user'
import { operationKeyPair } from '../../../../../../../src/lib/dkms'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { Donate } from '../../../../../..'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
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
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../../src/hooks/router'

function Component({ dapp }: { dapp: string }) {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { navigate } = routerHook()
    const user = useStore($user)
    const resolvedInfo = useSelector(
        (state: RootState) => state.modal.resolvedUsername
    )
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const arConnect = useStore($arconnect)

    const [didDomain, setDidDomain] = useState('') // the DID Domain
    const [input, setInput] = useState('') // the domain address
    const [legend, setLegend] = useState('Save')
    const [button, setButton] = useState('button primary')
    const [deployed, setDeployed] = useState(false)

    const handleInputDomain = (event: { target: { value: any } }) => {
        updateDonation(null)
        setDidDomain('')
        setInput('')
        const input = event.target.value
        if (input !== '' && input !== 'did' && input !== 'tyron') {
            //@todo-i also make sure that the input domain does not exist in the did_domain_dns already
            setDidDomain(input)
        } else {
            toast.warn(t('Invalid.'), {
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

    const handleSave = async () => {
        setLegend('saved')
        setButton('button')
    }

    const handleInput = (event: { target: { value: any } }) => {
        updateDonation(null)
        setInput('')
        setLegend('save') //@todo-i update to => and tick (saved)
        setButton('button primary')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
            setInput(addr)
            handleSave()
        } else {
            toast.error(t('Wrong address.'), {
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
        if (resolvedInfo !== null && net !== null) {
            const zilpay = new ZilPayBase()
            await zilpay
                .deployDomainBeta(net, user?.name!) // @todo-x depends on the dapp
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
            } else if (resolvedInfo !== null && donation !== null) {
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
                    id: didDomain,
                    addr: resolvedInfo.addr,
                })
                const did_key = result.element.key.key
                const encrypted = result.element.key.encrypted

                let tyron_: tyron.TyronZil.TransitionValue
                tyron_ = await tyron.Donation.default.tyron(donation)

                const tx_params = await tyron.TyronZil.default.Dns(
                    addr,
                    didDomain,
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
                        contractAddress: resolvedInfo.addr,
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
                                    `https://devex.zilliqa.com/tx/${
                                        res.ID
                                    }?network=https%3A%2F%2F${
                                        net === 'mainnet' ? '' : 'dev-'
                                    }api.zilliqa.com`
                                )
                                navigate(`/${user?.name}/zil`)
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                                setTimeout(() => {
                                    toast.error(t('Transaction failed.'), {
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
                        updateModalTxMinimized(false)
                        updateModalTx(true)
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
            {/* @todo-i
            - dapp name depends on dapp input => if dapp = "zilstake" then title is ZIL Staking Wallet
            - add more top/bottom margins
            */}
            <p>DApp: ZIL Staking Wallet</p>
            <section className={styles.container}>
                <input
                    style={{ width: '100%' }}
                    type="text"
                    placeholder="Type DID Domain"
                    onChange={handleInputDomain}
                    onKeyPress={handleOnKeyPress}
                    autoFocus
                />
                {/* @todo-i add (continue => / saved) */}
            </section>
            {didDomain !== '' && (
                <>
                    {input === '' && (
                        <button
                            className="button"
                            value={`new ${user?.name}.${didDomain} domain`}
                            style={{ marginBottom: '10%' }}
                            onClick={handleDeploy}
                        >
                            <p>
                                New{' '}
                                <span className={styles.username}>
                                    {user?.name}.{didDomain}
                                </span>{' '}
                                DID Domain
                            </p>
                        </button>
                    )}
                    {!deployed && (
                        <div style={{ marginTop: '5%' }}>
                            <p>
                                Or type the address you want to save in your DID
                                Domain:
                            </p>
                            {/* @todo-i add tick box, and show the following input only if this option is selected by the user */}
                            <section className={styles.container}>
                                <input
                                    style={{ width: '70%' }}
                                    type="text"
                                    placeholder="Type address"
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
                                        {user?.name}.{didDomain}
                                    </span>{' '}
                                    DID Domain
                                </p>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
