import * as tyron from 'tyron'
import React, { useState, useCallback } from 'react'
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
import { updateLoading } from '../../src/store/loading'
import { updateIsController } from '../../src/store/controller'
import { updateModalBuyNft, updateShowSearchBar } from '../../src/store/modal'
import { useTranslation } from 'next-i18next'
import { RootState } from '../../src/app/reducers'
import { updateResolvedInfo } from '../../src/store/resolvedInfo'
import { updatePrev } from '../../src/store/router'
import smartContract from '../../src/utils/smartContract'
import toastTheme from '../../src/hooks/toastTheme'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const Router = useRouter()
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const [name, setName] = useState('')
    const [domx, setDomain] = useState('')
    const { t } = useTranslation('common')
    const { getSmartContract } = smartContract()

    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const handleOnChange = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        const input = value.toLowerCase().replace(/ /g, '')
        setName(input)
        setDomain('')
        if (input.includes('@')) {
            const [username = '', domain = ''] = input.split('@')
            setName(username)
            setDomain(domain.replace('.did', ''))
        } else {
            if (input.includes('.did')) {
                setName(input.split('.')[0])
                setDomain('did')
            }
        }
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            if (name !== '') {
                updatePrev(window.location.pathname)
                getResults(name, domx)
            }
        }
    }

    const getResults = async (_username: string, _domain: string) => {
        updateShowSearchBar(false)
        updateLoading(true)
        updateDonation(null)
        updateDoc(null)
        updateIsController(false)
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
                        theme: toastTheme(isLight),
                    })
                }
                updateLoading(false)
            } else {
                await resolveNftUsername(_username, _domain)
            }
        } else {
            if (_username !== '') {
                toast(
                    'Unavailable username',
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
                    try {
                        addr_ = await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            _username,
                            _domain
                        )
                    } catch (error) {
                        throw new Error('domNotR')
                    }
                }
                updateResolvedInfo({
                    name: _username,
                    domain: _domain,
                    addr: addr_,
                })

                let res = await getSmartContract(addr_, 'version')
                switch (res.result.version.slice(0, 7)) {
                    case 'xwallet':
                        resolveDid(_username, 'did')
                        break
                    case 'initi--':
                        resolveDid(_username, 'did')
                        break
                    case 'xpoints':
                        Router.push('/xpoints/nft')
                        updateLoading(false)
                        break
                    case 'tokeni-':
                        Router.push('/fungibletoken/nft')
                        updateLoading(false)
                        break
                    case 'VCxWall':
                        alert("het")
                        Router.push('/vcxwallet/nft')
                        updateLoading(false)
                        break
                    case '$SIprox':
                        Router.push('/ssidollar/nft')
                        updateLoading(false)
                        break
                    default:
                        // It could be an older version of the DIDxWallet
                        resolveDid(_username, _domain)
                        break
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
                        toastId: 3,
                    })
                } else if (String(error).slice(-7) === 'domNotR') {
                    toast('Unregistered DID Domain', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 3,
                    })
                } else {
                    try {
                        await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            _username,
                            ''
                        )
                        toast.warn(`Upgrade required.`, {
                            position: 'top-right',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                        })
                        Router.push(`/${_username}`)
                    } catch (error) {
                        updateResolvedInfo({
                            name: _username,
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
                                theme: toastTheme(isLight),
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
                        const did_controller = zcrypto.toChecksumAddress(
                            result.controller
                        )
                        const res = await getSmartContract(addr, 'version')
                        updateDoc({
                            did: result.did,
                            controller: did_controller,
                            version: result.version,
                            doc: result.doc,
                            dkms: result.dkms,
                            guardians: result.guardians,
                        })

                        if (_domain === 'did') {
                            updateResolvedInfo({
                                name: _username,
                                domain: _domain,
                                addr: addr,
                                status: result.status,
                                version: res.result.version,
                            })
                            Router.push(`/${_username}.did`)
                        } else {
                            await tyron.SearchBarUtil.default
                                .fetchAddr(net, _username, _domain)
                                .then(async (domain_addr) => {
                                    const res = await getSmartContract(
                                        domain_addr,
                                        'version'
                                    )
                                    updateResolvedInfo({
                                        name: _username,
                                        domain: _domain,
                                        addr: domain_addr,
                                        status: result.status,
                                        version: res.result.version,
                                    })
                                    switch (res.result.version.slice(0, 8)) {
                                        case 'zilstake':
                                            Router.push(`/${_username}/zil`)
                                            break
                                        case '.stake--':
                                            Router.push(`/${_username}/zil`)
                                            break
                                        default:
                                            Router.push(`/${_username}`)
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
                                                        theme: toastTheme(
                                                            isLight
                                                        ),
                                                    }
                                                )
                                            }, 1000)
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
                                        theme: toastTheme(isLight),
                                    })
                                    Router.push(`/${_username}`)
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
                                theme: toastTheme(isLight),
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
                                theme: toastTheme(isLight),
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
                    theme: toastTheme(isLight),
                    toastId: 1,
                })
                Router.push(`/${_username}`)
                updateLoading(false)
            })
    }

    return (
        <div className={styles.container}>
            <div className={styles.searchDiv}>
                <div className={styles.txt}>{t('SEARCH_NFT')}</div>
                <div className={styles.searchBarWrapper}>
                    <input
                        ref={callbackRef}
                        type="text"
                        className={styles.searchBar}
                        onChange={handleOnChange}
                        onKeyPress={handleOnKeyPress}
                        autoFocus
                    />
                    <div className={styles.bar} />
                    <div
                        onClick={() => {
                            updatePrev(window.location.pathname)
                            if (name !== '') {
                                getResults(name, domx)
                            }
                        }}
                        className={styles.searchBtn}
                    >
                        <i className="fa fa-search"></i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
