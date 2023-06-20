/*
ZilPay.io
Copyright (c) 2023 by Rinat <https://github.com/hicaru>
All rights reserved.
You acknowledge and agree that ZilPay owns all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this file (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this software.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of ZilPay; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by ZilPay in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of ZilPay or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*/

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
