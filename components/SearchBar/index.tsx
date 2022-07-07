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
import { updateLoading } from '../../src/store/loading'
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
    UpdateResolvedInfo,
} from '../../src/app/actions'
import { ZilAddress } from '../ZilPay'
import { useTranslation } from 'next-i18next'

function Component() {
    const Router = useRouter()
    const dispatch = useDispatch()
    const net = useStore($net)
    const user = useStore($user)
    const [name, setName] = useState('')
    const [dom, setDomain] = useState('')
    const { t } = useTranslation('common')

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
                    await resolveNft(_username, _domain)
                    break
                case DOMAINS.DID:
                    await resolveNft(_username, _domain)
                    break
                case DOMAINS.STAKE:
                    await resolveNft(_username, _domain)
                    break
                case DOMAINS.VC:
                    await resolveNft(_username, _domain)
                    break
                case DOMAINS.TREASURY:
                    await resolveNft(_username, _domain)
                    break
                case DOMAINS.DEFI:
                    await resolveNft(_username, _domain)
                    break
                case DOMAINS.STAKE:
                    await resolveNft(_username, _domain)
                    break
                default:
                    updateLoading(false)
                    toast.error(t('Invalid domain.'), {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    })
                    Router.push('/')
                    break
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

    useEffect(() => {
        const url = window.location.pathname.toLowerCase()
        let path
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
        } else if (username !== '' && username !== user?.name) {
            setName(username)
            setDomain(domain)
            getResults(username, domain)
        }
        const third = path.split('/')[3]
        const fourth = path.split('/')[4]
        if (third === 'funds' || fourth === 'balances') {
            toast.warning(
                t('For your security, make sure you’re at tyron.network!'),
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
        <i
            style={{ color: '#ffff32' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    const handleOnChange = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        dispatch(UpdateResolvedInfo(null))

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

    const resolveNft = async (_username: string, _domain: DOMAINS) => {
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, _domain)
            .then(async (addr) => {
                dispatch(
                    UpdateResolvedInfo({
                        addr: addr,
                    })
                )
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
                        return 'version'
                    })
                console.log(version.slice(0, 7))
                switch (version.slice(0, 7)) {
                    case 'xwallet':
                        resolveDid(_username, _domain)
                        break
                    case 'initi--':
                        resolveDid(_username, _domain)
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
                        // It could be an older version of the DIDxWallet
                        resolveDid(_username, _domain)
                }
            })
            .catch(async () => {
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
                    Router.push(`/${_username}/did`)
                } catch (error) {
                    updateModalBuyNft(true)
                    toast.warning(
                        t(
                            'For your security, make sure you’re at tyron.network!'
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
                updateLoading(false)
            })
    }

    const resolveDid = async (_username: string, _domain: DOMAINS) => {
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

                        if (_domain === DOMAINS.DID) {
                            dispatch(
                                UpdateResolvedInfo({
                                    addr: addr,
                                    controller:
                                        zcrypto.toChecksumAddress(
                                            did_controller
                                        ),
                                    status: result.status,
                                })
                            )
                            Router.push(`/${_username}/did`)
                        } else {
                            await tyron.SearchBarUtil.default
                                .fetchAddr(net, _username, _domain)
                                .then(async (domain_addr) => {
                                    dispatch(
                                        UpdateResolvedInfo({
                                            addr: domain_addr,
                                            controller:
                                                zcrypto.toChecksumAddress(
                                                    did_controller
                                                ),
                                            status: result.status,
                                        })
                                    )
                                    switch (_domain) {
                                        case DOMAINS.STAKE:
                                            Router.push(`/${_username}/stake`)
                                            break
                                        case DOMAINS.DEFI:
                                            if (second === 'funds') {
                                                Router.push(
                                                    `/${_username}/defi/funds`
                                                )
                                            } else {
                                                Router.push(
                                                    `/${_username}/defi`
                                                )
                                            }
                                            break
                                        case DOMAINS.VC:
                                            Router.push(`/${_username}/vc`)
                                            break
                                        case DOMAINS.TREASURY:
                                            Router.push(
                                                `/${_username}/treasury`
                                            )
                                            break
                                        default:
                                            Router.push(`/${_username}/did`)
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
            })
            .catch((err) => {
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
                <label htmlFor="">{t('SEARCH_NFT')}</label>
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
                        <i className="fa fa-search"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Component
