import * as tyron from 'tyron'
import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS,
} from '../../src/constants/tyron'
import styles from './styles.module.scss'
import { useStore } from 'effector-react'
import { updateDoc } from '../../src/store/did-doc'
import { updateDonation } from '../../src/store/donation'
import { $loading, $noRedirect, updateLoading } from '../../src/store/loading'
import { updateIsController } from '../../src/store/controller'
import { updateOriginatorAddress } from '../../src/store/originatorAddress'
import {
    $showSearchBar,
    updateModalBuyNft,
    updateModalGetStarted,
    updateShowSearchBar,
} from '../../src/store/modal'
import { useTranslation } from 'next-i18next'
import { RootState } from '../../src/app/reducers'
import { updateResolvedInfo } from '../../src/store/resolvedInfo'
import { updatePrev } from '../../src/store/router'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const Router = useRouter()
    const net = useSelector((state: RootState) => state.modal.net)
    const noRedirect = useStore($noRedirect)
    const loading = useStore($loading)
    const showSearchBar = useStore($showSearchBar)
    const [name, setName] = useState('')
    const [dom, setDomain] = useState('')
    const { t } = useTranslation('common')

    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    useEffect(() => {
        const url = window.location.pathname.toLowerCase()
        let path: string
        if (
            (url.includes('es') ||
                url.includes('cn') ||
                url.includes('id') ||
                url.includes('ru')) &&
            url.split('/').length === 2
        ) {
            path = url
                .replace('es', '')
                .replace('cn', '')
                .replace('id', '')
                .replace('ru', '')
        } else {
            path = url
                .replace('/es', '')
                .replace('/cn', '')
                .replace('/id', '')
                .replace('/ru', '')
        }
        const first = path.split('/')[1]
        let username = first
        let domain = ''
        if (first.includes('.')) {
            username = first.split('.')[0]
            domain = first.split('.')[1]
        }
        if (first === 'getstarted') {
            Router.push('/')
            setTimeout(() => {
                updateModalGetStarted(true)
            }, 1000)
        } else if (username !== '') {
            setName(username)
            setDomain(domain)
            if (domain !== '' && !loading && !showSearchBar) {
                getResults(username, domain)
            }
        }
        const third = path.split('/')[3]
        const fourth = path.split('/')[4]
        if (third === 'funds' || fourth === 'balances') {
            toast.warning(
                t('For your security, make sure you’re at tyron.network'),
                {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 3,
                }
            )
            updateOriginatorAddress(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleOnChange = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        //dispatch(UpdateResolvedInfo(null))

        const input = value.toLowerCase().replace(/ /g, '')
        setName(input)
        setDomain('')
        if (input.includes('.')) {
            const [username = '', domain = ''] = input.split('.')
            setName(username)
            setDomain(domain)
        }
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            if (name !== '') {
                updatePrev(window.location.pathname)
                getResults(name, dom)
            }
        }
    }

    const getResults = async (_username: string, _domain: string) => {
        updateShowSearchBar(false)
        updateLoading(true)
        updateIsController(false)
        updateDonation(null)
        if (tyron.SearchBarUtil.default.isValidUsername(_username)) {
            if (_domain === 'tyron') {
                if (VALID_SMART_CONTRACTS.includes(_username)) {
                    window.open(
                        SMART_CONTRACTS_URLS[
                            _username as unknown as keyof typeof SMART_CONTRACTS_URLS
                        ]
                    )
                } else {
                    toast.error('Invalid smart contract', {
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
                updateLoading(false)
            } else {
                await resolveNftUsername(_username, _domain)
            }
        } else {
            if (_username !== '') {
                toast.error(
                    t(
                        'Invalid username. Names with less than six characters are premium and will be for sale later on.'
                    ),
                    {
                        position: 'top-right',
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    }
                )
            }
            setTimeout(() => {
                Router.push('/')
            }, 3000)
            setTimeout(() => {
                updateLoading(false)
            }, 4000)
            updateLoading(false)
        }
    }

    const resolveNftUsername = async (_username: string, _domain: string) => {
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, '')
            .then(async (addr) => {
                if (
                    addr.toLowerCase() ===
                    '0x92ccd2d3b771e3526ebf27722194f76a26bc88a4'
                ) {
                    throw new Error('premium')
                } else {
                    return addr
                }
            })
            .then(async (addr) => {
                let addr_ = addr
                if (_domain !== '') {
                    addr_ = await tyron.SearchBarUtil.default.fetchAddr(
                        net,
                        _username,
                        _domain
                    )
                }
                // fetch
                updateResolvedInfo({
                    name: _username,
                    domain: _domain,
                    addr: addr_,
                })
                let network = tyron.DidScheme.NetworkNamespace.Mainnet
                if (net === 'testnet') {
                    network = tyron.DidScheme.NetworkNamespace.Testnet
                }
                const init = new tyron.ZilliqaInit.default(network)
                let version = await init.API.blockchain
                    .getSmartContractSubState(addr_, 'version')
                    .then((substate) => {
                        return substate.result.version as string
                    })
                    .catch(() => {
                        return 'version'
                    })
                switch (version.slice(0, 7)) {
                    case 'xwallet':
                        resolveDid(_username, 'did')
                        break
                    case 'initi--':
                        resolveDid(_username, 'did')
                        break
                    case 'xpoints':
                        Router.push('/xpoints/nft')
                        // updateLoading(false)
                        break
                    case 'tokeni-':
                        Router.push('/fungibletoken/nft')
                    default:
                        // It could be an older version of the DIDxWallet
                        resolveDid(_username, _domain)
                }
            })
            .catch(async (error) => {
                if (String(error).slice(-7) === 'premium') {
                    toast('Get in contact for more info.', {
                        position: 'top-center',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                        toastId: 3,
                    })
                } else {
                    try {
                        await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            _username,
                            ''
                        )
                        toast.error(`Uninitialized DID Domain.`, {
                            position: 'top-right',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: 'dark',
                        })
                        Router.push(`/${_username}/didx`)
                    } catch (error) {
                        updateResolvedInfo({
                            name: _username,
                            domain: '',
                        })
                        updateModalBuyNft(true)
                        toast.warning(
                            t(
                                'For your security, make sure you’re at tyron.network'
                            ),
                            {
                                position: 'top-center',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                                toastId: 3,
                            }
                        )
                    }
                }
                updateLoading(false)
            })
    }

    const resolveDid = async (_username: string, _domain: string) => {
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, 'did')
            .then(async (addr) => {
                await tyron.SearchBarUtil.default
                    .Resolve(net, addr)
                    .then(async (result: any) => {
                        const did_controller = result.controller.toLowerCase()
                        updateDoc({
                            did: result.did,
                            version: result.version,
                            doc: result.doc,
                            dkms: result.dkms,
                            guardians: result.guardians,
                        })

                        const path = window.location.pathname
                            .toLowerCase()
                            .replace('/es', '')
                            .replace('/cn', '')
                            .replace('/id', '')
                            .replace('/ru', '')
                        const second = path.split('/')[2]

                        if (_domain === 'did') {
                            updateResolvedInfo({
                                name: _username,
                                domain: _domain,
                                addr: addr,
                                controller:
                                    zcrypto.toChecksumAddress(did_controller),
                                status: result.status,
                            })
                            if (!noRedirect) {
                                //@todo-i-checked pls add description: previously, if we go directly to username/did/doc/services this function is called, and make it redirected to /username
                                Router.push(`/${_username}/didx`)
                            }
                        } else {
                            await tyron.SearchBarUtil.default
                                .fetchAddr(net, _username, _domain)
                                .then(async (domain_addr) => {
                                    updateResolvedInfo({
                                        name: _username,
                                        domain: _domain,
                                        addr: domain_addr,
                                        controller:
                                            zcrypto.toChecksumAddress(
                                                did_controller
                                            ),
                                        status: result.status,
                                    })
                                    let network =
                                        tyron.DidScheme.NetworkNamespace.Mainnet
                                    if (net === 'testnet') {
                                        network =
                                            tyron.DidScheme.NetworkNamespace
                                                .Testnet
                                    }
                                    const init = new tyron.ZilliqaInit.default(
                                        network
                                    )
                                    let version = await init.API.blockchain
                                        .getSmartContractSubState(
                                            domain_addr,
                                            'version'
                                        )
                                        .then((substate) => {
                                            return substate.result
                                                .version as string
                                        })
                                        .catch(() => {
                                            return 'version'
                                        })
                                    switch (version.slice(0, 8)) {
                                        case 'zilstake':
                                            Router.push(`/${_username}/zil`)
                                            break
                                        default:
                                            Router.push('/')
                                            setTimeout(() => {
                                                toast.error(
                                                    'Unregistered DID Domain.',
                                                    {
                                                        position: 'top-right',
                                                        autoClose: 3000,
                                                        hideProgressBar: false,
                                                        closeOnClick: true,
                                                        pauseOnHover: true,
                                                        draggable: true,
                                                        progress: undefined,
                                                        theme: 'dark',
                                                    }
                                                )
                                            }, 1000)
                                    }
                                    // switch (_domain) {
                                    //     case 'zil':
                                    //         // updateUser({
                                    //         //     name: _username,
                                    //         //     domain: 'zil',
                                    //         // })
                                    //         Router.push(`/${_username}/zil`)
                                    //         break
                                    //     case 'defi':
                                    //         // updateUser({
                                    //         //     name: _username,
                                    //         //     domain: 'defi',
                                    //         // })
                                    //         if (second === 'funds') {
                                    //             Router.push(
                                    //                 `/${_username}/defi/funds`
                                    //             )
                                    //         } else {
                                    //             Router.push(
                                    //                 `/${_username}/defi`
                                    //             )
                                    //         }
                                    //         break
                                    //     case 'vc':
                                    //         // updateUser({
                                    //         //     name: _username,
                                    //         //     domain: 'vc',
                                    //         // })
                                    //         Router.push(`/${_username}/vc`)
                                    //         break
                                    //     case 'treasury':
                                    //         // updateUser({
                                    //         //     name: _username,
                                    //         //     domain: 'treasury',
                                    //         // })
                                    //         Router.push(
                                    //             `/${_username}/treasury`
                                    //         )
                                    //         break
                                    //     default:
                                    //         if (!noRedirect) {
                                    //             Router.push(
                                    //                 `/${_username}/didx`
                                    //             )
                                    //         }
                                    //         break
                                    // }
                                })
                                .catch(() => {
                                    toast.error(`Uninitialized DID Domain.`, {
                                        position: 'top-right',
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: 'dark',
                                    })
                                    Router.push(`/${_username}/didx`)
                                })
                        }
                        setTimeout(() => {
                            updateLoading(false)
                        }, 1000)
                    })
                    .catch((err) => {
                        if (
                            String(err).includes('did_status') ||
                            String(err).includes('.result') ||
                            String(err).includes('null')
                        ) {
                            toast('Available in the future.', {
                                position: 'top-right',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                            })
                        } else {
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
                        updateLoading(false)
                    })
            })
            .catch(() => {
                toast.warn('Upgrade required.', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 1,
                })
                Router.push(`/${_username}/didx`)
                updateLoading(false)
            })
    }

    return (
        <div className={styles.container}>
            <div className={styles.searchDiv}>
                <div className={styles.txt}>{t('SEARCH_NFT')}</div>
                <input
                    ref={callbackRef}
                    type="text"
                    className={styles.searchBar}
                    onChange={handleOnChange}
                    onKeyPress={handleOnKeyPress}
                    autoFocus
                />
                <div>
                    <button
                        onClick={() => {
                            updatePrev(window.location.pathname)
                            if (name !== '') {
                                getResults(name, dom)
                            }
                        }}
                        className={styles.searchBtn}
                    >
                        <i className="fa fa-search"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Component
