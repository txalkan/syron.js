import { useStore } from 'effector-react'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import Image from 'next/image'
import { RootState } from '../../../../../src/app/reducers'
import {
    updateModalAddFunds,
    updateSelectedCurrency,
    updateModalWithdrawal,
    updateZilpayBalance,
    updateInvestorModal,
    updateInvestorItems,
    $modalAddFunds,
    $modalWithdrawal,
    $modalInvestor,
    updateSelectedCurrencyBal,
    updateTransferModal,
    updateTypeBatchTransfer,
} from '../../../../../src/store/modal'
import {
    $loadingDoc,
    $loading,
    updateLoadingDoc,
} from '../../../../../src/store/loading'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import arrowDown from '../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../src/assets/icons/arrow_up_white.svg'
import defaultCheckmarkLight from '../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkReg from '../../../../../src/assets/icons/selected_checkmark_blue.svg'
import selectedCheckmarkPurple from '../../../../../src/assets/icons/selected_checkmark_purple.svg'
import refreshIco from '../../../../../src/assets/icons/refresh.svg'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { updateSelectedCurrencyDropdown } from '../../../../../src/app/actions'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import smartContract from '../../../../../src/utils/smartContract'
import {
    AddFundsModal,
    Arrow,
    InvestorModal,
    Spinner,
    ThunderIco,
    WithdrawalModal,
} from '../../../..'
import toastTheme from '../../../../../src/hooks/toastTheme'
import fetch from '../../../../../src/hooks/fetch'

