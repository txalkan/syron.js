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

import type {
    DexPool,
    FieldTotalContributions,
    FiledBalances,
    FiledPools,
    Share,
} from '../types/zilliqa'
import type { SwapPair } from '../types/swap'

import Big from 'big.js'

import { Blockchain } from './custom-fetch'
import { ZilPayBase } from './zilpay-base'

import { $tokens, /*addToken,*/ updateStoreTokens } from '../store/tokens'

import { toHex } from '../lib/to-hex'
import { formatNumber } from '../filters/n-format'
import { addTransactions } from '../store/transactions'
import { SHARE_PERCENT, ZERO_ADDR } from '../config/const'
import {
    $aswap_liquidity,
    $liquidity,
    $tyron_liquidity,
    $zilswap_liquidity,
    updateASwapBalances,
    updateASwapLiquidity,
    updateDexBalances,
    updateLiquidity,
    updateTyronBalances,
    updateTyronLiquidity,
    updateZilSwapBalances,
    updateZilSwapLiquidity,
} from '../store/shares'
import { $wallet } from '../store/wallet'
import { $settings } from '../store/settings'
import { Token, TokenState } from '../types/token'
import { $net } from '../store/network'
import { $dex, $dex_option } from '../store/dex'
// ssibrowser ---
import { $resolvedInfo } from '../store/resolvedInfo'
import * as tyron from 'tyron'
import { dex_options, dex_symbols } from '../constants/dex-options'
import { s$i_tokenState, tyron_tokenState } from '../constants/tokens-states'
import { filterTokensBySymbol } from '../lib/dex-filter'
import { useDispatch } from 'react-redux'
import { setTxId, setTxStatusLoading } from '../app/actions'
import { updateModalTx, updateModalTxMinimized } from '../store/modal'
//---

Big.PE = 999

export enum SwapDirection {
    ZilToToken,
    TokenToZil,
    TokenToTokens,
    DEFIxTokensForTokens,
    TydraDeFi,
    TydraDEX,
}

const CONTRACTS: {
    [net: string]: string
} = {
    mainnet: '0x30dfe64740ed459ea115b517bd737bbadf21b838',
    testnet: '0xb0c677b5ba660925a8f1d5d9687d0c2c379e16ee',
    private: '',
}

//@ssibrowser
//@dex-mainnet-dao
const tyron_s$i_CONTRACTS: {
    [net: string]: string
} = {
    mainnet: '0x0EF2fbDd5A47B2a750829Da7795b1997274cBd26', //v1.2.2
    //'0x3ac775dad6c2622ea853be5b937cf74ae126b794', //v1.2.1
    //'0xBf803DA34a591E2aD99a91B79015a4662Cf7AC8A', //v1.2
    //'0x85302ABe13dF3338cCB6C35Cfc46aA770D36a21B' v1.1, //'0x691dec1ac04f55abbbf5ebd3aaf3217400d5c689',
    testnet: '0x3cDf2c601D27a742DaB0CE6ee2fF129E78C2d3c2',
    private: '',
}

const zilswap_CONTRACTS: {
    [net: string]: string
} = {
    mainnet: '0x459cb2d3baf7e61cfbd5fe362f289ae92b2babb0', //@zilswap
    testnet: '',
    private: '',
}

const avely_CONTRACTS: {
    [net: string]: string
} = {
    mainnet: '0xe1922b5665ca54b8a6b8a9625ff1bf606352f1c0', //@avely
    testnet: '',
    private: '',
}

export class DragonDex {
    // public static REWARDS_DECIMALS = BigInt('100000000000')
    public static FEE_DEMON = BigInt('10000')

    private _provider = new Blockchain()

    public zilpay = new ZilPayBase()

    public get lp() {
        return $dex.state.lp
    }

    public get fee() {
        return $dex.state.fee
    }

    public get rewarded() {
        return $dex.state.rewardsPool
    }

    public get protoFee() {
        return $dex.state.protoFee
    }

    public get wallet() {
        return $wallet.state
    }

    //ssibrowser
    public get dex() {
        return $dex_option.state
    }
    public get tyron_s$i_contract() {
        return tyron_s$i_CONTRACTS[$net.state.net]
    }
    public get domain() {
        const resolvedInfo = $resolvedInfo.state
        const resolvedDomain =
            resolvedInfo?.user_domain! && resolvedInfo.user_domain
                ? resolvedInfo.user_domain
                : ''
        return resolvedDomain
    }
    public get zilswap_contract() {
        return zilswap_CONTRACTS[$net.state.net]
    }
    public get avely_contract() {
        return avely_CONTRACTS[$net.state.net]
    }

    public get tyronProfitDenom() {
        return $dex.state.tyronProfitDenom
    }

    public get net() {
        return $net.state
    }
    public get zilswapFee() {
        return $dex.state.zilswapFee
    }
    public get aswapFee() {
        return $dex.state.aswapFee
    }
    public get aswapProtoFee() {
        return $dex.state.aswapProtoFee
    }
    //@zilpay
    public get contract() {
        return CONTRACTS[$net.state.net]
    }

    public get pools() {
        return $liquidity.state.pools
    }

    //@ssibrowser
    public get tyron_reserves() {
        return $tyron_liquidity.state.reserves
    }

    public get tokens() {
        return $tokens.state.tokens
    }

    public get liquidityRewards() {
        const demon = Number(DragonDex.FEE_DEMON)
        let dragon_rw = ((demon - Number(this.fee)) / demon) * 100
        let tydra_rw = ((demon - Number(this.tyronProfitDenom)) / demon) * 100
        return {
            dragon: dragon_rw,
            tydra: tydra_rw,
        }
    }
    public get getZilSwapPools() {
        return $zilswap_liquidity.state.pools
    }
    public get getASwapPools() {
        return $aswap_liquidity.state.pools
    }

    public async updateState() {
        //@ssibrowser
        const tyrons$i_contract = toHex(this.tyron_s$i_contract)
        const zilswap_contract = toHex(this.zilswap_contract)
        const avely_contract = toHex(this.avely_contract)
        //@zilpay
        const dragondex_contract = toHex(this.contract)
        const owner = String(this.wallet?.base16).toLowerCase()
        // const {
        //     pools,
        //     balances,
        //     totalContributions,
        //     protocolFee,
        //     liquidityFee,
        //     rewardsPool,
        // } = await this._provider.fetchFullState(contract, owner)
        //@ssibrowser
        const domainId =
            '0x' + (await tyron.Util.default.HashString(this.domain))

        console.log('UPDATE STATE FOR:')
        console.log('WALLET_', owner)

        console.log('DOMAIN_', domainId)
        const {
            balances,
            totalContributions,
            pools,
            liquidityFee,
            protocolFee,
            rewardsPool,
            tyron_balances,
            tyron_dao_shares,
            tyron_contributions,
            tyron_dao_balance,
            tyron_shares_supply,
            tyron_reserves,
            tyron_profit_denom,
            //@review: NEW DEX
            zilSwapBalances,
            zilSwapTotalContributions,
            zilSwapPools,
            zilSwapLiquidityFee,
            aSwapBalances,
            aSwapTotalContributions,
            aSwapPools,
            aSwapLiquidityFee,
            aSwapProtocolFee,
        } = await this._provider.tyron_fetchFullState(
            tyrons$i_contract,
            dragondex_contract,
            zilswap_contract,
            avely_contract,
            owner,
            domainId
        )
        //@zilpay
        const shares = this._getShares(balances, totalContributions, owner)
        const dexPools = this._getPools(pools)
        // console.log('DRAGONDEX_POOLS: ', JSON.stringify(dexPools, null, 2))
        $dex.setState({
            rewardsPool,
            fee: BigInt(liquidityFee),
            protoFee: BigInt(protocolFee),
            lp: $dex.state.lp,
            tyronProfitDenom: BigInt(tyron_profit_denom),
            //@review: NEW DEX
            zilswapFee: BigInt(zilSwapLiquidityFee),
            aswapFee: BigInt(aSwapLiquidityFee),
            aswapProtoFee: BigInt(aSwapProtocolFee),
        })
        updateDexBalances(balances)
        updateLiquidity(shares, dexPools)
        //@ssibrowser
        //@tyronS$I
        const tyron_shares = this._getTyronLPs(
            tyron_balances,
            tyron_contributions,
            owner
        )
        const tyron_dao_balances = this._getTyronS$IBalances(
            tyron_dao_shares,
            tyron_dao_balance,
            tyron_shares_supply,
            domainId
        )

        const tyronReserves = this._getTyronReserves(tyron_reserves)
        // console.log('TYRONS$I_POOLS: ', JSON.stringify(tyronReserves, null, 2))
        updateTyronBalances(tyron_balances)
        updateTyronLiquidity(
            tyronReserves,
            tyron_shares,
            String(tyron_dao_balance),
            tyron_dao_balances
        )
        //@zilswap
        const zilswap_pools = this._getPools(zilSwapPools)
        // console.log('ZILSWAP_POOLS: ', JSON.stringify(zilswap_pools, null, 2))
        updateZilSwapBalances(zilSwapBalances)
        updateZilSwapLiquidity(zilswap_pools)
        //@avely
        const aswap_pools = this._getPools(aSwapPools)
        // console.log('ASWAP_POOLS: ', JSON.stringify(aswap_pools, null, 2))
        updateASwapBalances(aSwapBalances)
        updateASwapLiquidity(aswap_pools)
    }

