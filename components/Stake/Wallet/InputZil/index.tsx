import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'
import styles from './styles.module.scss'

function InputZil({ onChange, button, legend, handleSave }) {
    const { t } = useTranslation()
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    return (
        <div className={styles.formAmount}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    ref={callbackRef}
                    style={{ width: '100%' }}
                    type="text"
                    placeholder={t('Type amount')}
                    onChange={onChange}
                    autoFocus
                />
                <code style={{ marginRight: '15px' }}>ZIL</code>
            </div>
            <div className={styles.btn}>
                <input
                    style={{ width: '100%' }}
                    type="button"
                    className={button}
                    value={t(legend)}
                    onClick={() => {
                        handleSave()
                    }}
                />
            </div>
        </div>
    )
}

export default InputZil
