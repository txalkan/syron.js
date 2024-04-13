import type { Principal } from '@dfinity/principal'
import type { ActorMethod } from '@dfinity/agent'
import type { IDL } from '@dfinity/candid'

export type BtcNetwork =
    | { Mainnet: null }
    | { Regtest: null }
    | { Testnet: null }
export interface InitArgs {
    ecdsa_key_name: string
    mode: Mode
    retrieve_btc_min_amount: bigint
    ledger_id: Principal
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
export type network = { mainnet: null } | { regtest: null } | { testnet: null }
export interface outpoint {
    txid: Uint8Array | number[]
    vout: number
}
export type satoshi = bigint
export type transaction_id = string
export interface utxo {
    height: number
    value: satoshi
    outpoint: outpoint
}
export interface _SERVICE {
    get_balance: ActorMethod<[bitcoin_address], satoshi>
    get_box_address: ActorMethod<[{ ssi: bitcoin_address }], bitcoin_address>
    get_current_fee_percentiles: ActorMethod<[], BigUint64Array | bigint[]>
    get_minter_info: ActorMethod<[], MinterInfo>
    get_p2pkh_address: ActorMethod<[], bitcoin_address>
    get_p2wpkh_address: ActorMethod<[], bitcoin_address>
    get_subaccount: ActorMethod<[bitcoin_address], Uint8Array | number[]>
    get_susd: ActorMethod<[{ ssi: string }, string], string>
    get_utxos: ActorMethod<[bitcoin_address], get_utxos_response>
    send: ActorMethod<
        [
            {
                destination_address: bitcoin_address
                amount_in_satoshi: satoshi
            }
        ],
        transaction_id
    >
    test: ActorMethod<[], Array<string>>
    update_balance: ActorMethod<
        [
            {
                ssi: string
                owner: [] | [Principal]
                subaccount: [] | [Uint8Array | number[]]
            }
        ],
        { Ok: Array<UtxoStatus> } | { Err: UpdateBalanceError }
    >
    update_ssi: ActorMethod<[{ ssi: string }], string>
}
export declare const idlFactory: IDL.InterfaceFactory
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[]
