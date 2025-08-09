import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export type BtcNetwork = { 'Mainnet' : null } |
  { 'Regtest' : null } |
  { 'Testnet' : null } |
  { 'Signet' : null };
export interface CollateralizedAccount {
  'collateral_ratio' : bigint,
  'susd_1' : bigint,
  'susd_2' : bigint,
  'susd_3' : bigint,
  'btc_1' : bigint,
  'exchange_rate' : bigint,
}
export interface GetBoxAddressArgs {
  'op' : syron_operation,
  'ssi' : bitcoin_address,
}
export interface GetRunesMinter {
  'sats_utxos' : Array<utxo>,
  'runes_utxos' : Array<utxo>,
}
export interface HttpHeader { 'value' : string, 'name' : string }
export interface InitArgs {
  'min_deposit' : [] | [bigint],
  'ecdsa_key_name' : string,
  'mode' : Mode,
  'retrieve_btc_min_amount' : bigint,
  'ledger_id' : Principal,
  'siwb_id' : Principal,
  'max_time_in_queue_nanos' : bigint,
  'btc_network' : BtcNetwork,
  'min_confirmations' : [] | [number],
  'xrc_id' : Principal,
  'susd_id' : Principal,
}
export type MinterArg = { 'Upgrade' : [] | [UpgradeArgs] } |
  { 'Init' : InitArgs };
export interface MinterInfo {
  'retrieve_btc_min_amount' : bigint,
  'min_confirmations' : number,
  'kyt_fee' : bigint,
}
export type Mode = { 'RestrictedTo' : Array<Principal> } |
  { 'DepositsRestrictedTo' : Array<Principal> } |
  { 'ReadOnly' : null } |
  { 'GeneralAvailability' : null };
export interface PendingUtxo {
  'confirmations' : number,
  'value' : bigint,
  'outpoint' : { 'txid' : Uint8Array | number[], 'vout' : number },
}
export interface RegisterProviderArgs {
  'cyclesPerCall' : bigint,
  'credentialPath' : string,
  'hostname' : string,
  'credentialHeaders' : [] | [Array<HttpHeader>],
  'chainId' : bigint,
  'cyclesPerMessageByte' : bigint,
}
export interface ReimbursedDeposit {
  'account' : Account,
  'mint_block_index' : bigint,
  'amount' : bigint,
  'reason' : ReimbursementReason,
}
export type ReimbursementReason = { 'CallFailed' : null } |
  { 'TaintedDestination' : { 'kyt_fee' : bigint, 'kyt_provider' : Principal } };
export interface ReimbursementRequest {
  'account' : Account,
  'amount' : bigint,
  'reason' : ReimbursementReason,
}
export type RetrieveBtcError = { 'MalformedAddress' : string } |
  { 'GenericError' : { 'error_message' : string, 'error_code' : bigint } } |
  { 'TemporarilyUnavailable' : string } |
  { 'AlreadyProcessing' : null } |
  { 'AmountTooLow' : bigint } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface RetrieveBtcOk { 'block_index' : bigint }
export type RetrieveBtcStatusV2 = { 'Signing' : null } |
  { 'Confirmed' : { 'txid' : string } } |
  { 'Sending' : { 'txid' : string } } |
  { 'AmountTooLow' : null } |
  { 'WillReimburse' : ReimbursementRequest } |
  { 'Unknown' : null } |
  { 'Submitted' : { 'txid' : string } } |
  { 'Reimbursed' : ReimbursedDeposit } |
  { 'Pending' : null };
export type ServiceProvider = { 'Chain' : bigint } |
  { 'Provider' : bigint };
