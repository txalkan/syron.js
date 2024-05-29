import styles from './index.module.scss'
import _Big from 'big.js'
import { useStore } from 'react-stores'
import { useStore as useStoreEffector } from 'effector-react'
import toformat from 'toformat'
import React, { useEffect, useRef, useState } from 'react'
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

import icoSU$D from '../../../src/assets/icons/ssi_SU$D_iso.svg'
import { $xr } from '../../../src/store/xr'
import {
    $btc_wallet,
    $syron,
    $walletConnected,
    updateWalletConnected,
} from '../../../src/store/syron'
import { unisatApi } from '../../../src/utils/unisat/api'
import {
    getStringByteCount,
    stringToBase64,
} from '../../../src/utils/unisat/utils'
import { InscribeOrderData } from '../../../src/utils/unisat/api-types'
import useICPHook from '../../../src/hooks/useICP'
import { useDispatch } from 'react-redux'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import {
    mempoolTxId,
    mempoolFeeRate,
} from '../../../src/utils/unisat/httpUtils'
import refreshIco from '../../../src/assets/icons/refresh.svg'
import Spinner from '../../Spinner'
import { useBTCWalletHook } from '../../../src/hooks/useBTCWallet'
import { useTranslation } from 'next-i18next'

const Big = toformat(_Big)
Big.PE = 999

type Prop = {
    show: boolean
    pair: VaultPair[]
    direction: VaultDirection
    // onClose: () => void
}

const vault = new SSIVault()

