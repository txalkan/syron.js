import { useEffect, useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import Select from 'react-select'

function Selector({
    option,
    onChange,
    loading,
    defaultOption,
    placeholder,
}: {
    option: any
    onChange: any
    loading?: boolean
    defaultOption?: any
    placeholder?: string
}) {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const [option_, setOption_] = useState<any>(null)

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
    }

    const isZil = window.location.pathname.includes('/zil')

    return (
        <>
            <Select
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
                isSearchable={true}
                options={defaultOption === true ? option : option_}
                onChange={(e: any) => onChange(e?.value ? e.value : '')}
            />
        </>
    )
}

export default Selector
