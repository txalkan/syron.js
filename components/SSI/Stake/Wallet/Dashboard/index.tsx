import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import smartContract from '../../../../../src/utils/smartContract'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../src/store/resolvedInfo'

function DashboardStake({ balance }) {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const resolvedInfo = useStore($resolvedInfo)

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
        for (let i = 0; i < stakeList.length; i += 1) {
            const key = stakeList[i]
            const services = await getSmartContract(
                '0xa2e4657de8108dd3730eb51f05a1d486d77be2df', // staking impl addr
                key
            )
            console.log(key, services)
            // const res = await tyron.SmartUtil.default.intoMap(
            //     services.result[key]
            // )
            // const res2 = await tyron.SmartUtil.default.intoMap(
            //     res.get(resolvedInfo?.addr!)
            // )
            // console.log(key, res2.get(resolvedInfo?.addr!))
        }
    }

    useEffect(() => {
        fetchStake()
    }, [])

    return (
        <div className={styles.wrapper}>
            <div>
                {t('BALANCES')}:{' '}
                <span style={{ color: '#0000ff' }}>{balance}</span> ZIL
            </div>
            <div>STAKE: -</div>
        </div>
    )
}

export default DashboardStake
