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
import { useStore } from 'react-stores'
import React from 'react'
import Big from 'big.js'
// import { useTranslation } from 'next-i18next'
import classNames from 'classnames'
// import Link from 'next/link'
import { FormInput, SwapSettings } from '../../swap-form'
import { TokensModal } from '../../Modals/tokens'
import { BackIcon } from '../../icons/back'
import { $tokens } from '../../../src/store/tokens'
import { DragonDex } from '../../../src/mixins/dex'
import { ZERO_ADDR } from '../../../src/config/const'
import { AddPoolPreviewModal } from '../../Modals/add-pool-preview'
import { SwapSettingsModal } from '../../Modals/settings'
import { $liquidity, $tyron_liquidity } from '../../../src/store/shares'
import { Token, TokenState } from '../../../src/types/token'
import { $wallet } from '../../../src/store/wallet'
// @ssibrowser
import { Share, FiledBalances } from '../../../src/types/zilliqa'
// import {
//     s$i_tokenState,
//     tyron_tokenState,
// } from '../../../src/constants/tokens-states'
import { $dex_option } from '../../../src/store/dex'
import iconDrop from '../../../src/assets/icons/ssi_icon_drop.svg'
import Image from 'next/image'
import iconTYRON from '../../../src/assets/icons/ssi_token_Tyron.svg'
import InfoDefaultReg from '../../../src/assets/icons/info_default.svg'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'

//@zilpay

// type Prop = {
//     index: number
// }

