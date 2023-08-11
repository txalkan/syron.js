import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import ThreeDots from '../../Spinner/ThreeDots'

interface InputType {
    setPercentage: any
    isMap: boolean
    val?: any
    i?: any
    isLoading?: boolean
}

function Component(props: InputType) {
    const { setPercentage, isMap, val, i, isLoading } = props
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    return (
        <div className={styles.percentageWrapper}>
            {isLoading ? (
                <div className={styles.loading}>
                    <ThreeDots color="basic" />
                </div>
            ) : (
                <>
                    {/* @review: translate */}
                    <div className={styles.percentageInfo}>
                        Or you can choose:{' '}
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div
                            onClick={() => {
                                if (isMap) {
                                    setPercentage(0.25, val, i)
                                } else {
                                    setPercentage(0.25)
                                }
                            }}
                            className={styles.btnPercentage}
                        >
                            <div className={styles.percentageTxt}>25%</div>
                        </div>
                        <div
                            onClick={() => {
                                if (isMap) {
                                    setPercentage(0.5, val, i)
                                } else {
                                    setPercentage(0.5)
                                }
                            }}
                            className={styles.btnPercentage}
                        >
                            <div className={styles.percentageTxt}>50%</div>
                        </div>
                        <div
                            onClick={() => {
                                if (isMap) {
                                    setPercentage(0.75, val, i)
                                } else {
                                    setPercentage(0.75)
                                }
                            }}
                            className={styles.btnPercentage}
                        >
                            <div className={styles.percentageTxt}>75%</div>
                        </div>
                        <div
                            onClick={() => {
                                if (isMap) {
                                    setPercentage(1, val, i)
                                } else {
                                    setPercentage(1)
                                }
                            }}
                            className={styles.btnPercentage}
                        >
                            <div className={styles.percentageTxt}>100%</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Component
