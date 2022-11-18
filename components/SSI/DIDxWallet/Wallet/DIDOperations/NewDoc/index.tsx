import { useStore } from 'effector-react'
import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'
import { $donation } from '../../../../../../src/store/donation'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import * as tyron from 'tyron'
import { SubmitCreate, Donate, SubmitRecover } from '../../../../..'
import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'
import toastTheme from '../../../../../../src/hooks/toastTheme'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'

interface InputType {
    typeInput: string
}

function Component(props: InputType) {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const { typeInput } = props

    const user = useStore($resolvedInfo)
    const donation = useStore($donation)

    const [input, setInput] = useState(0)

    const input_ = Array(input)
    const select_input = Array()
    for (let i = 0; i < input_.length; i += 1) {
        select_input[i] = i
    }
    const [input2, setInput2] = useState([])
    const services: string[][] = input2

    const [hideDoc, setHideDoc] = useState(false)

    const [twitter, setTwitterUsername] = useState('')
    const [btc, setBtc] = useState('')
    const [github, setGithub] = useState('')

    const [legend2, setLegend2] = useState('continue')
    const [button2, setButton2] = useState('button primary')

    const [hideSubmit, setHideSubmit] = useState(true)

    const services_: tyron.DocumentModel.ServiceModel[] = []
    const [services2, setServices2] = useState(services_)

    const handleReset = async () => {
        setButton2('button primary')
        setLegend2('continue')
        setHideSubmit(true)
    }
    const handleResetB = async () => {
        setButton2B('button primary')
        setLegend2B('continue')
        setHideSubmit(true)
    }

    const handleDoc = async () => {
        setBtc('')
        setTwitterUsername('')
        setGithub('')
        setInput(0)
        setInputB(0)
        handleReset()
        handleResetB()
        if (hideDoc) {
            setHideDoc(false)
        } else {
            setHideDoc(true)
        }
    }

    const handleBtc = (event: { target: { value: any } }) => {
        handleReset()
        const input = event.target.value
        setBtc(String(input).toLowerCase())
    }
    const handleTwitterUsername = (event: { target: { value: any } }) => {
        handleReset()
        const input = event.target.value
        setTwitterUsername(String(input).toLowerCase())
    }
    const handleGithub = (event: { target: { value: any } }) => {
        handleReset()
        const input = event.target.value
        setGithub(String(input))
    }

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(0)
        setInput2([])
        setHideSubmit(true)
        setButton2('button primary')
        setLegend2('continue')
        setServices2(services_)
        let _input = event.target.value
        const re = /,/gi
        _input = _input.replace(re, '.')
        const input = Number(_input)

        if (!isNaN(input) && Number.isInteger(input)) {
            setInput(input)
        } else if (isNaN(input)) {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        } else if (!Number.isInteger(input)) {
            toast.error('The number of services must be an integer.', {
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
    }

    const services__: tyron.DocumentModel.ServiceModel[] = []

    if (btc !== '') {
        services__.push({
            id: 'bitcoin',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web3Endpoint,
            val: btc,
            blockchainType: tyron.DocumentModel.BlockchainType.Other,
        })
    }
    if (twitter !== '') {
        let username = twitter
        if (twitter.slice(0, 1) === '@') {
            username = twitter.slice(1)
        }
        services__.push({
            id: 'twitter',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'website',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            val: `https://twitter.com/${username}`,
        })
    }
    if (github !== '') {
        services__.push({
            id: 'github',
            endpoint: tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
            type: 'website',
            transferProtocol: tyron.DocumentModel.TransferProtocol.Https,
            val: `https://github.com/${github}`,
        })
    }

    const handleContinue = async () => {
        const _services: tyron.DocumentModel.ServiceModel[] = []
        if (services.length !== 0) {
            for (let i = 0; i < services.length; i += 1) {
                const this_service = services[i]
                if (this_service[0] !== '' && this_service[1] !== '') {
                    _services.push({
                        id: this_service[0],
                        endpoint:
                            tyron.DocumentModel.ServiceEndpoint.Web2Endpoint,
                        type: 'website',
                        transferProtocol:
                            tyron.DocumentModel.TransferProtocol.Https,
                        val: `https://${this_service[1]}`,
                    })
                }
            }
        }
        if (_services.length !== input) {
            toast.error(t('The input is incomplete'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        } else {
            setServices2(_services)
            setButton2('button')
            setHideDoc(true)
            setHideSubmit(false)
        }
    }

    // only init.did for now

    const [inputB, setInputB] = useState(0)
    const input_B = Array(inputB)
    const select_inputB = Array()
    for (let i = 0; i < input_B.length; i += 1) {
        select_inputB[i] = i
    }
    const [input2B, setInput2B] = useState([])
    const servicesB: string[][] = input2B

    const [legend2B, setLegend2B] = useState('continue')
    const [button2B, setButton2B] = useState('button primary')

    const [services2B, setServices2B] = useState(services_)

    const handleInputB = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputB(0)
        setInput2B([])
        setHideSubmit(true)
        setButton2B('button primary')
        setLegend2B('continue')
        setServices2B(services_)
        let _input = event.target.value
        const re = /,/gi
        _input = _input.replace(re, '.')
        const input = Number(_input)

        if (!isNaN(input) && Number.isInteger(input)) {
            setInputB(input)
        } else if (isNaN(input)) {
            toast.error(t('The input is not a number.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        } else if (!Number.isInteger(input)) {
            toast.error('The number of services must be an integer.', {
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
    }

    const handleContinueB = async () => {
        const _services: tyron.DocumentModel.ServiceModel[] = []
        if (servicesB.length !== 0) {
            for (let i = 0; i < servicesB.length; i += 1) {
                const this_service = servicesB[i]
                if (this_service[0] !== '' && this_service[1] !== '') {
                    _services.push({
                        id: this_service[0],
                        endpoint:
                            tyron.DocumentModel.ServiceEndpoint.Web3Endpoint,
                        val: this_service[1],
                        blockchainType:
                            tyron.DocumentModel.BlockchainType.Zilliqa,
                    })
                }
            }
        }
        if (_services.length !== inputB) {
            toast.error(t('The input is incomplete'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        } else {
            setServices2B(_services)
            setButton2B('button')
            setLegend2B('saved')
            setHideSubmit(false)
        }
    }

    const did_services = services__.concat(services2)
    return (
        <>
            <div>
                {hideDoc && (
                    <div style={{ margin: '7%', textAlign: 'center' }}>
                        <input
                            type="button"
                            className="button"
                            value="undo changes"
                            onClick={() => {
                                handleDoc()
                            }}
                        />
                    </div>
                )}
                {!hideDoc && (
                    <>
                        <section
                            style={{ marginTop: '7%', marginBottom: '7%' }}
                        >
                            <h3 style={{ color: 'silver' }}>
                                {t('VERIFICATION METHODS')}
                            </h3>
                            <div style={{ marginBottom: '2rem' }}>
                                {t(
                                    'You will be creating one DID key pair for each'
                                )}{' '}
                                <a
                                    href="https://www.ssiprotocol.com/#/did"
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    {t('verification relationship')}
                                </a>
                                .
                            </div>
                        </section>
                        <h3 style={{ color: 'silver' }}>{t('SERVICES')}</h3>
                        <div style={{ marginBottom: '2rem' }}>
                            {t('Showcase your websites and other addresses')}{' '}
                            <span style={{ color: 'red' }}>
                                {t('publicly')}
                            </span>
                            :
                        </div>
                        <div className={styles.container}>
                            <table className={styles.table}>
                                <tbody>
                                    <tr className={styles.row}>
                                        <td style={{ display: 'flex' }}>
                                            <label>ID</label>
                                            Bitcoin
                                        </td>
                                        <td>
                                            <input
                                                style={{
                                                    marginLeft: '1%',
                                                    width: '100%',
                                                }}
                                                type="text"
                                                placeholder="Type address"
                                                onChange={handleBtc}
                                            />
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td style={{ display: 'flex' }}>
                                            <label>ID</label>
                                            Twitter
                                        </td>
                                        <td>
                                            <input
                                                style={{
                                                    marginLeft: '1%',
                                                    width: '100%',
                                                }}
                                                type="text"
                                                placeholder="Type username"
                                                onChange={handleTwitterUsername}
                                            />
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td style={{ display: 'flex' }}>
                                            <label>ID</label>
                                            GitHub
                                        </td>
                                        <td>
                                            <input
                                                style={{
                                                    marginLeft: '1%',
                                                    width: '100%',
                                                }}
                                                type="text"
                                                placeholder="Type username"
                                                onChange={handleGithub}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div
                            style={{ marginBottom: '2rem' }}
                            className={styles.container}
                        >
                            How many other services would you like to add?
                            <input
                                style={{ width: '20%', marginLeft: '2%' }}
                                type="text"
                                placeholder="Type amount"
                                onChange={handleInput}
                            />
                        </div>
                        {input != 0 &&
                            select_input.map((res: number) => {
                                return (
                                    <section
                                        key={res}
                                        className={styles.container}
                                    >
                                        <input
                                            style={{ width: '20%' }}
                                            type="text"
                                            placeholder="Type ID"
                                            onChange={(
                                                event: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                                const value = event.target.value
                                                const checkDuplicate =
                                                    services.filter(
                                                        (val) =>
                                                            val[0].toLowerCase() ===
                                                            value
                                                    )
                                                if (checkDuplicate.length > 0) {
                                                    toast.error(
                                                        'Service ID repeated so it will not get added to your DID Document.',
                                                        {
                                                            position:
                                                                'top-right',
                                                            autoClose: 6000,
                                                            hideProgressBar:
                                                                false,
                                                            closeOnClick: true,
                                                            pauseOnHover: true,
                                                            draggable: true,
                                                            progress: undefined,
                                                            theme: toastTheme(
                                                                isLight
                                                            ),
                                                        }
                                                    )
                                                } else {
                                                    handleReset()
                                                    if (
                                                        services[res] ===
                                                        undefined
                                                    ) {
                                                        services[res] = ['', '']
                                                    }
                                                    services[res][0] =
                                                        value.toLowerCase()
                                                }
                                            }}
                                        />
                                        <code>https://www.</code>
                                        <input
                                            style={{ width: '60%' }}
                                            type="text"
                                            placeholder={t('Type service URL')}
                                            onChange={(
                                                event: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                                handleReset()
                                                const value = event.target.value
                                                if (
                                                    services[res] === undefined
                                                ) {
                                                    services[res] = ['', '']
                                                }
                                                services[res][1] = value
                                                    .replaceAll('wwww.', '')
                                                    .replaceAll('https://', '')
                                            }}
                                        />
                                    </section>
                                )
                            })}
                        <div style={{ textAlign: 'center', margin: '14%' }}>
                            <input
                                type="button"
                                className={button2}
                                value={t(legend2)}
                                onClick={() => {
                                    handleContinue()
                                }}
                            />
                        </div>
                        {user?.name === 'init' && (
                            <>
                                <section className={styles.container}>
                                    <div
                                        style={{
                                            width: '70%',
                                            marginBottom: '2rem',
                                        }}
                                    >
                                        {t(
                                            'How many other services would you like to add?'
                                        )}
                                    </div>
                                    <input
                                        style={{ width: '15%' }}
                                        type="text"
                                        placeholder={t('Type amount')}
                                        onChange={handleInputB}
                                    />
                                </section>
                                {inputB != 0 &&
                                    select_inputB.map((res: number) => {
                                        return (
                                            <section
                                                key={res}
                                                className={styles.container}
                                            >
                                                <input
                                                    style={{ width: '20%' }}
                                                    type="text"
                                                    placeholder={t('Type ID')}
                                                    onChange={(
                                                        event: React.ChangeEvent<HTMLInputElement>
                                                    ) => {
                                                        const value =
                                                            event.target.value
                                                        const checkDuplicate =
                                                            servicesB.filter(
                                                                (val) =>
                                                                    val[0].toLowerCase() ===
                                                                    value
                                                            )
                                                        if (
                                                            checkDuplicate.length >
                                                            0
                                                        ) {
                                                            toast.error(
                                                                'Service ID repeated so it will not get added to your DID Document.',
                                                                {
                                                                    position:
                                                                        'top-right',
                                                                    autoClose: 6000,
                                                                    hideProgressBar:
                                                                        false,
                                                                    closeOnClick:
                                                                        true,
                                                                    pauseOnHover:
                                                                        true,
                                                                    draggable:
                                                                        true,
                                                                    progress:
                                                                        undefined,
                                                                    theme: toastTheme(
                                                                        isLight
                                                                    ),
                                                                }
                                                            )
                                                        } else {
                                                            handleResetB()
                                                            if (
                                                                servicesB[
                                                                    res
                                                                ] === undefined
                                                            ) {
                                                                servicesB[res] =
                                                                    ['', '']
                                                            }
                                                            servicesB[res][0] =
                                                                value.toLowerCase()
                                                        }
                                                    }}
                                                />
                                                <input
                                                    style={{ width: '60%' }}
                                                    type="text"
                                                    placeholder={t(
                                                        'Type service URL'
                                                    )}
                                                    onChange={(
                                                        event: React.ChangeEvent<HTMLInputElement>
                                                    ) => {
                                                        handleResetB()
                                                        const value =
                                                            event.target.value
                                                        if (
                                                            servicesB[res] ===
                                                            undefined
                                                        ) {
                                                            servicesB[res] = [
                                                                '',
                                                                '',
                                                            ]
                                                        }
                                                        servicesB[res][1] =
                                                            value.toLowerCase()
                                                    }}
                                                />
                                            </section>
                                        )
                                    })}
                                <div
                                    style={{
                                        textAlign: 'center',
                                        margin: '14%',
                                    }}
                                >
                                    <input
                                        type="button"
                                        className={button2B}
                                        value={t(legend2B)}
                                        onClick={() => {
                                            handleContinueB()
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </>
                )}
                {hideDoc && <Donate />}
                {!hideSubmit && donation !== null && (
                    <div>
                        {typeInput === 'create' ? (
                            <SubmitCreate
                                {...{
                                    services: did_services.concat(services2B),
                                }}
                            />
                        ) : (
                            <SubmitRecover
                                {...{
                                    services: did_services.concat(services2B),
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default Component
