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
import React, { useEffect } from 'react'
// import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useStore } from 'react-stores'
import Big from 'big.js'
//import { ThreeDots } from 'react-loader-spinner';
import { ImagePair } from '../../pair-img'
import { Modal } from '../../modal'
import { $tokens } from '../../../src/store/tokens'
import { getIconURL } from '../../../src/lib/viewblock'
import classNames from 'classnames'
import { DragonDex } from '../../../src/mixins/dex'
import { TokensMixine } from '../../../src/mixins/token'
import { $wallet } from '../../../src/store/wallet'
//@ssibrowser
import ThreeDots from '../../Spinner/ThreeDots'
import { $dex_option } from '../../../src/store/dex'
import iconS$I from '../../../src/assets/icons/SSI_dollar.svg'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import { useDispatch } from 'react-redux'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import * as tyron from 'tyron'
import { useRouter } from 'next/router'
import { $net } from '../../../src/store/network'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
//@zilpay

type Prop = {
    show: boolean
    amount: Big
    limit: Big
    tokenIndex: number
    hasPool: boolean
    onClose: () => void
    //@ssibrowser
    base_index: number
    only_tyron: boolean
}

const dex = new DragonDex()
const tokensMixin = new TokensMixine()
export var AddPoolPreviewModal: React.FC<Prop> = function ({
    show,
    amount: base_amount,
    limit: limit_amount,
    tokenIndex,
    hasPool,
    onClose,
    //@ssibrowser
    base_index,
    only_tyron,
}) {
    // @review: translates -zilpay.io usa un sistema donde incluye 'common'
    // const common = useTranslation(`common`)
    const tokensStore = useStore($tokens)

    console.log(
        '@ADD-POOL-PREVIEW_TOKENS_STORE: ',
        JSON.stringify(tokensStore.tokens, null, 2)
    )
    const wallet = useStore($wallet)

    const [loading, setLoading] = React.useState(false)
    // const [isAllow, setIsAllow] = React.useState(false)
    // const token0 = React.useMemo(() => {
    //     return tokensStore.tokens[0].meta
    // }, [tokensStore])

    //@ssibrowser
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const Router = useRouter()
    const net = $net.state.net as 'mainnet' | 'testnet'
    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const subdomainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''

    const dexname = useStore($dex_option).dex_name
    const token0 = React.useMemo(() => {
        if (!tokensStore.tokens[base_index]) {
            return
        } else {
            return tokensStore.tokens[base_index].meta
        }
    }, [tokensStore])

    console.log('@add_pool_preview ONLY_TYRON:', only_tyron)
    const [isSSI, setIsSSI] = React.useState(true)
    useEffect(() => {
        setIsSSI(true)
        if (!only_tyron) {
            setIsSSI(false)
        }
    }, [only_tyron])

    const [isDAO, setIsDAO] = React.useState(true)

    useEffect(() => {
        setIsSSI(true)
        setIsDAO(true)
    }, [])
    //@zilpay
    const token1 = React.useMemo(() => {
        if (!tokensStore.tokens[tokenIndex]) {
            return
        } else {
            return tokensStore.tokens[tokenIndex].meta
        }
    }, [tokensStore, tokenIndex])

    const price = React.useMemo(() => {
        if (token1) {
            if (dexname === 'dragondex') {
                return dex.tokensToZil(Big(1), token1)
            } else if (dexname === 'tydradex') {
                //@review: dex tokensToS$i
                return dex.tokensToZil(Big(1), token1)
            }
        }
    }, [token1])

    const handleAddLiquidity = React.useCallback(async () => {
        setLoading(true)
        try {
            const zilpay = await tokensMixin.zilpay.zilpay()

            if (!wallet || !zilpay.wallet.isEnable) {
                await zilpay.wallet.connect()
            }

            // if (!isAllow) {
            //     const owner = String(wallet).toLowerCase()
            //     const balance = tokensStore.tokens[tokenIndex].balance[owner]
            //     await tokensMixin.increaseAllowance(
            //         dex.contract,
            //         token1.base16,
            //         balance
            //     )
            //     setLoading(false)
            //     setIsAllow(true)
            //     return
            // }
            // const zilDecimals = dex.toDecimails(token0.decimals);
            // const tokenDecimails = dex.toDecimails(token1.decimals);
            // const qaAmount = amount.mul(tokenDecimails).round();
            // const qaLimit = limit.mul(zilDecimals).round();

            // await dex.addLiquidity(token1.base16, qaAmount, qaLimit, hasPool);

            //@ssibrowser
            if (token0 && token1) {
                const token0Decimals = dex.toDecimals(token0.decimals)
                const token1Decimals = dex.toDecimals(token1.decimals)

                let min_contribution
                let max_amount
                if (isSSI) {
                    min_contribution = base_amount.mul(token0Decimals!).round()
                    max_amount = limit_amount.mul(token1Decimals!).round()
                } else {
                    min_contribution = base_amount
                        .div(2)
                        .mul(token0Decimals!)
                        .round()
                    max_amount = limit_amount
                        .div(2)
                        .mul(token1Decimals!)
                        .round()
                }
                console.log(
                    '@add_pool_preview min_contribution:',
                    Number(min_contribution)
                )
                console.log(
                    '@add_pool_preview max_amount of tokens:',
                    Number(max_amount)
                )

                if (Number(min_contribution) > 2500e18) {
                    toast.error(
                        'Without a tyronSBT token, this transaction will fail.',
                        {
                            position: 'top-center',
                            autoClose: 2222,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            toastId: 2,
                            theme: 'dark',
                        }
                    )
                    //@review: fetch tyronSBT & disable if token is missing
                }

                await dex
                    .addLiquiditySSI(
                        isSSI,
                        token1.symbol,
                        min_contribution,
                        max_amount,
                        isDAO
                    )
                    .then(async (res) => {
                        console.log(
                            '@add_pool_preview:',
                            JSON.stringify(res, null, 2)
                        )
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        let tx = await tyron.Init.default.transaction(net)
                        tx = await tx.confirm(res.ID, 33)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            setTimeout(() => {
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                            }, 700)
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                        }
                        Router.push(`/${subdomainNavigate}${resolvedDomain}`)
                    })
                    .catch((err) => {
                        throw err
                    })
            } else {
                throw new Error('undefined tokens')
            }
            //@zilpay
            //onClose()
        } catch (err) {
            console.error('@add_pool_preview:', err)
            /////
        }
        setLoading(false)
    }, [
        token0,
        token1,
        base_amount,
        limit_amount,
        onClose,
        // isAllow,
        tokensStore,
        tokenIndex,
        wallet,
        hasPool,
        isSSI,
        isDAO,
    ])

    // const hanldeUpdate = React.useCallback(async () => {
    //     setLoading(true)
    //     try {
    //         const allowances = await tokensMixin.getAllowances(
    //             dex.contract,
    //             token1.base16
    //         )
    //         const tokenDecimails = dex.toDecimals(token1.decimals)
    //         const qaAmount = amount.mul(tokenDecimails).round()
    //         setIsAllow(
    //             tokensMixin.isAllow(String(qaAmount), String(allowances))
    //         )
    //     } catch {
    //         /////
    //     }
    //     setLoading(false)
    // }, [token1, amount])

    // React.useEffect(() => {
    //     if (show) {
    //         hanldeUpdate()
    //     }
    // }, [show])
    const [rewards, setRewards] = React.useState(0)
    const [tydra_rewards, setTydraRewards] = React.useState(0)
    React.useEffect(() => {
        if (show) {
            setRewards(dex.liquidityRewards.dragon)
            setTydraRewards(dex.liquidityRewards.tydra)
        }
    }, [show, tokensStore])

    //@ssibrowser
    let rewards_ = tydra_rewards
    if (dexname !== 'tydradex') {
        rewards_ = rewards
    }
    //@zilpay
    return (
        <Modal
            show={show}
            // width="390px"
            onClose={onClose}
        >
            <div className={styles.containerWrapper}>
                <div className={styles.container}>
                    <div className={styles.title}>Add liquidity</div>

                    {/* @dev: TYRON only */}
                    <div className={styles.toggleWrapper}>
                        {isSSI ? (
                            <div
                                onClick={() => {
                                    setIsSSI(false)
                                }}
                                className={styles.toggleActiveWrapper}
                            >
                                <div className={styles.toggleActiveBall} />
                            </div>
                        ) : (
                            <div
                                onClick={() => {
                                    if (only_tyron) {
                                        const message = t(
                                            'Insufficient balance.'
                                        )

                                        toast.error(message, {
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
                                    } else {
                                        setIsSSI(true)
                                    }
                                }}
                                className={styles.toggleInactiveWrapper}
                            >
                                <div className={styles.toggleInactiveBall} />
                            </div>
                        )}
                        <div className={styles.toggleTxt}>
                            {isSSI ? 'WITH S$I' : 'TYRON ONLY'}
                        </div>
                    </div>
                    {token1 && token0 && (
                        <>
                            <div className={styles.head}>
                                {isSSI ? (
                                    <ImagePair tokens={[token1, token0]} />
                                ) : (
                                    <Image
                                        src={getIconURL(token1.bech32)}
                                        alt={token0!.symbol}
                                        key={token0!.symbol}
                                        height="30"
                                        width="30"
                                    />
                                )}
                                <span>
                                    <h3>{token1?.symbol}</h3>
                                    {isSSI && <h3>+{token0.symbol}</h3>}
                                </span>
                            </div>
                            <div className={styles.info}>
                                <div className={styles.infoitem}>
                                    <span>
                                        <Image
                                            src={getIconURL(token1!.bech32)}
                                            alt={token1.symbol}
                                            key={token1.symbol}
                                            height="30"
                                            width="30"
                                        />
                                        <div className={styles.token}>
                                            {token1?.symbol}
                                        </div>
                                    </span>
                                    <h3>{limit_amount.round(6).toString()}</h3>
                                </div>
                                {isSSI && (
                                    <div className={styles.infoitem}>
                                        <span>
                                            <Image
                                                src={
                                                    token0.symbol === 'S$I'
                                                        ? iconS$I
                                                        : getIconURL(
                                                              token0!.bech32
                                                          )
                                                }
                                                alt={token0.symbol}
                                                key={token0.symbol}
                                                height="30"
                                                width="30"
                                            />
                                            <div className={styles.token}>
                                                {token0!.symbol}
                                            </div>
                                        </span>
                                        <h3>
                                            {base_amount.round(4).toString()}
                                        </h3>
                                    </div>
                                )}
                                <div
                                    className={classNames(
                                        styles.infoitem,
                                        styles.fee
                                    )}
                                >
                                    <div className={styles.txtLiquidityInfo}>
                                        LP rewards per trade
                                    </div>
                                    <div className={styles.txtLiquidityInfo}>
                                        {rewards_}%
                                    </div>
                                </div>

                                {/* @dev: join DAO */}
                                <div className={styles.toggleWrapper}>
                                    {isDAO ? (
                                        <div
                                            onClick={() => {
                                                //if (pair[0].meta.symbol === 'ZIL') {
                                                setIsDAO(false)
                                                // } else {
                                                //     toast(
                                                //         'Currently, it is only possible to use funds from Zilpay in ZIL.'
                                                //     )
                                                // }
                                            }}
                                            className={
                                                styles.toggleActiveWrapper
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.toggleActiveBall
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => {
                                                // if (controller_ === zilpay_addr) {
                                                setIsDAO(true)
                                                // } else {
                                                //     toast(
                                                //         'Use your own defi@account.ssi'
                                                //     )
                                                // }
                                            }}
                                            className={
                                                styles.toggleInactiveWrapper
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.toggleInactiveBall
                                                }
                                            />
                                        </div>
                                    )}
                                    <div className={styles.toggleTxt}>
                                        {isDAO ? 'DAO' : 'LP ONLY'}
                                    </div>
                                </div>
                            </div>
                            {Number(price) > 0 ? (
                                <div className={styles.price}>
                                    <p>Current price</p>
                                    <h3>{price!.toString()}</h3>
                                    <p>
                                        {token0!.symbol} per {token1.symbol}
                                    </p>
                                </div>
                            ) : null}
                        </>
                    )}
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        className={`button ${loading ? 'disabled' : 'primary'}`}
                        onClick={handleAddLiquidity}
                    >
                        {loading ? (
                            <ThreeDots color="yellow" />
                        ) : (
                            // <ThreeDots
                            //   color="var(--primary-color)"
                            //   height={25}
                            //   width={50}
                            // />
                            <>CONFIRM</>
                            // @review: translate
                        )}
                    </div>
                    <div onClick={onClose} className={styles.cancel}>
                        Cancel
                    </div>
                </div>
            </div>
        </Modal>
    )
}
