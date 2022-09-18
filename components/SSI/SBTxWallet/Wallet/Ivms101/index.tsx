import React, { useState, useCallback } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
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

function Component({ txName }) {
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
        const input = String(event.target.value)
        let username_ = ''
        let domain_ = ''
        if (input.includes('@')) {
            const [domain = '', username = ''] = input.split('@')
            username_ = username.replace('.did', '').toLowerCase()
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
                username_ = input.toLowerCase()
            }
        }
        setIssuerName(username_)
        // setIssuerDomain(domain_)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, username_, domain_)
            .then(async (addr) => {
                // setAddr only if this smart contract has version "SBTxWallet"
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

    // @todo-i make sure that the inputs are not empty && add continue/saved icons for each step
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
        issuerAddr !== '' &&
        // inputB !== '' &&
        firstname !== '' &&
        lastname !== '' &&
        country !== '' &&
        passport !== ''

    const handleSubmit = async () => {
        if (resolvedInfo !== null) {
            try {
                const zilpay = new ZilPayBase()
                let params = Array()

                if (is_complete) {
                    let message: any = {
                        firstname: firstname,
                        lastname: lastname,
                        country: country,
                        passport: passport,
                    }

                    // encrypt message

                    //@todo-i#2 add to issuer verification (issuer addr must be an SBTxWallet with a public encryption !== ""
                    // save public_encryption en useState (to avoid running the following here)
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
                    console.log('Public encryption', public_encryption)
                    message = await encryptData(message, public_encryption)
                    const hash = await tyron.Util.default.HashString(message)

                    //@todo-i add fetch doc in use state for /public & then use dkms from storage
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
                                //@todo-i if the issuer name is "tyron" then send webhook to Discord with domain@username.did request and <message>
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
                {/* @todo-i turn the following <p> into info pop up */}
                <p>
                    So that your self-sovereign identity complies with the FATF
                    Travel Rule (to make sure you are not a terrorist or
                    involved in illicit activities like money laundering).
                </p>
                <h6>
                    All your personal, private data will get encrypted! Only the
                    Issuer can decrypt it.
                </h6>
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
                        placeholder="soul@tyron.did"
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
