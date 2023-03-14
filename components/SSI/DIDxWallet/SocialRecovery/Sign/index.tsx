import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import Image from 'next/image'
import styles from './styles.module.scss'
import { $doc } from '../../../../../src/store/did-doc'
import { decryptKey } from '../../../../../src/lib/dkms'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import { $arconnect } from '../../../../../src/store/arconnect'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import toastTheme from '../../../../../src/hooks/toastTheme'
import TickIco from '../../../../../src/assets/icons/tick.svg'
import { Arrow } from '../../../..'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const resolvedInfo = useStore($resolvedInfo)
    const doc = useStore($doc)
    const arConnect = useStore($arconnect)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const [input, setInput] = useState('') //the address to sign
    const [legend, setLegend] = useState('continue')
    const [hideSubmit, setHideSubmit] = useState(true)
    const [signature, setSignature] = useState('')

    const handleInput = (event: { target: { value: any } }) => {
        setInput('')
        setHideSubmit(true)
        setLegend('continue')
        setInput(event.target.value)
    }
    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }
    const handleSave = async () => {
        const addr = tyron.Address.default.verification(input)
        if (addr !== '') {
            setLegend('saved')
            setHideSubmit(false)
            setInput(addr)
        } else {
            toast.error(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }

    const handleSubmit = async () => {
        if (arConnect !== null) {
            try {
                const encrypted_key = doc?.dkms.get('socialrecovery')
                const sr_private_key = await decryptKey(
                    arConnect,
                    encrypted_key
                )
                const sr_public_key =
                    zcrypto.getPubKeyFromPrivateKey(sr_private_key)

                const addr = input.substring(2)

                const signature =
                    '0x' +
                    zcrypto.sign(
                        Buffer.from(addr, 'hex'),
                        sr_private_key,
                        sr_public_key
                    )
                setSignature(signature)
            } catch (error) {
                toast.error('Identity verification unsuccessful.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
            }
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.info('Signature copied to clipboard.', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: toastTheme(isLight),
        })
    }

    const pasteFromClipboard = async () => {
        // setMount(false)
        const text = navigator.clipboard.readText()
        setInput(await text)
        // handleReset()
        // const value = text
        // if (guardians[res] === undefined) {
        //     guardians[res] = ['', '']
        // }
        // guardians[res][1] = (await value).toLowerCase()
        // setGuardians(guardians)
        // setTimeout(() => {
        //     setMount(true)
        // }, 1)
    }

    return (
        <div className={styles.container}>
            {signature === '' && (
                <div>
                    <h4>
                        {t(
                            'USUARIO CAN SIGN ANY ADDRESS WITH THEIR DID SOCIAL RECOVERY KEY:',
                            { name: resolvedInfo?.name }
                        )}
                    </h4>
                    <div className={styles.containerInput}>
                        <input
                            type="text"
                            style={{ width: '70%' }}
                            placeholder={t('Type address')}
                            onChange={handleInput}
                            onKeyPress={handleOnKeyPress}
                            value={input}
                        />
                        <div onClick={pasteFromClipboard} className="button">
                            PASTE
                        </div>
                        <div style={{ marginLeft: '2%' }}>
                            <div
                                className={
                                    legend === 'saved'
                                        ? 'continueBtnSaved'
                                        : 'continueBtn'
                                }
                                onClick={() => handleSave()}
                            >
                                {legend === 'saved' ? (
                                    <Image
                                        width={35}
                                        height={35}
                                        src={TickIco}
                                        alt="arrow"
                                    />
                                ) : (
                                    <Arrow width={35} height={35} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {!hideSubmit && signature === '' && (
                <div
                    style={{
                        marginTop: '10%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        onClick={handleSubmit}
                    >
                        {t('MAKE')}&nbsp;<span>{t('SIGNATURE')}</span>
                    </div>
                </div>
            )}
            {signature !== '' && (
                <>
                    <h4>{t('YOUR DID SOCIAL RECOVERY SIGNATURE:')}</h4>
                    <div
                        className={styles.signTxt}
                        onClick={() => copyToClipboard(signature)}
                    >
                        {signature}
                    </div>
                </>
            )}
        </div>
    )
}

export default Component
