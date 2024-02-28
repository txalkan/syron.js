import styles from '../confirm-swap/index.module.scss'
import _Big from 'big.js'
import classNames from 'classnames'
import { useStore } from 'react-stores'
import toformat from 'toformat'
import React from 'react'
import { DragonDex, SwapDirection } from '../../../src/mixins/dex'
import { TokensMixine } from '../../../src/mixins/token'
import { ZERO_ADDR } from '../../../src/config/const'
import { $settings } from '../../../src/store/settings'
import ThreeDots from '../../Spinner/ThreeDots'
import { toast } from 'react-toastify'
import iconS$I from '../../../src/assets/icons/SSI_dollar.svg'
import Image from 'next/image'
import { getIconURL } from '../../../src/lib/viewblock'
import toastTheme from '../../../src/hooks/toastTheme'
import { $bitcoin_addresses } from '../../../src/store/bitcoin-addresses'
import { VaultPair } from '../../../src/types/vault'
import { SSIVault, VaultDirection } from '../../../src/mixins/vault'
import icoBTC from '../../../src/assets/icons/bitcoin.png'
import icoSU$D from '../../../src/assets/icons/ssi_SU$D_iso.svg'

const Big = toformat(_Big)
Big.PE = 999

type Prop = {
    show: boolean
    pair: VaultPair[]
    direction: VaultDirection
    onClose: () => void
}

const tokensMixin = new TokensMixine()
const vault = new SSIVault()

