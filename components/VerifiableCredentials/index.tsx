import React, { useState, useCallback } from 'react'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { ZilPayBase } from '../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { decryptKey, encryptData } from '../../src/lib/dkms'
import { setTxStatusLoading, setTxId } from '../../src/app/actions'
import { RootState } from '../../src/app/reducers'
import { updateModalTx, updateModalTxMinimized } from '../../src/store/modal'
import { useTranslation } from 'next-i18next'
import Selector from '../Selector'
import smartContract from '../../src/utils/smartContract'
import { $arconnect } from '../../src/store/arconnect'
import toastTheme from '../../src/hooks/toastTheme'

function Component() {
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
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const resolvedInfo = useStore($resolvedInfo)
    const username = resolvedInfo?.name
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const [txName, setTxName] = useState('')
    const [input, setInput] = useState('')
    const [inputB, setInputB] = useState('')
    const [inputC, setInputC] = useState('')
    const [inputD, setInputD] = useState('')
    const [inputE, setInputE] = useState('')
    const [inputF, setInputF] = useState('')

    const handleOnChange = (value) => {
        const selection = value
        if (zilAddr === null) {
            toast.info('To continue, connect with ZilPay.', {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        } else {
            if (selection === 'Ivms101') {
                if (arConnect === null) {
                    toast.warning('Connect with ArConnect.', {
                        position: 'top-center',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                    })
                } else {
                    setTxName(selection)
                }
            } else {
                setTxName(selection)
            }
        }
    }

    const handleInput = (event: { target: { value: any } }) => {
        const input = event.target.value
        setInput(String(input).toLowerCase())
    }
    const handleInputB = (event: { target: { value: any } }) => {
        const input = event.target.value
        setInputB(String(input).toLowerCase())
    }
    const handleInputC = (event: { target: { value: any } }) => {
        const input = event.target.value
        setInputC(String(input).toLowerCase())
    }
    const handleInputD = (event: { target: { value: any } }) => {
        const input = event.target.value
        setInputD(String(input).toLowerCase())
    }
    const handleInputE = (event: { target: { value: any } }) => {
        const input = event.target.value
        setInputE(String(input).toLowerCase())
    }
    const handleInputF = (event: { target: { value: any } }) => {
        const input = event.target.value
        setInputF(String(input).toLowerCase())
    }

    const handleSubmit = async () => {
        if (resolvedInfo !== null) {
            try {
                const zilpay = new ZilPayBase()
                let params = Array()
                let is_complete
                if (txName === 'Ivms101') {
                    is_complete =
                        input !== '' &&
                        inputB !== '' &&
                        inputC !== '' &&
                        inputD !== '' &&
                        inputE !== '' &&
                        inputF !== ''
                    if (is_complete) {
                        let msg: any = {
                            discord: inputB,
                            firstname: inputC,
                            lastname: inputD,
                            country: inputE,
                            passport: inputF,
                        }

                        // encrypt message

                        let public_encryption
                        try {
                            const public_enc = await getSmartContract(
                                resolvedInfo?.addr!,
                                'public_encryption'
                            )
                            public_encryption =
                                public_enc.result.public_encryption
                        } catch (error) {
                            throw new Error('no public encryption found')
                        }
                        msg = await encryptData(msg, public_encryption)
                        const data = input + msg
                        const hash = await tyron.Util.default.HashString(data)

                        const result: any = await tyron.SearchBarUtil.default
                            .fetchAddr(net, input, 'did')
                            .then(async (addr) => {
                                return await tyron.SearchBarUtil.default.Resolve(
                                    net,
                                    addr
                                )
                            })
                            .catch((err) => {
                                throw err
                            })

                        let signature
                        try {
                            const encrypted_key = result.dkms?.get('assertion')
                            const private_key = await decryptKey(
                                arConnect,
                                encrypted_key
                            )
                            const public_key =
                                zcrypto.getPubKeyFromPrivateKey(private_key)
                            signature =
                                '0x' +
                                zcrypto.sign(
                                    Buffer.from(hash, 'hex'),
                                    private_key,
                                    public_key
                                )
                        } catch (error) {
                            throw new Error(
                                'Identity verification unsuccessful.'
                            )
                        }

                        params = await tyron.TyronZil.default.Ivms101(
                            input,
                            msg,
                            signature
                        )
                    } else {
                        throw new Error('input data is missing')
                    }
                } else if (txName === 'Verifiable_Credential') {
                    is_complete = input !== '' && inputB !== ''
                    if (is_complete) {
                        params =
                            await tyron.TyronZil.default.VerifiableCredential(
                                input,
                                inputB
                            )
                    } else {
                        throw new Error('input data is missing')
                    }
                }

                if (is_complete) {
                    if (txName === 'Ivms101') {
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
                    } else {
                        toast.info(
                            `You're about to submit ${username}'s DID signature to authenticate your Verifiable Credential.`,
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
                    }

                    dispatch(setTxStatusLoading('true'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    let tx = await tyron.Init.default.transaction(net)
                    await zilpay
                        .call({
                            contractAddress: resolvedInfo?.addr!,
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

    const option = [
        {
            key: '',
            name: 'Select action',
        },
        {
            key: 'Ivms101',
            name: 'Submit Travel Rule',
        },
        {
            key: 'Verifiable_Credential',
            name: `Submit ${username}'s DID signature`,
        },
    ]

    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                <h2 style={{ marginBottom: '70px' }}>
                    verifiable credential decentralized application
                </h2>
                <h3 style={{ marginBottom: '7%' }}>
                    Let&apos;s build a web of trust
                </h3>
                <div className={styles.selector}>
                    <Selector
                        option={option}
                        onChange={handleOnChange}
                        value={txName}
                    />
                </div>
                {txName === 'Ivms101' && (
                    <div className={styles.container}>
                        <p>
                            Complete the following information to present your{' '}
                            <a
                                href={`https://intervasp.org/wp-content/uploads/2020/05/IVMS101-interVASP-data-model-standard-issue-1-FINAL.pdf`}
                                rel="noreferrer"
                                target="_blank"
                            >
                                IVMS101 Message
                            </a>{' '}
                            to {username}.
                        </p>
                        <p>
                            Then, your self-sovereign identity can comply with
                            the FATF Travel Rule, making sure you are not a
                            terrorist or involved in illicit activities like
                            money laundering.
                        </p>
                        <code>
                            All your personal, private data will get encrypted!
                            Only the Tyron Coop can decrypt it.
                        </code>
                        <section className={styles.container2}>
                            <label>NFT</label>
                            username
                            <input
                                ref={callbackRef}
                                className={styles.input}
                                type="text"
                                placeholder="Type your NFT Username without .did"
                                onChange={handleInput}
                                value={input}
                                autoFocus
                            />
                        </section>
                        <section className={styles.container2}>
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
                        </section>
                        <section className={styles.container2}>
                            <label>first</label>
                            name
                            <input
                                ref={callbackRef}
                                className={styles.input}
                                type="text"
                                placeholder="Type your first name"
                                onChange={handleInputC}
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
                                onChange={handleInputD}
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
                                onChange={handleInputE}
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
                                onChange={handleInputF}
                                autoFocus
                            />
                        </section>
                    </div>
                )}
                {txName === 'Verifiable_Credential' && (
                    <section className={styles.containerX}>
                        <input
                            ref={callbackRef}
                            type="text"
                            placeholder="Type your NFT Username without .did"
                            onChange={handleInput}
                            value={input}
                            autoFocus
                            style={{ width: '55%' }}
                        />
                        <input
                            style={{ width: '80%' }}
                            type="text"
                            placeholder={`Paste ${username}'s signature`}
                            ref={callbackRef}
                            onChange={handleInputB}
                        />
                    </section>
                )}
                {txName !== '' && (
                    <div style={{ marginTop: '10%' }}>
                        <div
                            className={isLight ? 'actionBtnLight' : 'actionBtn'}
                            onClick={handleSubmit}
                        >
                            Submit <span>{txName}</span>
                        </div>
                        {txName === 'Ivms101' && (
                            <p className={styles.gascost}>
                                Gas: around 1.8 ZIL
                            </p>
                        )}
                        {txName === 'Verifiable_Credential' && (
                            <p className={styles.gascost}>
                                Gas: around 1.3 ZIL
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
