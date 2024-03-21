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
import { $xr } from '../../../src/store/xr'
import { $btc_wallet, $syron } from '../../../src/store/syron'
import { api } from '../../../src/utils/unisat/api'
import {
    getStringByteCount,
    stringToBase64,
} from '../../../src/utils/unisat/utils'
import { InscribeOrderData } from '../../../src/utils/unisat/api-types'
import useICPHook from '../../../src/hooks/useICP'
import { useDispatch } from 'react-redux'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { mempoolTxId } from '../../../src/utils/unisat/httpUtils'
import icoBalance from '../../../src/assets/icons/ssi_icon_balance.svg'
import icoVault from '../../../src/assets/icons/ssi_icon_thunder.svg'
import refreshIco from '../../../src/assets/icons/refresh.svg'
import Spinner from '../../Spinner'
import { useBTCWalletHook } from '../../../src/hooks/useBTCWallet'

const Big = toformat(_Big)
Big.PE = 999

type Prop = {
    show: boolean
    pair: VaultPair[]
    direction: VaultDirection
    // onClose: () => void
}

const vault = new SSIVault()

export var ConfirmVaultModal: React.FC<Prop> = function ({
    pair,
    direction,
    // onClose,
}) {
    const unisat = (window as any).unisat
    const tyron = useStore($syron)
    const btc_wallet = useStore($btc_wallet)

    const { updateWallet } = useBTCWalletHook()
    const { getVault, getSUSD, updateVault } = useICPHook()
    const dispatch = useDispatch()

    const [exactToken, limitToken] = pair
    const exactInput = exactToken.value
    const limitInput = limitToken.value

    // const common = useTranslation(`common`)
    // const swap = useTranslation(`swap`)
    //const settings = useStore($settings)
    // const liquidity = useStore($liquidity)

    const [loading, setLoading] = React.useState(false)
    const [mintId, setMintId] = React.useState('')

    // const [isAllow, setIsAllow] = React.useState(false)
    // const [priceRevert, setPriceRevert] = React.useState(true)

    // const exact = React.useMemo(
    //     () =>
    //         BigInt(
    //             Big(pair[0].value).mul(
    //                 vault.toDecimals(pair[0].meta.decimals)!.round()
    //             )
    //         ),
    //     [pair]
    // )
    // const limit = React.useMemo(
    //     () =>
    //         BigInt(
    //             Big(pair[1].value).mul(
    //                 vault.toDecimals(pair[1].meta.decimals)!.round()
    //             )
    //         ),
    //     [pair]
    // )

    const expectedOutput = React.useMemo(() => {
        const [, limitToken] = pair
        const limit = Big(limitToken.value)
        return limit.round(12).toFormat()
    }, [pair])

    const priceInfo = React.useMemo(() => {
        //const priceImpact = React.useMemo(() => {
        let price = Big(0)
        let x = String(0)
        let y = String(0)
        let baseReserve = Big(0)
        let tokensReserve = Big(0)

        //@review (asap)
        console.log('Review direction:', direction)

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
        return {
            impact: 0,
            input: Big(exactInput),
            output: Big(limitInput),
        }
    }, []) //direction, pair])

    const disabled = React.useMemo(() => {
        return loading || Big(priceInfo!.impact) > 10
    }, [priceInfo, loading])

    const transaction_status = async (txId) => {
        // @review (mainnet)
        const url = `https://mempool.space/testnet/api/tx/${txId}/status`

        while (true) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                })

                if (!response.ok) {
                    throw new Error(
                        `API request failed with status ${response.status}`
                    )
                }

                const data = await response.json()
                console.log(JSON.stringify(data, null, 2))

                if (!data.confirmed) {
                    throw new Error(`Trying again`)
                } else {
                    return data
                }
            } catch (error) {
                console.log(`Transaction status not confirmed. ${error}`)
                await new Promise(
                    (resolve) => setTimeout(resolve, 1 * 60 * 1000) // 1 min
                )
            }
        }
    }

    const updateBalance = async () => {
        const [address] = await unisat.getAccounts()
        const balance = await unisat.getBalance()
        const network = await unisat.getNetwork()
        await updateWallet(address, Number(balance.confirmed), network)
        await getVault(address, Number(balance.confirmed), network)
        console.log('balance updated')
    }

    const mintStablecoin = async () => {
        console.log('TxId', mintId)

        //@review (asap) what to do when txid_ is empty
        await getSUSD(btc_wallet?.btc_addr!, mintId)
            .then(async (tx) => {
                if (tx) {
                    console.log('Get SU$D', tx)
                    // dispatch(setTxStatusLoading('confirmed'))
                }
                await updateBalance()
            })
            .catch((err) => {
                throw err
            })
    }

    const updateVaultNow = async () => {
        await updateVault(btc_wallet?.btc_addr!)
            .then((tx) => {
                if (tx) {
                    console.log('Update Vault', tx)
                }
            })
            .catch((err) => {
                throw err
            })
    }

    const updateBitcoinVault = async () => {
        setLoading(true)
        try {
            await updateVaultNow().then(async (res) => await updateBalance())
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const hanldeConfirm = React.useCallback(async () => {
        setLoading(true)

        // @review (asap) transaction status modal not working - see dispatch(setTx
        // dispatch(setTxStatusLoading('true'))
        try {
            // throw new Error('Coming soon!')
            if (!btc_wallet?.btc_addr) {
                throw new Error('Connect Wallet')
            }

            if (btc_wallet?.network == 'livenet')
                throw new Error('Use Bitcoin Testnet')

            const collateral = Math.floor(Number(exactInput))
            if (collateral <= 1000)
                throw new Error('BTC deposit is below the minimum')

            const tick = 'SYRO'
            const amt = Number(limitInput.round(3))

            console.log('BTC Collateral', collateral)
            console.log('Stablecoin Amount', amt)

            // const transfer = {
            //     p: 'brc-20',
            //     op: 'transfer',
            //     tick,
            //     amt,
            // }
            // const text = JSON.stringify(transfer)
            // console.log(text)

            // const file_list = [
            //     {
            //         filename: text.slice(0, 512),
            //         dataURL: `data:text/plain;charset=utf-8;base64,${stringToBase64(
            //             text
            //         )}`,
            //         size: getStringByteCount(text),
            //     },
            // ]

            const receiveAddress = process.env.NEXT_PUBLIC_SYRON_MINTER! // the receiver address

            // const inscriptionBalance = 333 // the balance in each inscription
            // const fileCount = 1 // the fileCount
            // const fileSize = 1000 // the total size of all files
            // const contentTypeSize = 100 // the size of contentType
            const feeRate = 1 // the feeRate @review (mainnet)
            // const feeFileSize = 100 // the total size of first 25 files
            // const feeFileCount = 25 // do not change this

            // const balance = inscriptionBalance * fileCount

            // let addrSize = 25 + 1 // p2pkh
            // if (
            //     receiveAddress.indexOf('bc1q') == 0 ||
            //     receiveAddress.indexOf('tb1q') == 0
            // ) {
            //     addrSize = 22 + 1
            // } else if (
            //     receiveAddress.indexOf('bc1p') == 0 ||
            //     receiveAddress.indexOf('tb1p') == 0
            // ) {
            //     addrSize = 34 + 1
            // } else if (
            //     receiveAddress.indexOf('2') == 0 ||
            //     receiveAddress.indexOf('3') == 0
            // ) {
            //     addrSize = 23 + 1
            // }

            // const baseSize = 88
            // let networkFee = Math.ceil(
            //     ((fileSize + contentTypeSize) / 4 +
            //         (baseSize + 8 + addrSize + 8 + 23)) *
            //         feeRate
            // )
            // if (fileCount > 1) {
            //     networkFee = Math.ceil(
            //         ((fileSize + contentTypeSize) / 4 +
            //             (baseSize +
            //                 8 +
            //                 addrSize +
            //                 (35 + 8) * (fileCount - 1) +
            //                 8 +
            //                 23 +
            //                 (baseSize + 8 + addrSize + 0.5) *
            //                     (fileCount - 1))) *
            //             feeRate
            //     )
            // }
            // let networkSatsByFeeCount = Math.ceil(
            //     ((feeFileSize + contentTypeSize) / 4 +
            //         (baseSize + 8 + addrSize + 8 + 23)) *
            //         feeRate
            // )
            // if (fileCount > 1) {
            //     networkSatsByFeeCount = Math.ceil(
            //         ((feeFileSize +
            //             contentTypeSize * (feeFileCount / fileCount)) /
            //             4 +
            //             (baseSize +
            //                 8 +
            //                 addrSize +
            //                 (35 + 8) * (fileCount - 1) +
            //                 8 +
            //                 23 +
            //                 (baseSize + 8 + addrSize + 0.5) *
            //                     Math.min(fileCount - 1, feeFileCount - 1))) *
            //             feeRate
            //     )
            // }

            // const baseFee = 1999 * Math.min(fileCount, feeFileCount) // 1999 base fee for top 25 files
            // const floatFee = Math.ceil(networkSatsByFeeCount * 0.0499) // 4.99% extra miner fee for top 25 transations
            // const serviceFee = Math.floor(baseFee + floatFee)

            // const total = balance + networkFee + serviceFee
            // const truncatedTotal = Math.floor(total / 1000) * 1000 // truncate
            // const _amount = truncatedTotal + devFee // add devFee at the end
            // console.log('The final amount need to pay: ', _amount)

            // const { orderId } = await api.createOrder({
            //     receiveAddress,
            //     feeRate,
            //     outputValue: 333,
            //     files: file_list.map((item) => ({
            //         dataURL: item.dataURL,
            //         filename: item.filename,
            //     })),
            //     devAddress: receiveAddress,
            //     devFee: 1111, //Number(Big(exactToken.value)),
            // })

            // @dev Transfer Inscription
            const order: InscribeOrderData = await api.createTransfer({
                receiveAddress,
                feeRate,
                outputValue: 546,
                devAddress: tyron?.ssi_vault!,
                devFee: collateral,
                brc20Ticker: tick,
                brc20Amount: String(amt),
            })

            console.log('Order', JSON.stringify(order, null, 2))
            // const order = await api.orderInfo(orderId)
            // console.log('Order Value', order.amount)
            // console.log('Order ID', order.orderId)

            const pay_address = order.payAddress

            // @dev 1) Send Bitcoin transaction (#B1)
            await unisat
                .sendBitcoin(order.payAddress, order.amount, order.feeRate)
                .then(async (txId) => {
                    // dispatch(setTxId(txId))
                    // dispatch(setTxStatusLoading('submitted'))

                    // @dev 2) Make sure that the Bitcoin transaction (1) is confirmed
                    await transaction_status(txId).then(async (res) => {
                        await api
                            .orderInfo(order.orderId)
                            .then((order_) => {
                                const inscription_id =
                                    order_.files[0].inscriptionId
                                return inscription_id.slice(0, -2)
                            })
                            .then(
                                // await mempoolTxId(pay_address).then(
                                async (tx_id) => {
                                    setMintId(tx_id)
                                    await mintStablecoin()
                                }
                            )
                    })
                })
        } catch (err) {
            console.error(err)
            // dispatch(setTxStatusLoading('rejected'))

            if (err == 'Error: Coming soon!') {
                toast.info('Coming soon!', {
                    position: 'bottom-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 1,
                })
            } else if (Object.keys(err!).length !== 0) {
                toast.error('Request Rejected', {
                    position: 'bottom-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 2,
                })
            } else {
                toast.error(String(err), {
                    position: 'bottom-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 2,
                })
            }
        }

        setLoading(false)
    }, [pair, /*limit,*/ direction, tyron /*onClose*/])

    const xr = useStore($xr)

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
                                                {pair[0].meta.name} price
                                            </div>
                                            <div className={styles.txtRow2}>
                                                $
                                                {Number(
                                                    Big(xr!.rate)
                                                ).toLocaleString()}
                                                {/* <Image
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
                                                /> */}
                                            </div>
                                        </div>
                                        <div className={styles.rowLiq}>
                                            <div className={styles.txtRow}>
                                                Collateralization ratio
                                            </div>
                                            <div className={styles.txtRow2}>
                                                1.5
                                            </div>
                                        </div>
                                        {/* <div className={styles.rowLiq}>
                                            <div className={styles.txtRow}>
                                                {pair[1].meta.symbol} LIQUIDITY
                                            </div>
                                            <div className={styles.txtRow2}>
                                                {Number(
                                                    priceInfo!.output
                                                ).toLocaleString()}{' '}
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
                                        </div> */}
                                    </>
                                )}
                            <br />
                            {/* <div className={styles.row}>
                                <div className={styles.txtRowEO}>
                                    EXPECTED OUTPUT
                                </div>
                                <div className={styles.txtRow2}>
                                    {expectedOutput}{' '}
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
                            </div> */}
                            {/* {priceInfo!.input !== '0' && (
                                <div className={styles.row}>
                                    <div className={styles.txtRow}>
                                        PRICE IMPACT
                                    </div>
                                    <div className={styles.txtRow2}>
                                        {String(priceInfo!.impact)}%
                                    </div>
                                </div>
                            )} */}
                        </div>
                        {/* <div className={classNames(styles.column, 'muted')}>
                            <div className={styles.row}>
                                <div className={styles.txtRow}>SLIPPAGE</div>
                                <div className={styles.txtRow2}>
                                    -{settings.slippage}%
                                </div>
                            </div>
                        </div> */}
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
                            onClick={hanldeConfirm}
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
                                'get su$d'
                            )}
                        </div>
                    </div>
                    {/* <div onClick={onClose} className={styles.cancel}>
                        Cancel
                    </div> */}
                    {tyron?.ssi_vault && (
                        <div className={styles.vaultWrapper}>
                            <p
                                style={{
                                    paddingLeft: '4px',
                                    paddingTop: '4%',
                                    textTransform: 'uppercase',
                                    color: '#ffff32',
                                }}
                            >
                                Your ₿itcoin Vault
                                <span
                                    onClick={updateBitcoinVault}
                                    style={{
                                        cursor: 'pointer',
                                        paddingLeft: '8px',
                                    }}
                                >
                                    {loading ? (
                                        <Spinner />
                                    ) : (
                                        <Image
                                            src={refreshIco}
                                            alt="refresh-ico"
                                            height="12"
                                            width="12"
                                        />
                                    )}
                                </span>
                            </p>

                            <p
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Image
                                    src={icoBalance}
                                    alt={'BTC'}
                                    height="17"
                                    width="17"
                                />
                                <span
                                    style={{
                                        paddingLeft: '4px',
                                        paddingRight: '8px',
                                    }}
                                >
                                    Balance:{' '}
                                    {Number(tyron?.vault_balance.div(1e8))}
                                </span>
                                <Image
                                    src={icoBTC}
                                    alt={'BTC'}
                                    height="17"
                                    width="17"
                                />
                            </p>
                            <p
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                            >
                                <Image
                                    src={icoVault}
                                    alt={'BTC'}
                                    height="17"
                                    width="17"
                                />
                                <span style={{ paddingLeft: '4px' }}>
                                    Address:
                                    <span
                                        onClick={() =>
                                            window.open(
                                                `https://mempool.space/testnet/address/${tyron?.ssi_vault}`
                                            )
                                        }
                                        style={{
                                            paddingLeft: '4px',
                                            cursor: 'pointer',
                                            textDecorationLine: 'underline',
                                            textDecorationColor: '#ffff32',
                                        }}
                                    >
                                        {tyron?.ssi_vault}
                                    </span>
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
