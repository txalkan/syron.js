import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { RootState } from '../../../../../src/app/reducers'
import toastTheme from '../../../../../src/hooks/toastTheme'
import Ivms101 from './Ivms101'
import VC from './VC'
import { useTranslation } from 'next-i18next'
import TransferOwnership from '../../../TransferOwnership'
import Pause from '../../../Pause'
import UpdatePublicEncryption from './UpdatePublicEncryption'
import smartContract from '../../../../../src/utils/smartContract'
import Spinner from '../../../../Spinner'
import CloseIcoReg from '../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../src/assets/icons/ic_cross_black.svg'
import { updateDonation } from '../../../../../src/store/donation'
import wallet from '../../../../../src/hooks/wallet'
import { $net } from '../../../../../src/store/network'

function Component({ type }) {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { checkPause } = wallet()

    const resolvedInfo = useStore($resolvedInfo)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const net = $net.state.net as 'mainnet' | 'testnet'

    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const [txName, setTxName] = useState('')
    const [paused, setPaused] = useState(false)
    const [loading, setLoading] = useState(type === 'wallet' ? true : false)
    const [loadingIssuer, setLoadingIssuer] = useState(false)
    const [issuerName, setIssuerSubdomain] = useState('')
    const [issuerDomain, setIssuerDomain] = useState('')
    const [issuerInput, setIssuerInput] = useState('')
    const [publicEncryption, setPublicEncryption] = useState('')
    const [savedIssuer, setSavedIssuer] = useState(false)

    const toggleActive = (id: string) => {
        updateDonation(null)
        resetState()
        if (id === txName) {
            setTxName('')
        } else {
            if (paused) {
                if (id === 'Unpause') {
                    setTxName(id)
                } else {
                    toast.warn('To continue, unpause your SBTxWALLET', {
                        position: 'top-right',
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
            } else {
                setTxName(id)
            }
        }
    }

    const handleIssuer = async () => {
        setLoadingIssuer(true)
        const input = String(issuerInput).replace(/ /g, '')
        let domain = input.toLowerCase()
        let tld = ''
        let subdomain = ''
        if (input.includes('.zlp')) {
            tld = 'zlp'
        }
        if (input.includes('@')) {
            // const [subdomain = '', domain = ''] = input.split('@')
            domain = input
                .split('@')[1]
                .replace('.did', '')
                .replace('.ssi', '')
                .replace('.zlp', '')
                .toLowerCase()
            subdomain = input.split('@')[0]
        } else if (input.includes('.')) {
            if (
                input.split('.')[1] === 'ssi' ||
                input.split('.')[1] === 'did' ||
                input.split('.')[1] === 'zlp'
            ) {
                domain = input.split('.')[0].toLowerCase()
                tld = input.split('.')[1]
            } else {
                throw new Error('Resolver failed.')
            }
        }

        let _subdomain
        if (subdomain && subdomain !== '') {
            _subdomain = subdomain
        }

        // @todo test
        // let username_ = ''
        // let domain_ = ''
        // if (input.includes('@')) {
        //     const [subdomain = '', domain = ''] = input.split('@')
        //     username_ = domain
        //         .replace('.did', '')
        //         .replace('.ssi', '')
        //         .toLowerCase()
        //     domain_ = domain
        // } else {
        //     if (input.includes('.')) {
        //         toast.warn(t('Invalid'), {
        //             position: 'top-right',
        //             autoClose: 3000,
        //             hideProgressBar: false,
        //             closeOnClick: true,
        //             pauseOnHover: true,
        //             draggable: true,
        //             progress: undefined,
        //             theme: toastTheme(isLight),
        //         })
        //     } else {
        //         username_ = input
        //     }
        //}
        setIssuerSubdomain(domain)
        setIssuerSubdomain(subdomain)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, tld, domain, _subdomain)
            .then(async (addr) => {
                // setAddr only if this smart contract has version "SBTxWallet"
                const res: any = await getSmartContract(addr, 'version')
                if (res.result.version.toLowerCase().includes('sbtxwallet')) {
                    await getSmartContract(addr, 'public_encryption')
                        .then((public_enc) => {
                            if (public_enc!.result.public_encryption) {
                                setSavedIssuer(true)
                                setIssuerInput(addr)
                                setPublicEncryption(
                                    public_enc!.result.public_encryption
                                )
                            }
                        })
                        .catch(() => {
                            toast.warn('No public encryption found', {
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
                        })
                } else {
                    toast.warn('Unsupported smart contract', {
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
            })
            .catch(() => {
                toast.warn(t('Invalid'), {
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
            })
        setLoadingIssuer(false)
    }

    const resetState = () => {
        setIssuerSubdomain('')
        setIssuerSubdomain('')
        setIssuerInput('')
        setSavedIssuer(false)
    }

    const fetchPause = async () => {
        setLoading(true)
        const res = await checkPause()
        setPaused(res)
        setLoading(false)
    }

    useEffect(() => {
        if (resolvedInfo !== null) {
            fetchPause()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.wrapper}>
            {txName !== '' && (
                <div
                    className={styles.closeWrapper}
                    onClick={() => toggleActive('')}
                />
            )}
            {loading ? (
                <Spinner />
            ) : (
                <div className={styles.content}>
                    <div className={styles.title}>
                        {type === 'public' ? (
                            <></>
                        ) : (
                            <h1>
                                SBT
                                <span
                                    style={{
                                        textTransform: 'lowercase',
                                        color: '#ffff32',
                                    }}
                                >
                                    x
                                </span>
                                Wallet
                            </h1>
                        )}
                    </div>
                    <div className={styles.cardWrapper}>
                        {type === 'public' ? (
                            <>
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={() => {
                                            toggleActive('Ivms101')
                                        }}
                                        className={
                                            txName === 'Ivms101'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>UPLOAD TRAVEL RULE</div>
                                    </div>
                                    {txName === 'Ivms101' && (
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
                                            <Ivms101
                                                txName={txName}
                                                handleIssuer={handleIssuer}
                                                savedIssuer={savedIssuer}
                                                setSavedIssuer={setSavedIssuer}
                                                loading={loadingIssuer}
                                                issuerInput={issuerInput}
                                                setIssuerInput={setIssuerInput}
                                                issuerName={issuerName}
                                                publicEncryption={
                                                    publicEncryption
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={() =>
                                            toggleActive(
                                                'Verifiable_Credential'
                                            )
                                        }
                                        className={
                                            txName === 'Verifiable_Credential'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>MINT SBT</div>
                                    </div>
                                    {txName === 'Verifiable_Credential' && (
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
                                            <VC
                                                txName={txName}
                                                handleIssuer={handleIssuer}
                                                issuerName={issuerName}
                                                issuerDomain={issuerDomain}
                                                setIssuerInput={setIssuerInput}
                                                setSavedIssuer={setSavedIssuer}
                                                savedIssuer={savedIssuer}
                                                loading={loadingIssuer}
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                {paused ? (
                                    <div className={styles.cardActiveWrapper}>
                                        <div
                                            onClick={() =>
                                                toggleActive('Unpause')
                                            }
                                            className={styles.cardActive}
                                        >
                                            <div>UNPAUSE</div>
                                        </div>
                                        {txName === 'Unpause' && (
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
                                                        className={
                                                            styles.closeIco
                                                        }
                                                    >
                                                        <Image
                                                            width={10}
                                                            src={CloseIco}
                                                            alt="close-ico"
                                                        />
                                                    </div>
                                                </div>
                                                <Pause
                                                    pause={false}
                                                    xwallet="sbt"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.cardActiveWrapper}>
                                        <div
                                            onClick={() =>
                                                toggleActive('Pause')
                                            }
                                            className={
                                                txName === 'Pause'
                                                    ? styles.cardActive
                                                    : styles.card
                                            }
                                        >
                                            <div>PAUSE</div>
                                        </div>
                                        {txName === 'Pause' && (
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
                                                        className={
                                                            styles.closeIco
                                                        }
                                                    >
                                                        <Image
                                                            width={10}
                                                            src={CloseIco}
                                                            alt="close-ico"
                                                        />
                                                    </div>
                                                </div>
                                                <Pause
                                                    pause={true}
                                                    xwallet="sbt"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={() =>
                                            toggleActive(
                                                'UpdatePublicEncryption'
                                            )
                                        }
                                        className={
                                            txName === 'UpdatePublicEncryption'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>UPDATE PUBLIC ENCRYPTION</div>
                                    </div>
                                    {txName === 'UpdatePublicEncryption' && (
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
                                            <UpdatePublicEncryption />
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardActiveWrapper}>
                                    <div
                                        onClick={() =>
                                            toggleActive('TransferOwnership')
                                        }
                                        className={
                                            txName === 'TransferOwnership'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        <div>TRANSFER OWNERSHIP</div>
                                    </div>
                                    {txName === 'TransferOwnership' && (
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
                                            <TransferOwnership />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Component
