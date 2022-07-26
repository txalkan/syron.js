import React, { useState, useRef, useEffect } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import styles from './styles.module.scss'
import { RootState } from '../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import { SearchBarWallet, Selector } from '../../..'
import ContinueArrow from '../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../src/assets/icons/tick_blue.svg'
import { updateDonation } from '../../../../src/store/donation'

function Component({ updateOriginator }) {
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

    const [loading, setLoading] = useState(false)

    const [originator, setOriginator] = useState('')
    const [ssi, setSSI] = useState('')
    const [input, setInput] = useState('')
    const [legend, setLegend] = useState('save')

    const handleSave = async () => {
        setLegend('saved')
    }

    const handleOnChange = (value) => {
        updateOriginator(null)
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
                updateOriginator({
                    value: 'zilpay',
                })
            }
            setOriginator(login_)
        }
    }

    const handleOnChange2 = (value) => {
        updateOriginator(null)
        setLegend('save')
        updateDonation(null)
        setSSI(value)
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setLegend('save')
        updateOriginator(null)
        setInput(value.toLowerCase())
    }

    const resolveUser = async () => {
        setLoading(true)
        let domain_ = 'did'
        await tyron.SearchBarUtil.default
            .fetchAddr(net, input, domain_)
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
                const state = await init.API.blockchain.getSmartContractState(
                    addr
                )
                console.log(state)
                const controller = zcrypto.toChecksumAddress(
                    state.result.controller
                )

                if (controller !== zilAddr?.base16) {
                    throw Error(t('Failed DID Controller authentication.'))
                } else {
                    const addr_ = await tyron.SearchBarUtil.default.fetchAddr(
                        net,
                        input,
                        'zil'
                    )
                    updateOriginator({
                        username: input,
                        value: addr_,
                    })
                    handleSave()
                }
            })
            .catch(() => {
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
            })
        setLoading(false)
    }

    const handleInput2 = (event: { target: { value: any } }) => {
        setInput('')
        setLegend('save')
        updateOriginator(null)
        updateDonation(null)
        setInput(event.target.value)
    }
    const handleOnKeyPress2 = async ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            resolveAddr()
        }
    }
    const resolveAddr = async () => {
        const addr = tyron.Address.default.verification(input)
        if (addr !== '') {
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
            } else {
                updateOriginator({
                    value: input,
                })
                handleSave()
            }
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

    const optionOriginator = [
        {
            key: '',
            name: 'Wallet',
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
            name: 'Address',
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
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '5%',
                        }}
                    >
                        <div
                            className={
                                legend === 'save' ? 'continueBtnBlue' : ''
                            }
                            onClick={resolveAddr}
                        >
                            {legend === 'save' ? (
                                <Image src={ContinueArrow} alt="arrow" />
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
            )}
        </div>
    )
}

export default Component
