import React, { useState, useCallback } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { decryptKey, encryptData } from '../../../../src/lib/dkms'
import { setTxStatusLoading, setTxId } from '../../../../src/app/actions'
import { RootState } from '../../../../src/app/reducers'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../../src/utils/smartContract'
import { $arconnect } from '../../../../src/store/arconnect'
import toastTheme from '../../../../src/hooks/toastTheme'
import { $donation } from '../../../../src/store/donation'

function Component({ txName }) {
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const donation = useStore($donation)
    let donation_ = String(donation)
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const arConnect = useStore($arconnect)
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const [issuerName, setIssuerName] = useState('')
    // const [issuerDomain, setIssuerDomain] = useState('')
    const [issuerAddr, setIssuerAddr] = useState('')
    // const [inputB, setInputB] = useState('')
    const [firstname, setFirstName] = useState('')
    const [lastname, setLastName] = useState('')
    const [country, setCountry] = useState('')
    const [passport, setPassport] = useState('')

    const handleIssuer = async (event: { target: { value: any } }) => {
        setIssuerAddr('')
        const input = String(event.target.value).toLowerCase()
        let username_ = ''
        let domain_ = ''
        if (input.includes('@')) {
            const [domain = '', username = ''] = input.split('@')
            username_ = username.replace('.did', '')
            domain_ = domain
        } else {
            if (input.includes('.')) {
                toast.error(t('Invalid'), {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
            } else {
                username_ = input
            }
        }
        setIssuerName(username_)
        // setIssuerDomain(domain_)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, username_, domain_)
            .then(async (addr) => {
                setIssuerAddr(addr)
            })
            .catch(() => {
                //@todo-i add continue/saved and do this verification then
                // add @todo-i#2 to this verification
                // toast.error(t('Invalid'), {
                //     position: 'top-right',
                //     autoClose: 3000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: toastTheme(isLight),
                //     toastId: 1
                // })
            })
    }
    // const handleInputB = (event: { target: { value: any } }) => {
    //     const input = event.target.value
    //     setInputB(String(input).toLowerCase())
    // }
    const handleFirstName = (event: { target: { value: any } }) => {
        const input = event.target.value
        setFirstName(String(input).toLowerCase())
    }
    const handleLastName = (event: { target: { value: any } }) => {
        const input = event.target.value
        setLastName(String(input).toLowerCase())
    }
    const handleCountry = (event: { target: { value: any } }) => {
        const input = event.target.value
        setCountry(String(input).toLowerCase())
    }
    const handlePassport = (event: { target: { value: any } }) => {
        const input = event.target.value
        setPassport(String(input).toLowerCase())
    }

    const handleSubmit = async () => {
        if (resolvedInfo !== null) {
            try {
                const zilpay = new ZilPayBase()
                let params = Array()
                let is_complete: boolean
                is_complete =
                    issuerName !== '' &&
                    issuerAddr !== '' &&
                    // inputB !== '' &&
                    firstname !== '' &&
                    lastname !== '' &&
                    country !== '' &&
                    passport !== ''
                if (is_complete) {
                    let message: any = {
                        firstname: firstname,
                        lastname: lastname,
                        country: country,
                        passport: passport,
                    }

                    // encrypt message

                    //@todo-i#2 add to issuer verification and save public_encryption en useState
                    const public_encryption = await getSmartContract(
                        issuerAddr,
                        'public_encryption'
                    )
                        .then((public_enc) => {
                            return public_enc.result.public_encryption
                        })
                        .catch(() => {
                            throw new Error('No public encryption found')
                        })

                    message = await encryptData(message, public_encryption)
                    const hash = await tyron.Util.default.HashString(message)

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
                        `You're about to submit your encrypted IVMS101 Message!`,
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
                            amount: donation_,
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
                </p>
                <p>
                    So that your self-sovereign identity complies with the FATF
                    Travel Rule (to make sure you are not a terrorist or
                    involved in illicit activities like money laundering).
                </p>
                <code>
                    All your personal, private data will get encrypted! Only the
                    Issuer can decrypt it.
                </code>
                {/* 
                @todo-i move handle issuer to ../index to use in other components, e.g. VC
                */}
                <section className={styles.container2}>
                    <label>VC</label>
                    Issuer
                    <input
                        ref={callbackRef}
                        className={styles.input}
                        type="text"
                        placeholder="Type domain name, e.g. sbt@tyron.did"
                        onChange={handleIssuer}
                        // value={ }
                        autoFocus
                    />
                </section>
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
                {issuerAddr !== '' && (
                    <div>
                        <section className={styles.container2}>
                            <label>first</label>
                            name
                            <input
                                ref={callbackRef}
                                className={styles.input}
                                type="text"
                                placeholder="Type your first name"
                                onChange={handleFirstName}
                                autoFocus
                            />
                        </section>
                        <section className={styles.container2}>
                            <label>last</label>
                            name
                            <input
                                ref={callbackRef}
                                className={styles.input}
                                type="text"
                                placeholder="Type your last name"
                                onChange={handleLastName}
                                autoFocus
                            />
                        </section>
                        <section className={styles.container2}>
                            <label>country</label>
                            of residence
                            <input
                                ref={callbackRef}
                                className={styles.input}
                                type="text"
                                placeholder="Type your country of residence"
                                onChange={handleCountry}
                                autoFocus
                            />
                        </section>
                        <section className={styles.container2}>
                            <label>passport</label>
                            number
                            <input
                                ref={callbackRef}
                                className={styles.input}
                                type="text"
                                placeholder="Type your passport number or national ID"
                                onChange={handlePassport}
                                autoFocus
                            />
                        </section>
                    </div>
                )}
            </div>
            <div className={styles.btnWrapper}>
                <div
                    className={isLight ? 'actionBtnLight' : 'actionBtn'}
                    onClick={handleSubmit}
                >
                    Submit Travel Rule
                </div>
                <div className={styles.gasTxt}>Cost is less than 2 ZIL</div>
            </div>
        </div>
    )
}

export default Component
