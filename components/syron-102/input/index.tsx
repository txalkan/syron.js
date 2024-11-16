import * as tyron from 'tyron'
import styles from './index.module.scss'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import SwapIcon from '../../icons/swap'
import icoSYRON from '../../../src/assets/icons/ssi_SYRON_iso.svg'
import icoORDI from '../../../src/assets/icons/brc-20-ORDI.png'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import { CryptoState } from '../../../src/types/vault'
import { useStore } from 'react-stores'
import { $btc_wallet, $walletConnected } from '../../../src/store/syron'
import Big from 'big.js'
import { $xr } from '../../../src/store/xr'
import icoArrow from '../../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import { useMempoolHook } from '../../../src/hooks/useMempool'

Big.PE = 999
const _0 = Big(0)
const dec = 1e8

type Prop = {
    token: CryptoState
    value: Big
    disabled?: boolean
    onInput?: (value: Big) => void
}

const list = [10, 25, 50, 75]

export const BoxInput: React.FC<Prop> = ({
    value: value_,
    token,
    disabled,
    onInput = () => null,
}) => {
    const btc_wallet = useStore($btc_wallet)
    const xr = useStore($xr)

    const addr_name = token?.symbol.toLowerCase()

    const [satsBalance, setSatsBalance] = useState(_0)
    const [btcBalance, setBtcBalance] = useState(_0)
    const [inputVal, setInputVal] = useState(_0)
    const [balWorth, setBalWorth] = useState(_0)

    const { getXR } = useMempoolHook()
    useEffect(() => {
        if (addr_name == 'btc') {
            setInputVal(value_.div(dec))

            const sats = btc_wallet?.btc_balance
            if (sats) {
                setSatsBalance(sats)

                const btcBal = sats.div(dec)
                setBtcBalance(btcBal)

                if (xr != null) {
                    setBalWorth(btcBal.mul(xr.rate))
                }
            }
        }
    }, [btc_wallet?.btc_balance, xr])

    // @dev Update BTC exchange rate every 2 minutes
    useEffect(() => {
        async function updateXR() {
            await getXR()
        }

        updateXR()

        const intervalId = setInterval(updateXR, 2 * 60 * 1000)

        return () => clearInterval(intervalId) // Cleanup on unmount
    }, [])

    const [selectedPercent, setSelectedPercent] = useState<number | null>(null)

    const handlePercent = useCallback(
        async (n: number) => {
            if (satsBalance) {
                setSelectedPercent(n)
                const percent = Big(n)

                let input = satsBalance.mul(percent).div(100)

                onInput(input)
                setInputVal(input.div(dec).round(8, 0))
            }
        },
        [satsBalance, onInput]
    )

    const handleOnInput = useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            setSelectedPercent(null)
            const target = event.target as HTMLInputElement
            try {
                if (target.value) {
                    const input = Big(target.value).mul(dec)
                    onInput(input)
                    setInputVal(input.div(dec).round(8, 0))
                } else {
                    onInput(_0)
                }
            } catch (err) {
                console.error('HandleOnInput', err)
            }
        },
        [onInput]
    )

    const handleOnBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            const target = event.target as HTMLInputElement
            const value = target.value
            try {
                if (value) {
                    const input = Big(value)

                    // Handle zero case
                    if (input.eq(_0)) {
                        return target.value
                    }

                    target.value = input.toFixed(8).replace(/\.?0+$/, '') // Format to 8 decimal places on blur and remove trailing zeros
                }
            } catch (err) {
                console.error('HandleOnBlur', err)
            }
        },
        []
    )

    const walletConnected = useStore($walletConnected).isConnected

    return (
        <label>
            <div className={classNames(styles.container)}>
                <div className={styles.formTxtInfoWrapper}>
                    {xr == null ? (
                        <div className={styles.info}>&nbsp;| Loading...</div>
                    ) : (
                        <>
                            <div className={styles.info}>
                                {/* &nbsp; */}| BTC Price:
                                <span className={styles.infoPurple}>
                                    $
                                    {Number(Big(xr!.rate)).toLocaleString(
                                        'en-US'
                                    )}
                                </span>
                            </div>
                            {walletConnected && (
                                <div className={styles.info}>
                                    | Wallet Balance
                                    <span className={styles.infoBalance}>
                                        <span className={styles.infoPurple}>
                                            $
                                            {Number(balWorth) == 0
                                                ? 0
                                                : Number(
                                                      balWorth
                                                  ).toLocaleString('en-US', {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                  })}
                                        </span>

                                        {!isNaN(Number(btcBalance)) &&
                                            Number(btcBalance) !== 0 && (
                                                <span
                                                    className={styles.infoColor}
                                                >
                                                    ≈ ₿
                                                    {Number(
                                                        btcBalance
                                                    ).toLocaleString('en-US', {
                                                        minimumFractionDigits: 8,
                                                        maximumFractionDigits: 8,
                                                    })}
                                                </span>
                                            )}
                                    </span>
                                </div>
                            )}

                            {/* {Number(bal) != 0 && (
                                <div className={styles.info}>
                                    | Worth:
                                    <span className={styles.infoPurple}>
                                        $
                                        {Number(worth_) == 0
                                            ? 0
                                            : Number(worth_).toLocaleString(
                                                  'en-US',
                                                  {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                  }
                                              )}
                                    </span>
                                </div>
                            )} */}
                        </>
                    )}
                </div>
                <div className={styles.inputWrapper}>
                    <Image
                        src={icoArrow}
                        alt="arrow-icon"
                        className={styles.img}
                    />
                    <div className={styles.inputContainer}>
                        {/* @dev Percentage buttons */}
                        <div>
                            {disabled ? null : (
                                <div className={styles.percentWrapper}>
                                    <div className={styles.row}>
                                        {list.map((n) => (
                                            <div
                                                key={n}
                                                className={
                                                    n === selectedPercent
                                                        ? styles.percentActive
                                                        : styles.percent
                                                }
                                                onClick={() => handlePercent(n)}
                                            >
                                                {n}%
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* @dev Input Box */}
                        <div className={styles.flexContainer}>
                            <div className={styles.wrapper}>
                                <input
                                    className={styles.inputAmt}
                                    type="number"
                                    placeholder="0"
                                    onInput={handleOnInput}
                                    value={Number(inputVal)}
                                    disabled={disabled}
                                    step="0.00000001"
                                    min="0"
                                    onBlur={handleOnBlur}
                                />
                                {token && (
                                    <Image
                                        className={styles.tokenImage}
                                        src={
                                            token.symbol === 'BTC'
                                                ? icoBTC
                                                : icoSYRON
                                        }
                                        alt="tokens-logo"
                                    />
                                    // <div
                                    //     className={classNames(styles.dropdown)}
                                    //     // onClick={onSelect}
                                    // >
                                    //     <Image
                                    //         src={token.symbol === 'BTC' ? icoBTC : icoSU$D}
                                    //         alt="tokens-logo"
                                    //         height="35"
                                    //         width="35"
                                    //     />
                                    //     <div className={styles.symbol}>{token.symbol}</div>
                                    //     <div className={styles.arrowIco}>
                                    //         <Image alt="arrow-ico" src={ArrowDownReg} />
                                    //     </div>
                                    // </div>
                                )}
                            </div>
                            <div className={styles.tokenInfo}>| BTC</div>
                        </div>
                    </div>
                </div>
                {/* @review (burn) */}
                {/* <div>
                    {disabled ? null : (
                        <div className={styles.btnSwapWrapper}>
                            {!noSwap && (
                                <div className={styles.btnSwap}>
                                    <SwapIcon onClick={onSwap} />
                                </div>
                            )}
                        </div>
                    )}
                </div> */}
            </div>
        </label>
    )
}