export type UpdateBalanceError = {
    'GenericError' : { 'error_message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : string } |
  { 'AlreadyProcessing' : null } |
  { 'CallError' : { 'method' : string, 'reason' : string } } |
  {
    'NoNewUtxos' : {
      'required_confirmations' : number,
      'pending_utxos' : [] | [Array<PendingUtxo>],
      'current_confirmations' : [] | [number],
    }
  };
export interface UpgradeArgs {
  'min_deposit' : [] | [bigint],
  'kyt_principal' : [] | [Principal],
  'mode' : [] | [Mode],
  'retrieve_btc_min_amount' : [] | [bigint],
  'max_time_in_queue_nanos' : [] | [bigint],
  'min_confirmations' : [] | [number],
  'kyt_fee' : [] | [bigint],
}
export interface Utxo {
  'height' : number,
  'value' : bigint,
  'outpoint' : { 'txid' : Uint8Array | number[], 'vout' : number },
}
export type UtxoStatus = { 'ValueTooSmall' : Utxo } |
  { 'Tainted' : Utxo } |
  { 'Read' : Utxo } |
  {
    'Minted' : {
      'minted_amount' : bigint,
      'block_index' : bigint,
      'utxo' : Utxo,
    }
  } |
  { 'Checked' : Utxo } |
  { 'TransferInscription' : Utxo };
export type bitcoin_address = string;
export type block_hash = Uint8Array | number[];
export interface get_utxos_response {
  'next_page' : [] | [Uint8Array | number[]],
  'tip_height' : number,
  'tip_block_hash' : block_hash,
  'utxos' : Array<utxo>,
}
export type millisatoshi_per_vbyte = bigint;
export type network = { 'mainnet' : null } |
  { 'regtest' : null } |
  { 'signet' : null } |
  { 'testnet' : null };
export interface outpoint { 'txid' : Uint8Array | number[], 'vout' : number }
export type satoshi = bigint;
export type syron_operation = { 'getsyron' : null } |
  { 'liquidation' : null } |
  { 'redeembitcoin' : null } |
  { 'depositsyron' : null } |
  { 'payment' : null };
export type transaction_id = string;
export interface utxo {
  'height' : number,
  'value' : satoshi,
  'outpoint' : outpoint,
}
export interface _SERVICE {
  'addServiceProvider' : ActorMethod<[RegisterProviderArgs], bigint>,
  'buy_btc' : ActorMethod<
    [GetBoxAddressArgs, bigint, bigint, bigint],
    { 'Ok' : Array<string> } |
      { 'Err' : UpdateBalanceError }
  >,
  'deposit_brc20_and_redeem_btc' : ActorMethod<
    [GetBoxAddressArgs, string, bigint, bigint],
    { 'Ok' : string } |
      { 'Err' : UpdateBalanceError }
  >,
  'deposit_syron_runes' : ActorMethod<
    [GetBoxAddressArgs, bigint],
    { 'Ok' : Array<UtxoStatus> } |
      { 'Err' : UpdateBalanceError }
  >,
  'getServiceProviderMap' : ActorMethod<[], Array<[ServiceProvider, bigint]>>,
  'get_account' : ActorMethod<
    [bitcoin_address],
    { 'Ok' : CollateralizedAccount } |
      { 'Err' : UpdateBalanceError }
  >,
  'get_box_address' : ActorMethod<[GetBoxAddressArgs], bitcoin_address>,
  'get_dao_addr' : ActorMethod<[], Array<bitcoin_address>>,
  'get_minter_info' : ActorMethod<[], MinterInfo>,
  'get_subaccount' : ActorMethod<
    [bigint, bitcoin_address],
    Uint8Array | number[]
  >,
  'liquidate' : ActorMethod<
    [GetBoxAddressArgs, string, string, bigint, bigint],
    { 'Ok' : Array<string> } |
      { 'Err' : UpdateBalanceError }
  >,
  'read_account' : ActorMethod<[bitcoin_address], BigUint64Array | bigint[]>,
  'read_runes_minter' : ActorMethod<[], GetRunesMinter>,
  'redeem_btc' : ActorMethod<
    [GetBoxAddressArgs, bigint],
    { 'Ok' : string } |
      { 'Err' : UpdateBalanceError }
  >,
  'retrieve_btc_status_v2' : ActorMethod<
    [{ 'block_index' : bigint }],
    RetrieveBtcStatusV2
  >,
  'sbtc_balance_of' : ActorMethod<[bitcoin_address, bigint], bigint>,
  'send_syron' : ActorMethod<
    [GetBoxAddressArgs, string, bigint],
    { 'Ok' : BigUint64Array | bigint[] } |
      { 'Err' : UpdateBalanceError }
  >,
  'susd_balance_of' : ActorMethod<[bitcoin_address, bigint], bigint>,
  'syron_withdrawal' : ActorMethod<
    [GetBoxAddressArgs, string, bigint, bigint, bigint, bigint],
    { 'Ok' : string } |
      { 'Err' : UpdateBalanceError }
  >,
  'syron_withdrawal_runes' : ActorMethod<
    [GetBoxAddressArgs, bigint],
    { 'Ok' : RetrieveBtcOk } |
      { 'Err' : UpdateBalanceError }
  >,
  'update_runes_minter' : ActorMethod<
    [bigint],
    { 'Ok' : Array<UtxoStatus> } |
      { 'Err' : UpdateBalanceError }
  >,
  'update_ssi_balance' : ActorMethod<
    [GetBoxAddressArgs],
    { 'Ok' : Array<UtxoStatus> } |
      { 'Err' : UpdateBalanceError }
  >,
  'withdraw_susd' : ActorMethod<
    [GetBoxAddressArgs, string, bigint, bigint, bigint],
    { 'Ok' : string } |
      { 'Err' : UpdateBalanceError }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
