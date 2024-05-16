import { useState } from 'react'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import Select, { components } from 'react-select'
import upDownLight from '../../src/assets/icons/up_down_arrow.svg'
import upDownBlack from '../../src/assets/icons/up_down_arrow_black.svg'
import isZil from '../../src/hooks/isZil'
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
    type,
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
    const styles = isLight ? stylesLight : stylesDark
    const upDown = isLight ? upDownBlack : upDownLight
    const primaryColor = /*isLight ? '#6C00AD' @css: purple :*/ '#FFFF32'
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
        option: (provided, { isSelected }) => ({
            ...provided,
            color: isLight || isSelected ? '#000' : '#fff',
        }),
        control: (provided, state) => ({
            ...provided,
            borderRadius: '5px',
        }),
        indicatorSeparator: (state) => ({
            display: 'none',
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            justifyContent: 'flex-start',
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            // backgroundColor: 'pink',
        }),
        multiValue: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(255, 255, 255, 0.075);',
        }),
    }

    const customStylesLang = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '40px',
            height: '40px',
            boxShadow: state.isFocused ? null : null,
            fontSize: '14px',
            borderRadius: '5px',
            width: '200px',
        }),

        valueContainer: (provided, state) => ({
            ...provided,
            height: '40px',
            padding: '0 6px',
            textAlign: 'center',
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
            width: '200px',
        }),
        option: (provided, { isSelected }) => ({
            ...provided,
            color: isLight || isSelected ? '#000' : '#fff',
            fontSize: '13px',
            width: '200px',
        }),
    }

    const customStylesLangMobile = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '30px',
            height: '30px',
            boxShadow: state.isFocused ? null : null,
            fontSize: '10px',
            borderRadius: '5px',
            width: '125px',
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            height: '30px',
            padding: '0px',
            textAlign: 'center',
            marginTop: '-2px',
        }),
        input: (provided, state) => ({
            ...provided,
            margin: '0px',
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
            height: '30px',
            justifyContent: 'flex-end',
            width: '20px',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            height: '30px',
            width: '30px',
            padding: '0px',
        }),
        indicatorSelect: (provided, state) => ({
            ...provided,
            height: '30px',
        }),
        menu: (provided, state) => ({
            ...provided,
            width: '125px',
        }),
        option: (provided, { isSelected }) => ({
            ...provided,
            color: isLight || isSelected ? '#000' : '#fff',
            fontSize: '8px',
            height: '30px',
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '11px',
                    }}
                >
                    <Image src={upDown} alt="arrow" width={18} height={18} />
                </div>
            </components.DropdownIndicator>
        )
    }

    const isZil_ = isZil(resolvedInfo?.version)

    if (type === 'language') {
        return (
            <>
                <div className={styles.langDesktop}>
                    <Select
                        components={{ DropdownIndicator }}
                        menuPlacement={menuPlacement_}
                        styles={customStylesLang}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 0,
                            colors: {
                                ...theme.colors,
                                primary25: 'rgb(182, 182, 182)',
                                primary: primaryColor,
                                primary75: primaryColor,
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
                        styles={customStylesLangMobile}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 0,
                            colors: {
                                ...theme.colors,
                                primary25: 'rgb(182, 182, 182)',
                                primary: primaryColor,
                                primary75: primaryColor,
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

    return (
        <>
            <Select
                components={{ DropdownIndicator }}
                menuPlacement={menuPlacement_}
                styles={customStyles}
                theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                        ...theme.colors,
                        primary25: 'rgb(182, 182, 182)',
                        primary: isZil_ ? '#0000ff' : primaryColor,
                        primary75: isZil_ ? '#0000ff' : primaryColor,
                        neutral0: isLight ? '#dbe4eb' : '#000',
                        neutral80: isLight ? '#000' : '#fff',
                    },
                })}
                className="basic-single"
                classNamePrefix="select"
                placeholder={placeholder}
                isLoading={loading}
                isClearable={true}
                isSearchable={searchable_}
                options={option_}
                onChange={(e: any) => {
                    if (isMulti_) {
                        onChange(e)
                    } else {
                        onChange(e?.value ? e.value : '')
                    }
                }}
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
                isMulti={isMulti_}
            />
        </>
    )
}

export default Selector
