import stylesDark from '../../styles/css/Footer.module.css'
import stylesLight from '../../styles/css/FooterLight.module.css'
import styles from './styles.module.scss'

import { useState } from 'react'
import { RootState } from '../../src/app/reducers'
import { useDispatch, useSelector } from 'react-redux'
import { UpdateLang } from '../../src/app/actions'
import Selector from '../SelectLang'
import Image from 'next/image'

function Component() {
    const dispatch = useDispatch()
    const language = useSelector((state: RootState) => state.modal.lang)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const style = isLight ? stylesLight : stylesDark

    const [showDropdown, setShowDropdown] = useState(false)

    const changeLang = (val: string) => {
        // setShowDropdown(false)
        dispatch(UpdateLang(val))
    }

    const langDropdown = [
        {
            value: 'en',
            label: 'English',
        },
        {
            value: 'es',
            label: 'Spanish',
        },
        // {
        //     value: 'cn',
        //     label: '🇨🇳 Chinese',
        // },
        // {
        //     value: 'id',
        //     label: '🇮🇩 Indonesian',
        // },
        // {
        //     value: 'ru',
        //     label: '🇷🇺 Russian',
        // },
    ]

    return (
        <>
            <div className={styles.wrapper}>
                <Selector
                    option={langDropdown}
                    onChange={changeLang}
                    placeholder={
                        langDropdown.find((val) => val.value === language)
                            ?.label
                    }
                    menuPlacement="top"
                    searchable={false}
                />
            </div>

            {showDropdown && (
                <div
                    className={style.closeWrapper}
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </>
    )
}

export default Component
