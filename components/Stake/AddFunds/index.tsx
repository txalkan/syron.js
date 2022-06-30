import { useStore } from 'effector-react'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import * as zcrypto from '@zilliqa-js/crypto'
import { Donate, OriginatorAddress } from '../..'
import { RootState } from '../../../src/app/reducers'
import { $originatorAddress } from '../../../src/store/originatorAddress'
import { $user } from '../../../src/store/user'
import styles from './styles.module.scss'
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { $donation } from '../../../src/store/donation'

function StakeAddFunds() {
    const { t } = useTranslation()
    const originator_address = useStore($originatorAddress)
    const user = useStore($user)
    const donation = useStore($donation)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const [legend, setLegend] = useState(t('CONTINUE'))
    const [button, setButton] = useState('button primary')
    const [input, setInput] = useState(0)
    const [hideDonation, setHideDonation] = useState(true)

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setHideDonation(true)
        setLegend(t('CONTINUE'))
        setButton('button primary')
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        const input_ = Number(input)
        if (!isNaN(input_)) {
            setInput(input_)
        } else {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleSave = async () => {
        if (input === 0) {
            toast.error(t('The amount cannot be zero.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        } else {
            setLegend(t('SAVED'))
            setButton('button')
            setHideDonation(false)
        }
    }

    return (
        <div className={styles.container}>
            <h4 className={styles.title}>{t('ADD FUNDS')}</h4>
            <p className={styles.subTitle}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <div className={styles.wrapper}>
                <OriginatorAddress />
                {originator_address?.value && (
                    <>
                        <div className={styles.addFundsInfo}>
                            <div>About to send funds from:</div>
                            <div>
                                {originator_address?.value === 'zilpay'
                                    ? `${loginInfo.zilAddr?.bech32.slice(
                                          0,
                                          5
                                      )}...${loginInfo.zilAddr?.bech32.slice(
                                          -5
                                      )}`
                                    : originator_address.username !== undefined
                                    ? originator_address?.username
                                    : zcrypto.toBech32Address(
                                          originator_address?.value
                                      )}
                                &nbsp;into&nbsp;
                                <span style={{ color: '#ffff32' }}>
                                    {user?.name}.stake
                                </span>
                            </div>
                        </div>
                        <div className={styles.formAmount}>
                            <code>ZIL</code>
                            <input
                                ref={callbackRef}
                                style={{ width: '40%' }}
                                type="text"
                                placeholder={t('Type amount')}
                                onChange={handleInput}
                                onKeyPress={handleOnKeyPress}
                                autoFocus
                            />
                            <input
                                style={{
                                    marginLeft: '2%',
                                }}
                                type="button"
                                className={button}
                                value={String(legend)}
                                onClick={() => {
                                    handleSave()
                                }}
                            />
                        </div>
                        {!hideDonation && (
                            <div
                                style={{
                                    marginTop: '-50px',
                                    marginBottom: '-40px',
                                }}
                            >
                                <Donate />
                            </div>
                        )}
                        {donation !== null && (
                            <>
                                <div
                                    style={{ marginTop: '40px' }}
                                    className="buttonBlack"
                                >
                                    <div>
                                        TRANSFER {input} ZIL to {user?.name}
                                        .stake
                                    </div>
                                </div>
                                <p className={styles.gasTxt}>
                                    {t('GAS_AROUND')} 1-2 ZIL
                                </p>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default StakeAddFunds
