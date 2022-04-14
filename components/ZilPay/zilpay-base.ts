import * as tyron from 'tyron';
import { ZIlPayInject } from "../../src/types/zil-pay";
import * as zutil from "@zilliqa-js/util";
import { toast } from "react-toastify"

type Params = {
  contractAddress: string;
  transition: string;
  params: Record<string, unknown>[];
  amount: string;
};

const window = global.window as any;
const DEFAULT_GAS = {
  gasPrice: "2000",
  gaslimit: "10000",
};

export class ZilPayBase {
  public zilpay: () => Promise<ZIlPayInject>;

  constructor() {
    this.zilpay = () =>
      new Promise((resolve, reject) => {
        if (!(process as any).browser) {
          return resolve({} as any);
        }
        let k = 0;
        const i = setInterval(() => {
          if (k >= 10) {
            clearInterval(i);
            return reject(new Error("ZilPay is not installed."));
          }

          if (typeof window["zilPay"] !== "undefined") {
            clearInterval(i);
            return resolve(window["zilPay"]);
          }

          k++;
        }, 100);
      });
  }

  async getSubState(contract: string, field: string, params: string[] = []) {
    if (!(process as any).browser) {
      return null;
    }

    const zilPay = await this.zilpay();
    const res = await zilPay.blockchain.getSmartContractSubState(
      contract,
      field,
      params
    );

    if (res.error) {
      throw new Error(res.error.message);
    }

    if (res.result && res.result[field] && params.length === 0) {
      return res.result[field];
    }

    if (res.result && res.result[field] && params.length === 1) {
      const [arg] = params;
      return res.result[field][arg];
    }

    if (res.result && res.result[field] && params.length > 1) {
      return res.result[field];
    }

    return null;
  }

  async getState(contract: string) {
    if (!(process as any).browser) {
      return null;
    }
    const zilPay = await this.zilpay();
    const res = await zilPay.blockchain.getSmartContractState(contract);

    if (res.error) {
      throw new Error(res.error.message);
    }

    return res.result;
  }

  async getBlockchainInfo() {
    if (!(process as any).browser) {
      return null;
    }

    const zilPay = await this.zilpay();
    const { error, result } = await zilPay.blockchain.getBlockChainInfo();

    if (error) {
      throw new Error(error.message);
    }

    return result;
  }

  async call(data: Params, gas?: any) {
    let this_gas = DEFAULT_GAS;
    if (gas !== undefined) {
      this_gas = gas;
    }
    const zilPay = await this.zilpay();
    const { contracts, utils } = zilPay;
    const contract = contracts.at(data.contractAddress);
    const gasPrice = utils.units.toQa(this_gas.gasPrice, utils.units.Units.Li);
    const gasLimit = utils.Long.fromNumber(this_gas.gaslimit);
    const amount_ = zutil.units.toQa(data.amount, zutil.units.Units.Zil);

    const amount = amount_ || "0";

    return await contract.call(data.transition, data.params, {
      amount,
      gasPrice,
      gasLimit,
    });
  }

