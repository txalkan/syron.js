//import * as tyron from 'tyron';
import { useStore } from 'effector-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
//import { operationKeyPair } from '../../lib/dkms';
//import { ZilPayBase } from '../ZilPay/zilpay-base';
import styles from './styles.module.scss'
import { Donate, Selector } from '..'
import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { $arconnect } from '../../src/store/arconnect'
import toastTheme from '../../src/hooks/toastTheme'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
//import { $donation, updateDonation } from '../../store/donation';

function Component() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const arConnect = useStore($arconnect)
    const resolvedInfo = useStore($resolvedInfo)

    const [currency1, setCurrency1] = useState('')
    const [currency2, setCurrency2] = useState('')
    const [error, setError] = useState('')

    const handleOnChange1 = (value) => {
        setError('')
        setCurrency1(value)
    }
    const handleOnChange2 = (value) => {
        setError('')
        setCurrency2(value)
    }

    //const zilpay = new ZilPayBase();
    const [input, setInput] = useState('')
    const [button, setButton] = useState('button primary')
    const [legend, setLegend] = useState('Continue')
    //const donation = useStore($donation);
    //const [done, setDone] = useState('');
    const [hideDonation, setHideDonation] = useState(true)

    const handleInput = (event: { target: { value: any } }) => {
        setLegend('continue')
        setButton('button primary')
        setHideDonation(true)
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        input = Number(input)
        setInput(input)
    }
    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            setHideDonation(false)
            setButton('button')
            setLegend('saved')
        }
    }

    const handleSubmit = async () => {
        if (arConnect === null) {
            toast.info('To continue, connect with ArConnect.', {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        } else if (resolvedInfo !== null) {
            toast.info(input, {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        }
    }

    const option = [
        {
            value: 'TYRON',
            label: 'TYRON',
        },
        {
            value: 'zWBTC',
            label: 'zWBTC',
        },
        {
            value: 'zETH',
            label: 'zETH',
        },
        {
            value: 'ZIL',
            label: 'ZIL',
        },
        {
            value: 'zUSDT',
            label: 'zUSDT',
        },
    ]

    return (
        <>
            <div className={styles.container2}>
                <code>Swap from:</code>
                <div style={{ width: '30%' }}>
                    <Selector
                        option={option}
                        onChange={handleOnChange1}
                        placeholder={t('Select coin')}
                    />
                </div>
                <code>To:</code>
                <div style={{ width: '30%' }}>
                    <Selector
                        option={option}
                        onChange={handleOnChange2}
                        placeholder={t('Select coin')}
                    />
                </div>
            </div>
            {currency1 !== '' && currency2 !== '' && currency1 !== currency2 && (
                <div className={styles.container2}>
                    <code>{currency1}</code>
                    <input
                        style={{ width: '30%' }}
                        type="text"
                        placeholder="Type amount"
                        onChange={handleInput}
                        onKeyPress={handleOnKeyPress}
                    />
                    <code>= ... ${currency2}</code>
                    <input
                        style={{ marginLeft: '2%' }}
                        type="button"
                        className={button}
                        value={legend}
                        onClick={() => {
                            setLegend('Saved')
                            setButton('button')
                            setHideDonation(false)
                            handleSubmit()
                        }}
                    />
                </div>
            )}
            {!hideDonation && ( //done === '' &&
                <Donate />
            )}
            {error !== '' && <code>Error: {error}</code>}
        </>
    )
}

export default Component
