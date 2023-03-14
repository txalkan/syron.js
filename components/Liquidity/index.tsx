import React, { useState } from 'react'
import { AddLiquidity } from '..'
import styles from './styles.module.scss'

function Component() {
    const [hideAdd, setHideAdd] = useState(true)
    const [addLegend, setAddLegend] = useState('add into a pool')
    const [hideRemove, setHideRemove] = useState(true)
    const [removeLegend, setRemoveLegend] = useState('remove from a pool')

    return (
        <div>
            <ul>
                <li>
                    {hideRemove && (
                        <>
                            {hideAdd ? (
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideAdd(false)
                                        setAddLegend('back')
                                    }}
                                >
                                    <div className={styles.buttonYellowText}>
                                        {addLegend}
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
                                            provide liquidity to a pool
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideAdd(true)
                                                setAddLegend('add into a pool')
                                            }}
                                        >
                                            <div className={styles.buttonText}>
                                                {addLegend}
                                            </div>
                                        </button>
                                    </h3>
                                </>
                            )}
                        </>
                    )}
                    {!hideAdd && <AddLiquidity />}
                </li>
                <li>
                    {hideAdd && (
                        <>
                            {hideRemove ? (
                                <button
                                    type="button"
                                    className={styles.button}
                                    onClick={() => {
                                        setHideRemove(false)
                                        setRemoveLegend('back')
                                    }}
                                >
                                    <div className={styles.buttonWhiteText}>
                                        {removeLegend}
                                    </div>
                                </button>
                            ) : (
                                <>
                                    <h3>
                                        <span
                                            style={{
                                                color: 'lightblue',
                                                marginRight: '3%',
                                            }}
                                        >
                                            Remove funds from a liquidity pool
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideRemove(true)
                                                setRemoveLegend(
                                                    'remove from a pool'
                                                )
                                            }}
                                        >
                                            <div className={styles.buttonText}>
                                                {removeLegend}
                                            </div>
                                        </button>
                                    </h3>
                                </>
                            )}
                        </>
                    )}
                    {!hideRemove && <div>Coming soon.</div>}
                </li>
            </ul>
        </div>
    )
}

export default Component
