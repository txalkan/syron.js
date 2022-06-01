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
} from '../../../../../src/store/modal'
import { $net } from '../../../../../src/store/wallet-network'
import { $loadingDoc, updateLoadingDoc } from '../../../../../src/store/loading'
import styles from './styles.module.scss'
import arrowDown from '../../../../../src/assets/icons/arrow_down_white.svg'
import arrowUp from '../../../../../src/assets/icons/arrow_up_white.svg'
import defaultCheckmark from '../../../../../src/assets/icons/default_checkmark.svg'
import selectedCheckmark from '../../../../../src/assets/icons/selected_checkmark.svg'
import controller from '../../../../../src/hooks/isController'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import { updateSelectedCurrencyDropdown } from '../../../../../src/app/actions'

function Component() {
    const net = useStore($net)
    const contract = useSelector((state: RootState) => state.modal.contract)
    const loadingDoc = useStore($loadingDoc)
    const dispatch = useDispatch()
    const { isController } = controller()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const selectedCurrencyDropdown = loginInfo?.selectedCurrencyDropdown
    const [tyronBal, settyronBal] = useState([0, 0])
    const [$siBal, set$siBal] = useState([0, 0])
    const [zilBal, setzilBal] = useState([0, 0])
    const [gzilBal, setgzilBal] = useState([0, 0])
    const [xsgdBal, setxsgdBal] = useState([0, 0])
    const [zusdtBal, setzusdtBal] = useState([0, 0])
    const [xidrBal, setxidrBal] = useState([0, 0])
    const [zwbtcBal, setzwbtcBal] = useState([0, 0])
    const [zethBal, setzethBal] = useState([0, 0])
    const [xcadBal, setxcadBal] = useState([0, 0])
    const [zopulBal, setzopulBal] = useState([0, 0])
    const [lunrBal, setlunrBal] = useState([0, 0])
    const [swthBal, setswthBal] = useState([0, 0])
    const [feesBal, setfeesBal] = useState([0, 0])
    const [portBal, setportBal] = useState([0, 0])
    const [zwapBal, setzwapBal] = useState([0, 0])
    const [dxcadBal, setdxcadBal] = useState([0, 0])
    const [zbrklBal, setzbrklBal] = useState([0, 0])
    const [scoBal, setscoBal] = useState([0, 0])
    const [carbBal, setcarbBal] = useState([0, 0])
    const [dmzBal, setdmzBal] = useState([0, 0])
    const [hunyBal, sethunyBal] = useState([0, 0])
    const [bloxBal, setbloxBal] = useState([0, 0])
    const [streamBal, setstreamBal] = useState([0, 0])
    const [redcBal, setredcBal] = useState([0, 0])
    const [holBal, setholBal] = useState([0, 0])
    const [evzBal, setevzBal] = useState([0, 0])
    const [zlpBal, setzlpBal] = useState([0, 0])
    const [grphBal, setgrphBal] = useState([0, 0])
    const [shardsBal, setshardsBal] = useState([0, 0])
    const [duckBal, setduckBal] = useState([0, 0])
    const [zpaintBal, setzpaintBal] = useState([0, 0])
    const [gpBal, setgpBal] = useState([0, 0])

    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)

    const fetchBalance = async (id: string) => {
        let token_addr: string
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        try {
            if (id !== 'zil') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                const get_services =
                    await init.API.blockchain.getSmartContractSubState(
                        init_addr,
                        'services'
                    )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )
                token_addr = services.get(id)
                const balances =
                    await init.API.blockchain.getSmartContractSubState(
                        token_addr,
                        'balances'
                    )
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )

                let res = [0, 0]
                try {
                    const balance_didxwallet = balances_.get(
                        contract!.addr.toLowerCase()
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
                const balance =
                    await init.API.blockchain.getSmartContractSubState(
                        contract?.addr!,
                        '_balance'
                    )

                const balance_ = balance.result._balance
                const zil_balance = Number(balance_) / 1e12

                const zilpay = new ZilPayBase().zilpay
                const zilPay = await zilpay()
                const blockchain = zilPay.blockchain
                const zilpay_balance = await blockchain.getBalance(
                    loginInfo.zilAddr.base16.toLowerCase()
                )
                const zilpay_balance_ =
                    Number(zilpay_balance.result!.balance) / 1e12

                let res = [
                    Number(zil_balance.toFixed(2)),
                    Number(zilpay_balance_.toFixed(2)),
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
        const allCurrency = [...currency, selectedCurrencyDropdown]
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
            }
        }
        updateLoadingDoc(false)
    }

    const addFunds = (currency: string, zilpayBalance: number) => {
        updateSelectedCurrency(currency)
        updateModalAddFunds(true)
        updateZilpayBalance(zilpayBalance)
    }

    const withdrawFunds = (currency: string) => {
        updateSelectedCurrency(currency)
        updateModalWithdrawal(true)
    }

    useEffect(() => {
        isController()
        fetchAllBalance()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
    ]

    const selectCurrency = (val) => {
        setShowCurrencyDropdown(false)
        if (!checkIsExist(val)) {
            let arr = selectedCurrencyDropdown
            arr.push(val)
            dispatch(updateSelectedCurrencyDropdown(arr))
        } else {
            let arr = selectedCurrencyDropdown.filter((arr) => arr !== val)
            dispatch(updateSelectedCurrencyDropdown(arr))
        }
        fetchAllBalance()
    }

    const checkIsExist = (val) => {
        if (selectedCurrencyDropdown.some((arr) => arr === val)) {
            return true
        } else {
            return false
        }
    }

    return (
        <div className={styles.wrapper}>
            {loadingDoc ? (
                <div style={{ marginTop: '50%' }}>
                    <i
                        className="fa fa-lg fa-spin fa-circle-notch"
                        aria-hidden="true"
                    ></i>
                </div>
            ) : (
                <>
                    <div className={styles.headerWrapper}>
                        <div className={styles.dropdownCheckListWrapper}>
                            <div
                                onClick={() =>
                                    setShowCurrencyDropdown(
                                        !showCurrencyDropdown
                                    )
                                }
                                className={styles.dropdownCheckList}
                            >
                                Add new currencies&nbsp;&nbsp;
                                <Image
                                    src={
                                        showCurrencyDropdown
                                            ? arrowUp
                                            : arrowDown
                                    }
                                    alt="arrow"
                                />
                            </div>
                            {showCurrencyDropdown && (
                                <div className={styles.wrapperOption}>
                                    {currencyDropdown.map((val, i) => (
                                        <div key={i} className={styles.option}>
                                            {checkIsExist(val) ? (
                                                <div
                                                    onClick={() =>
                                                        selectCurrency(val)
                                                    }
                                                    className={styles.optionIco}
                                                >
                                                    <Image
                                                        src={selectedCheckmark}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() =>
                                                        selectCurrency(val)
                                                    }
                                                    className={styles.optionIco}
                                                >
                                                    <Image
                                                        src={defaultCheckmark}
                                                        alt="arrow"
                                                    />
                                                </div>
                                            )}
                                            <div>{val}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr className={styles.header}>
                                <td className={styles.txtList}>CURRENCY</td>
                                <td className={styles.txtList}>DIDxWallet</td>
                                <td className={styles.txtList}>ZilPay</td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className={styles.row}>
                                <td className={styles.txtList}>TYRON</td>
                                <td className={styles.txtList}>
                                    {tyronBal[0]}
                                </td>
                                <td className={styles.txtList}>
                                    {tyronBal[1]}
                                </td>
                                <td className={styles.buttonWrapper}>
                                    <div
                                        className={styles.btnAction}
                                        onClick={() =>
                                            addFunds('TYRON', tyronBal[1])
                                        }
                                    >
                                        Add Funds
                                    </div>
                                    <div
                                        className={styles.btnAction}
                                        onClick={() => withdrawFunds('TYRON')}
                                    >
                                        Withdraw
                                    </div>
                                </td>
                            </tr>
                            {/* <tr className={styles.row}>
                <td className={styles.txtList}>$SI</td>
                <td className={styles.txtList}>{$siBal[0]}</td>
                <td className={styles.txtList}>{$siBal[1]}</td>
                <td className={styles.buttonWrapper}>
                  <div
                    onClick={() => addFunds("$SI", $siBal[1])}
                    className={styles.btnAction}
                  >
                    Add Funds
                  </div>
                  <div
                    onClick={() => withdrawFunds("$SI")}
                    className={styles.btnAction}
                  >
                    Withdraw
                  </div>
                </td>
              </tr> */}
                            <tr className={styles.row}>
                                <td className={styles.txtList}>ZIL</td>
                                <td className={styles.txtList}>{zilBal[0]}</td>
                                <td className={styles.txtList}>{zilBal[1]}</td>
                                <td className={styles.buttonWrapper}>
                                    <div
                                        onClick={() =>
                                            addFunds('ZIL', zilBal[1])
                                        }
                                        className={styles.btnAction}
                                    >
                                        Add Funds
                                    </div>
                                    <div
                                        onClick={() => withdrawFunds('ZIL')}
                                        className={styles.btnAction}
                                    >
                                        Withdraw
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
                                        <td className={styles.buttonWrapper}>
                                            <div
                                                onClick={() =>
                                                    addFunds(
                                                        val,
                                                        balanceDropdown[1]
                                                    )
                                                }
                                                className={styles.btnAction}
                                            >
                                                Add Funds
                                            </div>
                                            <div
                                                onClick={() =>
                                                    withdrawFunds(val)
                                                }
                                                className={styles.btnAction}
                                            >
                                                Withdraw
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    )
}

export default Component
