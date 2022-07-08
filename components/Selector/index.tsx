import Image from 'next/image'
import { useState } from 'react'
import styles from './styles.module.scss'
import upDown from '../../src/assets/icons/up_down_arrow.svg'

function Selector({ option, onChange, value }) {
    const [showDropdown, setShowDropdown] = useState(false)

    return (
        <>
            {showDropdown && (
                <div
                    className={styles.closeWrapper}
                    onClick={() => setShowDropdown(false)}
                />
            )}
            <div className={styles.dropdownCheckListWrapper}>
                <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={styles.dropdownCheckList}
                >
                    {option.filter((val_) => val_.key === value)[0]?.name}
                    &nbsp;
                    <Image src={upDown} alt="arrow" />
                </div>
                {showDropdown && (
                    <>
                        <div className={styles.wrapperOption}>
                            {option.map((val, i) => (
                                <div
                                    onClick={() => {
                                        onChange(val.key)
                                        setShowDropdown(false)
                                    }}
                                    key={i}
                                    className={styles.option}
                                >
                                    <div>
                                        {val.name}{' '}
                                        {val.key === value ? (
                                            <span>&#10004;</span>
                                        ) : (
                                            ''
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

export default Selector