    public async updateTokens() {
        let owner = this.wallet?.base16!
        owner = owner.toLowerCase()
        //ssibrowser ---
        const tyron_token: Token = {
            balance: {
                [owner]: '0',
            },
            meta: tyron_tokenState,
        }

        const ssi_token: Token = {
            balance: {
                [owner]: '0',
            },
            meta: s$i_tokenState,
        }
        const filteredTokens = filterTokensBySymbol(
            $tokens.state.tokens,
            dex_symbols
        )

        const tokens = [...filteredTokens, tyron_token, ssi_token]
        //@zilpay
        const newTokens = await this._provider.fetchTokensBalances(
            owner,
            tokens // $tokens.state.tokens
        )
        updateStoreTokens(newTokens)
    }

    // public async addCustomToken(token: string, owner: string) {
    //     const { meta, balances } = await this._provider.getToken(token, owner)
    //     const zp = await this.zilpay.zilpay()
    //     addToken({
    //         meta: {
    //             base16: meta.address,
    //             bech32: zp.crypto.toBech32Address(meta.address),
    //             symbol: meta.symbol,
    //             name: meta.name,
    //             decimals: meta.decimals,
    //             scope: 0,
    //         },
    //         balance: balances,
    //     })
    // }

    // public getRealPrice(pair: SwapPair[]) {
    //     const [exactToken, limitToken] = pair
    //     const exact = this._valueToBigInt(exactToken.value, exactToken.meta)
    //     let value = BigInt(0)
    //     const cashback =
    //         limitToken.meta.base16 !== this.rewarded &&
    //         exactToken.meta.base16 !== this.rewarded

    //     //@ssibrowser
    //     if (limitToken.meta.symbol === 'TYRON') {
    //         if (exactToken.meta.symbol === 'S$I') {
    //             value = this._ssiToTyron(
    //                 exact,
    //                 this.tyron_reserves['tyron_s$i']
    //             )
    //         }
    //     } else {
    //         //@zilpay
    //         if (
    //             //@dev: SwapExactZILForTokens
    //             exactToken.meta.base16 === ZERO_ADDR &&
    //             limitToken.meta.base16 !== ZERO_ADDR
    //         ) {
    //             value = this._zilToTokens(
    //                 exact,
    //                 this.pools[limitToken.meta.base16],
    //                 cashback
    //             )
    //         } else if (
    //             //@dev: SwapExactTokensForZIL
    //             exactToken.meta.base16 !== ZERO_ADDR &&
    //             limitToken.meta.base16 === ZERO_ADDR
    //         ) {
    //             value = this._tokensToZil(
    //                 exact,
    //                 this.pools[exactToken.meta.base16],
    //                 cashback
    //             )
    //         } else {
    //             //@dev: SwapExactTokensForTokens
    //             value = this._tokensToTokens(
    //                 exact,
    //                 this.pools[exactToken.meta.base16],
    //                 this.pools[limitToken.meta.base16],
    //                 cashback
    //             )
    //         }
    //     }
    //     return Big(String(value)).div(this.toDecimals(limitToken.meta.decimals))
    // }

    //@ssibrowser
    //@dex-mainnet get output values
    public getTydraOutput(pair: SwapPair[]) {
        const [exactToken, limitToken] = pair
        const exact = this._valueToBigInt(exactToken.value, exactToken.meta)
        let value = BigInt(0)
        const cashback =
            limitToken.meta.base16 !== this.rewarded &&
            exactToken.meta.base16 !== this.rewarded

        //@ssibrowser
        console.log('DEX_GET_PRICE_FOR:')
        console.log(exactToken.meta.symbol)
        console.log(limitToken.meta.symbol)

        let tydra_dex = BigInt(0)
        let zilswap_dex = BigInt(0)
        let aswap_dex = BigInt(0)

        let decimales = this.toDecimals(limitToken.meta.decimals)
        //@dev: BUY TYRON TOKEN
        if (limitToken.meta.symbol === 'TYRON') {
            if (exactToken.meta.symbol === 'S$I') {
                try {
                    console.log(
                        'TYDRADEX_RESERVES: ',
                        JSON.stringify(this.tyron_reserves['tyron_s$i'])
                    )
                    tydra_dex = this._ssiToTyron(
                        exact,
                        this.tyron_reserves['tyron_s$i']
                    )
                } catch (error) {
                    console.error('S$I to TYRON: ', error)
                }
            } else if (exactToken.meta.symbol === 'XSGD') {
                try {
                    const xsgd_input = Number(exact) * 1e12
                    tydra_dex = this._ssiToTyron(
                        BigInt(xsgd_input),
                        this.tyron_reserves['tyron_s$i']
                    )
                } catch (error) {
                    console.error('XSGD to TYRON: ', error)
                }
            } else if (exactToken.meta.symbol === 'ZIL') {
                try {
                    tydra_dex = this._zilToTyron(
                        BigInt(exact),
                        this.tyron_reserves['tyron_s$i']
                    )
                } catch (error) {
                    console.error('ZIL to TYRON:', error)
                }
            }
        }
        //@dev: BUY SSI DOLLAR
        else if (limitToken.meta.symbol === 'S$I') {
            if (exactToken.meta.symbol === 'TYRON') {
                try {
                    tydra_dex = this._tyronToSSI(
                        exact,
                        this.tyron_reserves['tyron_s$i']
                    )
                } catch (error) {
                    console.error('TYRON to S$I:', error)
                }
            } else if (exactToken.meta.symbol === 'XSGD') {
                tydra_dex = BigInt(Big(Number(exact)).mul(1e12).toString())
            } else if (exactToken.meta.symbol === 'ZIL') {
                try {
                    //@dex zilswap is the default intermediate dex
                    const xsgd_addr =
                        '0x173ca6770aa56eb00511dac8e6e13b3d7f16a5a5'
                    decimales = this.toDecimals(6)
                    tydra_dex = this._zilToTokensZilSwap(
                        exact,
                        this.getZilSwapPools[xsgd_addr]
                    )
                } catch (error) {
                    console.error('ZIL to S$I:', error)
                }
            }
        }
        //@dev S$I vaults
        else if (
            exactToken.meta.symbol === 'S$I' &&
            limitToken.meta.symbol === 'XSGD'
        ) {
            tydra_dex = BigInt(Big(Number(exact)).div(1e12).toString())
        } else {
            if (
                //@dev: SwapExactZILForTokens
                exactToken.meta.base16 === ZERO_ADDR &&
                limitToken.meta.base16 !== ZERO_ADDR
            ) {
                try {
                    value = this._zilToTokens(
                        exact,
                        this.pools[limitToken.meta.base16],
                        cashback
                    )
                    zilswap_dex = this._zilToTokensZilSwap(
                        exact,
                        this.getZilSwapPools[limitToken.meta.base16]
                    )
                    aswap_dex = this._zilToTokensASwap(
                        exact,
                        this.getASwapPools[limitToken.meta.base16]
                    )
                } catch (error) {
                    console.error(error)
                }
            } else if (
                //@dev: SwapExactTokensForZIL
                exactToken.meta.base16 !== ZERO_ADDR &&
                limitToken.meta.base16 === ZERO_ADDR
            ) {
                try {
                    value = this._tokensToZil(
                        exact,
                        this.pools[exactToken.meta.base16],
                        cashback
                    )
                    zilswap_dex = this._tokensToZilZilSwap(
                        exact,
                        this.getZilSwapPools[exactToken.meta.base16]
                    )
                    aswap_dex = this._tokensToZilASwap(
                        exact,
                        this.getASwapPools[exactToken.meta.base16]
                    )
                } catch (error) {
                    console.error(error)
                }
            } else {
                try {
                    //@dev: SwapExactTokensForTokens
                    value = this._tokensToTokens(
                        exact,
                        this.pools[exactToken.meta.base16],
                        this.pools[limitToken.meta.base16],
                        cashback
                    )
                } catch (error) {
                    console.error(error)
                }
            }
        }

        //@review: dex
        return {
            dragondex: Big(String(value)).div(decimales!).round(4),
            tydradex: Big(String(tydra_dex)).div(decimales!).round(4),
            zilswap: Big(String(zilswap_dex)).div(decimales!).round(4),
            aswap: Big(String(aswap_dex)).div(decimales!).round(4),
        }
    }

