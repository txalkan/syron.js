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
import React from 'react'
// import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import { useStore } from 'react-stores'
import Big from 'big.js'
//import { ThreeDots } from 'react-loader-spinner';
import { ImagePair } from '../../pair-img'
import { Modal, ModalHeader } from '../../modal'
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
    const dexname = useStore($dex_option).dex_name
    const token0 = React.useMemo(() => {
        return tokensStore.tokens[base_index].meta
    }, [tokensStore])
    //@zilpay
    const token1 = React.useMemo(() => {
        return tokensStore.tokens[tokenIndex].meta
    }, [tokensStore, tokenIndex])

    const price = React.useMemo(() => {
        if (dexname === 'dragondex') {
            return dex.tokensToZil(Big(1), token1)
        } else if (dexname === 'tydradex') {
            //@review: dex tokensToS$i
            return dex.tokensToZil(Big(1), token1)
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
            const token0Decimals = dex.toDecimals(token0.decimals)
            const token1Decimals = dex.toDecimals(token1.decimals)
            const min_contribution = base_amount.mul(token0Decimals).round()
            const max_amount = limit_amount.mul(token1Decimals).round()

            await dex.addLiquiditySSI(
                token1.symbol,
                min_contribution,
                max_amount
            )
            //---
            onClose()
        } catch (err) {
            console.error('@add_pool_preview', err)
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
            setRewards(dex.liquidityRewards.tydra)
        }
    }, [show, tokensStore])

    //@ssibrowser
    let rewards_ = tydra_rewards
    if (dexname !== 'tydradex') {
        rewards_ = rewards
    }
    //@zilpay
    return (
        <>
            <Modal
                show={show}
                // width="390px"
                onClose={onClose}
            >
                <div className={styles.containerWrapper}>
                    <div className={styles.container}>
                        <div className={styles.title}>Add liquidity</div>
                        <div className={styles.head}>
                            <ImagePair tokens={[token0, token1]} />
                            <span>
                                <h3>{token1.symbol}</h3>
                                <h3>/</h3>
                                <h3>{token0.symbol}</h3>
                            </span>
                        </div>
                        <div className={styles.info}>
                            <div className={styles.infoitem}>
                                <span>
                                    <Image
                                        src={getIconURL(token1.bech32)}
                                        alt={token1.symbol}
                                        key={token1.symbol}
                                        height="30"
                                        width="30"
                                    />
                                    <div className={styles.token}>
                                        {token1.symbol}
                                    </div>
                                </span>
                                <h3>{limit_amount.round(6).toString()}</h3>
                            </div>
                            <div className={styles.infoitem}>
                                <span>
                                    <Image
                                        src={
                                            token0.symbol === 'S$I'
                                                ? iconS$I
                                                : getIconURL(token0.bech32)
                                        }
                                        alt={token0.symbol}
                                        key={token0.symbol}
                                        height="30"
                                        width="30"
                                    />
                                    <div className={styles.token}>
                                        {token0.symbol}
                                    </div>
                                </span>
                                <h3>{base_amount.round(4).toString()}</h3>
                            </div>
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
                                    {rewards}%
                                </div>
                            </div>
                        </div>
                        {Number(price) > 0 ? (
                            <div className={styles.price}>
                                <p>Current price</p>
                                <h3>{price.toString()}</h3>
                                <p>
                                    {token0.symbol} per {token1.symbol}
                                </p>
                            </div>
                        ) : null}
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            className={`button ${
                                loading ? 'disabled' : 'primary'
                            }`}
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

            {/* @v2: chatgpt */}
            {/* <Modal show={show} onClose={onClose}>
                <div className={styles.container}>
                    <h2 className={styles.txtTitle}>Add Liquidity</h2>

                    <div className={styles.tokenPair}>
                        <ImagePair tokens={[token0, token1]} />
                        <span className={styles.tokenPairSymbols}>
                            {token1.symbol} / {token0.symbol}
                        </span>
                    </div>

                    <div className={styles.info}>
                        <div className={styles.infoitem}>
                            <Image src={getIconURL(token1.bech32)} alt={token1.symbol} />
                            <h3>{limit_amount.round(6).toString()}</h3>
                        </div>
                        <div className={styles.infoitem}>
                            <Image src={getIconURL(token0.bech32)} alt={token0.symbol} />
                            <h3>{base_amount.round(4).toString()}</h3>
                        </div>
                    </div>
                    {Number(price) > 0 && (
                        <div className={styles.price}>
                            <p>Current Price</p>
                            <h3>{price.toString()}</h3>
                            <p>{`${token0.symbol} per ${token1.symbol}`}</p>
                        </div>
                    )}

                    <div className={styles.confirmButton} onClick={handleAddLiquidity}>
                        {loading ? <ThreeDots color="yellow" /> : <span>CONFIRM</span>}
                    </div>
                </div>
            </Modal> */}
        </>
    )
}
