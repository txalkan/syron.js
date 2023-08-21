import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import { $settings } from '../../src/store/settings'
import Big from 'big.js'
import { useStore } from 'react-stores'
import { $tyron_liquidity } from '../../src/store/shares'
function Component() {
    const settings = useStore($settings)
    const zilusd_rate = Big(settings.rate)
    const tydradex_liquidity = useStore($tyron_liquidity)
    const { reserves } = tydradex_liquidity
    const pools_ = reserves
    const [tyronS$IReserves, setTyronS$IReserves] = useState<any>([0, 0])
    const ssiReserve = tyronS$IReserves[0]
    const tyronReserve = tyronS$IReserves[1]
    const [tyronSGDPrice, setTyronSGDPrice] = useState<any>('loading...')
    const [tyronUSDPrice, setTyronUSDPrice] = useState<any>('loading...')

    useEffect(() => {
        const inputReserve = pools_['tyron_s$i'] ? pools_['tyron_s$i'] : [0, 0]
        const [ssiReserve, tyronReserve] = inputReserve
        setTyronS$IReserves([ssiReserve, tyronReserve])
        let sgd_price =
            tyronReserve !== 0
                ? Big(ssiReserve).div(Big(tyronReserve)).div(10e5)
                : 0
        let usd_price = Big(sgd_price).div(Big(1.35))
        sgd_price = Big(sgd_price).round(4)
        usd_price = usd_price.round(4)
        setTyronSGDPrice(String(sgd_price))
        setTyronUSDPrice(String(usd_price))
    }, [reserves])

    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboardTop}></div>
            <div className={styles.title}>rates</div>
            <div className={styles.rowRate}>
                <p>
                    1 ZIL
                    <span className={styles.equalsign}>
                        {(Number(zilusd_rate) * 1.35).toFixed(4)} S$I
                    </span>
                </p>
                <p className={styles.equalsign}>
                    {Number(zilusd_rate).toFixed(4)} USD
                </p>
            </div>
            <div className={styles.rowRate}>
                <p>
                    1 TYRON
                    <span className={styles.equalsign}>
                        {String(tyronSGDPrice)} S$I
                    </span>
                </p>
                <p className={styles.equalsign}>{String(tyronUSDPrice)} USD</p>
            </div>
        </div>
    )
}

export default Component
