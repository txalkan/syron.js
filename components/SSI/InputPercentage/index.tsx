import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { RootState } from '../../../src/app/reducers'
import { useStore } from 'effector-react'
import { $originatorAddress } from '../../../src/store/originatorAddress'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import ArrowDownBlack from '../../../src/assets/icons/dashboard_arrow_down_icon_black.svg'
import ArrowUpReg from '../../../src/assets/icons/dashboard_arrow_up_icon.svg'
import ArrowUpBlack from '../../../src/assets/icons/dashboard_arrow_up_icon_black.svg'
import smartContract from '../../../src/utils/smartContract'
import { useTranslation } from 'next-i18next'
import { Spinner } from '../..'

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
                <Spinner />
            ) : (
                <>
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
