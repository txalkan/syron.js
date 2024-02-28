import { useStore as useEffector } from 'effector-react'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as tyron from 'tyron'
import Image from 'next/image'
import { RootState } from '../../src/app/reducers'
import {
    updateSelectedCurrency,
    updateZilpayBalance,
    updateHodlerModal,
    updateInvestorItems,
    $modalInvestor,
    updateSelectedCurrencyBal,
    updateTransferModal,
    updateTypeBatchTransfer,
} from '../../src/store/modal'
import {
    $loadingDoc,
    $loading,
    updateLoadingDoc,
} from '../../src/store/loading'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import arrowDown from '../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../src/assets/icons/arrow_up_white.svg'
import defaultCheckmarkLight from '../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkReg from '../../src/assets/icons/selected_checkmark.svg'
import selectedCheckmarkPurple from '../../src/assets/icons/selected_checkmark_purple.svg'
import refreshIco from '../../src/assets/icons/refresh.svg'
import { ZilPayBase } from '../ZilPay/zilpay-base'
import { updateSelectedCurrencyDropdown } from '../../src/app/actions'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import smartContract from '../../src/utils/smartContract'
import {
    AddFundsModal,
    Arrow,
    HodlerModal,
    ThunderIco,
    WithdrawalModal,
} from '..'
import toastTheme from '../../src/hooks/toastTheme'
import useFetch from '../../src/hooks/fetch'
import { $net } from '../../src/store/network'
import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoSend from '../../src/assets/icons/ssi_icon_send.svg'
import { TokenBalance } from '../../src/types/token'
import { Blockchain } from '../../src/mixins/custom-fetch'
import { useStore } from 'react-stores'
import { $wallet } from '../../src/store/wallet'
import iconBalance from '../../src/assets/icons/ssi_icon_balance.svg'
import iconTYRON from '../../src/assets/icons/ssi_token_Tyron.svg'
import iconS$I from '../../src/assets/icons/SSI_dollar.svg'
import { getIconURL } from '../../src/lib/viewblock'
import iconTyronSSI from '../../src/assets/icons/ssi_tyron_LPtoken.svg'
import { $tyron_liquidity } from '../../src/store/shares'
import { DragonDex } from '../../src/mixins/dex'
import _Big from 'big.js'
import toformat from 'toformat'
import ThreeDots from '../Spinner/ThreeDots'