    //@dex-mainnetdirection
    public getDirection(pair: SwapPair[]) {
        const [exactToken, limitToken] = pair

        //@ssibrowser
        //@dev supported transactions
        //@dev exact token is the input token
        if (
            (exactToken.meta.symbol === 'TYRON' &&
                limitToken.meta.symbol === 'S$I') ||
            // ) {
            //     return SwapDirection.TydraDeFi
            // } else if (
            // @dev: BUY TYRON with S$I
            (exactToken.meta.symbol === 'S$I' &&
                limitToken.meta.symbol === 'TYRON')
        ) {
            return SwapDirection.DEFIxTokensForTokens
        } else if (
            // @dev: BUY TYRON with other tokens
            limitToken.meta.symbol === 'TYRON' ||
            limitToken.meta.symbol === 'S$I'
        ) {
            return SwapDirection.TydraDEX
        }
        //@dev Swap S$I to XSGD
        else if (
            exactToken.meta.symbol === 'S$I' &&
            limitToken.meta.symbol === 'XSGD'
        ) {
            return SwapDirection.TydraDeFi
        }
        //@zilpay
        else if (
            exactToken.meta.base16 === ZERO_ADDR &&
            limitToken.meta.base16 !== ZERO_ADDR
        ) {
            return SwapDirection.ZilToToken
        } else if (
            exactToken.meta.base16 !== ZERO_ADDR &&
            limitToken.meta.base16 === ZERO_ADDR
        ) {
            return SwapDirection.TokenToZil
        } else {
            return SwapDirection.TokenToTokens
        }
    }

    public tokensToZil(value: string | Big, token: TokenState) {
        try {
            const amount = Big(value)
            const cashback = token.base16 !== this.rewarded
            const decimals = this.toDecimals(token.decimals)
            const zilDecimails = this.toDecimals(this.tokens[0].meta.decimals)
            const qa = amount.mul(decimals!).round().toString()
            const zils = this._tokensToZil(
                BigInt(qa),
                this.pools[token.base16],
                cashback
            )

            return Big(String(zils)).div(zilDecimails!)
        } catch {
            return Big(0)
        }
    }

    // public async swapExactZILForTokens(
    //     exact: bigint,
    //     limit: bigint,
    //     token: TokenState
    // ) {
    //     const { blocks } = $settings.state
    //     const limitAfterSlippage = this.afterSlippage(limit)
    //     const { NumTxBlocks } = await this.zilpay.getBlockchainInfo()
    //     const nextBlock = Big(NumTxBlocks).add(blocks)
    //     const params = [
    //         {
    //             vname: 'token_address',
    //             type: 'ByStr20',
    //             value: token.base16,
    //         },
    //         {
    //             vname: 'min_token_amount',
    //             type: 'Uint128',
    //             value: String(limitAfterSlippage),
    //         },
    //         {
    //             vname: 'deadline_block',
    //             type: 'BNum',
    //             value: String(nextBlock),
    //         },
    //         {
    //             vname: 'recipient_address',
    //             type: 'ByStr20',
    //             value: this.wallet,
    //         },
    //     ]
    //     const contractAddress = this.contract
    //     const transition = 'SwapExactZILForTokens'
    //     const res = await this.zilpay.call(
    //         {
    //             params,
    //             contractAddress,
    //             transition,
    //             amount: String(exact),
    //         },
    //         this.calcGasLimit(SwapDirection.ZilToToken).toString()
    //     )

    //     const amount = Big(String(exact))
    //         .div(this.toDecimals(this.tokens[0].meta.decimals))
    //         .toString()
    //     const limitAmount = Big(String(limit))
    //         .div(this.toDecimals(token.decimals))
    //         .toString()
    //     addTransactions({
    //         timestamp: new Date().getTime(),
    //         name: `Swap exact (${formatNumber(amount)} ZIL), to (${formatNumber(
    //             limitAmount
    //         )} ${token.symbol})`,
    //         confirmed: false,
    //         hash: res.ID,
    //         from: res.from,
    //     })

    //     return res
    // }

