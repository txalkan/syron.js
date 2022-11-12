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

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const Router = useRouter()
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loading = useStore($loading)
    const styles = isLight ? stylesLight : stylesDark
    const [name, setName] = useState('')
    const [domx, setDomain] = useState('')
    const [input_, setInput_] = useState('')
    const { t } = useTranslation('common')
    const { getSmartContract } = smartContract()

    const handleOnChange = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        const input = value.replace(/ /g, '')
        setInput_(input.toLowerCase())
        setName(input.toLowerCase())
        setDomain('')
        if (input.includes('@')) {
            const [domain = '', username = ''] = input.split('@')
            setName(
                username.toLowerCase().replace('.did', '').replace('.ssi', '')
            )
            setDomain(domain)
        } else if (input.includes('.')) {
            if (input.split('.')[1] === 'did') {
                setName(input.split('.')[0].toLowerCase())
                setDomain('did')
            } else if (input.split('.')[1] === 'ssi') {
                setName(input.split('.')[0].toLowerCase())
            } else {
                throw Error
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

    const resolveNftUsername = async (_username: string, _domain: string) => {
        const domainId = '0x' + (await tyron.Util.default.HashString(_username))
        console.log('search id', _username, domainId)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, domainId, '')
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
                let _addr = addr
                if (_domain !== '') {
                    try {
                        const domainId =
                            '0x' +
                            (await tyron.Util.default.HashString(_username))
                        _addr = await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            domainId,
                            _domain
                        )
                    } catch (error) {
                        throw new Error('domNotR')
                    }
                }

                let res = await getSmartContract(_addr, 'version')
                const version = res.result.version.slice(0, 7)
                updateResolvedInfo({
                    name: _username,
                    domain: _domain,
                    addr: _addr,
                })
                switch (version.toLowerCase()) {
                    case 'didxwal':
                        resolveDid(_username, _domain)
                        break
                    case 'xwallet':
                        resolveDid(_username, _domain)
                        break
                    case 'initi--':
                        resolveDid(_username, _domain)
                        break
                    case 'initdap':
                        resolveDid(_username, _domain)
                        break
                    case 'xpoints':
                        Router.push('/xpoints')
                        updateLoading(false)
                        break
                    case 'tokeni-':
                        Router.push('/fungibletoken/nft')
                        updateLoading(false)
                        break
                    case '$siprox':
                        Router.push('/ssidollar')
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
                        toastId: 10,
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
                        toastId: 11,
                    })
                } else {
                    try {
                        const domainId =
                            '0x' +
                            (await tyron.Util.default.HashString(_username))
                        await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            domainId,
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
                            toastId: 3,
                        })
                        Router.push(`/${_username}`)
                    } catch (error) {
                        updateResolvedInfo({
                            name: _username,
                            domain: _domain,
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
                                toastId: 4,
                            }
                        )
                    }
                }
                updateLoading(false)
            })
    }

    const resolveDid = async (_username: string, _domain: string) => {
        const domainId = '0x' + (await tyron.Util.default.HashString(_username))
        await tyron.SearchBarUtil.default
            .fetchAddr(net, domainId, 'did')
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
                        const domainId =
                            '0x' +
                            (await tyron.Util.default.HashString(_username))
                        await tyron.SearchBarUtil.default
                            .fetchAddr(net, domainId, _domain)
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
                                switch (
                                    res.result.version.slice(0, 7).toLowerCase()
                                ) {
                                    case 'didxwal':
                                        Router.push(
                                            `/${
                                                _domain === ''
                                                    ? ''
                                                    : _domain + '@'
                                            }${_username}`
                                        )
                                        break
                                    case 'xwallet':
                                        Router.push(
                                            `/${
                                                _domain === ''
                                                    ? ''
                                                    : _domain + '@'
                                            }${_username}`
                                        )
                                        break
                                    case 'initi--':
                                        Router.push(
                                            `/${
                                                _domain === ''
                                                    ? ''
                                                    : _domain + '@'
                                            }${_username}`
                                        )
                                        break
                                    case 'initdap':
                                        Router.push(
                                            `/${
                                                _domain === ''
                                                    ? ''
                                                    : _domain + '@'
                                            }${_username}`
                                        )
                                        break
                                    case 'zilstak':
                                        Router.push(
                                            `/${_domain}@${_username}/zil`
                                        )
                                        break
                                    case '.stake-':
                                        Router.push(
                                            `/${_domain}@${_username}/zil`
                                        )
                                        break
                                    case 'zilxwal':
                                        Router.push(
                                            `/${_domain}@${_username}/zil`
                                        )
                                        break
                                    case 'vcxwall':
                                        Router.push(
                                            `/${_domain}@${_username}/sbt`
                                        )
                                        break
                                    case 'sbtxwal':
                                        Router.push(
                                            `/${_domain}@${_username}/sbt`
                                        )
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
                                                    theme: toastTheme(isLight),
                                                    toastId: 5,
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
                                    toastId: 6,
                                })
                                Router.push(`/${_username}`)
                            })
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
                                toastId: 7,
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
                                toastId: 9,
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
                        type="text"
                        className={styles.searchBar}
                        onChange={handleOnChange}
                        onKeyPress={handleOnKeyPress}
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