const provider = new Blockchain()
const dex = new DragonDex()
const Big = toformat(_Big)
Big.PE = 999
function Component() {
    const resolvedInfo = useStore($resolvedInfo)

    const wallet = useStore($wallet)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { checkVersion } = useFetch(resolvedInfo)
    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const resolved_version = resolvedInfo?.version
    let batch_version = false
    let lp_token = false
    if (resolved_version?.slice(0, 4) === 'DEFI') {
        batch_version = true
        lp_token = true
    } else {
        const did_version = checkVersion(resolvedInfo?.version!)
        if (did_version >= 6) {
            batch_version = true
        }
    }
    const loadingDoc = useEffector($loadingDoc)
    const loading = useEffector($loading)
    const modalInvestor = useEffector($modalInvestor)
    const dispatch = useDispatch()
    const styles = loginInfo.isLight ? stylesLight : stylesDark
    const selectedCurrencyDropdown = loginInfo?.selectedCurrencyDropdown
    // @mainnet-tokens
    // const [tokensBal, setTokensBal]=useState<TokenBalance[]>()
    // @dev: index 0 & 2 are xWALLET; 1 & 3 are ZilPay; 2 & 3 are full balance; 4 is decimals
    const [tyronS$IBal, settyronS$IBal] = useState<any>([
        '-',
        '-',
        '-',
        '-',
        '-',
    ])
    const [tyronBal, settyronBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [s$iBal, sets$iBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zilBal, setzilBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [gzilBal, setgzilBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [stzilBal, setstzilBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [xsgdBal, setxsgdBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [xidrBal, setxidrBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zusdtBal, setzusdtBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zbnbBal, setzbnbBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zmaticBal, setzmaticBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zwbtcBal, setzwbtcBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zethBal, setzethBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [xcadBal, setxcadBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [vrzBal, setvrzBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [luluBal, setluluBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zopulBal, setzopulBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [lunrBal, setlunrBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [swthBal, setswthBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [feesBal, setfeesBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [portBal, setportBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zwapBal, setzwapBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [dxcadBal, setdxcadBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zbrklBal, setzbrklBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [scoBal, setscoBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [carbBal, setcarbBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [dmzBal, setdmzBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [hunyBal, sethunyBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [bloxBal, setbloxBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [streamBal, setstreamBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [redcBal, setredcBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [holBal, setholBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [evzBal, setevzBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zlpBal, setzlpBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [grphBal, setgrphBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [shardsBal, setshardsBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [duckBal, setduckBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zpaintBal, setzpaintBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [gpBal, setgpBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [gemzBal, setgemzBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [okiBal, setokiBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [francBal, setfrancBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zwallBal, setzwallBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [peleBal, setpeleBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [garyBal, setgaryBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [consultBal, setconsultBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zameBal, setzameBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [wallexBal, setwallexBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [hodlBal, sethodlBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [athleteBal, setathleteBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [milkyBal, setmilkyBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [boltBal, setboltBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [mamboBal, setmamboBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [recapBal, setrecapBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zchBal, setzchBal] = useState<any>(['-', '-', '-', '-', '-'])
    // const [rsvBal, setrsvBal] = useState<any>(['-', '-','-', '-'])
    const [nftdexBal, setnftdexBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [unidexv2Bal, setunidexv2Bal] = useState<any>([
        '-',
        '-',
        '-',
        '-',
        '-',
    ])
    const [zillexBal, setzillexBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [zlfBal, setzlfBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [buttonBal, setbuttonBal] = useState<any>(['-', '-', '-', '-', '-'])
    const [investorZilliqa, setInvestorZilliqa] = useState(false)
    const [investorZilliqaItems, setInvestorZilliqaItems] = useState(Array())
    const [investorDid, setInvestorDid] = useState(false)
    const [investorDidItems, setInvestorDidItems] = useState(Array())

    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
    //@dao
    const tydradex_liquidity = useStore($tyron_liquidity)

    // @reviewed: upgrade
    // const fetchBalance = async (id: string) => {
    //     let token_addr: string
    //     try {
    //         if (id !== 'zil') {
    //             const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
    //                 net,
    //                 'did',
    //                 'init'
    //             )
    //             const get_services = await getSmartContract(
    //                 init_addr,
    //                 'services'
    //             )
    //             const services = await tyron.SmartUtil.default.intoMap(
    //                 get_services!.result.services
    //             )
    //             token_addr = services.get(id)

    //             const balances = await getSmartContract(token_addr, 'balances')
    //             const balances_ = await tyron.SmartUtil.default.intoMap(
    //                 balances!.result.balances
    //             )

    //             let res = [0, 0]
    //             try {
    //                 const balance_didxwallet = balances_.get(
    //                     resolvedInfo?.addr!.toLowerCase()!
    //                 )
    //                 if (balance_didxwallet !== undefined) {
    //                     const _currency = tyron.Currency.default.tyron(id)
    //                     const finalBalance =
    //                         balance_didxwallet / _currency.decimals
    //                     res[0] = Number(finalBalance.toFixed(2))
    //                 }
    //             } catch (error) {
    //                 res[0] = 0
    //             }
    //             try {
    //                 const balance_zilpay = balances_.get(
    //                     zilpay_addr
    //                 )
    //                 if (balance_zilpay !== undefined) {
    //                     const _currency = tyron.Currency.default.tyron(id)
    //                     const finalBalance = balance_zilpay / _currency.decimals
    //                     res[1] = Number(finalBalance.toFixed(2))
    //                 }
    //             } catch (error) {
    //                 res[1] = 0
    //             }
    //             return res
    //         } else {
    //             const balance = await getSmartContract(
    //                 resolvedInfo?.addr!,
    //                 '_balance'
    //             )

    //             const balance_ = balance!.result._balance
    //             const zil_balance = Number(balance_) / 1e12

    //             const zilpay = new ZilPayBase().zilpay
    //             const zilPay = await zilpay()
    //             const blockchain = zilPay.blockchain
    //             const zilliqa_balance = await blockchain.getBalance(
    //                 zilpay_addr
    //             )
    //             const zilliqa_balance_ =
    //                 Number(zilliqa_balance.result!.balance) / 1e12

    //             let res = [
    //                 Number(zil_balance.toFixed(2)),
    //                 Number(zilliqa_balance_.toFixed(2)),
    //             ]
    //             return res
    //         }
    //     } catch (error) {
    //         let res = [0, 0]
    //         return res
    //     }
    // }
    const fetchBalance = async (ids: string[]) => {
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                'init'
            )
            const get_services = await getSmartContract(init_addr, 'services')
            const services = await tyron.SmartUtil.default.intoMap(
                get_services!.result.services
            )

            const token_balances: TokenBalance[] = []

            ids.forEach((id) => {
                const id_ = id.toLowerCase()
                const token_addr = services.get(id_)
                if (token_addr) {
                    const tokenAddressObject: TokenBalance = {
                        id: id_,
                        base16: token_addr,
                        balance_xwallet: 0,
                        balance_zilpay: 0,
                        full_bal_xwallet: 0,
                        full_bal_zilpay: 0,
                        decimals: 1e18,
                    }
                    token_balances.push(tokenAddressObject)
                } else {
                    console.log(`Token address not found for id: ${id}`)
                    // Handle the case where token address is not found for a particular id, if necessary.
                }
            })

            const balances = await provider.fetchBalancesPerTokenAddr(
                wallet?.base16!,
                zilpay_addr,
                token_balances
            )
            return balances
        } catch (error) {
            console.error(error)
        }
    }
    const fetchZILBalance = async () => {
        try {
            const balance = await getSmartContract(
                resolvedInfo?.addr!,
                '_balance'
            )

            const balance_ = balance!.result._balance
            const zil_balance = Number(balance_) / 1e12
            const zilpay = new ZilPayBase().zilpay
            const zilPay = await zilpay()
            const blockchain = zilPay.blockchain

            const zilliqa_balance = await blockchain.getBalance(zilpay_addr)
            const zilliqa_balance_ =
                Number(zilliqa_balance.result!.balance) / 1e12

            let res = [
                Number(zil_balance.toFixed(4)).toLocaleString(),
                Number(zilliqa_balance_.toFixed(4)).toLocaleString(),
                Big(balance_),
                Big(zilliqa_balance.result!.balance),
                1e12,
            ]
            return res
        } catch (error) {
            let res = [0, 0, 0, 0, 1e12]
            return res
        }
    }
    const fetchAllBalance = async () => {
        updateLoadingDoc(true)
        try {
            //@dao
            //@balance tyronS$I
            let tyronS$I_balance = ['0', '0', '0', '0', 1e18]
            if (lp_token === true) {
                const { daoBalances } = tydradex_liquidity
                const tyronS$I_bal = Big(daoBalances.tyron_s$i)
                    .div(dex.toDecimals(18))
                    .round(4)
                tyronS$I_balance = [
                    Number(tyronS$I_bal).toLocaleString(),
                    '0',
                    Big(daoBalances.tyron_s$i),
                    '0',
                    1e18,
                ]
            }
            settyronS$IBal(tyronS$I_balance)
            //@balance ZIL
            const zil_bal = await fetchZILBalance()
            setzilBal(zil_bal)

            //@balance tokens
            let ids = ['TYRON', 'S$I']
            ids = ids.concat(selectedCurrencyDropdown)
            console.log('ids_balance: ', JSON.stringify(ids, null, 2))

            const tokens_bal = await fetchBalance(ids)
            console.log('BAL_:', JSON.stringify(tokens_bal, null, 2))

            for (let i = 0; i < ids.length; i += 1) {
                const token_id = ids[i].toLowerCase()
                const balanceObject = tokens_bal!.find(
                    (token) => token.id === token_id
                )
                if (balanceObject) {
                    const bal = [
                        balanceObject.balance_xwallet.toLocaleString(),
                        balanceObject.balance_zilpay.toLocaleString(),
                        Big(balanceObject.full_bal_xwallet),
                        Big(balanceObject.full_bal_zilpay),
                        balanceObject.decimals,
                    ]
                    switch (token_id) {
                        //@mainnet-tokens
                        case 'tyron':
                            settyronBal(bal)
                            break
                        case 's$i':
                            sets$iBal(bal)
                            break
                        case 'gzil':
                            setgzilBal(bal)
                            break
                        case 'xidr':
                            setxidrBal(bal)
                            break
                        case 'xsgd':
                            setxsgdBal(bal)
                            break
                        case 'zusdt':
                            setzusdtBal(bal)
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
                        case 'vrz':
                            setvrzBal(bal)
                            break
                        case 'lulu':
                            setluluBal(bal)
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
                        case 'stzil':
                            setstzilBal(bal)
                            break
                        case 'zbnb':
                            setzbnbBal(bal)
                            break
                        case 'zmatic':
                            setzmaticBal(bal)
                            break
                    }
                } else {
                    console.log(`Balance not found for id: ${token_id}`)
                    // Handle the case where balance is not found for a particular id, if necessary.
                }
            }
        } catch (error) {
            console.error(error)
        }
        updateLoadingDoc(false)
    }

    const [receiveModal, setReceiveModal] = React.useState(false)
    const addFunds = (currency: string, zilpayBalance: number) => {
        updateSelectedCurrency(currency)
        updateZilpayBalance(zilpayBalance)
        setReceiveModal(true)
    }
    const [sendModal, setSendModal] = React.useState(false)
    const withdrawFunds = (currency: string, bal: any[]) => {
        updateSelectedCurrency(currency)
        updateSelectedCurrencyBal(bal)
        setSendModal(true)
    }

    const fetchInvestor = async () => {
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                'init'
            )
            const services = await getSmartContract(init_addr, 'services')
            const res = await tyron.SmartUtil.default.intoMap(
                services!.result.services
            )
            const addr = res.get('tyroni')
            const accounts = await getSmartContract(addr, 'accounts')
            const res2 = await tyron.SmartUtil.default.intoMap(
                accounts!.result.accounts
            )
            const addrList = Array.from(res2.keys())
            if (addrList.some((val) => val === zilpay_addr)) {
                setInvestorZilliqa(true)
                const zilliqaItems =
                    accounts!.result.accounts[zilpay_addr].arguments
                setInvestorZilliqaItems(zilliqaItems)
            }
            const resolved_addr = resolvedInfo?.addr
            if (resolved_addr !== undefined) {
                if (
                    addrList.some((val) => val === resolved_addr.toLowerCase())
                ) {
                    setInvestorDid(true)
                    const didItems =
                        accounts!.result.accounts[
                            resolvedInfo?.addr!.toLowerCase()!
                        ].arguments
                    setInvestorDidItems(didItems)
                }
            } else {
                toast.warn('Not able to resolve this DIDxWALLET.', {
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
            toast.warn('Not a Hodler Account.', {
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
        //@tokens
        'gZIL',
        'stZIL',
        'XSGD',
        'XIDR',
        'ZWAP',
        'zUSDT',
        'zWBTC',
        'zETH',
        // 'zBNB',
        // 'zMATIC',
        'XCAD',
        'dXCAD',
        'VRZ',
        'LULU',
        // 'SWTH',
        'FEES',
        'ZPAINT',
        'STREAM',
        // 'PORT',

        // 'zBRKL',
        // 'SCO',
        // 'CARB',
        'zOPUL',
        'Huny',
        'DMZ',
        // 'BLOX',

        // 'REDC',
        // 'HOL',
        // 'EVZ',
        'ZLP',
        // 'GRPH',
        // 'SHARDS',
        // 'DUCK',
        // 'GP',
        // 'GEMZ',
        // 'Oki',
        // 'FRANC',
        // 'ZWALL',
        // 'PELE',
        // 'GARY',
        // 'CONSULT',
        // 'ZAME',
        // 'WALLEX',
        // 'HODL',
        // 'ATHLETE',
        // 'MILKY',
        // 'BOLT',
        // 'MAMBO',
        // 'RECAP',
        // 'ZCH',
        // 'RSV',
        // 'NFTDEX',
        // 'UNIDEX-V2',
        // 'ZILLEX',
        // 'ZLF',
        // 'BUTTON',
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
        setShowCurrencyDropdown(false)
        fetchAllBalance()
    }

    const unselectAll = () => {
        dispatch(updateSelectedCurrencyDropdown([]))
        setShowCurrencyDropdown(false)
        fetchAllBalance()
    }
    if (receiveModal) {
        return (
            <AddFundsModal
                show={receiveModal}
                onClose={() => setReceiveModal(false)}
            />
        )
    } else if (sendModal) {
        return (
            <WithdrawalModal
                show={sendModal}
                onClose={() => setSendModal(false)}
            />
        )
    } else if (modalInvestor) {
        return <HodlerModal />
    } else {
        return (
            <div className={styles.wrapper}>
                {loadingDoc || loading ? (
                    <ThreeDots color="da-igual" />
                ) : (
                    <>
                        <div className={styles.headerTitle}>
                            <div className={styles.icoWrapper}>
                                <Image
                                    src={iconBalance}
                                    alt="balance-icon"
                                    height="34"
                                    width="34"
                                />
                                <div className={styles.title}>
                                    {t('BALANCES')}
                                </div>
                            </div>
                            <div
                                onClick={fetchAllBalance}
                                className={styles.refreshIcoMobile}
                            >
                                <Image src={refreshIco} alt="refresh-ico" />
                            </div>
                        </div>
                        <br />
                        <div className={styles.wrapperSelectBtn}>
                            {batch_version && (
                                <div
                                    onClick={() => {
                                        updateTypeBatchTransfer('transfer')
                                        updateTransferModal(true)
                                    }}
                                    className="button small"
                                >
                                    {t('BATCH TRANSFER')}
                                </div>
                            )}
                        </div>
                        <div className={styles.container}>
                            <table>
                                <thead></thead>
                            </table>
                            {/* <div className={styles.tbl}>
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
                                                    selectAll={selectAll}
                                                    unselectAll={unselectAll}
                                                />
                                            </td>
                                        </tr>
                                        <tr className={styles.header}>
                                            <td className={styles.txtListTitle}>
                                                {t('CURRENCY')}
                                            </td>
                                            <td className={styles.txtListTitle}>
                                                xWALLET
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
                                                    &nbsp;
                                                    <ThunderIco
                                                        onClick={() => {
                                                            if (investorDid) {
                                                                updateInvestorItems(
                                                                    investorDidItems
                                                                )
                                                                updateHodlerModal(
                                                                    true
                                                                )
                                                            } else {
                                                                toast.warn(
                                                                    'Not a Hodler Account.',
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
                                                    &nbsp;
                                                    <ThunderIco
                                                        onClick={() => {
                                                            if (investorZilliqa) {
                                                                updateInvestorItems(
                                                                    investorZilliqaItems
                                                                )
                                                                updateHodlerModal(
                                                                    true
                                                                )
                                                            } else {
                                                                toast.warn(
                                                                    'Not a Hodler Account.',
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
                                                    {t('RECEIVE')}
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
                                            <td className={styles.txtList}>S$I</td>
                                            <td className={styles.txtList}>
                                                {s$iBal[0]}
                                            </td>
                                            <td className={styles.txtList}>
                                                {s$iBal[1]}
                                            </td>
                                            <td className={styles.buttonWrapper}>
                                                <div
                                                    onClick={() =>
                                                        addFunds('S$I', s$iBal[1])
                                                    }
                                                    className={styles.btnAction}
                                                >
                                                    {t('RECEIVE')}
                                                </div>
                                                <div
                                                    onClick={() =>
                                                        withdrawFunds('S$I', s$iBal)
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
                                                    {t('RECEIVE')}
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
                                            let balanceDropdown: any[] = []
                                            //@tokens
                                            switch (val) {
                                                case 'gZIL':
                                                    balanceDropdown = gzilBal
                                                    break
                                                case 'XSGD':
                                                    balanceDropdown = xsgdBal
                                                    break
                                                case 'XIDR':
                                                    balanceDropdown = xidrBal
                                                    break
                                                case 'zUSDT':
                                                    balanceDropdown = zusdtBal
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
                                                case 'VRZ':
                                                    balanceDropdown = vrzBal
                                                    break
                                                case 'LULU':
                                                    balanceDropdown = luluBal
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
                                                case 'stZIL':
                                                    balanceDropdown = stzilBal
                                                    break
                                                case 'zBNB':
                                                    balanceDropdown = zbnbBal
                                                    break
                                                case 'zMATIC':
                                                    balanceDropdown = zmaticBal
                                                    break
                                            }
                                            return (
                                                <tr key={i} className={styles.row}>
                                                    <td className={styles.txtList}>
                                                        {val}
                                                    </td>
                                                    <td className={styles.txtList}>
                                                        {balanceDropdown[0] ===
                                                            '-' ? (
                                                            <Image
                                                                width={10}
                                                                src={refreshIco}
                                                                alt="refresh-ico"
                                                            />
                                                        ) : (
                                                            balanceDropdown[0]
                                                        )}
                                                    </td>
                                                    <td className={styles.txtList}>
                                                        {balanceDropdown[1] ===
                                                            '-' ? (
                                                            <Image
                                                                width={10}
                                                                src={refreshIco}
                                                                alt="refresh-ico"
                                                            />
                                                        ) : (
                                                            balanceDropdown[1]
                                                        )}
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
                                                            {t('RECEIVE')}
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
                            </div> */}
                            <div className={styles.tblMobile}>
                                <div className={styles.headerWrapper}>
                                    <NewCurrency
                                        setShowCurrencyDropdown={
                                            setShowCurrencyDropdown
                                        }
                                        showCurrencyDropdown={
                                            showCurrencyDropdown
                                        }
                                        fetchAllBalance={fetchAllBalance}
                                        currencyDropdown={currencyDropdown}
                                        selectCurrency={selectCurrency}
                                        checkIsExist={checkIsExist}
                                        selectAll={selectAll}
                                        unselectAll={unselectAll}
                                    />
                                </div>
                                <table>
                                    <tbody>
                                        <tr className={styles.headerMobile}>
                                            <td
                                                className={
                                                    styles.tdMobileHeader
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.icoWrapper
                                                    }
                                                >
                                                    <Image
                                                        src={iconTyronSSI}
                                                        alt="balance-icon"
                                                        height="25"
                                                        width="25"
                                                    />
                                                    <div
                                                        className={
                                                            styles.txtListTitle
                                                        }
                                                    >
                                                        tyronS$I
                                                    </div>
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
                                                                'tyronS$I',
                                                                tyronS$IBal[1]
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.icoWrapper
                                                            }
                                                        >
                                                            <div>
                                                                <Image
                                                                    src={
                                                                        icoReceive
                                                                    }
                                                                    alt="transfer-ico"
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.titleFunds
                                                                }
                                                            >
                                                                {t('RECEIVE')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.btnAction
                                                        }
                                                        onClick={() =>
                                                            withdrawFunds(
                                                                'tyronS$I',
                                                                tyronS$IBal
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.icoWrapper
                                                            }
                                                        >
                                                            <div>
                                                                <Image
                                                                    src={
                                                                        icoSend
                                                                    }
                                                                    alt="transfer-ico"
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.titleFunds
                                                                }
                                                            >
                                                                {t('WITHDRAW')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={styles.row}>
                                            <td className={styles.tdMobile}>
                                                <div className={styles.txtList}>
                                                    &nbsp;xWALLET:&nbsp;
                                                </div>
                                                <div className={styles.txtList}>
                                                    {tyronS$IBal[0]}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={styles.row}>
                                            <td className={styles.tdMobile}>
                                                <div className={styles.txtList}>
                                                    &nbsp;ZilPay:&nbsp;
                                                </div>
                                                <div className={styles.txtList}>
                                                    {tyronS$IBal[1]}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tbody>
                                        <tr className={styles.headerMobile}>
                                            <td
                                                className={
                                                    styles.tdMobileHeader
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.icoWrapper
                                                    }
                                                >
                                                    <Image
                                                        src={iconTYRON}
                                                        alt="balance-icon"
                                                        height="25"
                                                        width="25"
                                                    />
                                                    <div
                                                        className={
                                                            styles.txtListTitle
                                                        }
                                                    >
                                                        TYRON
                                                    </div>
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
                                                                'TYRON',
                                                                tyronBal[1]
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.icoWrapper
                                                            }
                                                        >
                                                            <div>
                                                                <Image
                                                                    src={
                                                                        icoReceive
                                                                    }
                                                                    alt="transfer-ico"
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.titleFunds
                                                                }
                                                            >
                                                                {t('RECEIVE')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.btnAction
                                                        }
                                                        onClick={() =>
                                                            withdrawFunds(
                                                                'TYRON',
                                                                tyronBal
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.icoWrapper
                                                            }
                                                        >
                                                            <div>
                                                                <Image
                                                                    src={
                                                                        icoSend
                                                                    }
                                                                    alt="transfer-ico"
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.titleFunds
                                                                }
                                                            >
                                                                {t('WITHDRAW')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={styles.row}>
                                            <td className={styles.tdMobile}>
                                                <div className={styles.txtList}>
                                                    &nbsp;xWALLET:&nbsp;
                                                </div>
                                                <div className={styles.txtList}>
                                                    {tyronBal[0]}
                                                </div>
                                                &nbsp;
                                                <ThunderIco
                                                    onClick={() => {
                                                        if (investorDid) {
                                                            updateInvestorItems(
                                                                investorDidItems
                                                            )
                                                            updateHodlerModal(
                                                                true
                                                            )
                                                        } else {
                                                            toast.info(
                                                                'Not a Hodler Account.',
                                                                {
                                                                    position:
                                                                        'bottom-left',
                                                                    autoClose: 2222,
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
                                            </td>
                                        </tr>
                                        <tr className={styles.row}>
                                            <td className={styles.tdMobile}>
                                                <div className={styles.txtList}>
                                                    &nbsp;ZilPay:&nbsp;
                                                </div>
                                                <div className={styles.txtList}>
                                                    {tyronBal[1]}
                                                </div>
                                                &nbsp;
                                                <ThunderIco
                                                    onClick={() => {
                                                        if (investorZilliqa) {
                                                            updateInvestorItems(
                                                                investorZilliqaItems
                                                            )
                                                            updateHodlerModal(
                                                                true
                                                            )
                                                        } else {
                                                            toast.info(
                                                                'Not a Hodler Account.',
                                                                {
                                                                    position:
                                                                        'bottom-left',
                                                                    autoClose: 2222,
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
                                                                    toastId: 2,
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
                                            <td
                                                className={
                                                    styles.tdMobileHeader
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.icoWrapper
                                                    }
                                                >
                                                    <Image
                                                        src={iconS$I}
                                                        alt="balance-icon"
                                                        height="25"
                                                        width="25"
                                                    />
                                                    <div
                                                        className={
                                                            styles.txtListTitle
                                                        }
                                                    >
                                                        S$I
                                                    </div>
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
                                                                'S$I',
                                                                s$iBal[1]
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.icoWrapper
                                                            }
                                                        >
                                                            <div>
                                                                <Image
                                                                    src={
                                                                        icoReceive
                                                                    }
                                                                    alt="transfer-ico"
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.titleFunds
                                                                }
                                                            >
                                                                {t('RECEIVE')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.btnAction
                                                        }
                                                        onClick={() =>
                                                            withdrawFunds(
                                                                'S$I',
                                                                s$iBal
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.icoWrapper
                                                            }
                                                        >
                                                            <div>
                                                                <Image
                                                                    src={
                                                                        icoSend
                                                                    }
                                                                    alt="transfer-ico"
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.titleFunds
                                                                }
                                                            >
                                                                {t('WITHDRAW')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={styles.row}>
                                            <td className={styles.tdMobile}>
                                                <div className={styles.txtList}>
                                                    &nbsp;xWALLET:&nbsp;
                                                </div>
                                                <div className={styles.txtList}>
                                                    {s$iBal[0]}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={styles.row}>
                                            <td className={styles.tdMobile}>
                                                <div className={styles.txtList}>
                                                    &nbsp;ZilPay:&nbsp;
                                                </div>
                                                <div className={styles.txtList}>
                                                    {s$iBal[1]}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tbody>
                                        <tr className={styles.headerMobile}>
                                            <td
                                                className={
                                                    styles.tdMobileHeader
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.icoWrapper
                                                    }
                                                >
                                                    <Image
                                                        src={getIconURL(
                                                            'zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz'
                                                        )}
                                                        alt="balance-icon"
                                                        height="22"
                                                        width="22"
                                                    />
                                                    <div
                                                        className={
                                                            styles.txtListTitle
                                                        }
                                                    >
                                                        ZIL
                                                    </div>
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
                                                                'ZIL',
                                                                zilBal[1]
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.icoWrapper
                                                            }
                                                        >
                                                            <div>
                                                                <Image
                                                                    src={
                                                                        icoReceive
                                                                    }
                                                                    alt="transfer-ico"
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.titleFunds
                                                                }
                                                            >
                                                                {t('RECEIVE')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.btnAction
                                                        }
                                                        onClick={() =>
                                                            withdrawFunds(
                                                                'ZIL',
                                                                zilBal
                                                            )
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.icoWrapper
                                                            }
                                                        >
                                                            <div>
                                                                <Image
                                                                    src={
                                                                        icoSend
                                                                    }
                                                                    alt="transfer-ico"
                                                                />
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.titleFunds
                                                                }
                                                            >
                                                                {t('WITHDRAW')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={styles.row}>
                                            <td className={styles.tdMobile}>
                                                <div className={styles.txtList}>
                                                    &nbsp;xWALLET:&nbsp;
                                                </div>
                                                <div className={styles.txtList}>
                                                    {zilBal[0]}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className={styles.row}>
                                            <td className={styles.tdMobile}>
                                                <div className={styles.txtList}>
                                                    &nbsp;ZilPay:&nbsp;
                                                </div>
                                                <div className={styles.txtList}>
                                                    {zilBal[1]}
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    {selectedCurrencyDropdown.map((val, i) => {
                                        let balanceDropdown: any[] = []
                                        //@tokens
                                        switch (val) {
                                            case 'gZIL':
                                                balanceDropdown = gzilBal
                                                break
                                            case 'XSGD':
                                                balanceDropdown = xsgdBal
                                                break
                                            case 'XIDR':
                                                balanceDropdown = xidrBal
                                                break
                                            case 'zUSDT':
                                                balanceDropdown = zusdtBal
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
                                            case 'VRZ':
                                                balanceDropdown = vrzBal
                                                break
                                            case 'LULU':
                                                balanceDropdown = luluBal
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
                                            // case 'RSV':
                                            //     balanceDropdown = rsvBal
                                            //     break
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
                                            case 'stZIL':
                                                balanceDropdown = stzilBal
                                                break
                                            case 'zBNB':
                                                balanceDropdown = zbnbBal
                                                break
                                            case 'zMATIC':
                                                balanceDropdown = zmaticBal
                                                break
                                        }
                                        return (
                                            <tbody key={i}>
                                                <tr
                                                    className={
                                                        styles.headerMobile
                                                    }
                                                >
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
                                                                <div
                                                                    className={
                                                                        styles.icoWrapper
                                                                    }
                                                                >
                                                                    <Image
                                                                        src={
                                                                            icoReceive
                                                                        }
                                                                        alt="transfer-ico"
                                                                    />
                                                                    <div
                                                                        className={
                                                                            styles.titleFunds
                                                                        }
                                                                    >
                                                                        {t(
                                                                            'RECEIVE'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
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
                                                                <div
                                                                    className={
                                                                        styles.icoWrapper
                                                                    }
                                                                >
                                                                    <Image
                                                                        src={
                                                                            icoSend
                                                                        }
                                                                        alt="transfer-ico"
                                                                    />
                                                                    <div
                                                                        className={
                                                                            styles.titleFunds
                                                                        }
                                                                    >
                                                                        {t(
                                                                            'WITHDRAW'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className={styles.row}>
                                                    <td
                                                        className={
                                                            styles.tdMobile
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.txt
                                                            }
                                                        >
                                                            &nbsp;xWALLET:&nbsp;
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.txtList
                                                            }
                                                        >
                                                            {balanceDropdown[0] ===
                                                            '-' ? (
                                                                <>
                                                                    &nbsp;
                                                                    <Image
                                                                        width={
                                                                            10
                                                                        }
                                                                        src={
                                                                            refreshIco
                                                                        }
                                                                        alt="refresh-ico"
                                                                    />
                                                                </>
                                                            ) : (
                                                                balanceDropdown[0]
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className={styles.row}>
                                                    <td
                                                        className={
                                                            styles.tdMobile
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.txt
                                                            }
                                                        >
                                                            &nbsp;ZilPay:&nbsp;
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.txtList
                                                            }
                                                        >
                                                            {balanceDropdown[1] ===
                                                            '-' ? (
                                                                <>
                                                                    &nbsp;
                                                                    <Image
                                                                        width={
                                                                            10
                                                                        }
                                                                        src={
                                                                            refreshIco
                                                                        }
                                                                        alt="refresh-ico"
                                                                    />
                                                                </>
                                                            ) : (
                                                                balanceDropdown[1]
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        )
                                    })}
                                </table>
                            </div>
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
    selectAll,
    unselectAll,
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

    const [search, setSearch] = useState('')

    const onSearch = (event: { target: { value: any } }) => {
        let input = event.target.value
        setSearch(input)
    }

    return (
        <div className={styles.dropdownCheckListWrapper}>
            <div style={{ display: 'flex' }}>
                <div
                    onClick={() =>
                        setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                    className={styles.dropdownCheckList}
                >
                    {t('Add new currencies')}&nbsp;
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
                        <Arrow />
                        {/* <Arrow isBlue={true} /> */}
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
                    <div style={{ zIndex: 1 }} className={styles.wrapperOption}>
                        <input
                            onChange={onSearch}
                            className={styles.inputSearchCoin}
                            type="text"
                        />
                        <div className={styles.wrapperOptionList}>
                            {currencyDropdown.map((val, i) => {
                                if (
                                    val
                                        .toLowerCase()
                                        .includes(search.toLowerCase()) ||
                                    search === ''
                                ) {
                                    return (
                                        <div
                                            key={i}
                                            className={styles.option}
                                            onClick={() => selectCurrency(val)}
                                        >
                                            {checkIsExist(val) ? (
                                                <div
                                                    className={styles.optionIco}
                                                >
                                                    <Image
                                                        src={selectedCheckmark}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className={styles.optionIco}
                                                >
                                                    <Image
                                                        src={defaultCheckmark}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            )}
                                            <div className={styles.txtList}>
                                                {val}
                                            </div>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                        <div className={styles.wrapperBtnShowAndHide}>
                            <div
                                onClick={selectAll}
                                className={styles.btnShowSmall}
                            >
                                SHOW ALL
                            </div>
                            &nbsp;
                            <div
                                onClick={unselectAll}
                                className={styles.btnShowSmall}
                            >
                                HIDE ALL
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
