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

import Big from 'big.js'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useStore } from 'react-stores'

import { SwapSettings } from './settings'
import { FormInput } from './input'
import { TokenInput } from './token'
import { DexOutput } from './dex-output'
// import { PriceInfo } from '../price-info'

import { DragonDex } from '../../src/mixins/dex'

import { $tokens } from '../../src/store/tokens'
import { $liquidity } from '../../src/store/shares'
import { $net } from '../../src/store/network'
import classNames from 'classnames'
import { ZERO_ADDR } from '../../src/config/const'
import { viewAddress } from '../../src/lib/viewblock'

import { SwapPair } from '../../src/types/swap'
//import SwapIcon from '../icons/swap' //@review use of index
import { ConfirmSwapModal } from '../Modals/confirm-swap'
import { TokensModal } from '../Modals/tokens'
import { TokenBalance, TokenState } from '../../src/types/token'
import { SwapSettingsModal } from '../Modals/settings'
import { $wallet } from '../../src/store/wallet'
//@ssibrowser
import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoSend from '../../src/assets/icons/ssi_icon_send.svg'
import Image from 'next/image'
import iconDEX from '../../src/assets/icons/ssi_ToT.svg'
import iconDEXinv from '../../src/assets/icons/ssi_tot_inv.svg'
import { Rates } from '..'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { $doc } from '../../src/store/did-doc'
import { useStore as effectorStore } from 'effector-react'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { toast } from 'react-toastify'
import { TokensMixine } from '../../src/mixins/token'
import { Blockchain } from '../../src/mixins/custom-fetch'
import smartContract from '../../src/utils/smartContract'
import { ZilPayBase } from '../ZilPay/zilpay-base'
import toastTheme from '../../src/hooks/toastTheme'
//@zilpay
type Prop = {
    startPair: SwapPair[]
}

Big.PE = 999
const dex = new DragonDex()
const tokensMixin = new TokensMixine()
const provider = new Blockchain()
const _0 = Big(0)

