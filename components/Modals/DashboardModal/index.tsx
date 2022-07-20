import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import styles from './styles.module.scss'
import { RootState } from '../../../src/app/reducers'
import { $arconnect } from '../../../src/store/arconnect'
import {
    $modalDashboard,
    $modalBuyNft,
    updateDashboardState,
    updateModalDashboard,
    updateModalNewSsi,
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
    UpdateResolvedInfo,
} from '../../../src/app/actions'
import ZilpayIcon from '../../../src/assets/logos/lg_zilpay.svg'
import ArrowDown from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import ArrowUp from '../../../src/assets/icons/dashboard_arrow_up_icon.svg'
import LogOffIcon from '../../../src/assets/icons/log_off.svg'
import ArConnectIcon from '../../../src/assets/logos/lg_arconnect.png'
import CloseIcon from '../../../src/assets/icons/ic_cross.svg'
import AddIcon from '../../../src/assets/icons/add_icon.svg'
import MinusIcon from '../../../src/assets/icons/minus_icon.svg'
import ContinueArrow from '../../../src/assets/icons/continue_arrow.svg'
import * as tyron from 'tyron'
import useArConnect from '../../../src/hooks/useArConnect'
import { updateLoggedIn } from '../../../src/store/loggedIn'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { updateBuyInfo } from '../../../src/store/buyInfo'
import { updateUser } from '../../../src/store/user'
import { useTranslation } from 'next-i18next'
import { DOMAINS } from '../../../src/constants/domains'
import { updateDoc } from '../../../src/store/did-doc'
import { updateLoading } from '../../../src/store/loading'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { connect, disconnect } = useArConnect()
    const dispatch = useDispatch()
    const Router = useRouter()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const net = useSelector((state: RootState) => state.modal.net)
    const arconnect = useStore($arconnect)
    const modalDashboard = useStore($modalDashboard)
    const modalBuyNft = useStore($modalBuyNft)
    const [input, setInput] = useState('')
    const [inputB, setInputB] = useState('')
    const [menu, setMenu] = useState('')
    const [subMenu, setSubMenu] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingSsi, setLoadingSsi] = useState(false)
    const [didDomain, setDidDomain] = useState(Array())
    const [loadingDomain, setLoadingDomain] = useState(false)
    const { t } = useTranslation()

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setInput(value.toLowerCase())
    }

    const handleInputB = (event: { target: { value: any } }) => {
        setInputB('')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
            setInputB(addr)
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

    const resolveUser = async () => {
        setLoading(true)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, input, 'did')
            .then(async (addr) => {
                await tyron.SearchBarUtil.default
                    .Resolve(net, addr)
                    .then(async (result: any) => {
                        const did_controller = result.controller.toLowerCase()
                        dispatch(
                            UpdateResolvedInfo({
                                addr: addr,
                                controller:
                                    zcrypto.toChecksumAddress(did_controller),
                                status: result.status,
                            })
                        )
                        let network = tyron.DidScheme.NetworkNamespace.Mainnet
                        if (net === 'testnet') {
                            network = tyron.DidScheme.NetworkNamespace.Testnet
                        }
                        const init = new tyron.ZilliqaInit.default(network)
                        const state =
                            await init.API.blockchain.getSmartContractState(
                                addr!
                            )
                        const get_controller = state.result.controller
                        const controller =
                            zcrypto.toChecksumAddress(get_controller)
                        if (controller !== loginInfo.zilAddr?.base16) {
                            setLoading(false)
                            toast.error(
                                `Only ${input}'s DID Controller can log in to ${input}.`,
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
                        } else {
                            connect()
                                .then(() => {
                                    updateLoggedIn({
                                        username: input,
                                        address: addr,
                                    })
                                    dispatch(updateLoginInfoAddress(addr))
                                    dispatch(updateLoginInfoUsername(input))
                                    updateDashboardState('loggedIn')
                                    updateModalDashboard(false)
                                    setMenu('')
                                    setSubMenu('')
                                    setInput('')
                                    setInputB('')
                                    setLoading(false)
                                    if (!modalBuyNft) {
                                        Router.push(`/${input}/did`)
                                        updateUser({
                                            name: input,
                                            domain: 'did',
                                        })
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
                    theme: 'dark',
                })
            })
    }

    const resolveAddr = async () => {
        setLoading(true)
        const zilpay = new ZilPayBase()
        await zilpay
            .getSubState(inputB, 'controller')
            .then((get_controller) => {
                const controller = zcrypto.toChecksumAddress(get_controller)
                if (controller !== loginInfo.zilAddr?.base16) {
                    setLoading(false)
                    toast.error(
                        `Only ${inputB.slice(
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
                            theme: 'dark',
                        }
                    )
                } else {
                    connect()
                        .then(() => {
                            updateLoggedIn({
                                address: inputB,
                            })
                            dispatch(updateLoginInfoAddress(inputB))
                            updateDashboardState('loggedIn')
                            updateModalDashboard(false)
                            setMenu('')
                            setSubMenu('')
                            setInput('')
                            setInputB('')
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
                                theme: 'dark',
                            })
                        })
                    setLoading(false)
                }
            })
            .catch(() => {
                setLoading(false)
                toast.error(`Wrong format.`, {
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
                                        `https://devex.zilliqa.com/tx/${
                                            deploy[0].ID
                                        }?network=https%3A%2F%2F${
                                            net === 'mainnet' ? '' : 'dev-'
                                        }api.zilliqa.com`
                                    )
                                }, 1000)
                                let new_ssi = deploy[1].address
                                new_ssi = zcrypto.toChecksumAddress(new_ssi)
                                updateBuyInfo(null)
                                dispatch(updateLoginInfoUsername(null!))
                                dispatch(updateLoginInfoAddress(new_ssi))
                                updateDashboardState('loggedIn')
                                updateModalTx(false)
                                updateModalBuyNft(false)
                                updateModalNewSsi(true)
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
                    theme: 'dark',
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
                theme: 'dark',
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
        if (input === '') {
            resolveAddr()
        } else {
            resolveUser()
        }
    }

    const logOff = () => {
        Router.push('/')
        disconnect()
        updateLoggedIn(null)
        dispatch(updateLoginInfoAddress(null!))
        dispatch(updateLoginInfoUsername(null!))
        dispatch(updateLoginInfoZilpay(null!))
        updateDashboardState(null)
        dispatch(updateLoginInfoArAddress(null!))
        updateModalDashboard(false)
        updateBuyInfo(null)
        setTimeout(() => {
            toast.warning(t('You have logged off'), {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
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
                setLoadingDomain(true)
                setMenu(val)
                let network = tyron.DidScheme.NetworkNamespace.Mainnet
                if (net === 'testnet') {
                    network = tyron.DidScheme.NetworkNamespace.Testnet
                }
                const init = new tyron.ZilliqaInit.default(network)
                const addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    loginInfo.username,
                    'did'
                )
                init.API.blockchain
                    .getSmartContractSubState(addr, 'did_domain_dns')
                    .then(async (res) => {
                        const key = Object.keys(res.result.did_domain_dns)
                        setDidDomain(key)
                    })
                setLoadingDomain(false)
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
            theme: 'dark',
        })
    }

    const resolveDid = async (_username: string, _domain: string) => {
        updateLoading(true)
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
                                            updateUser({
                                                name: _username,
                                                domain: 'zil',
                                            })
                                            Router.push(`/${_username}/zil`)
                                            break
                                        case DOMAINS.DEFI:
                                            updateUser({
                                                name: _username,
                                                domain: 'defi',
                                            })
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
                                            updateUser({
                                                name: _username,
                                                domain: 'vc',
                                            })
                                            Router.push(`/${_username}/vc`)
                                            break
                                        case DOMAINS.TREASURY:
                                            updateUser({
                                                name: _username,
                                                domain: 'treasury',
                                            })
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

    const spinner = (
        <i
            style={{ color: 'silver' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    if (!modalDashboard) {
        return null
    }

    return (
        <>
            <div className={styles.outerWrapper}>
                <div
                    className={styles.containerClose}
                    onClick={() => updateModalDashboard(false)}
                />
                <div className={styles.container}>
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
                    <div>
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
                                                    updateModalDashboard(false)
                                                }}
                                            >
                                                <span
                                                    className={styles.txtDomain}
                                                >
                                                    {loginInfo?.username}.did
                                                </span>
                                            </p>
                                            <div
                                                style={{ marginTop: '-5%' }}
                                                className={styles.addrSsi}
                                            >
                                                <a
                                                    className={styles.txtDomain}
                                                    href={`https://devex.zilliqa.com/address/${
                                                        loginInfo?.address
                                                    }?network=https%3A%2F%2F${
                                                        net === 'mainnet'
                                                            ? ''
                                                            : 'dev-'
                                                    }api.zilliqa.com`}
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
                                                href={`https://devex.zilliqa.com/address/${
                                                    loginInfo?.address
                                                }?network=https%3A%2F%2F${
                                                    net === 'mainnet'
                                                        ? ''
                                                        : 'dev-'
                                                }api.zilliqa.com`}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                <span
                                                    className={styles.txtDomain}
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
                        {loginInfo?.address !== null && (
                            <>
                                <div
                                    className={styles.toggleMenuWrapper2}
                                    onClick={() => menuActive('didDomains')}
                                >
                                    <div>{t('DID_DOMAIN')}</div>
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
                                        {loadingDomain ? (
                                            spinner
                                        ) : (
                                            <>
                                                {didDomain.length > 0 ? (
                                                    <div
                                                        style={{
                                                            marginTop: '-20px',
                                                        }}
                                                    >
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
                                                                    key={val}
                                                                    className={
                                                                        styles.txtDomainList
                                                                    }
                                                                >
                                                                    .{val}
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <code
                                                        style={{
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        {t('DID_NO_DOMAINS')}
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
                                        onClick={() =>
                                            toast(t('Coming soon'), {
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
                                        href={`https://devex.zilliqa.com/address/${
                                            loginInfo.zilAddr?.bech32
                                        }?network=https%3A%2F%2F${
                                            net === 'mainnet' ? '' : 'dev-'
                                        }api.zilliqa.com`}
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
                                            <p
                                                onClick={() =>
                                                    copyToClipboard(
                                                        loginInfo.arAddr
                                                    )
                                                }
                                                className={styles.txtAddress}
                                            >
                                                {loginInfo.arAddr}{' '}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <button
                                            onClick={connect}
                                            className="button small secondary"
                                        >
                                            <div
                                                className={
                                                    styles.txtBtnArConnect
                                                }
                                            >
                                                {t('CONNECT_WITH_ARCONNECT')}
                                            </div>
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
                                <h6 className={styles.title2}>{t('LOG_IN')}</h6>
                                <Image
                                    alt="arrow-ico"
                                    src={menu === 'login' ? MinusIcon : AddIcon}
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
                                        <p
                                            style={{
                                                marginTop: '9%',
                                                fontSize: '16px',
                                            }}
                                        >
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
                                                className={styles.inputWrapper}
                                            >
                                                <h5
                                                    style={{ fontSize: '14px' }}
                                                >
                                                    {t('NFT_USERNAME')}
                                                </h5>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <input
                                                        disabled={inputB !== ''}
                                                        value={input}
                                                        onChange={handleInput}
                                                        onKeyPress={
                                                            handleOnKeyPress
                                                        }
                                                        className={
                                                            inputB !== ''
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
                                                        {loading ? (
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
                                                    className="actionBtn"
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
                                        <p
                                            style={{
                                                marginTop: '9%',
                                                fontSize: '16px',
                                            }}
                                        >
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
                                        <div className={styles.wrapperNewSsi}>
                                            <p>
                                                <code
                                                    className={styles.newSsiSub}
                                                >
                                                    {t('DEPLOY_NEW_SSI')}
                                                </code>
                                            </p>
                                            <div
                                                style={{ width: '100%' }}
                                                onClick={newSsi}
                                                className="actionBtn"
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
                                            <h5
                                                style={{
                                                    marginTop: '3%',
                                                    color: 'lightgrey',
                                                }}
                                            >
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
                                className={styles.toggleMenuWrapper2}
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
                                <div className={styles.wrapperNewSsi}>
                                    <p>
                                        <code className={styles.newSsiSub}>
                                            {t('DEPLOY_NEW_SSI')}
                                        </code>
                                    </p>
                                    <div
                                        style={{ width: '100%' }}
                                        onClick={newSsi}
                                        className="actionBtn"
                                    >
                                        {loadingSsi ? (
                                            <div
                                                className={styles.txtBtnNewSsi}
                                            >
                                                {t('CLICK_TO_CONTINUE')}
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.txtBtnNewSsi}
                                            >
                                                {t('CREATE_SSI')}
                                            </div>
                                        )}
                                    </div>
                                    <h5
                                        style={{
                                            marginTop: '3%',
                                            color: 'lightgrey',
                                        }}
                                    >
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
    )
}

export default Component
