import React, { useState } from 'react'
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
    $modalBuyNft,
    updateDashboardState,
    updateModalDashboard,
    updateModalTx,
    updateModalBuyNft,
    updateModalTxMinimized,
} from '../../../src/store/modal'
import {
    setTxId,
    setTxStatusLoading,
    updateLoginInfoAddress,
    updateLoginInfoUsername,
    updateLoginInfoZilpay,
    updateLoginInfoArAddress,
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
import ContinueArrow from '../../../src/assets/icons/continue_arrow.svg'
import * as tyron from 'tyron'
import useArConnect from '../../../src/hooks/useArConnect'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { updateBuyInfo } from '../../../src/store/buyInfo'
import { useTranslation } from 'next-i18next'
import { updateLoading } from '../../../src/store/loading'
import { updateResolvedInfo } from '../../../src/store/resolvedInfo'
import routerHook from '../../../src/hooks/router'
import { Spinner } from '../..'
import smartContract from '../../../src/utils/smartContract'
import { $arconnect, updateArConnect } from '../../../src/store/arconnect'
import toastTheme from '../../../src/hooks/toastTheme'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { connect, disconnect } = useArConnect()
    const { navigate } = routerHook()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const Router = useRouter()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const net = useSelector((state: RootState) => state.modal.net)
    const arconnect = useStore($arconnect)
    const modalDashboard = useStore($modalDashboard)
    const modalBuyNft = useStore($modalBuyNft)
    const [existingUsername, setExistingUsername] = useState('')
    const [existingAddr, setExistingAddr] = useState('')
    const [menu, setMenu] = useState('')
    const [subMenu, setSubMenu] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingSsi, setLoadingSsi] = useState(false)
    const [didDomain, setDidDomain] = useState(Array())
    const [nftUsername, setNftUsername] = useState(Array())
    const [loadingList, setLoadingList] = useState(false)
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
        setExistingUsername(value.toLowerCase())
    }

    const resolveUsername = async () => {
        setLoading(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, existingUsername, 'did')
            .then(async (addr) => {
                await tyron.SearchBarUtil.default
                    .Resolve(net, addr)
                    .then(async (result: any) => {
                        const did_controller = zcrypto.toChecksumAddress(
                            result.controller
                        )
                        if (did_controller !== loginInfo.zilAddr?.base16) {
                            setLoading(false)
                            toast.error(
                                `Only ${existingUsername}'s DID Controller can log in to ${existingUsername}.`,
                                {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                }
                            )
                        } else {
                            connect()
                                .then(() => {
                                    dispatch(
                                        updateLoginInfoAddress(
                                            zcrypto.toChecksumAddress(addr)
                                        )
                                    )
                                    dispatch(
                                        updateLoginInfoUsername(
                                            existingUsername
                                        )
                                    )
                                    updateDashboardState('loggedIn')
                                    updateModalDashboard(false)
                                    setMenu('')
                                    setSubMenu('')
                                    setExistingUsername('')
                                    setExistingAddr('')
                                    setLoading(false)
                                    if (!modalBuyNft) {
                                        Router.push(`/${existingUsername}`)
                                    }
                                })
                                .catch(() => {
                                    throw new Error('ArConnect is missing.')
                                })
                        }
                    })
            })
            .catch(() => {
                setLoading(false)
                toast.error(`Wrong username.`, {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
            })
    }

    const handleOnChangeAddr = (event: { target: { value: any } }) => {
        setExistingAddr(event.target.value)
    }

    const resolveExistingAddr = async () => {
        const addr = tyron.Address.default.verification(existingAddr)
        if (addr !== '') {
            try {
                setLoading(true)
                const res_v = await getSmartContract(addr, 'version')
                const version = res_v.result.version
                const res_c = await getSmartContract(addr, 'controller')
                const controller = zcrypto.toChecksumAddress(
                    res_c.result.controller
                )
                if (version.slice(0, 7) !== 'xwallet') {
                    toast.error('Unsupported version.', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                    })
                    setLoading(false)
                } else if (controller !== loginInfo.zilAddr?.base16) {
                    toast.error(
                        `Only ${existingAddr.slice(
                            0,
                            7
                        )}'s DID Controller can log in to this SSI.`,
                        {
                            position: 'top-right',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                        }
                    )
                    setLoading(false)
                } else {
                    connect()
                        .then(() => {
                            dispatch(updateLoginInfoAddress(addr))
                            updateDashboardState('loggedIn')
                            updateModalDashboard(false)
                            setMenu('')
                            setSubMenu('')
                            setExistingUsername('')
                            setExistingAddr('')
                            navigate('/address')
                        })
                        .catch(() => {
                            toast.error('ArConnect is missing.', {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                            })
                        })
                    setLoading(false)
                }
            } catch (error) {
                setLoading(false)
                toast.error(`Unsupported.`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
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
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }

    const newSsi = async () => {
        try {
            if (loginInfo.zilAddr !== null && net !== null) {
                setLoadingSsi(true)
                if (loginInfo.arAddr === null) {
                    await connect()
                } else {
                    const zilpay = new ZilPayBase()
                    let tx = await tyron.Init.default.transaction(net)
                    updateModalDashboard(false)
                    dispatch(setTxStatusLoading('true'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    await zilpay
                        .deployDid(net, loginInfo.zilAddr?.base16, arconnect)
                        .then(async (deploy: any) => {
                            dispatch(setTxId(deploy[0].ID))
                            dispatch(setTxStatusLoading('submitted'))

                            tx = await tx.confirm(deploy[0].ID)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                setTimeout(() => {
                                    window.open(
                                        `https://v2.viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
                                    )
                                }, 1000)
                                let new_ssi = deploy[1].address
                                new_ssi = zcrypto.toChecksumAddress(new_ssi)
                                updateBuyInfo(null)
                                dispatch(updateLoginInfoUsername(null!))
                                dispatch(
                                    updateLoginInfoAddress(
                                        zcrypto.toChecksumAddress(new_ssi)
                                    )
                                )
                                updateDashboardState('loggedIn')
                                updateModalTx(false)
                                updateModalBuyNft(false)
                                Router.push('/address')
                            } else if (tx.isRejected()) {
                                setLoadingSsi(false)
                                dispatch(setTxStatusLoading('failed'))
                            }
                        })
                        .catch((error) => {
                            throw error
                        })
                }
            } else {
                toast.warning('Connect your ZilPay wallet.', {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
            }
        } catch (error) {
            setLoadingSsi(false)
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.error(String(error), {
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
    }

    const continueLogIn = () => {
        // if (modalDashboard && loginInfo.arAddr !== null) {
        //   toast.info(
        //     `Arweave wallet connected to ${loginInfo.arAddr.slice(
        //       0,
        //       6
        //     )}...${loginInfo.arAddr.slice(-6)}`,
        //     {
        //       position: "top-center",
        //       autoClose: 2000,
        //       hideProgressBar: false,
        //       closeOnClick: true,
        //       pauseOnHover: true,
        //       draggable: true,
        //       progress: undefined,
        //       theme: "dark",
        //       toastId: 2,
        //     }
        //   );
        // }
        // if (arconnect === null) {
        //    connect();
        // }
        if (existingUsername === '') {
            resolveExistingAddr()
        } else {
            resolveUsername()
        }
    }

    const logOff = () => {
        disconnect()
        updateResolvedInfo(null)
        dispatch(updateLoginInfoAddress(null!))
        dispatch(updateLoginInfoUsername(null!))
        dispatch(updateLoginInfoZilpay(null!))
        updateDashboardState(null)
        dispatch(updateLoginInfoArAddress(null!))
        dispatch(setTxId(''))
        updateArConnect(null)
        updateModalDashboard(false)
        updateBuyInfo(null)
        Router.push('/')
        setTimeout(() => {
            toast(t('You have logged off'), {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }, 1000)
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
                const addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    loginInfo.username,
                    'did'
                )
                getSmartContract(addr, 'did_domain_dns').then(async (res) => {
                    const key = Object.keys(res.result.did_domain_dns)
                    setDidDomain(key)
                })
                setTimeout(() => {
                    setLoadingList(false)
                }, 1000)
            } else if (val === 'nftUsername') {
                setLoadingList(true)
                setMenu(val)
                const addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                const get_services = await getSmartContract(addr, 'services')
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )
                getSmartContract(services.get('init'), 'did_dns').then(
                    async (res) => {
                        const val = Object.values(res.result.did_dns)
                        const key = Object.keys(res.result.did_dns)
                        let list: any = []
                        for (let i = 0; i < val.length; i += 1) {
                            if (val[i] === loginInfo.address.toLowerCase()) {
                                list.push(key[i])
                            }
                        }
                        setNftUsername(list)
                    }
                )
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.info('Address copied to clipboard', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: toastTheme(isLight),
        })
    }

    const resolveDid = async (_username: string, _domain: string) => {
        updateLoading(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username, _domain)
            .then(async (addr) => {
                const res = await getSmartContract(addr, 'version')
                const version = res.result.version.slice(0, 8)
                setLoading(false)
                updateLoading(false)
                updateResolvedInfo({
                    name: _username,
                    domain: _domain,
                    addr: addr,
                    version: res.result.version,
                })
                switch (version) {
                    case 'xwallet-':
                        Router.push(`/${_username}`)
                        break
                    case 'zilstake':
                        Router.push(`/${_username}/zil`)
                        break
                    default:
                        Router.push(`/${_username}`)
                        setTimeout(() => {
                            toast.error('Unregistered DID Domain.', {
                                position: 'top-right',
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                            })
                        }, 1000)
                }
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
                    theme: toastTheme(isLight),
                })
                updateLoading(false)
            })
    }

    const spinner = <Spinner />

    if (!modalDashboard) {
        return null
    }

    return (
        <>
            <>
                <div className={styles.container}>
                    <div
                        className={styles.containerClose}
                        onClick={() => updateModalDashboard(false)}
                    />
                    <div className={styles.innerContainer}>
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
                        <div style={{ marginBottom: '30px' }}>
                            {loginInfo.address !== null ? (
                                <>
                                    <h6 className={styles.title1}>
                                        {t('YOU_HAVE_LOGGED_IN_SSI')}
                                    </h6>
                                    <div className={styles.addrWrapper}>
                                        {loginInfo.username ? (
                                            <>
                                                <p
                                                    className={styles.addr}
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
                                                    <span
                                                        className={
                                                            styles.txtDomain
                                                        }
                                                    >
                                                        {loginInfo?.username}
                                                        .did
                                                    </span>
                                                </p>
                                                <div
                                                    style={{ marginTop: '-5%' }}
                                                    className={styles.addrSsi}
                                                >
                                                    <a
                                                        className={
                                                            styles.txtDomain
                                                        }
                                                        href={`https://v2.viewblock.io/zilliqa/address/${loginInfo?.address}?network=${net}`}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        <span
                                                            className={
                                                                styles.txtDomain
                                                            }
                                                        >
                                                            did:tyron:zil...
                                                            {loginInfo.address.slice(
                                                                -10
                                                            )}
                                                        </span>
                                                    </a>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={styles.addrSsi}>
                                                <a
                                                    className={styles.txtDomain}
                                                    onClick={() => {
                                                        updateModalDashboard(
                                                            false
                                                        )
                                                        navigate('/address')
                                                    }}
                                                >
                                                    <span
                                                        className={
                                                            styles.txtDomain
                                                        }
                                                    >
                                                        did:tyron:zil...
                                                        {loginInfo.address.slice(
                                                            -10
                                                        )}
                                                    </span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                            {loginInfo?.username !== null && (
                                <>
                                    <div
                                        className={styles.toggleMenuWrapper2}
                                        onClick={() =>
                                            menuActive('nftUsername')
                                        }
                                    >
                                        <div className={styles.txtList}>
                                            {t('NFT USERNAMES')}
                                        </div>
                                        <div style={{ marginTop: '5px' }}>
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
                                                            {nftUsername?.map(
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
                                                                        key={
                                                                            val
                                                                        }
                                                                        className={
                                                                            styles.txtDomainList
                                                                        }
                                                                    >
                                                                        {val}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <code
                                                            style={{
                                                                fontSize:
                                                                    '14px',
                                                            }}
                                                        >
                                                            No Username
                                                            Available
                                                        </code>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <div
                                        className={styles.toggleMenuWrapper2}
                                        onClick={() => menuActive('didDomains')}
                                    >
                                        <div className={styles.txtList}>
                                            {t('DID_DOMAIN')}
                                        </div>
                                        <div style={{ marginTop: '5px' }}>
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
                                                            {didDomain?.map(
                                                                (val) => (
                                                                    <div
                                                                        onClick={() => {
                                                                            resolveDid(
                                                                                loginInfo.username,
                                                                                val
                                                                            )
                                                                            updateModalDashboard(
                                                                                false
                                                                            )
                                                                        }}
                                                                        key={
                                                                            val
                                                                        }
                                                                        className={
                                                                            styles.txtDomainList
                                                                        }
                                                                    >
                                                                        @{val}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <code
                                                            style={{
                                                                fontSize:
                                                                    '14px',
                                                            }}
                                                        >
                                                            {t(
                                                                'DID_NO_DOMAINS'
                                                            )}
                                                        </code>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div>
                            <div
                                className={styles.toggleHeaderWrapper}
                                onClick={() => menuActive('eoa')}
                            >
                                <h6 className={styles.title2}>
                                    {t('EXTERNAL_WALLETS')}
                                </h6>
                                <Image
                                    alt="arrow-ico"
                                    src={menu === 'eoa' ? MinusIcon : AddIcon}
                                />
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
                                            {t('ZILLIQA_WALLET')}
                                        </div>
                                        <div
                                            onClick={
                                                () => logOff()
                                                // toast(t('Coming soon'), {
                                                //     position: 'top-center',
                                                //     autoClose: 2000,
                                                //     hideProgressBar: false,
                                                //     closeOnClick: true,
                                                //     pauseOnHover: true,
                                                //     draggable: true,
                                                //     progress: undefined,
                                                //     theme: toastTheme(isLight),
                                                // })
                                            }
                                            className={styles.txtDisconnect}
                                        >
                                            {/** @todo-checked disconnect only zilpay - coming soon! */}
                                            {t('DISCONNECT')}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: '1%',
                                            marginBottom: '5%',
                                            marginLeft: '3%',
                                        }}
                                    >
                                        <a
                                            href={`https://v2.viewblock.io/zilliqa/address/${loginInfo.zilAddr?.bech32}?network=${net}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.txtAddress}
                                        >
                                            {loginInfo.zilAddr?.bech32}
                                        </a>
                                    </div>
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
                                                    {t('ARWEAVE_WALLET')}
                                                </div>
                                                <div
                                                    onClick={() => disconnect()}
                                                    className={
                                                        styles.txtDisconnect
                                                    }
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
                                                <p
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            loginInfo.arAddr
                                                        )
                                                    }
                                                    className={
                                                        styles.txtAddress
                                                    }
                                                >
                                                    {loginInfo.arAddr}{' '}
                                                </p>
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
                                                <span
                                                    className={
                                                        styles.txtBtnArConnect
                                                    }
                                                >
                                                    {t(
                                                        'CONNECT_WITH_ARCONNECT'
                                                    )}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {loginInfo.address === null && (
                            <div style={{ marginTop: '5%' }}>
                                <div
                                    className={styles.toggleHeaderWrapper}
                                    onClick={() => menuActive('login')}
                                >
                                    <h6 className={styles.title2}>
                                        {t('LOG_IN')}
                                    </h6>
                                    <Image
                                        alt="arrow-ico"
                                        src={
                                            menu === 'login'
                                                ? MinusIcon
                                                : AddIcon
                                        }
                                    />
                                </div>
                                {menu === 'login' && (
                                    <>
                                        <div
                                            className={styles.toggleMenuWrapper}
                                            onClick={() =>
                                                subMenuActive('existingUsers')
                                            }
                                        >
                                            <p className={styles.title3}>
                                                {t('EXISTING_USER')}
                                            </p>
                                            <Image
                                                alt="arrow-ico"
                                                src={
                                                    subMenu === 'existingUsers'
                                                        ? ArrowUp
                                                        : ArrowDown
                                                }
                                            />
                                        </div>
                                        {subMenu === 'existingUsers' && (
                                            <div
                                                style={{
                                                    marginBottom: '5%',
                                                    marginLeft: '6%',
                                                }}
                                            >
                                                <div
                                                    className={
                                                        styles.inputWrapper
                                                    }
                                                >
                                                    <h5
                                                        className={styles.txt}
                                                        style={{
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        {t('NFT_USERNAME')}
                                                    </h5>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <input
                                                            disabled={
                                                                existingAddr !==
                                                                ''
                                                            }
                                                            value={
                                                                existingUsername
                                                            }
                                                            onChange={
                                                                handleOnChangeUsername
                                                            }
                                                            onKeyPress={
                                                                handleOnKeyPress
                                                            }
                                                            className={
                                                                existingAddr !==
                                                                ''
                                                                    ? styles.inputDisabled
                                                                    : styles.input
                                                            }
                                                        />
                                                        <div
                                                            style={{
                                                                marginLeft:
                                                                    '5%',
                                                                display: 'flex',
                                                            }}
                                                            onClick={
                                                                continueLogIn
                                                            }
                                                        >
                                                            {loading &&
                                                            existingAddr ===
                                                                '' ? (
                                                                <>{spinner}</>
                                                            ) : (
                                                                <div className="continueBtn">
                                                                    <Image
                                                                        src={
                                                                            ContinueArrow
                                                                        }
                                                                        alt="continue"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <h6 className={styles.txtOr}>
                                                    {t('OR')}
                                                </h6>
                                                <div
                                                    className={
                                                        styles.inputWrapper
                                                    }
                                                >
                                                    <h5
                                                        className={styles.txt}
                                                        style={{
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        {t('ADDRESS')}
                                                    </h5>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <input
                                                            disabled={
                                                                existingUsername !==
                                                                ''
                                                            }
                                                            onChange={
                                                                handleOnChangeAddr
                                                            }
                                                            onKeyPress={
                                                                handleOnKeyPress
                                                            }
                                                            className={
                                                                existingUsername !==
                                                                ''
                                                                    ? styles.inputDisabled
                                                                    : styles.input
                                                            }
                                                        />
                                                        <div
                                                            style={{
                                                                marginLeft:
                                                                    '5%',
                                                                display: 'flex',
                                                            }}
                                                            onClick={
                                                                continueLogIn
                                                            }
                                                        >
                                                            {loading &&
                                                            existingUsername ===
                                                                '' ? (
                                                                <>{spinner}</>
                                                            ) : (
                                                                <div className="continueBtn">
                                                                    <Image
                                                                        src={
                                                                            ContinueArrow
                                                                        }
                                                                        alt="continue"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* @todo-x 
                                            <h6 className={styles.txtOr}>
                                                {t('OR')}
                                            </h6> */}
                                                {/* <div>
                                                <h5
                                                    style={{ fontSize: '14px' }}
                                                >
                                                    {t('ADDRESS')}
                                                </h5>
                                                <input
                                                    disabled={input !== ''}
                                                    onChange={handleInputB}
                                                    onKeyPress={
                                                        handleOnKeyPress
                                                    }
                                                    className={
                                                        input !== ''
                                                            ? styles.inputDisabled
                                                            : styles.input
                                                    }
                                                />
                                            </div> */}
                                                {/* <div
                                                className={
                                                    styles.btnContinueWrapper
                                                }
                                            >
                                                {loading ? (
                                                    <>{spinner}</>
                                                ):(
                                                    <div
                                                    onClick={continueLogIn}
                                                    className={isLight ? "actionBtnLight" : "actionBtn"}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize:
                                                                '16px',
                                                        }}
                                                    >
                                                        {t('CONTINUE')}
                                                    </div>
                                                </div>
                                                )}
                                            </div> */}
                                            </div>
                                        )}
                                        <div
                                            className={styles.toggleMenuWrapper}
                                            onClick={() =>
                                                subMenuActive('newUsers')
                                            }
                                        >
                                            <p className={styles.title3}>
                                                {t('NEW_USER_CREATE_SSI')}
                                            </p>
                                            <Image
                                                alt="arrow-ico"
                                                src={
                                                    subMenu === 'newUsers'
                                                        ? ArrowUp
                                                        : ArrowDown
                                                }
                                            />
                                        </div>
                                        {subMenu === 'newUsers' && (
                                            <div
                                                className={styles.wrapperNewSsi}
                                            >
                                                <p>
                                                    <code
                                                        className={
                                                            styles.newSsiSub
                                                        }
                                                    >
                                                        {t('DEPLOY_NEW_SSI')}
                                                    </code>
                                                </p>
                                                <div
                                                    style={{ width: '100%' }}
                                                    onClick={newSsi}
                                                    className={
                                                        isLight
                                                            ? 'actionBtnLight'
                                                            : 'actionBtn'
                                                    }
                                                >
                                                    {loadingSsi ? (
                                                        <div
                                                            className={
                                                                styles.txtBtnNewSsi
                                                            }
                                                        >
                                                            {t(
                                                                'CLICK_TO_CONTINUE'
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.txtBtnNewSsi
                                                            }
                                                        >
                                                            {t('CREATE_SSI')}
                                                        </div>
                                                    )}
                                                </div>
                                                <h5 className={styles.titleGas}>
                                                    {t('GAS_AROUND')} 1 ZIL
                                                </h5>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                        {loginInfo.address !== null && (
                            <>
                                <div
                                    className={styles.toggleHeaderWrapper}
                                    onClick={() => subMenuActive('newUsers')}
                                >
                                    <h6 className={styles.title2}>
                                        {t('NEW_SSI')}
                                    </h6>
                                    <Image
                                        alt="arrow-ico"
                                        src={
                                            subMenu === 'newUsers'
                                                ? MinusIcon
                                                : AddIcon
                                        }
                                    />
                                </div>
                                {subMenu === 'newUsers' && (
                                    <div className={styles.wrapperNewSsi2}>
                                        <p>
                                            <code className={styles.newSsiSub}>
                                                {t('DEPLOY_NEW_SSI')}
                                            </code>
                                        </p>
                                        <div
                                            style={{ width: '100%' }}
                                            onClick={newSsi}
                                            className={
                                                isLight
                                                    ? 'actionBtnLight'
                                                    : 'actionBtn'
                                            }
                                        >
                                            {loadingSsi ? (
                                                <div
                                                    className={
                                                        styles.txtBtnNewSsi
                                                    }
                                                >
                                                    {t('CLICK_TO_CONTINUE')}
                                                </div>
                                            ) : (
                                                <div
                                                    className={
                                                        styles.txtBtnNewSsi
                                                    }
                                                >
                                                    {t('CREATE_SSI')}
                                                </div>
                                            )}
                                        </div>
                                        <h5 className={styles.titleGas}>
                                            {t('GAS_AROUND')} 1 ZIL
                                        </h5>
                                    </div>
                                )}
                                <div
                                    onClick={logOff}
                                    className={styles.wrapperLogout}
                                >
                                    <Image alt="log-off" src={LogOffIcon} />
                                    <div
                                        className={styles.txt}
                                        style={{
                                            marginLeft: '5%',
                                            marginTop: '-2px',
                                        }}
                                    >
                                        {t('LOG_OFF')}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </>
        </>
    )
}

export default Component
