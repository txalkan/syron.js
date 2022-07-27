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

function Component({ updateWallet }) {
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
    const [wallet, setWallet] = useState('')
    const [ssi, setSSI] = useState('')
    const [userDomain, setUserDomain] = useState('')
    const [address, setAddress] = useState('')
    const [legend, setLegend] = useState('save')

    const handleSave = async () => {
        setLegend('saved')
    }

    //@todo-i review commented out sections (do we need this updates?)

    const handleOnChange = (value: any) => {
        // updateOriginator(null)
        setWallet('')
        setSSI('')
        const input = value

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
            if (input === 'zilliqa') {
                updateWallet({
                    value: 'zilliqa',
                })
            } else {
                setWallet(input)
            }
        }
    }

    const handleOnChange2 = (value: React.SetStateAction<string>) => {
        //updateWallet(null)
        setLegend('save')
        updateDonation(null)
        setSSI(value)
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setLegend('save')
        updateWallet(null)
        setUserDomain(value.toLowerCase())
    }

    const resolveUser = async () => {
        setLoading(true)
        const input = userDomain.toLowerCase().replace(/ /g, '')
        let username = input
        let domain = ''

        if (input.includes('.')) {
            username = input.split('.')[0]
            domain = input.split('.')[1]
        }
        await tyron.SearchBarUtil.default
            .fetchAddr(net, username, domain)
            .then(async (addr) => {
                addr = zcrypto.toChecksumAddress(addr)
                updateWallet({
                    value: addr,
                })
                //@todo-i return addr as wallet selector result
                // let init = new tyron.ZilliqaInit.default(
                //     tyron.DidScheme.NetworkNamespace.Testnet
                // )
                // switch (net) {
                //     case 'mainnet':
                //         init = new tyron.ZilliqaInit.default(
                //             tyron.DidScheme.NetworkNamespace.Mainnet
                //         )
                // }
                // const state = await init.API.blockchain.getSmartContractState(
                //     addr
                // )
                // console.log(state)
                // const controller = zcrypto.toChecksumAddress(
                //     state.result.controller
                // )

                // if (controller !== zilAddr?.base16) {
                //     throw Error(t('Failed DID Controller authentication.'))
                // } else {
                //     const addr_ = await tyron.SearchBarUtil.default.fetchAddr(
                //         net,
                //         userDomain,
                //         'zil'
                //     )
                //     updateOriginator({
                //         username: userDomain,
                //         value: addr_,
                //     })
                //     handleSave()
                // }
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
        setAddress('')
        setLegend('save')
        //updateWallet(null)
        updateDonation(null)
        setAddress(event.target.value)
    }
    const handleOnKeyPress2 = async ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            resolveAddr()
        }
    }
    const resolveAddr = async () => {
        const addr = tyron.Address.default.verification(address)
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
                updateWallet({
                    value: addr,
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

    const optionWallet = [
        {
            key: '',
            name: 'Wallet',
        },
        {
            key: 'tyron',
            name: 'TYRON',
        },
        {
            key: 'zilliqa',
            name: 'Zilliqa',
        },
    ]

    const optionSSI = [
        {
            key: '',
            name: 'Select SSI',
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
            {/* {zilAddr !== null && ( */}
            <div className={styles.container}>
                <Selector
                    option={optionWallet}
                    onChange={handleOnChange}
                    value={wallet}
                />
            </div>
            {wallet === 'tyron' && (
                <div className={styles.container}>
                    <Selector
                        option={optionSSI}
                        onChange={handleOnChange2}
                        value={ssi}
                    />
                </div>
            )}
            {ssi === 'username' && (
                <SearchBarWallet
                    resolveUser={resolveUser}
                    handleInput={handleInput}
                    input={userDomain}
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
