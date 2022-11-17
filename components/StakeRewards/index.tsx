import React, { useState } from 'react'
import styles from './styles.module.scss'

function Component() {
    const [hideE1, setHideE1] = useState(true)
    const [eLegend1, setELegend1] = useState('delegate')
    const [hideE2, setHideE2] = useState(true)
    const [eLegend2, setELegend2] = useState('claim')

    return (
        <div>
            <ul>
                <li>
                    {hideE2 && (
                        <>
                            {hideE1 ? (
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideE1(false)
                                        setELegend1('back')
                                    }}
                                >
                                    <div className={styles.buttonColorText}>
                                        {eLegend1}
                                    </div>
                                </button>
                            ) : (
                                <>
                                    <h3>
                                        <span
                                            style={{
                                                color: 'yellow',
                                                marginRight: '3%',
                                            }}
                                        >
                                            Delegate stake
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideE1(true)
                                                setELegend1('delegate')
                                            }}
                                        >
                                            <div className={styles.buttonText}>
                                                {eLegend1}
                                            </div>
                                        </button>
                                    </h3>
                                </>
                            )}
                        </>
                    )}
                    {!hideE1 && <div>Coming soon.</div>}
                </li>
                <li>
                    {hideE1 && (
                        <>
                            {hideE2 ? (
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideE2(false)
                                        setELegend2('back')
                                    }}
                                >
                                    <div className={styles.buttonColorText}>
                                        {eLegend2}
                                    </div>
                                </button>
                            ) : (
                                <>
                                    <h3>
                                        <span
                                            style={{
                                                color: 'yellow',
                                                marginRight: '3%',
                                            }}
                                        >
                                            rewards{' '}
                                            <span
                                                style={{ color: 'whitesmoke' }}
                                            >
                                                and
                                            </span>{' '}
                                            withdrawals
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideE2(true)
                                                setELegend2('claim')
                                            }}
                                        >
                                            <div className={styles.buttonText}>
                                                {eLegend2}
                                            </div>
                                        </button>
                                    </h3>
                                </>
                            )}
                        </>
                    )}
                    {!hideE2 && <div>Coming soon.</div>}
                </li>
            </ul>
        </div>
    )
}

export default Component
