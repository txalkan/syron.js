import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import styles from './styles.module.scss'
import { $doc } from '../../../../../src/store/did-doc'
import { decryptKey } from '../../../../../src/lib/dkms'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import { $arconnect } from '../../../../../src/store/arconnect'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const resolvedInfo = useStore($resolvedInfo)
    const doc = useStore($doc)
    const arConnect = useStore($arconnect)

    const [input, setInput] = useState('') //the address to sign
    const [legend, setLegend] = useState('continue')
    const [button, setButton] = useState('button primary')

    const [hideSubmit, setHideSubmit] = useState(true)

    const [signature, setSignature] = useState('')

    const handleInput = (event: { target: { value: any } }) => {
        setInput('')
        setHideSubmit(true)
        setLegend('continue')
        setButton('button primary')
        const addr = tyron.Address.default.verification(event.target.value)
        if (addr !== '') {
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
                theme: 'dark',
                toastId: 5,
            })
        }
    }
    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }
    const handleSave = async () => {
        if (input !== '') {
            setLegend('saved')
            setButton('button')
            setHideSubmit(false)
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
                    theme: 'dark',
                })
            }
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.info('Signature copied to clipboard', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
        })
    }

    return (
        <div className={styles.container}>
            <h3 style={{ color: 'silver', marginBottom: '7%' }}>
                {t('SIGN AN ADDRESS')}
            </h3>
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
                            autoFocus
                        />
                        <input
                            style={{ marginLeft: '2%' }}
                            type="button"
                            className={button}
                            value={t(legend.toUpperCase())}
                            onClick={() => {
                                handleSave()
                            }}
                        />
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
                    <div className="actionBtn" onClick={handleSubmit}>
                        {t('MAKE')}&nbsp;<span>{t('SIGNATURE')}</span>
                    </div>
                </div>
            )}
            {signature !== '' && (
                <>
                    <h4>{t('YOUR DID SOCIAL RECOVERY SIGNATURE:')}</h4>
                    <p onClick={() => copyToClipboard(signature)}>
                        {signature}
                    </p>
                </>
            )}
        </div>
    )
}

export default Component
