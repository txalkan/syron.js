import React from 'react'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import { $doc } from '../../../../../src/store/did-doc'
import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const doc = useStore($doc)?.doc

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.info('Key copied to clipboard!', {
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
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {doc !== null &&
                doc?.map((res: any) => {
                    if (
                        res[0] !== 'Decentralized identifier' &&
                        res[0] !== 'DID services'
                    ) {
                        return (
                            <div key={res} className={styles.docInfo}>
                                <h3 className={styles.blockHead}>
                                    {t(`${res[0].toUpperCase()}`)}
                                </h3>
                                {res[1].map((element: any) => {
                                    return (
                                        <p
                                            onClick={() =>
                                                copyToClipboard(element)
                                            }
                                            key={element}
                                            className={styles.didkey}
                                        >
                                            {element}
                                        </p>
                                    )
                                })}
                            </div>
                        )
                    }
                })}
        </div>
    )
}

export default Component
