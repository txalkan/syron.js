import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as tyron from 'tyron'
import smartContract from '../../../../../src/utils/smartContract'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../src/app/reducers'
import InfoBlue from '../../../../../src/assets/icons/info_blue.svg'
import InfoDefault from '../../../../../src/assets/icons/info_default.svg'
import Spinner from '../../../../Spinner'

function DashboardStake({ balance }) {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const resolvedInfo = useStore($resolvedInfo)
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const [loading, setLoading] = useState(false)
    const [stake1, setStake1] = useState(Array())
    const [stake2, setStake2] = useState(Array())
    const [stake3, setStake3] = useState(Array())
    const [stake4, setStake4] = useState(Array())
    const [stake5, setStake5] = useState(Array())
    const [stake6, setStake6] = useState(Array())
    const [stake7, setStake7] = useState(Array())
    const [stakeZilliqa1, setStakeZilliqa1] = useState(Array())
    const [stakeZilliqa2, setStakeZilliqa2] = useState(Array())
    const [stakeZilliqa3, setStakeZilliqa3] = useState(Array())
    const [stakeZilliqa4, setStakeZilliqa4] = useState(Array())
    const [stakeZilliqa5, setStakeZilliqa5] = useState(Array())
    const [stakeZilliqa6, setStakeZilliqa6] = useState(Array())
    const [stakeZilliqa7, setStakeZilliqa7] = useState(Array())

    const optionMainnet = [
        {
            key: 'ssncex.io',
            name: 'CEX.IO',
        },
        {
            key: 'ssnmoonlet.io',
            name: 'Moonlet.io',
        },
        {
            key: 'ssnatomicwallet',
            name: 'AtomicWallet',
        },
        {
            key: 'ssnbinancestaking',
            name: 'Binance Staking',
        },
        {
            key: 'ssnzillet',
            name: 'Zillet',
        },
        {
            key: 'ssnignitedao',
            name: 'Ignite DAO',
        },
        {
            key: 'ssnvalkyrie2',
            name: 'Valkyrie2',
        },
        {
            key: 'ssnviewblock',
            name: 'ViewBlock',
        },
        {
            key: 'ssnkucoin',
            name: 'KuCoin',
        },
        {
            key: 'ssnzilliqa',
            name: 'Zilliqa',
        },
        {
            key: 'ssnhuobistaking',
            name: 'Huobi Staking',
        },
        {
            key: 'ssnshardpool.io',
            name: 'Shardpool.io',
        },
        {
            key: 'ssnezil.me',
            name: 'Ezil.me',
        },
        {
            key: 'ssnnodamatics.com',
            name: 'Nodamatics.com',
        },
        {
            key: 'ssneverstake.one',
            name: 'Everstake.one',
        },
        {
            key: 'ssnzilliqa2',
            name: 'Zilliqa2',
        },
    ]

    const optionTestnet = [
        {
            key: 'ssnmoonlet.io',
            name: 'Moonlet.io',
        },
        {
            key: 'ssnzillet',
            name: 'Zillet',
        },
    ]

    const ssnList = net === 'mainnet' ? optionMainnet : optionTestnet

    const stakeList = [
        'buff_deposit_deleg',
        'deleg_stake_per_cycle',
        'deposit_amt_deleg',
        'last_buf_deposit_cycle_deleg',
        'last_withdraw_cycle_deleg',
        'ssn_deleg_amt',
        'withdrawal_pending',
    ]

    const addrList = ['xwallet', 'zilliqa']

    const fetchStake = async () => {
        setLoading(true)
        const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
            net,
            'init',
            'did'
        )
        const get_services = await getSmartContract(init_addr!, 'services')
        const services = await tyron.SmartUtil.default.intoMap(
            get_services.result.services
        )
        let addr = resolvedInfo?.addr?.toLowerCase()
        let addrType = 'xwallet'
        for (let i = 0; i < addrList.length; i += 1) {
            if (addrList[i] === 'zilliqa') {
                addr = loginInfo.zilAddr.base16.toLowerCase()
                addrType = 'zilliqa'
            }
            for (let i = 0; i < stakeList.length; i += 1) {
                const key = stakeList[i]

                //@todo-i-checked fetch staking impl addr from init services (id= 'zilstakingimpl')
                const state = await getSmartContract(
                    services.get('zilstakingimpl'),
                    key
                )
                const res = await tyron.SmartUtil.default.intoMap(
                    state.result[key]
                )
                if (res !== undefined) {
                    await tyron.SmartUtil.default
                        .intoMap(res.get(addr!))
                        .then(async (res2) => {
                            let arrRes: any = []
                            for (let i = 0; i < ssnList.length; i += 1) {
                                const ssnAddr = services.get(ssnList[i].key)
                                const res3 = res2.get(ssnAddr)
                                let value
                                if (res3 !== undefined) {
                                    value = Object.values(res3)
                                } else {
                                    value = 0
                                }
                                const res = {
                                    name: ssnList[i].name,
                                    val: value,
                                }
                                arrRes.push(res)
                            }
                            if (addrType === 'xwallet') {
                                switch (key) {
                                    case 'buff_deposit_deleg':
                                        setStake1(arrRes)
                                        break
                                    case 'deleg_stake_per_cycle':
                                        setStake2(arrRes)
                                        break
                                    case 'deposit_amt_deleg':
                                        setStake3(arrRes)
                                        break
                                    case 'last_buf_deposit_cycle_deleg':
                                        setStake4(arrRes)
                                        break
                                    case 'last_withdraw_cycle_deleg':
                                        setStake5(arrRes)
                                        break
                                    case 'ssn_deleg_amt':
                                        setStake6(arrRes)
                                        break
                                    case 'withdrawal_pending':
                                        setStake7(arrRes)
                                        break
                                }
                            } else {
                                switch (key) {
                                    case 'buff_deposit_deleg':
                                        setStakeZilliqa1(arrRes)
                                        break
                                    case 'deleg_stake_per_cycle':
                                        setStakeZilliqa2(arrRes)
                                        break
                                    case 'deposit_amt_deleg':
                                        setStakeZilliqa3(arrRes)
                                        break
                                    case 'last_buf_deposit_cycle_deleg':
                                        setStakeZilliqa4(arrRes)
                                        break
                                    case 'last_withdraw_cycle_deleg':
                                        setStakeZilliqa5(arrRes)
                                        break
                                    case 'ssn_deleg_amt':
                                        setStakeZilliqa6(arrRes)
                                        break
                                    case 'withdrawal_pending':
                                        setStakeZilliqa7(arrRes)
                                        break
                                }
                            }
                        })
                        .catch(() => {})
                }
            }
        }
        setLoading(false)
    }

    const getVal = (key: string, data: any[], notAmount?: boolean) => {
        const res: any = data.filter((val_) => val_.name === key)[0]
        let value: JSX.Element
        if (res?.val) {
            if (notAmount) {
                value = res.val
            } else {
                value = (
                    <>
                        {(Number(res.val.join('')) / 1e12).toFixed(2)}{' '}
                        <span style={{ color: '#0000ff' }}>ZIL</span>
                    </>
                )
            }
        } else {
            value = <span style={{ color: '#0000ff' }}>---</span>
        }
        return value
    }

    const checkRender = (key: string, data1: any[], data2: any[]) => {
        const res1: any = data1.filter((val_) => val_.name === key)[0]
        const res2: any = data2.filter((val_) => val_.name === key)[0]
        if (!res1?.val && !res2?.val) {
            return false
        } else {
            return true
        }
    }

    useEffect(() => {
        fetchStake()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <div className={styles.spinner}>
                <Spinner />
            </div>
        )
    }

    return (
        <table className={styles.table}>
            <tbody>
                <tr className={styles.header}>
                    <td></td>
                    <td>xWallet</td>
                    <td>ZilPay</td>
                </tr>
                <tr className={styles.row}>
                    <td className={styles.txt}>Balance</td>
                    <td className={styles.txt}>{balance[0]} ZIL</td>
                    <td className={styles.txt}>{balance[1]} ZIL</td>
                </tr>
                <tr className={styles.row}>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>
                                Buffered deposit
                                <span className={styles.tooltip}>
                                    <div className={styles.ico}>
                                        <div className={styles.icoDefault}>
                                            <Image
                                                alt="info-ico"
                                                src={InfoDefault}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                        <div className={styles.icoColor}>
                                            <Image
                                                alt="info-ico"
                                                src={InfoBlue}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                    </div>
                                    <span className={styles.tooltiptext}>
                                        Amount not getting rewards until the
                                        next cycle.
                                    </span>
                                </span>
                            </div>
                            <ul className={styles.ul}>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake1,
                                            stakeZilliqa1
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li}>
                                                <div className={styles.txt}>
                                                    {val.name}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>&nbsp;</div>
                            <ul>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake1,
                                            stakeZilliqa1
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li2}>
                                                <div className={styles.txt}>
                                                    {getVal(val.name, stake1)}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>&nbsp;</div>
                            <ul>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake1,
                                            stakeZilliqa1
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li2}>
                                                <div className={styles.txt}>
                                                    {getVal(
                                                        val.name,
                                                        stakeZilliqa1
                                                    )}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                </tr>
                <tr className={styles.row}>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>Delegated Stake</div>
                            <ul className={styles.ul}>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake2,
                                            stakeZilliqa2
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li}>
                                                <div className={styles.txt}>
                                                    {val.name}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>&nbsp;</div>
                            <ul>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake2,
                                            stakeZilliqa2
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li2}>
                                                <div className={styles.txt}>
                                                    {getVal(val.name, stake2)}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>&nbsp;</div>
                            <ul>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake2,
                                            stakeZilliqa2
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li2}>
                                                <div className={styles.txt}>
                                                    {getVal(
                                                        val.name,
                                                        stakeZilliqa2
                                                    )}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                </tr>
                <tr className={styles.row}>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>
                                Deposited Amount
                                <span className={styles.tooltip}>
                                    <div className={styles.ico}>
                                        <div className={styles.icoDefault}>
                                            <Image
                                                alt="info-ico"
                                                src={InfoDefault}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                        <div className={styles.icoColor}>
                                            <Image
                                                alt="info-ico"
                                                src={InfoBlue}
                                                width={20}
                                                height={20}
                                            />
                                        </div>
                                    </div>
                                    <span className={styles.tooltiptext}>
                                        Amount transferred to Zillion in total.
                                    </span>
                                </span>
                            </div>
                            <ul className={styles.ul}>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake3,
                                            stakeZilliqa3
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li}>
                                                <div className={styles.txt}>
                                                    {val.name}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>&nbsp;</div>
                            <ul>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake3,
                                            stakeZilliqa3
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li2}>
                                                <div className={styles.txt}>
                                                    {getVal(val.name, stake3)}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                    <td>
                        <div className={styles.container}>
                            <div className={styles.txt}>&nbsp;</div>
                            <ul>
                                {ssnList.map((val, i) => {
                                    if (
                                        checkRender(
                                            val.name,
                                            stake3,
                                            stakeZilliqa3
                                        )
                                    ) {
                                        return (
                                            <li key={i} className={styles.li2}>
                                                <div className={styles.txt}>
                                                    {getVal(
                                                        val.name,
                                                        stakeZilliqa3
                                                    )}
                                                </div>
                                            </li>
                                        )
                                    }
                                })}
                            </ul>
                        </div>
                    </td>
                </tr>
                {/* <tr className={styles.row}>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>Last Buf Deposit</div>
                        <ul className={styles.ul}>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake4, stakeZilliqa4)
                                ) {
                                    return (
                                        <li key={i} className={styles.li}>
                                            <div className={styles.txt}>
                                                {val.name}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>&nbsp;</div>
                        <ul>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake4, stakeZilliqa4)
                                ) {
                                    return (
                                        <li key={i} className={styles.li2}>
                                            <div className={styles.txt}>
                                                {getVal(val.name, stake4, true)}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>&nbsp;</div>
                        <ul>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake4, stakeZilliqa4)
                                ) {
                                    return (
                                        <li key={i} className={styles.li2}>
                                            <div className={styles.txt}>
                                                {getVal(
                                                    val.name,
                                                    stakeZilliqa4,
                                                    true
                                                )}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
            </tr>
            <tr className={styles.row}>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>Last Withdraw</div>
                        <ul className={styles.ul}>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake5, stakeZilliqa5)
                                ) {
                                    return (
                                        <li key={i} className={styles.li}>
                                            <div className={styles.txt}>
                                                {val.name}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>&nbsp;</div>
                        <ul>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake5, stakeZilliqa5)
                                ) {
                                    return (
                                        <li key={i} className={styles.li2}>
                                            <div className={styles.txt}>
                                                {getVal(val.name, stake5, true)}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>&nbsp;</div>
                        <ul>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake5, stakeZilliqa5)
                                ) {
                                    return (
                                        <li key={i} className={styles.li2}>
                                            <div className={styles.txt}>
                                                {getVal(
                                                    val.name,
                                                    stakeZilliqa5,
                                                    true
                                                )}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
            </tr> */}
                {/* <tr className={styles.row}>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>SSN Delegate Amount</div>
                        <ul className={styles.ul}>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake6, stakeZilliqa6)
                                ) {
                                    return (
                                        <li key={i} className={styles.li}>
                                            <div className={styles.txt}>
                                                {val.name}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>&nbsp;</div>
                        <ul>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake6, stakeZilliqa6)
                                ) {
                                    return (
                                        <li key={i} className={styles.li2}>
                                            <div className={styles.txt}>
                                                {getVal(val.name, stake6)}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>&nbsp;</div>
                        <ul>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake6, stakeZilliqa6)
                                ) {
                                    return (
                                        <li key={i} className={styles.li2}>
                                            <div className={styles.txt}>
                                                {getVal(
                                                    val.name,
                                                    stakeZilliqa6
                                                )}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
            </tr>
            <tr className={styles.row}>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>Withdrawal Pending</div>
                        <ul className={styles.ul}>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake7, stakeZilliqa7)
                                ) {
                                    return (
                                        <li key={i} className={styles.li}>
                                            <div className={styles.txt}>
                                                {val.name}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>&nbsp;</div>
                        <ul>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake7, stakeZilliqa7)
                                ) {
                                    return (
                                        <li key={i} className={styles.li2}>
                                            <div className={styles.txt}>
                                                {getVal(val.name, stake7)}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
                <td>
                    <div className={styles.container}>
                        <div className={styles.txt}>&nbsp;</div>
                        <ul>
                            {ssnList.map((val, i) => {
                                if (
                                    checkRender(val.name, stake7, stakeZilliqa7)
                                ) {
                                    return (
                                        <li key={i} className={styles.li2}>
                                            <div className={styles.txt}>
                                                {getVal(
                                                    val.name,
                                                    stakeZilliqa7
                                                )}
                                            </div>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                </td>
            </tr> */}
            </tbody>
        </table>
    )
}

export default DashboardStake
