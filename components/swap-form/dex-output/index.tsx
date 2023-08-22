import styles from './index.module.scss'
import React, { useState } from 'react'
import Big from 'big.js'
import Image from 'next/image'
import { DragonDex } from '../../../src/mixins/dex'
//import TyronName from '../../../src/assets/icons/W_Tyron_grey.svg'
import tydradexSvg from '../../../src/assets/icons/ssi_tydradex.svg'
import dragondexSvg from '../../../src/assets/icons/ssi_dragondex.svg'
import aswapSvg from '../../../src/assets/icons/aswap.svg'
import zilwapSvg from '../../../src/assets/icons/ssi_zilswap.svg'

import { TokenState } from '../../../src/types/token'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { toast } from 'react-toastify'
import { TokensMixine } from '../../../src/mixins/token'

import icoTYRON from '../../../src/assets/icons/ssi_token_Tyron.svg'
import icoS$I from '../../../src/assets/icons/SSI_dollar.svg'
import { getIconURL } from '../../../src/lib/viewblock'

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
    console.log('VALUE_', String(value))
    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''

    const dragon_dex = String(tydra.dragondex)
    const tydra_dex = String(tydra.tydradex)
    const zilswap_dex = String(tydra.zilswap)
    const aswap_dex = String(tydra.aswap)

    console.log('DEX_OUTPUT')
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
                                    <Image
                                        src={
                                            token.symbol === 'TYRON'
                                                ? icoTYRON
                                                : token.symbol === 'S$I'
                                                    ? icoS$I
                                                    : getIconURL(token.bech32)
                                        }
                                        alt={token.symbol}
                                        key={token.symbol}
                                        height="35"
                                        width="35"
                                        className={styles.symbol}
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
                                    <div className={styles.dexName}>
                                        TyronDEX
                                    </div>
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
                    {/* {selectedDex === 'tydradex' && (
                        <div
                            className={
                                selectedDex === 'tydradex'
                                    ? styles.txtOpActive
                                    : styles.txtOp
                            }
                        >
                            TYRON
                        </div>
                    )} */}
                </div>
            )}
            {/* @dragondex */}
            {dragon_dex !== '0' && (
                <div
                    onClick={() => onSwap('dragondex')}
                    className={styles.formWrapper}
                >
                    <div
                        className={
                            selectedDex === 'dragondex'
                                ? styles.formActive
                                : styles.formInactive
                        }
                    >
                        <div className={styles.content}>
                            <div>
                                <div className={styles.output}>
                                    <input
                                        disabled
                                        value={String(dragon_dex)}
                                        placeholder="0"
                                        type="text"
                                        className={styles.inputDex}
                                    />
                                    <Image
                                        src={
                                            token.symbol === 'TYRON'
                                                ? icoTYRON
                                                : token.symbol === 'S$I'
                                                    ? icoS$I
                                                    : getIconURL(token.bech32)
                                        }
                                        alt={token.symbol}
                                        key={token.symbol}
                                        height="35"
                                        width="35"
                                        className={styles.symbol}
                                    />
                                </div>
                                <div className={styles.tokenDexRow}>
                                    <div className={styles.dummyIco}>
                                        <Image
                                            src={dragondexSvg}
                                            alt="dragondex"
                                        />
                                    </div>
                                    <div className={styles.dexName}>
                                        DragonDEX
                                    </div>
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
                    {/* {selectedDex === 'dragondex' && (
                        <div
                            className={
                                selectedDex === 'dragondex'
                                    ? styles.txtOpActive
                                    : styles.txtOp
                            }
                        >
                            TYRON
                        </div>
                    )} */}
                </div>
            )}
            {/* @zilswap */}
            {zilswap_dex !== '0' && (
                <div
                    onClick={() => onSwap('zilswap')}
                    className={styles.formWrapper}
                >
                    <div
                        className={
                            selectedDex === 'zilswap'
                                ? styles.formActive
                                : styles.formInactive
                        }
                    >
                        <div className={styles.content}>
                            <div>
                                <div className={styles.output}>
                                    <input
                                        disabled
                                        value={String(zilswap_dex)}
                                        placeholder="0"
                                        type="text"
                                        className={styles.inputDex}
                                    />
                                    <Image
                                        src={
                                            token.symbol === 'TYRON'
                                                ? icoTYRON
                                                : token.symbol === 'S$I'
                                                    ? icoS$I
                                                    : getIconURL(token.bech32)
                                        }
                                        alt={token.symbol}
                                        key={token.symbol}
                                        height="35"
                                        width="35"
                                        className={styles.symbol}
                                    />
                                </div>
                                <div className={styles.tokenDexRow}>
                                    <div className={styles.dummyIco}>
                                        <Image src={zilwapSvg} alt="zilswap" />
                                    </div>
                                    <div className={styles.dexName}>
                                        ZilSwap
                                    </div>
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
                    {/* {selectedDex === 'zilswap' && (
                        <div
                            className={
                                selectedDex === 'zilswap'
                                    ? styles.txtOpActive
                                    : styles.txtOp
                            }
                        >
                            TYRON
                        </div>
                    )} */}
                </div>
            )}
            {/* @aswap */}
            {aswap_dex !== '0' && (
                <div
                    onClick={() => onSwap('aswap')}
                    className={styles.formWrapper}
                >
                    <div
                        className={
                            selectedDex === 'aswap'
                                ? styles.formActive
                                : styles.formInactive
                        }
                    >
                        <div className={styles.content}>
                            <div>
                                <div className={styles.output}>
                                    <input
                                        disabled
                                        value={String(aswap_dex)}
                                        placeholder="0"
                                        type="text"
                                        className={styles.inputDex}
                                    />
                                    <Image
                                        src={
                                            token.symbol === 'TYRON'
                                                ? icoTYRON
                                                : token.symbol === 'S$I'
                                                    ? icoS$I
                                                    : getIconURL(token.bech32)
                                        }
                                        alt={token.symbol}
                                        key={token.symbol}
                                        height="35"
                                        width="35"
                                        className={styles.symbol}
                                    />
                                </div>
                                <div className={styles.tokenDexRow}>
                                    <div className={styles.dummyIco}>
                                        <Image src={aswapSvg} alt="aswap" />
                                    </div>
                                    <div className={styles.dexName}>
                                        Avely Swap
                                    </div>
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
                    {/* {selectedDex === 'aswap' && (
                        <div
                            className={
                                selectedDex === 'aswap'
                                    ? styles.txtOpActive
                                    : styles.txtOp
                            }
                        >
                            TYRON
                        </div>
                    )} */}
                </div>
            )}
        </div>
    )
}