    //@ssibrowser
    public async swapExactZILForTokens(
        selectedDex: string,
        exact: bigint,
        limit: bigint,
        token: TokenState,
        resolvedDomain: string,
        zilpayAddr: string,
        isDEFIx: boolean
    ) {
        // const dispatch = useDispatch()
        // const net = this.net.net as 'mainnet' | 'testnet'

        let addrName = token.symbol.toLowerCase()
        const { blocks } = $settings.state
        const limitAfterSlippage = this.afterSlippage(limit)

        let none_addr = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'ByStr20'
        )
        let beneficiary_addr = none_addr
        //@dex-mainnet: add defix v2
        if (resolvedDomain === 'tydradex' || resolvedDomain === 'tyrondex') {
            console.log('TYDRADEX_TO:', zilpayAddr)
            beneficiary_addr = await tyron.TyronZil.default.OptionParam(
                tyron.TyronZil.Option.some,
                'ByStr20',
                zilpayAddr
            )
        }
        let none_number = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'Uint128'
        )

        const params = [
            {
                vname: 'dApp',
                type: 'String',
                value: selectedDex,
            },
            {
                vname: 'addrName',
                type: 'String',
                value: addrName,
            },
            {
                vname: 'amount',
                type: 'Uint128',
                value: String(exact),
            },
            {
                vname: 'minTokenAmount',
                type: 'Uint128',
                value: String(limitAfterSlippage),
            },
            {
                vname: 'deadline',
                type: 'Uint128',
                value: String(blocks),
            },
            {
                vname: 'beneficiary',
                type: 'Option ByStr20',
                value: beneficiary_addr,
            },
            {
                vname: 'tyron',
                type: 'Option Uint128',
                value: none_number,
            },
        ]
        const contractAddress = this.wallet?.base16!
        const transition = 'SwapExactZILForTokens'
        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: isDEFIx ? '0' : String(exact),
            },
            this.calcGasLimit(SwapDirection.ZilToToken).toString()
        )
        // .then(async (deploy: any) => {
        //     dispatch(setTxId(deploy[0].ID))
        //     dispatch(setTxStatusLoading('submitted'))

        //     let tx = await tyron.Init.default.transaction(net)
        //     tx = await tx.confirm(deploy[0].ID, 33)
        //     if (tx.isConfirmed()) {
        //         dispatch(setTxStatusLoading('confirmed'))

        //         let link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}`
        //         if (net === 'testnet') {
        //             link = `https://viewblock.io/zilliqa/tx/${deploy[0].ID}?network=${net}`
        //         }
        //         setTimeout(() => {
        //             window.open(link)
        //         }, 1000)
        //     } else if (tx.isRejected()) {
        //         dispatch(setTxStatusLoading('failed'))
        //         updateModalTxMinimized(false)
        //         updateModalTx(true)
        //     }
        //     return deploy
        // })
        // .catch((error) => {
        //     console.error(error)
        // })

        const amount = Big(String(exact))
            .div(this.toDecimals(this.tokens[0].meta.decimals)!)
            .toString()
        const limitAmount = Big(String(limit))
            .div(this.toDecimals(token.decimals)!)
            .toString()
        addTransactions({
            timestamp: new Date().getTime(),
            name: `Swap exact (${formatNumber(amount)} ZIL), to (${formatNumber(
                limitAmount
            )} ${token.symbol})`,
            confirmed: false,
            hash: res.ID,
            from: res.from,
        })

        return res
    }

    // public async swapExactTokensForZIL(
    //     exact: bigint,
    //     limit: bigint,
    //     token: TokenState
    // ) {
    //     const { blocks } = $settings.state
    //     const limitAfterSlippage = this.afterSlippage(limit)
    //     const { NumTxBlocks } = await this.zilpay.getBlockchainInfo()
    //     const nextBlock = Big(NumTxBlocks).add(blocks)
    //     const params = [
    //         {
    //             vname: 'token_address',
    //             type: 'ByStr20',
    //             value: token.base16,
    //         },
    //         {
    //             vname: 'token_amount',
    //             type: 'Uint128',
    //             value: String(exact),
    //         },
    //         {
    //             vname: 'min_zil_amount',
    //             type: 'Uint128',
    //             value: String(limitAfterSlippage),
    //         },
    //         {
    //             vname: 'deadline_block',
    //             type: 'BNum',
    //             value: String(nextBlock),
    //         },
    //         {
    //             vname: 'recipient_address',
    //             type: 'ByStr20',
    //             value: this.wallet,
    //         },
    //     ]
    //     const contractAddress = this.contract
    //     const transition = 'SwapExactTokensForZIL'
    //     const res = await this.zilpay.call(
    //         {
    //             params,
    //             contractAddress,
    //             transition,
    //             amount: '0',
    //         },
    //         this.calcGasLimit(SwapDirection.TokenToZil).toString()
    //     )

    //     const amount = Big(String(exact))
    //         .div(this.toDecimals(token.decimals))
    //         .toString()
    //     const limitAmount = Big(String(limit))
    //         .div(this.toDecimals(this.tokens[0].meta.decimals))
    //         .toString()
    //     addTransactions({
    //         timestamp: new Date().getTime(),
    //         name: `Swap exact (${formatNumber(amount)} ${token.symbol
    //             }) to (${formatNumber(limitAmount)} ZIL)`,
    //         confirmed: false,
    //         hash: res.ID,
    //         from: res.from,
    //     })

    //     return res
    // }
    public async swapExactTokensForZIL(
        selectedDex: string,
        exact: bigint,
        limit: bigint,
        token: TokenState
    ) {
        let addrName = token.symbol.toLowerCase()
        const { blocks } = $settings.state
        const limitAfterSlippage = this.afterSlippage(limit)
        let none_number = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'Uint128'
        )
        const params = [
            {
                vname: 'dApp',
                type: 'String',
                value: selectedDex,
            },
            {
                vname: 'addrName',
                type: 'String',
                value: addrName,
            },
            {
                vname: 'amount',
                type: 'Uint128',
                value: String(exact),
            },
            {
                vname: 'minZilAmount',
                type: 'Uint128',
                value: String(limitAfterSlippage),
            },
            {
                vname: 'deadline',
                type: 'Uint128',
                value: String(blocks),
            },
            {
                vname: 'tyron',
                type: 'Option Uint128',
                value: none_number,
            },
        ]
        const contractAddress = this.wallet?.base16!
        const transition = 'SwapExactTokensForZIL'
        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: '0',
            },
            this.calcGasLimit(SwapDirection.TokenToZil).toString()
        )

        const amount = Big(String(exact))
            .div(this.toDecimals(token.decimals)!)
            .toString()
        const limitAmount = Big(String(limit))
            .div(this.toDecimals(this.tokens[0].meta.decimals)!)
            .toString()
        addTransactions({
            timestamp: new Date().getTime(),
            name: `Swap exact (${formatNumber(amount)} ${
                token.symbol
            }) to (${formatNumber(limitAmount)} ZIL)`,
            confirmed: false,
            hash: res.ID,
            from: res.from,
        })

        return res
    }

    public async swapExactTokensForTokens(
        exact: bigint,
        limit: bigint,
        inputToken: TokenState,
        outputToken: TokenState
    ) {
        const contractAddress = this.contract
        const { blocks } = $settings.state
        const limitAfterSlippage = this.afterSlippage(limit)
        const { NumTxBlocks } = await this.zilpay.getBlockchainInfo()
        const nextBlock = Big(NumTxBlocks).add(blocks)
        const params = [
            {
                vname: 'token0_address',
                type: 'ByStr20',
                value: inputToken.base16,
            },
            {
                vname: 'token1_address',
                type: 'ByStr20',
                value: outputToken.base16,
            },
            {
                vname: 'token0_amount',
                type: 'Uint128',
                value: String(exact),
            },
            {
                vname: 'min_token1_amount',
                type: 'Uint128',
                value: String(limitAfterSlippage),
            },
            {
                vname: 'deadline_block',
                type: 'BNum',
                value: String(nextBlock),
            },
            {
                vname: 'recipient_address',
                type: 'ByStr20',
                value: this.wallet,
            },
        ]
        const transition = 'SwapExactTokensForTokens'
        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: '0',
            },
            this.calcGasLimit(SwapDirection.TokenToTokens).toString()
        )

        const amount = formatNumber(
            Big(String(exact))
                .div(this.toDecimals(inputToken.decimals)!)
                .toString()
        )
        const receivedAmount = formatNumber(
            Big(String(limit))
                .div(this.toDecimals(outputToken.decimals)!)
                .toString()
        )
        addTransactions({
            timestamp: new Date().getTime(),
            name: `Swap exact (${formatNumber(amount)} ${
                inputToken.symbol
            }) to (${formatNumber(receivedAmount)} ${outputToken.symbol})`,
            confirmed: false,
            hash: res.ID,
            from: res.from,
        })

        return res
    }

    //@ssibrowser
    public async swapDEFIxTokensForTokens(
        exact: bigint,
        limit: bigint,
        inputToken: TokenState,
        outputToken: TokenState
    ) {
        const contractAddress = this.wallet?.base16!
        const { blocks } = $settings.state
        const limitAfterSlippage = this.afterSlippage(limit)

        let none_addr = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'ByStr20'
        )
        let none_number = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'Uint128'
        )
        const params = [
            {
                vname: 'dApp',
                type: 'String',
                value: 'tyron_s$i',
            },
            {
                vname: 'addrName',
                type: 'String',
                value: inputToken.symbol.toLowerCase(),
            },
            {
                vname: 'toAddrName',
                type: 'String',
                value: outputToken.symbol.toLowerCase(),
            },
            {
                vname: 'amount',
                type: 'Uint128',
                value: String(exact),
            },
            {
                vname: 'minTokenAmount',
                type: 'Uint128',
                value: String(limitAfterSlippage),
            },
            {
                vname: 'deadline',
                type: 'Uint128',
                value: String(blocks),
            },
            {
                vname: 'beneficiary',
                type: 'Option ByStr20',
                value: none_addr,
            },
            {
                vname: 'tyron',
                type: 'Option Uint128',
                value: none_number,
            },
        ]
        const transition = 'SwapExactTokensForTokens'
        console.log('TXN_PARAMS', JSON.stringify(params, null, 2))
        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: '0',
            },
            this.calcGasLimit(SwapDirection.TokenToTokens).toString()
        )

        const amount = formatNumber(
            Big(String(exact))
                .div(this.toDecimals(inputToken.decimals)!)
                .toString()
        )
        const receivedAmount = formatNumber(
            Big(String(limit))
                .div(this.toDecimals(outputToken.decimals)!)
                .toString()
        )
        addTransactions({
            timestamp: new Date().getTime(),
            name: `Swap exact (${formatNumber(amount)} ${
                inputToken.symbol
            }) to (${formatNumber(receivedAmount)} ${outputToken.symbol})`,
            confirmed: false,
            hash: res.ID,
            from: res.from,
        })

        return res
    }

    //@dev For minting and burning
    public async swapTydraDeFi(
        input: String,
        exact: bigint,
        output: String,
        limit: bigint
    ) {
        const contractAddress = this.wallet?.base16!
        let none_addr = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'ByStr20'
        )
        let none_str = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'String'
        )
        let none_number = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'Uint128'
        )

        //@dev depending on the tokens
        const params: any = []
        let dApp = 'tyrons$i_transmuter'
        let auth = 'True'
        let amount = String(limit)

        let transition = 'MintAuth'
        if (input === 'S$I') {
            transition = 'BurnAuth'
            dApp = 'xsgd_vault'
            auth = 'False'
            amount = String(exact)
        } else {
            params.push({
                vname: 'beneficiary',
                type: 'Option ByStr20',
                value: none_addr,
            })
        }

        const params_ = [
            {
                vname: 'dApp',
                type: 'String',
                value: dApp,
            },
            {
                vname: 'amount',
                type: 'Uint128',
                value: amount,
            },
            {
                vname: 'auth',
                type: 'Bool',
                value: { constructor: auth, argtypes: [], arguments: [] },
            },
            {
                vname: 'subdomain',
                type: 'Option String',
                value: none_str,
            },
            {
                vname: 'tyron',
                type: 'Option Uint128',
                value: none_number,
            },
        ]
        //@dev Pushes each element of params_ into params
        params_.forEach((element) => {
            params.push(element)
        })

        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: '0',
            },
            '10000' //this.calcGasLimit(SwapDirection.TokenToTokens).toString()
        )
        return res
    }

    public async swapTydraDEX(
        exact: bigint,
        limit: bigint,
        inputToken: TokenState,
        outputToken: TokenState,
        resolvedDomain: string,
        zilpayAddr: string,
        isDEFIx: boolean
    ) {
        const contractAddress = this.wallet?.base16!

        //@dev: input token
        let addrName = inputToken.symbol.toLowerCase()
        let toAddrName = outputToken.symbol.toLowerCase()

        const none_str = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'String'
        )
        let some_iDex = none_str
        let some_iAddrName = none_str
        let minIntAmount = '0'
        let tyron_send = '0' //@review: donate.ssi

        let none_addr = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'ByStr20'
        )
        let beneficiary_addr = none_addr

        const { blocks, slippage } = $settings.state
        console.log('SLIPPAGE:', slippage)

        let minTokenAmount = String((Number(limit) * (100 - slippage)) / 100)

        let allowance = String(exact)
        if (addrName === 'zil') {
            tyron_send = String(exact)
            addrName = '' //address name null means ZIL
            //@dev: iDex (intermediate DEX)
            some_iDex = await tyron.TyronZil.default.OptionParam(
                tyron.TyronZil.Option.some,
                'String',
                'zilswap'
            )
            //@dev: iAddrName (intermediate token)
            some_iAddrName = await tyron.TyronZil.default.OptionParam(
                tyron.TyronZil.Option.some,
                'String',
                'xsgd'
            )
            //@dex-mainnet: defiv2 - add conditions
            if (
                resolvedDomain === 'tydradex' ||
                resolvedDomain === 'tyrondex'
            ) {
                console.log('TYRONDEX_Send Funds To:', zilpayAddr)
                beneficiary_addr = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'ByStr20',
                    zilpayAddr
                )
            }

            minIntAmount = '1000' //@review: asap dex

            if (toAddrName === 's$i') {
                toAddrName = 'sgd'
            }

            //@review allowance - calculate output intermediate token per S$I amount
        } else if (addrName === 'xsgd' && toAddrName === 's$i') {
            minTokenAmount = String(limit) //no slippage from XSGD to S$I
            toAddrName = 'sgd'
        }

        let none_number = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'Uint128'
        )

        const params = [
            {
                vname: 'iDex',
                type: 'Option String',
                value: some_iDex,
            },
            {
                vname: 'addrName',
                type: 'String',
                value: addrName,
            },
            {
                vname: 'iAddrName',
                type: 'Option String',
                value: some_iAddrName,
            },
            {
                vname: 'toAddrName',
                type: 'String',
                value: toAddrName,
            },
            {
                vname: 'amount',
                type: 'Uint128',
                value: String(exact),
            },
            {
                vname: 'allowance',
                type: 'Uint128',
                value: allowance,
            },
            {
                vname: 'minTokenAmount',
                type: 'Uint128',
                value: minTokenAmount,
            },
            {
                vname: 'minIntAmount',
                type: 'Uint128',
                value: minIntAmount,
            },
            {
                vname: 'deadline',
                type: 'Uint128',
                value: String(blocks),
            },
            {
                vname: 'beneficiary',
                type: 'Option ByStr20',
                value: beneficiary_addr,
            },
            {
                vname: 'tyron',
                type: 'Option Uint128',
                value: none_number,
            },
        ]
        const transition = 'SwapTydraDEX'
        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: isDEFIx ? '0' : tyron_send,
            },
            '17000' //this.calcGasLimit(SwapDirection.TokenToTokens).toString()
        )
        return res
    }

    // public async addLiquidity(
    //     addr: string,
    //     amount: Big,
    //     limit: Big,
    //     created: boolean
    // ) {
    //     //@ssibrowser
    //     const contractAddress = this.wallet?.base16!
    //     //---
    //     //const contractAddress = this.contract
    //     const { blocks } = $settings.state
    //     const { blockNum, totalContributions, pool } =
    //         await this._provider.getBlockTotalContributions(
    //             contractAddress,
    //             addr
    //         )
    //     const maxExchangeRateChange = BigInt($settings.state.slippage * 100)
    //     const nextBlock = Big(blockNum).add(blocks)
    //     const maxTokenAmount = created
    //         ? (BigInt(amount.toString()) *
    //             (DragonDex.FEE_DEMON + maxExchangeRateChange)) /
    //         DragonDex.FEE_DEMON
    //         : BigInt(amount.toString())
    //     let minContribution = BigInt(0)

    //     if (created) {
    //         const zilAmount = BigInt(limit.toString())
    //         const zilReserve = Big(pool[0])
    //         const totalContribution = BigInt(totalContributions)
    //         const numerator = totalContribution * zilAmount
    //         const denominator = Big(
    //             String(DragonDex.FEE_DEMON + maxExchangeRateChange)
    //         )
    //             .sqrt()
    //             .mul(zilReserve)
    //             .round()
    //         minContribution = numerator / BigInt(String(denominator))
    //     }

    //     const params = [
    //         {
    //             vname: 'token_address',
    //             type: 'ByStr20',
    //             value: addr,
    //         },
    //         {
    //             vname: 'min_contribution_amount',
    //             type: 'Uint128',
    //             value: String(minContribution),
    //         },
    //         {
    //             vname: 'max_token_amount',
    //             type: 'Uint128',
    //             value: String(maxTokenAmount),
    //         },
    //         {
    //             vname: 'deadline_block',
    //             type: 'BNum',
    //             value: String(nextBlock),
    //         },
    //     ]
    //     const transition = 'AddLiquidity'
    //     const res = await this.zilpay.call(
    //         {
    //             params,
    //             contractAddress,
    //             transition,
    //             amount: String(limit),
    //         },
    //         '3060'
    //     )

    //     const found = this.tokens.find((t) => t.meta.base16 === addr)

    //     if (found) {
    //         const max = amount
    //             .div(this.toDecimals(found.meta.decimals))
    //             .toString()
    //         addTransactions({
    //             timestamp: new Date().getTime(),
    //             name: `addLiquidity maximum ${formatNumber(max)} ${found.meta.symbol
    //                 }`,
    //             confirmed: false,
    //             hash: res.ID,
    //             from: res.from,
    //         })
    //     }

    //     return res.ID
    // }
    // public async removeLiquidity(
    //     minzil: Big,
    //     minzrc: Big,
    //     minContributionAmount: Big,
    //     token: string,
    //     owner: string
    // ) {
    //     const contractAddress = this.contract
    //     const { blocks } = $settings.state
    //     const { blockNum } =
    //         await this._provider.getUserBlockTotalContributions(
    //             contractAddress,
    //             token,
    //             owner
    //         )
    //     const zilsAfterSlippage = this.afterSlippage(BigInt(String(minzil)))
    //     const tokensAfterSlippage = this.afterSlippage(BigInt(String(minzrc)))
    //     const nextBlock = Big(blockNum).add(blocks)
    //     const params = [
    //         {
    //             vname: 'token_address',
    //             type: 'ByStr20',
    //             value: token,
    //         },
    //         {
    //             vname: 'contribution_amount',
    //             type: 'Uint128',
    //             value: String(minContributionAmount),
    //         },
    //         {
    //             vname: 'min_zil_amount',
    //             type: 'Uint128',
    //             value: String(zilsAfterSlippage),
    //         },
    //         {
    //             vname: 'min_token_amount',
    //             type: 'Uint128',
    //             value: String(tokensAfterSlippage),
    //         },
    //         {
    //             vname: 'deadline_block',
    //             type: 'BNum',
    //             value: String(nextBlock),
    //         },
    //     ]
    //     const transition = 'RemoveLiquidity'
    //     const res = await this.zilpay.call(
    //         {
    //             params,
    //             contractAddress,
    //             transition,
    //             amount: '0',
    //         },
    //         '3060'
    //     )

    //     addTransactions({
    //         timestamp: new Date().getTime(),
    //         name: `RemoveLiquidity`,
    //         confirmed: false,
    //         hash: res.ID,
    //         from: res.from,
    //     })

    //     return res
    // }
    //@ssibrowser
    public async addLiquiditySSI(
        isSSI: boolean,
        addr_name: string,
        min_contribution: Big,
        max_token: Big,
        isDAO: boolean
    ) {
        const contractAddress = this.wallet?.base16!
        const dex_name = this.dex.dex_name
        let dex = 'tyron_s$i'
        if (dex_name !== 'tydradex') {
            dex = dex_name
        }

        const { blocks } = $settings.state

        //const maxExchangeRateChange = BigInt($settings.state.slippage * 100)
        const maxTokenAmount = BigInt(Number(max_token))
        // created
        //     ? (BigInt(amount.toString()) *
        //         (DragonDex.FEE_DEMON + maxExchangeRateChange)) /
        //     DragonDex.FEE_DEMON
        //     : BigInt(amount.toString())
        let minContribution =
            //BigInt(min_contribution)
            Big(Number(min_contribution) * 0.99)
        // if (created) {
        //     const zilAmount = BigInt(limit.toString())
        //     const zilReserve = Big(pool[0])
        //     const totalContribution = BigInt(totalContributions)
        //     const numerator = totalContribution * zilAmount
        //     const denominator = Big(
        //         String(DragonDex.FEE_DEMON + maxExchangeRateChange)
        //     )
        //         .sqrt()
        //         .mul(zilReserve)
        //         .round()
        //     minContribution = numerator / BigInt(String(denominator))
        // }

        let none_str = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'String'
        )
        let none_number = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'Uint128'
        )
        const params = [
            {
                vname: 'dApp',
                type: 'String',
                value: dex,
            },
            {
                vname: 'isSSI',
                type: 'Bool',
                value: { constructor: 'True', argtypes: [], arguments: [] },
            },
            {
                vname: 'addrName',
                type: 'String',
                value: addr_name.toLowerCase(),
            },
            {
                vname: 'minContributionAmount',
                type: 'Uint128',
                value: String(minContribution),
            },
            {
                vname: 'maxTokenAmount',
                type: 'Uint128',
                value: String(maxTokenAmount),
            },
            {
                vname: 'deadline',
                type: 'Uint128',
                value: String(blocks),
            },
            {
                vname: 'double_allowance',
                type: 'Bool',
                value: {
                    constructor: isSSI ? 'False' : 'True',
                    argtypes: [],
                    arguments: [],
                },
            },
            {
                vname: 'is_community',
                type: 'Bool',
                value: {
                    constructor: isDAO ? 'True' : 'False',
                    argtypes: [],
                    arguments: [],
                },
            },
            {
                vname: 'subdomain',
                type: 'Option String',
                value: none_str,
            },
            {
                vname: 'tyron',
                type: 'Option Uint128',
                value: none_number,
            },
        ]
        console.log('ADD LIQUIDITY:', JSON.stringify(params, null, 2))
        const transition = 'AddLiquidity'

        // const params = [
        //     {
        //         vname: 'dApp',
        //         type: 'String',
        //         value: 'sgd',
        //     },
        //     {
        //         vname: 'spender',
        //         type: 'ByStr20',
        //         value: '0x2b2ce8c3d546b1ac448169428c99503b8dcbe7cd',
        //     },
        //     {
        //         vname: 'add',
        //         type: 'Bool',
        //         value: {
        //             constructor: 'True',
        //             argtypes: [],
        //             arguments: [],
        //         },
        //     },
        //     {
        //         vname: 'amount',
        //         type: 'Uint128',
        //         value: '100000000000000000000',
        //     },
        //     {
        //         vname: 'tyron',
        //         type: 'Option Uint128',
        //         value: none_number,
        //     },
        // ]
        // console.log('ADD ALLOWANCE', JSON.stringify(params, null, 2))
        // const transition = 'UpdateAllowance'
        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: String(0),
            },
            isSSI ? '10000' : '15000'
        )

        return res
        //return res.ID
    }

    public async removeLiquiditySSI(
        base_amt: Big,
        token_amt: Big,
        addr_name: string,
        leave: boolean
    ) {
        const contractAddress = this.wallet?.base16!
        const dex_name = this.dex.dex_name
        let dex = 'tyron_s$i'
        if (dex_name !== 'tydradex') {
            dex = dex_name
        }

        const zilsAfterSlippage = this.afterSlippage(BigInt(String(base_amt)))
        const tokensAfterSlippage = this.afterSlippage(
            BigInt(String(token_amt))
        )

        const { blocks } = $settings.state

        let none_number = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'Uint128'
        )
        const params = [
            {
                vname: 'dApp',
                type: 'String',
                value: dex,
            },
            {
                vname: 'addrName',
                type: 'String',
                value: addr_name.toLowerCase(),
            },
            {
                vname: 'amount',
                type: 'Uint128',
                value: String(base_amt),
            },
            {
                vname: 'minZilAmount',
                type: 'Uint128',
                value: String(zilsAfterSlippage),
            },
            {
                vname: 'minTokenAmount',
                type: 'Uint128',
                value: String(10), //tokensAfterSlippage),@review: urgent
            },
            {
                vname: 'deadline',
                type: 'Uint128',
                value: String(blocks),
            },
            {
                vname: 'is_community',
                type: 'Bool',
                value: {
                    constructor: leave ? 'True' : 'False',
                    argtypes: [],
                    arguments: [],
                },
            },
            {
                vname: 'tyron',
                type: 'Option Uint128',
                value: none_number,
            },
        ]
        const transition = 'RemoveLiquidity'
        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: '0',
            },
            '5000'
        )

        addTransactions({
            timestamp: new Date().getTime(),
            name: `RemoveLiquidity`,
            confirmed: false,
            hash: res.ID,
            from: res.from,
        })

        return res
    }

    public async LeaveCommunity(amount: Big) {
        const contractAddress = this.wallet?.base16!
        const dex_name = this.dex.dex_name
        let dex = 'tyron_s$i'
        if (dex_name !== 'tydradex') {
            dex = dex_name
        }

        const { blocks } = $settings.state

        let none_number = await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.none,
            'Uint128'
        )
        const params = [
            {
                vname: 'dApp',
                type: 'String',
                value: dex,
            },
            {
                vname: 'amount',
                type: 'Uint128',
                value: String(amount),
            },
            {
                vname: 'deadline',
                type: 'Uint128',
                value: String(blocks),
            },
            {
                vname: 'tyron',
                type: 'Option Uint128',
                value: none_number,
            },
        ]
        const transition = 'LeaveCommunity'
        const res = await this.zilpay.call(
            {
                params,
                contractAddress,
                transition,
                amount: '0',
            },
            '2000'
        )

        //@review
        // addTransactions({
        //     timestamp: new Date().getTime(),
        //     name: `RemoveLiquidity`,
        //     confirmed: false,
        //     hash: res.ID,
        //     from: res.from,
        // })

        return res
    }

    //@zilpay

    public toDecimals(decimals: number) {
        try {
            return Big(10 ** decimals)
        } catch (error) {
            console.error(error)
        }
    }

    public afterSlippage(amount: bigint) {
        const slippage = $settings.state.slippage
        console.log('SLIPPAGE:', slippage)

        if (slippage <= 0) {
            return amount
        }

        //@review: asap
        const _slippage = DragonDex.FEE_DEMON - BigInt(slippage * 100)
        return (amount * _slippage) / DragonDex.FEE_DEMON
    }

    public calcGasLimit(direction: SwapDirection) {
        switch (direction) {
            case SwapDirection.ZilToToken:
                return Big(5500) //@gas-mainnet 4637)
            case SwapDirection.TokenToZil:
                return Big(5163)
            case SwapDirection.TokenToTokens:
                return Big(6183)
            default:
                return Big(7000)
        }
    }

    public calcPriceImpact(input: Big, output: Big, currentPrice: Big) {
        const nextPrice = input.div(output)
        const priceDiff = nextPrice.sub(currentPrice)
        const value = priceDiff.div(currentPrice)
        const _100 = Big(100)
        const impact = value.mul(_100).round(2)
        //.toNumber()

        //const v = Math.abs(impact)
        //return v > 100 ? 100 : v
        console.log('PRICE_IMPACT', String(impact))
        return impact
    }

    // public calcVirtualAmount(amount: Big, token: TokenState, pool: string[]) {
    //     if (!pool || pool.length < 2) {
    //         return Big(0)
    //     }

    //     const zilReserve = Big(String(pool[0])).div(
    //         this.toDecimals($tokens.state.tokens[0].meta.decimals)
    //     )
    //     const tokensReserve = Big(String(pool[1])).div(
    //         this.toDecimals(token.decimals)
    //     )
    //     const zilRate = zilReserve.div(tokensReserve)

    //     return amount.mul(zilRate)
    // }
    //@ssibrowser
    //@review: consider adding the fee (1%)
    public calculatePriceImpact(
        exactToken: any,
        baseReserve: Big,
        tokensReserve: Big,
        tradeInput: Big,
        tradeOutput: Big
    ) {
        console.log('inputToken', exactToken)
        console.log('inputAmount', String(tradeInput))
        console.log('outputAmount', String(tradeOutput))
        const current_price = baseReserve.div(tokensReserve)

        console.log('BASE_RESERVE', String(baseReserve))
        console.log('TOKEN_RESERVE', String(tokensReserve))
        console.log('CURRENT_PRICE', String(current_price))

        let new_base
        let new_tokens
        if (exactToken.meta.symbol === 'S$I') {
            new_base = baseReserve.plus(tradeInput)
            new_tokens = tokensReserve.minus(tradeOutput)
        } else {
            new_base = baseReserve.minus(tradeOutput)
            new_tokens = tokensReserve.plus(tradeInput)
        }
        const nextPrice = new_base.div(new_tokens)

        console.log('NEW_BASE_RESERVE', String(new_base))
        console.log('NEW_TOKEN_RESERVE', String(new_tokens))
        console.log('NEW_PRICE', String(nextPrice))

        const priceDiff = nextPrice.sub(current_price)
        const value = priceDiff.div(current_price)
        const _100 = Big(100)
        const impact = value.mul(_100).round(2)
        //.toNumber()

        //const v = Math.abs(impact)
        //return v > 100 ? 100 : v
        return impact
    }
    public calcVirtualAmount_(
        amount: Big,
        token: TokenState,
        pool: string[],
        dex: string
    ) {
        if (!pool || pool.length < 2) {
            return Big(0)
        }

        const zil_decimals = this.toDecimals(
            $tokens.state.tokens[0].meta.decimals
        )
        const ssi_decimals = this.toDecimals(18)
        const decimals = dex === 'tydradex' ? ssi_decimals : zil_decimals
        const baseReserve = Big(String(pool[0])).div(decimals!)
        const pairReserve = Big(String(pool[1])).div(
            this.toDecimals(token.decimals)!
        )
        const rate = baseReserve.div(pairReserve)
        return amount.mul(rate)
    }
    //@zilpay
    public sleepageCalc(value: string) {
        const slippage = $settings.state.slippage

        if (slippage <= 0) {
            return value
        }

        const amount = Big(value)
        const demon = Big(String(DragonDex.FEE_DEMON))
        const slip = demon.sub(slippage * 100)

        return amount.mul(slip).div(demon)
    }

    private _fraction(d: bigint, x: bigint, y: bigint) {
        return (d * y) / x
    }

    private _zilToTokens(
        amount: bigint,
        inputPool: string[],
        cashback: boolean
    ) {
        const [zilReserve, tokenReserve] = inputPool
        const amountAfterFee =
            this.protoFee === BigInt(0) || !cashback
                ? amount
                : amount - amount / this.protoFee
        return this._outputFor(
            amountAfterFee,
            BigInt(zilReserve),
            BigInt(tokenReserve)
        )
    }

    //@ssibrowser
    private _ssiToTyron(ssi_amount: bigint, inputReserve: string[]) {
        const [ssiReserve, tyronReserve] = inputReserve
        const output = this._tyronOutputFor(
            ssi_amount,
            BigInt(ssiReserve),
            BigInt(tyronReserve)
        )
        //@dex-fairlaunch
        // const output = this._tyronOutputForFairLaunch(ssi_amount)
        console.log('TRADE_OUTPUT: TYRON', output)
        return output
    }

    private _tyronToSSI(input_amount: bigint, inputReserve: string[]) {
        const [ssiReserve, tyronReserve] = inputReserve
        // const amountAfterFee =
        //     input_amount - input_amount / this.tyronProfitDenom
        return this._tyronOutputFor(
            input_amount, //amountAfterFee,
            BigInt(tyronReserve),
            BigInt(ssiReserve)
        )
    }

    private _zilToTyron(input_amount: bigint, inputReserve: string[]) {
        const xsgd_addr = '0x173ca6770aa56eb00511dac8e6e13b3d7f16a5a5'
        let i_amount = this._zilToTokensZilSwap(
            input_amount,
            this.getZilSwapPools[xsgd_addr]
        )
        console.log('i_amount: XSGD', String(i_amount))
        const multiplier: bigint = BigInt(1e12)

        const ssi_amount = i_amount * multiplier

        //@with pools
        const [ssiReserve, tyronReserve] = inputReserve
        const output = this._tyronOutputFor(
            ssi_amount,
            BigInt(ssiReserve),
            BigInt(tyronReserve)
        )

        //@with fairlaunch
        //const output = this._tyronOutputForFairLaunch(ssi_amount)
        console.log('TRADE_OUTPUT: TYRON', String(output))
        return output
    }

    private _zilToTokensZilSwap(amount: bigint, inputPool: string[]) {
        const [zilReserve, tokenReserve] = inputPool

        return this._outputForZilSwap(
            amount,
            BigInt(zilReserve),
            BigInt(tokenReserve)
        )
    }

    private _zilToTokensASwap(amount: bigint, inputPool: string[]) {
        const [zilReserve, tokenReserve] = inputPool
        // if (zilReserve === '0') {
        //     throw new Error('Avely: no liquidity')
        // }
        const amountAfterFee =
            this.aswapProtoFee === BigInt(0)
                ? amount
                : amount - amount / this.aswapProtoFee
        return this._outputForASwap(
            amountAfterFee,
            BigInt(zilReserve),
            BigInt(tokenReserve)
        )
    }

    //@zilpay
    private _tokensToZil(
        amount: bigint,
        inputPool: string[],
        cashback: boolean
    ) {
        const [zilReserve, tokenReserve] = inputPool
        const zils = this._outputFor(
            amount,
            BigInt(tokenReserve),
            BigInt(zilReserve)
        )

        return this.protoFee === BigInt(0) || !cashback
            ? zils
            : zils - zils / this.protoFee
    }

    private _tokensToTokens(
        amount: bigint, //input
        inputPool: string[],
        outputPool: string[],
        cashback: boolean
    ) {
        const [inputZilReserve, inputTokenReserve] = inputPool
        const [outputZilReserve, outputTokenReserve] = outputPool
        const fee =
            DragonDex.FEE_DEMON - (DragonDex.FEE_DEMON - this.fee) / BigInt(2)
        const zilIntermediateAmount = this._outputFor(
            amount,
            BigInt(inputTokenReserve),
            BigInt(inputZilReserve),
            fee
        )

        const zils =
            this.protoFee === BigInt(0) || !cashback
                ? zilIntermediateAmount
                : zilIntermediateAmount - zilIntermediateAmount / this.protoFee

        return this._outputFor(
            zils,
            BigInt(outputZilReserve),
            BigInt(outputTokenReserve),
            fee
        )
    }

    private _outputFor(
        exactAmount: bigint,
        inputReserve: bigint,
        outputReserve: bigint,
        fee: bigint = this.fee
    ) {
        const exactAmountAfterFee = exactAmount * fee
        const numerator = exactAmountAfterFee * outputReserve
        const inputReserveAfterFee = inputReserve * DragonDex.FEE_DEMON
        const denominator = inputReserveAfterFee + exactAmountAfterFee

        return numerator / denominator
    }

    //@ssibrowser
    private _tokensToZilZilSwap(amount: bigint, inputPool: string[]) {
        const [zilReserve, tokenReserve] = inputPool
        const zils = this._outputForZilSwap(
            amount,
            BigInt(tokenReserve),
            BigInt(zilReserve)
        )

        return zils
    }

    private _tokensToTokensZilSwap(
        amount: bigint, //input
        inputPool: string[],
        outputPool: string[],
        cashback: boolean
    ) {
        const [inputZilReserve, inputTokenReserve] = inputPool
        const [outputZilReserve, outputTokenReserve] = outputPool
        const fee =
            DragonDex.FEE_DEMON - (DragonDex.FEE_DEMON - this.fee) / BigInt(2)
        const zilIntermediateAmount = this._outputFor(
            amount,
            BigInt(inputTokenReserve),
            BigInt(inputZilReserve),
            fee
        )

        const zils =
            this.protoFee === BigInt(0) || !cashback
                ? zilIntermediateAmount
                : zilIntermediateAmount - zilIntermediateAmount / this.protoFee

        return this._outputFor(
            zils,
            BigInt(outputZilReserve),
            BigInt(outputTokenReserve),
            fee
        )
    }
    private _tokensToZilASwap(
        amount: bigint,
        inputPool: string[]
        //cashback: boolean
    ) {
        const [zilReserve, tokenReserve] = inputPool
        const zils = this._outputForASwap(
            amount,
            BigInt(tokenReserve),
            BigInt(zilReserve)
        )

        return this.protoFee === BigInt(0) //|| !cashback
            ? zils
            : zils - zils / this.aswapProtoFee
    }

    private _tokensToTokensASwap(
        amount: bigint, //input
        inputPool: string[],
        outputPool: string[],
        cashback: boolean
    ) {
        const [inputZilReserve, inputTokenReserve] = inputPool
        const [outputZilReserve, outputTokenReserve] = outputPool
        const fee =
            DragonDex.FEE_DEMON - (DragonDex.FEE_DEMON - this.fee) / BigInt(2)
        const zilIntermediateAmount = this._outputFor(
            amount,
            BigInt(inputTokenReserve),
            BigInt(inputZilReserve),
            fee
        )

        const zils =
            this.protoFee === BigInt(0) || !cashback
                ? zilIntermediateAmount
                : zilIntermediateAmount - zilIntermediateAmount / this.protoFee

        return this._outputFor(
            zils,
            BigInt(outputZilReserve),
            BigInt(outputTokenReserve),
            fee
        )
    }
    private _tyronOutputFor(
        exactAmount: bigint,
        inputReserve: bigint,
        outputReserve: bigint,
        fee: bigint = this.tyronProfitDenom
    ) {
        const exactAmountAfterFee = exactAmount * fee
        const numerator = exactAmountAfterFee * outputReserve
        const inputReserveAfterFee = inputReserve * DragonDex.FEE_DEMON
        const denominator = inputReserveAfterFee + exactAmountAfterFee
        return numerator / denominator
    }

    private _tyronOutputForFairLaunch(exactAmount: bigint) {
        const price = BigInt(1350000)
        return exactAmount / price
    }
    private _outputForZilSwap(
        exactAmount: bigint,
        inputReserve: bigint,
        outputReserve: bigint,
        fee: bigint = this.zilswapFee
    ) {
        const exactAmountAfterFee = exactAmount * fee
        const numerator = exactAmountAfterFee * outputReserve
        const inputReserveAfterFee = inputReserve * DragonDex.FEE_DEMON
        const denominator = inputReserveAfterFee + exactAmountAfterFee

        return numerator / denominator
    }
    private _outputForASwap(
        exactAmount: bigint,
        inputReserve: bigint,
        outputReserve: bigint,
        fee: bigint = this.aswapFee
    ) {
        const exactAmountAfterFee = exactAmount * fee
        const numerator = exactAmountAfterFee * outputReserve
        const inputReserveAfterFee = inputReserve * DragonDex.FEE_DEMON
        const denominator = inputReserveAfterFee + exactAmountAfterFee

        return numerator / denominator
    }
    private _getTyronLPs(balances: any, contributions: string, owner: string) {
        const shares: Share = {}
        const _zero = BigInt(0)
        const userContributions = balances[owner] || _zero

        const total_contributions = BigInt(contributions)
        const balance = BigInt(userContributions)
        shares['tyron_s$i'] =
            total_contributions !== _zero
                ? (balance * SHARE_PERCENT) / total_contributions
                : _zero

        console.log('SSI_LPBALANCE_:', String(balance))
        console.log('SSI_LPSHARES_:', String(shares['tyron_s$i']))
        console.log('TYRONDEX_CONTRIBUTIONS_:', contributions)
        return shares
    }
    private _getTyronS$IBalances(
        shares: any,
        dao_balance: string,
        shares_supply: string,
        domain: string
    ) {
        const lpt_balance: Share = {}
        const _zero = BigInt(0)
        const userShares = shares[domain] || _zero
        const user_shares = Big(userShares)
        const total_supply = shares_supply === '0' ? _zero : Big(shares_supply)
        const current_dao_balance = Big(dao_balance)

        const user_bal =
            total_supply === _zero
                ? _zero
                : Big(
                      user_shares
                          .div(Big(Number(total_supply)))
                          .mul(current_dao_balance)
                          .round(0)
                  )
        lpt_balance['tyron_s$i'] =
            shares_supply !== '0' ? BigInt(Number(user_bal)) : _zero

        console.log('SSI_DAOSHARES_:', String(user_shares))
        console.log('DAO_BALANCE:', dao_balance)
        console.log('TYRONDEX_DAOSHARES_TOTALSUPPLY_:', shares_supply)
        console.log('SSI_tyronS$I_balance_:', String(lpt_balance['tyron_s$i']))
        return lpt_balance
    }

    //@zilpay
    private _getShares(
        balances: FiledBalances,
        totalContributions: FieldTotalContributions,
        owner: string
    ) {
        const shares: Share = {}
        const _zero = BigInt(0)
        const userContributions = balances[owner] || {}

        for (const token in userContributions) {
            const contribution = BigInt(totalContributions[token])
            const balance = BigInt(userContributions[token])

            if (balance === _zero) {
                continue
            }

            shares[token] = (balance * SHARE_PERCENT) / contribution
        }
        // console.log('DDEX_BALANCES_:', JSON.stringify(balances, null, 2))
        // console.log('DDEX_TOTAL_CONTRIBUTIONS_:', JSON.stringify(totalContributions, null, 2))
        // console.log('DDEX_SHARES_:', JSON.stringify(shares, null, 2))
        return shares
    }

    private _getPools(pools: any /*FiledPools*/) {
        const newPools: DexPool = {}

        for (const token in pools) {
            const [x, y] = pools[token].arguments

            newPools[token] = [x, y]
        }

        return newPools
    }

    private _valueToBigInt(amount: string, token: TokenState) {
        return BigInt(
            Big(amount).mul(this.toDecimals(token.decimals)!).round().toString()
        )
    }

    //@ssibrowser
    private _getTyronReserves(reserves: any) {
        const newReserves: DexPool = {}
        const s$i_ = reserves.arguments[0]
        const tyron_ = reserves.arguments[1]
        newReserves['tyron_s$i'] = [s$i_, tyron_]
        return newReserves
    }
}
