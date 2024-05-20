export const idlFactory = ({ IDL }) => {
    const network = IDL.Variant({
        mainnet: IDL.Null,
        regtest: IDL.Null,
        signet: IDL.Null,
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
        Signet: IDL.Null,
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
    const HttpHeader = IDL.Record({ value: IDL.Text, name: IDL.Text })
    const RegisterProviderArgs = IDL.Record({
        cyclesPerCall: IDL.Nat64,
        credentialPath: IDL.Text,
        hostname: IDL.Text,
        credentialHeaders: IDL.Opt(IDL.Vec(HttpHeader)),
        chainId: IDL.Nat64,
        cyclesPerMessageByte: IDL.Nat64,
    })
    const ServiceProvider = IDL.Variant({
        Chain: IDL.Nat64,
        Provider: IDL.Nat64,
    })
    const bitcoin_address = IDL.Text
    const satoshi = IDL.Nat64
    const syron_operation = IDL.Variant({
        getsyron: IDL.Null,
        redeembitcoin: IDL.Null,
    })
    const GetBoxAddressArgs = IDL.Record({
        op: syron_operation,
        ssi: bitcoin_address,
    })
    const millisatoshi_per_vbyte = IDL.Nat64
    const MinterInfo = IDL.Record({
        retrieve_btc_min_amount: IDL.Nat64,
        min_confirmations: IDL.Nat32,
        kyt_fee: IDL.Nat64,
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
        TransferInscription: Utxo,
    })
    return IDL.Service({
        addServiceProvider: IDL.Func([RegisterProviderArgs], [IDL.Nat64], []),
        getServiceProviderMap: IDL.Func(
            [],
            [IDL.Vec(IDL.Tuple(ServiceProvider, IDL.Nat64))],
            ['query']
        ),
        get_balance: IDL.Func([bitcoin_address], [satoshi], []),
        get_box_address: IDL.Func([GetBoxAddressArgs], [bitcoin_address], []),
        get_current_fee_percentiles: IDL.Func(
            [],
            [IDL.Vec(millisatoshi_per_vbyte)],
            []
        ),
        get_minter_info: IDL.Func([], [MinterInfo], ['query']),
        get_network: IDL.Func([], [network], []),
        get_p2pkh_address: IDL.Func([], [bitcoin_address], []),
        get_p2wpkh_address: IDL.Func([], [bitcoin_address], []),
        get_subaccount: IDL.Func(
            [IDL.Nat64, bitcoin_address],
            [IDL.Vec(IDL.Nat8)],
            ['query']
        ),
        get_susd: IDL.Func(
            [GetBoxAddressArgs, IDL.Text],
            [IDL.Variant({ Ok: IDL.Text, Err: UpdateBalanceError })],
            []
        ),
        get_utxos: IDL.Func([bitcoin_address], [get_utxos_response], []),
        redeem_btc: IDL.Func(
            [GetBoxAddressArgs, IDL.Text],
            [IDL.Variant({ Ok: IDL.Text, Err: UpdateBalanceError })],
            []
        ),
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
        test: IDL.Func([], [IDL.Vec(IDL.Text)], []),
        update_ssi: IDL.Func([GetBoxAddressArgs], [IDL.Text], []),
        update_ssi_balance: IDL.Func(
            [GetBoxAddressArgs],
            [
                IDL.Variant({
                    Ok: IDL.Vec(UtxoStatus),
                    Err: UpdateBalanceError,
                }),
            ],
            []
        ),
        withdraw_susd: IDL.Func(
            [GetBoxAddressArgs, IDL.Text, IDL.Nat64, IDL.Nat64],
            [IDL.Variant({ Ok: IDL.Text, Err: UpdateBalanceError })],
            []
        ),
    })
}
export const init = ({ IDL }) => {
    const network = IDL.Variant({
        mainnet: IDL.Null,
        regtest: IDL.Null,
        signet: IDL.Null,
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
        Signet: IDL.Null,
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
