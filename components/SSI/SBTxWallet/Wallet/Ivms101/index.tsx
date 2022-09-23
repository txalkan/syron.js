import React, { useState, useCallback, useEffect } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { decryptKey, encryptData } from '../../../../../src/lib/dkms'
import { setTxStatusLoading, setTxId } from '../../../../../src/app/actions'
import { RootState } from '../../../../../src/app/reducers'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../../../src/utils/smartContract'
import { $arconnect } from '../../../../../src/store/arconnect'
import toastTheme from '../../../../../src/hooks/toastTheme'
import { Donate, Spinner } from '../../../..'
import TickIco from '../../../../../src/assets/icons/tick.svg'
import ContinueArrow from '../../../../../src/assets/icons/continue_arrow.svg'
import InfoDefaultReg from '../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../src/assets/icons/info_default_black.svg'
import InfoYellow from '../../../../../src/assets/icons/warning.svg'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import defaultCheckmark from '../../../../../src/assets/icons/default_checkmark.svg'
import selectedCheckmark from '../../../../../src/assets/icons/selected_checkmark.svg'
import { $doc } from '../../../../../src/store/did-doc'

function Component({
    txName,
    handleIssuer,
    savedIssuer,
    setSavedIssuer,
    loading,
    issuerInput,
    setIssuerInput,
    issuerName,
}) {
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const donation = useStore($donation)
    const arConnect = useStore($arconnect)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
    const controller = useStore($doc)?.controller
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const isController = controller === zilAddr?.base16

    // const [issuerDomain, setIssuerDomain] = useState('')
    // const [inputB, setInputB] = useState('')
    const [firstname, setFirstName] = useState('')
    const [lastname, setLastName] = useState('')
    const [country, setCountry] = useState('')
    const [passport, setPassport] = useState('')
    const [userSign, setUserSign] = useState('')
    const [userSignAuto, setUserSignAuto] = useState('')
    const [savedFirstname, setSavedFirstName] = useState(false)
    const [savedLastname, setSavedLastName] = useState(false)
    const [savedCountry, setSavedCountry] = useState(false)
    const [savedPassport, setSavedPassport] = useState(false)
    const [savedSign, setSavedSign] = useState(false)
    const [isUserSignature, setIsUserSignature] = useState(false)
    const [isLoadingSign, setIsLoadingSign] = useState(false)

    const onChangeIssuer = (event: { target: { value: any } }) => {
        setSavedIssuer(false)
        setIssuerInput('')
        const input = String(event.target.value)
        setIssuerInput(input)
    }

    const handleOnKeyPressIssuer = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleIssuer()
        }
    }

    // const handleInputB = (event: { target: { value: any } }) => {
    //     const input = event.target.value
    //     setInputB(String(input).toLowerCase())
    // }

    // @todo-i-fixed make sure that the inputs are not empty && add continue/saved icons for each step
    const handleFirstName = (event: { target: { value: any } }) => {
        setSavedFirstName(false)
        setSavedLastName(false)
        setSavedCountry(false)
        setSavedPassport(false)
        setSavedSign(false)
        const input = event.target.value
        setFirstName(String(input))
    }
    const handleLastName = (event: { target: { value: any } }) => {
        setSavedLastName(false)
        setSavedCountry(false)
        setSavedPassport(false)
        setSavedSign(false)
        const input = event.target.value
        setLastName(String(input))
    }
    const handleCountry = (event: { target: { value: any } }) => {
        setSavedCountry(false)
        setSavedPassport(false)
        setSavedSign(false)
        const input = event.target.value
        setCountry(String(input))
    }
    const handlePassport = (event: { target: { value: any } }) => {
        setSavedPassport(false)
        setSavedSign(false)
        const input = event.target.value
        setPassport(String(input))
    }
    const handleSign = (event: { target: { value: any } }) => {
        setSavedSign(false)
        const input = event.target.value
        setUserSign(String(input))
    }

    const handleSaveSignature = () => {
        if (userSign.slice(0, 2) !== '0x') {
            toast.error('A DID Signature must start with 0x', {
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
        } else {
            setSavedSign(true)
        }
    }

    const handleOnKeyPressFirstName = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setSavedFirstName(true)
        }
    }

    const handleOnKeyPressLastName = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setSavedLastName(true)
        }
    }

    const handleOnKeyPressCountry = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setSavedCountry(true)
        }
    }

    const handleOnKeyPressPassport = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setSavedPassport(true)
            if (isController) {
                generateSign()
            }
        }
    }

    const handleOnKeyPressSign = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSaveSignature()
        }
    }

    const is_complete =
        issuerName !== '' &&
        issuerInput !== '' &&
        // inputB !== '' &&
        firstname !== '' &&
        lastname !== '' &&
        country !== '' &&
        passport !== ''

    const webHookIvms = async (message) => {
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: `${domain}@${username}.did\nMessage: ${message}`,
        }
        await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_IVMS_URL}`, request)
    }

    const handleSubmit = async () => {
        if (resolvedInfo !== null) {
            let message: any = {
                firstname: firstname,
                lastname: lastname,
                country: country,
                passport: passport,
            }
            try {
                const zilpay = new ZilPayBase()
                let params = Array()

                if (is_complete) {
                    // encrypt message

                    //@todo-i#2-fixed add to issuer verification (issuer addr must be an SBTxWallet with a public encryption !== ""
                    // save public_encryption en useState (to avoid running the following here)
                    const public_encryption = await getSmartContract(
                        issuerInput,
                        'public_encryption'
                    )
                        .then((public_enc) => {
                            return public_enc.result.public_encryption
                        })
                        .catch(() => {
                            throw new Error('No public encryption found')
                        })
                    console.log('Public encryption', public_encryption)
                    message = await encryptData(message, public_encryption)
                    const hash = await tyron.Util.default.HashString(message)

                    //@todo-i-? add fetch doc in use state for /public & then use dkms from storage: you mean useEffect? Then where should we use dkms
                    const result: any = await tyron.SearchBarUtil.default
                        .fetchAddr(net, username!, 'did')
                        .then(async (addr) => {
                            return await tyron.SearchBarUtil.default.Resolve(
                                net,
                                addr
                            )
                        })
                        .catch((err) => {
                            throw err
                        })

                    let userSignature: any

                    if (!isUserSignature) {
                        // it does not require the user signature
                        userSignature =
                            await tyron.TyronZil.default.OptionParam(
                                tyron.TyronZil.Option.none,
                                'ByStr64'
                            )
                        // try {
                        //     const encrypted_key = result.dkms?.get(domain)
                        //     const private_key = await decryptKey(
                        //         arConnect,
                        //         encrypted_key
                        //     )
                        //     const public_key =
                        //         zcrypto.getPubKeyFromPrivateKey(private_key)
                        //     userSignature =
                        //         await tyron.TyronZil.default.OptionParam(
                        //             tyron.TyronZil.Option.some,
                        //             'ByStr64',
                        //             '0x' +
                        //             zcrypto.sign(
                        //                 Buffer.from(hash, 'hex'),
                        //                 private_key,
                        //                 public_key
                        //             )
                        //         )
                        // } catch (error) {
                        //     throw new Error(
                        //         'Identity verification unsuccessful.'
                        //     )
                        // }
                    } else {
                        // submitted by an agent
                        userSignature =
                            await tyron.TyronZil.default.OptionParam(
                                tyron.TyronZil.Option.some,
                                'ByStr64',
                                userSign
                                //@todo-i-fixed user signature from input
                            )
                    }

                    const tyron_ = await tyron.Donation.default.tyron(donation!)

                    params = await tyron.TyronZil.default.Ivms101(
                        issuerName,
                        message,
                        userSignature,
                        tyron_
                    )
                } else {
                    throw new Error('Input data is missing')
                }

                if (is_complete) {
                    toast.info(
                        `You're about to submit an encrypted Travel Rule!`,
                        {
                            position: 'top-center',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                        }
                    )

                    dispatch(setTxStatusLoading('true'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    let tx = await tyron.Init.default.transaction(net)
                    await zilpay
                        .call({
                            contractAddress: resolvedInfo.addr!,
                            transition: txName,
                            params: params,
                            amount: String(donation),
                        })
                        .then(async (res) => {
                            dispatch(setTxId(res.ID))
                            dispatch(setTxStatusLoading('submitted'))
                            tx = await tx.confirm(res.ID)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                                if (issuerName === 'tyron') {
                                    webHookIvms(message)
                                }
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                                setTimeout(() => {
                                    toast.error(t('Transaction failed.'), {
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
                            dispatch(setTxStatusLoading('rejected'))
                            updateModalTxMinimized(false)
                            updateModalTx(true)
                            toast.error(String(err), {
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
                }
            } catch (error) {
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 12,
                })
            }
        }
    }

    const renderSubmitBtn = () => {
        if (!isUserSignature) {
            if (donation !== null && is_complete) {
                return true
            } else {
                return false
            }
        } else {
            if (!isController && !savedSign) {
                return false
            } else {
                return is_complete
            }
        }
    }

    const generateSign = async () => {
        setIsLoadingSign(true)
        let message: any = {
            firstname: firstname,
            lastname: lastname,
            country: country,
            passport: passport,
        }
        const public_encryption = await getSmartContract(
            issuerInput,
            'public_encryption'
        )
            .then((public_enc) => {
                return public_enc.result.public_encryption
            })
            .catch(() => {
                throw new Error('No public encryption found')
            })
        console.log('Public encryption', public_encryption)
        message = await encryptData(message, public_encryption)
        const hash = await tyron.Util.default.HashString(message)
        const result: any = await tyron.SearchBarUtil.default
            .fetchAddr(net, username!, 'did')
            .then(async (addr) => {
                return await tyron.SearchBarUtil.default.Resolve(net, addr)
            })
            .catch((err) => {
                setIsLoadingSign(false)
                throw err
            })

        const encrypted_key = result.dkms?.get(domain)
        const private_key = await decryptKey(arConnect, encrypted_key)
        const public_key = zcrypto.getPubKeyFromPrivateKey(private_key)
        const userSignature = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.some,
            'ByStr64',
            '0x' +
                zcrypto.sign(Buffer.from(hash, 'hex'), private_key, public_key)
        )
        setUserSignAuto(userSignature?.arguments[0])
        navigator.clipboard.writeText(userSignature?.arguments[0])
        toast.info('Signature copied to clipboard!', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: toastTheme(isLight),
            toastId: 1,
        })
        setIsLoadingSign(false)
    }

    const toggleCheck = async () => {
        updateDonation(null)
        setIsUserSignature(!isUserSignature)
    }

    useEffect(() => {
        setSavedFirstName(false)
        setSavedLastName(false)
        setSavedCountry(false)
        setSavedPassport(false)
        setSavedSign(false)
    }, [handleIssuer])

    return (
        <div className={styles.container}>
            <div>
                <p>
                    Complete the following information for an{' '}
                    <a
                        href={`https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf`}
                        rel="noreferrer"
                        target="_blank"
                    >
                        IVMS101 Message
                    </a>
                    .
                    <span className={styles.tooltip}>
                        <div className={styles.ico}>
                            <div className={styles.icoDefault}>
                                <Image
                                    alt="info-ico"
                                    src={InfoDefault}
                                    width={20}
                                    height={20}
                                />
                            </div>
                            <div className={styles.icoColor}>
                                <Image
                                    alt="info-ico"
                                    src={InfoYellow}
                                    width={20}
                                    height={20}
                                />
                            </div>
                        </div>
                        <span className={styles.tooltiptext}>
                            <div
                                style={{
                                    fontSize: '14px',
                                }}
                            >
                                So that your self-sovereign identity complies
                                with the FATF Travel Rule (to make sure you are
                                not a terrorist or involved in illicit
                                activities like money laundering).
                            </div>
                        </span>
                    </span>
                </p>
                <h6>
                    All your personal, private data will get encrypted, and only
                    the Issuer can decrypt it.
                </h6>
                <div>
                    <label className={styles.label}>VC Issuer</label>
                    <section className={styles.container2}>
                        <input
                            ref={callbackRef}
                            className={styles.input}
                            type="text"
                            placeholder="soul@tyron.did"
                            onChange={onChangeIssuer}
                            onKeyPress={handleOnKeyPressIssuer}
                            // value={ }
                            autoFocus
                        />
                        <div className={styles.arrowWrapper}>
                            <div
                                className={
                                    savedIssuer || loading
                                        ? 'continueBtnSaved'
                                        : 'continueBtn'
                                }
                                onClick={() => {
                                    if (!savedIssuer) {
                                        handleIssuer()
                                    }
                                }}
                            >
                                {loading ? (
                                    <Spinner />
                                ) : (
                                    <Image
                                        width={50}
                                        height={50}
                                        src={
                                            savedIssuer
                                                ? TickIco
                                                : ContinueArrow
                                        }
                                        alt="arrow"
                                    />
                                )}
                            </div>
                        </div>
                    </section>
                </div>
                {/* <section className={styles.container2}>
                    <label>discord</label>
                    contact
                    <input
                        ref={callbackRef}
                        className={styles.input}
                        type="text"
                        placeholder="Type your Discord username"
                        onChange={handleInputB}
                        autoFocus
                    />
                </section> */}
                {savedIssuer && (
                    <div>
                        <div>
                            <label className={styles.label}>first name</label>
                            <section className={styles.container2}>
                                <input
                                    ref={callbackRef}
                                    className={styles.input}
                                    type="text"
                                    // placeholder="Type your first name"
                                    onChange={handleFirstName}
                                    onKeyPress={handleOnKeyPressFirstName}
                                    autoFocus
                                />
                                <div className={styles.arrowWrapper}>
                                    <div
                                        className={
                                            savedFirstname
                                                ? 'continueBtnSaved'
                                                : 'continueBtn'
                                        }
                                        onClick={() => setSavedFirstName(true)}
                                    >
                                        <Image
                                            width={50}
                                            height={50}
                                            src={
                                                savedFirstname
                                                    ? TickIco
                                                    : ContinueArrow
                                            }
                                            alt="arrow"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                        {savedFirstname && (
                            <div>
                                <label className={styles.label}>
                                    last name
                                </label>
                                <section className={styles.container2}>
                                    <input
                                        ref={callbackRef}
                                        className={styles.input}
                                        type="text"
                                        // placeholder="Type your last name"
                                        onChange={handleLastName}
                                        onKeyPress={handleOnKeyPressLastName}
                                        autoFocus
                                    />
                                    <div className={styles.arrowWrapper}>
                                        <div
                                            className={
                                                savedLastname
                                                    ? 'continueBtnSaved'
                                                    : 'continueBtn'
                                            }
                                            onClick={() =>
                                                setSavedLastName(true)
                                            }
                                        >
                                            <Image
                                                width={50}
                                                height={50}
                                                src={
                                                    savedLastname
                                                        ? TickIco
                                                        : ContinueArrow
                                                }
                                                alt="arrow"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                        {savedLastname && (
                            <div>
                                <label className={styles.label}>
                                    country of residence
                                </label>
                                <section className={styles.container2}>
                                    <input
                                        ref={callbackRef}
                                        className={styles.input}
                                        type="text"
                                        // placeholder="Type your country of residence"
                                        onChange={handleCountry}
                                        onKeyPress={handleOnKeyPressCountry}
                                        autoFocus
                                    />
                                    <div className={styles.arrowWrapper}>
                                        <div
                                            className={
                                                savedCountry
                                                    ? 'continueBtnSaved'
                                                    : 'continueBtn'
                                            }
                                            onClick={() =>
                                                setSavedCountry(true)
                                            }
                                        >
                                            <Image
                                                width={50}
                                                height={50}
                                                src={
                                                    savedCountry
                                                        ? TickIco
                                                        : ContinueArrow
                                                }
                                                alt="arrow"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                        {savedCountry && (
                            <div>
                                <label className={styles.label}>
                                    passport number
                                </label>
                                <section className={styles.container2}>
                                    <input
                                        ref={callbackRef}
                                        className={styles.input}
                                        type="text"
                                        // placeholder="Type your passport number or national ID"
                                        onChange={handlePassport}
                                        onKeyPress={handleOnKeyPressPassport}
                                        autoFocus
                                    />
                                    <div className={styles.arrowWrapper}>
                                        <div
                                            className={
                                                savedPassport
                                                    ? 'continueBtnSaved'
                                                    : 'continueBtn'
                                            }
                                            onClick={() => {
                                                setSavedPassport(true)
                                                if (isController) {
                                                    generateSign()
                                                }
                                            }}
                                        >
                                            <Image
                                                width={50}
                                                height={50}
                                                src={
                                                    savedPassport
                                                        ? TickIco
                                                        : ContinueArrow
                                                }
                                                alt="arrow"
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {savedPassport && (
                <>
                    {!isController && (
                        <div
                            className={styles.checkBoxWrapper}
                            onClick={toggleCheck}
                        >
                            <div>
                                <Image
                                    src={
                                        isUserSignature
                                            ? selectedCheckmark
                                            : defaultCheckmark
                                    }
                                    alt="arrow"
                                />
                            </div>
                            <div>&nbsp;User&apos;s DID Signature</div>
                        </div>
                    )}
                    {isUserSignature && !isController && (
                        <section className={styles.container2}>
                            <input
                                ref={callbackRef}
                                className={styles.input}
                                type="text"
                                placeholder="Type signature"
                                onChange={handleSign}
                                onKeyPress={handleOnKeyPressSign}
                                autoFocus
                            />
                            <div className={styles.arrowWrapper}>
                                <div
                                    className={
                                        savedSign
                                            ? 'continueBtnSaved'
                                            : 'continueBtn'
                                    }
                                    onClick={handleSaveSignature}
                                >
                                    <Image
                                        width={50}
                                        height={50}
                                        src={
                                            savedSign ? TickIco : ContinueArrow
                                        }
                                        alt="arrow"
                                    />
                                </div>
                            </div>
                        </section>
                    )}
                    {isController && (
                        <div className={styles.txtSign}>
                            {isLoadingSign ? <Spinner /> : userSignAuto}
                        </div>
                    )}
                </>
            )}
            {!isUserSignature && !isLoadingSign && savedPassport && <Donate />}
            {renderSubmitBtn() && (
                <div className={styles.btnWrapper}>
                    <div
                        className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        onClick={handleSubmit}
                        style={{ width: '100%' }}
                    >
                        Submit Travel Rule
                    </div>
                    <div className={styles.gasTxt}>Cost is less than 2 ZIL</div>
                </div>
            )}
        </div>
    )
}

export default Component
