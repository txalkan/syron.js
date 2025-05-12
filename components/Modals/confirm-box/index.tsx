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
import icoSYRON from '../../../src/assets/icons/ssi_SYRON_iso.png'
import { $xr } from '../../../src/store/xr'
import {
    $btc_wallet,
    $syron,
    $walletConnected,
    updateWalletConnected,
} from '../../../src/store/syron'
import { unisatApi } from '../../../src/utils/unisat/api'
import {
    extractRejectText,
    getStringByteCount,
    stringToBase64,
} from '../../../src/utils/unisat/utils'
import {
    FileStatus,
    InscribeOrderData,
    InscribeOrderStatus,
} from '../../../src/utils/unisat/api-types'
import useICPHook from '../../../src/hooks/useICP'
import { useDispatch } from 'react-redux'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import {
    mempoolTxId,
    mempoolFeeRate,
    transaction_status,
} from '../../../src/utils/unisat/httpUtils'
import refreshIco from '../../../src/assets/icons/refresh.svg'
import Spinner from '../../Spinner'
import { useBTCWalletHook } from '../../../src/hooks/useBTCWallet'
import { useTranslation } from 'next-i18next'

// @deprecated file - to be removed soon

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
    const syron = useStore($syron)

    const [sdb, setSDB] = useState('')
    useEffect(() => {
        if (syron !== null) {
            console.log('Syron', JSON.stringify(syron, null, 2))

            setSDB(syron.sdb)
        }
    }, [syron?.sdb])

    const unisat = (window as any).unisat
    const [unisatInstalled, setUnisatInstalled] = useState(false)
    const btc_wallet = useStore($btc_wallet)
    const walletConnected = useStore($walletConnected).isConnected

    const { updateWallet } = useBTCWalletHook()
    const { getBox, getSUSD, getServiceProviders } = useICPHook()

    const dispatch = useDispatch()
    const { t } = useTranslation()

    const [exactToken, limitToken] = pair
    const exactInput = exactToken.value
    const limitInput = limitToken.value

    // const common = useTranslation(`common`)
    // const swap = useTranslation(`swap`)
    //const settings = useStore($settings)
    // const liquidity = useStore($liquidity)

    const [isLoading, setIsLoading] = React.useState(false)

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
            isLoading /*|| Big(priceInfo!.impact) > 10 */ ||
            (syron == null && walletConnected)
        )
    }, [priceInfo, isLoading, syron])

    // @review (wallet)
    const updateBalance = async () => {
        const [address] = await unisat.getAccounts()
        const balance = await unisat.getBalance()
        const network = await unisat.getNetwork()

        if (balance)
            await updateWallet(address, Number(balance.confirmed), network)

        await getBox(address)

        console.log('Balance updated')
    }

    // @dev 2) Receive Syron
    const mintStablecoin = async (tx_id: string) => {
        // Txn: Inscription to minter
        console.log('Read Transaction', tx_id)

        try {
            // @dev Add inscription info to the Tyron indexer
            const add = await fetch(
                `/api/get-unisat-inscription-info?id=${tx_id + 'i0'}`
            )

            if (!add.ok) {
                throw new Error(`Indexer error! status: 501`)
            }

            const add_data = await add.json()
            console.log(
                'Add transfer inscription to the Tyron indexer: ',
                JSON.stringify(add_data, null, 2)
            )

            await getSUSD(btc_wallet?.btc_addr!, tx_id)

            // @dev Update inscription info in the Tyron indexer
            const update = await fetch(
                `/api/update-unisat-inscription-info?id=${tx_id + 'i0'}`
            )

            if (!update.ok) {
                throw new Error(`Indexer error! status: 502`)
            }

            const update_data = await update.json()
            console.log(
                'Update transfer inscription in the Tyron indexer: ',
                JSON.stringify(update_data, null, 2)
            )

            await updateBalance()
        } catch (error) {
            console.error('mintStablecoin', error)
            throw error
        }
    }

    // const updateBox = async () => {
    //     setIsLoading(true)
    //     try {
    //         await updateSyron().then(async (res) => await updateBalance())
    //     } catch (error) {
    //         console.error(error)
    //     }
    //     setIsLoading(false)
    // }

    const handleConfirm = React.useCallback(async () => {
        setIsLoading(true)
        toast.dismiss(4)

        // @review (asap) transaction status modal not working - see dispatch(setTx
        // dispatch(setTxStatusLoading('true'))
        try {
            // const txId =
            //     'cb85cacdf57976bd8111aca54e07110effc2b60128767dfa3c2e03f9a2065fe3'
            // await fetch(`/api/get-unisat-inscription-info?id=${txId}i0`)
            //     .then(async (response) => {
            //         const res = await response.json()
            //         console.log(
            //             'outcall response',
            //             JSON.stringify(res, null, 2)
            //         )
            //     })
            //     .catch((error) => console.error(error))

            // const id =
            //     'tb1p4w59p7nxggc56lg79v7cwh4c8emtudjrtetgasfy5j3q9r4ug9zsuwhykc'
            // await fetch(`/api/get-unisat-brc20-info?id=${id}`)
            //     .then(async (response) => {
            //         const res = await response.json()
            //         console.log(
            //             'outcall response',
            //             JSON.stringify(res, null, 2)
            //         )
            //     })
            //     .catch((error) => console.error(error))

            // await mintStablecoin(
            //     'aa61e0c3844ed4088bf7eb40f6908d0e0df64c724feef93cdd6476e9440050c2'
            // )

            // @pause
            // use environment variable to pause the minting process
            if (process.env.NEXT_PUBLIC_MINTING_PAUSE === 'true') {
                throw new Error('Minting is paused')
            }

            if (!btc_wallet?.btc_addr) {
                throw new Error(
                    'Please wait for the wallet to connect (ensure it has a balance).'
                )
            }

            if (btc_wallet?.network != 'BITCOIN_MAINNET') {
                console.log('Network:', btc_wallet?.network)
                throw new Error('Use Bitcoin Mainnet')
            }

            const collateral = Math.floor(Number(exactInput))
            if (collateral < 1000)
                throw new Error(
                    'Your BTC deposit is below the minimum required amount of 0.00001 BTC. Please increase your deposit.'
                )

            // collateral cannot be more than 5000 sats
            if (collateral > 30000)
                throw new Error(
                    'Your BTC deposit exceeds the maximum allowed amount of 0.0003 BTC. Please reduce your deposit.'
                )

            toast.info('Submitting your BTC deposit...', {
                autoClose: false,
                closeOnClick: true,
                toastId: 1,
            })
            const tick = 'SYRON' // @brc20
            const amt = Number(limitInput.round(2))

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

            const receiveAddress = process.env.NEXT_PUBLIC_SYRON_MINTER_MAINNET! // the receiver address

            // const inscriptionBalance = 333 // the balance in each inscription
            // const fileCount = 1 // the fileCount
            // const fileSize = 1000 // the total size of all files
            // const contentTypeSize = 100 // the size of contentType

            // @dev The transaction fee rate in sat/vB
            let feeRate = await mempoolFeeRate()
            console.log('Fee Rate', feeRate)

            if (!feeRate) {
                feeRate = 5
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

            let order: InscribeOrderData

            if (sdb === '') {
                throw new Error('SDB Loading Error')
            } else {
                // @dev Transfer Inscription
                order =
                    // await unisatApi.createTransfer({
                    //     receiveAddress,
                    //     feeRate: feeRate || 1, // Assign a default value of 1 if feeRate is undefined
                    //     outputValue: 546,
                    //     devAddress: syron!.sdb,
                    //     devFee: collateral,
                    //     brc20Ticker: tick,
                    //     brc20Amount: String(amt),
                    // })

                    await fetch(
                        `/api/post-unisat-brc20-transfer?receiveAddress=${receiveAddress}&feeRate=${feeRate}&devAddress=${sdb}&devFee=${collateral}&brc20Ticker=${tick}&brc20Amount=${String(
                            amt
                        )}`
                    )
                        .then((response) => response.json())
                        .then((res) => {
                            // console.log(JSON.stringify(res, null, 2))
                            return res.data
                        })
                        .catch((error) => {
                            throw error
                        })
            }

            console.log('Order', JSON.stringify(order, null, 2))

            // const order = await api.orderInfo(orderId)
            // console.log('Order Value', order.amount)
            // console.log('Order ID', order.orderId)

            toast.info(
                "Please don't close this window. This process will finish in about two blocks.",
                {
                    autoClose: false,
                    closeOnClick: false,
                    toastId: 2,
                }
            )

            // @dev 1) Send Bitcoin transaction (#1)
            await unisat
                .sendBitcoin(order.payAddress, order.amount, order.feeRate)
                .then(async (txId) => {
                    console.log('Deposit Transaction ID', txId)
                    // dispatch(setTxId(txId))
                    // dispatch(setTxStatusLoading('submitted'))

                    // @dev 2) Make sure that the Bitcoin transaction (2) is confirmed

                    await transaction_status(txId)
                        .then(async (_res) => {
                            toast.info(
                                'Your Bitcoin deposit has been confirmed.',
                                {
                                    autoClose: false,
                                    closeOnClick: true,
                                    toastId: 3,
                                }
                            )
                            toast.dismiss(1)

                            const order_ = await fetch(
                                `/api/get-unisat-brc20-order?id=${order.orderId}`
                            )
                                .then((response) => response.json())
                                .then((res) => {
                                    // console.log(JSON.stringify(res, null, 2))
                                    return res.data
                                })
                                .catch((error) => {
                                    throw error
                                })

                            console.log(
                                'Order From OrderId',
                                JSON.stringify(order_, null, 2)
                            )
                            const inscription_id = order_.files[0].inscriptionId

                            // @or from
                            // await mempoolTxId(order.payAddress).then(

                            return inscription_id.slice(0, -2)
                        })
                        .then(async (txId2) => {
                            await transaction_status(txId2).then(
                                async (res) => {
                                    await mintStablecoin(txId2)

                                    setIsLoading(false)
                                    toast.dismiss(2)
                                    toast.dismiss(3)

                                    toast.info(
                                        `You have received ${amt} SYRON in your wallet.`,
                                        { autoClose: false }
                                    )
                                    window.open(
                                        `https://unisat.io/brc20?q=${btc_wallet?.btc_addr}&tick=SYRON`
                                    )
                                }
                            )
                        })
                })
        } catch (err) {
            setIsLoading(false)
            console.error('handleConfirm', err)

            toast.dismiss(1)
            toast.dismiss(2)
            // dispatch(setTxStatusLoading('rejected'))

            if (err == 'Error: Coming soon!') {
                toast.info('Coming soon!', { autoClose: 2000 })
            } else if (
                (err as Error).message.includes('SDB Loading Error') //"Cannot read properties of null (reading 'sdb')"
            ) {
                toast.info(
                    'Loading your Safety Deposit ₿ox… Please wait a moment and try again shortly.',
                    { autoClose: 2000 }
                )
            } else if (
                typeof err === 'object' &&
                Object.keys(err!).length !== 0
            ) {
                toast.error(
                    <div className={styles.error}>
                        <p>
                            Your request was rejected. For assistance, please
                            let us know on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
                            </a>
                        </p>

                        <p style={{ color: 'red' }}>
                            {err && (err as Error).message
                                ? (err as Error).message
                                : JSON.stringify(err, null, 2)}
                        </p>
                    </div>,
                    {
                        autoClose: false,
                        toastId: 4,
                    }
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <p>
                            Please let us know about this error on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
                            </a>
                        </p>
                        <p style={{ color: 'red' }}>
                            {extractRejectText(String(err))}
                        </p>
                    </div>,
                    { autoClose: false }
                )
            }
        }
    }, [pair, /*limit,*/ direction /*onClose*/, syron])

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

            toast.info('Your wallet is now connected.', {
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
            // getServiceProviders()

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
                                                            : icoSYRON
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
                                                : icoSYRON
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
                            height: '40px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '1rem',
                            cursor: 'pointer',
                            borderRadius: '22px',
                            backgroundColor: 'rgb(75,0,130)',
                            // @design-shadow-3d
                            backgroundImage:
                                'linear-gradient(to right, rgb(75,0,130), #7a28ff)', // Added gradient background
                            boxShadow:
                                '2px 1px 9px rgba(255, 243, 50, 0.5), inset 0 -2px 5px rgba(248, 248, 248, 0.5)', // Added 3D effect
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
                            <div className={styles.txt}>
                                confirm btc deposit
                            </div>
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
