// @dev (syron)

import Big from 'big.js'
import { CryptoState, VaultPair } from '../types/vault'

Big.PE = 999

export enum VaultDirection {
    Mint,
    Burn,
}

export class SSIVault {
    public toDecimals(decimals: number) {
        try {
            return Big(10 ** decimals)
        } catch (error) {
            console.error(error)
        }
    }

    private _fraction(d: bigint, x: bigint, y: bigint) {
        return (d * y) / x
    }

    private _valueToBigInt(amount: string, token: CryptoState) {
        return BigInt(
            Big(amount).mul(this.toDecimals(token.decimals)).round().toString()
        )
    }

    public getVaultDirection(pair: VaultPair[]) {
        const [exactToken, limitToken] = pair

        if (
            exactToken.meta.symbol === 'BTC' &&
            limitToken.meta.symbol === 'SU$D'
        ) {
            return VaultDirection.Mint
        } else {
            return VaultDirection.Burn
        }
    }

    public computeSU$D(pair: VaultPair[]) {
        const [exactToken, limitToken] = pair
        const exact = this._valueToBigInt(exactToken.value, exactToken.meta)
        let value = BigInt(0)

        //@ssibrowser
        console.log('DEX_GET_PRICE_FOR:')
        console.log(exactToken.meta.symbol)
        console.log(limitToken.meta.symbol)

        let tydra_dex = BigInt(0)
        let zilswap_dex = BigInt(0)
        let aswap_dex = BigInt(0)

        let decimales = this.toDecimals(limitToken.meta.decimals)
        // //@dev: BUY TYRON TOKEN
        // if (limitToken.meta.symbol === 'TYRON') {
        //     if (exactToken.meta.symbol === 'S$I') {
        //         try {
        //             console.log(
        //                 'TYDRADEX_RESERVES: ',
        //                 JSON.stringify(this.tyron_reserves['tyron_s$i'])
        //             )
        //             tydra_dex = this._ssiToTyron(
        //                 exact,
        //                 this.tyron_reserves['tyron_s$i']
        //             )
        //         } catch (error) {
        //             console.error('S$I to TYRON: ', error)
        //         }
        //     } else if (exactToken.meta.symbol === 'XSGD') {
        //         try {
        //             const xsgd_input = Number(exact) * 1e12
        //             tydra_dex = this._ssiToTyron(
        //                 BigInt(xsgd_input),
        //                 this.tyron_reserves['tyron_s$i']
        //             )
        //         } catch (error) {
        //             console.error('XSGD to TYRON: ', error)
        //         }
        //     } else if (exactToken.meta.symbol === 'ZIL') {
        //         try {
        //             tydra_dex = this._zilToTyron(
        //                 BigInt(exact),
        //                 this.tyron_reserves['tyron_s$i']
        //             )
        //         } catch (error) {
        //             console.error('ZIL to TYRON:', error)
        //         }
        //     }
        // }
        // //@dev: BUY SSI DOLLAR
        // else if (limitToken.meta.symbol === 'S$I') {
        //     if (exactToken.meta.symbol === 'TYRON') {
        //         try {
        //             tydra_dex = this._tyronToSSI(
        //                 exact,
        //                 this.tyron_reserves['tyron_s$i']
        //             )
        //         } catch (error) {
        //             console.error('TYRON to S$I:', error)
        //         }
        //     } else if (exactToken.meta.symbol === 'XSGD') {
        //         tydra_dex = Big(exact).mul(1e12)
        //     } else if (exactToken.meta.symbol === 'ZIL') {
        //         try {
        //             //@dex zilswap is the default intermediate dex
        //             const xsgd_addr =
        //                 '0x173ca6770aa56eb00511dac8e6e13b3d7f16a5a5'
        //             decimales = this.toDecimals(6)
        //             tydra_dex = this._zilToTokensZilSwap(
        //                 exact,
        //                 this.getZilSwapPools[xsgd_addr]
        //             )
        //         } catch (error) {
        //             console.error('ZIL to S$I:', error)
        //         }
        //     }
        // }
        // //@dev S$I vaults
        // else if (
        //     exactToken.meta.symbol === 'S$I' &&
        //     limitToken.meta.symbol === 'XSGD'
        // ) {
        //     tydra_dex = Big(exact).div(1e12)
        // } else {
        //     if (
        //         //@dev: SwapExactZILForTokens
        //         exactToken.meta.base16 === ZERO_ADDR &&
        //         limitToken.meta.base16 !== ZERO_ADDR
        //     ) {
        //         try {
        //             value = this._zilToTokens(
        //                 exact,
        //                 this.pools[limitToken.meta.base16],
        //                 cashback
        //             )
        //             zilswap_dex = this._zilToTokensZilSwap(
        //                 exact,
        //                 this.getZilSwapPools[limitToken.meta.base16]
        //             )
        //             aswap_dex = this._zilToTokensASwap(
        //                 exact,
        //                 this.getASwapPools[limitToken.meta.base16]
        //             )
        //         } catch (error) {
        //             console.error(error)
        //         }
        //     } else if (
        //         //@dev: SwapExactTokensForZIL
        //         exactToken.meta.base16 !== ZERO_ADDR &&
        //         limitToken.meta.base16 === ZERO_ADDR
        //     ) {
        //         try {
        //             value = this._tokensToZil(
        //                 exact,
        //                 this.pools[exactToken.meta.base16],
        //                 cashback
        //             )
        //             zilswap_dex = this._tokensToZilZilSwap(
        //                 exact,
        //                 this.getZilSwapPools[exactToken.meta.base16]
        //             )
        //             aswap_dex = this._tokensToZilASwap(
        //                 exact,
        //                 this.getASwapPools[exactToken.meta.base16]
        //             )
        //         } catch (error) {
        //             console.error(error)
        //         }
        //     } else {
        //         try {
        //             //@dev: SwapExactTokensForTokens
        //             value = this._tokensToTokens(
        //                 exact,
        //                 this.pools[exactToken.meta.base16],
        //                 this.pools[limitToken.meta.base16],
        //                 cashback
        //             )
        //         } catch (error) {
        //             console.error(error)
        //         }
        //     }
        // }

        //@review: dex
        return {
            amount: Big(String(value)).div(decimales).round(4),
        }
    }
}
