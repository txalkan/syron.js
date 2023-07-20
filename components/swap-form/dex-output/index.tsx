import styles from './index.module.scss'
import React, { useState } from 'react'
import Big from 'big.js'
import Image from 'next/image'
import { DragonDex } from '../../../src/mixins/dex'
//import TyronName from '../../../src/assets/icons/W_Tyron_grey.svg'
import tydradexSvg from '../../../src/assets/icons/tydradex.svg'
import dragondexSvg from '../../../src/assets/icons/dragondex.svg'
import aswapSvg from '../../../src/assets/icons/aswap.svg'

import { TokenState } from '../../../src/types/token'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { toast } from 'react-toastify'
import { TokensMixine } from '../../../src/mixins/token'

Big.PE = 999

type Prop = {
    token: TokenState
    value: Big
    balance?: string
    onDexSwap?: any
    // disabled?: boolean
    tydra: {
        tydradex: Big
        dragondex: Big
        zilswap: Big
        aswap: Big
    }
}

// const list = [25, 50, 75, 100]
// const dex = new DragonDex()
const tokensMixin = new TokensMixine()
export const DexOutput: React.FC<Prop> = ({
    value,
    token,
    balance = BigInt(0),
    onDexSwap,
    // disabled,
    tydra,
}) => {
    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''

    const dragon_dex = String(tydra.dragondex)
    const tydra_dex = String(tydra.tydradex)
    const zilswap_dex = String(tydra.zilswap)
    const aswap_dex = String(tydra.aswap)

    console.log('DEX OUTPUT')
    console.log('DragonDEX: ', dragon_dex)
    console.log('TydraDEX: ', tydra_dex)
    console.log('ZilSwap: ', zilswap_dex)
    console.log('AvelySwap: ', aswap_dex)

    const [selectedDex, setSelectedDex] = useState('')

    const onSwap = async (val: string) => {
        try {
            const zilpay = await tokensMixin.zilpay.zilpay()
            if (zilpay_addr === '' || !zilpay.wallet.isEnable) {
                await zilpay.wallet.connect()
            }
            if (zilpay_addr !== '') {
                setSelectedDex(val)
                // if (val === selectedDex) {
                onDexSwap(val) //selectedDex)
                // }
            } else {
                throw new Error()
            }
        } catch (error) {
            toast('Connect with ZilPay', {
                position: 'top-center',
                autoClose: 2222,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                toastId: 2,
            })
        }
    }

    React.useEffect(() => {
        setSelectedDex('')
    }, [tydra])

    return (
        <div className={styles.container}>
            {tydra_dex !== '0' && (
                <div
                    onClick={() => onSwap('tydradex')}
                    className={styles.formWrapper}
                >
                    {selectedDex === 'tydradex' && (
                        <div
                            className={
                                selectedDex === 'tydradex'
                                    ? styles.txtOpActive
                                    : styles.txtOp
                            }
                        >
                            TYRON
                        </div>
                    )}
                    <div
                        className={
                            selectedDex === 'tydradex'
                                ? styles.formActive
                                : styles.formInactive
                        }
                    >
                        <div className={styles.content}>
                            <div>
                                <div className={styles.output}>
                                    <input
                                        disabled
                                        value={String(tydra.tydradex)}
                                        placeholder="0"
                                        type="text"
                                        className={styles.inputDex}
                                    />
                                    {/* <div>{token.symbol}</div> */}
                                </div>
                                <div className={styles.tokenDexRow}>
                                    <div className={styles.dummyIco2}>
                                        <Image
                                            src={tydradexSvg}
                                            alt="tydradex"
                                        />
                                    </div>
                                    <div>TydraDEX</div>
                                </div>
                            </div>
                            <div className={styles.contentLeft}>
                                {/* <div className={styles.tyronIcoRow}>
                            <div className={styles.btnSwap} />
                            <div>{token.symbol}</div>
                        </div> */}
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
                                        &#8595;&nbsp;TRADE&nbsp;&#8593;
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* @dragondex */}
            {dragon_dex !== '0' && (
                <div
                    onClick={() => onSwap('dragondex')}
                    className={styles.formWrapper}
                >
                    {selectedDex === 'dragondex' && (
                        <div
                            className={
                                selectedDex === 'dragondex'
                                    ? styles.txtOpActive
                                    : styles.txtOp
                            }
                        >
                            TYRON
                        </div>
                    )}
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
                                    value={String(dragon_dex)}
                                    placeholder="0"
                                    type="text"
                                    className={styles.inputDex}
                                />
                                <div className={styles.tokenDexRow}>
                                    <div className={styles.dummyIco}>
                                        <Image
                                            src={dragondexSvg}
                                            alt="dragondex"
                                        />
                                    </div>
                                    <div>DragonDEX</div>
                                </div>
                            </div>
                            <div className={styles.contentLeft}>
                                {/* <div className={styles.tyronIcoRow}>
                <div className={styles.btnSwap} />
                <div>TYRON</div>
            </div> */}
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
                                        &#8595;&nbsp;TRADE&nbsp;&#8593;
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* @zilswap */}
            {/* {
                zilswap_dex !== '0' &&
                <div
                    onClick={() => onSwap('zilswap')}
                    className={styles.formWrapper}
                >
                    {
                        selectedDex === 'zilswap' &&
                        <div
                            className={
                                selectedDex === 'zilswap'
                                    ? styles.txtOpActive
                                    : styles.txtOp
                            }
                        >
                            TYRON
                        </div>
                    }
                    <div
                        className={
                            selectedDex === 'zilswap'
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
                                    <div>ZilSwap</div>
                                </div>
                            </div>
                            <div className={styles.contentLeft}>
                                <div
                                    className={
                                        selectedDex === 'zilswap'
                                            ? styles.btnSubmitSwap
                                            : styles.btnSubmitSwapInactive
                                    }
                                >
                                    <div
                                        onClick={() => onSwap('zilswap')}
                                        className={
                                            selectedDex === 'zilswap'
                                                ? styles.btnSubmitSwapTxt
                                                : styles.btnSubmitSwapTxtInactive
                                        }
                                    >
                                        &#8595;&nbsp;TRADE&nbsp;&#8593;
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            } */}
            {/* @aswap */}
            {/* {
                aswap_dex !== '0' &&
                <div
                    onClick={() => onSwap('aswap')}
                    className={styles.formWrapper}
                >
                    {
                        selectedDex === 'aswap' &&

                        <div
                            className={
                                selectedDex === 'aswap'
                                    ? styles.txtOpActive
                                    : styles.txtOp
                            }
                        >
                            TYRON
                        </div>
                    }
                    <div
                        className={
                            selectedDex === 'aswap'
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
                                        <Image src={aswapSvg} alt="aswap" />
                                    </div>
                                    <div>Avely Swap</div>
                                </div>
                            </div>
                            <div className={styles.contentLeft}>
                                <div
                                    className={
                                        selectedDex === 'aswap'
                                            ? styles.btnSubmitSwap
                                            : styles.btnSubmitSwapInactive
                                    }
                                >
                                    <div
                                        onClick={() => onSwap('aswap')}
                                        className={
                                            selectedDex === 'aswap'
                                                ? styles.btnSubmitSwapTxt
                                                : styles.btnSubmitSwapTxtInactive
                                        }
                                    >
                                        &#8595;&nbsp;TRADE&nbsp;&#8593;
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            } */}
        </div>
    )
}