export var ConfirmVaultModal: React.FC<Prop> = function ({
    show,
    pair,
    direction,
    onClose,
}) {
    //@zilpay
    const wallet = useStore($bitcoin_addresses)
    // const common = useTranslation(`common`)
    // const swap = useTranslation(`swap`)
    const settings = useStore($settings)
    // const liquidity = useStore($liquidity)

    const [loading, setLoading] = React.useState(true)
    // const [isAllow, setIsAllow] = React.useState(false)
    // const [priceRevert, setPriceRevert] = React.useState(true)

    const exact = React.useMemo(
        () =>
            BigInt(
                Big(pair[0].value).mul(
                    vault.toDecimals(pair[0].meta.decimals).round()
                )
            ),
        [pair]
    )
    const limit = React.useMemo(
        () =>
            BigInt(
                Big(pair[1].value).mul(
                    vault.toDecimals(pair[1].meta.decimals).round()
                )
            ),
        [pair]
    )

    const expectedOutput = React.useMemo(() => {
        const [, limitToken] = pair
        const limit = Big(limitToken.value)
        return limit.round(12).toFormat()
    }, [pair])

    const priceInfo = React.useMemo(() => {
        //const priceImpact = React.useMemo(() => {
        const [exactToken, limitToken] = pair
        const exactInput = Big(exactToken.value)
        const limitInput = Big(limitToken.value)
        let price = Big(0)
        let x = String(0)
        let y = String(0)
        let baseReserve = Big(0)
        let tokensReserve = Big(0)

        try {
            console.log('SwapDirection:', direction)

            // @review (syron)
            // switch (direction) {
            //     case SwapDirection.ZilToToken:
            //         ;[x, y] = liquidity.pools[limitToken.meta.base16]
            //         baseReserve = Big(String(x)).div(
            //             dex.toDecimals(exactToken.meta.decimals)
            //         )
            //         tokensReserve = Big(String(y)).div(
            //             dex.toDecimals(limitToken.meta.decimals)
            //         )
            //         price = baseReserve.div(tokensReserve)
            //         console.log('CURRENT_PRICE', String(price))
            //         return {
            //             impact: dex.calcPriceImpact(
            //                 exactInput,
            //                 limitInput,
            //                 price
            //             ),
            //             input: baseReserve.round(2),
            //             output: tokensReserve.round(2),
            //         }
            //     case SwapDirection.TokenToZil:
            //         ;[x, y] = liquidity.pools[exactToken.meta.base16]
            //         baseReserve = Big(String(x)).div(
            //             dex.toDecimals(limitToken.meta.decimals)
            //         )
            //         tokensReserve = Big(String(y)).div(
            //             dex.toDecimals(exactToken.meta.decimals)
            //         )
            //         price = tokensReserve.div(baseReserve)
            //         //return dex.calcPriceImpact(exactInput, limitInput, price)
            //         return {
            //             impact: dex.calcPriceImpact(
            //                 exactInput,
            //                 limitInput,
            //                 price
            //             ),
            //             input: tokensReserve.round(2),
            //             output: baseReserve.round(2),
            //         }
            //     case SwapDirection.TokenToTokens:
            //         const [zilliqa] = $tokens.state.tokens
            //         const [inputZils, inputTokens] =
            //             liquidity.pools[exactToken.meta.base16]
            //         const [outpuZils, outputTokens] =
            //             liquidity.pools[limitToken.meta.base16]

            //         const bigInputZils = Big(String(inputZils)).div(
            //             dex.toDecimals(zilliqa.meta.decimals)
            //         )
            //         const bigInputTokens = Big(String(inputTokens)).div(
            //             dex.toDecimals(exactToken.meta.decimals)
            //         )

            //         const bigOutpuZils = Big(String(outpuZils)).div(
            //             dex.toDecimals(zilliqa.meta.decimals)
            //         )
            //         const bigOutputTokens = Big(String(outputTokens)).div(
            //             dex.toDecimals(limitToken.meta.decimals)
            //         )

            //         const inputRate = bigInputTokens.div(bigInputZils)
            //         const outpuRate = bigOutputTokens.div(bigOutpuZils)
            //         price = inputRate.div(outpuRate)

            //         //return dex.calcPriceImpact(exactInput, limitInput, price)
            //         return {
            //             impact: dex.calcPriceImpact(
            //                 exactInput,
            //                 limitInput,
            //                 price
            //             ),
            //             input: 'coming soon',
            //             output: 'coming soon',
            //         }
            //     case SwapDirection.DEFIxTokensForTokens:
            //         ;[x, y] = liquidity.reserves['tyron_s$i']
            //         baseReserve = Big(String(x)).div(dex.toDecimals(18))
            //         tokensReserve = Big(String(y)).div(dex.toDecimals(12))
            //         return {
            //             impact: dex.calculatePriceImpact(
            //                 exactToken,
            //                 baseReserve,
            //                 tokensReserve,
            //                 exactInput,
            //                 limitInput
            //             ),
            //             input: baseReserve.round(2),
            //             output: tokensReserve.round(2),
            //         }

            //     default:
            //         //return 0
            //         return {
            //             impact: 0,
            //             input: '0',
            //             output: '0',
            //         }
            // }
        } catch (err) {
            console.error(err)
            //return 0
            return {
                impact: 0,
                input: '0',
                output: '0',
            }
        }
    }, [direction, pair])

    const disabled = React.useMemo(() => {
        return loading || Big(priceInfo!.impact) > 10
    }, [priceInfo, loading])

    const lazyRoot = React.useRef(null)

    const hanldeOnSwap = React.useCallback(async () => {
        setLoading(true)
        try {
            const zilpay = await tokensMixin.zilpay.zilpay()

            if (!wallet || !zilpay.wallet.isEnable) {
                await zilpay.wallet.connect()
            }

            // switch (direction) {
            //     case VaultDirection.Mint:
            //         await vault.swapExactZILForTokens(
            //             selectedDex,
            //             exact,
            //             limit,
            //             pair[1].meta,
            //             resolvedDomain,
            //             zilpay_addr,
            //             isDEFIx
            //         )
            //         setLoading(false)
            //         onClose()
            //         return
            //     case VaultDirection.Burn:
            //         await dex.swapExactTokensForZIL(
            //             selectedDex,
            //             exact,
            //             limit,
            //             pair[0].meta
            //         )
            //         setLoading(false)
            //         onClose()
            //         return
            // }
        } catch (err) {
            console.error(err)
        }

        setLoading(false)
    }, [pair, limit, direction, wallet, onClose])

    return (
        <>
            {String(expectedOutput) !== '0' && (
                <div className={styles.container}>
                    <div className={styles.info}>
                        <div className={styles.column}>
                            {priceInfo!.input !== '0' &&
                                priceInfo!.output !== '0' && (
                                    <>
                                        <div className={styles.rowLiq}>
                                            <div className={styles.txtRow}>
                                                {pair[0].meta.symbol} LIQUIDITY
                                            </div>
                                            <div className={styles.txtRow2}>
                                                {Number(
                                                    priceInfo!.input
                                                ).toLocaleString()}{' '}
                                                {/* {pair[0].meta.symbol} */}
                                                <Image
                                                    src={
                                                        pair[0].meta.symbol ===
                                                        'BTC'
                                                            ? icoBTC
                                                            : icoSU$D
                                                    }
                                                    alt={pair[0].meta.symbol}
                                                    lazyRoot={
                                                        lazyRoot as unknown as string
                                                    }
                                                    height="17"
                                                    width="17"
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.rowLiq}>
                                            <div className={styles.txtRow}>
                                                {pair[1].meta.symbol} LIQUIDITY
                                            </div>
                                            <div className={styles.txtRow2}>
                                                {Number(
                                                    priceInfo!.output
                                                ).toLocaleString()}{' '}
                                                {/* {pair[1].meta.symbol} */}
                                                <Image
                                                    src={
                                                        pair[1].meta.symbol ===
                                                        'BTC'
                                                            ? icoBTC
                                                            : icoSU$D
                                                    }
                                                    alt={pair[1].meta.symbol}
                                                    lazyRoot={
                                                        lazyRoot as unknown as string
                                                    }
                                                    height="17"
                                                    width="17"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            <br />
                            <div className={styles.row}>
                                <div className={styles.txtRowEO}>
                                    EXPECTED OUTPUT
                                </div>
                                <div className={styles.txtRow2}>
                                    {expectedOutput}{' '}
                                    {/* {pair[1].meta.symbol} */}
                                    <Image
                                        src={
                                            pair[1].meta.symbol === 'BTC'
                                                ? icoBTC
                                                : icoSU$D
                                        }
                                        alt={pair[1].meta.symbol}
                                        lazyRoot={lazyRoot as unknown as string}
                                        height="17"
                                        width="17"
                                    />
                                </div>
                            </div>
                            {priceInfo!.input !== '0' && (
                                <div className={styles.row}>
                                    <div className={styles.txtRow}>
                                        PRICE IMPACT
                                    </div>
                                    <div className={styles.txtRow2}>
                                        {String(priceInfo!.impact)}%
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={classNames(styles.column, 'muted')}>
                            <div className={styles.row}>
                                <div className={styles.txtRow}>SLIPPAGE</div>
                                <div className={styles.txtRow2}>
                                    -{settings.slippage}%
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.btnWrapper}>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '1rem',
                            }}
                            className={`button ${
                                disabled ? 'disabled' : 'primary'
                            }`}
                            onClick={hanldeOnSwap}
                            // disabled={disabled}
                        >
                            {loading ? (
                                <ThreeDots color="yellow" />
                            ) : (
                                // <ThreeDots
                                //   color="var(--button-color)"
                                //   height={25}
                                //   width={50}
                                // />
                                // <>{isAllow ? 'CONFIRM SWAP' : 'APPROVE'}</>
                                'trade'
                            )}
                        </div>
                    </div>
                    <div onClick={onClose} className={styles.cancel}>
                        Cancel
                    </div>
                </div>
            )}
        </>
    )
}