const dex = new DragonDex()
// export const AddPoolForm: React.FC<Prop> = ({ index }) => {
export function AddPoolForm() {
    // const pool = useTranslation(`pool`)
    // const tokensStore = useStore($tokens) //dragondex store
    //const liquidity = useStore($liquidity)
    const wallet = useStore($wallet)

    //@ssibrowser
    const { t } = useTranslation()

    // const tyron_init: Token = {
    //     balance: {
    //         [wallet?.base16!]: '0',
    //     },
    //     meta: tyron_tokenState,
    // }
    // const s$i_init: Token = {
    //     balance: {
    //         [wallet?.base16!]: '0',
    //     },
    //     meta: s$i_tokenState,
    // }
    // let tokensStore: { tokens: Token[] } = { tokens: [s$i_init, tyron_init] }
    let liquidity: any = useStore($tyron_liquidity)
    // { pools: any; shares?: Share; balances?: FiledBalances } = {
    //     pools: {},
    //     shares: {},
    // }
    const dexname = useStore($dex_option).dex_name
    console.log('@ADD-POOL_DEX_NAME: ', dexname)
    let base_index = 0
    let pair_index = 1

    const tokensStore = useStore($tokens)
    const dragon_liquidity = useStore($liquidity)
    if (dexname !== 'tydradex') {
        if (dexname === 'dragondex') {
            liquidity = dragon_liquidity
        }
    } else {
        base_index = tokensStore.tokens.length - 1 //S$I
        pair_index = tokensStore.tokens.length - 2 //TYRON
    }
    //console.log('@ADD-POOL_TOKENS: ', JSON.stringify(tokensStore, null, 2))
    //console.log('@ADD-POOL_LIQUIDITY: ', JSON.stringify(liquidity, null, 2))

    //@payzil
    const [pair_amount, setAmount] = React.useState(Big(0))
    const [base_amount, setLimitAmount] = React.useState(Big(0))

    //@dev: token_index refers to the token to be added
    const [token_index, setToken] = React.useState(pair_index)

    const [tokensModal, setTokensModal] = React.useState(false)
    const [previewModal, setPreviewModal] = React.useState(false)
    const [settingsModal, setSettingsModal] = React.useState(false)

    //@review
    // const tokenBalance = React.useMemo(() => {
    //     let balance = '0'
    //     const owner = String(wallet?.base16).toLowerCase()

    //     if (
    //         tokensStore.tokens[token] &&
    //         tokensStore.tokens[token].balance[owner]
    //     ) {
    //         balance = tokensStore.tokens[token].balance[owner]
    //     }

    //     return Big(balance)
    // }, [wallet, tokensStore, token])

    const exceptions = React.useMemo(() => {
        try {
            if (dexname === 'tydradex') {
                const array = tokensStore.tokens.map(
                    (element) => element.meta.base16
                )
                return array
            } else {
                return [ZERO_ADDR, tokensStore.tokens[token_index].meta.base16]
            }
        } catch (error) {
            console.error('exceptions', error)
        }
    }, [tokensStore, token_index])

    const hasPool = React.useMemo(() => {
        try {
            if (dexname === 'dragondex') {
                return Boolean(
                    liquidity.pools[tokensStore.tokens[token_index].meta.base16]
                )
            } else if (dexname === 'tydradex') {
                return Boolean(liquidity.reserves['tyron_s$i'])
            } else {
                return false
            }
        } catch (error) {
            console.error('hasPool', error)
            return false
        }
    }, [liquidity, tokensStore, token_index])

    // const disabled = React.useMemo(() => {
    //     try {
    //         const decimals = dex.toDecimals(
    //             tokensStore.tokens[token].meta.decimals
    //         )
    //         const qa = amount.mul(decimals)
    //         let isLess = false

    //         if (!hasPool) {
    //             const zilDecimals = dex.toDecimals(
    //                 tokensStore.tokens[0].meta.decimals
    //             )
    //             isLess =
    //                 BigInt(String(limitAmount.mul(zilDecimals).round())) <
    //                 dex.lp
    //         }

    //         return Number(amount) === 0 || tokenBalance.lt(qa) || isLess
    //     } catch (error) {
    //         console.error(error)
    //     }
    // }, [tokenBalance, amount, limitAmount, tokensStore, token, hasPool])

    const hanldeSelectToken0 = React.useCallback(
        (t: TokenState) => {
            const foundIndex = tokensStore.tokens.findIndex(
                (p) => p.meta.base16 === t.base16
            )

            if (foundIndex >= 0 && t.base16 !== ZERO_ADDR) {
                setToken(foundIndex)
                setTokensModal(false)
            }
        },
        [tokensStore]
    )

    const handleSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            setPreviewModal(true)
        },
        []
    )

    // React.useEffect(() => {
    //     try {
    //         const tokenMeta = tokensStore.tokens[token_index].meta
    //             const pool = liquidity.pools[tokenMeta.base16]

    //             if (pool && pool.length >= 2) {
    //                 setLimitAmount(
    //                     dex.calcVirtualAmount(pair_amount, tokenMeta, pool)
    //                 )
    //             }
    //     } catch (error) {
    //         console.error('@ADD-POOL_effect:', String(error))
    //     }
    // }, [pair_amount, token_index, liquidity, tokensStore])

    //@ssibrowser
    React.useEffect(() => {
        try {
            const tokenMeta = tokensStore.tokens[token_index].meta
            console.log(
                '@ADD-POOL_SELECTED_TOKEN',
                JSON.stringify(tokenMeta, null, 2)
            )

            let pool
            if (dexname === 'dragondex') {
                pool = liquidity.pools[tokenMeta.base16]
            } else if (dexname === 'tydradex') {
                pool = liquidity.reserves['tyron_s$i']
            }
            console.log('POOLS', JSON.stringify(pool, null, 2))
            if (pool && pool.length >= 2) {
                const base_amt = dex.calcVirtualAmount_(
                    pair_amount,
                    tokenMeta,
                    pool,
                    dexname
                )
                console.log('BASE_AMT:', base_amt)
                setLimitAmount(base_amt)
            }
        } catch (error) {
            console.error('@ADD-POOL_effect:', String(error))
        }
    }, [pair_amount, token_index, liquidity, tokensStore])

    //@review: use effect for multidex/multitoken
    let token_base
    let balance_base
    let token_pair
    let balance_pair

    //@review: consider adding memo
    try {
        token_pair = tokensStore.tokens[token_index]?.meta
        balance_pair =
            tokensStore.tokens[token_index].balance[
                String(wallet?.base16).toLowerCase()
            ]
        token_base = tokensStore.tokens[base_index].meta

        balance_base =
            tokensStore.tokens[base_index].balance[
                String(wallet?.base16).toLowerCase()
            ]
        if (!balance_base) {
            balance_base = 0
        }
        console.log('BAL:', balance_pair, balance_base)
    } catch (error) {
        console.error(error)
    }

    const onlyTyron = React.useMemo(() => {
        try {
            const base_decimals = dex.toDecimals(token_base.decimals)
            const balance = Number(balance_base)
            const input = Number(base_amount.mul(base_decimals!))
            console.log('BASE_BALANCE:', balance, input)

            if (balance < input) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.error('onlyTyron', error)
            return false
        }
    }, [previewModal])

    return (
        <>
            <SwapSettingsModal
                show={settingsModal}
                onClose={() => setSettingsModal(false)}
            />
            <TokensModal
                show={tokensModal}
                exceptions={exceptions}
                warn
                include
                onClose={() => setTokensModal(false)}
                onSelect={hanldeSelectToken0}
            />
            <AddPoolPreviewModal
                show={previewModal}
                amount={base_amount}
                limit={pair_amount}
                tokenIndex={token_index}
                hasPool={hasPool}
                onClose={() => setPreviewModal(false)}
                // @ssibrowser
                base_index={base_index}
                only_tyron={onlyTyron}
            />
            <form className={styles.container} onSubmit={handleSubmit}>
                <div className={styles.rowTitle}>
                    <div className={styles.icoWrapper}>
                        <Image src={iconDrop} alt="add-liq" />
                        <div className={styles.txtTitle}>add liquidity</div>
                    </div>
                    <SwapSettings onClick={() => setSettingsModal(true)} />
                </div>
                <div
                    className={classNames(styles.row, {
                        border: true,
                    })}
                >
                    <div className={styles.column}>
                        <div className={styles.subtitle}>
                            <span className={styles.tooltip}>
                                <div className={styles.ico}>
                                    <div className={styles.icoDefault}>
                                        <Image
                                            alt="warning-ico"
                                            src={InfoDefaultReg}
                                            width={20}
                                            height={20}
                                        />
                                    </div>
                                    {/* <div
                                                                className={
                                                                    styles.icoColor
                                                                }
                                                            >
                                                                <Image
                                                                    alt="warning-ico"
                                                                    src={
                                                                        Warning
                                                                    }
                                                                    width={20}
                                                                    height={20}
                                                                />
                                                            </div> */}
                                </div>
                                <span className={styles.tooltiptext}>
                                    <h5 className={styles.modalInfoTitle}>
                                        INFO
                                    </h5>
                                    <div
                                        style={{
                                            fontSize: '12px',
                                        }}
                                    >
                                        If you are unable to select a token, it
                                        may not be currently supported.
                                    </div>
                                </span>
                            </span>
                            <span className={styles.txtSubtitle}>
                                Choose token & amount:
                            </span>
                        </div>
                        <FormInput
                            value={pair_amount}
                            token={token_pair}
                            // token={tokensStore.tokens[token]?.meta}
                            balance={balance_pair}
                            // balance={
                            //     tokensStore.tokens[token].balance[
                            //     String(wallet?.base16).toLowerCase()
                            //     ]
                            // }
                            onSelect={() => setTokensModal(true)}
                            onInput={setAmount}
                            onMax={setAmount}
                            // @ssibrowser
                            noSwap={true}
                            isController={true}
                            // @ssibrowser -end-
                        />
                        <FormInput
                            value={base_amount}
                            token={token_base}
                            balance={balance_base}
                            // token={tokensStore.tokens[base_index].meta}
                            // balance={
                            //     tokensStore.tokens[base_index].balance[
                            //     String(wallet).toLowerCase()
                            //     ]
                            // }
                            disabled={hasPool}
                            onInput={setLimitAmount}
                            onMax={setLimitAmount}
                            // @ssibrowser
                            noSwap={true}
                            isController={true}
                            //@ssibrowser -end-
                        />
                    </div>
                </div>
                <div
                    onClick={() =>
                        //toast('Incoming!')
                        {
                            const decimals = dex.toDecimals(token_pair.decimals)
                            if (String(pair_amount) === '0') {
                                toast.error(t('The amount cannot be zero.'), {
                                    position: 'top-center',
                                    autoClose: 2222,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    toastId: 1,
                                    theme: 'dark',
                                })
                            } else if (
                                !balance_pair ||
                                Number(balance_pair) <
                                    Number(pair_amount.mul(decimals!))
                            ) {
                                toast.error(t('Insufficient balance.'), {
                                    position: 'top-center',
                                    autoClose: 2222,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    toastId: 2,
                                    theme: 'dark',
                                })
                            } else {
                                setPreviewModal(true)
                            }
                        }
                    }
                    className={styles.btnWrapper}
                >
                    <div className="button secondary">PREVIEW</div>
                </div>
                <div className={styles.poweredby}>
                    <span className={styles.tyronsr}>secured by</span>
                    <Image
                        src={iconTYRON}
                        alt="tyron-sr"
                        height={22}
                        width={22}
                    />
                    <span className={styles.tyronsr}>social recovery</span>
                </div>
            </form>
        </>
    )
}
