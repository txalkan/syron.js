import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'
import Image from 'next/image'
import styles from './styles.module.scss'
import ContinueArrow from '../../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../../src/assets/icons/tick.svg'

function InputZil({ onChange, legend, handleSave }) {
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
                    placeholder={t('Amount')}
                    onChange={onChange}
                    autoFocus
                />
                <code style={{ marginRight: '15px' }}>ZIL</code>
            </div>
            <div className={styles.btn}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                        className={
                            legend === 'CONTINUE' ? 'continueBtnBlue' : ''
                        }
                        onClick={() => {
                            handleSave()
                        }}
                    >
                        {legend === 'CONTINUE' ? (
                            <Image src={ContinueArrow} alt="arrow" />
                        ) : (
                            <div style={{ marginTop: '5px' }}>
                                <Image width={40} src={TickIco} alt="tick" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InputZil
