import styles from './index.module.scss'

import React, { useState } from 'react'
import Big from 'big.js'
import Image from 'next/image'

import { DEFAULT_CURRENCY, ZERO_ADDR } from '../../../src/config/const'
import { DragonDex } from '../../../src/mixins/dex'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import TyronName from '../../../src/assets/icons/W_Tyron_grey.svg'

Big.PE = 999

type Prop = {
    // token: TokenState
    // value: Big
    // balance?: string
    // disabled?: boolean
    // gasLimit?: Big
    // onInput?: (value: Big) => void
    // onSelect?: () => void
    // onMax?: (b: Big) => void
}

const list = [25, 50, 75, 100]
const dex = new DragonDex()
export const DexInput: React.FC<Prop> = ({}) => {
    const [selectedDex, setSelectedDex] = useState(1)

    return (
        <div className={styles.container}>
            <div
                onClick={() => setSelectedDex(1)}
                className={styles.formWrapper}
            >
                <div
                    className={
                        selectedDex === 1 ? styles.txtOpActive : styles.txtOp
                    }
                >
                    OP#1
                </div>
                <div
                    className={
                        selectedDex === 1
                            ? styles.formActive
                            : styles.formInactive
                    }
                >
                    <div className={styles.content}>
                        <div>
                            <p>
                                @review: use InputForm with disabled option:
                                This brings the result value of the swap + token
                                icon
                            </p>
                            <input type="text" className={styles.inputDex} />
                            <div className={styles.tokenDexRow}>
                                <div className={styles.dummyIco} />
                                <div>TydraDEX</div>
                            </div>
                        </div>
                        <div className={styles.contentLeft}>
                            <div className={styles.tyronIcoRow}>
                                <div className={styles.btnSwap} />
                                <div>TYRON</div>
                            </div>
                            <div
                                className={
                                    selectedDex === 1
                                        ? styles.btnSubmitSwap
                                        : styles.btnSubmitSwapInactive
                                }
                            >
                                <div
                                    className={
                                        selectedDex === 1
                                            ? styles.btnSubmitSwapTxt
                                            : styles.btnSubmitSwapTxtInactive
                                    }
                                >
                                    &#8595;&nbsp;SWAP&nbsp;&#8593;
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                onClick={() => setSelectedDex(2)}
                className={styles.formWrapper}
            >
                <div
                    className={
                        selectedDex === 2 ? styles.txtOpActive : styles.txtOp
                    }
                >
                    OP#2
                </div>
                <div
                    className={
                        selectedDex === 2
                            ? styles.formActive
                            : styles.formInactive
                    }
                >
                    <div className={styles.content}>
                        <div>
                            <input type="text" className={styles.inputDex} />
                            <div className={styles.tokenDexRow}>
                                <div className={styles.dummyIco} />
                                <div>DragonDEX</div>
                            </div>
                        </div>
                        <div className={styles.contentLeft}>
                            <div className={styles.tyronIcoRow}>
                                <div className={styles.btnSwap} />
                                <div>TYRON</div>
                            </div>
                            <div
                                className={
                                    selectedDex === 2
                                        ? styles.btnSubmitSwap
                                        : styles.btnSubmitSwapInactive
                                }
                            >
                                <div
                                    className={
                                        selectedDex === 2
                                            ? styles.btnSubmitSwapTxt
                                            : styles.btnSubmitSwapTxtInactive
                                    }
                                >
                                    &#8595;&nbsp;SWAP&nbsp;&#8593;
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                onClick={() => setSelectedDex(3)}
                className={styles.formWrapper}
            >
                <div
                    className={
                        selectedDex === 3 ? styles.txtOpActive : styles.txtOp
                    }
                >
                    OP#3
                </div>
                <div
                    className={
                        selectedDex === 3
                            ? styles.formActive
                            : styles.formInactive
                    }
                >
                    <div className={styles.content}>
                        <div>
                            <input type="text" className={styles.inputDex} />
                            <div className={styles.tokenDexRow}>
                                <div className={styles.dummyIcoOthers} />
                                <div>Others</div>
                            </div>
                        </div>
                        <div className={styles.contentLeft}>
                            <div className={styles.tyronIcoRow}>
                                <div className={styles.btnSwap} />
                                <div>TYRON</div>
                            </div>
                            <div
                                className={
                                    selectedDex === 3
                                        ? styles.btnSubmitSwap
                                        : styles.btnSubmitSwapInactive
                                }
                            >
                                <div
                                    className={
                                        selectedDex === 3
                                            ? styles.btnSubmitSwapTxt
                                            : styles.btnSubmitSwapTxtInactive
                                    }
                                >
                                    &#8595;&nbsp;SWAP&nbsp;&#8593;
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