function Component() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { checkVersion } = fetch()
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)
    const version = checkVersion(resolvedInfo?.version)
    const loadingDoc = useStore($loadingDoc)
    const loading = useStore($loading)
    const modalAddFunds = useStore($modalAddFunds)
    const modalWithdrawal = useStore($modalWithdrawal)
    const modalInvestor = useStore($modalInvestor)
    const dispatch = useDispatch()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = loginInfo.isLight ? stylesLight : stylesDark
    const selectedCurrencyDropdown = loginInfo?.selectedCurrencyDropdown
    const [tyronBal, settyronBal] = useState<any>(['-', '-'])
    const [$siBal, set$siBal] = useState<any>(['-', '-'])
    const [zilBal, setzilBal] = useState<any>(['-', '-'])
    const [gzilBal, setgzilBal] = useState<any>(['-', '-'])
    const [xsgdBal, setxsgdBal] = useState<any>(['-', '-'])
    const [zusdtBal, setzusdtBal] = useState<any>(['-', '-'])
    const [xidrBal, setxidrBal] = useState<any>(['-', '-'])
    const [zwbtcBal, setzwbtcBal] = useState<any>(['-', '-'])
    const [zethBal, setzethBal] = useState<any>(['-', '-'])
    const [xcadBal, setxcadBal] = useState<any>(['-', '-'])
    const [zopulBal, setzopulBal] = useState<any>(['-', '-'])
    const [lunrBal, setlunrBal] = useState<any>(['-', '-'])
    const [swthBal, setswthBal] = useState<any>(['-', '-'])
    const [feesBal, setfeesBal] = useState<any>(['-', '-'])
    const [portBal, setportBal] = useState<any>(['-', '-'])
    const [zwapBal, setzwapBal] = useState<any>(['-', '-'])
    const [dxcadBal, setdxcadBal] = useState<any>(['-', '-'])
    const [zbrklBal, setzbrklBal] = useState<any>(['-', '-'])
    const [scoBal, setscoBal] = useState<any>(['-', '-'])
    const [carbBal, setcarbBal] = useState<any>(['-', '-'])
    const [dmzBal, setdmzBal] = useState<any>(['-', '-'])
    const [hunyBal, sethunyBal] = useState<any>(['-', '-'])
    const [bloxBal, setbloxBal] = useState<any>(['-', '-'])
    const [streamBal, setstreamBal] = useState<any>(['-', '-'])
    const [redcBal, setredcBal] = useState<any>(['-', '-'])
    const [holBal, setholBal] = useState<any>(['-', '-'])
    const [evzBal, setevzBal] = useState<any>(['-', '-'])
    const [zlpBal, setzlpBal] = useState<any>(['-', '-'])
    const [grphBal, setgrphBal] = useState<any>(['-', '-'])
    const [shardsBal, setshardsBal] = useState<any>(['-', '-'])
    const [duckBal, setduckBal] = useState<any>(['-', '-'])
    const [zpaintBal, setzpaintBal] = useState<any>(['-', '-'])
    const [gpBal, setgpBal] = useState<any>(['-', '-'])
    const [gemzBal, setgemzBal] = useState<any>(['-', '-'])
    const [okiBal, setokiBal] = useState<any>(['-', '-'])
    const [francBal, setfrancBal] = useState<any>(['-', '-'])
    const [zwallBal, setzwallBal] = useState<any>(['-', '-'])
    const [peleBal, setpeleBal] = useState<any>(['-', '-'])
    const [garyBal, setgaryBal] = useState<any>(['-', '-'])
    const [consultBal, setconsultBal] = useState<any>(['-', '-'])
    const [zameBal, setzameBal] = useState<any>(['-', '-'])
    const [wallexBal, setwallexBal] = useState<any>(['-', '-'])
    const [hodlBal, sethodlBal] = useState<any>(['-', '-'])
    const [athleteBal, setathleteBal] = useState<any>(['-', '-'])
    const [milkyBal, setmilkyBal] = useState<any>(['-', '-'])
    const [boltBal, setboltBal] = useState<any>(['-', '-'])
    const [mamboBal, setmamboBal] = useState<any>(['-', '-'])
    const [recapBal, setrecapBal] = useState<any>(['-', '-'])
    const [zchBal, setzchBal] = useState<any>(['-', '-'])
    const [rsvBal, setrsvBal] = useState<any>(['-', '-'])
    const [nftdexBal, setnftdexBal] = useState<any>(['-', '-'])
    const [unidexv2Bal, setunidexv2Bal] = useState<any>(['-', '-'])
    const [zillexBal, setzillexBal] = useState<any>(['-', '-'])
    const [zlfBal, setzlfBal] = useState<any>(['-', '-'])
    const [buttonBal, setbuttonBal] = useState<any>(['-', '-'])
    const [investorZilliqa, setInvestorZilliqa] = useState(false)
    const [investorZilliqaItems, setInvestorZilliqaItems] = useState(Array())
    const [investorDid, setInvestorDid] = useState(false)
    const [investorDidItems, setInvestorDidItems] = useState(Array())
    // @todo-x

    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)

    const fetchBalance = async (id: string) => {
        let token_addr: string
        try {
            if (id !== 'zil') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                const get_services = await getSmartContract(
                    init_addr,
                    'services'
                )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )
                token_addr = services.get(id)
                const balances = await getSmartContract(token_addr, 'balances')
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )

                let res = [0, 0]
                try {
                    const balance_didxwallet = balances_.get(
                        resolvedInfo?.addr!.toLowerCase()!
                    )
                    if (balance_didxwallet !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance =
                            balance_didxwallet / _currency.decimals
                        res[0] = Number(finalBalance.toFixed(2))
                    }
                } catch (error) {
                    res[0] = 0
                }
                try {
                    const balance_zilpay = balances_.get(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (balance_zilpay !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance = balance_zilpay / _currency.decimals
                        res[1] = Number(finalBalance.toFixed(2))
                    }
                } catch (error) {
                    res[1] = 0
                }
                return res
            } else {
                const balance = await getSmartContract(
                    resolvedInfo?.addr!,
                    '_balance'
                )

                const balance_ = balance.result._balance
                const zil_balance = Number(balance_) / 1e12

                const zilpay = new ZilPayBase().zilpay
                const zilPay = await zilpay()
                const blockchain = zilPay.blockchain
                const zilliqa_balance = await blockchain.getBalance(
                    loginInfo.zilAddr.base16.toLowerCase()
                )
                const zilliqa_balance_ =
                    Number(zilliqa_balance.result!.balance) / 1e12

                let res = [
                    Number(zil_balance.toFixed(2)),
                    Number(zilliqa_balance_.toFixed(2)),
                ]
                return res
            }
        } catch (error) {
            let res = [0, 0]
            return res
        }
    }

    const fetchAllBalance = async () => {
        updateLoadingDoc(true)
        const currency = ['TYRON', '$SI', 'ZIL']
        const allCurrency = currency.concat(selectedCurrencyDropdown)
        for (let i = 0; i < allCurrency.length; i += 1) {
            const coin = String(allCurrency[i]).toLowerCase()
            const bal = await fetchBalance(coin)
            switch (coin) {
                case 'tyron':
                    settyronBal(bal)
                    break
                case '$si':
                    set$siBal(bal)
                    break
                case 'zil':
                    setzilBal(bal)
                    break
                case 'gzil':
                    setgzilBal(bal)
                    break
                case 'xsgd':
                    setxsgdBal(bal)
                    break
                case 'zusdt':
                    setzusdtBal(bal)
                    break
                case 'xidr':
                    setxidrBal(bal)
                    break
                case 'zwbtc':
                    setzwbtcBal(bal)
                    break
                case 'zeth':
                    setzethBal(bal)
                    break
                case 'xcad':
                    setxcadBal(bal)
                    break
                case 'zopul':
                    setzopulBal(bal)
                    break
                case 'lunr':
                    setlunrBal(bal)
                    break
                case 'swth':
                    setswthBal(bal)
                    break
                case 'fees':
                    setfeesBal(bal)
                    break
                case 'port':
                    setportBal(bal)
                    break
                case 'zwap':
                    setzwapBal(bal)
                    break
                case 'sco':
                    setscoBal(bal)
                    break
                case 'dxcad':
                    setdxcadBal(bal)
                    break
                case 'zbrkl':
                    setzbrklBal(bal)
                    break
                case 'carb':
                    setcarbBal(bal)
                    break
                case 'dmz':
                    setdmzBal(bal)
                    break
                case 'huny':
                    sethunyBal(bal)
                    break
                case 'blox':
                    setbloxBal(bal)
                    break
                case 'stream':
                    setstreamBal(bal)
                    break
                case 'redc':
                    setredcBal(bal)
                    break
                case 'hol':
                    setholBal(bal)
                    break
                case 'evz':
                    setevzBal(bal)
                    break
                case 'zlp':
                    setzlpBal(bal)
                    break
                case 'grph':
                    setgrphBal(bal)
                    break
                case 'shards':
                    setshardsBal(bal)
                    break
                case 'duck':
                    setduckBal(bal)
                    break
                case 'zpaint':
                    setzpaintBal(bal)
                    break
                case 'gp':
                    setgpBal(bal)
                    break
                case 'gemz':
                    setgemzBal(bal)
                    break
                case 'oki':
                    setokiBal(bal)
                    break
                case 'franc':
                    setfrancBal(bal)
                    break
                case 'zwall':
                    setzwallBal(bal)
                    break
                case 'pele':
                    setpeleBal(bal)
                    break
                case 'gary':
                    setgaryBal(bal)
                    break
                case 'consult':
                    setconsultBal(bal)
                    break
                case 'zame':
                    setzameBal(bal)
                    break
                case 'wallex':
                    setwallexBal(bal)
                    break
                case 'hodl':
                    sethodlBal(bal)
                    break
                case 'athlete':
                    setathleteBal(bal)
                    break
                case 'milky':
                    setmilkyBal(bal)
                    break
                case 'bolt':
                    setboltBal(bal)
                    break
                case 'mambo':
                    setmamboBal(bal)
                    break
                case 'recap':
                    setrecapBal(bal)
                    break
                case 'zch':
                    setzchBal(bal)
                    break
                case 'rsv':
                    setrsvBal(bal)
                    break
                case 'nftdex':
                    setnftdexBal(bal)
                    break
                case 'unidex-v2':
                    setunidexv2Bal(bal)
                    break
                case 'zillex':
                    setzillexBal(bal)
                    break
                case 'zlf':
                    setzlfBal(bal)
                    break
                case 'button':
                    setbuttonBal(bal)
                    break
                //@todo-x
            }
        }
        updateLoadingDoc(false)
    }

    const addFunds = (currency: string, zilpayBalance: number) => {
        updateSelectedCurrency(currency)
        updateModalAddFunds(true)
        updateZilpayBalance(zilpayBalance)
    }

    const withdrawFunds = (currency: string, bal) => {
        updateSelectedCurrency(currency)
        updateSelectedCurrencyBal(bal)
        updateModalWithdrawal(true)
    }

    const fetchInvestor = async () => {
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            const services = await getSmartContract(init_addr, 'services')
            const res = await tyron.SmartUtil.default.intoMap(
                services.result.services
            )
            const addr = res.get('tyroni')
            const accounts = await getSmartContract(addr, 'accounts')
            const res2 = await tyron.SmartUtil.default.intoMap(
                accounts.result.accounts
            )
            const addrList = Array.from(res2.keys())
            if (
                addrList.some(
                    (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                )
            ) {
                setInvestorZilliqa(true)
                const zilliqaItems =
                    accounts.result.accounts[
                        loginInfo.zilAddr.base16.toLowerCase()
                    ].arguments
                setInvestorZilliqaItems(zilliqaItems)
            }
            const resolved_addr = resolvedInfo?.addr
            if (resolved_addr !== undefined) {
                if (
                    addrList.some((val) => val === resolved_addr.toLowerCase())
                ) {
                    setInvestorDid(true)
                    const didItems =
                        accounts.result.accounts[
                            resolvedInfo?.addr!.toLowerCase()!
                        ].arguments
                    setInvestorDidItems(didItems)
                }
            } else {
                toast.error('Not able to resolve this DIDxWallet.', {
                    position: 'bottom-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 0,
                })
            }
        } catch (error) {
            toast.warn('Not an investor account.', {
                position: 'bottom-left',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 1,
            })
        }
    }

    useEffect(() => {
        if (loginInfo.zilAddr) {
            updateLoadingDoc(true)
            if (!loading) {
                fetchAllBalance()
                fetchInvestor()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])

    const currencyDropdown = [
        'gZIL',
        'XSGD',
        'zUSDT',
        'XIDR',
        'zWBTC',
        'zETH',
        'XCAD',
        'zOPUL',
        'Lunr',
        'SWTH',
        'FEES',
        'PORT',
        'ZWAP',
        'dXCAD',
        'zBRKL',
        'SCO',
        'CARB',
        'DMZ',
        'Huny',
        'BLOX',
        'STREAM',
        'REDC',
        'HOL',
        'EVZ',
        'ZLP',
        'GRPH',
        'SHARDS',
        'DUCK',
        'ZPAINT',
        'GP',
        'GEMZ',
        'Oki',
        'FRANC',
        'ZWALL',
        'PELE',
        'GARY',
        'CONSULT',
        'ZAME',
        'WALLEX',
        'HODL',
        'ATHLETE',
        'MILKY',
        'BOLT',
        'MAMBO',
        'RECAP',
        'ZCH',
        'RSV',
        'NFTDEX',
        'UNIDEX-V2',
        'ZILLEX',
        'ZLF',
        'BUTTON',
        //@todo-x
    ]

    const selectCurrency = (val) => {
        // setShowCurrencyDropdown(false)
        if (!checkIsExist(val)) {
            let arr = selectedCurrencyDropdown
            arr.push(val)
            dispatch(updateSelectedCurrencyDropdown(arr))
        } else {
            let arr = selectedCurrencyDropdown.filter((arr) => arr !== val)
            dispatch(updateSelectedCurrencyDropdown(arr))
        }
        // fetchAllBalance()
    }

    const checkIsExist = (val) => {
        if (selectedCurrencyDropdown.some((arr) => arr === val)) {
            return true
        } else {
            return false
        }
    }

    const selectAll = () => {
        for (let i = 0; i < currencyDropdown.length; i += 1) {
            selectCurrency(currencyDropdown[i])
        }
        fetchAllBalance()
    }

    const unselectAll = () => {
        dispatch(updateSelectedCurrencyDropdown([]))
        fetchAllBalance()
    }

    if (modalAddFunds) {
        return <AddFundsModal />
    } else if (modalWithdrawal) {
        return <WithdrawalModal />
    } else if (modalInvestor) {
        return <InvestorModal />
    } else {
        return (
            <div className={styles.wrapper}>
                {loadingDoc || loading ? (
                    <div style={{ marginTop: '20vh' }}>
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex' }}>
                            <h2 className={styles.title}>{t('BALANCES')}</h2>
                            <div
                                onClick={fetchAllBalance}
                                className={styles.refreshIcoMobile}
                            >
                                <Image src={refreshIco} alt="refresh-ico" />
                            </div>
                        </div>
                        <table>
                            <thead></thead>
                        </table>
                        <div className={styles.tbl}>
                            <table>
                                <thead>
                                    <tr>
                                        <td
                                            className={styles.headerWrapper}
                                            colSpan={4}
                                        >
                                            <NewCurrency
                                                setShowCurrencyDropdown={
                                                    setShowCurrencyDropdown
                                                }
                                                showCurrencyDropdown={
                                                    showCurrencyDropdown
                                                }
                                                fetchAllBalance={
                                                    fetchAllBalance
                                                }
                                                currencyDropdown={
                                                    currencyDropdown
                                                }
                                                selectCurrency={selectCurrency}
                                                checkIsExist={checkIsExist}
                                            />
                                        </td>
                                    </tr>
                                    <tr className={styles.header}>
                                        <td className={styles.txtListTitle}>
                                            {t('CURRENCY')}
                                        </td>
                                        <td className={styles.txtListTitle}>
                                            DIDxWallet
                                        </td>
                                        <td className={styles.txtListTitle}>
                                            ZilPay
                                        </td>
                                        <td
                                            className={styles.refreshIcoWrapper}
                                        >
                                            <div
                                                onClick={fetchAllBalance}
                                                className={styles.refreshIco}
                                            >
                                                <Image
                                                    src={refreshIco}
                                                    alt="refresh-ico"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className={styles.row}>
                                        <td className={styles.txtList}>
                                            TYRON
                                        </td>
                                        <td>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <div className={styles.txtList}>
                                                    {tyronBal[0]}
                                                </div>
                                                <ThunderIco
                                                    onClick={() => {
                                                        if (investorDid) {
                                                            updateInvestorItems(
                                                                investorDidItems
                                                            )
                                                            updateInvestorModal(
                                                                true
                                                            )
                                                        } else {
                                                            toast.warn(
                                                                'Not an investor account.',
                                                                {
                                                                    position:
                                                                        'bottom-left',
                                                                    autoClose: 3000,
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
                                                                    toastId: 1,
                                                                }
                                                            )
                                                        }
                                                    }}
                                                    type="small"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <div className={styles.txtList}>
                                                    {tyronBal[1]}
                                                </div>
                                                <ThunderIco
                                                    onClick={() => {
                                                        if (investorZilliqa) {
                                                            updateInvestorItems(
                                                                investorZilliqaItems
                                                            )
                                                            updateInvestorModal(
                                                                true
                                                            )
                                                        } else {
                                                            toast.warn(
                                                                'Not an investor account.',
                                                                {
                                                                    position:
                                                                        'bottom-left',
                                                                    autoClose: 3000,
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
                                                                    toastId: 1,
                                                                }
                                                            )
                                                        }
                                                    }}
                                                    type="small"
                                                />
                                            </div>
                                        </td>
                                        <td className={styles.buttonWrapper}>
                                            <div
                                                className={styles.btnAction}
                                                onClick={() =>
                                                    addFunds(
                                                        'TYRON',
                                                        tyronBal[1]
                                                    )
                                                }
                                            >
                                                {t('ADD_FUNDS')}
                                            </div>
                                            <div
                                                className={styles.btnAction}
                                                onClick={() =>
                                                    withdrawFunds(
                                                        'TYRON',
                                                        tyronBal
                                                    )
                                                }
                                            >
                                                {t('WITHDRAW')}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td className={styles.txtList}>$SI</td>
                                        <td className={styles.txtList}>
                                            {$siBal[0]}
                                        </td>
                                        <td className={styles.txtList}>
                                            {$siBal[1]}
                                        </td>
                                        <td className={styles.buttonWrapper}>
                                            <div
                                                onClick={() =>
                                                    addFunds('$SI', $siBal[1])
                                                }
                                                className={styles.btnAction}
                                            >
                                                {t('ADD_FUNDS')}
                                            </div>
                                            <div
                                                onClick={() =>
                                                    withdrawFunds('$SI', $siBal)
                                                }
                                                className={styles.btnAction}
                                            >
                                                {t('WITHDRAW')}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td className={styles.txtList}>ZIL</td>
                                        <td className={styles.txtList}>
                                            {zilBal[0]}
                                        </td>
                                        <td className={styles.txtList}>
                                            {zilBal[1]}
                                        </td>
                                        <td className={styles.buttonWrapper}>
                                            <div
                                                onClick={() =>
                                                    addFunds('ZIL', zilBal[1])
                                                }
                                                className={styles.btnAction}
                                            >
                                                {t('ADD_FUNDS')}
                                            </div>
                                            <div
                                                onClick={() =>
                                                    withdrawFunds('ZIL', zilBal)
                                                }
                                                className={styles.btnAction}
                                            >
                                                {t('WITHDRAW')}
                                            </div>
                                        </td>
                                    </tr>
                                    {selectedCurrencyDropdown.map((val, i) => {
                                        let balanceDropdown: number[] = []
                                        switch (val) {
                                            case 'gZIL':
                                                balanceDropdown = gzilBal
                                                break
                                            case 'XSGD':
                                                balanceDropdown = xsgdBal
                                                break
                                            case 'zUSDT':
                                                balanceDropdown = zusdtBal
                                                break
                                            case 'XIDR':
                                                balanceDropdown = xidrBal
                                                break
                                            case 'zWBTC':
                                                balanceDropdown = zwbtcBal
                                                break
                                            case 'zETH':
                                                balanceDropdown = zethBal
                                                break
                                            case 'XCAD':
                                                balanceDropdown = xcadBal
                                                break
                                            case 'zOPUL':
                                                balanceDropdown = zopulBal
                                                break
                                            case 'Lunr':
                                                balanceDropdown = lunrBal
                                                break
                                            case 'SWTH':
                                                balanceDropdown = swthBal
                                                break
                                            case 'FEES':
                                                balanceDropdown = feesBal
                                                break
                                            case 'PORT':
                                                balanceDropdown = portBal
                                                break
                                            case 'ZWAP':
                                                balanceDropdown = zwapBal
                                                break
                                            case 'dXCAD':
                                                balanceDropdown = dxcadBal
                                                break
                                            case 'zBRKL':
                                                balanceDropdown = zbrklBal
                                                break
                                            case 'SCO':
                                                balanceDropdown = scoBal
                                                break
                                            case 'CARB':
                                                balanceDropdown = carbBal
                                                break
                                            case 'DMZ':
                                                balanceDropdown = dmzBal
                                                break
                                            case 'Huny':
                                                balanceDropdown = hunyBal
                                                break
                                            case 'BLOX':
                                                balanceDropdown = bloxBal
                                                break
                                            case 'STREAM':
                                                balanceDropdown = streamBal
                                                break
                                            case 'REDC':
                                                balanceDropdown = redcBal
                                                break
                                            case 'HOL':
                                                balanceDropdown = holBal
                                                break
                                            case 'EVZ':
                                                balanceDropdown = evzBal
                                                break
                                            case 'ZLP':
                                                balanceDropdown = zlpBal
                                                break
                                            case 'GRPH':
                                                balanceDropdown = grphBal
                                                break
                                            case 'SHARDS':
                                                balanceDropdown = shardsBal
                                                break
                                            case 'DUCK':
                                                balanceDropdown = duckBal
                                                break
                                            case 'ZPAINT':
                                                balanceDropdown = zpaintBal
                                                break
                                            case 'GP':
                                                balanceDropdown = gpBal
                                                break
                                            case 'GEMZ':
                                                balanceDropdown = gemzBal
                                                break
                                            case 'Oki':
                                                balanceDropdown = okiBal
                                                break
                                            case 'FRANC':
                                                balanceDropdown = francBal
                                                break
                                            case 'ZWALL':
                                                balanceDropdown = zwallBal
                                                break
                                            case 'PELE':
                                                balanceDropdown = peleBal
                                                break
                                            case 'GARY':
                                                balanceDropdown = garyBal
                                                break
                                            case 'CONSULT':
                                                balanceDropdown = consultBal
                                                break
                                            case 'ZAME':
                                                balanceDropdown = zameBal
                                                break
                                            case 'WALLEX':
                                                balanceDropdown = wallexBal
                                                break
                                            case 'HODL':
                                                balanceDropdown = hodlBal
                                                break
                                            case 'ATHLETE':
                                                balanceDropdown = athleteBal
                                                break
                                            case 'MILKY':
                                                balanceDropdown = milkyBal
                                                break
                                            case 'BOLT':
                                                balanceDropdown = boltBal
                                                break
                                            case 'MAMBO':
                                                balanceDropdown = mamboBal
                                                break
                                            case 'RECAP':
                                                balanceDropdown = recapBal
                                                break
                                            case 'ZCH':
                                                balanceDropdown = zchBal
                                                break
                                            case 'RSV':
                                                balanceDropdown = rsvBal
                                                break
                                            case 'NFTDEX':
                                                balanceDropdown = nftdexBal
                                                break
                                            case 'UNIDEX-V2':
                                                balanceDropdown = unidexv2Bal
                                                break
                                            case 'ZILLEX':
                                                balanceDropdown = zillexBal
                                                break
                                            case 'ZLF':
                                                balanceDropdown = zlfBal
                                                break
                                            case 'BUTTON':
                                                balanceDropdown = buttonBal
                                                break
                                            //@todo-x
                                        }
                                        return (
                                            <tr key={i} className={styles.row}>
                                                <td className={styles.txtList}>
                                                    {val}
                                                </td>
                                                <td className={styles.txtList}>
                                                    {balanceDropdown[0]}
                                                </td>
                                                <td className={styles.txtList}>
                                                    {balanceDropdown[1]}
                                                </td>
                                                <td
                                                    className={
                                                        styles.buttonWrapper
                                                    }
                                                >
                                                    <div
                                                        onClick={() =>
                                                            addFunds(
                                                                val,
                                                                balanceDropdown[1]
                                                            )
                                                        }
                                                        className={
                                                            styles.btnAction
                                                        }
                                                    >
                                                        {t('ADD_FUNDS')}
                                                    </div>
                                                    <div
                                                        onClick={() =>
                                                            withdrawFunds(
                                                                val,
                                                                balanceDropdown
                                                            )
                                                        }
                                                        className={
                                                            styles.btnAction
                                                        }
                                                    >
                                                        {t('WITHDRAW')}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className={styles.tblMobile}>
                            <div className={styles.headerWrapper}>
                                <NewCurrency
                                    setShowCurrencyDropdown={
                                        setShowCurrencyDropdown
                                    }
                                    showCurrencyDropdown={showCurrencyDropdown}
                                    fetchAllBalance={fetchAllBalance}
                                    currencyDropdown={currencyDropdown}
                                    selectCurrency={selectCurrency}
                                    checkIsExist={checkIsExist}
                                />
                            </div>
                            <table>
                                <tbody>
                                    <tr className={styles.headerMobile}>
                                        <td className={styles.tdMobileHeader}>
                                            <div
                                                className={styles.txtListTitle}
                                            >
                                                TYRON
                                            </div>
                                            <div
                                                className={
                                                    styles.buttonWrapperMobile
                                                }
                                            >
                                                <div
                                                    className={styles.btnAction}
                                                    onClick={() =>
                                                        addFunds(
                                                            'TYRON',
                                                            tyronBal[1]
                                                        )
                                                    }
                                                >
                                                    {t('ADD_FUNDS')}
                                                </div>
                                                &nbsp;
                                                <div
                                                    className={styles.btnAction}
                                                    onClick={() =>
                                                        withdrawFunds(
                                                            'TYRON',
                                                            tyronBal
                                                        )
                                                    }
                                                >
                                                    {t('WITHDRAW')}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td className={styles.tdMobile}>
                                            <div className={styles.txt}>
                                                &nbsp;DIDxWallet:{' '}
                                            </div>
                                            <div className={styles.txtList}>
                                                {tyronBal[0]}
                                            </div>
                                            <ThunderIco
                                                onClick={() => {
                                                    if (investorDid) {
                                                        updateInvestorItems(
                                                            investorDidItems
                                                        )
                                                        updateInvestorModal(
                                                            true
                                                        )
                                                    } else {
                                                        toast.warn(
                                                            'Not an investor account.',
                                                            {
                                                                position:
                                                                    'bottom-left',
                                                                autoClose: 3000,
                                                                hideProgressBar:
                                                                    false,
                                                                closeOnClick:
                                                                    true,
                                                                pauseOnHover:
                                                                    true,
                                                                draggable: true,
                                                                progress:
                                                                    undefined,
                                                                theme: toastTheme(
                                                                    isLight
                                                                ),
                                                                toastId: 1,
                                                            }
                                                        )
                                                    }
                                                }}
                                                type="small"
                                            />
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td className={styles.tdMobile}>
                                            <div className={styles.txt}>
                                                &nbsp;ZilPay:{' '}
                                            </div>
                                            <div className={styles.txtList}>
                                                {tyronBal[1]}
                                            </div>
                                            <ThunderIco
                                                onClick={() => {
                                                    if (investorZilliqa) {
                                                        updateInvestorItems(
                                                            investorZilliqaItems
                                                        )
                                                        updateInvestorModal(
                                                            true
                                                        )
                                                    } else {
                                                        toast.warn(
                                                            'Not an investor account.',
                                                            {
                                                                position:
                                                                    'bottom-left',
                                                                autoClose: 3000,
                                                                hideProgressBar:
                                                                    false,
                                                                closeOnClick:
                                                                    true,
                                                                pauseOnHover:
                                                                    true,
                                                                draggable: true,
                                                                progress:
                                                                    undefined,
                                                                theme: toastTheme(
                                                                    isLight
                                                                ),
                                                                toastId: 1,
                                                            }
                                                        )
                                                    }
                                                }}
                                                type="small"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody>
                                    <tr className={styles.headerMobile}>
                                        <td className={styles.tdMobileHeader}>
                                            <div
                                                className={styles.txtListTitle}
                                            >
                                                $SI
                                            </div>
                                            <div
                                                className={
                                                    styles.buttonWrapperMobile
                                                }
                                            >
                                                <div
                                                    className={styles.btnAction}
                                                    onClick={() =>
                                                        addFunds(
                                                            '$SI',
                                                            $siBal[1]
                                                        )
                                                    }
                                                >
                                                    {t('ADD_FUNDS')}
                                                </div>
                                                &nbsp;
                                                <div
                                                    className={styles.btnAction}
                                                    onClick={() =>
                                                        withdrawFunds(
                                                            '$SI',
                                                            $siBal
                                                        )
                                                    }
                                                >
                                                    {t('WITHDRAW')}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td className={styles.tdMobile}>
                                            <div className={styles.txt}>
                                                &nbsp;DIDxWallet:{' '}
                                            </div>
                                            <div className={styles.txtList}>
                                                {$siBal[0]}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td className={styles.tdMobile}>
                                            <div className={styles.txt}>
                                                &nbsp;ZilPay:{' '}
                                            </div>
                                            <div className={styles.txtList}>
                                                {$siBal[1]}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody>
                                    <tr className={styles.headerMobile}>
                                        <td className={styles.tdMobileHeader}>
                                            <div
                                                className={styles.txtListTitle}
                                            >
                                                ZIL
                                            </div>
                                            <div
                                                className={
                                                    styles.buttonWrapperMobile
                                                }
                                            >
                                                <div
                                                    className={styles.btnAction}
                                                    onClick={() =>
                                                        addFunds(
                                                            'ZIL',
                                                            zilBal[1]
                                                        )
                                                    }
                                                >
                                                    {t('ADD_FUNDS')}
                                                </div>
                                                &nbsp;
                                                <div
                                                    className={styles.btnAction}
                                                    onClick={() =>
                                                        withdrawFunds(
                                                            'ZIL',
                                                            zilBal
                                                        )
                                                    }
                                                >
                                                    {t('WITHDRAW')}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td className={styles.tdMobile}>
                                            <div className={styles.txt}>
                                                &nbsp;DIDxWallet:{' '}
                                            </div>
                                            <div className={styles.txtList}>
                                                {zilBal[0]}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className={styles.row}>
                                        <td className={styles.tdMobile}>
                                            <div className={styles.txt}>
                                                &nbsp;ZilPay:{' '}
                                            </div>
                                            <div className={styles.txtList}>
                                                {zilBal[1]}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                {selectedCurrencyDropdown.map((val, i) => {
                                    let balanceDropdown: number[] = []
                                    switch (val) {
                                        case 'gZIL':
                                            balanceDropdown = gzilBal
                                            break
                                        case 'XSGD':
                                            balanceDropdown = xsgdBal
                                            break
                                        case 'zUSDT':
                                            balanceDropdown = zusdtBal
                                            break
                                        case 'XIDR':
                                            balanceDropdown = xidrBal
                                            break
                                        case 'zWBTC':
                                            balanceDropdown = zwbtcBal
                                            break
                                        case 'zETH':
                                            balanceDropdown = zethBal
                                            break
                                        case 'XCAD':
                                            balanceDropdown = xcadBal
                                            break
                                        case 'zOPUL':
                                            balanceDropdown = zopulBal
                                            break
                                        case 'Lunr':
                                            balanceDropdown = lunrBal
                                            break
                                        case 'SWTH':
                                            balanceDropdown = swthBal
                                            break
                                        case 'FEES':
                                            balanceDropdown = feesBal
                                            break
                                        case 'PORT':
                                            balanceDropdown = portBal
                                            break
                                        case 'ZWAP':
                                            balanceDropdown = zwapBal
                                            break
                                        case 'dXCAD':
                                            balanceDropdown = dxcadBal
                                            break
                                        case 'zBRKL':
                                            balanceDropdown = zbrklBal
                                            break
                                        case 'SCO':
                                            balanceDropdown = scoBal
                                            break
                                        case 'CARB':
                                            balanceDropdown = carbBal
                                            break
                                        case 'DMZ':
                                            balanceDropdown = dmzBal
                                            break
                                        case 'Huny':
                                            balanceDropdown = hunyBal
                                            break
                                        case 'BLOX':
                                            balanceDropdown = bloxBal
                                            break
                                        case 'STREAM':
                                            balanceDropdown = streamBal
                                            break
                                        case 'REDC':
                                            balanceDropdown = redcBal
                                            break
                                        case 'HOL':
                                            balanceDropdown = holBal
                                            break
                                        case 'EVZ':
                                            balanceDropdown = evzBal
                                            break
                                        case 'ZLP':
                                            balanceDropdown = zlpBal
                                            break
                                        case 'GRPH':
                                            balanceDropdown = grphBal
                                            break
                                        case 'SHARDS':
                                            balanceDropdown = shardsBal
                                            break
                                        case 'DUCK':
                                            balanceDropdown = duckBal
                                            break
                                        case 'ZPAINT':
                                            balanceDropdown = zpaintBal
                                            break
                                        case 'GP':
                                            balanceDropdown = gpBal
                                            break
                                        case 'GEMZ':
                                            balanceDropdown = gemzBal
                                            break
                                        case 'Oki':
                                            balanceDropdown = okiBal
                                            break
                                        case 'FRANC':
                                            balanceDropdown = francBal
                                            break
                                        case 'ZWALL':
                                            balanceDropdown = zwallBal
                                            break
                                        case 'PELE':
                                            balanceDropdown = peleBal
                                            break
                                        case 'GARY':
                                            balanceDropdown = garyBal
                                            break
                                        case 'CONSULT':
                                            balanceDropdown = consultBal
                                            break
                                        case 'ZAME':
                                            balanceDropdown = zameBal
                                            break
                                        case 'WALLEX':
                                            balanceDropdown = wallexBal
                                            break
                                        case 'HODL':
                                            balanceDropdown = hodlBal
                                            break
                                        case 'ATHLETE':
                                            balanceDropdown = athleteBal
                                            break
                                        case 'MILKY':
                                            balanceDropdown = milkyBal
                                            break
                                        case 'BOLT':
                                            balanceDropdown = boltBal
                                            break
                                        case 'MAMBO':
                                            balanceDropdown = mamboBal
                                            break
                                        case 'RECAP':
                                            balanceDropdown = recapBal
                                            break
                                        case 'ZCH':
                                            balanceDropdown = zchBal
                                            break
                                        case 'RSV':
                                            balanceDropdown = rsvBal
                                            break
                                        case 'NFTDEX':
                                            balanceDropdown = nftdexBal
                                            break
                                        case 'UNIDEX-V2':
                                            balanceDropdown = unidexv2Bal
                                            break
                                        case 'ZILLEX':
                                            balanceDropdown = zillexBal
                                            break
                                        case 'ZLF':
                                            balanceDropdown = zlfBal
                                            break
                                        case 'BUTTON':
                                            balanceDropdown = buttonBal
                                            break
                                        //@todo-x
                                    }
                                    return (
                                        <tbody key={i}>
                                            <tr className={styles.headerMobile}>
                                                <td
                                                    className={
                                                        styles.tdMobileHeader
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.txtListTitle
                                                        }
                                                    >
                                                        {val}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.buttonWrapperMobile
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.btnAction
                                                            }
                                                            onClick={() =>
                                                                addFunds(
                                                                    val,
                                                                    balanceDropdown[1]
                                                                )
                                                            }
                                                        >
                                                            {t('ADD_FUNDS')}
                                                        </div>
                                                        &nbsp;
                                                        <div
                                                            className={
                                                                styles.btnAction
                                                            }
                                                            onClick={() =>
                                                                withdrawFunds(
                                                                    val,
                                                                    balanceDropdown
                                                                )
                                                            }
                                                        >
                                                            {t('WITHDRAW')}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className={styles.row}>
                                                <td className={styles.tdMobile}>
                                                    <div className={styles.txt}>
                                                        &nbsp;DIDxWallet:{' '}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.txtList
                                                        }
                                                    >
                                                        {balanceDropdown[0]}
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className={styles.row}>
                                                <td className={styles.tdMobile}>
                                                    <div className={styles.txt}>
                                                        &nbsp;ZilPay:{' '}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.txtList
                                                        }
                                                    >
                                                        {balanceDropdown[1]}
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    )
                                })}
                            </table>
                        </div>
                        <div className={styles.wrapperSelectBtn}>
                            <div onClick={selectAll} className="button small">
                                SHOW ALL
                            </div>
                            &nbsp;
                            <div onClick={unselectAll} className="button small">
                                HIDE ALL
                            </div>
                            &nbsp;
                            {version >= 6 && (
                                <div
                                    onClick={() => {
                                        updateTypeBatchTransfer('transfer')
                                        updateTransferModal(true)
                                    }}
                                    className="button small"
                                >
                                    BATCH TRANSFER
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        )
    }
}

export default Component

const NewCurrency = ({
    setShowCurrencyDropdown,
    showCurrencyDropdown,
    fetchAllBalance,
    currencyDropdown,
    selectCurrency,
    checkIsExist,
}) => {
    const { t } = useTranslation()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = loginInfo.isLight ? stylesLight : stylesDark
    const defaultCheckmark = loginInfo.isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const selectedCheckmark = loginInfo.isLight
        ? selectedCheckmarkPurple
        : selectedCheckmarkReg
    return (
        <div className={styles.dropdownCheckListWrapper}>
            <div style={{ display: 'flex' }}>
                <div
                    onClick={() =>
                        setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                    className={styles.dropdownCheckList}
                >
                    {t('Add new currencies')}&nbsp;&nbsp;
                    <Image
                        src={showCurrencyDropdown ? arrowUp : arrowDown}
                        alt="arrow"
                    />
                </div>
                <div className={styles.wrapperIcoContinue}>
                    <div
                        onClick={() => {
                            fetchAllBalance()
                            setShowCurrencyDropdown(false)
                        }}
                    >
                        <Arrow isBlue={true} />
                    </div>
                </div>
            </div>
            {showCurrencyDropdown && (
                <>
                    <div
                        className={styles.closeWrapper}
                        onClick={() => {
                            fetchAllBalance()
                            setShowCurrencyDropdown(false)
                        }}
                    />
                    <div className={styles.wrapperOption}>
                        {currencyDropdown.map((val, i) => (
                            <div
                                key={i}
                                className={styles.option}
                                onClick={() => selectCurrency(val)}
                            >
                                {checkIsExist(val) ? (
                                    <div className={styles.optionIco}>
                                        <Image
                                            src={selectedCheckmark}
                                            alt="arrow"
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.optionIco}>
                                        <Image
                                            src={defaultCheckmark}
                                            alt="arrow"
                                        />
                                    </div>
                                )}
                                <div className={styles.txt}>{val}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
