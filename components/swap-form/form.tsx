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
import React, { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useStore } from 'react-stores'

import { SwapSettings } from './settings'
import { FormInput } from './input'
import { TokenInput } from './token'
import { DexInput } from './dex'
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
import { TokenState } from '../../src/types/token'
import { SwapSettingsModal } from '../Modals/settings'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import ThreeDots from '../Spinner/ThreeDots'

type Prop = {
    startPair: SwapPair[]
}

Big.PE = 999
const dex = new DragonDex()

export const SwapForm: React.FC<Prop> = ({ startPair }) => {
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const [loading, setLoading] = useState(false)

    const { t } = useTranslation(`swap`)

    const tokensStore = useStore($tokens)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const wallet = loginInfo.zilAddr
    const liquidity = useStore($liquidity)
    // const network = useStore($net)

    const [modal0, setModal0] = React.useState(false)
    const [modal1, setModal1] = React.useState(false)
    const [modal3, setModal3] = React.useState(false)
    const [confirmModal, setConfirmModal] = React.useState(false)
    const [info, setInfo] = React.useState(false)

    // const [priceFrom, setPriceFrom] = React.useState(true)

    const [pair, setPair] = React.useState<SwapPair[]>(startPair)

    //@review token price
    // const tokensForPrice = React.useMemo(() => {
    //   if (priceFrom) {
    //     return [pair[0], pair[1]]
    //   } else {
    //     return [pair[1], pair[0]]
    //   }
    // }, [priceFrom, pair])

    const balances = React.useMemo(() => {
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

        if (found0 && found0.balance[String(wallet.base16).toLowerCase()]) {
            balance0 = found0.balance[String(wallet.base16).toLowerCase()]
        }

        if (found1 && found1.balance[String(wallet.base16).toLowerCase()]) {
            balance1 = found1.balance[String(wallet.base16).toLowerCase()]
        }

        return [balance0, balance1]
    }, [pair, tokensStore, wallet])

    const disabled = React.useMemo(() => {
        const amount = Big(pair[0].value)
            .mul(dex.toDecimails(pair[0].meta.decimals))
            .round()
        const isBalance = BigInt(String(amount)) > BigInt(balances[0])
        return (
            Number(pair[0].value) <= 0 ||
            Number(pair[1].value) <= 0 ||
            !wallet?.base16 ||
            isBalance
        )
    }, [pair, wallet, balances])

    const direction = React.useMemo(() => {
        return dex.getDirection(pair)
    }, [pair])

    const gasLimit = React.useMemo(() => {
        return dex.calcGasLimit(direction)
    }, [direction])

    const handleOnSwapForms = React.useCallback(() => {
        setPair(JSON.parse(JSON.stringify(pair.reverse())))
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
            const unLinkedPair = JSON.parse(JSON.stringify(pair))

            unLinkedPair[0].value = String(value)
            unLinkedPair[1].value = dex.getRealPrice(unLinkedPair)

            setPair(unLinkedPair)
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
        },
        [pair]
    )

    React.useEffect(() => {
        if (Number(pair[0].value) > 0) {
            handleOnInput(pair[0].value)
        }
    }, [liquidity, tokensStore])

    return (
        <>
            <SwapSettingsModal show={modal3} onClose={() => setModal3(false)} />
            {confirmModal ? (
                <ConfirmSwapModal
                    show={confirmModal}
                    pair={pair}
                    direction={direction}
                    gasLimit={gasLimit}
                    onClose={() => setConfirmModal(false)}
                />
            ) : null}

            {/* SWAP FROM */}
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
                    <div className={styles.wrapper}>
                        <div className={styles.titleForm}>
                            DECENTRALISED EXCHANGE
                            {/* {t('title')} */}
                            {/* @review {network.net !== 'mainnet' ? (
                                <span>({network.net}) //@review</span>
                            ) : null} */}
                        </div>
                        <SwapSettings onClick={() => setModal3(true)} />
                    </div>
                    <div className={styles.contentWrapper}>
                        <div className={styles.titleForm2}>SWAP FROM:</div>
                        <FormInput
                            value={Big(pair[0].value)}
                            token={pair[0].meta}
                            balance={balances[0]}
                            gasLimit={gasLimit}
                            onSelect={() => setModal0(true)}
                            onInput={handleOnInput}
                            onMax={handleOnInput}
                            onSwap={handleOnSwapForms}
                        />
                    </div>
                    <div className={styles.contentWrapper2}>
                        <div className={styles.titleForm2}>SWAP TO:</div>
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
                        <DexInput
                            value={Big(pair[1].value)}
                            token={pair[1].meta}
                            balance={balances[1]}
                            disabled
                            // onSelect={() => setModal1(true)}
                        />
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
