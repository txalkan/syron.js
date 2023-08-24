import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { RootState } from '../../../src/app/reducers'
import {
    $modalDashboard,
    // $modalBuyNft,
    updateDashboardState,
    updateModalDashboard,
    updateModalTx,
    updateModalBuyNft,
    updateModalTxMinimized,
    updateShowSearchBar,
    updateShowZilpay,
    updateNewDefiModal,
} from '../../../src/store/modal'
import {
    UpdateLoggedInVersion,
    setTxId,
    setTxStatusLoading,
    updateLoginInfoAddress,
    updateLoginInfoUsername,
} from '../../../src/app/actions'
import ZilpayIcon from '../../../src/assets/logos/lg_zilpay.svg'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import ArrowUpReg from '../../../src/assets/icons/dashboard_arrow_up_icon.svg'
import ArrowDownBlack from '../../../src/assets/icons/dashboard_arrow_down_icon_black.svg'
import ArrowUpBlack from '../../../src/assets/icons/dashboard_arrow_up_icon_black.svg'
import LogOffIconReg from '../../../src/assets/icons/log_off.svg'
import LogOffIconBlack from '../../../src/assets/icons/log_off_black.svg'
import ArConnectIcon from '../../../src/assets/logos/lg_arconnect.png'
import CloseIconReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIconBlack from '../../../src/assets/icons/ic_cross_black.svg'
import AddIconReg from '../../../src/assets/icons/add_icon.svg'
import MinusIconReg from '../../../src/assets/icons/minus_icon.svg'
import AddIconBlack from '../../../src/assets/icons/add_icon_black.svg'
import MinusIconBlack from '../../../src/assets/icons/minus_icon_black.svg'
import * as tyron from 'tyron'
import useArConnect from '../../../src/hooks/useArConnect'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { updateBuyInfo } from '../../../src/store/buyInfo'
import { useTranslation } from 'next-i18next'
import { updateLoading } from '../../../src/store/loading'
// import { updateResolvedInfo } from '../../../src/store/resolvedInfo'
import routerHook from '../../../src/hooks/router'
import { Arrow, Spinner } from '../..'
import smartContract from '../../../src/utils/smartContract'
import { $arconnect } from '../../../src/store/arconnect'
import toastTheme from '../../../src/hooks/toastTheme'
import { $net } from '../../../src/store/network'
import { updateResolvedInfo } from '../../../src/store/resolvedInfo'
import iconSSI from '../../../src/assets/icons/ssi_icon_ssi-acc.svg'
import iconWallets from '../../../src/assets/icons/ssi_icon_key-based-wallet.svg'
import iconDefi from '../../../src/assets/icons/ssi_icon_defix.svg'
import iconExplorer from '../../../src/assets/icons/ssi_icon_login_block-exporer.svg'
import iconTyron from '../../../src/assets/icons/ssi_token_Tyron.svg'
import iconDoms from '../../../src/assets/icons/ssi_icon_nfts.svg'
import iconSubs from '../../../src/assets/icons/ssi_icon_nft-gallery.svg'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { connect, disconnect } = useArConnect()
    const { navigate, logOff } = routerHook()
    const { getSmartContract, getSmartContractInit } = smartContract()
    const dispatch = useDispatch()
    const Router = useRouter()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const loggedInDomain = loginInfo.loggedInDomain
        ? loginInfo.loggedInDomain
        : ''
    const loggedInAddress = loginInfo.loggedInAddress
    const net = $net.state.net as 'mainnet' | 'testnet'

    const modalDashboard = useStore($modalDashboard)
    // const modalBuyNft = useStore($modalBuyNft)
    const [existingUser, setExistingUsername] = useState('')
    const [existingAddr, setExistingAddr] = useState('')

    const menu_ = loginInfo.zilAddr === null ? 'login' : ''
    const [menu, setMenu] = useState(menu_)

    const submenu_ = loginInfo.zilAddr === null ? 'existingUsers' : ''
    const [subMenu, setSubMenu] = useState(submenu_)
    const [loading, setLoading] = useState(false)
    const [didDomain, setDidDomain] = useState(Array())
    const [nftUsername, setNftUsername] = useState(Array())
    const [loadingList, setLoadingList] = useState(false)

    // const [loadingDidx, setLoadingDidx] = useState(false)
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const ArrowUp = isLight ? ArrowUpBlack : ArrowUpReg
    const ArrowDown = isLight ? ArrowDownBlack : ArrowDownReg
    const MinusIcon = isLight ? MinusIconBlack : MinusIconReg
    const AddIcon = isLight ? AddIconBlack : AddIconReg
    const LogOffIcon = isLight ? LogOffIconBlack : LogOffIconReg
    const CloseIcon = isLight ? CloseIconBlack : CloseIconReg

    const handleOnChangeUsername = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setExistingUsername(value.toLowerCase().replace(/ /g, ''))
    }

    const resolveLoggedInDomain = async () => {
        setLoading(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, 'did', existingUser)
            .then(async (addr) => {
                await tyron.SearchBarUtil.default
                    .Resolve(net, addr)
                    .then(async (result: any) => {
                        const did_controller = zcrypto.toChecksumAddress(
                            result.controller
                        )
                        if (did_controller !== loginInfo.zilAddr?.base16) {
                            setLoading(false)
                            toast.warn(
                                `Only ${existingUser}'s controller wallet can log in to ${existingUser}.`,
                                {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 1,
                                }
                            )
                        } else {
                            dispatch(
                                updateLoginInfoAddress(
                                    zcrypto.toChecksumAddress(addr)
                                )
                            )
                            dispatch(updateLoginInfoUsername(existingUser))

                            // Saves version for future use
                            const res = await getSmartContract(addr, 'version')
                            dispatch(UpdateLoggedInVersion(res!.result.version))
                            dispatch(updateLoginInfoAddress(addr))

                            //updateModalDashboard(false)
                            // setMenu('')
                            // setSubMenu('')
                            // setExistingUsername('')
                            // setExistingAddr('')
                            setLoading(false)
                            // updateResolvedInfo({
                            //     user_tld: 'did',
                            //     user_domain: existingUser,
                            //     user_subdomain: '',
                            //     addr: addr,
                            // })

                            //@reviewed: remove auto redirect
                            // if (!modalBuyNft) {
                            //     //Router.push(`/did@${existingUsername}`)
                            // }
                            await connect().then(() => {
                                const arConnect = $arconnect.getState()
                                if (arConnect) {
                                    updateDashboardState('loggedIn')
                                }
                            })
                        }
                    })
            })
            .catch(() => {
                setLoading(false)
                toast('Node Glitch - Ask for ToT Support on Telegram.', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 11,
                })
            })
    }
    // @reviewed less is more, consider adding this functionality to a different branch
    // const handleOnChangeAddr = (event: { target: { value: any } }) => {
    //     setExistingAddr(event.target.value.replace(/ /g, ''))
    // }

    const resolveExistingAddr = async () => {
        const addr = tyron.Address.default.verification(existingAddr)
        if (addr !== '') {
            try {
                setLoading(true)
                const res_v = await getSmartContract(addr, 'version')
                const version = res_v!.result.version
                const res_c = await getSmartContract(addr, 'controller')
                const controller = zcrypto.toChecksumAddress(
                    res_c!.result.controller
                )
                const is_supported =
                    version.slice(0, 7) === 'xwallet' ||
                    version.slice(0, 10) === 'DIDxWALLET'
                if (!is_supported) {
                    toast.warn('Unsupported version.', {
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
                    setLoading(false)
                } else if (controller !== loginInfo.zilAddr?.base16) {
                    toast.warn(
                        `Only ${existingAddr.slice(
                            0,
                            7
                        )}'s controller wallet can log in to this SSI.`,
                        {
                            position: 'top-right',
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
                    setLoading(false)
                } else {
                    await connect()
                        .then(() => {
                            const arConnect = $arconnect.getState()
                            if (arConnect) {
                                updateDashboardState('loggedIn')
                            }
                            dispatch(updateLoginInfoAddress(addr))
                            updateModalDashboard(false)
                            setMenu('')
                            setSubMenu('')
                            setExistingUsername('')
                            setExistingAddr('')
                            updateShowSearchBar(false)
                            navigate('/address')
                        })
                        .catch(() => {
                            toast.warn('ArConnect is missing.', {
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
                        })
                    setLoading(false)
                }
            } catch (error) {
                setLoading(false)
                toast.warn(`Unsupported.`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 6,
                })
            }
        } else {
            toast.warn(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 7,
            })
        }
    }

    const newWallet = async (wallet: string) => {
        try {
            if (loginInfo.zilAddr !== null && net !== null) {
                const zilpay = new ZilPayBase()
                const zp = await zilpay.zilpay()
                await zp.wallet.connect()

                updateModalDashboard(false)
                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                const arConnect = $arconnect.getState()
                switch (wallet) {
                    case 'Decentralised Finance xWALLET':
                        await zilpay
                            .deployDomain(net, wallet, loggedInDomain)
                            .then(async (deploy: any) => {
                                setLoading(false)

                                dispatch(setTxId(deploy[0].ID))
                                dispatch(setTxStatusLoading('submitted'))

                                let tx = await tyron.Init.default.transaction(
                                    net
                                )
                                tx = await tx.confirm(deploy[0].ID, 33)
                                if (tx.isConfirmed()) {
                                    dispatch(setTxStatusLoading('confirmed'))

                                    let link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}`
                                    if (net === 'testnet') {
                                        link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
                                    }
                                    setTimeout(() => {
                                        window.open(link)
                                    }, 1000)

                                    const txn =
                                        await tyron.Init.default.contract(
                                            deploy[0].ID,
                                            net
                                        )
                                    let addr = '0x' + txn //deploy[0].ContractAddress
                                    addr = zcrypto.toChecksumAddress(addr)

                                    // updateDonation(null)
                                    // updateDomainAddr(addr)
                                    // updateDomainLegend2('saved')
                                } else if (tx.isRejected()) {
                                    dispatch(setTxStatusLoading('failed'))
                                    setTimeout(() => {
                                        toast.warn(t('Transaction failed.'), {
                                            position: 'bottom-right',
                                            autoClose: 4000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                            theme: toastTheme(isLight),
                                            toastId: 8,
                                        })
                                    }, 1000)
                                }
                            })
                            .catch((error) => {
                                throw error
                            })
                        break
                    default:
                        await zilpay
                            .deployDid(
                                net,
                                loginInfo.zilAddr?.base16,
                                arConnect
                            )
                            .then(async (deploy: any) => {
                                dispatch(setTxId(deploy[0].ID))
                                dispatch(setTxStatusLoading('submitted'))

                                let tx = await tyron.Init.default.transaction(
                                    net
                                )
                                tx = await tx.confirm(deploy[0].ID, 33)
                                if (tx.isConfirmed()) {
                                    dispatch(setTxStatusLoading('confirmed'))
                                    let link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}`
                                    if (net === 'testnet') {
                                        link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
                                    }
                                    setTimeout(() => {
                                        window.open(link)
                                    }, 1000)
                                    const txn =
                                        await tyron.Init.default.contract(
                                            deploy[0].ID,
                                            net
                                        )
                                    let new_ssi = '0x' + txn
                                    new_ssi = zcrypto.toChecksumAddress(new_ssi)
                                    updateBuyInfo(null)
                                    dispatch(updateLoginInfoUsername(null!))
                                    dispatch(updateLoginInfoAddress(new_ssi))
                                    updateDashboardState('loggedIn')
                                    // updateModalTx(false)
                                    updateModalBuyNft(false)
                                    Router.push('/address')
                                } else if (tx.isRejected()) {
                                    // setLoadingSsi(false)
                                    dispatch(setTxStatusLoading('failed'))
                                }
                            })
                            .catch((error) => {
                                throw error
                            })
                        break
                }
            } else {
                toast.warn('Connect your ZilPay wallet.', {
                    position: 'bottom-left',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 9,
                })
            }
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.warn(String(error), {
                position: 'bottom-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 10,
            })
        }
    }

    const continueLogIn = () => {
        if (existingUser === '') {
            resolveExistingAddr()
        } else {
            resolveLoggedInDomain()
        }
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            continueLogIn()
        }
    }

    const menuActive = async (val: React.SetStateAction<string>) => {
        if (val === menu) {
            setMenu('')
        } else {
            if (val === 'didDomains') {
                setLoadingList(true)
                setMenu(val)
                try {
                    const addr = await tyron.SearchBarUtil.default.fetchAddr(
                        net,
                        'did',
                        loggedInDomain
                    )
                    getSmartContract(addr, 'did_domain_dns').then(
                        async (res) => {
                            const key = Object.keys(res!.result.did_domain_dns)
                            setDidDomain(key)
                        }
                    )
                } catch (error) {
                    toast('Node Glitch - Ask for ToT Support on Telegram.', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        toastId: 11,
                    })
                }

                setTimeout(() => {
                    setLoadingList(false)
                }, 1000)
            } else if (val === 'nftUsername') {
                setLoadingList(true)
                setMenu(val)
                const addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'did',
                    'init'
                )
                // const get_services = await getSmartContract(addr, 'services')
                // const services = await tyron.SmartUtil.default.intoMap(
                //     get_services.result.services
                // )
                // getSmartContract(services.get('init'), 'did_dns')
                let init
                const init_: any = await getSmartContractInit(addr)
                const init__ = init_.result
                for (let i = 0; i < init__.length; i += 1) {
                    if (init__[i].vname === 'init') {
                        init = init__[i].value
                    }
                }
                getSmartContract(init, 'did_dns').then(async (res) => {
                    const val = Object.values(res!.result.did_dns)
                    const key = Object.keys(res!.result.did_dns)
                    let list: any = []
                    for (let i = 0; i < val.length; i += 1) {
                        if (val[i] === loggedInAddress.toLowerCase()) {
                            list.push(key[i])
                        }
                    }
                    setNftUsername(list)
                })
                setTimeout(() => {
                    setLoadingList(false)
                }, 1000)
            } else {
                setMenu(val)
            }
        }
    }

    const subMenuActive = (val: React.SetStateAction<string>) => {
        if (val === subMenu) {
            setSubMenu('')
        } else {
            setSubMenu(val)
        }
    }

    //@dev: resolves the domain.ssi and redirects to the UI
    const resolveSSI = async (this_domain: string, this_tld: string) => {
        let tld = 'ssi'
        if (this_tld === 'did') {
            tld = 'did'
        }
        updateLoading(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, this_tld, this_domain)
            .then(async (addr) => {
                const res = await getSmartContract(addr, 'version')
                updateResolvedInfo({
                    user_tld: this_tld,
                    user_domain: this_domain,
                    user_subdomain: '',
                    addr: addr,
                    version: res!.result.version,
                })

                //@review: a way to avoid this repeated switch
                const version = res!.result.version.slice(0, 7)

                updateLoading(false)
                switch (version.toLowerCase()) {
                    case 'didxwal':
                        Router.push(`/${this_domain}.${tld}`)
                        break
                    case 'xwallet':
                        Router.push(`/${this_domain}.${tld}`)
                        break
                    // case 'defixwa':
                    //     Router.push(`/${subdomain}@${this_domain}.ssi/defix`)
                    //     break
                    // case '.stake-':
                    //     Router.push(`/${subdomain}@${this_domain}.ssi/zil`)
                    //     break
                    // case 'zilstak':
                    //     Router.push(`/${subdomain}@${this_domain}.ssi/zil`)
                    //     break
                    // case 'zilxwal':
                    //     Router.push(`/${subdomain}@${this_domain}.ssi/zil`)
                    //     break
                    // case 'vcxwall':
                    //     Router.push(`/${subdomain}@${this_domain}.ssi/sbt`)
                    //     break
                    // case 'sbtxwal':
                    //     Router.push(`/${subdomain}@${this_domain}.ssi/sbt`)
                    //     break
                    case 'airxwal':
                        Router.push(`/${this_domain}.ssi/airx`)
                        break
                    default:
                        Router.push(`/resolvedAddress`)
                }
            })
            .catch((err) => {
                updateLoading(false)
                console.error('@dashboard:', err)
                toast('Node Glitch - Ask for ToT Support on Telegram.', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 11,
                })
            })
    }

    // const goToDidx = async () => {
    //     updateShowSearchBar(false)
    //     setLoadingDidx(true)
    //     //@review: we dont need to fetch the address again since it is in the resolved info
    //     await tyron.SearchBarUtil.default
    //         .fetchAddr(net, 'did', loginInfo?.username)
    //         .then(async (addr) => {
    //             let res = await getSmartContract(addr, 'version')
    //             const version = res!.result.version.slice(0, 7).toLowerCase()
    //             if (
    //                 version === 'didxwal' ||
    //                 version === 'xwallet' ||
    //                 version === 'initi--' ||
    //                 version === 'initdap'
    //             ) {
    //                 await tyron.SearchBarUtil.default
    //                     .Resolve(net, addr)
    //                     .then(async (result: any) => {
    //                         const did_controller = zcrypto.toChecksumAddress(
    //                             result.controller
    //                         )
    //                         updateDoc({
    //                             did: result.did,
    //                             controller: did_controller,
    //                             version: result.version,
    //                             doc: result.doc,
    //                             dkms: result.dkms,
    //                             guardians: result.guardians,
    //                         })
    //                         setLoadingDidx(false)
    //                         updateModalDashboard(false)
    //                         navigate(`/${loginInfo.username}.did/didx/wallet`)
    //                     })
    //                     .catch((err) => {
    //                         throw err
    //                     })
    //             }
    //         })
    //         .catch(async () => {
    //             setLoadingDidx(false)
    //             try {
    //                 await tyron.SearchBarUtil.default.fetchAddr(
    //                     net,
    //                     '',
    //                     loginInfo.username
    //                 )
    //                 setTimeout(() => {
    //                     toast.warn('Create a new DIDxWALLET.', {
    //                         position: 'bottom-left',
    //                         autoClose: 4000,
    //                         hideProgressBar: false,
    //                         closeOnClick: true,
    //                         pauseOnHover: true,
    //                         draggable: true,
    //                         progress: undefined,
    //                         theme: toastTheme(isLight),
    //                         toastId: '1',
    //                     })
    //                 }, 1000)
    //                 //navigate(`/did@${loginInfo.username}`)
    //                 navigate(`${loginInfo.username}.ssi`)
    //             } catch (error) {
    //                 Router.push(`/`)
    //             }
    //             setLoadingDidx(false)
    //         })
    // }

    useEffect(() => {
        return () => {
            updateModalDashboard(false)
            setLoading(false)
            setLoadingList(false)
            updateLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const spinner = <Spinner />

    if (!modalDashboard) {
        return null
    }

    return (
        <div className={styles.outerWrapper}>
            {/* dev: close modal when clicking outside */}
            <div
                className={styles.containerClose}
                onClick={() => {
                    setMenu('')
                    updateModalDashboard(false)
                }}
            />
            <div className={styles.container}>
                {/* @dev: close icon X */}
                <div className={styles.wrapperCloseIco}>
                    <div
                        onClick={() => updateModalDashboard(false)}
                        className="closeIcon"
                    >
                        <Image
                            alt="ico-close"
                            src={CloseIcon}
                            width={15}
                            height={15}
                        />
                    </div>
                </div>
                {/* @dev: LOGGED IN */}
                <div className={styles.loggedInInfo}>
                    {loggedInAddress !== null ? (
                        <div style={{ marginTop: '33px' }}>
                            <div className={styles.icoWrapper}>
                                <div className={styles.iconToggle}>
                                    <Image
                                        src={iconSSI}
                                        alt="acc-icon"
                                        height="29"
                                        width="29"
                                    />
                                </div>
                                <div className={styles.title}>SSI ACCOUNT</div>
                            </div>
                            <br />
                            {/* @review: menos es mas */}
                            {/* <div className={styles.subtitle}>
                                {t(' YOUR SSI ACCOUNT:')}
                            </div> */}
                            <div className={styles.addrWrapper}>
                                {loggedInDomain !== '' ? (
                                    <>
                                        <div className={styles.icoWrapper}>
                                            <div className={styles.icon}>
                                                <Image
                                                    src={iconTyron}
                                                    alt="acc-icon"
                                                    height="26"
                                                    width="26"
                                                />
                                            </div>
                                            <div
                                                className={styles.txtDomain}
                                                onClick={() => {
                                                    resolveSSI(
                                                        loggedInDomain,
                                                        'ssi'
                                                    )
                                                    updateModalDashboard(false)
                                                }}
                                                style={{
                                                    marginLeft: '3px',
                                                }}
                                            >
                                                {loggedInDomain}
                                                .ssi
                                            </div>
                                        </div>
                                        {/* @review: it needs more testing to make sure that the resolved addres is correct<div
                                                style={{
                                                    marginTop: '20px',
                                                    marginBottom: '20px',
                                                }}
                                                className={styles.addrSsi}
                                                onClick={goToDidx}
                                            >
                                                {loadingDidx ? (
                                                    <span
                                                        className={
                                                            styles.txtDomain
                                                        }
                                                    >
                                                        <ThreeDots color="basic" />
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={
                                                            styles.txtDomain
                                                        }
                                                    >
                                                        DIDxWALLET
                                                    </span>
                                                )}
                                            </div> */}
                                        <br />
                                        <div className={styles.icoWrapper}>
                                            <div className={styles.icon}>
                                                <Image
                                                    src={iconExplorer}
                                                    alt="acc-icon"
                                                    height="26"
                                                    width="26"
                                                />
                                            </div>
                                            {loggedInAddress !== null && (
                                                <a
                                                    className={styles.txtList}
                                                    href={
                                                        net === 'testnet'
                                                            ? `https://viewblock.io/zilliqa/address/${zcrypto.toBech32Address(
                                                                  loginInfo?.loggedInAddress!
                                                              )}?network=${net}`
                                                            : `https://viewblock.io/zilliqa/address/${zcrypto.toBech32Address(
                                                                  loginInfo?.loggedInAddress
                                                              )}`
                                                    }
                                                    rel="noreferrer"
                                                    target="_blank"
                                                >
                                                    Block Explorer
                                                    {/* did:tyron:zil:0x...
                                                            {loginInfo.address.slice(
                                                                -10
                                                            )} */}
                                                </a>
                                            )}
                                        </div>
                                        {/* @reviewed: hide DID domain */}
                                        {/* <div
                                                style={{
                                                    marginTop: '20px',
                                                    marginBottom: '20px',
                                                }}
                                                className={styles.txtDomain}
                                            >
                                                <span
                                                    onClick={() => {
                                                        resolveDid(
                                                            loginInfo.username,
                                                            'did'
                                                        )
                                                        updateModalDashboard(
                                                            false
                                                        )
                                                    }}
                                                >
                                                    {loginInfo?.username}
                                                    .did
                                                </span>{' '}
                                            </div> */}
                                    </>
                                ) : (
                                    <div
                                        className={styles.txtDomain}
                                        onClick={() => {
                                            updateModalDashboard(false)
                                            updateShowSearchBar(false)
                                            navigate('/address')
                                        }}
                                    >
                                        did:tyron:zil...
                                        {loggedInAddress &&
                                            loggedInAddress.slice(-10)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                    {loggedInDomain !== '' && (
                        <>
                            <div
                                className={styles.toggleMenuWrapper2}
                                onClick={() => menuActive('nftUsername')}
                            >
                                <div className={styles.icoWrapper}>
                                    <div className={styles.icon}>
                                        <Image
                                            src={iconDoms}
                                            alt="acc-icon"
                                            height="26"
                                            width="26"
                                        />
                                    </div>
                                    <div className={styles.txtList}>
                                        {t('NFT USERNAMES')}
                                    </div>
                                </div>
                                <div className={styles.arrowIco}>
                                    <Image
                                        alt="arrow-ico"
                                        src={
                                            menu === 'nftUsername'
                                                ? ArrowUp
                                                : ArrowDown
                                        }
                                    />
                                </div>
                            </div>
                            {menu === 'nftUsername' && (
                                <div
                                    style={{
                                        marginLeft: '6%',
                                        marginBottom: '7%',
                                    }}
                                >
                                    {loadingList ? (
                                        spinner
                                    ) : (
                                        <>
                                            {nftUsername.length > 0 ? (
                                                <div>
                                                    <p
                                                        style={{
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        Your DIDxWALLET holds{' '}
                                                        {nftUsername.length}{' '}
                                                        <span
                                                            className={
                                                                styles.addrSsi
                                                            }
                                                        >
                                                            domains
                                                        </span>
                                                    </p>
                                                    {/* {nftUsername?.map(
                                                            (val) => (
                                                                <div
                                                                    onClick={() => {
                                                                        resolveDid(
                                                                            val,
                                                                            'did'
                                                                        )
                                                                        updateModalDashboard(
                                                                            false
                                                                        )
                                                                    }}
                                                                    key={val}
                                                                    className={
                                                                        styles.txtDomainList
                                                                    }
                                                                >
                                                                    {val}
                                                                </div>
                                                            )
                                                        )} */}
                                                </div>
                                            ) : (
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    No other NFT
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {/* @dev: subdomains menu */}
                            <div
                                className={styles.toggleMenuWrapper2}
                                onClick={() => menuActive('didDomains')}
                            >
                                <div className={styles.icoWrapper}>
                                    <div className={styles.icon}>
                                        <Image
                                            src={iconSubs}
                                            alt="acc-icon"
                                            height="26"
                                            width="26"
                                        />
                                    </div>
                                    <div className={styles.txtList}>
                                        {t('SUBDOMAINS')}
                                    </div>
                                </div>
                                <div className={styles.arrowIco}>
                                    <Image
                                        alt="arrow-ico"
                                        src={
                                            menu === 'didDomains'
                                                ? ArrowUp
                                                : ArrowDown
                                        }
                                    />
                                </div>
                            </div>
                            {menu === 'didDomains' && (
                                <div
                                    style={{
                                        marginLeft: '6%',
                                        marginBottom: '7%',
                                    }}
                                >
                                    {loadingList ? (
                                        spinner
                                    ) : (
                                        <>
                                            {didDomain.length > 0 ? (
                                                <div>
                                                    {didDomain?.map((val) => (
                                                        <div key={val}>
                                                            {val !== 'did' && (
                                                                <div
                                                                    onClick={() => {
                                                                        Router.push(
                                                                            `/`
                                                                        )
                                                                        updateResolvedInfo(
                                                                            {
                                                                                user_tld:
                                                                                    '',
                                                                                user_domain:
                                                                                    loggedInDomain,
                                                                                user_subdomain:
                                                                                    val,
                                                                            }
                                                                        )
                                                                        updateModalDashboard(
                                                                            false
                                                                        )
                                                                        Router.push(
                                                                            `/${val}@${loggedInDomain}.ssi`
                                                                        )
                                                                    }}
                                                                    key={val}
                                                                    className={
                                                                        styles.txtDomainList
                                                                    }
                                                                >
                                                                    {val}@
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {t('DID_NO_DOMAINS')}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
                {loggedInAddress !== null && (
                    <>
                        <div
                            className={styles.toggleHeaderWrapper}
                            onClick={() => subMenuActive('newUsers')}
                        >
                            <div className={styles.icoWrapper}>
                                <div className={styles.iconToggle}>
                                    <Image
                                        src={iconDefi}
                                        alt="acc-icon"
                                        height="29"
                                        width="29"
                                    />
                                </div>
                                <div className={styles.title}>
                                    {t('DEFI ACCOUNT')}
                                </div>
                            </div>
                            <div className={styles.iconToggle}>
                                <Image
                                    alt="arrow-ico"
                                    src={
                                        subMenu === 'newUsers'
                                            ? MinusIcon
                                            : AddIcon
                                    }
                                    height="17"
                                    width="17"
                                />
                            </div>
                        </div>
                        {subMenu === 'newUsers' && (
                            <>
                                <div className={styles.newSsiSub}>
                                    {t('Create a new XWallet:')}
                                </div>
                                <div className={styles.wrapperNewWallet}>
                                    {/* @reviewed: remove DIDx for registered users */}
                                    {/* <div
                                            style={{
                                                width: '100%',
                                                marginTop: '0.5rem',
                                            }}
                                            onClick={() => newWallet('DIDx')}
                                            className={
                                                isLight
                                                    ? 'actionBtnLight'
                                                    : 'actionBtn'
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.txtBtnNewWallet
                                                }
                                            >
                                                {t('CREATE_SSI')}
                                            </div>
                                        </div> */}
                                    {/* <h5 className={styles.titleGas}>
                                        {t('GAS_AROUND')} 1 ZIL @todo-t decidir que info dar con respecto al gas
                                        </h5> */}
                                    <div
                                        style={{
                                            width: '100%',
                                            marginTop: '0.5rem',
                                        }}
                                        onClick={() => {
                                            // if (net === 'testnet') {
                                            updateNewDefiModal(true)
                                            updateModalDashboard(false)
                                            // } else {
                                            //     alert(
                                            //         'Only available on testnet. It is coming to mainnet very soon!'
                                            //     )
                                            // }
                                            // newWallet(
                                            //     'Decentralised Finance xWALLET'
                                            // )
                                        }}
                                        className={
                                            isLight
                                                ? 'actionBtnLight'
                                                : 'actionBtn'
                                        }
                                    >
                                        <div className={styles.txtBtnNewWallet}>
                                            DEFIxWALLET
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
                {/* @dev: LOG IN */}
                {loggedInAddress === null && (
                    <>
                        <div
                            className={styles.toggleHeaderWrapper}
                            onClick={() => menuActive('login')}
                        >
                            <div className={styles.icoWrapper}>
                                <Image
                                    src={iconSSI}
                                    alt="acc-icon"
                                    height="29"
                                    width="29"
                                />
                                <div className={styles.title}>
                                    {t('LOG IN')}
                                </div>
                            </div>
                            <div>
                                <Image
                                    alt="arrow-ico"
                                    src={menu === 'login' ? MinusIcon : AddIcon}
                                    height="17"
                                    width="17"
                                />
                            </div>
                        </div>
                        {menu === 'login' && (
                            <div className={styles.loginWrapper}>
                                <div
                                    className={styles.toggleMenuWrapper}
                                    onClick={() =>
                                        subMenuActive('existingUsers')
                                    }
                                >
                                    <div className={styles.title3}>
                                        {t('EXISTING SSI')}
                                    </div>
                                    <div className={styles.arrowIco}>
                                        <Image
                                            alt="arrow-ico"
                                            src={
                                                subMenu === 'existingUsers'
                                                    ? ArrowUp
                                                    : ArrowDown
                                            }
                                        />
                                    </div>
                                </div>
                                {subMenu === 'existingUsers' && (
                                    <div
                                        style={{
                                            marginBottom: '5%',
                                            marginLeft: '6%',
                                        }}
                                    >
                                        <div className={styles.inputWrapper}>
                                            <h5 className={styles.txtInput}>
                                                {t('DOMAIN NAME')}
                                            </h5>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <input
                                                    disabled={
                                                        existingAddr !== ''
                                                    }
                                                    value={existingUser}
                                                    onChange={
                                                        handleOnChangeUsername
                                                    }
                                                    onKeyPress={
                                                        handleOnKeyPress
                                                    }
                                                    className={
                                                        existingAddr !== ''
                                                            ? styles.inputDisabled
                                                            : styles.input
                                                    }
                                                />
                                                <div
                                                    style={{
                                                        marginLeft: '5%',
                                                        display: 'flex',
                                                    }}
                                                    onClick={continueLogIn}
                                                >
                                                    {loading &&
                                                    existingAddr === '' ? (
                                                        <>{spinner}</>
                                                    ) : (
                                                        <Arrow />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {/* @reviewed: less is more */}
                                        {/* <h6 className={styles.txtOr}>
                                                {t('OR')}
                                            </h6>
                                            <div
                                                className={styles.inputWrapper}
                                            >
                                                <h5 className={styles.txtInput}>
                                                    {t('ADDRESS')}
                                                </h5>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <input
                                                        disabled={
                                                            existingUser !== ''
                                                        }
                                                        value={existingAddr}
                                                        onChange={
                                                            handleOnChangeAddr
                                                        }
                                                        onKeyPress={
                                                            handleOnKeyPress
                                                        }
                                                        className={
                                                            existingUser !== ''
                                                                ? styles.inputDisabled
                                                                : styles.input
                                                        }
                                                    />
                                                    <div
                                                        style={{
                                                            marginLeft: '5%',
                                                            display: 'flex',
                                                        }}
                                                        onClick={continueLogIn}
                                                    >
                                                        {loading &&
                                                            existingUser === '' ? (
                                                            <>{spinner}</>
                                                        ) : (
                                                            <Arrow />
                                                        )}
                                                    </div>
                                                </div>
                                            </div> */}
                                    </div>
                                )}
                                <div
                                    className={styles.toggleMenuWrapper}
                                    onClick={() => subMenuActive('newUsers')}
                                >
                                    <div className={styles.title3}>
                                        {t('NEW SSI')}
                                    </div>
                                    <div className={styles.arrowIco}>
                                        <Image
                                            alt="arrow-ico"
                                            src={
                                                subMenu === 'newUsers'
                                                    ? ArrowUp
                                                    : ArrowDown
                                            }
                                        />
                                    </div>
                                </div>
                                {subMenu === 'newUsers' && (
                                    <div className={styles.wrapperNewSsi}>
                                        <div className={styles.newSsiSub}>
                                            <h5>{t('CREATE SSI ACCOUNT')}:</h5>
                                        </div>
                                        <div
                                            style={{
                                                width: '100%',
                                                marginTop: '0.5rem',
                                            }}
                                            onClick={async () => {
                                                await connect().then(() => {
                                                    newWallet('DIDx')
                                                })
                                            }}
                                            className={
                                                isLight
                                                    ? 'actionBtnLight'
                                                    : 'actionBtn'
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.txtBtnNewWallet
                                                }
                                            >
                                                {t('CREATE DIDxWALLET')}
                                            </div>
                                        </div>
                                        <h5 className={styles.titleGas}>
                                            {t('GAS_AROUND')} 1 ZIL
                                        </h5>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
                {/* @dev: EOA */}
                <div
                    className={styles.toggleHeaderWrapper}
                    onClick={() => {
                        updateShowZilpay(true)
                        menuActive('eoa')
                    }}
                >
                    <div className={styles.icoWrapper}>
                        <div className={styles.iconToggle}>
                            <Image
                                src={iconWallets}
                                alt="acc-icon"
                                height="29"
                                width="29"
                            />
                        </div>
                        <div className={styles.title}>
                            {t('EXTERNAL WALLETS')}
                        </div>
                    </div>
                    <div className={styles.iconToggle}>
                        <Image
                            alt="arrow-ico"
                            src={menu === 'eoa' ? MinusIcon : AddIcon}
                            height="17"
                            width="17"
                        />
                    </div>
                </div>
                {menu === 'eoa' && (
                    <>
                        <div className={styles.wrapperEoa}>
                            <Image
                                width={25}
                                height={25}
                                src={ZilpayIcon}
                                alt="zilpay-ico"
                            />
                            <div className={styles.txtEoa}>
                                {t('ZILLIQA WALLET')}
                            </div>
                            <div
                                onClick={() => logOff()}
                                className={styles.txtDisconnect}
                            >
                                {/** @review: zilpay remove connection, disconnect key button */}
                                {t('DISCONNECT')}
                            </div>
                        </div>
                        <div
                            style={{
                                marginTop: '2%',
                                marginLeft: '3%',
                            }}
                        >
                            <a
                                href={
                                    net === 'testnet'
                                        ? `https://viewblock.io/zilliqa/address/${loginInfo.zilAddr?.bech32}?network=${net}`
                                        : `https://viewblock.io/zilliqa/address/${loginInfo.zilAddr?.bech32}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className={styles.txtAddress}
                            >
                                {loginInfo.zilAddr?.bech32}
                            </a>
                        </div>
                        <br />
                        {loginInfo.arAddr ? (
                            <>
                                <div className={styles.wrapperEoa}>
                                    <Image
                                        width={25}
                                        height={25}
                                        src={ArConnectIcon}
                                        alt="arconnect-ico"
                                    />
                                    <div className={styles.txtEoa}>
                                        {t('ARWEAVE WALLET')}
                                    </div>
                                    <div
                                        onClick={() => disconnect()}
                                        className={styles.txtDisconnect}
                                    >
                                        {t('DISCONNECT')}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: '1%',
                                        marginLeft: '3%',
                                    }}
                                >
                                    <div
                                        style={{ marginBottom: '2rem' }}
                                        onClick={() =>
                                            window.open(
                                                `https://viewblock.io/arweave/address/${loginInfo.arAddr}`
                                            )
                                        }
                                        className={styles.txtAddress}
                                    >
                                        {loginInfo.arAddr}{' '}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div
                                style={{ marginBottom: '5%' }}
                                className={styles.wrapperEoa}
                            >
                                <button
                                    onClick={connect}
                                    className={`button small ${
                                        isLight
                                            ? toastTheme(isLight)
                                            : 'secondary'
                                    }`}
                                >
                                    <span className={styles.txtBtnArConnect}>
                                        {t('CONNECT_WITH_ARCONNECT')}
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                )}
                {/* @dev: LOG OFF */}
                {loggedInAddress !== null && (
                    <div onClick={logOff} className={styles.wrapperLogout}>
                        <div className={styles.logOffIco}>
                            <Image alt="log-off" src={LogOffIcon} />
                        </div>
                        <div
                            className={styles.txt}
                            style={{
                                marginLeft: '5%',
                                marginTop: '-2px',
                            }}
                        >
                            {t('LOG OFF')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
