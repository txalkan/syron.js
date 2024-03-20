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

    private _valueToBigInt(amount: Big, token: CryptoState) {
        return BigInt(
            amount.mul(this.toDecimals(token.decimals)!).round().toString()
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

    public computeSU$D(pair: VaultPair[], xr: number) {
        const [exactToken, limitToken] = pair
        const input = exactToken.value

        const rate = Big(xr)

        //@review (xrc) over-collateralization ratio (1.5)
        const ratio = Big(1.5)

        const susd = input.div(1e8).mul(rate).div(ratio)

        // let decimales = this.toDecimals(limitToken.meta.decimals)
        // return {
        //     amount: Big(String(value)).div(decimales!).round(4),
        // }

        return susd
    }
}