  async deployToken(net: string) {
    try {
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;
      let previous_version = '0x6855426da6b79a77241b6a59e971b997133078c9';
      let contract_owner = '0x8b7ff253d53429fb5576a241d7d25c6770205c87';//@todo-2

      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
        previous_version = '0x68c7c3b5fb665f90a80aba656c05394ecef1fbe9';
        contract_owner = '0xc510aa56484c7cf5150b90c190e733b1722eb1d9';
      }
      const init = new tyron.ZilliqaInit.default(network);

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      //@todo-x
      const code =
        `
        (* v3.0.0
          token.tyron: Fungible Token DApp <> Proxy smart contract
          Self-Sovereign Identity Protocol
          Copyright (C) Tyron Mapu Community Interest Company and its affiliates.
          www.ssiprotocol.com
          
          This program is free software: you can redistribute it and/or modify
          it under the terms of the GNU General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
          
          This program is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU General Public License for more details.*)
          
          scilla_version 0
          
          import BoolUtils IntUtils
          
          library FungibleToken
            let one_msg =
              fun( msg: Message ) =>
              let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
          
            type Error =
              | CodeWrongStatus
              | CodeWrongCaller
              | CodeIsNull
              | CodeSameAddress
          
            let make_error = fun( error: Error ) =>
              let result = match error with
              | CodeWrongStatus            => Int32 0
              | CodeWrongCaller            => Int32 -1
              | CodeIsNull                 => Int32 -2
              | CodeSameAddress            => Int32 -3
              end in { _exception: "Error"; code: result }
            
            let zero = Uint128 0
            
            type Caller =
              | Controller
              | Implementation
            
            let controller_ = Controller
            let implementation_ = Implementation
            
          contract FungibleToken(
            contract_owner: ByStr20 with contract 
              field nft_username: String,
              field paused: Bool,
              field xinit: ByStr20 with contract field dApp: ByStr20 with contract
                field implementation: ByStr20 with contract
                  field utility: Map String Map String Uint128 end,
                field dns: Map String ByStr20,
                field did_dns: Map String ByStr20 with contract
                  field did: String,   (* the W3C decentralized identifier *)
                  field nft_username: String,
                  field controller: ByStr20,
                  field version: String,
                  field verification_methods: Map String ByStr33,
                  field services: Map String ByStr20,
                  field did_domain_dns: Map String ByStr20 end end end end,
            name: String,
            symbol: String,
            decimals: Uint32,
            init_supply: Uint128,
            init_balances: Map ByStr20 Uint128
            )
            with
              let string_is_not_empty = fun( s : String ) =>
                let zero = Uint32 0 in
                let s_length = builtin strlen s in
                let s_empty = builtin eq s_length zero in
                negb s_empty in
              let name_ok = string_is_not_empty name in
              let symbol_ok = string_is_not_empty symbol in
                let name_symbol_ok = andb name_ok symbol_ok in
              let decimals_ok =
                let six = Uint32 6 in
                let eighteen = Uint32 18 in
                let decimals_at_least_6 = uint32_le six decimals in
                let decimals_no_more_than_18 = uint32_le decimals eighteen in
                andb decimals_at_least_6 decimals_no_more_than_18 in
                andb name_symbol_ok decimals_ok
            =>
            field implementation: ByStr20 with contract
              field nft_username: String,
              field paused: Bool,
              field xinit: ByStr20 with contract field dApp: ByStr20 with contract
                field implementation: ByStr20 with contract
                field utility: Map String Map String Uint128 end,
                  field dns: Map String ByStr20,
                field did_dns: Map String ByStr20 with contract
                  field did: String,   (* the W3C decentralized identifier *)
                  field nft_username: String,
                  field controller: ByStr20,
                  field version: String,
                  field verification_methods: Map String ByStr33,
                  field services: Map String ByStr20,
                  field did_domain_dns: Map String ByStr20 end end end end = contract_owner
            field balances: Map ByStr20 Uint128 = init_balances
            field total_supply: Uint128 = init_supply
            field allowances: Map ByStr20 ( Map ByStr20 Uint128 ) = Emp ByStr20 ( Map ByStr20 Uint128 )
            field version: String = "token---3.0.0" (* @todo update *)
            
          procedure ThrowError( err: Error )
            e = make_error err; throw e end
            
          procedure VerifyCaller( caller: Caller )
            current_impl <- implementation;
            is_paused <-& current_impl.paused; match is_paused with
            | False => | True => err = CodeWrongStatus; ThrowError err end;
            match caller with
            | Controller =>
                current_username <-& current_impl.nft_username;
                init <-& current_impl.xinit; current_init <-& init.dApp;
                get_did <-& current_init.did_dns[current_username]; match get_did with
                | None => err = CodeIsNull; ThrowError err
                | Some did_ =>
                    current_controller <-& did_.controller;
                    verified = builtin eq _origin current_controller; match verified with
                    | True => | False => err = CodeWrongCaller; ThrowError err end end
            | Implementation =>
                verified = builtin eq _sender current_impl; match verified with
                | True => | False => err = CodeWrongCaller; ThrowError err end end end
          
          procedure ThrowIfSameAddr(
            a: ByStr20,
            b: ByStr20
            )
            is_self = builtin eq a b; match is_self with
            | False => | True => err = CodeSameAddress; ThrowError err end end
          
          transition UpdateImplementation(
            addr: ByStr20 with contract
              field nft_username: String,
              field paused: Bool,
              field xinit: ByStr20 with contract field dApp: ByStr20 with contract
                field implementation: ByStr20 with contract
                  field utility: Map String Map String Uint128 end,
                field dns: Map String ByStr20,
                field did_dns: Map String ByStr20 with contract
                  field did: String,   (* the W3C decentralized identifier *)
                  field nft_username: String,
                  field controller: ByStr20,
                  field version: String,
                  field verification_methods: Map String ByStr33,
                  field services: Map String ByStr20,
                  field did_domain_dns: Map String ByStr20 end end end end
            )
            VerifyCaller controller_; current_impl <- implementation; ThrowIfSameAddr current_impl addr;
            implementation := addr;
            e = { _eventname: "ImplementationUpdated";
              newImplementation: addr }; event e end
          
          transition Mint(
            beneficiary: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = { _tag: "Mint"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              beneficiary: beneficiary;
              amount: amount
            } in one_msg m; send msg end
          
          transition Burn(
            beneficiary: Uint128, 
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = {
              _tag: "Burn"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              beneficiary: beneficiary;
              amount: amount
            } in one_msg m; send msg end
          
          transition TransmuteCallBack(
            beneficiary: ByStr20,
            newBalance: Uint128,
            newSupply: Uint128
            )
            VerifyCaller implementation_;
            balances[beneficiary] := newBalance;
            total_supply := newSupply end
            
          transition Transfer(
            to: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = { _tag: "Transfer"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              beneficiary: to;
              amount: amount } in one_msg m; send msg end
          
          transition TransferCallBack(
            originator: ByStr20,
            beneficiary: ByStr20,
            originatorBal: Uint128,
            beneficiaryBal: Uint128
            )
            VerifyCaller implementation_;
            balances[originator] := originatorBal;
            balances[beneficiary] := beneficiaryBal;
            e = {
              _eventname: "TransferSuccess";
              sender: originator;
              recipient: beneficiary
            }; event e end
          
          transition IncreaseAllowance(
            spender: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = { _tag: "IncreaseAllowance"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              spender: spender;
              amount: amount } in one_msg m; send msg end
          
          transition DecreaseAllowance(
            spender: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = {
              _tag: "DecreaseAllowance"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              spender: spender;
              amount: amount } in one_msg m; send msg end
          
          transition AllowanceCallBack(
            originator: ByStr20,
            spender: ByStr20,
            newAllowance: Uint128
            )
            VerifyCaller implementation_;
            allowances[originator][spender] := newAllowance end
          
          transition TransferFrom(
            from: ByStr20, 
            to: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = { _tag: "TransferFrom"; _recipient: current_impl; _amount: zero;
              originator: from;
              spender: _sender;
              beneficiary: to;
              amount: amount } in one_msg m; send msg end
        `
        ;

      const get_balances = await init.API.blockchain.getSmartContractSubState(
        previous_version,
        "balances"
      );
      const init_bal = Object.entries(get_balances.result.balances)

      let init_balances: Array<{ key: string, val: string }> = [];
      for (let i = 0; i < init_bal.length; i += 1) {
        init_balances.push(
          {
            key: init_bal[i][0],
            val: init_bal[i][1] as string
          },
        );
      };

      const contract_init = [
        {
          vname: '_scilla_version',
          type: 'Uint32',
          value: '0',
        },
        {
          vname: 'contract_owner',
          type: 'ByStr20',
          value: `${contract_owner}`,
        },
        {
          vname: 'name',
          type: 'String',
          value: 'TYRON Token',
        },
        {
          vname: 'symbol',
          type: 'String',
          value: 'TYRON',
        },
        {
          vname: 'decimals',
          type: 'Uint32',
          value: '12',
        },
        {
          vname: 'init_supply',
          type: 'Uint128',
          value: '10000000000000000000',
        },
        {
          vname: 'init_balances',
          type: 'Map ByStr20 Uint128',
          value: init_balances
        }
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
        gasPrice: "2000000000",
      });
      toast.info('You successfully deployed a new token.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error
    }
  }

  async deployImpl(net: string, init_controller: string) {
    try {
      let proxy = '';
      if (net === "testnet") {
        proxy = '0x38e7670000523e81eebac1f0912b280f968e5fb0'
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
        (* v3.0.0
          tokeni.tyron: Fungible Token DApp <> Implementation smart contract
          Self-Sovereign Identity Protocol
          Copyright (C) Tyron Mapu Community Interest Company and its affiliates.
          www.ssiprotocol.com
          
          This program is free software: you can redistribute it and/or modify
          it under the terms of the GNU General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
          
          This program is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU General Public License for more details.*)
          
          scilla_version 0
          
          import IntUtils
          
          library FungibleTokenI
            let one_msg =
              fun( msg: Message ) =>
              let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
          
            let two_msgs =
              fun( msg1: Message ) => fun( msg2: Message ) =>
              let msgs_tmp = one_msg msg2 in Cons{ Message } msg1 msgs_tmp
          
            let three_msgs =
              fun( msg1: Message ) => fun( msg2: Message ) => fun( msg3: Message ) =>
              let msgs_tmp = two_msgs msg2 msg3 in Cons{ Message } msg1 msgs_tmp
          
            let four_msgs =
              fun( msg1: Message ) => fun( msg2: Message ) => fun( msg3: Message ) => fun( msg4: Message ) =>
              let msgs_tmp = three_msgs msg2 msg3 msg4 in Cons{ Message } msg1 msgs_tmp
          
            type Error =
              | CodeNotProxy
              | CodeWrongCaller
              | CodeIsPaused
              | CodeNotPaused
              | CodeIsBlocked
              | CodeNotBlocked
              | CodeSameAddress
              | CodeSameUsername
              | CodeIsNull
              | CodeIsInsufficient
          
            let make_error = fun( error: Error ) =>
              let result = match error with
              | CodeNotProxy               => Int32 -1
              | CodeWrongCaller            => Int32 -2
              | CodeIsPaused               => Int32 -3
              | CodeNotPaused              => Int32 -4
              | CodeIsBlocked              => Int32 -5
              | CodeNotBlocked             => Int32 -6
              | CodeSameAddress            => Int32 -7
              | CodeSameUsername           => Int32 -8
              | CodeIsNull                 => Int32 -9
              | CodeIsInsufficient         => Int32 -10
              end in { _exception: "Error"; code: result }
          
            let zero = Uint128 0
            let true = True
            let false = False
            let zeroByStr20 = 0x0000000000000000000000000000000000000000
          
            let option_value =
              tfun 'A => fun( default: 'A ) => fun( opt_val: Option 'A ) => match opt_val with
              | Some v => v
              | None => default end
          
            let option_uint128_value = let f = @option_value Uint128 in f zero
            let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
          
            let better_subtract =
              fun( a: Uint128 ) => fun( b: Uint128 ) =>
              let a_ge_b = uint128_ge a b in match a_ge_b with
              | True => builtin sub a b
              | False => zero end
            
            type Account =
              | Account of BNum Uint128 Uint128 Uint128
          
          contract FungibleTokenI(
            init_username: String,
            init_controller: ByStr20,
            proxy: ByStr20 with contract 
              field balances: Map ByStr20 Uint128,
              field total_supply: Uint128,
              field allowances: Map ByStr20 ( Map ByStr20 Uint128 ) end,
            init: ByStr20 with contract field dApp: ByStr20 with contract
              field implementation: ByStr20 with contract
                field utility: Map String Map String Uint128 end,
              field dns: Map String ByStr20,
              field did_dns: Map String ByStr20 with contract
                field did: String,   (* the W3C decentralized identifier *)
                field nft_username: String,
                field controller: ByStr20,
                field version: String,
                field verification_methods: Map String ByStr33,
                field services: Map String ByStr20,
                field did_domain_dns: Map String ByStr20 end end end
            )
            field nft_username: String = init_username
            field pending_username: String = ""
          
            field pauser: String = init_username
            field paused: Bool = False
            
            field minter: ByStr20 = init_controller
            
            field lister: String = init_username
            field blocked: Map ByStr20 Bool = Emp ByStr20 Bool
            
            field fund: ByStr20 = init_controller
            field accounts: Map ByStr20 Account = Emp ByStr20 Account
            field lockup_period: Uint128 = Uint128 2900000
          
            field insurance: ByStr20 = init_controller
            
            field xinit: ByStr20 with contract field dApp: ByStr20 with contract
              field implementation: ByStr20 with contract
                field utility: Map String Map String Uint128 end,
              field dns: Map String ByStr20,
              field did_dns: Map String ByStr20 with contract
                field did: String,   (* the W3C decentralized identifier *)
                field nft_username: String,
                field controller: ByStr20,
                field version: String,
                field verification_methods: Map String ByStr33,
                field services: Map String ByStr20,
                field did_domain_dns: Map String ByStr20 end end end = init
                
            field version: String = "tokeni--3.0.0" (* @todo *)
          
          procedure SupportTyron( tyron: Option Uint128 )
            match tyron with
            | None => | Some donation =>
                current_init <-& init.dApp; donateDApp = "donate";
                get_addr <-& current_init.dns[donateDApp]; addr = option_bystr20_value get_addr;
                accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donation } in one_msg m; send msg end end
          
          procedure ThrowError( err: Error )
            e = make_error err; throw e end
          
          procedure ThrowIfNotProxy()
            verified = builtin eq proxy _sender; match verified with
            | True => | False => err= CodeNotProxy; ThrowError err end end
          
          procedure VerifyController( tyron: Option Uint128 )
            current_username <- nft_username; current_init <-& init.dApp;
            get_did <-& current_init.did_dns[current_username]; match get_did with
            | None => err = CodeIsNull; ThrowError err
            | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                | True => | False => err = CodeWrongCaller; ThrowError err end;
                SupportTyron tyron end end
          
          procedure IsPauser()
            current_pauser <- pauser; current_init <-& init.dApp;
            get_did <-& current_init.did_dns[current_pauser]; match get_did with
            | None => err = CodeIsNull; ThrowError err
            | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                | True => | False => err = CodeWrongCaller; ThrowError err end end end
          
          procedure IsPaused()
            is_paused <- paused; match is_paused with
            | True => | False => err = CodeNotPaused; ThrowError err end end
          
          procedure IsNotPaused()
            is_paused <- paused; match is_paused with
            | False => | True => err = CodeIsPaused; ThrowError err end end
          
          procedure IsLister()
            current_lister <- lister; current_init <-& init.dApp;
            get_did <-& current_init.did_dns[current_lister]; match get_did with
            | None => err = CodeIsNull; ThrowError err
            | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                | True => | False => err = CodeWrongCaller; ThrowError err end end end
          
          procedure IsBlocked( addr: ByStr20 )
            is_blocked <- exists blocked[addr]; match is_blocked with
            | True => | False => err = CodeNotBlocked; ThrowError err end end
          
          procedure IsNotNull( addr: ByStr20 )
            is_null = builtin eq zeroByStr20 addr; match is_null with
            | False => | True => err = CodeIsNull; ThrowError err end end
          
          procedure IsNotBlocked( addr: ByStr20 )
            IsNotNull addr;
            is_blocked <- exists blocked[addr]; match is_blocked with
            | False => | True => err = CodeIsBlocked; ThrowError err end end
            
          procedure IsMinter( addr: ByStr20 )
            current_minter <- minter; IsNotBlocked current_minter;
            verified = builtin eq addr current_minter; match verified with
            | True  => | False => err = CodeWrongCaller; ThrowError err end end
          
          procedure ThrowIfSameAddr(
            a: ByStr20,
            b: ByStr20
            )
            is_self = builtin eq a b; match is_self with
            | False => | True => err = CodeSameAddress; ThrowError err end end
          
          procedure IsSufficient(
            value: Uint128,
            amount: Uint128
            )
            is_sufficient = uint128_ge value amount; match is_sufficient with
            | True => | False => err = CodeIsInsufficient; ThrowError err end end
          
          procedure ThrowIfSameName(
            a: String,
            b: String
            )
            is_same = builtin eq a b; match is_same with
            | False => | True => err = CodeSameUsername; ThrowError err end end
          
          transition UpdateUsername(
            username: String,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron;
            current_username <- nft_username; ThrowIfSameName current_username username;
            current_init <-& init.dApp;
            get_did <-& current_init.did_dns[username]; match get_did with
            | None => err = CodeIsNull; ThrowError err
            | Some did_ => pending_username := username end end
          
          transition AcceptPendingUsername()
            IsNotPaused; current_pending <- pending_username;
            current_init <-& init.dApp;
            get_did <-& current_init.did_dns[current_pending]; match get_did with
            | None => err = CodeIsNull; ThrowError err
            | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                | True => | False => err = CodeWrongCaller; ThrowError err end;
                nft_username := current_pending end end
          
          transition UpdatePauser(
            username: String,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron;
            current_pauser <- pauser; ThrowIfSameName current_pauser username;
            pauser := username;
            e = { _eventname: "PauserUpdated";
              newPauser: username }; event e end
          
          transition Pause()
            IsNotPaused; IsPauser; paused := true;
            e = { _eventname: "SmartContractPaused";
              pauser: _sender }; event e end
          
          transition Unpause()
            IsPaused; IsPauser; paused := false;
            e = { _eventname: "SmartContractUnpaused";
              pauser: _sender }; event e end
              
          transition UpdateMinter(
            addr: ByStr20,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron; IsNotNull addr;
            current_minter <- minter; ThrowIfSameAddr current_minter addr;
            minter:= addr;
            e = { _eventname: "MinterUpdated";
              newMinter: addr }; event e end
          
          transition UpdateLister(
            username: String,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron;
            current_lister <- lister; ThrowIfSameName current_lister username;
            lister:= username;
            e = { _eventname: "ListerUpdated";
              newLister: username }; event e end
          
          transition Block( addr: ByStr20 )
            IsNotPaused; IsLister;
            IsNotBlocked addr; blocked[addr] := true;
            e = { _eventname: "AddressBlocked";
              address: addr;
              lister: _origin }; event e end
          
          transition Unblock( addr: ByStr20 )
            IsNotPaused; IsLister;
            IsBlocked addr; delete blocked[addr];
            e = { _eventname: "AddressUnblocked";
              address: addr;
              lister: _origin }; event e end
          
          transition UpdateFund(
            addr: ByStr20,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron; IsNotNull addr;
            current_fund <- fund; ThrowIfSameAddr current_fund addr;
            fund := addr;
            e = { _eventname: "FundAddressUpdated";
              newFund: addr }; event e end
              
          transition UpdateInsurance(
            addr: ByStr20,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron; IsNotNull addr;
            current_insurance <- insurance; ThrowIfSameAddr current_insurance addr;
            insurance := addr;
            e = { _eventname: "InsuranceAddressUpdated";
              newInsurance: addr }; event e end
          
          transition UpdateLockup(
            val: Uint128,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron; lockup_period := val end
          
          transition AddAccount(
            investor: ByStr20,
            amount: Uint128,
            schedule: Uint128,
            start: Uint128,
            tyron: Uint128
            )
            IsNotPaused; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_; current_fund <- fund;
            IsNotBlocked current_fund; IsNotBlocked investor; ThrowIfSameAddr current_fund investor;
            get_fund_bal <-& proxy.balances[current_fund]; fund_bal = option_uint128_value get_fund_bal;
            new_fund_bal = builtin sub fund_bal amount;
            get_investor_bal <-& proxy.balances[investor]; investor_bal = option_uint128_value get_investor_bal;
            new_investor_bal = builtin add investor_bal amount;
            lockup <- lockup_period;
            portion = builtin div amount schedule;
            vest = builtin div lockup schedule;
            current_block <- &BLOCKNUMBER;
            is_now = builtin eq start zero; init_block = match is_now with
            | True => current_block
            | False => builtin badd current_block start end;
            account = Account init_block vest amount portion; accounts[investor] := account;
            msg = let m = { _tag: "TransferCallBack"; _recipient: proxy; _amount: zero;
              originator: current_fund;
              beneficiary: investor;
              originatorBal: new_fund_bal;
              beneficiaryBal: new_investor_bal } in one_msg m; send msg end
          
          procedure IsVested(
            investor: ByStr20,
            bal: Uint128,
            transfer: Uint128
            )
            get_account <- accounts[investor];
            match get_account with
            | None => | Some account =>
                match account with
                | Account next vest amount portion =>
                    new = builtin sub bal transfer;
                    block <- &BLOCKNUMBER; vested = builtin blt next block;
                    match vested with
                    | False => IsSufficient new amount
                    | True => 
                        new_amount = builtin sub amount portion;
                        is_zero = builtin eq zero new_amount;
                        match is_zero with
                        | True => delete accounts[investor]
                        | False =>
                            IsSufficient new new_amount;
                            next_ = builtin badd next vest;
                            account = Account next_ vest new_amount portion; accounts[investor] := account end end end end end
          
          transition Mint(
            originator: ByStr20,
            beneficiary: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy; IsMinter originator; IsNotBlocked beneficiary;
            current_supply <-& proxy.total_supply; new_supply = builtin add current_supply amount;
            get_bal <-& proxy.balances[beneficiary]; bal = option_uint128_value get_bal; new_bal = builtin add bal amount;
            e = { _eventname: "Minted";
              minter: originator;
              beneficiary: beneficiary;
              amount: amount
            }; event e;
            msg_to_proxy = { _tag: "TransmuteCallBack"; _recipient: _sender; _amount: zero;
              beneficiary: beneficiary;
              newBalance: new_bal;
              newSupply: new_supply
            };
            msg_to_minter = { _tag: "MintSuccessCallBack"; _recipient: originator; _amount: zero;
              minter: originator;
              beneficiary: beneficiary;
              amount: amount
            };
            msg_to_beneficiary = { _tag: "RecipientAcceptMint"; _recipient: beneficiary; _amount: zero;
              minter: originator;
              beneficiary: beneficiary;
              amount: amount
            }; msgs = three_msgs msg_to_proxy msg_to_minter msg_to_beneficiary; send msgs end
          
          transition Transfer(
            originator: ByStr20,
            beneficiary: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator; IsNotNull beneficiary; IsNotBlocked beneficiary; ThrowIfSameAddr originator beneficiary;
            get_originator_bal <-& proxy.balances[originator]; originator_bal = option_uint128_value get_originator_bal;
            IsSufficient originator_bal amount; IsVested originator originator_bal amount;
            new_originator_bal = builtin sub originator_bal amount;
            get_beneficiary_bal <-& proxy.balances[beneficiary]; beneficiary_bal = option_uint128_value get_beneficiary_bal;
            new_beneficiary_bal = builtin add beneficiary_bal amount;
            e = { _eventname: "TransferSuccess";
              originator: originator;
              beneficiary: beneficiary;
              amount: amount }; event e;
            msg_to_proxy = { _tag: "TransferCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              beneficiary: beneficiary;
              originatorBal: new_originator_bal;
              beneficiaryBal: new_beneficiary_bal
            };
            msg_to_originator = { _tag: "TransferSuccessCallBack"; _recipient: originator; _amount: zero;
              sender: originator;
              recipient: beneficiary;
              amount: amount
            };
            msg_to_beneficiary = { _tag: "RecipientAcceptTransfer"; _recipient: beneficiary; _amount: zero;
              sender: originator;
              recipient: beneficiary;
              amount: amount
            }; msgs = three_msgs msg_to_proxy msg_to_originator msg_to_beneficiary; send msgs end
          
          transition IncreaseAllowance(
            originator: ByStr20,
            spender: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator; IsNotBlocked spender; ThrowIfSameAddr originator spender;
            get_allowance <-& proxy.allowances[originator][spender]; allowance = option_uint128_value get_allowance;
            new_allowance = builtin add allowance amount;
            e = { _eventname: "IncreasedAllowance";
              originator: originator;
              spender: spender;
              newAllowance: new_allowance }; event e;
            msg = let m = { _tag: "AllowanceCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              spender: spender;
              newAllowance: new_allowance
            } in one_msg m; send msg end
          
          transition DecreaseAllowance(
            originator: ByStr20,
            spender: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator; IsNotBlocked spender; ThrowIfSameAddr originator spender;
            get_allowance <-& proxy.allowances[originator][spender]; allowance = option_uint128_value get_allowance;
            new_allowance = better_subtract allowance amount;
            e = { _eventname: "DecreasedAllowance";
              originator: originator;
              spender: spender;
              newAllowance: new_allowance }; event e;
            msg = let m = { _tag: "AllowanceCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              spender: spender;
              newAllowance: new_allowance
            } in one_msg m; send msg end
          
          transition Burn(
            originator: ByStr20,
            beneficiary: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsMinter originator; IsNotBlocked beneficiary;
            get_bal <-& proxy.balances[beneficiary]; bal = option_uint128_value get_bal;
            IsSufficient bal amount; IsVested beneficiary bal amount;
            get_allowance <-& proxy.allowances[beneficiary][originator]; allowance = option_uint128_value get_allowance;
            IsSufficient allowance amount;
            new_bal = builtin sub bal amount; new_allowance = builtin sub allowance amount;
            current_supply <-& proxy.total_supply; new_supply = builtin sub current_supply amount;
            e = { _eventname: "Burnt";
              minter: originator;
              beneficiary: beneficiary;
              amount: amount
            }; event e;
            msg_to_proxy = { _tag: "TransmuteCallBack"; _recipient: _sender; _amount: zero;
              beneficiary: beneficiary;
              newBalance: new_bal;
              newSupply: new_supply
            };
            msg_to_proxy_allowance = { _tag: "AllowanceCallBack"; _recipient: _sender; _amount: zero;
              originator: beneficiary;
              spender: originator;
              newAllowance: new_allowance
            };
            msg_to_minter = { _tag: "BurnSuccessCallBack"; _recipient: originator; _amount: zero;
              minter: originator;
              beneficiary: beneficiary;
              amount: amount
            };
            msg_to_beneficiary = { _tag: "RecipientAcceptBurn"; _recipient: beneficiary; _amount: zero;
              minter: originator;
              beneficiary: beneficiary;
              amount: amount
            }; msgs = four_msgs msg_to_proxy msg_to_proxy_allowance msg_to_minter msg_to_beneficiary; send msgs end
          
          transition TransferFrom(
            originator: ByStr20,
            spender: ByStr20,
            beneficiary: ByStr20, 
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator; IsNotBlocked spender; IsNotBlocked beneficiary; ThrowIfSameAddr originator beneficiary;
            get_originator_bal <-& proxy.balances[originator]; originator_bal = option_uint128_value get_originator_bal;
            IsSufficient originator_bal amount; IsVested originator originator_bal amount;
            get_allowance <-& proxy.allowances[originator][spender]; allowance = option_uint128_value get_allowance;
            IsSufficient allowance amount;
            get_beneficiary_bal <-& proxy.balances[beneficiary]; beneficiary_bal = option_uint128_value get_beneficiary_bal;
            new_originator_bal = builtin sub originator_bal amount; new_allowance = builtin sub allowance amount; new_beneficiary_bal = builtin add beneficiary_bal amount;
            e = { _eventname: "TransferFromSuccess";
              originator: originator;
              spender: spender;
              beneficiary: beneficiary;
              amount: amount }; event e;
            msg_to_proxy_balances = { _tag: "TransferCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              beneficiary: beneficiary;
              originatorBal: new_originator_bal;
              beneficiaryBal: new_beneficiary_bal
            };
            msg_to_proxy_allowance = { _tag: "AllowanceCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              spender: spender;
              newAllowance: new_allowance
            };
            msg_to_spender = { _tag: "TransferFromSuccessCallBack"; _recipient: spender; _amount: zero;
              initiator: spender;
              sender: originator;
              recipient: beneficiary;
              amount: amount
            };
            msg_to_beneficiary = { _tag: "RecipientAcceptTransferFrom"; _recipient: beneficiary; _amount: zero;
              initiator: spender;
              sender: originator;
              recipient: beneficiary;
              amount: amount
            }; msgs = four_msgs msg_to_proxy_balances msg_to_proxy_allowance msg_to_spender msg_to_beneficiary; send msgs end
          
          transition Recalibrate(
            val: Uint128,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron; current_insurance <- insurance;
            get_insurance_bal <-& proxy.balances[current_insurance]; insurance_bal = option_uint128_value get_insurance_bal;
            new_insurance_bal = builtin sub insurance_bal val;
            msg = let m = { _tag: "TransferCallBack"; _recipient: proxy; _amount: zero;
              originator: current_insurance;
              beneficiary: current_insurance;
              originatorBal: new_insurance_bal;
              beneficiaryBal: new_insurance_bal } in one_msg m; send msg end
          
          transition UpdateTreasury(
            old: ByStr20,
            new: ByStr20,
            tyron: Option Uint128
            )
            IsNotPaused; VerifyController tyron;
            get_old_bal <-& proxy.balances[old]; old_bal = option_uint128_value get_old_bal;
            get_new_bal <-& proxy.balances[new]; new_bal = option_uint128_value get_new_bal;
            new_bal = builtin add old_bal new_bal;
            msg = let m = { _tag: "TransferCallBack"; _recipient: proxy; _amount: zero;
              originator: old;
              beneficiary: new;
              originatorBal: zero;
              beneficiaryBal: new_bal } in one_msg m; send msg end
        `
        ;

      // @todo
      const init_username = "tyronmapu";
      const xInit = "0xcc41550791a51927a6623a46f6bd294652699f2c";
      const contract_init = [
        {
          vname: '_scilla_version',
          type: 'Uint32',
          value: '0',
        },
        {
          vname: 'init_username',
          type: 'String',
          value: `${init_username}`,
        },
        {
          vname: 'init_controller',
          type: 'ByStr20',
          value: `${init_controller}`,
        },
        {
          vname: 'proxy',
          type: 'ByStr20',
          value: `${proxy}`,
        },
        {
          vname: 'init',
          type: 'ByStr20',
          value: `${xInit}`,
        }
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
        gasPrice: "2000000000",
      });
      toast.info('You successfully deployed a new token implementation.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error
    }
  }

  async deployStablecoin(net: string) {
    try {
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;
      let init_controller = '0xe2d15d86d7c3674f1aadf4f9d7d559f375b8b156';//@todo
      //@todo UpdateImplementation

      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
        init_controller = '0xe2d15d86d7c3674f1aadf4f9d7d559f375b8b156';
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
        (* v2.5.0$
          token.tyron: Fungible Token DApp <> Proxy smart contract
          Self-Sovereign Identity Protocol
          Copyright (C) Tyron Pungtas and its affiliates.
          www.ssiprotocol.com
          
          This program is free software: you can redistribute it and/or modify
          it under the terms of the GNU General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
          
          This program is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU General Public License for more details.*)
          
          scilla_version 0
          
          import BoolUtils IntUtils
          
          library FungibleToken
            let one_msg =
              fun( msg: Message ) =>
              let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
          
            type Error =
              | CodeWrongCaller
              | CodeWrongStatus
              | CodeNotValid
          
            let make_error = fun( error: Error ) =>
              let result = match error with
              | CodeWrongCaller            => Int32 -1
              | CodeWrongStatus            => Int32 -2
              | CodeNotValid               => Int32 -3
              end in { _exception: "Error"; code: result }
            
            let zero = Uint128 0
            
            type Caller =
              | Controller
              | Implementation
            
            let controller_ = Controller
            let implementation_ = Implementation
            
          contract FungibleToken(
            contract_owner: ByStr20 with contract 
              field controller: ByStr20,
              field paused: Bool end,
            name: String,
            symbol: String,
            decimals: Uint32,
            init_supply: Uint128
            )
            with
              let string_is_not_empty = fun( s : String ) =>
                let zero = Uint32 0 in
                let s_length = builtin strlen s in
                let s_empty = builtin eq s_length zero in
                negb s_empty in
              let name_ok = string_is_not_empty name in
              let symbol_ok = string_is_not_empty symbol in
                let name_symbol_ok = andb name_ok symbol_ok in
              let decimals_ok =
                let six = Uint32 6 in
                let eighteen = Uint32 18 in
                let decimals_at_least_6 = uint32_le six decimals in
                let decimals_no_more_than_18 = uint32_le decimals eighteen in
                andb decimals_at_least_6 decimals_no_more_than_18 in
                andb name_symbol_ok decimals_ok
            =>
            field implementation: ByStr20 with contract
              field controller: ByStr20,
              field paused: Bool end = contract_owner
            field balances: Map ByStr20 Uint128 = Emp ByStr20 Uint128
            field total_supply: Uint128 = init_supply
            field allowances: Map ByStr20 ( Map ByStr20 Uint128 ) = Emp ByStr20 ( Map ByStr20 Uint128 )
            
          procedure ThrowError( err: Error )
            e = make_error err; throw e end
            
          procedure VerifyCaller( caller: Caller )
            current_impl <- implementation;
            is_paused <-& current_impl.paused; match is_paused with
            | False => | True => err = CodeWrongStatus; ThrowError err end;
            match caller with
            | Controller =>
                controller <-& current_impl.controller;
                verified = builtin eq _origin controller; match verified with
                | True => | False => err = CodeWrongCaller; ThrowError err end
            | Implementation =>
                verified = builtin eq _sender current_impl; match verified with
                | True => | False => err = CodeWrongCaller; ThrowError err end end end
          
          transition UpdateImplementation( addr: ByStr20 with contract field controller: ByStr20, field paused: Bool end )
            VerifyCaller controller_; current_impl <- implementation;
            is_same = builtin eq current_impl addr; match is_same with
            | False => | True => err = CodeNotValid; ThrowError err end;
            implementation := addr;
            e = { _eventname: "ImplementationUpdated";
              new_implementation: addr }; event e end
          
          transition Mint(
            beneficiary: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = { _tag: "Mint"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              beneficiary: beneficiary;
              amount: amount
            } in one_msg m; send msg end
          
          transition Burn(
            beneficiary: Uint128, 
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = {
              _tag: "Burn"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              beneficiary: beneficiary;
              amount: amount
            } in one_msg m; send msg end
          
          transition TransmuteCallBack(
            beneficiary: ByStr20,
            new_balance: Uint128,
            new_supply: Uint128
            )
            VerifyCaller implementation_;
            balances[beneficiary] := new_balance;
            total_supply := new_supply end
            
          transition Transfer(
            to: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = { _tag: "Transfer"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              beneficiary: to;
              amount: amount } in one_msg m; send msg end
          
          transition TransferCallBack(
            originator: ByStr20,
            beneficiary: ByStr20,
            new_originator_bal: Uint128,
            new_beneficiary_bal: Uint128
            )
            VerifyCaller implementation_;
            balances[originator] := new_originator_bal;
            balances[beneficiary] := new_beneficiary_bal;
            e = {
              _eventname: "TransferSuccess";
              sender: originator;
              recipient: beneficiary
            }; event e end
          
          transition IncreaseAllowance(
            spender: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = { _tag: "IncreaseAllowance"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              spender: spender;
              amount: amount } in one_msg m; send msg end
          
          transition DecreaseAllowance(
            spender: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = {
              _tag: "DecreaseAllowance"; _recipient: current_impl; _amount: zero;
              originator: _sender;
              spender: spender;
              amount: amount } in one_msg m; send msg end
          
          transition AllowanceCallBack(
            originator: ByStr20,
            spender: ByStr20,
            new_allowance: Uint128
            )
            VerifyCaller implementation_;
            allowances[originator][spender] := new_allowance end
          
          transition TransferFrom(
            from: ByStr20, 
            to: ByStr20,
            amount: Uint128
            )
            current_impl <- implementation;
            msg = let m = { _tag: "TransferFrom"; _recipient: current_impl; _amount: zero;
              originator: from;
              spender: _sender;
              beneficiary: to;
              amount: amount } in one_msg m; send msg end
              `
        ;

      const contract_init = [
        {
          vname: '_scilla_version',
          type: 'Uint32',
          value: '0',
        },
        {
          vname: 'contract_owner',
          type: 'ByStr20',
          value: `${init_controller}`,
        },
        {
          vname: 'name',
          type: 'String',
          value: 'Self-Sovereign Identity Dollar',
        },
        {
          vname: 'symbol',
          type: 'String',
          value: '$SI',
        },
        {
          vname: 'decimals',
          type: 'Uint32',
          value: '12',
        },
        {
          vname: 'init_supply',
          type: 'Uint128',
          value: '0',
        }
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
        gasPrice: "2000000000",
      });
      toast.info('You successfully deployed a new token.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error
    }
  }

  async deployStableImpl(net: string, init_controller: string) {
    try {
      let proxy = '';
      let init_token = '';
      let init_community = '';
      if (net === "testnet") {
        proxy = '0xb8dc094ad8e34d4bec3076afa8bd52a3e73f8221';
        init_token = 'zil1r054sd9p4s5pdg9l8pywshj4f3rqnmk0k4va8u';
        init_community = 'zil16wfanev6gpvx3yeuncc8mcld38nuvu6pu2uqg9';
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
        (* v0.9.0
          $si.tyron: Self-Sovereign Identity Dollar DApp, Fungible Algorithmic Stablecoin <> Implementation smart contract
          Self-Sovereign Identity Protocol
          Copyright (C) Tyron Pungtas and its affiliates.
          www.ssiprotocol.com
          
          This program is free software: you can redistribute it and/or modify
          it under the terms of the GNU General Public License as published by
          the Free Software Foundation, either version 3 of the License, or
          (at your option) any later version.
          
          This program is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
          GNU General Public License for more details.*)
          
          scilla_version 0
          
          import IntUtils
          
          library SSI_Dollar
            let one_msg =
              fun( msg: Message ) =>
              let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
          
            let two_msgs =
              fun( msg1: Message ) => fun( msg2: Message ) =>
              let msgs_tmp = one_msg msg2 in Cons{ Message } msg1 msgs_tmp
          
            let three_msgs =
              fun( msg1: Message ) => fun( msg2: Message ) => fun( msg3: Message ) =>
              let msgs_tmp = two_msgs msg2 msg3 in Cons{ Message } msg1 msgs_tmp
          
            let four_msgs =
              fun( msg1: Message ) => fun( msg2: Message ) => fun( msg3: Message ) => fun( msg4: Message ) =>
              let msgs_tmp = three_msgs msg2 msg3 msg4 in Cons{ Message } msg1 msgs_tmp
          
            type Error =
              | CodeNotProxy
              | CodeWrongCaller
              | CodeIsPaused
              | CodeNotPaused
              | CodeIsBlocked
              | CodeNotBlocked
              | CodeSameAddress
              | CodeIsNull
              | CodeIsInsufficient
          
            let make_error = fun( error: Error ) =>
              let result = match error with
              | CodeNotProxy               => Int32 -1
              | CodeWrongCaller            => Int32 -2
              | CodeIsPaused               => Int32 -3
              | CodeNotPaused              => Int32 -4
              | CodeIsBlocked              => Int32 -5
              | CodeNotBlocked             => Int32 -6
              | CodeSameAddress            => Int32 -7
              | CodeIsNull                 => Int32 -8
              | CodeIsInsufficient         => Int32 -9
              end in { _exception: "Error"; code: result }
          
            let zero = Uint128 0
            let true = True
            let false = False
            let zeroByStr20 = 0x0000000000000000000000000000000000000000
          
            let option_value =
              tfun 'A => fun( default: 'A ) => fun( opt_val: Option 'A ) => match opt_val with
              | Some v => v
              | None => default end
          
            let option_uint128_value = let f = @option_value Uint128 in f zero
            
            let option2_uint128_value =
              fun( input: Option( Option Uint128 )) => match input with
              | Some (Some a) => a
              | _ => zero end
          
            let option_uint128 =
              fun( input: Uint128 ) =>
              let is_zero = builtin eq input zero in match is_zero with
              | True => None{ Uint128 }
              | False => Some{ Uint128 } input end
          
            let better_subtract =
              fun( a: Uint128 ) => fun( b: Uint128 ) =>
              let a_ge_b = uint128_ge a b in match a_ge_b with
              | True => builtin sub a b
              | False => zero end
            
            let grow: Uint128 -> Uint256 =
              fun( var : Uint128 ) =>
              let maybe_big = builtin to_uint256 var in match maybe_big with
              | Some big => big
              | None => Uint256 0 (* should never happen *)
              end
              
            type Direction =
              | TokenToSsi
              | SsiToToken
            
            let tokenToSsi = TokenToSsi
            let ssiToToken = SsiToToken
            
            let transmute: Direction -> Uint128 -> Uint128 -> Uint128 -> Option Uint128 =
              fun( d: Direction ) => fun( a: Uint128 ) => fun( r: Uint128 ) => fun( f: Uint128) =>
              let big_a = grow a in let big_r = grow r in let big_f = grow f in
              let result = match d with
              | TokenToSsi =>
                  let a_times_r = builtin mul big_a big_r in
                  builtin div a_times_r big_f
              | SsiToToken =>
                  let a_div_r = builtin div big_a big_r in
                  builtin mul a_div_r big_f end in
              builtin to_uint128 result
          
          contract SSI_Dollar(
            init_controller: ByStr20,
            proxy: ByStr20 with contract 
              field balances: Map ByStr20 Uint128,
              field total_supply: Uint128,
              field allowances: Map ByStr20 ( Map ByStr20 Uint128 ) end,
            init_token: ByStr20,
            init_community: ByStr20 with contract
              field rate: Uint128,
              field factor: Uint128 end
            )
            field controller: ByStr20 = init_controller
            field paused: Bool = False
            field insurance: ByStr20 = init_controller
            field pauser: ByStr20 = init_controller
            field lister: ByStr20 = init_controller
            field blocked: Map ByStr20 Bool = Emp ByStr20 Bool
            field counter: Uint128 = zero
            field token: ByStr20 = init_token
            field community: ByStr20 with contract field rate: Uint128, field factor: Uint128 end = init_community
          
          procedure ThrowError( err: Error )
            e = make_error err; throw e end
          
          procedure ThrowIfNotProxy()
            verified = builtin eq proxy _sender; match verified with
            | True => | False => err= CodeNotProxy; ThrowError err end end
          
          procedure VerifyController()
            current_controller <- controller;
            verified = builtin eq _origin current_controller; match verified with
            | True => | False => err = CodeWrongCaller; ThrowError err end end
          
          procedure IsPauser()
            current_pauser <- pauser;
            verified = builtin eq _origin current_pauser; match verified with
            | True  => | False => err = CodeWrongCaller; ThrowError err end end
          
          procedure IsPaused()
            is_paused <- paused; match is_paused with
            | True => | False => err = CodeNotPaused; ThrowError err end end
          
          procedure IsNotPaused()
            is_paused <- paused; match is_paused with
            | False => | True => err = CodeIsPaused; ThrowError err end end
            
          procedure IsLister()
            current_lister <- lister;
            verified = builtin eq current_lister _origin; match verified with
            | True  => | False => err = CodeWrongCaller; ThrowError err end end
          
          procedure IsBlocked( addr: ByStr20 )
            is_blocked <- exists blocked[addr]; match is_blocked with
            | True => | False => err = CodeNotBlocked; ThrowError err end end
          
          procedure IsNotNull( addr: ByStr20 )
            is_null = builtin eq zeroByStr20 addr; match is_null with
            | False => | True => err = CodeIsNull; ThrowError err end end
          
          procedure IsNotBlocked( addr: ByStr20 )
            IsNotNull addr;
            is_blocked <- exists blocked[addr]; match is_blocked with
            | False => | True => err = CodeIsBlocked; ThrowError err end end
          
          procedure ThrowIfSameAddr(
            a: ByStr20,
            b: ByStr20
            )
            is_self = builtin eq a b; match is_self with
            | False => | True => err = CodeSameAddress; ThrowError err end end
          
          procedure IsSufficient(
            value: Uint128,
            amount: Uint128
            )
            is_sufficient = uint128_ge value amount; match is_sufficient with
            | True => | False => err = CodeIsInsufficient; ThrowError err end end
          
          transition UpdateController( addr: ByStr20 )
            IsNotPaused; VerifyController; IsNotNull addr;
            current_controller <- controller; ThrowIfSameAddr current_controller addr;
            controller := addr;
            e = { _eventname: "ControllerUpdated";
              new_addr: addr }; event e end
          
          transition UpdatePauser( new_pauser: ByStr20 )
            IsNotPaused; VerifyController; IsNotNull new_pauser;
            current_pauser <- pauser;
            ThrowIfSameAddr current_pauser new_pauser; pauser := new_pauser;
            e = { _eventname: "PauserUpdated";
              pauser_updated: new_pauser }; event e end
          
          transition Pause()
            ThrowIfNotProxy; IsPauser;
            IsNotPaused; paused := true;
            e = { _eventname: "SmartContractPaused";
              pauser: _origin }; event e end
          
          transition Unpause()
            ThrowIfNotProxy; IsPauser;
            IsPaused; paused := false;
            e = { _eventname: "SmartContractUnpaused";
              pauser: _origin }; event e end
          
          transition UpdateLister( new_addr: ByStr20 )
            IsNotPaused; VerifyController; IsNotNull new_addr;
            current_lister <- lister; ThrowIfSameAddr current_lister new_addr; lister:= new_addr;
            e = { _eventname: "ListerUpdated";
              newAddr: new_addr }; event e end
          
          transition Block( addr: ByStr20 )
            IsNotPaused; IsLister;
            IsNotBlocked addr; blocked[addr] := true;
            e = { _eventname: "AddressBlocked";
              address: addr;
              lister: _origin }; event e end
          
          transition Unblock( addr: ByStr20 )
            IsNotPaused; IsLister;
            IsBlocked addr; delete blocked[addr];
            e = { _eventname: "AddressUnblocked";
              address: addr;
              lister: _origin }; event e end
              
          transition UpdateInsurance( addr: ByStr20 )
            IsNotPaused; VerifyController; IsNotNull addr;
            current_insurance <- insurance; ThrowIfSameAddr current_insurance addr; insurance := addr;
            e = { _eventname: "InsuranceAddressUpdated";
              new_addr: addr }; event e end
          
          transition UpdateToken( addr: ByStr20 )
            IsNotPaused; VerifyController; IsNotNull addr;
            current_addr <- token; ThrowIfSameAddr current_addr addr; token := addr;
            e = { _eventname: "TokenAddressUpdated";
              new_addr: addr }; event e end
          
          transition UpdateCommunity( addr: ByStr20 with contract field rate: Uint128, field factor: Uint128 end )
            IsNotPaused; VerifyController; IsNotNull addr;
            current_addr <- community; ThrowIfSameAddr current_addr addr; community := addr;
            e = { _eventname: "CommunityAddressUpdated";
              new_addr: addr }; event e end
              
          procedure IsValidToSelf( addr: ByStr20 )
            is_valid = builtin eq addr _this_address; match is_valid with
            | True => | False => err = CodeWrongCaller; ThrowError err end end
          
          transition Mint(
            originator: ByStr20,
            beneficiary: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator;
            current_token <- token;
            msg = let m = { _tag: "Burn"; _recipient: current_token; _amount: zero;
              beneficiary: originator;
              amount: amount
            } in one_msg m; send msg;
            msg_to_minter = let m = { _tag: "MintSuccessCallBack"; _recipient: originator; _amount: zero;
              minter: originator;
              beneficiary: originator;
              amount: amount
            } in one_msg m; send msg_to_minter end
            
          transition BurnSuccessCallBack(
            minter: ByStr20,
            beneficiary: ByStr20,
            amount: Uint128
            )
            IsValidToSelf minter;
            current_community <- community; current_rate <-& current_community.rate; current_factor <-& current_community.factor;
            get_dollars = transmute tokenToSsi amount current_rate current_factor; ssi_dollars = option_uint128_value get_dollars;
            current_supply <-& proxy.total_supply; new_supply = builtin add current_supply ssi_dollars;
            get_bal <-& proxy.balances[beneficiary]; bal = option_uint128_value get_bal; new_bal = builtin add bal ssi_dollars;
            msg_to_proxy = { _tag: "TransmuteCallBack"; _recipient: proxy; _amount: zero;
              beneficiary: beneficiary;
              new_balance: new_bal;
              new_supply: new_supply
            };
            msg_to_beneficiary = { _tag: "RecipientAcceptMint"; _recipient: beneficiary; _amount: zero;
              minter: beneficiary;
              beneficiary: beneficiary;
              amount: ssi_dollars
            }; msgs = two_msgs msg_to_proxy msg_to_beneficiary; send msgs;
            e = { _eventname: "Minted";
              beneficiary: beneficiary;
              amount: ssi_dollars
            }; event e end
            
          transition Transfer(
            originator: ByStr20,
            beneficiary: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator; IsNotNull beneficiary; IsNotBlocked beneficiary; ThrowIfSameAddr originator beneficiary;
            get_originator_bal <-& proxy.balances[originator]; originator_bal = option_uint128_value get_originator_bal;
            IsSufficient originator_bal amount; new_originator_bal = builtin sub originator_bal amount;
            get_beneficiary_bal <-& proxy.balances[beneficiary]; beneficiary_bal = option_uint128_value get_beneficiary_bal;
            new_beneficiary_bal = builtin add beneficiary_bal amount;
            e = { _eventname: "TransferSuccess";
              originator: originator;
              beneficiary: beneficiary;
              amount: amount }; event e;
            msg_to_proxy = { _tag: "TransferCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              beneficiary: beneficiary;
              new_originator_bal: new_originator_bal;
              new_beneficiary_bal: new_beneficiary_bal
            };
            msg_to_originator = { _tag: "TransferSuccessCallBack"; _recipient: originator; _amount: zero;
              sender: originator;
              recipient: beneficiary;
              amount: amount
            };
            msg_to_beneficiary = { _tag: "RecipientAcceptTransfer"; _recipient: beneficiary; _amount: zero;
              sender: originator;
              recipient: beneficiary;
              amount: amount
            }; msgs = three_msgs msg_to_proxy msg_to_originator msg_to_beneficiary; send msgs end
          
          transition IncreaseAllowance(
            originator: ByStr20,
            spender: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator; IsNotBlocked spender; ThrowIfSameAddr originator spender;
            get_allowance <-& proxy.allowances[originator][spender]; allowance = option_uint128_value get_allowance;
            new_allowance = builtin add allowance amount;
            e = { _eventname: "IncreasedAllowance";
              originator: originator;
              spender: spender;
              new_allowance : new_allowance }; event e;
            msg = let m = { _tag: "AllowanceCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              spender: spender;
              new_allowance: new_allowance
            } in one_msg m; send msg end
          
          transition DecreaseAllowance(
            originator: ByStr20,
            spender: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator; IsNotBlocked spender; ThrowIfSameAddr originator spender;
            get_allowance <-& proxy.allowances[originator][spender]; allowance = option_uint128_value get_allowance;
            new_allowance = better_subtract allowance amount;
            e = { _eventname: "DecreasedAllowance";
              originator: originator;
              spender: spender;
              new_allowance: new_allowance }; event e;
            msg = let m = { _tag: "AllowanceCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              spender: spender;
              new_allowance: new_allowance
            } in one_msg m; send msg end
          
          transition Burn(
            originator: ByStr20,
            beneficiary: ByStr20,
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy; VerifyController; (* Only the Controller can origin the burn of $SI to mint the token *)
            IsNotBlocked originator;
            get_bal <-& proxy.balances[originator]; bal = option_uint128_value get_bal; IsSufficient bal amount;
            current_token <- token;
            current_community <- community; current_rate <-& current_community.rate; current_factor <-& current_community.factor;
            get_tokens = transmute ssiToToken amount current_rate current_factor; token_amount = option_uint128_value get_tokens;
            msg = let m = { _tag: "Mint"; _recipient: current_token; _amount: zero;
              beneficiary: originator;
              amount: token_amount
            } in one_msg m; send msg;
            current_supply <-& proxy.total_supply; new_supply = builtin sub current_supply amount;
            new_bal = builtin sub bal amount;
            msg_to_proxy = { _tag: "TransmuteCallBack"; _recipient: proxy; _amount: zero;
              beneficiary: originator;
              new_balance: new_bal;
              new_supply: new_supply
            };
            msg_to_minter = { _tag: "BurnSuccessCallBack"; _recipient: originator; _amount: zero;
              minter: originator;
              beneficiary: originator;
              amount: amount
            };
            msg_to_beneficiary = { _tag: "RecipientAcceptBurn"; _recipient: originator; _amount: zero;
              minter: originator;
              beneficiary: originator;
              amount: amount
            }; 
            msgs = three_msgs msg_to_proxy msg_to_minter msg_to_beneficiary; send msgs;
            e = { _eventname: "Burnt";
              burner: originator;
              beneficiary: originator;
              amount: amount
            }; event e end
          
          transition MintSuccessCallBack(
            minter: ByStr20,
            beneficiary: ByStr20,
            amount: Uint128
            )
            IsValidToSelf minter end
          
          transition TransferFrom(
            originator: ByStr20,
            spender: ByStr20,
            beneficiary: ByStr20, 
            amount: Uint128
            )
            IsNotPaused; ThrowIfNotProxy;
            IsNotBlocked originator; IsNotBlocked spender; IsNotBlocked beneficiary; ThrowIfSameAddr originator beneficiary;
            get_originator_bal <-& proxy.balances[originator]; originator_bal = option_uint128_value get_originator_bal;
            IsSufficient originator_bal amount;
            get_allowance <-& proxy.allowances[originator][spender]; allowance = option_uint128_value get_allowance;
            IsSufficient allowance amount;
            get_beneficiary_bal <-& proxy.balances[beneficiary]; beneficiary_bal = option_uint128_value get_beneficiary_bal;
            new_originator_bal = builtin sub originator_bal amount; new_allowance = builtin sub allowance amount; new_beneficiary_bal = builtin add beneficiary_bal amount;
            e = { _eventname: "TransferFromSuccess";
              originator: originator;
              spender: spender;
              beneficiary: beneficiary;
              amount: amount }; event e;
            msg_to_proxy_balances = { _tag: "TransferCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              beneficiary: beneficiary;
              new_originator_bal: new_originator_bal;
              new_beneficiary_bal: new_beneficiary_bal
            };
            msg_to_proxy_allowance = { _tag: "AllowanceCallBack"; _recipient: _sender; _amount: zero;
              originator: originator;
              spender: spender;
              new_allowance: new_allowance
            };
            msg_to_spender = { _tag: "TransferFromSuccessCallBack"; _recipient: spender; _amount: zero;
              initiator: spender;
              sender: originator;
              recipient: beneficiary;
              amount: amount
            };
            msg_to_beneficiary = { _tag: "RecipientAcceptTransferFrom"; _recipient: beneficiary; _amount: zero;
              initiator: spender;
              sender: originator;
              recipient: beneficiary;
              amount: amount
            }; msgs = four_msgs msg_to_proxy_balances msg_to_proxy_allowance msg_to_spender msg_to_beneficiary; send msgs end
          
          procedure TransferNFTUsernameUpgrade_( addr: ByStr20 )
            current_counter <- counter; one = Uint128 1; new_counter = builtin add current_counter one; counter := new_counter;
            current_insurance <- insurance; IsNotBlocked current_insurance; IsNotNull addr; IsNotBlocked addr; ThrowIfSameAddr current_insurance addr;
            get_insurance_bal <-& proxy.balances[current_insurance]; insurance_bal = option_uint128_value get_insurance_bal;
            new_insurance_bal = builtin sub insurance_bal new_counter;
            get_addr_bal <-& proxy.balances[addr]; addr_bal = option_uint128_value get_addr_bal;
            new_addr_bal = builtin add addr_bal one;
            msg = let m = { _tag: "TransferCallBack"; _recipient: proxy; _amount: zero;
              originator: current_insurance;
              beneficiary: addr;
              new_originator_bal: new_insurance_bal;
              new_beneficiary_bal: new_addr_bal } in one_msg m; send msg end
          
          transition TransferNFTUsernameUpgrade( addr: List ByStr20 )
            IsNotPaused; VerifyController;
            counter := zero;
            forall addr TransferNFTUsernameUpgrade_ end
          
          transition Recalibrate( amount: Uint128 )
            IsNotPaused; VerifyController; current_insurance <- insurance;
            get_insurance_bal <-& proxy.balances[current_insurance]; insurance_bal = option_uint128_value get_insurance_bal;
            new_insurance_bal = builtin sub insurance_bal amount;
            msg = let m = { _tag: "TransferCallBack"; _recipient: proxy; _amount: zero;
              originator: current_insurance;
              beneficiary: current_insurance;
              new_originator_bal: new_insurance_bal;
              new_beneficiary_bal: new_insurance_bal } in one_msg m; send msg end
          
          transition UpdateTreasury(
            old: ByStr20,
            new: ByStr20
            )
            IsNotPaused; VerifyController;
            get_old_bal <-& proxy.balances[old]; old_bal = option_uint128_value get_old_bal;
            get_new_bal <-& proxy.balances[new]; new_bal = option_uint128_value get_new_bal;
            new_bal = builtin add old_bal new_bal;
            msg = let m = { _tag: "TransferCallBack"; _recipient: proxy; _amount: zero;
              originator: old;
              beneficiary: new;
              new_originator_bal: zero;
              new_beneficiary_bal: new_bal } in one_msg m; send msg end
        `
        ;

      const contract_init = [
        {
          vname: '_scilla_version',
          type: 'Uint32',
          value: '0',
        },
        {
          vname: 'init_controller',
          type: 'ByStr20',
          value: `${init_controller}`,
        },
        {
          vname: 'proxy',
          type: 'ByStr20',
          value: `${proxy}`,
        },
        {
          vname: 'init_token',
          type: 'ByStr20',
          value: `${init_token}`,
        },
        {
          vname: 'init_community',
          type: 'ByStr20',
          value: `${init_community}`,
        }
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
        gasPrice: "2000000000",
      });
      toast.info('You successfully deployed a new stablecoin implementation.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'dark',
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error
    }
  }

}
