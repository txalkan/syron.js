import React, { useState, useCallback } from 'react'
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
import { Spinner } from '../../../..'
import TickIco from '../../../../../src/assets/icons/tick.svg'
import ContinueArrow from '../../../../../src/assets/icons/continue_arrow.svg'
import InfoDefaultReg from '../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../src/assets/icons/info_default_black.svg'
import InfoYellow from '../../../../../src/assets/icons/warning.svg'

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
    const arConnect = useStore($arconnect)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg

    // const [issuerDomain, setIssuerDomain] = useState('')
    // const [inputB, setInputB] = useState('')
    const [firstname, setFirstName] = useState('')
    const [lastname, setLastName] = useState('')
    const [country, setCountry] = useState('')
    const [passport, setPassport] = useState('')

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
        const input = event.target.value
        setFirstName(String(input))
    }
    const handleLastName = (event: { target: { value: any } }) => {
        const input = event.target.value
        setLastName(String(input))
    }
    const handleCountry = (event: { target: { value: any } }) => {
        const input = event.target.value
        setCountry(String(input))
    }
    const handlePassport = (event: { target: { value: any } }) => {
        const input = event.target.value
        setPassport(String(input))
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

                    let userSignature: string

                    try {
                        const encrypted_key = result.dkms?.get(domain)
                        const private_key = await decryptKey(
                            arConnect,
                            encrypted_key
                        )
                        const public_key =
                            zcrypto.getPubKeyFromPrivateKey(private_key)
                        userSignature =
                            '0x' +
                            zcrypto.sign(
                                Buffer.from(hash, 'hex'),
                                private_key,
                                public_key
                            )
                    } catch (error) {
                        throw new Error('Identity verification unsuccessful.')
                    }

                    params = await tyron.TyronZil.default.Ivms101(
                        issuerName,
                        message,
                        userSignature
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
                            amount: '0',
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
                                //@todo-i-fixed if the issuer name is "tyron" then send webhook to Discord with domain@username.did request and <message>
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
                {/* @todo-i-fixed turn the following <p> into info pop up */}
                <h6>
                    All your personal, private data will get encrypted! Only the
                    Issuer can decrypt it.
                </h6>
                {/* 
                @todo-i-fixed move handle issuer to ../index to use in other components, e.g. VC
                */}
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
                                    autoFocus
                                />
                                <div className={styles.arrowWrapper}>
                                    <div
                                        className={
                                            firstname !== ''
                                                ? 'continueBtnSaved'
                                                : 'continueBtn'
                                        }
                                    >
                                        <Image
                                            width={50}
                                            height={50}
                                            src={
                                                firstname !== ''
                                                    ? TickIco
                                                    : ContinueArrow
                                            }
                                            alt="arrow"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div>
                            <label className={styles.label}>last name</label>
                            <section className={styles.container2}>
                                <input
                                    ref={callbackRef}
                                    className={styles.input}
                                    type="text"
                                    // placeholder="Type your last name"
                                    onChange={handleLastName}
                                    autoFocus
                                />
                                <div className={styles.arrowWrapper}>
                                    <div
                                        className={
                                            lastname !== ''
                                                ? 'continueBtnSaved'
                                                : 'continueBtn'
                                        }
                                    >
                                        <Image
                                            width={50}
                                            height={50}
                                            src={
                                                lastname !== ''
                                                    ? TickIco
                                                    : ContinueArrow
                                            }
                                            alt="arrow"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
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
                                    autoFocus
                                />
                                <div className={styles.arrowWrapper}>
                                    <div
                                        className={
                                            country !== ''
                                                ? 'continueBtnSaved'
                                                : 'continueBtn'
                                        }
                                    >
                                        <Image
                                            width={50}
                                            height={50}
                                            src={
                                                country !== ''
                                                    ? TickIco
                                                    : ContinueArrow
                                            }
                                            alt="arrow"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
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
                                    autoFocus
                                />
                                <div className={styles.arrowWrapper}>
                                    <div
                                        className={
                                            passport !== ''
                                                ? 'continueBtnSaved'
                                                : 'continueBtn'
                                        }
                                    >
                                        <Image
                                            width={50}
                                            height={50}
                                            src={
                                                passport !== ''
                                                    ? TickIco
                                                    : ContinueArrow
                                            }
                                            alt="arrow"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
            {is_complete && (
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
