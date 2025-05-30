import type { Principal } from '@dfinity/principal'
import type { ActorMethod } from '@dfinity/agent'
import type { IDL } from '@dfinity/candid'

export type BtcNetwork =
    | { Mainnet: null }
    | { Regtest: null }
    | { Testnet: null }
    | { Signet: null }
export interface CollateralizedAccount {
    collateral_ratio: bigint
    susd_1: bigint
    susd_2: bigint
    susd_3: bigint
    btc_1: bigint
    exchange_rate: bigint
}
export interface GetBoxAddressArgs {
    op: syron_operation
    ssi: bitcoin_address
}
export interface HttpHeader {
    value: string
    name: string
}
export interface InitArgs {
    ecdsa_key_name: string
    mode: Mode
    retrieve_btc_min_amount: bigint
    ledger_id: Principal
    siwb_id: Principal
    max_time_in_queue_nanos: bigint
    btc_network: BtcNetwork
    min_confirmations: [] | [number]
    xrc_id: Principal
    susd_id: Principal
}
export type MinterArg = { Upgrade: [] | [UpgradeArgs] } | { Init: InitArgs }
export interface MinterInfo {
    retrieve_btc_min_amount: bigint
    min_confirmations: number
    kyt_fee: bigint
}
export type Mode =
    | { RestrictedTo: Array<Principal> }
    | { DepositsRestrictedTo: Array<Principal> }
    | { ReadOnly: null }
    | { GeneralAvailability: null }
export interface PendingUtxo {
    confirmations: number
    value: bigint
    outpoint: { txid: Uint8Array | number[]; vout: number }
}
export interface RegisterProviderArgs {
    cyclesPerCall: bigint
    credentialPath: string
    hostname: string
    credentialHeaders: [] | [Array<HttpHeader>]
    chainId: bigint
    cyclesPerMessageByte: bigint
}
export type ServiceProvider = { Chain: bigint } | { Provider: bigint }
export type UpdateBalanceError =
    | {
          GenericError: { error_message: string; error_code: bigint }
      }
    | { TemporarilyUnavailable: string }
    | { AlreadyProcessing: null }
    | {
          NoNewUtxos: {
              required_confirmations: number
              pending_utxos: [] | [Array<PendingUtxo>]
              current_confirmations: [] | [number]
          }
      }
export interface UpgradeArgs {
    kyt_principal: [] | [Principal]
    mode: [] | [Mode]
    retrieve_btc_min_amount: [] | [bigint]
    max_time_in_queue_nanos: [] | [bigint]
    min_confirmations: [] | [number]
    kyt_fee: [] | [bigint]
}
export interface Utxo {
    height: number
    value: bigint
    outpoint: { txid: Uint8Array | number[]; vout: number }
}
export type UtxoStatus =
    | { ValueTooSmall: Utxo }
    | { Tainted: Utxo }
    | {
          Minted: {
              minted_amount: bigint
              block_index: bigint
              utxo: Utxo
          }
      }
    | { Checked: Utxo }
    | { TransferInscription: Utxo }
export type bitcoin_address = string
export type block_hash = Uint8Array | number[]
export interface get_utxos_response {
    next_page: [] | [Uint8Array | number[]]
    tip_height: number
    tip_block_hash: block_hash
    utxos: Array<utxo>
}
export type millisatoshi_per_vbyte = bigint
export type network =
    | { mainnet: null }
    | { regtest: null }
    | { signet: null }
    | { testnet: null }
export interface outpoint {
    txid: Uint8Array | number[]
    vout: number
}
export type satoshi = bigint
export type syron_operation =
    | { getsyron: null }
    | { liquidation: null }
    | { redeembitcoin: null }
    | { payment: null }
export type transaction_id = string
export interface utxo {
    height: number
    value: satoshi
    outpoint: outpoint
}
export interface _SERVICE {
    addServiceProvider: ActorMethod<[RegisterProviderArgs], bigint>
    buy_btc: ActorMethod<
        [GetBoxAddressArgs, bigint, bigint, bigint],
        { Ok: Array<string> } | { Err: UpdateBalanceError }
    >
    getServiceProviderMap: ActorMethod<[], Array<[ServiceProvider, bigint]>>
    get_account: ActorMethod<
        [bitcoin_address],
        { Ok: CollateralizedAccount } | { Err: UpdateBalanceError }
    >
    get_box_address: ActorMethod<[GetBoxAddressArgs], bitcoin_address>
    get_current_fee_percentiles: ActorMethod<[], BigUint64Array | bigint[]>
    get_dao_addr: ActorMethod<[], Array<bitcoin_address>>
    get_fee_percentile: ActorMethod<[bigint], bigint>
    get_indexed_balance: ActorMethod<
        [string],
        { Ok: string } | { Err: UpdateBalanceError }
    >
    get_inscription: ActorMethod<
        [string, bigint, bigint],
        { Ok: string } | { Err: UpdateBalanceError }
    >
    get_minter_info: ActorMethod<[], MinterInfo>
    get_p2wpkh_address: ActorMethod<[], bitcoin_address>
    get_subaccount: ActorMethod<
        [bigint, bitcoin_address],
        Uint8Array | number[]
    >
    get_utxo_txids: ActorMethod<[bitcoin_address], Array<string>>
    liquidate: ActorMethod<
        [GetBoxAddressArgs, string, string, bigint, bigint],
        { Ok: Array<string> } | { Err: UpdateBalanceError }
    >
    read_account: ActorMethod<[bitcoin_address], BigUint64Array | bigint[]>
    redeem_btc: ActorMethod<
        [GetBoxAddressArgs, string, bigint, bigint],
        { Ok: string } | { Err: UpdateBalanceError }
    >
    redemption_gas: ActorMethod<
        [GetBoxAddressArgs],
        { Ok: bigint } | { Err: UpdateBalanceError }
    >
    sbtc_balance_of: ActorMethod<[bitcoin_address, bigint], bigint>
    send_syron: ActorMethod<
        [GetBoxAddressArgs, bitcoin_address, bigint],
        { Ok: BigUint64Array | bigint[] } | { Err: UpdateBalanceError }
    >
    susd_balance_of: ActorMethod<[bitcoin_address, bigint], bigint>
    syron_withdrawal: ActorMethod<
        [GetBoxAddressArgs, string, bigint, bigint, bigint, bigint],
        { Ok: string } | { Err: UpdateBalanceError }
    >
    update_ssi_balance: ActorMethod<
        [GetBoxAddressArgs],
        { Ok: Array<UtxoStatus> } | { Err: UpdateBalanceError }
    >
    withdraw_susd: ActorMethod<
        [GetBoxAddressArgs, string, bigint, bigint, bigint],
        { Ok: string } | { Err: UpdateBalanceError }
    >
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[]
