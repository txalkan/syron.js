import { useEffect, useState } from 'react'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import Select, { components } from 'react-select'
import upDownLight from '../../src/assets/icons/up_down_arrow.svg'
import upDownBlack from '../../src/assets/icons/up_down_arrow_black.svg'

function Selector({
    option,
    onChange,
    loading,
    defaultOption,
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
    defaultOption?: any
    defaultValue?: any
    placeholder?: string
    menuPlacement?: string
    searchable?: boolean
    type?: string
    isMulti?: boolean
}) {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const [option_, setOption_] = useState<any>(null)
    const upDown = isLight ? upDownBlack : upDownLight

    let menuPlacement_: any = 'bottom'
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

    useEffect(() => {
        let option_ = option
        option_.forEach(function (obj) {
            obj.value = obj.key
            obj.label = obj.name
            delete obj.key
            delete obj.name
        })
        setOption_(option_)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
            fontSize: '10px',
            borderRadius: '5px',
        }),

        valueContainer: (provided, state) => ({
            ...provided,
            height: '40px',
            padding: '0 6px',
        }),
        input: (provided, state) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorSeparator: (state) => ({
            display: 'none',
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            height: '40px',
        }),
        option: (provided, { isSelected }) => ({
            ...provided,
            color: isLight || isSelected ? '#000' : '#fff',
            fontSize: '10px',
        }),
    }

    const customStylesLangMobile = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '20px',
            height: '20px',
            boxShadow: state.isFocused ? null : null,
            fontSize: '7px',
            borderRadius: '5px',
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            height: '20px',
            padding: '0px',
        }),
        input: (provided, state) => ({
            ...provided,
            margin: '0px',
        }),
        indicatorSeparator: (state) => ({
            display: 'none',
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            height: '20px',
            justifyContent: 'flex-end',
            width: '10px',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            height: '20px',
            width: '20px',
            padding: '0px',
        }),
        indicatorSelect: (provided, state) => ({
            ...provided,
            height: '20px',
        }),
        option: (provided, { isSelected }) => ({
            ...provided,
            color: isLight || isSelected ? '#000' : '#fff',
            fontSize: '5px',
            height: '20px',
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

    const option__ = defaultOption === true ? option : option_
    const isZil = window.location.pathname.includes('/zil')

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
                                primary: '#ffff32',
                                primary75: '#ffff32',
                                neutral0: isLight ? '#dbe4eb' : '#000',
                                neutral80: isLight ? '#000' : '#fff',
                            },
                        })}
                        className="basic-single"
                        classNamePrefix="select"
                        placeholder={placeholder}
                        isLoading={loading}
                        isClearable={false}
                        isSearchable={false}
                        options={option__}
                        onChange={(e: any) => onChange(e?.value ? e.value : '')}
                        value={
                            defaultValue !== undefined
                                ? {
                                      label: option__?.find(
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
                                primary: '#ffff32',
                                primary75: '#ffff32',
                                neutral0: isLight ? '#dbe4eb' : '#000',
                                neutral80: isLight ? '#000' : '#fff',
                            },
                        })}
                        className="basic-single"
                        classNamePrefix="select"
                        placeholder={placeholder}
                        isLoading={loading}
                        isClearable={false}
                        isSearchable={false}
                        options={option__}
                        onChange={(e: any) => onChange(e?.value ? e.value : '')}
                        value={
                            defaultValue !== undefined
                                ? {
                                      label: option__?.find(
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
                        primary: isZil ? '#0000ff' : '#ffff32',
                        primary75: isZil ? '#0000ff' : '#ffff32',
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
                options={option__}
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
                              label: option__?.find(
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
