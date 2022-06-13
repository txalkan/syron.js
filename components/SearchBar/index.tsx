import * as tyron from 'tyron'
import * as zcrypto from '@zilliqa-js/crypto'
import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS,
} from '../../src/constants/tyron'
import { DOMAINS } from '../../src/constants/domains'
import styles from './styles.module.scss'
import { $user, updateUser } from '../../src/store/user'
import { useStore } from 'effector-react'
import { updateDoc } from '../../src/store/did-doc'
import { updateDonation } from '../../src/store/donation'
import { $loading, updateLoading } from '../../src/store/loading'
import { updateIsController } from '../../src/store/controller'
import { $net } from '../../src/store/wallet-network'
import { ZilPayBase } from '../ZilPay/zilpay-base'
import { RootState } from '../../src/app/reducers'
import { updateLoggedIn } from '../../src/store/loggedIn'
import { updateOriginatorAddress } from '../../src/store/originatorAddress'
import {
    updateDashboardState,
    updateModalBuyNft,
    updateModalGetStarted,
} from '../../src/store/modal'
import {
    updateLoginInfoAddress,
    updateLoginInfoUsername,
    updateLoginInfoArAddress,
    updateLoginInfoZilpay,
    updateLoginInfoContract,
} from '../../src/app/actions'
import { ZilAddress } from '../ZilPay'