export const SwapForm: React.FC<Prop> = ({ startPair }) => {
    // const { t } = useTranslation(`swap`)
    const { t } = useTranslation()
    const tokensStore = useStore($tokens)
    const wallet = useStore($wallet)

    const liquidity = useStore($liquidity)
    // const network = useStore($net)

    const [modal0, setModal0] = React.useState(false)
    const [modal1, setModal1] = React.useState(false)
    const [modal3, setModal3] = React.useState(false)
    const [confirmModal, setConfirmModal] = React.useState(false)
    // const [showDex, setShowDex] = React.useState(true)
    // const [info, setInfo] = React.useState(false)

    // const [priceFrom, setPriceFrom] = React.useState(true)

    const [pair, setPair] = React.useState<SwapPair[]>(startPair)

    //@ssibrowser
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const [tydra, setTydra] = React.useState({
        tydradex: _0,
        dragondex: _0,
        zilswap: _0,
        aswap: _0,
    })

    const [selectedDex, setSelectedDex] = React.useState('')

    const resolvedInfo = useStore($resolvedInfo)

    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''

    const [isDEFIx, setIsDEFIx] = React.useState(true)

    useEffect(() => {
        if (
            (resolvedDomain === 'tydradex' || resolvedDomain === 'tyrondex') &&
            pair[0].meta.symbol === 'ZIL'
        ) {
            setIsDEFIx(false)
        }
    }, [pair, tokensStore, wallet])

    const controller_ = effectorStore($doc)?.controller.toLowerCase()

    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const { getSmartContract } = smartContract()
    //@review token price
    // const tokensForPrice = React.useMemo(() => {
    //   if (priceFrom) {
    //     return [pair[0], pair[1]]
    //   } else {
    //     return [pair[1], pair[0]]
    //   }
    // }, [priceFrom, pair])

    // const balances = React.useMemo(() => {
    //     let balance0 = '0';
    //     let balance1 = '0';

    //     if (!wallet) {
    //       return [balance0, balance1];
    //     }

    //     const found0 = tokensStore.tokens.find((t) => t.meta.base16 === pair[0].meta.base16);
    //     const found1 = tokensStore.tokens.find((t) => t.meta.base16 === pair[1].meta.base16);

    //     if (found0 && found0.balance[String(wallet.base16).toLowerCase()]) {
    //       balance0 = found0.balance[String(wallet.base16).toLowerCase()];
    //     }

    //     if (found1 && found1.balance[String(wallet.base16).toLowerCase()]) {
    //       balance1 = found1.balance[String(wallet.base16).toLowerCase()];
    //     }

    //     return [balance0, balance1];
    //   }, [pair, tokensStore, wallet]);

    //@ssibrowser
    const [balances, setGetBalances] = useState(['0', '0'])

    useEffect(() => {
        setGetBalances(['0', '0'])
        async function readBalances() {
            try {
                let balance0 = '0'
                let balance1 = '0'
                if (!wallet) {
                    return [balance0, balance1]
                }
                const found0 = tokensStore.tokens.find(
                    (t) => t.meta.base16 === pair[0].meta.base16
                )
                const found1 = tokensStore.tokens.find(
                    (t) => t.meta.base16 === pair[1].meta.base16
                )

                if (found0 && found1) {
                    let balances_ = [
                        {
                            balance_xwallet: _0,
                            balance_zilpay: _0,
                            full_bal_xwallet: _0,
                            full_bal_zilpay: _0,
                        },
                    ]
                    if (
                        pair[0].meta.symbol === 'ZIL' ||
                        pair[1].meta.symbol === 'ZIL'
                    ) {
                        const balance = await getSmartContract(
                            resolvedInfo?.addr!,
                            '_balance'
                        )
                        const balance_xwallet = Big(balance!.result._balance)

                        const zilpay = new ZilPayBase().zilpay
                        const zilPay = await zilpay()
                        const blockchain = zilPay.blockchain

                        const bal_zilpay = await blockchain.getBalance(
                            zilpay_addr
                        )
                        const balance_zilpay = Big(bal_zilpay.result!.balance)

                        if (pair[0].meta.symbol === 'ZIL') {
                            balances_[0] = {
                                balance_xwallet: balance_xwallet,
                                balance_zilpay: balance_zilpay,
                                full_bal_xwallet: balance_xwallet,
                                full_bal_zilpay: balance_zilpay,
                            }

                            const tokenAddressObject1: TokenBalance = {
                                id: pair[1].meta.symbol,
                                base16: pair[1].meta.base16,
                                balance_xwallet: _0,
                                balance_zilpay: _0,
                                full_bal_xwallet: _0,
                                full_bal_zilpay: _0,
                                decimals: 1e12,
                            }
                            const balance =
                                await provider.fetchBalancesPerTokenAddr(
                                    wallet.base16,
                                    zilpay_addr,
                                    [tokenAddressObject1]
                                )
                            balances_[1] = {
                                balance_xwallet: balance[0].balance_xwallet,
                                balance_zilpay: balance[0].balance_zilpay,
                                full_bal_xwallet: Big(
                                    balance[0].full_bal_xwallet
                                ),
                                full_bal_zilpay: Big(
                                    balance[0].full_bal_zilpay
                                ),
                            }
                        } else {
                            balances_[1] = {
                                balance_xwallet: balance_xwallet,
                                balance_zilpay: balance_zilpay,
                                full_bal_xwallet: balance_xwallet,
                                full_bal_zilpay: balance_zilpay,
                            }
                            const tokenAddressObject0: TokenBalance = {
                                id: pair[0].meta.symbol,
                                base16: pair[0].meta.base16,
                                balance_xwallet: _0,
                                balance_zilpay: _0,
                                full_bal_xwallet: _0,
                                full_bal_zilpay: _0,
                                decimals: 1e12,
                            }
                            const balance =
                                await provider.fetchBalancesPerTokenAddr(
                                    wallet.base16,
                                    zilpay_addr,
                                    [tokenAddressObject0]
                                )
                            balances_[0] = {
                                balance_xwallet: balance[0].balance_xwallet,
                                balance_zilpay: balance[0].balance_zilpay,
                                full_bal_xwallet: Big(
                                    balance[0].full_bal_xwallet
                                ),
                                full_bal_zilpay: Big(
                                    balance[0].full_bal_zilpay
                                ),
                            }
                        }
                    } else {
                        const token_balances: TokenBalance[] = []

                        const tokenAddressObject0: TokenBalance = {
                            id: pair[0].meta.symbol,
                            base16: pair[0].meta.base16,
                            balance_xwallet: _0,
                            balance_zilpay: _0,
                            full_bal_xwallet: _0,
                            full_bal_zilpay: _0,
                            decimals: 1e12,
                        }
                        token_balances.push(tokenAddressObject0)

                        const tokenAddressObject1: TokenBalance = {
                            id: pair[1].meta.symbol,
                            base16: pair[1].meta.base16,
                            balance_xwallet: _0,
                            balance_zilpay: _0,
                            full_bal_xwallet: _0,
                            full_bal_zilpay: _0,
                            decimals: 1e12,
                        }
                        token_balances.push(tokenAddressObject1)

                        balances_ = await provider.fetchBalancesPerTokenAddr(
                            wallet.base16,
                            zilpay_addr,
                            token_balances
                        )
                    }

                    let wallet_bal = 'full_bal_xwallet'
                    if (!isDEFIx) {
                        wallet_bal = 'full_bal_zilpay'
                    }
                    console.log(JSON.stringify(balances_, null, 2))
                    balance0 = String(balances_[0][wallet_bal])
                    balance1 = String(balances_[1][wallet_bal])
                }
                const bal = [balance0, balance1]
                console.log('BALANCES: ', JSON.stringify(bal, null, 2))

                setGetBalances(bal)
            } catch (error) {
                console.error('New Effect Error', error)
            }
        }

        readBalances()
    }, [pair, tokensStore, wallet, isDEFIx, zilpay_addr])

    //@zilpay
    // const disabled = React.useMemo(() => {
    //     const amount = Big(pair[0].value)
    //         .mul(dex.toDecimals(pair[0].meta.decimals))
    //         .round()
    //     const isBalance = BigInt(String(amount)) > BigInt(balances[0])
    //     return (
    //         Number(pair[0].value) <= 0 ||
    //         Number(pair[1].value) <= 0 ||
    //         !wallet?.base16 ||
    //         isBalance
    //     )
    // }, [pair, wallet, balances])

    const direction = React.useMemo(() => {
        return dex.getDirection(pair)
    }, [pair])

    const gasLimit = React.useMemo(() => {
        return dex.calcGasLimit(direction)
    }, [direction])

    const handleOnSwapForms = React.useCallback(() => {
        setPair(JSON.parse(JSON.stringify(pair.reverse())))

        //@ssibrowser
        const unLinkedPair = JSON.parse(JSON.stringify(pair))

        unLinkedPair[0].value = String(0)
        unLinkedPair[1].value = String(0)
        setPair(unLinkedPair)
        setTydra({
            dragondex: _0,
            tydradex: _0,
            zilswap: _0,
            aswap: _0,
        })
    }, [pair])

    const handleSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            setConfirmModal(true)
        },
        []
    )

    const handleOnInput = React.useCallback(
        (value: string | Big) => {
            setConfirmModal(false)
            const unLinkedPair = JSON.parse(JSON.stringify(pair))
            unLinkedPair[0].value = String(value)
            // unLinkedPair[1].value = dex.getRealPrice(unLinkedPair)
            //setPair(unLinkedPair)
            //@ssibrowser
            const tydra = dex.getTydraOutput(unLinkedPair)
            unLinkedPair[1].value = '0' //tydra.dragondex
            console.log('GET_PRICES: ', JSON.stringify(tydra, null, 2))
            if (
                String(tydra.tydradex) !== '0' ||
                String(tydra.dragondex) !== '0' ||
                String(tydra.zilswap) !== '0' ||
                String(tydra.aswap) !== '0'
            ) {
                unLinkedPair[1].value = '11'
            }
            setPair(unLinkedPair)
            setTydra(tydra)
        },
        [pair]
    )

    const handleOnSelectToken = React.useCallback(
        (token: TokenState, index: number) => {
            const unLinkedPair = JSON.parse(JSON.stringify(pair))

            unLinkedPair[1].value = String(0)
            unLinkedPair[0].value = String(0)
            unLinkedPair[index].meta = token
            setPair(unLinkedPair)
            setModal0(false)
            setModal1(false)
            // @ssibrowser: dex
            setTydra({
                dragondex: _0,
                tydradex: _0,
                zilswap: _0,
                aswap: _0,
            })
        },
        [pair]
    )

    //@mainnet-dex
    const onDexSwap = (val) => {
        console.log('DEX_DEFIxWALLET: ', val)
        const update_pair = JSON.parse(JSON.stringify(pair))
        if (val === 'tydradex') {
            update_pair[1].value = tydra.tydradex
        } else if (val === 'dragondex') {
            update_pair[1].value = tydra.dragondex
        } else if (val === 'zilswap') {
            update_pair[1].value = tydra.zilswap
        } else if (val === 'aswap') {
            update_pair[1].value = tydra.aswap
        }
        setPair(update_pair)
        setSelectedDex(val)
        // setShowDex(false)
        setConfirmModal(true)
    }

    useEffect(() => {
        if (Number(pair[0].value) > 0) {
            handleOnInput(pair[0].value)
        }
    }, [liquidity, tokensStore])

    // @review (zilpay)
    // useEffect(() => {
    //     async function checkZilPayConnection() {
    //         await tokensMixin.zilpay
    //             .zilpay()
    //             .then(async (zilpay) => {
    //                 if (!zilpay.wallet.isEnable) {
    //                     await zilpay.wallet.connect()
    //                     toast.info(
    //                         `ZilPay connected: ${(loginInfo?.zilAddr.bech32).slice(
    //                             0,
    //                             11
    //                         )}...`,
    //                         {
    //                             position: 'top-center',
    //                             autoClose: 2222,
    //                             hideProgressBar: false,
    //                             closeOnClick: true,
    //                             pauseOnHover: true,
    //                             draggable: true,
    //                             progress: undefined,
    //                             toastId: 1,
    //                             theme: toastTheme(isLight),
    //                         }
    //                     )
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.error(error)
    //             })
    //     }
    //     checkZilPayConnection()
    // }, [])

    return (
        <>
            <SwapSettingsModal show={modal3} onClose={() => setModal3(false)} />
            <TokensModal
                show={modal0}
                // warn
                // include
                exceptions={pair.map((t) => t.meta.base16)}
                onClose={() => setModal0(false)}
                onSelect={(token) => handleOnSelectToken(token, 0)}
            />
            <TokensModal
                show={modal1}
                include
                // warn
                exceptions={pair.map((t) => t.meta.base16)}
                onClose={() => setModal1(false)}
                onSelect={(token) => handleOnSelectToken(token, 1)}
            />
            {pair.length === 2 ? (
                <form className={styles.container} onSubmit={handleSubmit}>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={iconDEX}
                            alt="dex-icon"
                            height="44"
                            width="44"
                        />
                        <div className={styles.titleForm}>
                            TYRON DECENTRALISED EXCHANGE
                            {/* {t('title')} */}
                            {/* @review {network.net !== 'mainnet' ? (
                                <span>({network.net}) //@review</span>
                            ) : null} */}
                        </div>
                        <Image
                            src={iconDEXinv}
                            alt="dex-icon"
                            height="44"
                            width="44"
                        />
                    </div>
                    <div className={styles.contentWrapper}>
                        <div className={styles.ratesWrapper}>
                            <Rates />
                        </div>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={icoSend}
                                alt="swap-icon"
                                height="22"
                                width="22"
                            />
                            <div className={styles.titleForm2}>swap FROM</div>
                            {isDEFIx ? (
                                <div
                                    onClick={() => {
                                        if (controller_ === zilpay_addr) {
                                            if (pair[0].meta.symbol === 'ZIL') {
                                                setIsDEFIx(false)
                                            } else {
                                                toast.error(
                                                    'Currently, it is only possible to use funds from Zilpay in ZIL.'
                                                )
                                            }
                                        } else {
                                            toast.error(
                                                'Use your own defi@account.ssi',
                                                {
                                                    position: 'bottom-center',
                                                    autoClose: 2222,
                                                    hideProgressBar: false,
                                                    closeOnClick: true,
                                                    pauseOnHover: true,
                                                    draggable: true,
                                                    progress: undefined,
                                                    toastId: 3,
                                                    theme: toastTheme(isLight),
                                                }
                                            )
                                        }
                                    }}
                                    className={styles.toggleActiveWrapper}
                                >
                                    <div className={styles.toggleActiveBall} />
                                </div>
                            ) : (
                                <div
                                    onClick={() => {
                                        if (controller_ === zilpay_addr) {
                                            setIsDEFIx(true)
                                        } else {
                                            toast.error(
                                                'Use your own defi@account.ssi',
                                                {
                                                    position: 'bottom-center',
                                                    autoClose: 2222,
                                                    hideProgressBar: false,
                                                    closeOnClick: true,
                                                    pauseOnHover: true,
                                                    draggable: true,
                                                    progress: undefined,
                                                    toastId: 4,
                                                    theme: toastTheme(isLight),
                                                }
                                            )
                                        }
                                    }}
                                    className={styles.toggleInactiveWrapper}
                                >
                                    <div
                                        className={styles.toggleInactiveBall}
                                    />
                                </div>
                            )}
                            <div className={styles.toggleTxt}>
                                {isDEFIx ? 'DEFIxWALLET' : 'ZilPay'}
                            </div>
                        </div>
                        <FormInput
                            value={Big(pair[0].value)}
                            token={pair[0].meta}
                            balance={balances[0]}
                            gasLimit={gasLimit}
                            onSelect={() => setModal0(true)}
                            onInput={handleOnInput}
                            onMax={handleOnInput}
                            onSwap={handleOnSwapForms}
                            isController={controller_ === zilpay_addr}
                        />
                    </div>
                    <div className={styles.contentWrapper2}>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={icoReceive}
                                alt="swap-icon"
                                height="22"
                                width="22"
                            />
                            <div className={styles.titleForm2}>{t('TO')}</div>
                        </div>
                        <TokenInput
                            //value={Big(pair[1].value)}
                            token={pair[1].meta}
                            //balance={balances[1]}
                            //gasLimit={gasLimit}
                            onSelect={() => setModal1(true)}
                            //onInput={handleOnInput}
                            //onMax={handleOnInput}
                        />
                    </div>
                    <div style={{ width: '100%' }}>
                        {
                            // showDex}
                            pair[1].value !== '0' && (
                                <DexOutput
                                    value={Big(pair[1].value)}
                                    token={pair[1].meta}
                                    balance={balances[1]}
                                    // disabled
                                    //@ssibrowser
                                    tydra={tydra}
                                    onDexSwap={onDexSwap}
                                />
                            )
                        }
                        {confirmModal ? (
                            <>
                                <ConfirmSwapModal
                                    show={confirmModal}
                                    pair={pair}
                                    direction={direction}
                                    gasLimit={gasLimit}
                                    onClose={() => {
                                        setConfirmModal(false) //, setShowDex(true) //@review: ASAP
                                    }}
                                    //@ssibrowser
                                    selectedDex={selectedDex}
                                    isDEFIx={isDEFIx}
                                />
                                <div className={styles.wrapperSettings}>
                                    <span className={styles.settings}>
                                        settings
                                    </span>
                                    <SwapSettings
                                        onClick={() => setModal3(true)}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                    {/* <SwapIcon onClick={handleOnSwapForms} /> */}
                    {/* <FormInput
                        value={Big(pair[1].value)}
                        token={pair[1].meta}
                        balance={balances[1]}
                        disabled
                        onSelect={() => setModal1(true)}
                    /> */}
                    {/* <PriceInfo
                        tokens={tokensForPrice}
                        onClick={() => setPriceFrom(!priceFrom)}
                        onShow={() => setInfo(!info)}
                    /> */}
                    {/* <ul
            className={classNames(styles.info, {
              show: info,
            })}
          >
            <p>dd{t('info.warn')}</p>
            <li>
              {t('info.verify')}{' '}
              {pair
                .filter((t) => t.meta.base16 !== ZERO_ADDR)
                .map((token) => (
                  <a
                    key={token.meta.base16}
                    href={viewAddress(token.meta.bech32)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {token.meta.symbol}{' '}
                  </a>
                ))}
            </li>
          </ul> */}
                    {/* <button disabled={Boolean(disabled)}>
            {t('buttons.exchange')}
          </button> */}
                </form>
            ) : null}
        </>
    )
}
