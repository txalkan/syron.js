import * as tyron from 'tyron'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS,
} from '../../src/constants/tyron'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { updateDoc } from '../../src/store/did-doc'
import { updateDonation } from '../../src/store/donation'
import { $loading, updateLoading } from '../../src/store/loading'
import { updateIsController } from '../../src/store/controller'
import { updateModalBuyNft, updateShowSearchBar } from '../../src/store/modal'
import { useTranslation } from 'next-i18next'
import { RootState } from '../../src/app/reducers'
import { updateResolvedInfo } from '../../src/store/resolvedInfo'
import { updatePrev } from '../../src/store/router'
import smartContract from '../../src/utils/smartContract'
import toastTheme from '../../src/hooks/toastTheme'
import ThreeDots from '../Spinner/ThreeDots'
import { useStore } from 'effector-react'
import { isValidUsername } from '../../src/constants/mintDomainName'
import { $net } from '../../src/store/network'
import { updateSmartWallet } from '../../src/store/wallet'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const Router = useRouter()
    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loading = useStore($loading)
    const styles = isLight ? stylesLight : stylesDark
    const [input_, setInput_] = useState('')
    const [tld_, setTLD] = useState('')
    const [domain_, setDomain] = useState('')
    const [subdomain_, setSubdomain] = useState('')
    const { t } = useTranslation('common')
    const { getSmartContract } = smartContract()

    const handleOnChange = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const input = value.toLowerCase().replace(/ /g, '')
            setInput_(input)
            setDomain(input)
            setTLD('')
            setSubdomain('')
            if (input_.includes('.zlp')) {
                setTLD('zlp')
            }
            if (input.includes('@')) {
                const [subdomain = '', domain = ''] = input.split('@')
                setDomain(
                    domain
                        .toLowerCase()
                        .replace('.did', '')
                        .replace('.ssi', '')
                        .replace('.zlp', '')
                )
                setSubdomain(subdomain)
            } else if (input.includes('.')) {
                if (
                    input.split('.')[1] === 'ssi' ||
                    input.split('.')[1] === 'did' ||
                    input.split('.')[1] === 'zlp'
                ) {
                    setDomain(input.split('.')[0].toLowerCase())
                    setTLD(input.split('.')[1])
                } else {
                    // throw new Error('Resolver failed.')
                }
            }
        } catch (error) {
            toast.warn(String(error), {
                position: 'bottom-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 13,
            })
        }
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            if (domain_ !== '') {
                updatePrev(window.location.pathname)
                getResults(tld_, domain_, subdomain_)
            }
        }
    }

    const getResults = async (
        tld: string,
        domain: string,
        subdomain: string
    ) => {
        updateShowSearchBar(false)
        updateLoading(true)
        updateDonation(null)
        updateDoc(null)
        updateIsController(false)
        if (isValidUsername(domain)) {
            if (tld === 'tyron') {
                if (VALID_SMART_CONTRACTS.includes(domain)) {
                    window.open(
                        SMART_CONTRACTS_URLS[
                            domain as unknown as keyof typeof SMART_CONTRACTS_URLS
                        ]
                    )
                } else {
                    toast.warn('Invalid smart contract', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 1,
                    })
                }
                updateLoading(false)
            } else {
                if (input_.includes('.did') && input_.includes('@')) {
                    toast.warn('INVALID: @ is only possible with .ssi', {
                        position: 'top-right',
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
                await resolveNftUsername(tld, domain, subdomain)
            }
        } else {
            if (domain !== '') {
                toast(
                    'Available in the future.',
                    // t(
                    //     'Invalid username. Names with less than six characters are premium and will be for sale later on.'
                    // ),
                    {
                        position: 'top-right',
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 8,
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

    const resolveNftUsername = async (
        this_tld: string,
        this_domain: string,
        this_subdomain: string
    ) => {
        const domainId =
            '0x' + (await tyron.Util.default.HashString(this_domain))
        console.log('@search-bar: hash -', this_domain, domainId)
        console.log('resolve:', this_subdomain, '@', this_domain, '.', this_tld)
        try {
            switch (this_tld) {
                case 'zlp':
                    await tyron.SearchBarUtil.default
                        .fetchAddr(net, 'zlp', this_domain)
                        .then(async (addr) => {
                            console.log(
                                `@search-bar: ${this_domain}.zlp address -`,
                                addr
                            )
                            updateLoading(false)
                            updateResolvedInfo({
                                user_tld: this_tld,
                                user_domain: this_domain,
                                user_subdomain: '',
                                addr: addr,
                            })
                            Router.push(`/resolvedAddress`)
                        })
                        .catch(async (err) => {
                            updateLoading(false)
                            console.log('@search-bar: resolution - ', err)
                        })
                    break
                default:
                    await tyron.SearchBarUtil.default
                        .fetchAddr(net, '', this_domain)
                        .then(async (addr) => {
                            console.log(
                                `@search-bar: ${this_domain}.ssi address - `,
                                addr
                            )
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
                            let _addr = addr
                            if (this_tld === 'did' || this_subdomain !== '') {
                                try {
                                    let _subdomain: string
                                    if (this_subdomain !== '') {
                                        _subdomain = this_subdomain
                                    }
                                    _addr =
                                        await tyron.SearchBarUtil.default.fetchAddr(
                                            net,
                                            this_tld,
                                            this_domain,
                                            _subdomain!
                                        )
                                } catch (error) {
                                    throw new Error('domNotR')
                                }
                            }
                            updateResolvedInfo({
                                user_tld: this_tld,
                                user_domain: this_domain,
                                user_subdomain: this_subdomain,
                                addr: _addr,
                            })
                            try {
                                let res = await getSmartContract(
                                    _addr,
                                    'version'
                                )
                                const version = res!.result.version.slice(0, 7)
                                switch (version.toLowerCase()) {
                                    case 'didxwal':
                                        resolveDid(
                                            this_tld,
                                            this_domain,
                                            this_subdomain
                                        )
                                        break
                                    case 'xwallet':
                                        resolveDid(
                                            this_tld,
                                            this_domain,
                                            this_subdomain
                                        )
                                        break
                                    case 'initi--':
                                        resolveDid(
                                            this_tld,
                                            this_domain,
                                            this_subdomain
                                        )
                                        break
                                    case 'initdap':
                                        resolveDid(
                                            this_tld,
                                            this_domain,
                                            this_subdomain
                                        )
                                        break
                                    case 'xpoints':
                                        updateLoading(false)
                                        Router.push('/xpoints')
                                        break
                                    case 'tokeni-':
                                        updateLoading(false)
                                        Router.push('/fungibletoken')
                                        break
                                    case '$siprox':
                                        updateLoading(false)
                                        Router.push('/ssidollar')
                                        break
                                    default:
                                        // It could be an older version of the DIDxWallet or another xWALLET
                                        resolveDid(
                                            this_tld,
                                            this_domain,
                                            this_subdomain
                                        )
                                        break
                                }
                            } catch (error) {
                                Router.push(`/resolvedAddress`)
                                updateLoading(false)
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
                                    theme: toastTheme(isLight),
                                    toastId: 10,
                                })
                            } else if (String(error).slice(-7) === 'domNotR') {
                                toast('Unregistered subdomain.', {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 11,
                                })
                            } else {
                                try {
                                    await tyron.SearchBarUtil.default.fetchAddr(
                                        net,
                                        '',
                                        this_domain
                                    )
                                    console.error(
                                        '@search-bar: resolveNFT - upgrade required'
                                    )

                                    Router.push(`/`)
                                    setTimeout(() => {
                                        toast.error(
                                            'Create a new SSI account',
                                            {
                                                theme: 'dark',
                                            }
                                        )
                                    }, 700)
                                } catch (error) {
                                    updateResolvedInfo({
                                        user_tld: this_tld,
                                        user_domain: this_domain,
                                        user_subdomain: '',
                                    })
                                    updateModalBuyNft(true)
                                    const message = t(
                                        'For your security, make sure you’re at tyron.network'
                                    )
                                    toast.warning(message, {
                                        position: 'top-center',
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: toastTheme(isLight),
                                        toastId: 4,
                                    })
                                }
                            }
                            updateLoading(false)
                        })
                    break
            }
        } catch (error) {
            toast('Connect with ZilPay')
        }
    }

    const resolveDid = async (
        this_tld: string,
        this_domain: string,
        this_subdomain: string
    ) => {
        await tyron.SearchBarUtil.default
            .fetchAddr(net, 'did', this_domain)
            .then(async (addr) => {
                await tyron.SearchBarUtil.default
                    .Resolve(net, addr)
                    .then(async (result: any) => {
                        const did_controller = zcrypto.toChecksumAddress(
                            result.controller
                        )
                        // const res = await getSmartContract(addr, 'version')
                        updateDoc({
                            did: result.did,
                            controller: did_controller,
                            version: result.version,
                            doc: result.doc,
                            dkms: result.dkms,
                            guardians: result.guardians,
                        })
                        //@reviewed: subdomains
                        let _subdomain: string | undefined
                        if (this_subdomain !== '') {
                            _subdomain = this_subdomain
                        }
                        await tyron.SearchBarUtil.default
                            .fetchAddr(net, this_tld, this_domain, _subdomain!)
                            .then(async (domain_addr) => {
                                const res = await getSmartContract(
                                    domain_addr,
                                    'version'
                                )
                                const ver = res!.result.version
                                updateResolvedInfo({
                                    user_tld: this_tld,
                                    user_domain: this_domain,
                                    user_subdomain: this_subdomain,
                                    addr: domain_addr,
                                    status: result.status,
                                    version: ver,
                                })
                                updateSmartWallet({ base16: domain_addr })

                                let subdomainNavigate = _subdomain
                                if (this_tld === 'did') {
                                    subdomainNavigate = 'did@'
                                } else {
                                    subdomainNavigate =
                                        this_subdomain !== ''
                                            ? `${this_subdomain}@`
                                            : this_subdomain
                                }
                                switch (ver.slice(0, 7).toLowerCase()) {
                                    case 'defixwa':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi/defix`
                                        )
                                        break
                                    case 'didxwal':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi`
                                        )
                                        break
                                    case 'xwallet':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi`
                                        )
                                        break
                                    case 'initi--':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi`
                                        )
                                        break
                                    case 'initdap':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi`
                                        )
                                        break
                                    case 'zilstak':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi/zil`
                                        )
                                        break
                                    case '.stake-':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi/zil`
                                        )
                                        break
                                    case 'zilxwal':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi/zil`
                                        )
                                        break
                                    case 'vcxwall':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi/sbt`
                                        )
                                        break
                                    case 'sbtxwal':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi/sbt`
                                        )
                                        break
                                    case 'airxwal':
                                        Router.push(
                                            `/${subdomainNavigate}${this_domain}.ssi/airx`
                                        )
                                        break
                                    default:
                                        console.error(
                                            '@search-bar: Resolved DID missing'
                                        )
                                        Router.push(`/resolvedAddress`)
                                }
                            })
                            .catch(() => {
                                toast(`Uninitialized subdomain.`, {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 6,
                                })
                                Router.push(`/${this_domain}`)
                            })
                        setTimeout(() => {
                            updateLoading(false)
                        }, 3000)
                    })
                    .catch((err) => {
                        if (
                            String(err).includes('did_status') ||
                            String(err).includes('.result') ||
                            String(err).includes('null')
                        ) {
                            toast('DID Resolver: Available in the future.', {
                                position: 'top-right',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 7,
                            })
                        } else {
                            toast.warn(String(err), {
                                position: 'top-right',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 9,
                            })
                        }
                        updateLoading(false)
                    })
            })
            .catch(() => {
                updateLoading(false)
                console.error('@search-bar: resolveDID - upgrade required')

                Router.push(`/`)
                setTimeout(() => {
                    toast.error('Create a new SSI account', {
                        theme: 'dark',
                    })
                }, 700)
            })
    }

    return (
        <div className={styles.container}>
            <div className={styles.searchDiv}>
                <div className={styles.txt}>
                    {t('SEARCH FOR A DOMAIN NAME')}
                </div>
                <div className={styles.searchBarWrapper}>
                    <input
                        type="text"
                        className={styles.searchBar}
                        onChange={handleOnChange}
                        onKeyPress={handleOnKeyPress}
                        value={input_}
                    />
                    <div className={styles.bar} />
                    <div
                        onClick={() => {
                            updatePrev(window.location.pathname)
                            if (domain_ !== '') {
                                getResults(tld_, domain_, subdomain_)
                            }
                        }}
                        className={styles.searchBtn}
                    >
                        {loading ? (
                            <ThreeDots color="yellow" />
                        ) : (
                            <i className="fa fa-search"></i>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
