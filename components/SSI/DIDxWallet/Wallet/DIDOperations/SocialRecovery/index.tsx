import React, { useState } from 'react'
import { useStore as effectorStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { Arrow, Donate, Sign, Spinner } from '../../../../..'
import { $doc } from '../../../../../../src/store/did-doc'
import { decryptKey } from '../../../../../../src/lib/dkms'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../src/store/modal'
import { setTxStatusLoading, setTxId } from '../../../../../../src/app/actions'
import { RootState } from '../../../../../../src/app/reducers'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../src/hooks/router'
import { $arconnect } from '../../../../../../src/store/arconnect'
import TickIcoReg from '../../../../../../src/assets/icons/tick.svg'
import TickIcoPurple from '../../../../../../src/assets/icons/tick_purple.svg'
import CloseIcoReg from '../../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../../src/assets/icons/ic_cross_black.svg'
import toastTheme from '../../../../../../src/hooks/toastTheme'
import useArConnect from '../../../../../../src/hooks/useArConnect'
import useFetch from '../../../../../../src/hooks/fetch'
import { $net } from '../../../../../../src/store/network'
import { useStore } from 'react-stores'

function Component() {
    const resolvedInfo = useStore($resolvedInfo)

    const net = $net.state.net as 'mainnet' | 'testnet'

    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { checkUserExists, versionAbove58, checkVersion } =
        useFetch(resolvedInfo)

    const dispatch = useDispatch()
    const arConnect = effectorStore($arconnect)
    const dkms = effectorStore($doc)?.dkms
    const donation = effectorStore($donation)
    const doc = effectorStore($doc)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const version = checkVersion(resolvedInfo?.version!)

    const [inputAmount, setInputAmount] = useState(0) // the amount of guardians
    const [loadingUserCheck, setLoadingUserCheck] = useState(false)
    const input_ = Array(inputAmount)
    const select_input = Array()
    for (let i = 0; i < input_.length; i += 1) {
        select_input[i] = i
    }
    const [inputArray, setInputArray] = useState([])
    const guardians: string[] = inputArray

    const [legend, setLegend] = useState('continue')
    const [txName, setTxName] = useState('')

    const [hideDonation, setHideDonation] = useState(true)
    const [hideSubmit, setHideSubmit] = useState(true)

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

    const handleInputAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputAmount(0)
        setInputArray([])
        setHideSubmit(true)
        setHideDonation(true)
        setLegend('continue')
        let _input = event.target.value
        const re = /,/gi
        _input = _input.replace(re, '.')
        const input = Number(_input)
        let minimumInput = 3
        if (txName === 'RemoveGuardians') {
            minimumInput = 1
        } else if (doc?.guardians.length >= 3) {
            minimumInput = 1
        }

        if (txName === 'RemoveGuardians' && doc?.guardians.length - input < 3) {
            toast.warn('Need at least 3 guardians after remove', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        } else if (
            !isNaN(input) &&
            Number.isInteger(input) &&
            input >= minimumInput
        ) {
            setInputAmount(input)
        } else if (isNaN(input)) {
            toast.warn('The input is not a number.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        } else if (!Number.isInteger(input)) {
            toast.warn('The number of guardians must be an integer.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        } else if (input < 3 && input !== 0 && doc?.guardians.length < 3) {
            const message = t('The number of guardians must be at least three.')

            toast.warn(message, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 3,
            })
        }
    }

    const handleSave = async (isAdd: boolean) => {
        setLoadingUserCheck(true)
        if (guardians.length === input_.length) {
            var arr = guardians.map((v) => v.toLowerCase())
            const duplicated = new Set(arr).size !== arr.length
            if (duplicated) {
                toast.warn(
                    'Guardians must be unique, so you cannot submit repeated domain names.',
                    {
                        position: 'top-right',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: toastTheme(isLight),
                        toastId: 4,
                    }
                )
            } else {
                for (let i = 0; i < guardians.length; i++) {
                    const res = await checkUserExists(
                        guardians[i].toLowerCase()
                    )
                    const domainId =
                        '0x' +
                        (await tyron.Util.default.HashString(
                            guardians[i].toLowerCase()
                        ))
                    if (!res) {
                        break
                    }
                    if (
                        doc?.guardians?.some((val) => val === domainId) &&
                        isAdd
                    ) {
                        toast.warn(
                            `${guardians[i].toLowerCase()} already exists.`,
                            {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 4,
                            }
                        )
                        break
                    } else if (
                        !doc?.guardians?.some((val) => val === domainId) &&
                        !isAdd
                    ) {
                        toast.warn(
                            `${guardians[i].toLowerCase()} doesn't exists.`,
                            {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 4,
                            }
                        )
                        break
                    }
                    if (res && i + 1 === guardians.length) {
                        setLegend('saved')
                        setHideDonation(false)
                        setHideSubmit(false)
                    }
                }
            }
        } else {
            const message = t('The input is incomplete.')
            toast.warn(message, {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 4,
            })
        }
        setLoadingUserCheck(false)
    }

    const handleSubmit = async (txID) => {
        if (
            (arConnect !== null || version >= 6) &&
            resolvedInfo !== null &&
            donation !== null
        ) {
            try {
                const zilpay = new ZilPayBase()
                const tyron_ = await tyron.Donation.default.tyron(donation)
                const [guardians_, hash]: any =
                    await tyron.Util.default.HashGuardians(guardians)

                let params
                if (txID === 'AddGuardians' || txID === 'RemoveGuardians') {
                    params = await tyron.TyronZil.default.Guardians(
                        guardians_,
                        tyron_
                    )
                } else {
                    const encrypted_key = dkms.get('update')
                    const update_private_key = await decryptKey(
                        arConnect,
                        encrypted_key
                    )
                    const update_public_key =
                        zcrypto.getPubKeyFromPrivateKey(update_private_key)
                    const sig =
                        '0x' +
                        zcrypto.sign(
                            Buffer.from(hash, 'hex'),
                            update_private_key,
                            update_public_key
                        )

                    params =
                        await tyron.TyronZil.default.ConfigureSocialRecovery(
                            guardians_,
                            sig,
                            tyron_
                        )
                }

                //const tx_params: tyron.TyronZil.TransitionValue[] = [tyron_];
                const _amount = String(donation)

                const message = t(
                    'You’re about to submit a transaction to configure Social Recovery'
                )
                toast.info(message, {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 6,
                })
                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)
                await zilpay
                    .call({
                        contractAddress: resolvedInfo?.addr!,
                        transition: txID,
                        params: params as unknown as Record<string, unknown>[],
                        amount: _amount,
                    })
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        try {
                            tx = await tx.confirm(res.ID, 33)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                updateDonation(null)
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                                navigate(
                                    `/${subdomainNavigate}${resolvedDomain}/didx/recovery`
                                )
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                                setTimeout(() => {
                                    const message = t('Transaction failed.')

                                    toast.warn(message, {
                                        position: 'top-right',
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                        theme: toastTheme(isLight),
                                        toastId: 7,
                                    })
                                }, 1000)
                            }
                        } catch (err) {
                            dispatch(setTxStatusLoading('rejected'))
                            updateModalTxMinimized(false)
                            updateModalTx(true)
                            toast.warn(String(err), {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: toastTheme(isLight),
                                toastId: 8,
                            })
                            throw err
                        }
                    })
                    .catch((err) => {
                        updateModalTx(false)
                        toast.warn(err, {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 9,
                        })
                    })
            } catch (error) {
                toast.error('Identity verification unsuccessful.', {
                    position: 'top-right',
                    autoClose: 2222,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 10,
                })
            }
        }
    }

    const toggleActive = (id: string) => {
        if (doc?.guardians.length <= 3 && id === 'RemoveGuardians') {
            toast.warn(
                'Your SSI needs more than three guardians before being able to remove any of them.',
                {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 10,
                }
            )
        } else {
            setInputAmount(0)
            setInputArray([])
            setHideSubmit(true)
            setHideDonation(true)
            setLegend('continue')
            updateDonation(null)
            if (id === txName) {
                setTxName('')
            } else {
                setTxName(id)
            }
        }
    }

    if (versionAbove58()) {
        return (
            <div>
                {txName !== '' && (
                    <div
                        className={styles.closeWrapper}
                        onClick={() => {
                            toggleActive('')
                            setInputAmount(0)
                            setInputArray([])
                            setHideSubmit(true)
                            setHideDonation(true)
                            setLegend('continue')
                        }}
                    />
                )}
                <div className={styles.content}>
                    <div className={styles.cardWrapper}>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => {
                                    toggleActive('AddGuardians')
                                }}
                                className={
                                    txName === 'AddGuardians'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                {t('ADD GUARDIANS')}
                            </div>
                            {txName === 'AddGuardians' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <GuardiansList
                                        handleInputAmount={handleInputAmount}
                                        input={inputAmount}
                                        select_input={select_input}
                                        setLegend={setLegend}
                                        legend={legend}
                                        handleSave={() => handleSave(true)}
                                        guardians={guardians}
                                        setHideDonation={setHideDonation}
                                        hideDonation={hideDonation}
                                        setHideSubmit={setHideSubmit}
                                        hideSubmit={hideSubmit}
                                        handleSubmit={() =>
                                            handleSubmit('AddGuardians')
                                        }
                                        title={`ADD GUARDIAN${
                                            select_input.length > 1 ? 'S' : ''
                                        }`}
                                        loadingUserCheck={loadingUserCheck}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => {
                                    toggleActive('RemoveGuardians')
                                }}
                                className={
                                    txName === 'RemoveGuardians'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div>REMOVE GUARDIANS</div>
                            </div>
                            {txName === 'RemoveGuardians' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <GuardiansList
                                        handleInputAmount={handleInputAmount}
                                        input={inputAmount}
                                        select_input={select_input}
                                        setLegend={setLegend}
                                        legend={legend}
                                        handleSave={() => handleSave(false)}
                                        guardians={guardians}
                                        setHideDonation={setHideDonation}
                                        hideDonation={hideDonation}
                                        setHideSubmit={setHideSubmit}
                                        hideSubmit={hideSubmit}
                                        handleSubmit={() =>
                                            handleSubmit('RemoveGuardians')
                                        }
                                        title={`REMOVE GUARDIAN${
                                            select_input.length > 1 ? 'S' : ''
                                        }`}
                                        loadingUserCheck={loadingUserCheck}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => {
                                    toggleActive('SignAddress')
                                }}
                                className={
                                    txName === 'SignAddress'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                {t('SIGN ADDRESS')}
                            </div>
                            {txName === 'SignAddress' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: '-10%',
                                            width: '100%',
                                        }}
                                    >
                                        <Sign />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                {txName !== '' && (
                    <div
                        className={styles.closeWrapper}
                        onClick={() => {
                            toggleActive('')
                            setInputAmount(0)
                            setInputArray([])
                            setHideSubmit(true)
                            setHideDonation(true)
                            setLegend('continue')
                        }}
                    />
                )}
                <div className={styles.content}>
                    <div className={styles.cardWrapper}>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => {
                                    toggleActive('AddGuardians')
                                }}
                                className={
                                    txName === 'AddGuardians'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                {t('ADD GUARDIANS')}
                            </div>
                            {txName === 'AddGuardians' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <GuardiansList
                                        handleInputAmount={handleInputAmount}
                                        input={inputAmount}
                                        select_input={select_input}
                                        setLegend={setLegend}
                                        legend={legend}
                                        handleSave={() => handleSave(true)}
                                        guardians={guardians}
                                        setHideDonation={setHideDonation}
                                        hideDonation={hideDonation}
                                        setHideSubmit={setHideSubmit}
                                        hideSubmit={hideSubmit}
                                        handleSubmit={() =>
                                            handleSubmit(
                                                'ConfigureSocialRecovery'
                                            )
                                        }
                                        title={`ADD GUARDIAN${
                                            select_input.length > 1 ? 'S' : ''
                                        }`}
                                        loadingUserCheck={loadingUserCheck}
                                    />
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => {
                                    toggleActive('SignAddress')
                                }}
                                className={
                                    txName === 'SignAddress'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                {t('SIGN ADDRESS')}
                            </div>
                            {txName === 'SignAddress' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            marginTop: '-10%',
                                            width: '100%',
                                        }}
                                    >
                                        <Sign />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Component

const GuardiansList = ({
    handleInputAmount,
    input,
    select_input,
    setLegend,
    legend,
    handleSave,
    guardians,
    setHideDonation,
    hideDonation,
    setHideSubmit,
    hideSubmit,
    handleSubmit,
    title,
    loadingUserCheck,
}) => {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const TickIco = isLight ? TickIcoPurple : TickIcoReg
    const donation = effectorStore($donation)
    const doc = effectorStore($doc)
    let minimumInput = 3
    let titleInput = t('How many guardians would you like?')
    if (title.includes('REMOVE GUARDIAN')) {
        minimumInput = 1
        titleInput = t('How many guardians would you like to remove?')
    } else if (doc?.guardians.length >= 3) {
        minimumInput = 1
    }
    return (
        <div>
            <div className={styles.container}>
                <div className={styles.titleInput}>{titleInput}</div>
                <input
                    className={styles.inputAmount}
                    type="text"
                    placeholder={t('Type amount')}
                    onChange={handleInputAmount}
                />
            </div>
            {input >= minimumInput &&
                select_input.map((res: any) => {
                    return (
                        <section key={res} className={styles.container}>
                            {/* <code style={{ width: '50%' }}>
                                {t('Guardian')} #{res + 1}
                            </code> */}
                            <code style={{ width: '50%' }}>#{res + 1}</code>
                            <input
                                className={styles.inputText}
                                type="text"
                                placeholder={t('TYPE DOMAIN')}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setLegend('continue')
                                    setHideDonation(true)
                                    setHideSubmit(true)
                                    guardians[res] =
                                        event.target.value.toLowerCase()
                                }}
                            />
                            <code>.did</code>
                        </section>
                    )
                })}
            {input >= minimumInput && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '7%',
                        justifyContent: 'flex-end',
                    }}
                >
                    <div
                        onClick={() => {
                            handleSave()
                        }}
                    >
                        {loadingUserCheck ? (
                            <Spinner />
                        ) : (
                            <>
                                {legend.toUpperCase() === 'CONTINUE' ? (
                                    <Arrow width={50} height={50} />
                                ) : (
                                    <div style={{ marginTop: '5px' }}>
                                        <Image
                                            width={50}
                                            src={TickIco}
                                            alt="tick"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {!hideDonation && <Donate />}
            {!hideSubmit && donation !== null && (
                <div
                    style={{
                        marginTop: '10%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        className={isLight ? 'actionBtnLight' : 'actionBtn'}
                        onClick={handleSubmit}
                    >
                        {title}
                    </div>
                    <div className={styles.txt} style={{ marginTop: '20px' }}>
                        {t('GAS_AROUND')}: 1-2 ZIL
                    </div>
                </div>
            )}
        </div>
    )
}
