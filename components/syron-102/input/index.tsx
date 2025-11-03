import styles from './index.module.scss'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import icoSYRON from '../../../src/assets/icons/ssi_SYRON_iso.png'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import { CryptoState } from '../../../src/types/vault'
import { useStore } from 'react-stores'
import { useWalletInfoStore } from '../../../src/store/wallet_info'
import { $xr } from '../../../src/store/xr'
import { Big, _0 } from '../../../src/utils/big'

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
    const { wallet } = useWalletInfoStore()
    const xr = useStore($xr)

    const addr_name = token?.symbol.toLowerCase()

    const [satsBalance, setSatsBalance] = useState(_0)
    const [btcBalance, setBtcBalance] = useState(_0)
    const [inputVal, setInputVal] = useState(_0)
    const [btcPrice, setBtcPrice] = useState<number | null>(null)

    useEffect(() => {
        if (addr_name == 'btc') {
            setInputVal(value_.div(dec))

            const sats = wallet.balance
            if (sats) {
                const satsBig = Big(sats)
                setSatsBalance(satsBig)

                const btcBal = satsBig.div(dec)
                setBtcBalance(btcBal)
            }
        }
        if (xr != null) {
            setBtcPrice(xr.rate)
        }
    }, [wallet.balance, addr_name, value_, xr])

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

    const btcPriceLabel = btcPrice ? btcPrice.toLocaleString('en-US') : '...'

    const walletUsd = btcPrice ? btcBalance.mul(btcPrice) : _0
    const formattedWalletUsd = btcPrice
        ? Number(walletUsd).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '0.00'

    const inputUsd = btcPrice ? inputVal.mul(btcPrice) : _0
    const formattedInputUsd = btcPrice
        ? Number(inputUsd).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...'

    return (
        <div className={classNames(styles.container)}>
            <div className={styles.formTxtInfoWrapper}>
                {btcPrice == null ? (
                    <div className={styles.info}>&nbsp;| Loading...</div>
                ) : (
                    <>
                        <div className={styles.info}>
                            {/* &nbsp; */}| BTC Price:
                            <span className={styles.infoPurple}>
                                <span style={{ paddingRight: '0.2rem' }}>
                                    $
                                </span>
                                {btcPriceLabel}
                            </span>
                        </div>
                        <div className={styles.info}>
                            | Wallet Balance
                            <span className={styles.infoBalance}>
                                {!isNaN(Number(btcBalance)) && (
                                    <span className={styles.infoColor}>
                                        <span
                                            style={{
                                                paddingRight: '0.2rem',
                                            }}
                                        >
                                            ₿
                                        </span>
                                        {Number(btcBalance) !== 0
                                            ? Number(btcBalance).toLocaleString(
                                                  'en-US',
                                                  {
                                                      minimumFractionDigits: 8,
                                                      maximumFractionDigits: 8,
                                                  }
                                              )
                                            : '0'}
                                    </span>
                                )}
                                {Number(walletUsd) !== 0 && (
                                    <span className={styles.infoPurple}>
                                        <span
                                            style={{
                                                paddingRight: '0.2rem',
                                            }}
                                        >
                                            ≈
                                        </span>
                                        <span
                                            style={{
                                                paddingRight: '0.2rem',
                                            }}
                                        >
                                            $
                                        </span>
                                        {formattedWalletUsd}
                                    </span>
                                )}
                            </span>
                        </div>

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

            <div className={styles.inputContainer}>
                <label htmlFor="deposit" className={styles.label}>
                    btc for collateral
                </label>
                {/* @dev Percentage buttons */}
                <div className={styles.percentWrapper}>
                    {disabled ? null : (
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
                    )}
                </div>
                {/* @dev Input Box */}
                <div className={styles.flexContainer}>
                    <div className={styles.wrapper}>
                        <input
                            id="deposit"
                            className={styles.inputAmt}
                            type="number"
                            placeholder="0"
                            onInput={handleOnInput}
                            value={Number(inputVal)}
                            disabled={disabled}
                            step="0.00000001"
                            min="0"
                            onBlur={handleOnBlur}
                            lang="en-US"
                        />
                        {token && (
                            <Image
                                className={styles.tokenImage}
                                src={token.symbol === 'BTC' ? icoBTC : icoSYRON}
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
                    {/* <div className={styles.tokenInfo}>| BTC</div> */}
                </div>
                {/* the input amount multiplied by the price of bitcoin */}
                <label className={styles.labelUsd}>
                    ≈ $ {formattedInputUsd}
                </label>
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
    )
}