export var ConfirmBox: React.FC<Prop> = function ({
    pair,
    direction,
    // onClose,
}) {
    const unisat = (window as any).unisat
    const [unisatInstalled, setUnisatInstalled] = useState(false)
    const tyron = useStore($syron)
    const btc_wallet = useStore($btc_wallet)
    const walletConnected = useStore($walletConnected).isConnected

    const { updateWallet } = useBTCWalletHook()
    const { getBox, getSUSD, getSyron } = useICPHook()
    const dispatch = useDispatch()
    const { t } = useTranslation()

    const [exactToken, limitToken] = pair
    const exactInput = exactToken.value
    const limitInput = limitToken.value

    // const common = useTranslation(`common`)
    // const swap = useTranslation(`swap`)
    //const settings = useStore($settings)
    // const liquidity = useStore($liquidity)

    const [loadingTxn, setLoading] = React.useState(false)

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
        return (
            loadingTxn /*|| Big(priceInfo!.impact) > 10 */ ||
            (tyron == null && walletConnected)
        )
    }, [priceInfo, loadingTxn, tyron])

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
                    toast.info('BTC deposit confirmed', {
                        position: 'bottom-center',
                        autoClose: 4000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        toastId: 1,
                    })
                    await updateBalance()
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
        await getBox(address, Number(balance.confirmed), network)
        console.log('balance updated')
    }

    const mintStablecoin = async (tx_id) => {
        console.log('Deposit Transaction ID #2', tx_id)
        await getSUSD(btc_wallet?.btc_addr!, tx_id)
            .then(async (tx) => {
                if (tx) {
                    console.log('Get SU$D ICP ID', tx)
                    // dispatch(setTxStatusLoading('confirmed'))
                }
            })
            .catch((err) => {
                throw err
            })
    }

    const getSyronNow = async () => {
        await getSyron(btc_wallet?.btc_addr!)
            .then((tx) => {
                if (tx) {
                    console.log('Get Syron ICP ID', tx)
                }
            })
            .catch((err) => {
                throw err
            })
    }

    const updateBox = async () => {
        setLoading(true)
        try {
            await getSyronNow().then(async (res) => await updateBalance())
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const handleConfirm = React.useCallback(async () => {
        setLoading(true)

        // @review (asap) transaction status modal not working - see dispatch(setTx
        // dispatch(setTxStatusLoading('true'))
        try {
            const inscription_id =
                '6f5bf11ec0a565351c316bc2bca5014d3388f96c6d0ab726f7db4a1adb820d68i0'
            await fetch(`/api/get-unisat-inscription-info?id=${inscription_id}`)
                .then(async (response) => {
                    const data = await response.json()
                    console.log(
                        'outcall response',
                        JSON.stringify(data, null, 2)
                    )
                })
                .catch((error) => console.error(error))

            // const id =
            //     'tb1p4w59p7nxggc56lg79v7cwh4c8emtudjrtetgasfy5j3q9r4ug9zsuwhykc'
            // await fetch(`/api/get-unisat-brc20-info?id=${id}`)
            //     .then(async (response) => {
            //         const data = await response.json()
            //         console.log(
            //             'outcall response',
            //             JSON.stringify(data, null, 2)
            //         )
            //     })
            //     .catch((error) => console.error(error))

            // @pause
            throw new Error('Coming soon!')
            if (!btc_wallet?.btc_addr) {
                throw new Error('Connect Wallet')
            }

            if (btc_wallet?.network == 'livenet')
                throw new Error('Use Bitcoin Testnet')

            const collateral = Math.floor(Number(exactInput))
            if (collateral <= 1000)
                throw new Error('BTC deposit is below the minimum')

            toast.info(
                'Your Bitcoin transaction can take around 30 minutes to complete.',
                {
                    position: 'bottom-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 2,
                }
            )
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

            // @dev The transaction fee rate in sat/vB @review (mainnet)
            let feeRate = await mempoolFeeRate()
            console.log('Fee Rate', feeRate)

            if (!feeRate) {
                feeRate = 20
            }

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

            let box_addr =
                'tb1pduxfg234ckmc3mq5znzhhtgukg79c3emc9d42twafhdcgk5rgxcqxwpu35' //@review (mainnet)

            if (tyron !== null) {
                box_addr = tyron?.ssi_box!
            }

            // @dev Transfer Inscription
            const order: InscribeOrderData = await unisatApi.createTransfer({
                receiveAddress,
                feeRate: feeRate || 1, // Assign a default value of 1 if feeRate is undefined
                outputValue: 546,
                devAddress: box_addr,
                devFee: collateral,
                brc20Ticker: tick,
                brc20Amount: String(amt),
            })

            console.log('Order', JSON.stringify(order, null, 2))
            // const order = await api.orderInfo(orderId)
            // console.log('Order Value', order.amount)
            // console.log('Order ID', order.orderId)

            // @dev 1) Send Bitcoin transaction (#B1)
            await unisat
                .sendBitcoin(order.payAddress, order.amount, order.feeRate)
                .then(async (txId) => {
                    console.log('Deposit Transaction ID #1', txId)
                    // dispatch(setTxId(txId))
                    // dispatch(setTxStatusLoading('submitted'))

                    // @dev 2) Make sure that the Bitcoin transaction (1) is confirmed

                    await transaction_status(txId).then(async (res) => {
                        await unisatApi
                            .orderInfo(order.orderId)
                            .then(async (order_) => {
                                console.log(
                                    'Order From OrderId',
                                    JSON.stringify(order_, null, 2)
                                )
                                const inscription_id =
                                    order_.files[0].inscriptionId

                                // @dev Double-check inscription using indexer @todo
                                await fetch(
                                    `/api/get-unisat-inscription-info?id=${inscription_id}`
                                )
                                    .then((response) => response.json())
                                    .then((data) =>
                                        console.log(
                                            JSON.stringify(data, null, 2)
                                        )
                                    )
                                    .catch((error) => console.error(error))

                                return inscription_id.slice(0, -2)
                            })
                            .then(
                                // await mempoolTxId(order.payAddress).then(
                                async (tx_id) => {
                                    await mintStablecoin(tx_id)
                                    window.open(
                                        `https://testnet.unisat.io/brc20?q=${btc_wallet?.btc_addr}&tick=SYRO`
                                    )
                                    setLoading(false)
                                }
                            )
                    })
                })
        } catch (err) {
            console.error('handleConfirm', err)
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
                    toastId: 3,
                })
            } else if (
                typeof err === 'object' &&
                Object.keys(err!).length !== 0
            ) {
                toast.error('Request Rejected', {
                    position: 'bottom-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 4,
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
                    toastId: 5,
                })
            }
            setLoading(false)
        }
    }, [pair, /*limit,*/ direction /*onClose*/, tyron])

    const xr = useStore($xr)

    const selfRef = useRef<{ accounts: string[] }>({
        accounts: [],
    })
    const self = selfRef.current
    const handleAccountsChanged = (_accounts: string[]) => {
        if (self.accounts[0] === _accounts[0]) {
            // prevent from triggering twice
            return
        }
        self.accounts = _accounts
        if (_accounts.length > 0) {
            updateWalletConnected(true)
        } else {
            updateWalletConnected(false)
        }
    }

    useEffect(() => {
        async function checkUnisat() {
            let unisat = (window as any).unisat

            for (let i = 1; i < 10 && !unisat; i += 1) {
                await new Promise((resolve) => setTimeout(resolve, 100 * i))
                unisat = (window as any).unisat
            }

            if (unisat) {
                setUnisatInstalled(true)
            } else if (!unisat) return

            unisat.getAccounts().then((accounts: string[]) => {
                handleAccountsChanged(accounts)
            })

            unisat.on('accountsChanged', handleAccountsChanged)

            return () => {
                unisat.removeListener('accountsChanged', handleAccountsChanged)
            }
        }

        checkUnisat().then()
    }, [])

    const handleButtonClick = async () => {
        if (!unisatInstalled) {
            window.open('https://unisat.io', '_blank')
        } else if (!walletConnected) {
            const result = await unisat.requestAccounts()
            handleAccountsChanged(result)

            toast.info('Your wallet is now connected! 🎉', {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                toastId: 6,
            })

            // @review (syronjs) we need to update the tyron data (otherwise tyron = null) => see dashboard update()
            // In the meantime, reload page
            setTimeout(() => window.location.reload(), 2 * 1000) // 2 seconds
        } else {
            handleConfirm()
        }
    }

    return (
        <>
            {String(expectedOutput) !== '0' && (
                <div className={styles.container}>
                    <div className={styles.info}>
                        <div className={styles.column}>
                            {priceInfo!.input !== '0' &&
                                priceInfo!.output !== '0' && (
                                    <>
                                        {/* <div className={styles.rowLiq}>
                                            <div className={styles.txtRow}>
                                                {pair[0].meta.name} Price
                                            </div>
                                            <div className={styles.txtRow2}>
                                                $
                                                {Number(
                                                    Big(xr!.rate)
                                                ).toLocaleString()}
                                            </div>
                                        </div> */}
                                        <div className={styles.txtRow}>
                                            | Collateral Ratio = 1.5:1
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
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '1rem',
                            cursor: 'pointer',
                            border: '1px solid #ffff32',
                            borderRadius: '14px',
                            backgroundColor: '#a238ff',
                            // @design-shadow-3d
                            backgroundImage:
                                'linear-gradient(to right, #a238ff, #7a28ff)', // Added gradient background
                            boxShadow:
                                '0 0 14px rgba(255, 255, 50, 0.6), inset 0 -3px 7px rgba(0, 0, 0, 0.4)', // Added 3D effect
                        }}
                        className={`button ${
                            disabled ? 'disabled' : 'primary'
                        }`}
                        onClick={
                            handleButtonClick
                            // @review (wallet) - else: connect wallet (see dashboard)
                        }
                        // disabled={disabled}
                    >
                        {!unisatInstalled ? (
                            <div className={styles.txt}>
                                {t('Install UniSat')}
                            </div>
                        ) : !walletConnected ? (
                            <div className={styles.txt}>{t('CONNECT')}</div>
                        ) : disabled ? (
                            <ThreeDots color="yellow" />
                        ) : (
                            // <>
                            //     {btc_wallet != null
                            //         ? 'get su$d'
                            //         : 'connect wallet'}
                            // </>
                            <div className={styles.txt}>continue</div>
                        )}
                    </div>
                    {/* <div onClick={onClose} className={styles.cancel}>
                        Cancel
                    </div> */}
                </div>
            )}
        </>
    )
}
