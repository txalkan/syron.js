import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'
import Image from 'next/image'
import styles from './styles.module.scss'
import TickIco from '../../../../../../src/assets/icons/tick_blue.svg'
import { Arrow } from '../../../../..'

function InputZil({ onChange, legend, handleSave }) {
    const { t } = useTranslation()

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    return (
        <div className={styles.formAmount}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    style={{ width: '100%' }}
                    type="text"
                    placeholder={t('Amount')}
                    onChange={onChange}
                    onKeyPress={handleOnKeyPress}
                />
                <code style={{ marginRight: '15px' }}>ZIL</code>
            </div>
            <div className={styles.btn}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                        onClick={() => {
                            handleSave()
                        }}
                    >
                        {legend === 'CONTINUE' ? (
                            <Arrow isBlue={true} />
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
