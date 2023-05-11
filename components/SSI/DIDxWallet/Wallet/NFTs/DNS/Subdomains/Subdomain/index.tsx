import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import {
    $resolvedInfo,
    updateResolvedInfo,
} from '../../../../../../../../src/store/resolvedInfo'
import { operationKeyPair } from '../../../../../../../../src/lib/dkms'
import { ZilPayBase } from '../../../../../../../ZilPay/zilpay-base'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { Arrow, Donate, Selector, Spinner } from '../../../../../../..'
import {
    $donation,
    updateDonation,
} from '../../../../../../../../src/store/donation'
import {
    $domainAddr,
    $subdomainInput,
    $domainLegend,
    $domainLegend2,
    $domainTx,
    updateSubdomain,
    updateDomainAddr,
    updateDomainLegend as updateLegend,
    updateDomainLegend2,
    updateDomainTx,
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../../src/store/modal'
import {
    setTxStatusLoading,
    setTxId,
} from '../../../../../../../../src/app/actions'
import { RootState } from '../../../../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../../../src/hooks/router'
import TickIco from '../../../../../../../../src/assets/icons/tick.svg'
import CloseIcoReg from '../../../../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../../../../src/assets/icons/ic_cross_black.svg'
import smartContract from '../../../../../../../../src/utils/smartContract'
import { $arconnect } from '../../../../../../../../src/store/arconnect'
import { updateLoading } from '../../../../../../../../src/store/loading'
import toastTheme from '../../../../../../../../src/hooks/toastTheme'
import useArConnect from '../../../../../../../../src/hooks/useArConnect'
import ThreeDots from '../../../../../../../Spinner/ThreeDots'
import { TransitionParams } from 'tyron/dist/blockchain/tyronzil'
import fetch from '../../../../../../../../src/hooks/fetch'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const { navigate } = routerHook()
    const { getSmartContract } = smartContract()
    const { connect } = useArConnect()
    const { checkVersion } = fetch()
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const donation = useStore($donation)
    const subdomain = useStore($subdomainInput)
    const input = useStore($domainAddr)
    const domainLegend = useStore($domainLegend)
    const domainLegend2 = useStore($domainLegend2)
    const txName = useStore($domainTx)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const version = checkVersion(resolvedInfo?.version)

    const [loading, setLoading] = useState(false)
    const [nft, setNft] = useState('')
    const [tokenId, setTokenId] = useState('')
    const [savedTokenId, setSavedTokenId] = useState(false)

    const handleInputSubomain = (event: { target: { value: any } }) => {
        updateDonation(null)
        updateDomainAddr('')
        updateLegend('save')
        const input = event.target.value
        updateSubdomain(input)
    }

    const toggleActive = (id: string) => {
        if (id === '') {
            if (window.confirm('Are you sure about closing this modal?')) {
                updateDonation(null)
                updateDomainLegend2('save')
                setNft('')
                if (id === txName) {
                    updateDomainTx('')
                } else {
                    updateDomainTx(id)
                }
            }
        } else {
            updateDonation(null)
            updateDomainLegend2('save')
            setNft('')
            if (id === txName) {
                updateDomainTx('')
            } else {
                updateDomainTx(id)
            }
        }
    }

    const handleSaveDomain = async () => {
        if (
            subdomain !== '' &&
            subdomain !== 'did' &&
            !subdomain.includes('.')
        ) {
            updateLegend('saved')
            // setLoading(true)
            // getSmartContract(resolvedInfo?.addr!, 'did_domain_dns').then(
            //     async (res) => {
            //         const key = Object.keys(res.result.did_domain_dns)
            //         if (key.some((val) => val === didDomain)) {
            //             toast.error(t('Domain already exist'), {
            //                 position: 'top-right',
            //                 autoClose: 2000,
            //                 hideProgressBar: false,
            //                 closeOnClick: true,
            //                 pauseOnHover: true,
            //                 draggable: true,
            //                 progress: undefined,
            //                 theme: toastTheme(isLight),
            //                 toastId: 5,
            //             })
            //             setLoading(false)
            //         } else {
            //             updateDomainLegend('saved')
            //             setLoading(false)
            //         }
            //     }
            // )
        } else {
            toast.warn(t('Invalid'), {
                position: 'bottom-left',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        }
    }

    const handleSave = async () => {
        const addr = tyron.Address.default.verification(input)
        if (addr !== '') {
            updateDomainAddr(addr)
            updateDomainLegend2('saved')
        } else {
            toast.error(t('Wrong address.'), {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 3,
            })
        }
    }

    const handleInput = (event: { target: { value: any } }) => {
        updateDonation(null)
        updateDomainAddr('')
        updateDomainLegend2('save')
        updateDomainAddr(event.target.value)
    }

    const handleInputTokenId = (event: { target: { value: any } }) => {
        updateDonation(null)
        setSavedTokenId(false)
        setTokenId(event.target.value)
    }

    const handleOnKeyPressAddr = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleOnKeyPressTokenId = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setSavedTokenId(true)
        }
    }

    const handleOnKeyPressDomain = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSaveDomain()
        }
    }

    const handleDeploy = async () => {
        try {
            setLoading(true)
            if (resolvedInfo !== null && net !== null) {
                const zilpay = new ZilPayBase()
                const zp = await zilpay.zilpay()
                await zp.wallet.connect()

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                await zilpay
                    //.deployDomainBeta(net, resolvedDomain!)
                    .deployDomain(net, txName, resolvedDomain!)
                    .then(async (deploy: any) => {
                        setLoading(false)

                        dispatch(setTxId(deploy[0].ID))
                        dispatch(setTxStatusLoading('submitted'))

                        let tx = await tyron.Init.default.transaction(net)
                        tx = await tx.confirm(deploy[0].ID, 33)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            updateDonation(null)

                            let link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}`
                            if (net === 'testnet') {
                                link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
                            }
                            setTimeout(() => {
                                window.open(link)
                            }, 1000)

                            const txn = await tyron.Init.default.contract(
                                deploy[0].ID,
                                net
                            )
                            let addr = '0x' + txn //deploy[0].ContractAddress
                            addr = zcrypto.toChecksumAddress(addr)
                            updateDomainAddr(addr)
                            updateDomainLegend2('saved')
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                            setTimeout(() => {
                                toast.error(t('Transaction failed.'), {
                                    position: 'bottom-right',
                                    autoClose: 4000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: toastTheme(isLight),
                                    toastId: 4,
                                })
                            }, 1000)
                        }
                    })
                    .catch((error) => {
                        throw error
                    })
            } else {
                setLoading(false)
                toast.error('Some data is missing.', {
                    position: 'bottom-right',
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 7,
                })
            }
        } catch (error) {
            setLoading(false)
            dispatch(setTxStatusLoading('rejected'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            toast.error(String(error), {
                position: 'bottom-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 3,
            })
        }
    }

    const handleDeployVC = async () => {
        setLoading(true)
        if (resolvedInfo !== null && net !== null) {
            const zilpay = new ZilPayBase()
            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            let tx = await tyron.Init.default.transaction(net)
            await zilpay
                .deployDomainBetaVC(net, resolvedDomain!, subdomain)
                .then(async (deploy: any) => {
                    dispatch(setTxId(deploy[0].ID))
                    dispatch(setTxStatusLoading('submitted'))
                    try {
                        tx = await tx.confirm(deploy[0].ID, 33)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            updateDonation(null)
                            window.open(
                                `https://viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
                            )
                            let addr = deploy[0].ContractAddress
                            addr = zcrypto.toChecksumAddress(addr)
                            updateDomainAddr(addr)
                            updateDomainLegend2('saved')
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                            setTimeout(() => {
                                toast.error(t('Transaction failed.'), {
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
                    } catch (err) {
                        updateModalTx(false)
                        toast.error(String(err), {
                            position: 'bottom-right',
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
                })
                .catch(() => {
                    dispatch(setTxStatusLoading('rejected'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    toast.warn('Review deployment', {
                        position: 'bottom-left',
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 10,
                    })
                })
        } else {
            toast.error('Some data is missing.', {
                position: 'bottom-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 11,
            })
        }
        setLoading(false)
    }

    const resolveDid = async (
        this_tld: string,
        this_domain: string,
        this_subdomain: string
    ) => {
        updateLoading(true)
        let _subdomain
        if (this_subdomain !== '') {
            _subdomain = this_subdomain
        }
        await tyron.SearchBarUtil.default
            .fetchAddr(net, this_tld, this_domain, _subdomain)
            .then(async (addr) => {
                const res = await getSmartContract(addr, 'version')
                updateLoading(false)
                updateResolvedInfo({
                    user_tld: this_tld,
                    user_domain: this_domain,
                    user_subdomain: this_subdomain,
                    addr: addr,
                    version: res?.result?.version,
                })
                switch (res?.result?.version?.slice(0, 8).toLowerCase()) {
                    case 'zilstake':
                        navigate(`/${this_tld}@${resolvedDomain}/zil`)
                        break
                    case '.stake--':
                        navigate(`/${this_tld}@${resolvedDomain}/zil`)
                        break
                    case 'zilxwall':
                        navigate(`/${this_tld}@${resolvedDomain}/zil`)
                        break
                    case 'vcxwalle':
                        navigate(`/${this_tld}@${resolvedDomain}/sbt`)
                        break
                    case 'sbtxwall':
                        navigate(`/${this_tld}@${resolvedDomain}/sbt`)
                        break
                    case 'didxwall':
                        navigate(`/${this_tld}@${resolvedDomain}`)
                        break
                    default:
                        navigate(`/resolvedAddress`)
                        break
                }
            })
            .catch((err) => {
                toast.error(String(err), {
                    position: 'bottom-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 12,
                })
                updateLoading(false)
            })
    }

    const handleSubmit = async () => {
        try {
            let did_key =
                '0x000000000000000000000000000000000000000000000000000000000000000000'
            let encrypted = 'null'
            await connect().then(async () => {
                const arConnect = $arconnect.getState()
                if (arConnect) {
                    const result = await operationKeyPair({
                        arConnect: arConnect,
                        id: subdomain,
                        addr: resolvedInfo?.addr,
                    })
                    did_key = result.element.key.key
                    encrypted = result.element.key.encrypted
                }
            })
            //@todo-x-check: continue after the user select arconnect or rejects: tested action below only run after connect(),
            // but when reject arconnect atm we reload the page so can't continue
            if (resolvedInfo !== null && donation !== null) {
                const zilpay = new ZilPayBase()
                const txID = 'Dns'
                const addr = zcrypto.toChecksumAddress(input)
                let tyron_: tyron.TyronZil.TransitionValue
                tyron_ = await tyron.Donation.default.tyron(donation)

                const tx_params = await tyron.TyronZil.default.Dns(
                    addr,
                    subdomain,
                    did_key,
                    encrypted,
                    tyron_
                )

                if (version >= 6) {
                    let nft_ = nft
                    if (nft !== 'nawelito') {
                        nft_ = nft + '#' + tokenId
                    }
                    const nftID: TransitionParams = {
                        vname: 'nftID',
                        type: 'String',
                        value: nft_,
                    }
                    tx_params.push(nftID)
                }

                const _amount = String(donation)
                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)
                await zilpay
                    .call({
                        contractAddress: resolvedInfo?.addr!,
                        transition: txID,
                        params: tx_params as unknown as Record<
                            string,
                            unknown
                        >[],
                        amount: _amount,
                    })
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        try {
                            tx = await tx.confirm(res.ID, 33)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                updateDonation(null)
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                                // update prev is needed here?: yes, it would be better to use global navigation
                                // we already use navigate() on resolveDid() and that's enough

                                updateSubdomain('')
                                updateLegend('save')
                                updateDomainLegend2('save')
                                updateDomainTx('')
                                resolveDid('', resolvedDomain!, subdomain)
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                                setTimeout(() => {
                                    toast.error(t('Transaction failed.'), {
                                        position: 'bottom-right',
                                        autoClose: 4000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: toastTheme(isLight),
                                        toastId: 13,
                                    })
                                }, 1000)
                            }
                        } catch (err) {
                            updateModalTx(false)
                            toast.error(String(err), {
                                position: 'bottom-right',
                                autoClose: 4000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 14,
                            })
                        }
                    })
                    .catch((error) => {
                        dispatch(setTxStatusLoading('rejected'))
                        updateModalTxMinimized(false)
                        updateModalTx(true)
                        toast.error(String(error), {
                            position: 'bottom-right',
                            autoClose: 4000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 15,
                        })
                    })
            }
        } catch (error) {
            toast.error(String(error), {
                position: 'bottom-right',
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 16,
            })
        }
    }

    const handleOnChange = (value: string) => {
        setTokenId('')
        setSavedTokenId(false)
        setNft(value)
    }

    const renderDonate = () => {
        if (version >= 6) {
            if (nft !== 'ddk10' && nft !== '') {
                return true
            } else if (savedTokenId) {
                return true
            } else {
                return false
            }
        } else {
            return true
        }
    }

    const listDomains = [
        '$ZIL Staking xWALLET',
        'Soulbound xWALLET',
        'Decentralised Finance xWALLET',
    ] // to add further xWallets

    //@tydras
    const optionNft = [
        {
            value: 'nawelito',
            label: 'Nawelito: The Original',
        },
        {
            value: 'nawelitoonfire',
            label: 'Nawelito ON FIRE ToT',
        },
        {
            value: 'nessy',
            label: 'Nessy ToT',
        },
        {
            value: 'merxek',
            label: 'MerXek ToT',
        },
        {
            value: 'lexicassi',
            label: 'lexica.ssi dApp: Text-to-image AI',
        },
        {
            value: 'dd10k',
            label: 'Dr Death: The Order of the Redeemed',
        },
        {
            value: '#',
            label: 'None',
        },
    ]

    return (
        <div style={{ textAlign: 'center' }}>
            {/*
            - dapp name depends on dapp input => if dapp = "zilstake" then title is ZIL Staking Wallet
            */}
            <section className={styles.container}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Type subdomain"
                    onChange={handleInputSubomain}
                    onKeyPress={handleOnKeyPressDomain}
                    value={$subdomainInput.getState()}
                />
                <code className={styles.txt}>@{resolvedDomain}.ssi</code>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '10px',
                    }}
                >
                    <div
                        onClick={() => {
                            handleSaveDomain()
                        }}
                    >
                        {domainLegend === 'save' ? (
                            <>{loading ? <Spinner /> : <Arrow />}</>
                        ) : (
                            <div style={{ marginTop: '5px' }}>
                                <Image width={40} src={TickIco} alt="tick" />
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {domainLegend === 'saved' && (
                <div>
                    {txName !== '' && (
                        <div
                            className={styles.closeWrapper}
                            onClick={() => toggleActive('')}
                        />
                    )}
                    <div className={styles.content}>
                        <div className={styles.cardWrapper}>
                            {listDomains.map((val, i) => (
                                <div
                                    key={i}
                                    className={styles.cardActiveWrapper}
                                >
                                    <div
                                        onClick={() => {
                                            toggleActive(val)
                                        }}
                                        className={
                                            txName === val
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>{val}</div>
                                    </div>
                                    {txName === val && (
                                        <div className={styles.cardRight}>
                                            <div
                                                className={
                                                    styles.closeIcoWrapper
                                                }
                                            >
                                                <div
                                                    onClick={() =>
                                                        toggleActive('')
                                                    }
                                                    className={styles.closeIco}
                                                >
                                                    <Image
                                                        width={10}
                                                        src={CloseIco}
                                                        alt="close-ico"
                                                    />
                                                </div>
                                            </div>
                                            <>
                                                {domainLegend2 === 'save' && (
                                                    <>
                                                        {val ===
                                                        '$ZIL Staking xWALLET' ? (
                                                            <div
                                                                className={
                                                                    isLight
                                                                        ? 'actionBtnLight'
                                                                        : 'actionBtn'
                                                                }
                                                                style={{
                                                                    margin: '10%',
                                                                }}
                                                                onClick={
                                                                    handleDeploy
                                                                }
                                                            >
                                                                {loading ? (
                                                                    <ThreeDots color="black" />
                                                                ) : (
                                                                    <span
                                                                        style={{
                                                                            textTransform:
                                                                                'none',
                                                                        }}
                                                                    >
                                                                        New
                                                                        ZILxWALLET
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {val ===
                                                                'Soulbound xWALLET' ? (
                                                                    <>
                                                                        <div
                                                                            className={
                                                                                isLight
                                                                                    ? 'actionBtnLight'
                                                                                    : 'actionBtn'
                                                                            }
                                                                            style={{
                                                                                margin: '10%',
                                                                            }}
                                                                            onClick={() =>
                                                                                handleDeployVC()
                                                                            }
                                                                        >
                                                                            {loading ? (
                                                                                <ThreeDots color="black" />
                                                                            ) : (
                                                                                <span
                                                                                    style={{
                                                                                        textTransform:
                                                                                            'none',
                                                                                    }}
                                                                                >
                                                                                    NEW
                                                                                    SBTxWALLET
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div
                                                                            className={
                                                                                isLight
                                                                                    ? 'actionBtnLight'
                                                                                    : 'actionBtn'
                                                                            }
                                                                            style={{
                                                                                margin: '10%',
                                                                            }}
                                                                            onClick={() => {
                                                                                if (
                                                                                    net ===
                                                                                    'testnet'
                                                                                ) {
                                                                                    handleDeploy()
                                                                                } else {
                                                                                    toast.warn(
                                                                                        'Only available on testnet.'
                                                                                    ),
                                                                                        {
                                                                                            position:
                                                                                                'bottom-left',
                                                                                            autoClose: 4000,
                                                                                            hideProgressBar:
                                                                                                false,
                                                                                            closeOnClick:
                                                                                                true,
                                                                                            pauseOnHover:
                                                                                                true,
                                                                                            draggable:
                                                                                                true,
                                                                                            progress:
                                                                                                undefined,
                                                                                            theme: toastTheme(
                                                                                                isLight
                                                                                            ),
                                                                                            toastId: 17,
                                                                                        }
                                                                                }
                                                                            }}
                                                                        >
                                                                            {loading ? (
                                                                                <ThreeDots color="black" />
                                                                            ) : (
                                                                                <span
                                                                                    style={{
                                                                                        textTransform:
                                                                                            'none',
                                                                                    }}
                                                                                >
                                                                                    NEW
                                                                                    DEFIxWALLET
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                {domainLegend2 === 'saved' &&
                                                    txName !==
                                                        'TypeAddress' && (
                                                        <>
                                                            {version >= 6 && (
                                                                <>
                                                                    <div
                                                                        style={{
                                                                            marginTop:
                                                                                '10px',
                                                                        }}
                                                                        // className={
                                                                        //     styles.select
                                                                        // } @todo-css className does not exist?
                                                                    >
                                                                        <Selector
                                                                            option={
                                                                                optionNft
                                                                            }
                                                                            onChange={
                                                                                handleOnChange
                                                                            }
                                                                            placeholder="Select NFT"
                                                                        />
                                                                    </div>
                                                                    {nft ===
                                                                        'dd10k' && (
                                                                        <section
                                                                            className={
                                                                                styles.container
                                                                            }
                                                                        >
                                                                            <input
                                                                                style={{
                                                                                    width: '70%',
                                                                                    marginRight:
                                                                                        '20px',
                                                                                }}
                                                                                className={
                                                                                    styles.txt
                                                                                }
                                                                                type="text"
                                                                                placeholder="Type token id"
                                                                                onChange={
                                                                                    handleInputTokenId
                                                                                }
                                                                                onKeyPress={
                                                                                    handleOnKeyPressTokenId
                                                                                }
                                                                            />
                                                                            <div
                                                                                style={{
                                                                                    display:
                                                                                        'flex',
                                                                                    alignItems:
                                                                                        'center',
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    onClick={() => {
                                                                                        handleSave()
                                                                                    }}
                                                                                >
                                                                                    {!savedTokenId ? (
                                                                                        <Arrow />
                                                                                    ) : (
                                                                                        <div
                                                                                            style={{
                                                                                                marginTop:
                                                                                                    '5px',
                                                                                            }}
                                                                                        >
                                                                                            <Image
                                                                                                width={
                                                                                                    40
                                                                                                }
                                                                                                src={
                                                                                                    TickIco
                                                                                                }
                                                                                                alt="tick"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </section>
                                                                    )}
                                                                </>
                                                            )}
                                                            {renderDonate() && (
                                                                <>
                                                                    <Donate />
                                                                    {donation !==
                                                                        null && (
                                                                        <div
                                                                            style={{
                                                                                marginBottom:
                                                                                    '5%',
                                                                                textAlign:
                                                                                    'center',
                                                                            }}
                                                                        >
                                                                            <button
                                                                                className={
                                                                                    isLight
                                                                                        ? 'actionBtnLight'
                                                                                        : 'actionBtn'
                                                                                }
                                                                                onClick={
                                                                                    handleSubmit
                                                                                }
                                                                            >
                                                                                <div>
                                                                                    Save{' '}
                                                                                    <span
                                                                                        className={
                                                                                            styles.username
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            subdomain
                                                                                        }
                                                                                    </span>{' '}
                                                                                    subdomain
                                                                                </div>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                            </>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className={styles.cardActiveWrapper}>
                                <div
                                    onClick={() => {
                                        toggleActive('TypeAddress')
                                    }}
                                    className={
                                        txName === 'TypeAddress'
                                            ? styles.cardActive
                                            : styles.card
                                    }
                                >
                                    <div>Subdomain address</div>
                                </div>
                                {txName === 'TypeAddress' && (
                                    <div className={styles.cardRight}>
                                        <div className={styles.closeIcoWrapper}>
                                            <div
                                                onClick={() => toggleActive('')}
                                                className={styles.closeIco}
                                            >
                                                <Image
                                                    width={10}
                                                    src={CloseIco}
                                                    alt="close-ico"
                                                />
                                            </div>
                                        </div>
                                        <section className={styles.container}>
                                            <input
                                                style={{
                                                    width: '70%',
                                                    marginRight: '20px',
                                                }}
                                                className={styles.txt}
                                                type="text"
                                                placeholder="Type address"
                                                onChange={handleInput}
                                                onKeyPress={
                                                    handleOnKeyPressAddr
                                                }
                                            />
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div
                                                    onClick={() => {
                                                        handleSave()
                                                    }}
                                                >
                                                    {domainLegend2 ===
                                                    'save' ? (
                                                        <Arrow />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    '5px',
                                                            }}
                                                        >
                                                            <Image
                                                                width={40}
                                                                src={TickIco}
                                                                alt="tick"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>
                                        {domainLegend2 === 'saved' && (
                                            <>
                                                {/* {version >= 6 && (
                                                        <>
                                                            <div
                                                                className={
                                                                    styles.select
                                                                }
                                                            >
                                                                <Selector
                                                                    option={
                                                                        optionNft
                                                                    }
                                                                    onChange={
                                                                        handleOnChange
                                                                    }
                                                                    placeholder="Select NFT"
                                                                />
                                                            </div>
                                                            {nft ===
                                                                'ddk10' && (
                                                                <section
                                                                    className={
                                                                        styles.container
                                                                    }
                                                                >
                                                                    <input
                                                                        style={{
                                                                            width: '70%',
                                                                            marginRight:
                                                                                '20px',
                                                                        }}
                                                                        className={
                                                                            styles.txt
                                                                        }
                                                                        type="text"
                                                                        placeholder="Type token id"
                                                                        onChange={
                                                                            handleInputTokenId
                                                                        }
                                                                        onKeyPress={
                                                                            handleOnKeyPressTokenId
                                                                        }
                                                                    />
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                        }}
                                                                    >
                                                                        <div
                                                                            onClick={() => {
                                                                                handleSave()
                                                                            }}
                                                                        >
                                                                            {!savedTokenId ? (
                                                                                <Arrow />
                                                                            ) : (
                                                                                <div
                                                                                    style={{
                                                                                        marginTop:
                                                                                            '5px',
                                                                                    }}
                                                                                >
                                                                                    <Image
                                                                                        width={
                                                                                            40
                                                                                        }
                                                                                        src={
                                                                                            TickIco
                                                                                        }
                                                                                        alt="tick"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </section>
                                                            )}
                                                        </>
                                                    )} */}
                                                <>
                                                    <Donate />
                                                    {donation !== null && (
                                                        <div
                                                            style={{
                                                                marginBottom:
                                                                    '5%',
                                                                textAlign:
                                                                    'center',
                                                            }}
                                                        >
                                                            <button
                                                                className="button"
                                                                onClick={
                                                                    handleSubmit
                                                                }
                                                            >
                                                                <div>
                                                                    Save{' '}
                                                                    <span
                                                                        className={
                                                                            styles.username
                                                                        }
                                                                    >
                                                                        {
                                                                            subdomain
                                                                        }
                                                                    </span>{' '}
                                                                    subdomain
                                                                </div>
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                                {/* {renderDonate() && (
                                                        <>
                                                            <Donate />
                                                            {donation !==
                                                                null && (
                                                                    <div
                                                                        style={{
                                                                            marginBottom:
                                                                                '5%',
                                                                            textAlign:
                                                                                'center',
                                                                        }}
                                                                    >
                                                                        <button
                                                                            className="button"
                                                                            onClick={
                                                                                handleSubmit
                                                                            }
                                                                        >
                                                                            <div>
                                                                                Save{' '}
                                                                                <span
                                                                                    className={
                                                                                        styles.username
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        didDomain
                                                                                    }
                                                                                </span>{' '}
                                                                                DID
                                                                                subdomain
                                                                            </div>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </>
                                                    )} */}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Component
