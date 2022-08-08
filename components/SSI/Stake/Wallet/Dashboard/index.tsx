import styles from './styles.module.scss'
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

function DashboardStake({ balance }) {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const resolvedInfo = useStore($resolvedInfo)
    const net = useSelector((state: RootState) => state.modal.net)

    const [stake1, setStake1] = useState(Array())
    const [stake2, setStake2] = useState(Array())
    const [stake3, setStake3] = useState(Array())
    const [stake4, setStake4] = useState(Array())
    const [stake5, setStake5] = useState(Array())
    const [stake6, setStake6] = useState(Array())
    const [stake7, setStake7] = useState(Array())

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

    const fetchStake = async () => {
        const addr = resolvedInfo?.addr?.toLowerCase()
        for (let i = 0; i < stakeList.length; i += 1) {
            const key = stakeList[i]
            const state = await getSmartContract(
                '0xa2e4657de8108dd3730eb51f05a1d486d77be2df', // staking impl addr
                key
            )
            const res = await tyron.SmartUtil.default.intoMap(state.result[key])
            if (res !== undefined) {
                await tyron.SmartUtil.default
                    .intoMap(res.get(addr!))
                    .then(async (res2) => {
                        const init_addr =
                            await tyron.SearchBarUtil.default.fetchAddr(
                                net,
                                'init',
                                'did'
                            )
                        const get_services = await getSmartContract(
                            init_addr!,
                            'services'
                        )
                        const services = await tyron.SmartUtil.default.intoMap(
                            get_services.result.services
                        )
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
                            // let val: any = Number(value.join(''))
                            // if (key !== 'last_buf_deposit_cycle_deleg' && key !== 'last_withdraw_cycle_deleg') {
                            //     val = (Number(value.join('')) / 1e12).toFixed(2)
                            // }
                            // console.log()
                            const res = {
                                name: ssnList[i].name,
                                val: value,
                            }
                            arrRes.push(res)
                        }
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
                        // setStake(arrRes)
                    })
                    .catch(() => {})
            }
        }
    }

    const childStake = (val, key, notAmount?) => {
        if (val.val === 0) {
            return null
        } else {
            let value
            if (notAmount) {
                value = val.val
            } else {
                value = (Number(val.val.join('')) / 1e12).toFixed(2) + ' ZIL'
            }
            return (
                <div key={key}>
                    {' '}
                    ---- {val.name}: {value}
                </div>
            )
        }
    }

    useEffect(() => {
        fetchStake()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.wrapper}>
            <div>{t('BALANCES')}</div>
            <div>
                {' '}
                - xWallet:{' '}
                <span style={{ color: '#0000ff' }}>{balance[0]}</span> ZIL
            </div>
            <div>
                {' '}
                - Zilliqa:{' '}
                <span style={{ color: '#0000ff' }}>{balance[1]}</span> ZIL
            </div>
            <div>STAKE:</div>
            <div>
                {' '}
                - Buffered deposit:
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
                        Amount not getting rewards until the next cycle.
                    </span>
                </span>
            </div>
            {stake1.map((val, key) => (
                <>{childStake(val, key)}</>
            ))}
            <div> - Delegated Stake:</div>
            {stake2.map((val, key) => (
                <>{childStake(val, key)}</>
            ))}
            <div>
                {' '}
                - Deposited Amount:
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
            {stake3.map((val, key) => (
                <>{childStake(val, key)}</>
            ))}
            <div> - Last Buf Deposit:</div>
            {stake4.map((val, key) => (
                <>{childStake(val, key, true)}</>
            ))}
            <div> - Last Withdraw:</div>
            {stake5.map((val, key) => (
                <>{childStake(val, key, true)}</>
            ))}
            <div> - SSN Delegate Amount:</div>
            {stake6.map((val, key) => (
                <>{childStake(val, key)}</>
            ))}
            <div> - Withdrawal Pending:</div>
            {stake7.map((val, key) => (
                <>{childStake(val, key)}</>
            ))}
        </div>
    )
}

export default DashboardStake
