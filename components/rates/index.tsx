import React from 'react'
import styles from './styles.module.scss'
import { $settings } from '../../src/store/settings'
import Big from 'big.js'
import { useStore } from 'react-stores'
function Component() {
    const settings = useStore($settings)
    const zilusd_rate = Big(settings.rate)
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
                    <span className={styles.equalsign}>1.35 S$I</span>
                </p>
                {/* <div>
                    <p className={styles.equalsign}>
                        1.35 SGD
                    </p>
                </div> */}
                <div>
                    <p className={styles.equalsign}>1.0 USD</p>
                </div>
            </div>
        </div>
    )
}

export default Component
