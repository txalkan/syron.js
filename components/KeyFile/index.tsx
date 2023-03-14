import { JWKInterface } from 'arweave/node/lib/wallet'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
    updateLoginInfoArAddress,
    updateLoginInfoKeyFile,
} from '../../src/app/actions'
import { RootState } from '../../src/app/reducers'
import arweave from '../../src/config/arweave'
import toastTheme from '../../src/hooks/toastTheme'
import styles from './styles.module.scss'

function KeyFile() {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const [keyFile, setKeyFile] = useState<JWKInterface>()
    const [saveFile, setSaveFile] = useState(false)
    const [buttonLegend, setButtonLegend] = useState('Save keyfile')

    const dispatch = useDispatch()
    const files = React.createRef<any>()

    const handleOnChange = (event: any) => {
        event.preventDefault()
        const file = files.current.files[0]
        if (file) {
            const fileReader = new FileReader()
            fileReader.onload = ({ target }) => {
                const result = target?.result as string
                if (result) setKeyFile(JSON.parse(result))
            }
            fileReader.readAsText(file)
        }
        setSaveFile(true)
    }

    const handleSaveFile = async () => {
        try {
            const arAddress = await arweave.wallets.jwkToAddress(keyFile)
            toast.info(`This keyfile's address is: ${arAddress}`, {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
            dispatch(updateLoginInfoArAddress(arAddress))
            if (keyFile) {
                dispatch(updateLoginInfoKeyFile(keyFile))
            }
            setButtonLegend('Saved')
        } catch (e) {
            toast.info('Select file first.', {
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
    }

    return (
        <>
            <div className={styles.container}>
                <input type="file" ref={files} onChange={handleOnChange} />
                <>
                    {saveFile && buttonLegend !== 'Saved' && (
                        <button
                            type="button"
                            className={styles.save}
                            onClick={handleSaveFile}
                        >
                            <div className={styles.buttonText}>
                                {buttonLegend}
                            </div>
                        </button>
                    )}
                    {buttonLegend === 'Saved' && (
                        <button
                            type="button"
                            className={styles.save}
                            onClick={() =>
                                toast.info('Your keyfile got saved already.', {
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
                        >
                            <div className={styles.buttonText}>
                                {buttonLegend}
                            </div>
                        </button>
                    )}
                </>
            </div>
        </>
    )
}

export default KeyFile
