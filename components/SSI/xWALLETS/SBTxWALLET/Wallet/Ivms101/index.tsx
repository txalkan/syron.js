import React, { useState, useEffect } from 'react'
import { useStore as effectorStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import { /*decryptKey,*/ encryptData } from '../../../../../../src/lib/dkms'
import { setTxStatusLoading, setTxId } from '../../../../../../src/app/actions'
import { RootState } from '../../../../../../src/app/reducers'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../src/store/modal'
import { useTranslation } from 'next-i18next'
// import smartContract from '../../../../../../src/utils/smartContract'
// import { $arconnect } from '../../../../../../src/store/arconnect'
import toastTheme from '../../../../../../src/hooks/toastTheme'
import { Arrow, Donate, Spinner } from '../../../../..'
import TickIco from '../../../../../../src/assets/icons/tick.svg'
// import InfoDefaultReg from '../../../../../../src/assets/icons/info_default.svg'
// import InfoDefaultBlack from '../../../../../../src/assets/icons/info_default_black.svg'
// import InfoYellow from '../../../../../../src/assets/icons/warning.svg'
// import InfoPurple from '../../../../../../src/assets/icons/warning_purple.svg'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
// import defaultCheckmark from '../../../../../../src/assets/icons/default_checkmark.svg'
// import selectedCheckmark from '../../../../../../src/assets/icons/selected_checkmark.svg'
import { $doc } from '../../../../../../src/store/did-doc'
// import useArConnect from '../../../../../../src/hooks/useArConnect'
import ThreeDots from '../../../../../Spinner/ThreeDots'
import { sendTelegramNotificationCoop } from '../../../../../../src/telegram'
import { $net } from '../../../../../../src/store/network'
import { useStore } from 'react-stores'

function Component({
    txName,
    handleIssuer,
    savedIssuer,
    setSavedIssuer,
    loading,
    issuerInput,
    setIssuerInput,
    issuerName,
    publicEncryption,
}) {
    // const { connect } = useArConnect()
    // const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    // const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const donation = effectorStore($donation)
    const resolvedInfo = useStore($resolvedInfo)
    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    // const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
    // const InfoColor = isLight ? InfoPurple : InfoYellow
    const doc = effectorStore($doc)
    const controller = doc?.controller
    // const dkms = doc?.dkms
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const isController = controller === zilAddr?.base16
    const [telegramUser, setTelegramUser] = useState('')
    const [fullName, setFullName] = useState('')
    const [country, setCountry] = useState('')
    const [idNumber, setIDNumber] = useState('')
    const [userSign, setUserSign] = useState('')
    // const [userSignAuto, setUserSignAuto] = useState('') //@reviewed: this used to be to generate auto sign, but atm disabled since need arconnect and we don't have it on mobile
    const [savedTelegramUser, setSavedTelegram] = useState(false)
    const [savedFullName, setSavedFullName] = useState(false)
    const [savedCountry, setSavedCountry] = useState(false)
    const [savedIDNumber, setSavedIDNumber] = useState(false)
    // const [savedSign, setSavedSign] = useState(false)
    const [isUserSignature, setIsUserSignature] = useState(false)
    // const [isLoadingSign, setIsLoadingSign] = useState(false)
    // const [isLoadingGenerate, setIsLoadingGenerate] = useState(false)
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
    // const [signature, setSignature] = useState('')

    // @reviewed: simplify
    // const copyToClipboard = (text) => {
    //     navigator.clipboard.writeText(text)
    //     toast.info('Signature copied to clipboard.', {
    //         position: 'top-center',
    //         autoClose: 2000,
    //         hideProgressBar: false,
    //         closeOnClick: true,
    //         pauseOnHover: true,
    //         draggable: true,
    //         progress: undefined,
    //         theme: toastTheme(isLight),
    //     })
    // }

    const [issuer, setIssuer] = useState('')
    const onChangeIssuer = (event: { target: { value: any } }) => {
        setSavedIssuer(false)
        const input = String(event.target.value).toLowerCase()
        setIssuerInput(input)
        setIssuer(input)
    }

    const handleOnKeyPressIssuer = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleIssuer()
        }
    }

    const handleTelegramUser = (event: { target: { value: any } }) => {
        setSavedTelegram(false)
        setSavedFullName(false)
        setSavedCountry(false)
        setSavedIDNumber(false)
        setIsUserSignature(false)
        // setSavedSign(false)
        setTelegramUser('')
        setFullName('')
        setCountry('')
        setIDNumber('')
        const input = event.target.value
        setTelegramUser(String(input))
    }
    const handleFullName = (event: { target: { value: any } }) => {
        setSavedFullName(false)
        setSavedCountry(false)
        setSavedIDNumber(false)
        setIsUserSignature(false)
        // setSavedSign(false)
        setFullName('')
        setCountry('')
        setIDNumber('')
        const input = event.target.value
        setFullName(String(input))
    }
    const handleCountry = (event: { target: { value: any } }) => {
        setSavedCountry(false)
        setSavedIDNumber(false)
        setIsUserSignature(false)
        // setSavedSign(false)
        setCountry('')
        setIDNumber('')
        const input = event.target.value
        setCountry(String(input))
    }
    const handleIDNumber = (event: { target: { value: any } }) => {
        setSavedIDNumber(false)
        setIsUserSignature(false)
        // setSavedSign(false)
        setIDNumber('')
        const input = event.target.value
        setIDNumber(String(input))
    }
    // const handleSign = (event: { target: { value: any } }) => {
    //     // setSavedSign(false)
    //     const input = event.target.value
    //     setUserSign(String(input))
    // }

    // const handleSaveSignature = () => {
    //     if (userSign.slice(0, 2) !== '0x') {
    //         toast.warn('A DID Signature must start with 0x', {
    //             position: 'top-right',
    //             autoClose: 3000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: true,
    //             draggable: true,
    //             progress: undefined,
    //             theme: toastTheme(isLight),
    //             toastId: 1,
    //         })
    //     } else {
    //         setSavedSign(true)
    //     }
    // }

    const checkIsEmpty = (val, action) => {
        if (val === '') {
            toast.warn("Can't be empty", {
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
            action()
        }
    }

    const handleOnKeyPressFirstName = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            checkIsEmpty(telegramUser, () => setSavedTelegram(true))
        }
    }

    const handleOnKeyPressLastName = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            checkIsEmpty(fullName, () => setSavedFullName(true))
        }
    }

    const handleOnKeyPressCountry = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            checkIsEmpty(country, () => setSavedCountry(true))
        }
    }

    const handleOnKeyPressPassport = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            checkIsEmpty(idNumber, () => setSavedIDNumber(true))
        }
    }

    // const handleOnKeyPressSign = ({
    //     key,
    // }: React.KeyboardEvent<HTMLInputElement>) => {
    //     if (key === 'Enter') {
    //         handleSaveSignature()
    //     }
    // }

    const is_complete =
        issuerName !== '' &&
        issuerInput !== '' &&
        // inputB !== '' &&
        savedTelegramUser &&
        savedFullName &&
        savedCountry &&
        savedIDNumber

    const webHookIvms = async (message) => {
        console.log('SEND MESSAGE TO TELEGRAM')
        const request = {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: `Travel Rule message from @${telegramUser}:\n ${message}`,
        }
        await sendTelegramNotificationCoop(request.body)
        //await fetch(`${process.env.NEXT_PUBLIC_WEBHOOK_IVMS_URL}`, request)
    }

    const handleSubmit = async () => {
        setIsLoadingSubmit(true)
        if (resolvedInfo !== null) {
            let message: any = {
                telegram_user: telegramUser,
                full_name: fullName,
                country: country,
                id_number: idNumber,
            }
            try {
                const zilpay = new ZilPayBase()
                let params = Array()

                if (is_complete) {
                    // encrypt message
                    //@todo-x-check move to HandleIssuer in index (issuer addr must be an SBTxWallet with a public encryption !== ""
                    // have public_encryption as function input (to avoid running the following here)

                    console.log('Public encryption', publicEncryption)
                    message = await encryptData(message, publicEncryption)

                    let userSignature =
                        await tyron.TyronZil.default.OptionParam(
                            tyron.TyronZil.Option.none,
                            'ByStr64'
                        )

                    if (isUserSignature && !isController) {
                        // submitted by an SSI Agent
                        userSignature =
                            await tyron.TyronZil.default.OptionParam(
                                tyron.TyronZil.Option.some,
                                'ByStr64',
                                userSign
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
                        `You're about to send an encrypted Travel Rule!`,
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

                    console.log('TXN_PARAMS', JSON.stringify(params, null, 2))
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
                            tx = await tx.confirm(res.ID, 33)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                                if (issuerName === 'tyron') {
                                    webHookIvms(message)
                                }
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                                setTimeout(() => {
                                    toast.warn(t('Transaction failed.'), {
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
                            throw err
                        })
                }
            } catch (error) {
                toast.warn(String(error), {
                    position: 'top-right',
                    autoClose: 3000,
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
        setIsLoadingSubmit(false)
    }

    const renderSubmitBtn = () => {
        if (isController) {
            if (!isUserSignature) {
                if (donation !== null && is_complete) {
                    return true
                } else {
                    return false
                }
            }
        }
        // if (!isUserSignature) {
        //     if (donation !== null && is_complete) {
        //         return true
        //     } else {
        //         return false
        //     }
        // } else {
        //     if (!isController && !savedSign) {
        //         return false
        //     } else {
        //         return is_complete
        //     }
        // }
    }

    // @reviewed: simplify
    // const generateSign = async () => {
    //     setIsLoadingGenerate(true)
    //     await connect().then(async () => {
    //         const arConnect = $arconnect.getState()
    //         if (arConnect) {
    //             try {
    //                 let message: any = {
    //                     firstname: telegramUser,
    //                     lastname: fullName,
    //                     country: country,
    //                     passport: idNumber,
    //                 }
    //                 const public_encryption = await getSmartContract(
    //                     issuerInput,
    //                     'public_encryption'
    //                 )
    //                     .then((public_enc) => {
    //                         return public_enc!.result.public_encryption
    //                     })
    //                     .catch(() => {
    //                         throw new Error('No public encryption found')
    //                     })
    //                 message = await encryptData(message, public_encryption)
    //                 const hash = await tyron.Util.default.HashString(message)
    //                 try {
    //                     const encrypted_key = dkms.get(resolvedTLD)
    //                     const private_key = await decryptKey(
    //                         arConnect,
    //                         encrypted_key
    //                     )
    //                     const public_key =
    //                         zcrypto.getPubKeyFromPrivateKey(private_key)
    //                     const userSignature = zcrypto.sign(
    //                         Buffer.from(hash, 'hex'),
    //                         private_key,
    //                         public_key
    //                     )
    //                     setSignature(userSignature)
    //                 } catch (error) {
    //                     throw new Error('Identity verification unsuccessful.')
    //                 }
    //             } catch (error) {
    //                 toast.warn(String(error), {
    //                     position: 'top-right',
    //                     autoClose: 2000,
    //                     hideProgressBar: false,
    //                     closeOnClick: true,
    //                     pauseOnHover: true,
    //                     draggable: true,
    //                     progress: undefined,
    //                     theme: toastTheme(isLight),
    //                     toastId: 13,
    //                 })
    //             }
    //         }
    //     })
    //     setIsLoadingGenerate(false)
    // }

    // const toggleCheck = async () => {
    //     updateDonation(null)
    //     setIsUserSignature(!isUserSignature)
    // }

    useEffect(() => {
        setSavedTelegram(false)
        setSavedFullName(false)
        setSavedCountry(false)
        setSavedIDNumber(false)
        // setSavedSign(false)
    }, [handleIssuer])

    return (
        <div className={styles.container}>
            <div>
                {/* @review: sbt asap */}
                {/* <div style={{ marginBottom: '2rem' }}>
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
                                    src={InfoColor}
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
                </div> */}
                <div className={styles.travelRule}>
                    All your personal data gets encrypted, and only the SBT
                    Issuer can decrypt it.
                </div>
                <div className={styles.label}>SBT Issuer</div>
                <section className={styles.container2}>
                    <input
                        className={styles.input}
                        type="text"
                        onChange={onChangeIssuer}
                        onKeyPress={handleOnKeyPressIssuer}
                        value={issuer}
                    />
                    <div className={styles.arrowWrapper}>
                        <div
                            className={
                                savedIssuer || loading ? 'continueBtnSaved' : ''
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
                                <>
                                    {savedIssuer ? (
                                        <Image
                                            width={50}
                                            height={50}
                                            src={TickIco}
                                            alt="arrow"
                                        />
                                    ) : (
                                        <Arrow width={50} height={50} />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </section>
                {/* <section className={styles.container2}>
                    <label>discord</label>
                    contact
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Type your Discord username"
                        onChange={handleInputB}
                    />
                </section> */}
                {savedIssuer && (
                    <div>
                        <label className={styles.label}>
                            telegram username
                        </label>
                        <section className={styles.container2}>
                            @
                            <input
                                className={styles.input}
                                type="text"
                                // placeholder="Type your first name"
                                onChange={handleTelegramUser}
                                onKeyPress={handleOnKeyPressFirstName}
                            />
                            <div className={styles.arrowWrapper}>
                                <div
                                    className={
                                        savedTelegramUser
                                            ? 'continueBtnSaved'
                                            : ''
                                    }
                                    onClick={() =>
                                        checkIsEmpty(telegramUser, () =>
                                            setSavedTelegram(true)
                                        )
                                    }
                                >
                                    {savedTelegramUser ? (
                                        <Image
                                            width={50}
                                            height={50}
                                            src={TickIco}
                                            alt="arrow"
                                        />
                                    ) : (
                                        <Arrow width={50} height={50} />
                                    )}
                                </div>
                            </div>
                        </section>
                        {savedTelegramUser && (
                            <div>
                                <label className={styles.label}>
                                    full name
                                </label>
                                <section className={styles.container2}>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        // placeholder="Type your last name"
                                        onChange={handleFullName}
                                        onKeyPress={handleOnKeyPressLastName}
                                    />
                                    <div className={styles.arrowWrapper}>
                                        <div
                                            className={
                                                savedFullName
                                                    ? 'continueBtnSaved'
                                                    : ''
                                            }
                                            onClick={() =>
                                                checkIsEmpty(fullName, () =>
                                                    setSavedFullName(true)
                                                )
                                            }
                                        >
                                            {savedFullName ? (
                                                <Image
                                                    width={50}
                                                    height={50}
                                                    src={TickIco}
                                                    alt="arrow"
                                                />
                                            ) : (
                                                <Arrow width={50} height={50} />
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                        {savedFullName && (
                            <div>
                                <label className={styles.label}>country</label>
                                <section className={styles.container2}>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        // placeholder="Type your country of residence"
                                        onChange={handleCountry}
                                        onKeyPress={handleOnKeyPressCountry}
                                    />
                                    <div className={styles.arrowWrapper}>
                                        <div
                                            className={
                                                savedCountry
                                                    ? 'continueBtnSaved'
                                                    : ''
                                            }
                                            onClick={() =>
                                                checkIsEmpty(country, () =>
                                                    setSavedCountry(true)
                                                )
                                            }
                                        >
                                            {savedCountry ? (
                                                <Image
                                                    width={50}
                                                    height={50}
                                                    src={TickIco}
                                                    alt="arrow"
                                                />
                                            ) : (
                                                <Arrow width={50} height={50} />
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                        {savedCountry && (
                            <div>
                                <label className={styles.label}>
                                    id number
                                </label>
                                <section className={styles.container2}>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        // placeholder="Type your passport number or national ID"
                                        onChange={handleIDNumber}
                                        onKeyPress={handleOnKeyPressPassport}
                                    />
                                    <div className={styles.arrowWrapper}>
                                        <div
                                            className={
                                                savedIDNumber
                                                    ? 'continueBtnSaved'
                                                    : ''
                                            }
                                            onClick={() => {
                                                checkIsEmpty(idNumber, () =>
                                                    setSavedIDNumber(true)
                                                )
                                            }}
                                        >
                                            {savedIDNumber ? (
                                                <Image
                                                    width={50}
                                                    height={50}
                                                    src={TickIco}
                                                    alt="arrow"
                                                />
                                            ) : (
                                                <Arrow width={50} height={50} />
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* {savedIDNumber && (
                <>
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
                    {isUserSignature && (
                        <>
                            {isController ? (
                                // make signature
                                <div
                                    style={{
                                        marginTop: '10%',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <div
                                        className={
                                            isLight
                                                ? 'actionBtnLight'
                                                : 'actionBtn'
                                        }
                                        onClick={generateSign}
                                    >
                                        {isLoadingGenerate ? (
                                            <ThreeDots color="yellow" />
                                        ) : (
                                            <>
                                                {t('MAKE')}&nbsp;
                                                <span>{t('SIGNATURE')}</span>
                                            </>
                                        )}
                                    </div>
                                    {signature !== '' && (
                                        <>
                                            <h4>
                                                {t(
                                                    'YOUR SOCIAL RECOVERY SIGNATURE:'
                                                )}
                                            </h4>
                                            <div
                                                style={{ marginBottom: '2rem' }}
                                                onClick={() =>
                                                    copyToClipboard(signature)
                                                }
                                            >
                                                {signature}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                // input signature
                                <section className={styles.container2}>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        placeholder="Type signature"
                                        onChange={handleSign}
                                        onKeyPress={handleOnKeyPressSign}
                                    />
                                    <div className={styles.arrowWrapper}>
                                        <div
                                            className={
                                                savedSign
                                                    ? 'continueBtnSaved'
                                                    : ''
                                            }
                                            onClick={handleSaveSignature}
                                        >
                                            {savedSign ? (
                                                <Image
                                                    width={50}
                                                    height={50}
                                                    src={TickIco}
                                                    alt="arrow"
                                                />
                                            ) : (
                                                <Arrow width={50} height={50} />
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </>
                    )} */}
            {/* {isController && (
                        <div className={styles.txtSign}>
                            {isLoadingSign ? <Spinner /> : userSignAuto}
                        </div>
                    )} */}
            {/* </>
            )} */}
            {isController && is_complete && !isUserSignature && <Donate />}
            {/* {!isUserSignature && !isLoadingSign && savedPassport && <Donate />} */}
            {renderSubmitBtn() && (
                <div className={styles.btnWrapper}>
                    <div
                        className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        onClick={handleSubmit}
                        style={{ width: '100%' }}
                    >
                        {isLoadingSubmit ? (
                            <ThreeDots color="yellow" />
                        ) : (
                            <>Send Travel Rule</>
                        )}
                    </div>
                    <div className={styles.gasTxt}>Gas lower than 3 ZIL</div>
                    {/* @review: translates */}
                </div>
            )}
        </div>
    )
}

export default Component
