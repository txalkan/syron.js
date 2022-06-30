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
            <code>ZIL</code>
            <input
                ref={callbackRef}
                style={{ width: '40%' }}
                type="text"
                placeholder={t('Type amount')}
                onChange={onChange}
                autoFocus
            />
            <input
                style={{
                    marginLeft: '5%',
                }}
                type="button"
                className={button}
                value={String(legend)}
                onClick={() => {
                    handleSave()
                }}
            />
        </div>
    )
}

export default InputZil
