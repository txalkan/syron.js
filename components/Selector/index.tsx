import Image from 'next/image'
import { useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import upDownLight from '../../src/assets/icons/up_down_arrow.svg'
import upDownBlack from '../../src/assets/icons/up_down_arrow_black.svg'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import ThreeDots from '../Spinner/ThreeDots'

function Selector({
    option,
    onChange,
    value,
    loading,
}: {
    option: any
    onChange: any
    value: any
    loading?: boolean
}) {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const upDown = isLight ? upDownBlack : upDownLight
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
                    {loading === true ? (
                        <div className={styles.threeDotsWrapper}>
                            <ThreeDots />
                        </div>
                    ) : (
                        <>
                            {
                                option.filter((val_) => val_.key === value)[0]
                                    ?.name
                            }
                        </>
                    )}
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