function Component() {
    const Router = useRouter()
    const dispatch = useDispatch()
    const net = useStore($net)
    const user = useStore($user)
    const loading = useStore($loading)
    const [name, setName] = useState('')
    const [dom, setDomain] = useState('')

    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const getResults = async (_username: string, _domain: string) => {
        updateLoading(true)
        updateIsController(false)
        updateDonation(null)
        updateUser({
            name: _username,
            domain: _domain,
        })

        if (tyron.SearchBarUtil.default.isValidUsername(_username)) {
            switch (_domain) {
                case DOMAINS.TYRON:
                    {
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
                    }
                    break
                case DOMAINS.NFT:
                    await resolveDid(_username, _domain)
                    break
                case DOMAINS.DID:
                    await resolveDid(_username, _domain)
                    break
                case DOMAINS.VC:
                    await resolveDid(_username, _domain)
                    break
                case DOMAINS.TREASURY:
                    await resolveDid(_username, _domain)
                    break
                case DOMAINS.DEFI:
                    await resolveDid(_username, _domain)
                    break
                default:
                    updateLoading(false)
                    toast.error('Invalid domain.', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    })
                    break
            }
        } else {
            if (_username !== '') {
                toast.error(
                    'Invalid username. Names with less than six characters are premium and will be for sale later on.',
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

    useEffect(() => {
        const path = window.location.pathname.toLowerCase()
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
        } else if (username !== '' && username !== user?.name) {
            setName(username)
            setDomain(domain)
            getResults(username, domain)
        }
        const third = path.split('/')[3]
        const fourth = path.split('/')[4]
        if (third === 'funds' || fourth === 'balances') {
            toast.warning(
                `For your security, make sure you're at ssibrowser.com!`,
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

    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    )

    const handleOnChange = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        dispatch(updateLoginInfoContract(null))

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
                getResults(name, dom)
            }
        }
    }

    const resolveDid = async (_username: string, _domain: DOMAINS) => {
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, _domain)
            .then(async (addr) => {
                console.log(addr)
                try {
                    dispatch(
                        updateLoginInfoContract({
                            addr: addr,
                        })
                    )
                    try {
                        let network = tyron.DidScheme.NetworkNamespace.Mainnet
                        if (net === 'testnet') {
                            network = tyron.DidScheme.NetworkNamespace.Testnet
                        }
                        const init = new tyron.ZilliqaInit.default(network)
                        let version = await init.API.blockchain
                            .getSmartContractSubState(addr, 'version')
                            .then((substate) => {
                                return substate.result.version as string
                            })
                            .catch(() => {
                                throw new Error('Version not supported.')
                            })
                        version = version.slice(0, 7)
                        console.log(_username)
                        console.log(_domain)
                        console.log(version)

                        switch (version) {
                            case 'xwallet':
                                resolveDid_(_username, _domain, addr)
                                break
                            case 'initi--':
                                resolveDid_(_username, _domain, addr)
                                break
                            case 'xpoints':
                                Router.push('/xpoints/nft')
                                updateUser({
                                    name: 'xpoints',
                                    domain: '',
                                })
                                updateLoading(false)
                                break
                            case 'tokeni-':
                                Router.push('/fungibletoken/nft')
                            default:
                                throw Error
                        }
                    } catch (error) {
                        resolveDid_(_username, _domain, addr)
                    }
                } catch (error) {
                    updateLoading(false)
                    toast('Not available', {
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
            })
            .catch(() => {
                updateLoading(false)
                updateModalBuyNft(true)
                toast.warning(
                    `For your security, make sure you're at ssibrowser.com!`,
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
            })
    }

    const resolveDid_ = async (
        _username: string,
        _domain: DOMAINS,
        addr: string
    ) => {
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

                const path = window.location.pathname.toLowerCase()
                const second = path.split('/')[2]

                if (_domain === DOMAINS.DID) {
                    dispatch(
                        updateLoginInfoContract({
                            addr: addr,
                            controller:
                                zcrypto.toChecksumAddress(did_controller),
                            status: result.status,
                        })
                    )

                    if (!second) {
                        Router.push(`/${_username}/did`)
                    }
                } else {
                    await tyron.SearchBarUtil.default
                        .fetchAddr(net, _username, _domain)
                        .then(async (domain_addr) => {
                            dispatch(
                                updateLoginInfoContract({
                                    addr: domain_addr,
                                    controller:
                                        zcrypto.toChecksumAddress(
                                            did_controller
                                        ),
                                    status: result.status,
                                })
                            )
                            switch (_domain) {
                                case DOMAINS.DEFI:
                                    if (second === 'funds') {
                                        Router.push(`/${_username}/defi/funds`)
                                    } else {
                                        Router.push(
                                            `/${_username}.${_domain}/defi`
                                        )
                                    }
                                    break
                                case DOMAINS.VC:
                                    Router.push(`/${_username}.vc`)
                                    break
                                case DOMAINS.TREASURY:
                                    Router.push(`/${_username}.treasury`)
                                    break
                                default:
                                    if (!second) {
                                        Router.push(`/${_username}/did`)
                                    }
                                    break
                            }
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
                            Router.push(`/${_username}`)
                        })
                }
                updateLoading(false)
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
    }

    // const checkZilpayConection = () => {
    //   let observer: any = null;
    //   const wallet = new ZilPayBase();
    //   wallet
    //     .zilpay()
    //     .then((zp: any) => {
    //       observer = zp.wallet
    //         .observableAccount()
    //         .subscribe(async (address: ZilAddress) => {
    //           if (zilAddr.bech32 !== address.bech32) {
    //             updateLoggedIn(null);
    //             dispatch(updateLoginInfoAddress(null!));
    //             dispatch(updateLoginInfoUsername(null!));
    //             dispatch(updateLoginInfoZilpay(null!));
    //             updateDashboardState(null);
    //             dispatch(updateLoginInfoArAddress(null!));
    //             // toast.info("You have logged off", {
    //             //   position: "top-center",
    //             //   autoClose: 2000,
    //             //   hideProgressBar: false,
    //             //   closeOnClick: true,
    //             //   pauseOnHover: true,
    //             //   draggable: true,
    //             //   progress: undefined,
    //             //   theme: "dark",
    //             //   toastId: 2,
    //             // });
    //           }
    //         });
    //     })
    //     .catch(() => {
    //       toast.info(`Unlock the ZilPay browser extension.`, {
    //         position: "top-center",
    //         autoClose: 2000,
    //         hideProgressBar: false,
    //         closeOnClick: true,
    //         pauseOnHover: true,
    //         draggable: true,
    //         progress: undefined,
    //         theme: "dark",
    //         toastId: 1,
    //       });
    //     });
    // };

    return (
        <div className={styles.container}>
            <div className={styles.searchDiv}>
                <label htmlFor="">Search for an NFT Username</label>
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
                            if (name !== '') {
                                getResults(name, dom)
                            }
                        }}
                        className={styles.searchBtn}
                    >
                        {loading ? spinner : <i className="fa fa-search"></i>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Component
