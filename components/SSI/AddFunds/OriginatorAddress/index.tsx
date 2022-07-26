import React, { useState, useRef, useEffect } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import styles from './styles.module.scss'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import { useStore } from 'effector-react'
import { updateOriginatorAddress } from '../../../../src/store/originatorAddress'
import { RootState } from '../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { SearchBarWallet, Selector } from '../../..'
import ContinueArrow from '../../../../src/assets/icons/continue_arrow.svg'

function Component({ type }) {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const searchInput = useRef(null)
    function handleFocus() {
        if (searchInput !== null && searchInput.current !== null) {
            const si = searchInput.current as any
            si.focus()
        }
    }
    useEffect(() => {
        // current property is refered to input element
        handleFocus()
    }, [])

    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const net = useSelector((state: RootState) => state.modal.net)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain

    const [loading, setLoading] = useState(false)

    const [originator, setOriginator] = useState('')
    const [ssi, setSSI] = useState('')
    const [input, setInput] = useState('')
    const [legend, setLegend] = useState('Save')
    const [button, setButton] = useState('button primary')

    const spinner = (
        <i
            style={{ color: 'silver' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    const handleSave = async () => {
        setLegend('saved')
        setButton('button')
    }

    const handleOnChange = (value) => {
        updateOriginatorAddress({
            value: '',
        })
        setOriginator('')
        setSSI('')
        const login_ = value

        if (zilAddr === null) {
            toast.error('To continue, log in.', {
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
            if (login_ === 'zilpay') {
                updateOriginatorAddress({
                    value: 'zilpay',
                })
            }
            setOriginator(login_)
        }
    }

    const handleOnChange2 = (value) => {
        updateOriginatorAddress(null)
        setSSI(value)
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setLegend('save')
        updateOriginatorAddress(null)
        setInput(value.toLowerCase())
    }

    const resolveUser = async () => {
        const username_ = input.split('.')[0]
        let domain_ = ''
        if (input.includes('.')) {
            domain_ = input.split('.')[1]
        }
        if (
            username_ === username &&
            domain_ === domain &&
            type === 'AddFundsStake'
        ) {
            toast.error('The recipient and sender must be different.', {
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
        } else {
            setLoading(true)
            let domain__ = domain_
            if (domain_ === 'stake') {
                domain__ = 'did'
            }
            if (domain_ === 'did' || domain_ === 'stake') {
                await tyron.SearchBarUtil.default
                    .fetchAddr(net, username_, domain__)
                    .then(async (addr) => {
                        addr = zcrypto.toChecksumAddress(addr!)
                        let init = new tyron.ZilliqaInit.default(
                            tyron.DidScheme.NetworkNamespace.Testnet
                        )
                        switch (net) {
                            case 'mainnet':
                                init = new tyron.ZilliqaInit.default(
                                    tyron.DidScheme.NetworkNamespace.Mainnet
                                )
                        }
                        const state =
                            await init.API.blockchain.getSmartContractState(
                                addr
                            )
                        console.log(state)
                        const controller = zcrypto.toChecksumAddress(
                            state.result.controller
                        )

                        if (controller !== zilAddr?.base16) {
                            throw Error(
                                t('Failed DID Controller authentication.')
                            )
                        } else {
                            if (domain_ === 'stake') {
                                const addr_ =
                                    await tyron.SearchBarUtil.default.fetchAddr(
                                        net,
                                        username_,
                                        'zil'
                                    )
                                if (addr_ === resolvedInfo?.addr) {
                                    toast.error(
                                        'Sender and recipient should be different',
                                        {
                                            position: 'top-right',
                                            autoClose: 2000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: 'dark',
                                        }
                                    )
                                } else {
                                    updateOriginatorAddress({
                                        username: username_,
                                        value: addr_,
                                    })
                                    setLegend('saved')
                                }
                            } else {
                                updateOriginatorAddress({
                                    username: username_,
                                    value: addr,
                                })
                                setLegend('saved')
                            }
                        }
                    })
                    .catch(() => {
                        toast.error('Invalid username', {
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
            } else {
                toast(t('Coming soon'), {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                })
            }
            setLoading(false)
        }
    }

    const handleInput2 = (event: { target: { value: any } }) => {
        setInput('')
        setLegend('save')
        setButton('button primary')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
            setInput(addr)
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
    const handleOnKeyPress2 = async ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            resolveAddr()
        }
    }
    const resolveAddr = async () => {
        const zilpay = new ZilPayBase()
        setLoading(true)
        await zilpay
            .getSubState(input, 'controller')
            .then((did_controller) => {
                const controller = zcrypto.toChecksumAddress(did_controller)
                if (zilAddr === null) {
                    toast.info('To continue, log in.', {
                        position: 'top-center',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    })
                } else if (controller !== zilAddr?.base16) {
                    setLoading(false)
                    throw Error(t('Failed DID Controller authentication.'))
                } else {
                    updateOriginatorAddress({
                        value: input,
                    })
                    handleSave()
                    setLoading(false)
                }
            })
            .catch((error) => {
                setLoading(false)
                toast.error(String(error), {
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

    const optionOriginator = [
        {
            key: '',
            name: t('Wallet'),
        },
        {
            key: 'ssi',
            name: 'TYRON',
        },
        {
            key: 'zilpay',
            name: 'Zilliqa',
        },
    ]

    const optionLogin = [
        {
            key: '',
            name: t('LOG_IN'),
        },
        {
            key: 'username',
            name: t('NFT_USERNAME'),
        },
        {
            key: 'address',
            name: t('ADDRESS'),
        },
    ]

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
            }}
        >
            {zilAddr !== null && (
                <div className={styles.container}>
                    <Selector
                        option={optionOriginator}
                        onChange={handleOnChange}
                        value={originator}
                    />
                </div>
            )}
            {originator === 'ssi' && (
                <div className={styles.container}>
                    <Selector
                        option={optionLogin}
                        onChange={handleOnChange2}
                        value={ssi}
                    />
                </div>
            )}
            {ssi === 'username' && (
                <SearchBarWallet
                    resolveUser={resolveUser}
                    handleInput={handleInput}
                    input={input}
                    loading={loading}
                    saved={legend === 'saved'}
                />
            )}
            {ssi === 'address' && (
                <div className={styles.container}>
                    <input
                        ref={searchInput}
                        type="text"
                        style={{ width: '100%' }}
                        placeholder={t('Type address')}
                        onChange={handleInput2}
                        onKeyPress={handleOnKeyPress2}
                        autoFocus
                    />
                    {loading ? (
                        <button
                            onClick={resolveAddr}
                            style={{ marginLeft: '2%' }}
                            className={button}
                        >
                            {spinner}
                        </button>
                    ) : (
                        <button
                            onClick={resolveAddr}
                            style={{ marginLeft: '2%' }}
                            className={button}
                        >
                            {legend === 'saved' ? t('SAVED') : t('SAVE')}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default Component
