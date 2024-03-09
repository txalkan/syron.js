export const idlFactory = ({ IDL }) => {
    const network = IDL.Variant({
        mainnet: IDL.Null,
        regtest: IDL.Null,
        testnet: IDL.Null,
    })
    const Mode = IDL.Variant({
        RestrictedTo: IDL.Vec(IDL.Principal),
        DepositsRestrictedTo: IDL.Vec(IDL.Principal),
        ReadOnly: IDL.Null,
        GeneralAvailability: IDL.Null,
    })
    const UpgradeArgs = IDL.Record({
        kyt_principal: IDL.Opt(IDL.Principal),
        mode: IDL.Opt(Mode),
        retrieve_btc_min_amount: IDL.Opt(IDL.Nat64),
        max_time_in_queue_nanos: IDL.Opt(IDL.Nat64),
        min_confirmations: IDL.Opt(IDL.Nat32),
        kyt_fee: IDL.Opt(IDL.Nat64),
    })
    const BtcNetwork = IDL.Variant({
        Mainnet: IDL.Null,
        Regtest: IDL.Null,
        Testnet: IDL.Null,
    })
    const InitArgs = IDL.Record({
        ecdsa_key_name: IDL.Text,
        mode: Mode,
        retrieve_btc_min_amount: IDL.Nat64,
        ledger_id: IDL.Principal,
        max_time_in_queue_nanos: IDL.Nat64,
        btc_network: BtcNetwork,
        min_confirmations: IDL.Opt(IDL.Nat32),
        xrc_id: IDL.Principal,
        susd_id: IDL.Principal,
    })
    const MinterArg = IDL.Variant({
        Upgrade: IDL.Opt(UpgradeArgs),
        Init: InitArgs,
    })
    const bitcoin_address = IDL.Text
    const satoshi = IDL.Nat64
    const millisatoshi_per_vbyte = IDL.Nat64
    const block_hash = IDL.Vec(IDL.Nat8)
    const outpoint = IDL.Record({
        txid: IDL.Vec(IDL.Nat8),
        vout: IDL.Nat32,
    })
    const utxo = IDL.Record({
        height: IDL.Nat32,
        value: satoshi,
        outpoint: outpoint,
    })
    const get_utxos_response = IDL.Record({
        next_page: IDL.Opt(IDL.Vec(IDL.Nat8)),
        tip_height: IDL.Nat32,
        tip_block_hash: block_hash,
        utxos: IDL.Vec(utxo),
    })
    const transaction_id = IDL.Text
    const Utxo = IDL.Record({
        height: IDL.Nat32,
        value: IDL.Nat64,
        outpoint: IDL.Record({ txid: IDL.Vec(IDL.Nat8), vout: IDL.Nat32 }),
    })
    const UtxoStatus = IDL.Variant({
        ValueTooSmall: Utxo,
        Tainted: Utxo,
        Minted: IDL.Record({
            minted_amount: IDL.Nat64,
            block_index: IDL.Nat64,
            utxo: Utxo,
        }),
        Checked: Utxo,
    })
    const PendingUtxo = IDL.Record({
        confirmations: IDL.Nat32,
        value: IDL.Nat64,
        outpoint: IDL.Record({ txid: IDL.Vec(IDL.Nat8), vout: IDL.Nat32 }),
    })
    const UpdateBalanceError = IDL.Variant({
        GenericError: IDL.Record({
            error_message: IDL.Text,
            error_code: IDL.Nat64,
        }),
        TemporarilyUnavailable: IDL.Text,
        AlreadyProcessing: IDL.Null,
        NoNewUtxos: IDL.Record({
            required_confirmations: IDL.Nat32,
            pending_utxos: IDL.Opt(IDL.Vec(PendingUtxo)),
            current_confirmations: IDL.Opt(IDL.Nat32),
        }),
    })
    return IDL.Service({
        get_balance: IDL.Func([bitcoin_address], [satoshi], []),
        get_btc_address: IDL.Func(
            [IDL.Record({ ssi: bitcoin_address })],
            [bitcoin_address],
            []
        ),
        get_current_fee_percentiles: IDL.Func(
            [],
            [IDL.Vec(millisatoshi_per_vbyte)],
            []
        ),
        get_p2pkh_address: IDL.Func([], [bitcoin_address], []),
        get_subaccount: IDL.Func([bitcoin_address], [IDL.Vec(IDL.Nat8)], []),
        get_utxos: IDL.Func([bitcoin_address], [get_utxos_response], []),
        get_xr: IDL.Func([], [IDL.Nat64], []),
        send: IDL.Func(
            [
                IDL.Record({
                    destination_address: bitcoin_address,
                    amount_in_satoshi: satoshi,
                }),
            ],
            [transaction_id],
            []
        ),
        update_balance: IDL.Func(
            [
                IDL.Record({
                    ssi: IDL.Text,
                    owner: IDL.Opt(IDL.Principal),
                    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
                }),
            ],
            [
                IDL.Variant({
                    Ok: IDL.Vec(UtxoStatus),
                    Err: UpdateBalanceError,
                }),
            ],
            []
        ),
    })
}
export const init = ({ IDL }) => {
    const network = IDL.Variant({
        mainnet: IDL.Null,
        regtest: IDL.Null,
        testnet: IDL.Null,
    })
    const Mode = IDL.Variant({
        RestrictedTo: IDL.Vec(IDL.Principal),
        DepositsRestrictedTo: IDL.Vec(IDL.Principal),
        ReadOnly: IDL.Null,
        GeneralAvailability: IDL.Null,
    })
    const UpgradeArgs = IDL.Record({
        kyt_principal: IDL.Opt(IDL.Principal),
        mode: IDL.Opt(Mode),
        retrieve_btc_min_amount: IDL.Opt(IDL.Nat64),
        max_time_in_queue_nanos: IDL.Opt(IDL.Nat64),
        min_confirmations: IDL.Opt(IDL.Nat32),
        kyt_fee: IDL.Opt(IDL.Nat64),
    })
    const BtcNetwork = IDL.Variant({
        Mainnet: IDL.Null,
        Regtest: IDL.Null,
        Testnet: IDL.Null,
    })
    const InitArgs = IDL.Record({
        ecdsa_key_name: IDL.Text,
        mode: Mode,
        retrieve_btc_min_amount: IDL.Nat64,
        ledger_id: IDL.Principal,
        max_time_in_queue_nanos: IDL.Nat64,
        btc_network: BtcNetwork,
        min_confirmations: IDL.Opt(IDL.Nat32),
        xrc_id: IDL.Principal,
        susd_id: IDL.Principal,
    })
    const MinterArg = IDL.Variant({
        Upgrade: IDL.Opt(UpgradeArgs),
        Init: InitArgs,
    })
    return [network, MinterArg]
}
