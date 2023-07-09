import React, { useState } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import { $resolvedInfo } from '../../../../../../../src/store/resolvedInfo'
import { $doc } from '../../../../../../../src/store/did-doc'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import {
    setTxStatusLoading,
    setTxId,
} from '../../../../../../../src/app/actions'
import { Arrow, Donate, Selector } from '../../../../../..'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import { RootState } from '../../../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import routerHook from '../../../../../../../src/hooks/router'
import ThreeDots from '../../../../../../Spinner/ThreeDots'
import InfoIconReg from '../../../../../../../src/assets/icons/warning.svg'
import InfoIconPurple from '../../../../../../../src/assets/icons/warning_purple.svg'
import InfoDefaultReg from '../../../../../../../src/assets/icons/info_default.svg'
import InfoDefaultBlack from '../../../../../../../src/assets/icons/info_default_black.svg'
import { $net } from '../../../../../../../src/store/network'

function Component() {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const { navigate } = routerHook()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const InfoDefault = isLight ? InfoDefaultBlack : InfoDefaultReg
    const InfoIcon = isLight ? InfoIconPurple : InfoIconReg

    const doc = useStore($doc)
    const donation = useStore($donation)
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const subdomainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''
    const resolvedTLD =
        resolvedInfo?.user_tld! && resolvedInfo.user_tld
            ? resolvedInfo.user_tld
            : ''

    const [input, setInput] = useState('') // the recipient (address)
    const [legend, setLegend] = useState('save')
    const [button, setButton] = useState('button primary')

    const [inputAddr, setInputAddr] = useState('')
    const [address, setAddress] = useState('')
    const [legend2, setLegend2] = useState('save')
    const [selectedAddress, setSelectedAddress] = useState('')
    const [usernameType, setUsernameType] = useState('')
    const [username, setUsername] = useState('')
    const [currency, setCurrency] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        const addr = tyron.Address.default.verification(input)
        if (addr !== '') {
            setLegend('saved')
            setButton('button')
            setInput(addr)
        } else {
            toast.warn(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }
    const handleInput = (event: { target: { value: any } }) => {
        setInput('')
        setSelectedAddress('')
        setInputAddr('')
        setAddress('')
        updateDonation(null)
        setLegend('save')
        setButton('button primary')
        setInput(event.target.value)
    }
    const handleOnKeyPress = async ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        if (resolvedInfo !== null && donation !== null) {
            try {
                const zilpay = new ZilPayBase()
                let txID = 'TransferNftUsername'
                if (Number(doc?.version.slice(8, 9)) < 5) {
                    txID = 'TransferNFTUsername'
                }

                const tx_username =
                    usernameType === 'default' ? resolvedDomain : username
                const guardianship = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'ByStr20',
                    input
                )
                const tx_did =
                    selectedAddress === 'SSI'
                        ? resolvedInfo?.addr!
                        : selectedAddress === 'ADDR'
                        ? address
                        : input
                const tyron_ = await tyron.Donation.default.tyron(donation!)

                const params = await tyron.TyronZil.default.TransferNftUsername(
                    tx_username!,
                    guardianship,
                    currency.toLowerCase(),
                    input,
                    tx_did,
                    tyron_,
                    doc?.version
                )

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                await zilpay
                    .call({
                        contractAddress: resolvedInfo?.addr!,
                        transition: txID,
                        params: params as unknown as Record<string, unknown>[],
                        amount: String(donation),
                    })
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        try {
                            tx = await tx.confirm(res.ID, 33)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                                navigate(
                                    `/${subdomainNavigate}${resolvedDomain}/didx`
                                )
                                updateDonation(null)
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                            }
                        } catch (err) {
                            updateModalTx(false)
                            toast.warn(String(err), {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                            })
                        }
                    })
            } catch (error) {
                dispatch(setTxStatusLoading('rejected'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                toast.warn(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 12,
                })
            }
        } else {
            toast.warn('some data is missing.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 12,
            })
        }
        setLoading(false)
    }

    const handleOnChangeSelectedAddress = (value) => {
        setAddress('')
        setInputAddr('')
        setSelectedAddress(value)
    }

    const handleInputAddr = (event: { target: { value: any } }) => {
        setAddress('')
        setLegend2('save')
        setInputAddr(event.target.value)
    }

    const handleOnKeyPress2 = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            validateInputAddr()
        }
    }

    const validateInputAddr = () => {
        const addr = tyron.Address.default.verification(inputAddr)
        if (addr !== '') {
            setAddress(addr)
            setLegend2('saved')
        } else {
            toast.warn(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }

    const handleOnChangeUsername = (value) => {
        setUsernameType(value)
    }

    const handleOnChangeCurrency = (value) => {
        updateDonation(null)
        setCurrency(value)
    }

    const handleInputUsername = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(value.toLowerCase())
    }

    const optionUsername = [
        {
            value: 'default',
            label: resolvedDomain,
        },
        {
            value: 'input',
            label: t('Input Username'),
        },
    ]

    const optionBeneficiary = [
        {
            value: 'SSI',
            label: `${resolvedDomain}'s DIDxWALLET`, //t('This SSI'),
        },
        {
            value: 'RECIPIENT',
            label: 'The .ssi address', //t('The recipient'), @todo-t
        },
        {
            value: 'ADDR',
            label: t('Another address'),
        },
    ]

    const optionCurrency = [
        {
            value: 'TYRON',
            label: '$TYRON 5',
        },
        {
            value: 'FREE',
            label: 'TYDRA of TYRON',
        },
        {
            value: 'FREE',
            label: t('FREE'),
        },
    ]

    return (
        <div className={styles.wrapper}>
            <h3 style={{ color: '#ffff32', marginBottom: '10%' }}>
                {t('TRANSFER')}{' '}
                <span className={styles.username}>
                    {usernameType === 'default'
                        ? resolvedDomain
                        : usernameType === 'input'
                        ? username
                        : ''}
                </span>{' '}
                {t('NFT Username')}
            </h3>
            <div className={styles.contentWrapper}>
                <div>
                    <Selector
                        option={optionUsername}
                        onChange={handleOnChangeUsername}
                        placeholder={t('Select Username')}
                    />
                </div>
                {usernameType === 'input' && (
                    <div className={styles.container}>
                        <input
                            type="text"
                            style={{ width: '100%' }}
                            onChange={handleInputUsername}
                            placeholder="Type domain" //{t('Type username')} @todo-t
                            value={username}
                        />
                    </div>
                )}
                {(usernameType === 'default' || username !== '') && (
                    <div style={{ marginTop: '14%' }}>
                        <h4 className={styles.txt}>.SSI ADDRESS</h4>
                        {/* @todo-t <h4 className={styles.txt}>{t('RECIPIENT')}</h4> */}
                        <div className={styles.containerInput}>
                            <input
                                type="text"
                                className={styles.input}
                                style={{ marginRight: '2%' }}
                                placeholder={t('Type address')}
                                onChange={handleInput}
                                onKeyPress={handleOnKeyPress}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <div onClick={handleSave}>
                                    {legend === 'save' ? (
                                        <Arrow />
                                    ) : (
                                        <div style={{ marginTop: '5px' }}>
                                            <Image
                                                width={40}
                                                src={TickIco}
                                                alt="tick"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {legend === 'saved' && (
                    <div style={{ marginTop: '14%' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <h4 className={styles.txt}>recipient.did</h4>
                            {/* <h4 className={styles.txt}>
                                {t('DID CONTROLLER')} @todo-t
                            </h4> */}
                            <div className={styles.icoInfo}>
                                <span className={styles.tooltip}>
                                    <div className={styles.ico}>
                                        <div className={styles.icoDefault}>
                                            <Image
                                                alt="warning-ico"
                                                src={InfoDefault}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                        <div className={styles.icoColor}>
                                            <Image
                                                alt="warning-ico"
                                                src={InfoIcon}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                    </div>
                                    <span className={styles.tooltiptext}>
                                        <div
                                            className={styles.txt}
                                            style={{
                                                fontSize: '11px',
                                            }}
                                        >
                                            This DIDxWALLET will receive the NFT
                                            Domain Name.
                                        </div>
                                    </span>
                                </span>
                            </div>
                        </div>
                        {/* @todo-t <h4 className={styles.txt}>{t('BENEFICIARY DID')}</h4> */}
                        <div style={{ marginBottom: '5%' }}>
                            <Selector
                                option={optionBeneficiary}
                                onChange={handleOnChangeSelectedAddress}
                                placeholder="Recipient" //{t('Select DID')} @todo-t
                            />
                        </div>
                    </div>
                )}
                {selectedAddress === 'ADDR' && (
                    <div className={styles.wrapperInputAddr}>
                        <input
                            type="text"
                            className={styles.input}
                            style={{ marginRight: '2%' }}
                            onChange={handleInputAddr}
                            onKeyPress={handleOnKeyPress2}
                            placeholder={t('Type address')}
                        />
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <div onClick={validateInputAddr}>
                                {legend2 === 'save' ? (
                                    <Arrow />
                                ) : (
                                    <div style={{ marginTop: '5px' }}>
                                        <Image
                                            width={40}
                                            src={TickIco}
                                            alt="tick"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {legend === 'saved' &&
                    (selectedAddress === 'SSI' ||
                        selectedAddress === 'RECIPIENT' ||
                        (selectedAddress === 'ADDR' && address !== '')) && (
                        <div>
                            <div style={{ marginTop: '14%' }}>
                                {/* <h4 className={styles.txt}>{t('PAYMENT')}</h4> */}
                                <div>
                                    <Selector
                                        option={optionCurrency}
                                        onChange={handleOnChangeCurrency}
                                        placeholder="Fee" //{t('Select Currency')} @todo-t
                                    />
                                </div>
                            </div>
                            {currency !== '' && <Donate />}
                            {donation !== null && (
                                <div
                                    style={{
                                        marginTop: '14%',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        className={
                                            isLight
                                                ? 'actionBtnLight'
                                                : 'actionBtn'
                                        }
                                        onClick={handleSubmit}
                                    >
                                        {loading ? (
                                            <ThreeDots color="yellow" />
                                        ) : (
                                            <div>
                                                {t('TRANSFER')}{' '}
                                                <span
                                                    className={styles.username}
                                                >
                                                    {usernameType === 'default'
                                                        ? resolvedDomain!
                                                        : username}
                                                </span>{' '}
                                                {t('NFT Username')}
                                            </div>
                                        )}
                                    </div>
                                    <h5
                                        className={styles.txt}
                                        style={{ marginTop: '3%' }}
                                    >
                                        {t('GAS_AROUND')} 14 ZIL
                                    </h5>
                                </div>
                            )}
                        </div>
                    )}
            </div>
        </div>
    )
}

export default Component
