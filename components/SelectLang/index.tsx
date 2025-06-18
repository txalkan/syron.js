import { useState } from 'react'
import Image from 'next/image'
import styles from './styles.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import Select, { components } from 'react-select'
import upDownLight from '../../src/assets/icons/up_down_arrow.svg'
import upDownBlack from '../../src/assets/icons/up_down_arrow_black.svg'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { useStore } from 'react-stores'

function Selector({
    option,
    onChange,
    loading,
    defaultValue,
    placeholder,
    menuPlacement,
    searchable,
    isMulti,
}: {
    option: any
    onChange: any
    loading?: boolean
    defaultValue?: any
    placeholder?: string
    menuPlacement?: string
    searchable?: boolean
    type?: string
    isMulti?: boolean
}) {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)
    const upDown = isLight ? upDownBlack : upDownLight
    const [option_, setOption_] = useState<any>(option)

    let menuPlacement_: any = 'top'
    if (menuPlacement) {
        menuPlacement_ = menuPlacement
    }

    let searchable_: any = true
    if (searchable !== undefined) {
        searchable_ = searchable
    }

    let isMulti_: any = false
    if (isMulti !== undefined) {
        isMulti_ = isMulti
    }

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '36px',
            height: '36px',
            boxShadow: 'none',
            border: state.isFocused
                ? '1px solid #4b0082'
                : '1px solid rgba(130, 130, 130, 0.2)',
            fontSize: '0.875rem',

            width: '150px',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            backgroundColor: isLight ? '#fff' : 'rgba(0, 0, 0, 0.8)',
            '&:hover': {
                borderColor: '#4b0082',
            },
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            height: '36px',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
        }),
        input: (provided, state) => ({
            ...provided,
            margin: '0px',
            color: isLight ? '#000' : '#fff',
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: isLight ? '#000' : '#fff',
        }),
        indicatorSeparator: (state) => ({
            display: 'none',
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            height: '40px',
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '150px',
            marginTop: '4px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden',
        }),
        option: (provided, { isSelected }) => ({
            ...provided,
            color: isLight || isSelected ? '#000' : '#fff',
            fontSize: '0.875rem',
            width: '150px',
        }),
    }

    const customStylesMobile = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '32px',
            height: '32px',
            boxShadow: 'none',
            border: state.isFocused
                ? '1px solid #4b0082'
                : '1px solid rgba(130, 130, 130, 0.2)',
            fontSize: '0.75rem',
            width: '100px',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            backgroundColor: isLight ? '#fff' : 'rgba(0, 0, 0, 0.8)',
            '&:hover': {
                borderColor: '#4b0082',
            },
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            height: '32px',
            padding: '0 6px',
            display: 'flex',
            alignItems: 'center',
        }),
        input: (provided, state) => ({
            ...provided,
            margin: '0px',
            color: isLight ? '#000' : '#fff',
        }),
        placeholder: (provided, state) => ({
            ...provided,
            color: isLight ? '#000' : '#fff',
            fontSize: '0.75rem',
        }),
        indicatorSeparator: (state) => ({
            display: 'none',
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            height: '32px',
            padding: '0 4px',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            padding: '0px',
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '100px',
            marginTop: '4px',
            backgroundColor: isLight ? '#fff' : 'rgba(0, 0, 0, 0.8)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden',
        }),
        option: (provided, { isSelected }) => ({
            ...provided,
            color: isLight || isSelected ? '#000' : '#fff',
            fontSize: '0.75rem',
            padding: '6px 8px',
            backgroundColor: isSelected ? '#fff32' : 'transparent',
        }),
    }

    const DropdownIndicator = (props) => {
        return (
            <components.DropdownIndicator {...props}>
                <Image src={upDown} alt="arrow" />
            </components.DropdownIndicator>
        )
    }

    const DropdownIndicatorMobile = (props) => {
        return (
            <components.DropdownIndicator {...props}>
                <Image width={10} src={upDown} alt="arrow" />
            </components.DropdownIndicator>
        )
    }

    return (
        <>
            <div className={styles.langDesktop}>
                <Select
                    components={{ DropdownIndicator }}
                    menuPlacement={menuPlacement_}
                    styles={customStyles}
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary25: 'rgb(182, 182, 182)',
                            primary: '#FFFF32',
                            primary75: '#FFFF32',
                            neutral0: isLight
                                ? 'rgba(255, 255, 255, 0.1)'
                                : '#000',
                            neutral80: isLight ? '#000' : '#fff',
                        },
                    })}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder={placeholder}
                    isLoading={loading}
                    isClearable={false}
                    isSearchable={false}
                    options={option_}
                    onChange={(e: any) => onChange(e?.value ? e.value : '')}
                    value={
                        defaultValue !== undefined
                            ? {
                                  label: option_?.find(
                                      (v) => v.value === defaultValue
                                  )?.label,
                                  value: defaultValue,
                              }
                            : undefined
                    }
                />
            </div>
            <div className={styles.langMobile}>
                <Select
                    components={{
                        DropdownIndicator: DropdownIndicatorMobile,
                    }}
                    menuPlacement={menuPlacement_}
                    styles={customStylesMobile}
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary25: 'rgb(182, 182, 182)',
                            primary: '#FFFF32',
                            primary75: '#FFFF32',
                            neutral0: isLight
                                ? 'rgba(255, 255, 255, 0.1)'
                                : '#000',
                            neutral80: isLight ? '#000' : '#fff',
                        },
                    })}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder={placeholder}
                    isLoading={loading}
                    isClearable={false}
                    isSearchable={false}
                    options={option_}
                    onChange={(e: any) => onChange(e?.value ? e.value : '')}
                    value={
                        defaultValue !== undefined
                            ? {
                                  label: option_?.find(
                                      (v) => v.value === defaultValue
                                  )?.label,
                                  value: defaultValue,
                              }
                            : undefined
                    }
                />
            </div>
        </>
    )
}

export default Selector
