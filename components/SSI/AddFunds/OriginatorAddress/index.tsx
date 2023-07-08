import React, { useState, useRef, useEffect } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { updateOriginatorAddress } from '../../../../src/store/originatorAddress'
import { RootState } from '../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { SearchBarWallet, Selector } from '../../..'
import toastTheme from '../../../../src/hooks/toastTheme'
import smartContract from '../../../../src/utils/smartContract'
import { $net } from '../../../../src/store/network'

function Component() {
    const { getSmartContract } = smartContract()

    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const searchInput = useRef(null)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
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
    const net = $net.state.net as 'mainnet' | 'testnet'

    const resolvedInfo = useStore($resolvedInfo)

    const [loading, setLoading] = useState(false)

    const [originator, setOriginator] = useState('')
    const [input_, setInput] = useState('')
    const [legend, setLegend] = useState('Save')

    const handleOnChange = (value: any) => {
        updateOriginatorAddress(null)
        setOriginator('')
        setLegend('save')
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
                theme: toastTheme(isLight),
            })
        } else {
            if (login_ === 'zilliqa') {
                updateOriginatorAddress({
                    value: 'zilliqa',
                })
            }
            setOriginator(login_)
        }
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setLegend('save')
        updateOriginatorAddress(null)
        setInput(value)
    }

    const resolveUsername = async () => {
        setLoading(true)
        const input = input_.toLowerCase().replace(/ /g, '')
        let domain = input
        let tld = ''
        let subdomain = ''
        if (input.includes('.zlp')) {
            tld = 'zlp'
        }
        if (input.includes('@')) {
            domain = input
                .split('@')[1]
                .replace('.did', '')
                .replace('.ssi', '')
                .replace('.zlp', '')
            subdomain = input.split('@')[0]
        } else if (input.includes('.')) {
            if (
                input.split('.')[1] === 'ssi' ||
                input.split('.')[1] === 'did' ||
                input.split('.')[1] === 'zlp'
            ) {
                domain = input.split('.')[0]
                tld = input.split('.')[1]
            } else {
                throw new Error('Resolver failed.')
            }
        }
        if (input.includes('.did') && input.includes('@')) {
            toast.warn('INVALID: @ is only possible with .ssi', {
                position: 'bottom-left',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }
        let _subdomain: string | undefined
        if (subdomain && subdomain !== '') {
            _subdomain = subdomain
        }
        await tyron.SearchBarUtil.default
            .fetchAddr(net, tld, domain, _subdomain)
            .then(async (addr) => {
                addr = zcrypto.toChecksumAddress(addr!)
                let init = new tyron.ZilliqaInit.default(
                    tyron.DidScheme.NetworkNamespace.Mainnet
                )
                switch (net) {
                    case 'testnet':
                        init = new tyron.ZilliqaInit.default(
                            tyron.DidScheme.NetworkNamespace.Testnet
                        )
                }
                let did_addr: string
                if (tld === 'did' || _subdomain === 'did') {
                    did_addr = addr
                } else {
                    did_addr = await tyron.SearchBarUtil.default.fetchAddr(
                        net,
                        'did',
                        domain
                    )
                }
                const state = await init.API.blockchain.getSmartContractState(
                    did_addr
                )
                const did_controller = zcrypto.toChecksumAddress(
                    state.result.controller
                )
                if (did_controller !== zilAddr?.base16) {
                    throw Error(t('Failed DID Controller authentication.'))
                } else if (addr === resolvedInfo?.addr) {
                    toast.error('The recipient and sender must be different.', {
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
                } else {
                    // if (domain_ === 'stake') {
                    //     const addr_ =
                    //         await tyron.SearchBarUtil.default.fetchAddr(
                    //             net,
                    //             username_,
                    //             'zil'
                    //         )
                    //     if (addr_ === resolvedInfo?.addr) {
                    //         toast.error(
                    //             'Sender and recipient should be different',
                    //             {
                    //                 position: 'top-right',
                    //                 autoClose: 2000,
                    //                 hideProgressBar: false,
                    //                 closeOnClick: true,
                    //                 pauseOnHover: true,
                    //                 draggable: true,
                    //                 progress: undefined,
                    //                 theme: toastTheme(isLight),
                    //             }
                    //         )
                    //     } else {
                    //         updateOriginatorAddress({
                    //             username: username_,
                    //             value: addr_,
                    //         })
                    //         setLegend('saved')
                    //     }
                    // } else {
                    const res = await getSmartContract(addr, 'version')

                    updateOriginatorAddress({
                        value: addr,
                        username: domain,
                        domain: tld,
                        version: res?.result.version,
                    })
                    // })
                    setLegend('saved')
                    // }
                }
            })
            .catch((err) => {
                toast.error(String(err) /*t('Invalid username')*/, {
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
            })

        setLoading(false)
    }

    const optionOriginator = [
        {
            value: 'ssi',
            label: 'xWALLET',
        },
        {
            value: 'zilliqa',
            label: 'ZilPay',
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
                <>
                    <div className={styles.txt}>{t('Source of funds')}</div>
                    <div className={styles.container}>
                        <Selector
                            option={optionOriginator}
                            onChange={handleOnChange}
                            placeholder={t('Select wallet')}
                        />
                    </div>
                </>
            )}
            {originator === 'ssi' && (
                <div style={{ width: '100%' }}>
                    <SearchBarWallet
                        resolveUsername={resolveUsername}
                        handleInput={handleInput}
                        input={input_}
                        loading={loading}
                        saved={legend === 'saved'}
                        bottomTick={true}
                    />
                </div>
            )}
        </div>
    )
}

export default Component
