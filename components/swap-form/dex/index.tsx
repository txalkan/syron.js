import styles from './index.module.scss'
import React, { useState } from 'react'
import Big from 'big.js'
import Image from 'next/image'
import { DragonDex } from '../../../src/mixins/dex'
//import TyronName from '../../../src/assets/icons/W_Tyron_grey.svg'
import tydradexSvg from '../../../src/assets/icons/tydradex.svg'
import dragondexSvg from '../../../src/assets/icons/dragondex.svg'
import { TokenState } from '../../../src/types/token'

Big.PE = 999

type Prop = {
    token: TokenState
    value: Big
    balance?: string
    onDexSwap?: any
    // disabled?: boolean
}

// const list = [25, 50, 75, 100]
// const dex = new DragonDex()
export const DexInput: React.FC<Prop> = ({
    value,
    token,
    balance = BigInt(0),
    onDexSwap,
    // disabled,
}) => {
    const [selectedDex, setSelectedDex] = useState('tydradex')

    const onSwap = (val) => {
        if (val === selectedDex) {
            onDexSwap(selectedDex)
        }
    }

    return (
        <div className={styles.container}>
            <div
                onClick={() => setSelectedDex('tydradex')}
                className={styles.formWrapper}
            >
                <div
                    className={
                        selectedDex === 'tydradex'
                            ? styles.txtOpActive
                            : styles.txtOp
                    }
                >
                    OP#1
                </div>
                <div
                    className={
                        selectedDex === 'tydradex'
                            ? styles.formActive
                            : styles.formInactive
                    }
                >
                    <div className={styles.content}>
                        <div>
                            <input
                                disabled
                                value={String(value)}
                                placeholder="0"
                                type="text"
                                className={styles.inputDex}
                            />
                            <div className={styles.tokenDexRow}>
                                <div className={styles.dummyIco2}>
                                    <Image src={tydradexSvg} alt="tydradex" />
                                </div>
                                <div>TydraDEX</div>
                            </div>
                        </div>
                        <div className={styles.contentLeft}>
                            <div className={styles.tyronIcoRow}>
                                <div className={styles.btnSwap} />
                                <div>{token.symbol}</div>
                            </div>
                            <div
                                className={
                                    selectedDex === 'tydradex'
                                        ? styles.btnSubmitSwap
                                        : styles.btnSubmitSwapInactive
                                }
                            >
                                <div
                                    onClick={() => onSwap('tydradex')}
                                    className={
                                        selectedDex === 'tydradex'
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
                onClick={() => setSelectedDex('dragondex')}
                className={styles.formWrapper}
            >
                <div
                    className={
                        selectedDex === 'dragondex'
                            ? styles.txtOpActive
                            : styles.txtOp
                    }
                >
                    OP#2
                </div>
                <div
                    className={
                        selectedDex === 'dragondex'
                            ? styles.formActive
                            : styles.formInactive
                    }
                >
                    <div className={styles.content}>
                        <div>
                            <input
                                disabled
                                value={String(value)}
                                placeholder="0"
                                type="text"
                                className={styles.inputDex}
                            />
                            <div className={styles.tokenDexRow}>
                                <div className={styles.dummyIco}>
                                    <Image src={dragondexSvg} alt="dragondex" />
                                </div>
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
                                    selectedDex === 'dragondex'
                                        ? styles.btnSubmitSwap
                                        : styles.btnSubmitSwapInactive
                                }
                            >
                                <div
                                    onClick={() => onSwap('dragondex')}
                                    className={
                                        selectedDex === 'dragondex'
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
                onClick={() => setSelectedDex('other')}
                className={styles.formWrapper}
            >
                <div
                    className={
                        selectedDex === 'other'
                            ? styles.txtOpActive
                            : styles.txtOp
                    }
                >
                    OP#3
                </div>
                <div
                    className={
                        selectedDex === 'other'
                            ? styles.formActive
                            : styles.formInactive
                    }
                >
                    <div className={styles.content}>
                        <div>
                            <input
                                disabled
                                value={String(value)}
                                placeholder="0"
                                type="text"
                                className={styles.inputDex}
                            />
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
                                    selectedDex === 'other'
                                        ? styles.btnSubmitSwap
                                        : styles.btnSubmitSwapInactive
                                }
                            >
                                <div
                                    onClick={() => onSwap('other')}
                                    className={
                                        selectedDex === 'other'
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
