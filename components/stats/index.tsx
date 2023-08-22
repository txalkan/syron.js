import React, { useEffect, useState } from 'react'
import styles from './styles.module.scss'
import Big from 'big.js'
import { useStore } from 'react-stores'
import { $tyron_liquidity } from '../../src/store/shares'
import { DragonDex } from '../../src/mixins/dex'
import { useRouter } from 'next/router'

const dex = new DragonDex()
function Component() {
    const tydradex_liquidity = useStore($tyron_liquidity)
    const { reserves } = tydradex_liquidity
    const pools_ = reserves
    const [tyronS$IReserves, setTyronS$IReserves] = useState<any>([0, 0])
    const ssiReserve = tyronS$IReserves[0]
    const tyronReserve = tyronS$IReserves[1]
    const [tyronPrice, setTyronPrice] = useState<any>('loading...')
    console.log(tyronPrice)
    useEffect(() => {
        dex.updateState()
    }, [])
    useEffect(() => {
        const inputReserve = pools_['tyron_s$i'] ? pools_['tyron_s$i'] : [0, 0]
        console.log(JSON.stringify(inputReserve, null, 2))
        const [ssiReserve, tyronReserve] = inputReserve
        setTyronS$IReserves([ssiReserve, tyronReserve])
        const price =
            tyronReserve !== 0
                ? Big(ssiReserve).div(Big(tyronReserve)).div(10e5).round(4)
                : 0
        setTyronPrice(String(price))
    }, [reserves])

    const Router = useRouter()
    return (
        <div className={styles.dashboard}>
            <div className={styles.dashboardTop}></div>
            <div className={styles.title}>stats</div>
            <div className={styles.rowRate}>
                1 TYRON
                <span className={styles.equalsign}>
                    {String(tyronPrice)} SGD
                </span>{' '}
                on{' '}
                <div
                    onClick={() => {
                        Router.push('/tyrondex.ssi')
                    }}
                    className={styles.tyronDEX}
                >
                    TyronDEX
                </div>
            </div>
        </div>
    )
}

export default Component
