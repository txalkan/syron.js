import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
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
import CloseIcoReg from '../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../src/assets/icons/ic_cross_black.svg'
import { updateDonation } from '../../../../../src/store/donation'
import useWallet from '../../../../../src/hooks/wallet'
import { $net } from '../../../../../src/store/network'
import { useStore } from 'react-stores'
import ThreeDots from '../../../../Spinner/ThreeDots'

function Component({ type }) {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { checkPause } = useWallet()

    const resolvedInfo = useStore($resolvedInfo)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const net = $net.state.net as 'mainnet' | 'testnet'

    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const [txName, setTxName] = useState('')
    const [paused, setPaused] = useState(false)
    const [loading, setLoading] = useState(type === 'wallet' ? true : false)
    const [loadingIssuer, setLoadingIssuer] = useState(false)
    const [issuerDomain, setIssuerDomain] = useState('')
    const [issuerSubdomain, setIssuerSubdomain] = useState('')
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
                    toast.warn('To continue, unpause your xWALLET', {
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
        try {
            const input = String(issuerInput).replace(/ /g, '')
            let domain = input.toLowerCase()
            let tld = ''
            let subdomain = ''
            if (input.includes('.zlp')) {
                //tld = 'zlp'
                throw new Error('Invalid top-level domain.')
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

            let _subdomain: string | undefined
            if (subdomain !== '') {
                _subdomain = subdomain
            }

            setIssuerDomain(domain)
            setIssuerSubdomain(subdomain)
            await tyron.SearchBarUtil.default
                .fetchAddr(net, tld, domain, _subdomain)
                .then(async (addr) => {
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
                            //'No public encryption found'
                            throw new Error('Invalid issuer')
                        })
                })
                .catch((error) => {
                    toast.warn(String(error), {
                        position: 'top-right',
                        autoClose: 2222,
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
        } catch (error) {
            setLoadingIssuer(false)
            toast.warn(String(error), {
                position: 'top-right',
                autoClose: 2222,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }
    }

    const resetState = () => {
        setIssuerDomain('')
        setIssuerDomain('')
        setIssuerInput('')
        setSavedIssuer(false)
    }

    const fetchPause = async () => {
        setLoading(true)

        const res = await checkPause(resolvedInfo.addr!)
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
                <ThreeDots color="yellow" />
            ) : (
                <div className={styles.content}>
                    {type === 'public' ? (
                        <></>
                    ) : (
                        <div className={styles.title}>
                            <span
                                style={{
                                    textTransform: 'lowercase',
                                    color: '#ffff32',
                                }}
                            >
                                x
                            </span>
                            Wallet
                        </div>
                    )}
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
                                    TRAVEL RULE
                                </div>
                                {txName === 'Ivms101' && (
                                    <div className={styles.subcard}>
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
                                        <Ivms101
                                            txName={txName}
                                            handleIssuer={handleIssuer}
                                            savedIssuer={savedIssuer}
                                            setSavedIssuer={setSavedIssuer}
                                            loading={loadingIssuer}
                                            issuerInput={issuerInput}
                                            setIssuerInput={setIssuerInput}
                                            issuerName={issuerDomain}
                                            publicEncryption={publicEncryption}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className={styles.cardActiveWrapper}>
                                <div
                                    onClick={() =>
                                        toggleActive('Verifiable_Credential')
                                    }
                                    className={
                                        txName === 'Verifiable_Credential'
                                            ? styles.cardActive
                                            : styles.card
                                    }
                                >
                                    MINT SBT
                                </div>
                                {txName === 'Verifiable_Credential' && (
                                    <div className={styles.subcard}>
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
                                        <VC
                                            txName={txName}
                                            handleIssuer={handleIssuer}
                                            issuerDomain={issuerDomain}
                                            issuerSubdomain={issuerSubdomain}
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
                                        onClick={() => toggleActive('Unpause')}
                                        className={
                                            txName === 'Pause'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        UNPAUSE
                                    </div>
                                    {txName === 'Unpause' && (
                                        <div className={styles.subcard}>
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
                                        onClick={() => toggleActive('Pause')}
                                        className={
                                            txName === 'Pause'
                                                ? styles.cardActive
                                                : styles.card
                                        }
                                    >
                                        PAUSE
                                    </div>
                                    {txName === 'Pause' && (
                                        <div className={styles.subcard}>
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
                                            <Pause pause={true} xwallet="sbt" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className={styles.cardActiveWrapper}>
                                <div
                                    onClick={() =>
                                        toggleActive('UpdatePublicEncryption')
                                    }
                                    className={
                                        txName === 'UpdatePublicEncryption'
                                            ? styles.cardActive
                                            : styles.card
                                    }
                                >
                                    UPDATE PUBLIC ENCRYPTION
                                </div>
                                {txName === 'UpdatePublicEncryption' && (
                                    <div className={styles.subcard}>
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
                                    TRANSFER OWNERSHIP
                                </div>
                                {txName === 'TransferOwnership' && (
                                    <div className={styles.subcard}>
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
                                        <TransferOwnership />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Component
