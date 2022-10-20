import * as tyron from 'tyron';
import { ZIlPayInject } from "../../src/types/zil-pay";
import * as zutil from "@zilliqa-js/util";
import { toast } from "react-toastify"
import { operationKeyPair } from '../../src/lib/dkms';

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

  async deployDid(net: string, address: string) {
    try {
      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      //mainnet addresses
      let init_tyron = "0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9";

      if (net === "testnet") {
        init_tyron = "0xec194d20eab90cfab70ead073d742830d3d2a91b";
      }
      //@todo-x
      const code =
        `
        (* v5.9.0
          DIDxWallet: W3C Decentralized Identifier Smart Contract Wallet
          Self-Sovereign Identity Protocol
          Copyright Tyron Mapu Community Interest Company 2022. All rights reserved.
          You acknowledge and agree that Tyron Mapu Community Interest Company (Tyron) own all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this repository (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
          Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this repository.
          You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
          1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of Tyron; and
          2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
          Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by Tyron in its sole discretion:
          1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
          2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
          3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
          You will not use any trade mark, service mark, trade name, logo of Tyron or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
          If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*)
          
          scilla_version 0
          import PairUtils BoolUtils ListUtils IntUtils
          
          library DIDxWallet
            type DidStatus =
              | Created
              | Recovered
              | Updated
              | Deactivated
              | Locked
          
            type Action =
              | Add
              | Remove
          
            type TransferProtocol =
              | Https
              | Git
            
            type BlockchainType =
              | Zilliqa of ByStr20
              | Other of String
          
            type Endpoint =
              | Address of BlockchainType
              | Uri of String TransferProtocol String   (* type, transfer protocol & uri *)
           
            type Document =
              | VerificationMethod of Action String ByStr33 String (* add/remove, key purpose, public key & encrypted private key *)
              | Service of Action String Endpoint (* add/remove, service ID & service *) 
            
            let update = "update"
            let recovery = "socialrecovery"
            let actionAdd = "add"
            let actionRemove = "remove"
            let empty_methods = Emp String ByStr33
            let empty_dkms = Emp String String
            let empty_services = Emp String ByStr20
            let empty_services_ = Emp String Endpoint
            let empty_domains = Emp String ByStr20
          
            let one_msg =
              fun( msg: Message ) =>
              let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
            
            let zero = Uint128 0
            let zeroByStr20 = 0x0000000000000000000000000000000000000000
            let zeroByStr32 = 0x0000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr33 = 0x000000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr = builtin to_bystr zeroByStr20
          
            let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
              match input with
              | Some v => v
              | None => default end
            let option_uint128_value = let f = @option_value Uint128 in f zero
            let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
            let option_bystr33_value = let f = @option_value ByStr33 in f zeroByStr33
            let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64
          
            (* xWallet library *)
            let empty_guardians = Emp ByStr32 Bool
            let zero_ = Uint32 0
            let one = Uint32 1
            let two = Uint32 2
            let three = Uint32 3
            let free = "free"
            let empty_string = ""
            let did = "did"
          
            type Beneficiary =
              | NftUsername of String String (* username & domain *)
              | Recipient of ByStr20
          
          contract DIDxWALLET(
            init_controller: ByStr20,
            init: ByStr20 with contract field dApp: ByStr20 with contract
              field implementation: ByStr20 with contract
                field utility: Map String Map String Uint128 end,
              field dns: Map String ByStr20,
              field did_dns: Map String ByStr20 with contract
                field controller: ByStr20,
                field verification_methods: Map String ByStr33,
                field services: Map String ByStr20,
                field did_domain_dns: Map String ByStr20 end end end,
            did_methods: Map String ByStr33,
            did_dkms: Map String String
            )
            field did: String = let did_prefix = "did:tyron:zil:main:" in let did_suffix = builtin to_string _this_address in
              builtin concat did_prefix did_suffix   (* the W3C decentralized identifier *)
            field nft_username: ByStr32 = zeroByStr32
            field pending_username: ByStr32 = zeroByStr32
            field controller: ByStr20 = init_controller
            field pending_controller: ByStr20 = zeroByStr20
            field did_status: DidStatus = Created
            field version: String = "DIDxWALLET_5.9.0" (* @xalkan *)
            
            (* Verification methods @key: key purpose @value: public DID key *)
            field verification_methods: Map String ByStr33 = did_methods
            field dkms: Map String String = did_dkms
            
            (* Services @key: ID @value: endpoint *)
            field services: Map String ByStr20 = empty_services
            field services_: Map String Endpoint = empty_services_
            
            field did_hash: ByStr = zeroByStr
            
            (* The block number when the DID Create operation occurred *)
            field did_created: BNum = BNum 0
            
            (* The block number when the last DID CRUD operation occurred *)
            field ledger_time: BNum = BNum 0
            
            (* A monotonically increasing number representing the amount of DID CRUD transactions that have taken place *)
            field tx_number: Uint128 = zero
            
            field social_guardians: Map ByStr32 Bool = empty_guardians
            field counter: Uint32 = zero_
            field signed_addr: ByStr = zeroByStr
            
            field did_domain_dns: Map String ByStr20 = empty_domains
            field deadline: Uint128 = Uint128 10
          
          procedure SupportTyron( tyron: Option Uint128 )
            match tyron with
            | None => | Some donation =>
              current_init <-& init.dApp;
              donateId = let id = "donate" in let hash = builtin sha256hash id in builtin to_string hash;
              get_addr <-& current_init.dns[donateId]; addr = option_bystr20_value get_addr;
              accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donation } in one_msg m; send msg end end
          
          procedure IsOperational()
            current_status <- did_status; match current_status with
              | Deactivated => e = { _exception: "DIDxWallet-WrongStatus" }; throw e
              | Locked => e = { _exception: "DIDxWallet-DidLocked" }; throw e
              | _ => end end
          
          procedure VerifyController( tyron: Option Uint128 )
            current_controller <- controller;
            verified = builtin eq _origin current_controller; match verified with
              | True => SupportTyron tyron
              | False => e = { _exception: "DIDxWallet-WrongCaller" }; throw e end end
          
          procedure Timestamp()
            current_block <- &BLOCKNUMBER; ledger_time := current_block;
            latest_tx_number <- tx_number;
            new_tx_number = let incrementor = Uint128 1 in builtin add latest_tx_number incrementor; tx_number := new_tx_number end
          
          procedure ThrowIfSameAddr(
            a: ByStr20,
            b: ByStr20
            )
            is_self = builtin eq a b; match is_self with
              | False => | True => e = { _exception: "DIDxWallet-SameAddress" }; throw e end end
          
          procedure ThrowIfSameName(
            a: ByStr32,
            b: ByStr32
            )
            is_same = builtin eq a b; match is_same with
              | False => | True => e = { _exception: "DIDxWallet-SameUsername" }; throw e end end
          
          transition UpdateController(
            addr: ByStr20,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            current_controller <- controller; ThrowIfSameAddr current_controller addr;
            pending_controller := addr;
            Timestamp end
          
          transition AcceptPendingController()
            IsOperational; current_pending <- pending_controller;
            verified = builtin eq _origin current_pending; match verified with
              | True => | False => e = { _exception: "DIDxWallet-WrongCaller" }; throw e end;
            controller := current_pending; pending_controller := zeroByStr20;
            Timestamp end
          
          transition UpdateUsername(
            username: ByStr32,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            current_username <- nft_username; ThrowIfSameName current_username username;
            current_init <-& init.dApp; username_ = builtin to_string username;
            get_did <-& current_init.did_dns[username_]; match get_did with
              | Some did_ => pending_username := username
              | None => e = { _exception: "DIDxWallet-DidIsNull" }; throw e end;
            Timestamp end
          
          transition AcceptPendingUsername()
            IsOperational; current_init <-& init.dApp;
            current_pending <- pending_username; current_pending_ = builtin to_string current_pending;
            get_did <-& current_init.did_dns[current_pending_]; match get_did with
              | None => e = { _exception: "DIDxWallet-DidIsNull" }; throw e
              | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                  | True => | False => e = { _exception: "DIDxWallet-WrongCaller" }; throw e end;
                nft_username := current_pending; pending_username := zeroByStr32 end;
            Timestamp end
          
          (* Verify Schnorr signature - signed data must correspond with a DID key *)
          procedure VerifySignature(
            id: String,
            signedData: ByStr,
            signature: ByStr64
            )
            get_did_key <- verification_methods[id]; did_key = option_bystr33_value get_did_key;
            is_right_signature = builtin schnorr_verify did_key signedData signature; match is_right_signature with
              | True => | False => e = { _exception: "DIDxWallet-WrongSignature" }; throw e end end
          
          procedure SaveGuardians( id: ByStr32 )
            repeated <- exists social_guardians[id]; match repeated with
              | True => e = { _exception: "DIDxWallet-SameGuardianId" }; throw e
              | False => true = True; social_guardians[id] := true end end
          
          transition AddGuardians(
            guardians: List ByStr32,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            length = let list_length = @list_length ByStr32 in list_length guardians;
            is_ok = uint32_ge length three; match is_ok with
              | False => e = { _exception: "DIDxWallet-InsufficientAmount" }; throw e
              | True =>
                forall guardians SaveGuardians;
                is_three = builtin eq length three;
                min = match is_three with
                  | True => three
                  | False => let div_ = builtin div length two in builtin add div_ one end;
                counter := min end;
            Timestamp end
          
          procedure RemoveGuardian( id: ByStr32 )
            is_guardian <- exists social_guardians[id]; match is_guardian with
              | True => delete social_guardians[id]
              | False => e = { _exception: "DIDxWallet-RemoveNoGuardian" }; throw e end end
          
          transition RemoveGuardians(
            guardians: List ByStr32,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            forall guardians RemoveGuardian;
            Timestamp end
          
          transition Lock(
            sig: ByStr64,
            tyron: Option Uint128
            )
            IsOperational; min <- counter;
            is_ok = uint32_ge min three; match is_ok with
              | False => e = { _exception: "DIDxWallet-InsufficientAmount" }; throw e
              | True =>
                this_did <- did; hash = let h = builtin sha256hash this_did in builtin to_bystr h;
                get_didkey <- verification_methods[recovery]; did_key = option_bystr33_value get_didkey;
                is_right_signature = builtin schnorr_verify did_key hash sig; match is_right_signature with
                  | False => e = { _exception: "DIDxWallet-WrongSignature" }; throw e
                  | True => SupportTyron tyron; locked = Locked; did_status := locked end end;
            Timestamp end
          
          procedure VerifySocialRecovery( proof: Pair ByStr32 ByStr64 )
            guardian = let fst_element = @fst ByStr32 ByStr64 in fst_element proof;
            guardian_sig = let snd_element = @snd ByStr32 ByStr64 in snd_element proof;
            is_valid <- exists social_guardians[guardian]; match is_valid with
              | False => e = { _exception: "DIDxWallet-WrongCaller" }; throw e
              | True =>
                current_init <-& init.dApp; guardian_ = builtin to_string guardian;
                get_did <-& current_init.did_dns[guardian_]; match get_did with
                  | None => e = { _exception: "DIDxWallet-DidIsNull" }; throw e
                  | Some did_ =>
                    get_did_key <-& did_.verification_methods[recovery]; did_key = option_bystr33_value get_did_key; signed_data <- signed_addr;
                    is_right_signature = builtin schnorr_verify did_key signed_data guardian_sig; match is_right_signature with
                      | False => | True => counter_ <- counter; add_ = builtin add counter_ one; counter := add_ end end end end
          
          transition DidSocialRecovery( 
            addr: ByStr20,
            signatures: List( Pair ByStr32 ByStr64 ),
            tyron: Option Uint128
            )
            current_status <- did_status; match current_status with
            | Deactivated => e = { _exception: "DIDxWallet-WrongStatus" }; throw e
            | _ => end;
            current_controller <- controller; ThrowIfSameAddr current_controller addr;
            signed_data = builtin to_bystr addr; signed_addr := signed_data;
            sig = let list_length = @list_length( Pair ByStr32 ByStr64 ) in list_length signatures;
            min <- counter; is_ok = uint32_ge sig min;
            match is_ok with
            | False => e = { _exception: "DIDxWallet-InsufficientAmount" }; throw e
            | True =>
              counter := zero_; forall signatures VerifySocialRecovery;
              counter_ <- counter; is_ok_ = uint32_ge counter_ min; match is_ok_ with
                | False => e = { _exception: "DIDxWallet-WrongSignature" }; throw e
                | True =>
                  SupportTyron tyron; controller := addr;
                  social_guardians := empty_guardians;
                  verification_methods := empty_methods; dkms := empty_dkms;
                  services := empty_services; services_ := empty_services_ end end;
            new_status = Recovered; did_status := new_status;
            Timestamp end
          
          procedure ThrowIfNoKey( optKey: Option ByStr33 )
            match optKey with
            | Some key => | None => e = { _exception: "DIDxWallet-UndefinedKey" }; throw e end end
          
          procedure VerifyUpdateKey( didUpdate: ByStr33 )
            get_update_key <- verification_methods[update]; new_update = option_bystr33_value get_update_key;
            is_same_key = builtin eq didUpdate new_update; match is_same_key with
              | False => | True => e = { _exception: "DIDxWallet-SameKey" }; throw e end end
          
          procedure HashDocument( document: Document )
            doc_hash <- did_hash;
            element_hash = match document with
            | VerificationMethod action purpose key encrypted =>
              match action with
              | Add =>
                let h1 = builtin sha256hash actionAdd in
                let h2 = builtin sha256hash purpose in
                let h3 = builtin sha256hash key in
                let h4 = builtin sha256hash encrypted in
                let h1_2 = builtin concat h1 h2 in
                let h1_3 = builtin concat h1_2 h3 in
                let hash = builtin concat h1_3 h4 in
                builtin to_bystr hash
              | Remove =>
                let h1 = builtin sha256hash actionRemove in
                let h2 = builtin sha256hash purpose in
                let hash = builtin concat h1 h2 in
                builtin to_bystr hash end
            | Service action id endpoint =>
                match action with
                | Add =>
                  let h1 = builtin sha256hash actionAdd in
                  let h2 = builtin sha256hash id in
                  match endpoint with
                  | Uri eType transfer uri =>
                    let h3 = builtin sha256hash uri in
                    let h1_2 = builtin concat h1 h2 in
                    let hash = builtin concat h1_2 h3 in
                    builtin to_bystr hash
                  | Address address =>
                    match address with
                    | Zilliqa addr =>
                      let h3 = builtin sha256hash addr in
                      let h1_2 = builtin concat h1 h2 in
                      let hash = builtin concat h1_2 h3 in
                      builtin to_bystr hash
                    | Other addr =>
                      let h3 = builtin sha256hash addr in
                      let h1_2 = builtin concat h1 h2 in
                      let hash = builtin concat h1_2 h3 in
                      builtin to_bystr hash end end
                | Remove =>
                  let h1 = builtin sha256hash actionRemove in
                  let h2 = builtin sha256hash id in
                  let hash = builtin concat h1 h2 in
                  builtin to_bystr hash end end;
            new_doc_hash = builtin concat doc_hash element_hash;
            did_hash := new_doc_hash end
          
          procedure UpdateDocument( document: Document )
            match document with
            | VerificationMethod action purpose key encrypted =>
              match action with
              | Add =>
                verification_methods[purpose] := key;
                dkms[purpose] := encrypted
              | Remove =>
                key_exists <- exists verification_methods[purpose];
                match key_exists with
                | True =>
                  delete verification_methods[purpose];
                  delete dkms[purpose]
                | False => e = { _exception: "DIDxWallet-RemoveNoKey" }; throw e end end
            | Service action id endpoint =>
              match action with
              | Add =>
                match endpoint with
                | Address address =>
                  match address with
                  | Zilliqa addr => services[id] := addr
                  | Other adrr => services_[id] := endpoint end
                | Uri eType protocol uri => services_[id] := endpoint end
              | Remove =>
                is_service <- exists services[id];
                is_service_ <- exists services_[id];
                service_exists = orb is_service is_service_;
                match service_exists with
                | True => delete services[id]; delete services_[id]
                | False => e = { _exception: "DIDxWallet-RemoveNoService" }; throw e end end end end
          
          procedure VerifyDocument(
            document: List Document,
            signature: Option ByStr64
            )
            get_update_key <- verification_methods[update]; update_key = option_bystr33_value get_update_key;
            is_null = builtin eq update_key zeroByStr33; match is_null with
            | True => | False => 
              forall document HashDocument; doc_hash <- did_hash;
              sig = option_bystr64_value signature;
              VerifySignature update doc_hash sig end;
            forall document UpdateDocument;
            did_hash := zeroByStr end
          
          transition DidUpdate(
            document: List Document,
            signature: Option ByStr64,
            tyron: Option Uint128
            )
            VerifyController tyron;
            current_status <- did_status; match current_status with
              | Created =>
                get_update_key <- verification_methods[update]; did_update = option_bystr33_value get_update_key;
                VerifyDocument document signature; VerifyUpdateKey did_update
              | Updated =>
                get_update_key <- verification_methods[update]; did_update = option_bystr33_value get_update_key;
                VerifyDocument document signature; VerifyUpdateKey did_update
              | Recovered =>
                forall document UpdateDocument;
                get_did_update <- verification_methods[update]; ThrowIfNoKey get_did_update
              | _ => e = { _exception: "DIDxWallet-WrongStatus" }; throw e end;
            new_status = Updated; did_status := new_status;
            Timestamp end
          
          transition DidDeactivate(
            document: List Document,
            signature: Option ByStr64,
            tyron: Option Uint128
            ) 
            IsOperational; VerifyController tyron;
            VerifyDocument document signature;
            did := empty_string; controller := zeroByStr20; deadline := zero;
            verification_methods := empty_methods; dkms := empty_dkms;
            services := empty_services; services_ := empty_services_; social_guardians := empty_guardians;
            did_domain_dns := empty_domains;
            new_status = Deactivated; did_status := new_status;
            Timestamp end
          
          transition Dns(
            addr: ByStr20,
            domain: String,
            didKey: ByStr33,
            encrypted: String,
            tyron: Option Uint128
            )
            current_status <- did_status; match current_status with
              | Created => | Recovered => | Updated =>
              | _ => e = { _exception: "DIDxWallet-WrongStatus" }; throw e end;
            VerifyController tyron; ThrowIfSameAddr _this_address addr;
            verification_methods[domain] := didKey; dkms[domain] := encrypted; did_domain_dns[domain] := addr; 
            new_status = Updated; did_status := new_status;
            Timestamp end
          
          (* Wallet backbone *)
          
          transition UpdateDeadline(
            val: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; deadline := val;
            Timestamp end
          
          procedure FetchServiceAddr( id: String )
            current_init <-& init.dApp;
            initId = let id_ = "init" in let hash = builtin sha256hash id_ in builtin to_string hash;
            get_did <-& current_init.did_dns[initId]; match get_did with
              | None => e = { _exception: "DIDxWallet-DidIsNull" }; throw e
              | Some did_ =>
                get_service <-& did_.services[id]; addr = option_bystr20_value get_service;
                services[id] := addr end end
          
          procedure IncreaseAllowanceInit(
            addrName: String,
            amount: Uint128
            )
            FetchServiceAddr addrName;
            get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            current_init <-& init.dApp;
            initId = let id = "init" in let hash = builtin sha256hash id in builtin to_string hash; (* @xalkan add hash value *)
            get_did <-& current_init.did_dns[initId]; init_did = option_bystr20_value get_did;
            msg = let m = { _tag: "IncreaseAllowance"; _recipient: token_addr; _amount: zero;
              spender: init_did;
              amount: amount } in one_msg m ; send msg end
          
          transition IncreaseAllowance(
            addrName: String,
            spender: ByStr20,
            amount: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; FetchServiceAddr addrName;
            get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "IncreaseAllowance"; _recipient: token_addr; _amount: zero;
              spender: spender;
              amount: amount } in one_msg m ; send msg;
            Timestamp end
          
          transition DecreaseAllowance(
            addrName: String,
            spender: ByStr20,
            amount: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; FetchServiceAddr addrName;
            get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "DecreaseAllowance"; _recipient: token_addr; _amount: zero;
              spender: spender;
              amount: amount } in one_msg m ; send msg;
            Timestamp end
          
          transition BuyNftUsername(
            id: String,
            username: String,
            addr: Option ByStr20,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; current_init <-& init.dApp;
            is_free = builtin eq id free; match is_free with
              | True => | False =>
                current_impl <-& current_init.implementation; txID = "BuyNftUsername";
                get_fee <-& current_impl.utility[id][txID]; fee = option_uint128_value get_fee;
                IncreaseAllowanceInit id fee end;
            address = match addr with
              | Some addr_ => addr_
              | None => _this_address end;
            msg = let m = { _tag: "BuyNftUsername"; _recipient: current_init; _amount: zero;
              id: id;
              username: username;
              addr: address;
              dID: _this_address } in one_msg m; send msg;
            Timestamp end
          
          transition UpdateNftDid(
            id: String,
            username: String,
            dID: ByStr20 with contract
              field controller: ByStr20,
              field verification_methods: Map String ByStr33,
              field services: Map String ByStr20 end,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; current_init <-& init.dApp;
            is_free = builtin eq id free; match is_free with
              | True => | False =>
                current_impl <-& current_init.implementation; txID = "UpdateNftDid";
                get_fee <-& current_impl.utility[id][txID]; fee = option_uint128_value get_fee;
                IncreaseAllowanceInit id fee end;
            msg = let m = { _tag: "UpdateNftDid"; _recipient: current_init; _amount: zero;
              id: id;
              username: username;
              dID: dID } in one_msg m; send msg;
            Timestamp end
          
          transition TransferNftUsername(
            id: String,
            username: String,
            addr: ByStr20,
            dID: ByStr20 with contract
              field controller: ByStr20,
              field verification_methods: Map String ByStr33,
              field services: Map String ByStr20 end,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; current_init <-& init.dApp;
            is_free = builtin eq id free; match is_free with
              | True => | False => 
                current_impl <-& current_init.implementation; txID = "TransferNftUsername";
                get_fee <-& current_impl.utility[id][txID]; fee = option_uint128_value get_fee;
                IncreaseAllowanceInit id fee end;
            msg = let m = { _tag: "TransferNftUsername"; _recipient: current_init; _amount: zero;
              id: id;
              username: username;
              addr: addr;
              dID: dID } in one_msg m; send msg;
            Timestamp end
          
          (* Receive $ZIL native funds *)
          transition AddFunds()
            IsOperational; accept; Timestamp end
          
          (* Send $ZIL to any recipient that implements the tag, e.g. "AddFunds", "", etc. *)
          transition SendFunds(
            tag: String,
            beneficiary: Beneficiary,
            amount: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            match beneficiary with
            | NftUsername username_ domain_ =>
              current_init <-& init.dApp;
              is_ssi = builtin eq domain_ empty_string; match is_ssi with
                | True =>
                  get_addr <-& current_init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr _this_address addr;
                  msg = let m = { _tag: tag; _recipient: addr; _amount: amount } in one_msg m; send msg
                | False =>
                  get_did <-& current_init.did_dns[username_]; match get_did with
                    | None => e = { _exception: "DIDxWallet-DidIsNull" }; throw e
                    | Some did_ =>
                      is_did = builtin eq domain_ did; match is_did with
                        | True => msg = let m = { _tag: tag; _recipient: did_; _amount: amount } in one_msg m; send msg
                        | False =>
                          get_domain_addr <-& did_.did_domain_dns[domain_]; domain_addr = option_bystr20_value get_domain_addr;
                          msg = let m = { _tag: tag; _recipient: domain_addr; _amount: amount } in one_msg m; send msg end end end
            | Recipient addr_ =>
              ThrowIfSameAddr _this_address addr_;
              msg = let m = { _tag: tag; _recipient: addr_; _amount: amount } in one_msg m; send msg end;
            Timestamp end
          
          transition Transfer(
            addrName: String,
            beneficiary: Beneficiary,
            amount: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; FetchServiceAddr addrName;
            get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            match beneficiary with
            | NftUsername username_ domain_ =>
              current_init <-& init.dApp;
              is_ssi = builtin eq domain_ empty_string; match is_ssi with
                | True =>
                  get_addr <-& current_init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr _this_address addr; (* @xalkan throw if null *)
                  msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                    to: addr;
                    amount: amount } in one_msg m ; send msg
                | False =>
                  get_did <-& current_init.did_dns[username_]; match get_did with
                    | None => e = { _exception: "DIDxWallet-DidIsNull" }; throw e
                    | Some did_ =>
                      is_did = builtin eq domain_ did; match is_did with
                        | True =>
                          msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                          to: did_;
                          amount: amount } in one_msg m ; send msg
                        | False =>
                          get_domain_addr <-& did_.did_domain_dns[domain_]; domain_addr = option_bystr20_value get_domain_addr;
                          msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                            to: domain_addr;
                            amount: amount } in one_msg m ; send msg end end end
            | Recipient addr_ =>
              ThrowIfSameAddr _this_address addr_;
              msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                to: addr_;
                amount: amount } in one_msg m ; send msg end;
            Timestamp end
          
          transition RecipientAcceptTransfer( sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational; Timestamp end
          
          transition RecipientAcceptTransferFrom( initiator: ByStr20, sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational; Timestamp end
          
          transition TransferSuccessCallBack( sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational end
          
          transition TransferFromSuccessCallBack( initiator: ByStr20, sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational end
          
          procedure TransferTokens( input: Pair String Uint128 )
            addr_name = let fst_element = @fst String Uint128 in fst_element input;
            amount = let snd_element = @snd String Uint128 in snd_element input;
            addr <- controller; FetchServiceAddr addr_name;
            get_token_addr <- services[addr_name]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
              to: addr;
              amount: amount } in one_msg m ; send msg end
          
          transition Upgrade(
            id: Option String,
            username: Option String,
            addr: ByStr20,
            dID: Option ByStr20 with contract
              field controller: ByStr20,
              field verification_methods: Map String ByStr33,
              field services: Map String ByStr20 end,
            tokens: List( Pair String Uint128 ),
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            ThrowIfSameAddr _this_address addr;
            match username with
            | None => | Some username_ =>
              match id with
              | None => e = { _exception: "DIDxWallet-IdIsNull" }; throw e
              | Some id_ =>
                match dID with
                | None => e = { _exception: "DIDxWallet-DidIsNull" }; throw e
                | Some dID_ =>
                  current_init <-& init.dApp;
                  is_free = builtin eq id_ free; match is_free with
                    | True => | False =>
                      current_impl <-& current_init.implementation; txID = "TransferNftUsername";
                      get_fee <-& current_impl.utility[id_][txID]; fee = option_uint128_value get_fee;
                      IncreaseAllowanceInit id_ fee end;
                  msg = let m = { _tag: "TransferNftUsername"; _recipient: current_init; _amount: zero;
                    id: id_;
                    username: username_;
                    addr: addr;
                    dID: dID_ } in one_msg m; send msg end end end;
            current_controller <- controller; controller := addr;
            forall tokens TransferTokens; controller := current_controller;
            current_balance <- _balance;
            msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: current_balance } in one_msg m ; send msg;
            Timestamp end
        `
        ;

      const did_methods: Array<{ key: string, val: string }> = [];
      did_methods.push(
        {
          key: `${"update"}`,
          val: `${"0x000000000000000000000000000000000000000000000000000000000000000000"}`,
        }
      );
      const did_dkms: Array<{ key: string, val: string }> = [];
      did_dkms.push(
        {
          key: `${"null"}`,
          val: `${"null"}`,
        }
      );
      console.log(did_methods)
      console.log(did_dkms)
      const init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "init_controller",
          type: "ByStr20",
          value: `${address}`,
        },
        {
          vname: "init",
          type: "ByStr20",
          value: `${init_tyron}`,
        },
        {
          vname: "did_methods",
          type: "Map String ByStr33",
          value: did_methods,
        },
        {
          vname: "did_dkms",
          type: "Map String String",
          value: did_dkms,
        },
      ];
      const contract = contracts.new(code, init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "45000",
        gasPrice: "2000000000",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error
    }
  }

  async deployDomain(net: string, domain: string, address: string) {
    try {
      const zilPay = await this.zilpay();
      const { contracts } = zilPay;
      let addr = "";

      // mainnet
      switch (domain) {
        case 'vc':
          addr = '0x6ae25f8df1f7f3fae9b8f9630e323b456c945e88';
          break;
        case 'ssi':
          addr = '';
          break;
      }
      if (net === "testnet") {
        switch (domain) {
          case "vc":
            addr = "0x25B4B343ba84D53c2f9Db964Fd966BB1a579EF25";
            break;
          case "dex":
            addr = "0x440a4d55455dE590fA8D7E9f29e17574069Ec05e";
            break;
          case "stake":
            addr = "0xD06266c282d0FF006B9D3975C9ABbf23eEd6AB22";
            break;
        }
      }

      const template = contracts.at(addr);
      const code = await template.getCode();

      const init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "init_controller",
          type: "ByStr20",
          value: `${address}`,
        },
      ];

      const contract = contracts.new(code, init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
        gasPrice: "2000000000",
      });
      toast.info('You successfully created a DID Domain!', {
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

  async deployDApp(net: string) {
    try {
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;

      //@todo-x
      let previous_version = '0xe574a9e78f60812be7c544d55d270e75481d0e93';
      let init_ = '0x57ab899357ad95f5bf345f6575ad8c9a53e55cdc';
      let name_did = '0x62508a9464f51c3053b01cc9b7e794af1f181b73';

      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
        previous_version = '0x8b7e67164b7fba91e9727d553b327ca59b4083fc';
        init_ = '0xef497433bae6e66ca8a46039ca3bde1992b0eadd';   // contract owner/impl
        name_did = '0x27748ef59a8a715ab325dd4b1198800eba8a9cb0'; // DIDxWallet
      }
      const init = new tyron.ZilliqaInit.default(network);

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      //@todo-x
      const code =
        `
      (* v3.5.0
        init.tyron: SSI Initialization & DNS DApp <> Proxy smart contract
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
        
        library Init
          let one_msg =
            fun( msg: Message ) =>
            let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
        
          type Caller =
            | Controller
            | Implementation
          
          let controller_ = Controller
          let implementation_ = Implementation
          let donateDApp = "donate"
          let donateAddr = 0xc88ab766cdbe10e5961026633ad67c57f2e4aaf1   (* @todo *)
        
        contract Init(
          name: String,
          nameDid: ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end,
          init_: ByStr20 with contract 
            field nft_username: String,
            field paused: Bool,
            field utility: Map String Map String Uint128 end,
          initDns: Map String ByStr20,
          initDidDns: Map String ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          field implementation: ByStr20 with contract
            field nft_username: String,
            field paused: Bool,
            field utility: Map String Map String Uint128 end = init_
        
          (* DNS records @key: NFT Username @value: address *)
          field dns: Map String ByStr20 = let map = builtin put initDns name nameDid in builtin put map donateDApp donateAddr
          field did_dns: Map String ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end = let map = builtin put initDidDns name nameDid in builtin put map donateDApp nameDid
        
          field version: String = "init----3.5.0" (* @todo *)
        
        procedure VerifyCaller( caller: Caller )
          current_impl <- implementation;
          is_paused <-& current_impl.paused; match is_paused with
          | False => | True => e = { _exception : "init.tyron-WrongStatus" }; throw e end;
          match caller with
          | Controller =>
              current_username <-& current_impl.nft_username;
              get_did <- did_dns[current_username]; match get_did with
              | None => e = { _exception : "init.tyron-DidIsNull" }; throw e
              | Some did_ =>
                  current_controller <-& did_.controller;
                  verified = builtin eq _origin current_controller; match verified with
                  | True => | False => e = { _exception : "init.tyron-WrongCaller/Controller" }; throw e end end
          | Implementation =>
              verified = builtin eq _sender current_impl; match verified with
              | True => | False => e = { _exception : "init.tyron-WrongCaller/Implementation" }; throw e end end end
        
        procedure ThrowIfSameAddr(
          a: ByStr20,
          b: ByStr20
          )
          is_self = builtin eq a b; match is_self with
          | False => | True => e = { _exception : "init.tyron-SameAddress" }; throw e end end
        
        transition UpdateImplementation(
          addr: ByStr20 with contract
            field nft_username: String,
            field paused: Bool,
            field utility: Map String Map String Uint128,
            field did: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          VerifyCaller controller_; current_impl <- implementation; ThrowIfSameAddr current_impl addr;
          implementation := addr; initDApp = "init"; dns[initDApp] := addr; did_dns[initDApp] := addr;
          e = { _eventname: "ImplementationUpdated";
            newImplementation: addr }; event e end
        
        transition NftUsernameCallBack(
          username: String,
          addr: ByStr20
          )
          VerifyCaller implementation_; dns[username] := addr end
        
        transition NftDidCallBack(
          username: String,
          dID: ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          VerifyCaller implementation_; did_dns[username] := dID end
        
        transition BuyNftUsername(
          id: String,
          username: String,
          addr: ByStr20,
          dID: ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          current_impl <- implementation;
          accept; msg = let m = { _tag: "BuyNftUsername"; _recipient: current_impl; _amount: _amount;
            id: id;
            username: username;
            addr: addr;
            dID: dID } in one_msg m; send msg end
        
        transition UpdateNftDid(
          id: String,
          username: String,
          dID: ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          current_impl <- implementation;
          accept; msg = let m = { _tag: "UpdateNftDid"; _recipient: current_impl; _amount: _amount;
            id: id;
            username: username;
            dID: dID } in one_msg m; send msg end
        
        transition TransferNftUsername(
          id: String,
          username: String,
          addr: ByStr20,
          dID: ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          current_impl <- implementation;
          accept; msg = let m = { _tag: "TransferNftUsername"; _recipient: current_impl; _amount: _amount;
            id: id;
            username: username;
            addr: addr;
            dID: dID } in one_msg m; send msg end
      `
        ;

      const get_dns = await init.API.blockchain.getSmartContractSubState(
        previous_version,
        "guardians"// "did_dns"
      );
      // const get_did_dns = await init.API.blockchain.getSmartContractSubState(
      //   previous_version,
      //   "guardians"// "did_dns"
      // );

      const init_dns_ = Object.entries(get_dns.result.guardians)//dns)
      // const init_did_dns_ = Object.entries(get_did_dns.result.did_dns)

      let init_dns: Array<{ key: string, val: string }> = [];
      for (let i = 0; i < init_dns_.length; i += 1) {
        init_dns.push(
          {
            key: init_dns_[i][0],//init_did_dns_[i][0],
            val: init_dns_[i][1] as string//init_did_dns_[i][1] as string
          },
        );
      };
      // let init_did_dns: Array<{ key: string, val: string }> = [];
      // for (let i = 0; i < init_did_dns_.length; i += 1) {
      //   init_did_dns.push(
      //     {
      //       key: init_did_dns_[i][0],
      //       val: init_did_dns_[i][1] as string
      //     },
      //   );
      // }; 

      const init_username = "tyronmapu";

      let init_did_dns: Array<{ key: string, val: string }> = [];
      init_did_dns.push(
        {
          key: `${init_username}`,
          val: `${name_did}`
        },
      );

      const contract_init = [
        {
          vname: '_scilla_version',
          type: 'Uint32',
          value: '0',
        },
        {
          vname: 'name',
          type: 'String',
          value: `${init_username}`
        },
        {
          vname: 'nameDid',
          type: 'ByStr20',
          value: `${name_did}`,
        },
        {
          vname: 'init_',
          type: 'ByStr20',
          value: `${init_}`,
        },
        {
          vname: 'initDns',
          type: 'Map String ByStr20',
          value: init_dns
        },
        {
          vname: 'initDidDns',
          type: 'Map String ByStr20',
          value: init_did_dns
        }
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
        gasPrice: "2000000000",
      });
      toast.info('You successfully deployed a new DApp.', {
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

  async deployImpl(net: string, address: string, arConnect: any) {
    try {
      let proxy = '0xdfc81a41a7a1ce6ed99e27f9aa1ede4f6d97c7d0';
      if (net === "testnet") {
        proxy = '0x26193045954ffdf23859c679c29ad164932adda1'
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
      (* v3.4.0
        initi.tyron: SSI Initialization & DNS DApp <> Implementation smart contract
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
        
        import BoolUtils ListUtils IntUtils
        
        library InitI
          type DidStatus =
            | Created
            | Recovered
            | Updated
            | Deactivated
        
          type Operation =
            | Recovery
            | Update
          
          type Action =
            | Add
            | Remove
        
          type TransferProtocol =
            | Https
            | Git
        
          type BlockchainType =
            | Zilliqa of ByStr20
            | Other of String
        
          type Endpoint =
            | Address of BlockchainType
            | Uri of String TransferProtocol String   (* type, transfer protocol & uri *)
          
          type Document =
            | VerificationMethod of Action String ByStr33 String (* add/remove, key purpose, public key & encrypted private key *)
            | Service of Action String Endpoint (* add/remove, service ID & service *) 
          
          let didRecovery = Recovery
          let didUpdate = Update
          let update = "update"
          let recovery = "socialrecovery"
          let actionAdd = "add"
          let actionRemove = "remove"
          let empty_methods = Emp String ByStr33
          let empty_dkms = Emp String String
          let empty_services = Emp String ByStr20
          let empty_services_ = Emp String Endpoint
          let empty_guardians = Emp ByStr32 Bool
        
          let one_msg = fun( msg: Message ) =>
            let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
        
          let zero = Uint128 0
          let zeroByStr20 = 0x0000000000000000000000000000000000000000
          let zeroByStr33 = 0x000000000000000000000000000000000000000000000000000000000000000000
          let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
          let zeroByStr = builtin to_bystr zeroByStr20
        
          let option_value = 
            tfun 'A => fun( default: 'A ) => fun( input: Option 'A) => match input with
            | Some v => v
            | None => default end
          let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
          let option_bystr33_value = let f = @option_value ByStr33 in f zeroByStr33
          let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64
        
          let zero_ = Uint32 0
          let did = "did"
          let null = ""
        
          type Beneficiary =
            | NftUsername of String String (* username & domain *)
            | Recipient of ByStr20
        
          let true = True
          let false = False
          let tyronID = "tyron"
          let tyronAddr = 0x7c8e77441667ce1e223c1a5bd658287ab1ebd5cc   (* @todo *)
          
          let compare_participant = fun( addr: ByStr20 ) => fun( participant: ByStr20 ) => builtin eq addr participant
        
        contract InitI(
          init_username: String,
          init: ByStr20 with contract
            field dns: Map String ByStr20,
            field did_dns: Map String ByStr20 with contract
              field did: String,   (* the W3C decentralized identifier *)
              field nft_username: String,
              field controller: ByStr20,
              field version: String,
              field verification_methods: Map String ByStr33,
              field services: Map String ByStr20,
              field social_guardians: Map ByStr32 Bool,
              field did_domain_dns: Map String ByStr20,
              field deadline: Uint128 end end,
          did_methods: Map String ByStr33,
          did_dkms: Map String String
          )
          field did: String = let did_prefix = "did:tyron:zil:main:" in let did_suffix = builtin to_string _this_address in
            builtin concat did_prefix did_suffix   (* the W3C decentralized identifier *)
          field nft_username: String = init_username
          field pending_username: String = null
          field controller: ByStr20 = zeroByStr20
          field did_status: DidStatus = Created
          field version: String = "initi---3.4.0"   (* @todo *)
          
          (* Verification methods @key: key purpose @value: public DID key *)
          field verification_methods: Map String ByStr33 = did_methods
          
          (* Decentralized Key Management System *)
          field dkms: Map String String = did_dkms
          
          (* Services @key: ID @value: endpoint *)
          field services: Map String ByStr20 = let emp = Emp String ByStr20 in
            builtin put emp tyronID tyronAddr
          field services_: Map String Endpoint = empty_services_
        
          field social_guardians: Map ByStr32 Bool = empty_guardians
          
          field did_domain_dns: Map String ByStr20 = Emp String ByStr20
          field deadline: Uint128 = Uint128 10
        
          field did_hash: ByStr = zeroByStr
          
          (* The block number when the DID Create operation occurred *)
          field did_created: BNum = BNum 0
          
          (* The block number when the last DID CRUD operation occurred *)  
          field ledger_time: BNum = BNum 0
          
          (* A monotonically increasing number representing the amount of DID CRUD transactions that have taken place *)
          field tx_number: Uint128 = zero
          
          field paused: Bool = False
          field beta: Bool = False
        
          field utility: Map String Map String Uint128 =
            let emp = Emp String Map String Uint128 in let emp_ = Emp String Uint128 in
            let buyID = "BuyNftUsername" in let ten = Uint128 10000000000000 in let m_ = builtin put emp_ buyID ten in
            let transferID = "TransferNftUsername" in let fifteen = Uint128 15000000000000 in let m = builtin put m_ transferID fifteen in
            builtin put emp tyronID m
          
          field minchar: Uint32 = Uint32 6
        
          field free_list: List ByStr20 = Nil{ ByStr20 }
          
        procedure SupportTyron( tyron: Option Uint128 )
          match tyron with
          | None => | Some donation =>
            donateDApp = "donate"; get_addr <-& init.dns[donateDApp]; addr = option_bystr20_value get_addr;
            accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donation } in one_msg m; send msg end end
        
        procedure IsOperational()
          current_status <- did_status; match current_status with
            | Deactivated => e = { _exception : "initi.tyron-WrongStatus" }; throw e
            | _ => end end
        
        procedure VerifyController( tyron: Option Uint128 )
          current_username <- nft_username;
          get_did <-& init.did_dns[current_username]; match get_did with
            | None => e = { _exception : "initi.tyron-DidIsNull" }; throw e
            | Some did_ =>
              current_controller <-& did_.controller;
              verified = builtin eq _origin current_controller; match verified with
                | True => | False => e = { _exception : "initi.tyron-WrongCaller" }; throw e end;
              SupportTyron tyron; controller := current_controller end end
        
        procedure Timestamp()
          current_block <- &BLOCKNUMBER; ledger_time := current_block;
          latest_tx_number <- tx_number;
          new_tx_number = let incrementor = Uint128 1 in builtin add latest_tx_number incrementor; tx_number := new_tx_number end
        
        procedure ThrowIfSameAddr(
          a: ByStr20,
          b: ByStr20
          )
          is_same = builtin eq a b; match is_same with
            | False => | True => e = { _exception : "initi.tyron-SameAddress" }; throw e end end
        
        procedure ThrowIfSameName(
          a: String,
          b: String
          )
          is_same = builtin eq a b; match is_same with
            | False => | True => e = { _exception : "initi.tyron-SameUsername" }; throw e end end
        
        transition UpdateUsername(
          username: String,
          tyron: Option Uint128
          )
          IsOperational; VerifyController tyron;
          current_username <- nft_username; ThrowIfSameName current_username username;
          get_did <-& init.did_dns[username]; match get_did with
            | None => e = { _exception : "initi.tyron-DidIsNull" }; throw e
            | Some did_ => pending_username := username end;
          Timestamp end
        
        transition AcceptPendingUsername()
          IsOperational; current_pending <- pending_username;
          get_did <-& init.did_dns[current_pending]; match get_did with
            | None => e = { _exception : "initi.tyron-DidIsNull" }; throw e
            | Some did_ =>
              current_controller <-& did_.controller;
              verified = builtin eq _origin current_controller; match verified with
                | True => | False => e = { _exception : "initi.tyron-WrongCaller" }; throw e end;
              nft_username := current_pending; pending_username := null end;
          Timestamp end
        
        (* Verify Schnorr signature - signed data must correspond with a DID key *)
        procedure VerifySignature(
          id: String,
          signedData: ByStr,
          signature: ByStr64
          )
          get_did_key <- verification_methods[id]; did_key = option_bystr33_value get_did_key;
          is_right_signature = builtin schnorr_verify did_key signedData signature; match is_right_signature with
            | True => | False => e = { _exception : "initi.tyron-WrongSignature" }; throw e end end
        
        procedure ThrowIfNoKey( optKey: Option ByStr33 )
          match optKey with
          | Some key => | None => e = { _exception : "initi.tyron-UndefinedKey" }; throw e end end
        
        procedure VerifyUpdateKey( didUpdate: ByStr33 )
          get_update_key <- verification_methods[update]; new_update = option_bystr33_value get_update_key;
          is_same_key = builtin eq didUpdate new_update; match is_same_key with
            | False => | True => e = { _exception : "initi.tyron-SameKey" }; throw e end end
        
        procedure HashDocument( document: Document )
          doc_hash <- did_hash;
          element_hash = match document with
          | VerificationMethod action purpose key encrypted =>
            match action with
            | Add =>
              let h1 = builtin sha256hash actionAdd in
              let h2 = builtin sha256hash purpose in
              let h3 = builtin sha256hash key in
              let h4 = builtin sha256hash encrypted in
              let h1_2 = builtin concat h1 h2 in
              let h1_3 = builtin concat h1_2 h3 in
              let hash = builtin concat h1_3 h4 in
              builtin to_bystr hash
            | Remove =>
              let h1 = builtin sha256hash actionRemove in
              let h2 = builtin sha256hash purpose in
              let hash = builtin concat h1 h2 in
              builtin to_bystr hash end
          | Service action id endpoint =>
              match action with
              | Add =>
                let h1 = builtin sha256hash actionAdd in
                let h2 = builtin sha256hash id in
                match endpoint with
                | Uri eType transfer uri =>
                  let h3 = builtin sha256hash uri in
                  let h1_2 = builtin concat h1 h2 in
                  let hash = builtin concat h1_2 h3 in
                  builtin to_bystr hash
                | Address address =>
                  match address with
                  | Zilliqa addr =>
                    let h3 = builtin sha256hash addr in
                    let h1_2 = builtin concat h1 h2 in
                    let hash = builtin concat h1_2 h3 in
                    builtin to_bystr hash
                  | Other addr =>
                    let h3 = builtin sha256hash addr in
                    let h1_2 = builtin concat h1 h2 in
                    let hash = builtin concat h1_2 h3 in
                    builtin to_bystr hash end end
              | Remove =>
                let h1 = builtin sha256hash actionRemove in
                let h2 = builtin sha256hash id in
                let hash = builtin concat h1 h2 in
                builtin to_bystr hash end end;
          new_doc_hash = builtin concat doc_hash element_hash;
          did_hash := new_doc_hash end
        
        procedure UpdateDocument( document: Document )
          match document with
          | VerificationMethod action purpose key encrypted =>
            match action with
            | Add =>
              verification_methods[purpose] := key;
              dkms[purpose] := encrypted
            | Remove =>
              key_exists <- exists verification_methods[purpose];
              match key_exists with
              | True =>
                delete verification_methods[purpose];
                delete dkms[purpose]
              | False => e = { _exception : "initi.tyron-RemoveNoKey" }; throw e end end
          | Service action id endpoint =>
            match action with
            | Add =>
              match endpoint with
              | Address address =>
                match address with
                | Zilliqa addr => services[id] := addr
                | Other adrr => services_[id] := endpoint end
              | Uri eType protocol uri => services_[id] := endpoint end
            | Remove =>
              is_service <- exists services[id];
              is_service_ <- exists services_[id];
              service_exists = orb is_service is_service_;
              match service_exists with
              | True => delete services[id]; delete services_[id]
              | False => e = { _exception : "initi.tyron-RemoveNoService" }; throw e end end end end
        
        procedure VerifyDocument(
          document: List Document,
          signature: Option ByStr64
          )
          forall document HashDocument; doc_hash <- did_hash;
          sig = option_bystr64_value signature;
          VerifySignature update doc_hash sig;
          forall document UpdateDocument;
          did_hash := zeroByStr end
        
        transition DidUpdate(
          document: List Document,
          signature: Option ByStr64,
          tyron: Option Uint128
          )
          VerifyController tyron;
          current_status <- did_status; match current_status with
            | Created =>
              get_update_key <- verification_methods[update]; did_update = option_bystr33_value get_update_key;
              VerifyDocument document signature; VerifyUpdateKey did_update
            | Updated =>
              get_update_key <- verification_methods[update]; did_update = option_bystr33_value get_update_key;
              VerifyDocument document signature; VerifyUpdateKey did_update
            | Recovered =>
              forall document UpdateDocument;
              get_did_update <- verification_methods[update]; ThrowIfNoKey get_did_update
            | _ => e = { _exception : "initi.tyron-WrongStatus" }; throw e end;
          new_status = Updated; did_status := new_status;
          Timestamp end
        
        transition DidDeactivate(
          document: List Document,
          signature: Option ByStr64,
          tyron: Option Uint128
          ) 
          IsOperational; VerifyController tyron;
          VerifyDocument document signature;
          did := null; controller := zeroByStr20; deadline := zero;
          verification_methods := empty_methods; dkms := empty_dkms;
          services := empty_services; services_ := empty_services_; social_guardians := empty_guardians;
          new_status = Deactivated; did_status := new_status;
          Timestamp end
        
        transition Dns(
          addr: ByStr20,
          domain: String,
          didKey: ByStr33,
          encrypted: String,
          tyron: Option Uint128
          )
          current_status <- did_status; match current_status with
            | Created => | Recovered => | Updated =>
            | _ => e = { _exception : "initi.tyron-WrongStatus" }; throw e end;
          VerifyController tyron; ThrowIfSameAddr _this_address addr;
          verification_methods[domain] := didKey; dkms[domain] := encrypted; did_domain_dns[domain] := addr; 
          new_status = Updated; did_status := new_status;
          Timestamp end
        
        (* Wallet backbone *)
        
        transition UpdateDeadline(
          val: Uint128,
          tyron: Option Uint128
          )
          IsOperational; VerifyController tyron; deadline := val;
          Timestamp end
        
        transition IncreaseAllowance(
          addrName: String,
          spender: ByStr20,
          amount: Uint128,
          tyron: Option Uint128
          )
          IsOperational; VerifyController tyron;
          get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
          msg = let m = { _tag: "IncreaseAllowance"; _recipient: token_addr; _amount: zero;
            spender: spender;
            amount: amount } in one_msg m ; send msg;
          Timestamp end
        
        transition DecreaseAllowance(
          addrName: String,
          spender: ByStr20,
          amount: Uint128,
          tyron: Option Uint128
          )
          IsOperational; VerifyController tyron;
          get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
          msg = let m = { _tag: "DecreaseAllowance"; _recipient: token_addr; _amount: zero;
            spender: spender;
            amount: amount } in one_msg m ; send msg;
          Timestamp end
        
        (* Receive $ZIL native funds *)
        transition AddFunds()
          IsOperational; accept; Timestamp end
        
        (* Send $ZIL to any recipient that implements the tag, e.g. "AddFunds", "", etc. *)
        transition SendFunds(
          tag: String,
          beneficiary: Beneficiary,
          amount: Uint128,
          tyron: Option Uint128
          )
          IsOperational; VerifyController tyron;
          match beneficiary with
          | NftUsername username_ domain_ =>
            is_did = builtin eq domain_ did; match is_did with
              | True =>
                get_addr <-& init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr _this_address addr;
                msg = let m = { _tag: tag; _recipient: addr; _amount: amount } in one_msg m; send msg
              | False =>
                get_did <-& init.did_dns[username_]; match get_did with
                | None => e = { _exception : "initi.tyron-DidIsNull" }; throw e
                | Some did_ =>
                  get_domain_addr <-& did_.did_domain_dns[domain_]; domain_addr = option_bystr20_value get_domain_addr;
                  msg = let m = { _tag: tag; _recipient: domain_addr; _amount: amount } in one_msg m; send msg end end
          | Recipient addr_ =>
            ThrowIfSameAddr _this_address addr_;
            msg = let m = { _tag: tag; _recipient: addr_; _amount: amount } in one_msg m; send msg end;
          Timestamp end
        
        transition Transfer(
          addrName: String,
          beneficiary: Beneficiary,
          amount: Uint128,
          tyron: Option Uint128
          )
          IsOperational; VerifyController tyron;
          get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
          match beneficiary with
          | NftUsername username_ domain_ =>
            is_did = builtin eq domain_ did; match is_did with
              | True =>
                get_addr <-& init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr _this_address addr;
                msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                  to: addr;
                  amount: amount } in one_msg m ; send msg
              | False =>
                get_did <-& init.did_dns[username_]; match get_did with
                  | None => e = { _exception : "initi.tyron-DidIsNull" }; throw e
                  | Some did_ =>
                    get_domain_addr <-& did_.did_domain_dns[domain_]; domain_addr = option_bystr20_value get_domain_addr;
                    msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                      to: domain_addr;
                      amount: amount } in one_msg m ; send msg end end
          | Recipient addr_ =>
            ThrowIfSameAddr _this_address addr_;
            msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
              to: addr_;
              amount: amount } in one_msg m ; send msg end;
          Timestamp end
        
        transition RecipientAcceptTransfer( sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational; Timestamp end
        
        transition RecipientAcceptTransferFrom( initiator: ByStr20, sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational; Timestamp end
        
        transition TransferSuccessCallBack( sender: ByStr20, recipient: ByStr20, amount : Uint128 ) IsOperational end
        
        transition TransferFromSuccessCallBack( initiator: ByStr20, sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational end
        
        (* Init implementation backbone *)
        
        procedure ThrowIfNotProxy()
          verified = builtin eq init _sender; match verified with
            | True => | False => e = { _exception : "initi.tyron-NotProxy" }; throw e end end
        
        procedure IsNotPaused()
          is_paused <- paused; match is_paused with
            | False => | True => e = { _exception : "initi.tyron-IsPaused" }; throw e end end
        
        procedure IsPaused()
          is_paused <- paused; match is_paused with
            | True => | False => e = { _exception : "initi.tyron-IsNotPaused" }; throw e end end
        
        procedure IsNotNull( addr: ByStr20 )
          is_null = builtin eq addr zeroByStr20; match is_null with
            | False => | True => e = { _exception : "initi.tyron-AddressIsNull" }; throw e end end
        
        transition Pause( tyron: Uint128 )
          IsOperational; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_; IsNotPaused; paused := true;
          e = { _eventname: "SmartContractPaused";
            pauser: _origin }; event e;
          Timestamp end
        
        transition Unpause( tyron: Uint128 )
          IsOperational; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_; IsPaused; paused := false;
          e = { _eventname: "SmartContractUnpaused";
            pauser: _origin }; event e;
          Timestamp end
        
        transition Beta( tyron: Uint128 )
          IsOperational; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_; IsNotPaused;
          beta := true;
          Timestamp end
        
        transition UnBeta( tyron: Uint128 )
          IsOperational; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_; IsNotPaused;
          beta := false;
          Timestamp end
        
        procedure IsBeta()
          is_beta <- beta; match is_beta with
            | False => | True => e = { _exception : "initi.tyron-IsBeta" }; throw e end end
        
        transition AddUtility(
          id: String,
          txID: String,
          fee: Uint128,
          tyron: Uint128
          )
          IsOperational; IsNotPaused; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_;
          utility[id][txID] := fee;
          Timestamp end
          
        transition RemoveUtility(
          id: String,
          txID: String,
          tyron: Uint128
          )
          IsOperational; IsNotPaused; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_;
          delete utility[id][txID];
          Timestamp end
        
        transition UpdateMinChar(
          val: Uint32,
          tyron: Uint128
          )
          IsOperational; IsNotPaused; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_;
          minchar := val;
          Timestamp end
        
        procedure VerifyMinChar( username: String )
          length = builtin strlen username; current_minchar <- minchar;
          verified = uint32_ge length current_minchar; match verified with
            | True => | False => e = { _exception : "initi.tyron-NotEnoughChar" }; throw e end end
          
        procedure UpdateFreeList_( addr: ByStr20 )
          list <- free_list;
          list_updated = Cons{ ByStr20 } addr list;
          free_list := list_updated end
        
        transition UpdateFreeList(
          val: List ByStr20,
          tyron: Uint128
          )
          IsOperational; IsNotPaused; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_;
          forall val UpdateFreeList_;
          Timestamp end
        
        procedure NftUsernameCallBack(
          username: String,
          addr: ByStr20
          )
          msg = let m = { _tag: "NftUsernameCallBack"; _recipient: init; _amount: zero;
            username: username;
            addr: addr } in one_msg m; send msg end
        
        procedure NftDidCallBack(
          username: String,
          dID: ByStr20
          )
          msg = let m = { _tag: "NftDidCallBack"; _recipient: init; _amount: zero;
            username: username;
            dID: dID } in one_msg m; send msg end
         
        procedure PremiumNftUsername_( premium: String )
          current_controller <- controller;
          get_addr <-& init.dns[premium]; match get_addr with
            | Some addr => e = { _exception : "initi.tyron-UsernameHasOwner" }; throw e
            | None =>
              NftUsernameCallBack premium current_controller;
              NftDidCallBack premium _this_address end end
        
        transition PremiumNftUsername(
          premium: List String,
          tyron: Uint128
          )
          IsOperational; IsNotPaused; tyron_ = Some{ Uint128 } tyron; VerifyController tyron_;
          forall premium PremiumNftUsername_;
          Timestamp end
        
        transition BuyNftUsername(
          id: String,
          username: String,
          addr: ByStr20,
          dID: ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          IsOperational; ThrowIfNotProxy; IsNotPaused; IsNotNull addr; VerifyMinChar username;
          get_addr <-& init.dns[username]; match get_addr with
            | Some addr_ => e = { _exception : "initi.tyron-UsernameHasOwner" }; throw e
            | None =>
              list_part = @list_mem ByStr20; list <- free_list;
              is_participant = list_part compare_participant _origin list;
              match is_participant with
              | True =>
                list_filter = @list_filter ByStr20; remove_participant = fun( participant: ByStr20 )
                  => let is_addr = builtin eq _origin participant in negb is_addr;
                list_updated = list_filter remove_participant list;
                free_list := list_updated
              | False =>
                txID = "BuyNftUsername";
                get_fee <- utility[id][txID]; match get_fee with
                | None => e = { _exception : "initi.tyron-FeeIsNull" }; throw e
                | Some fee =>
                  get_token_addr <- services[id]; token_addr = option_bystr20_value get_token_addr;
                  msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero;
                    from: dID;
                    to: _this_address;
                    amount: fee } in one_msg m; send msg end end end;
          NftUsernameCallBack username addr; NftDidCallBack username dID;
          Timestamp end
        
        transition UpdateNftDid(
          id: String,
          username: String,
          dID: ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          IsOperational; ThrowIfNotProxy; IsNotPaused;
          get_did <-& init.did_dns[username]; match get_did with
          | Some did_ =>
            current_controller <-& did_.controller;
            verified = builtin eq _origin current_controller; match verified with
              | True => | False => e = { _exception : "initi.tyron-WrongCaller" }; throw e end;
            list_part = @list_mem ByStr20; list <- free_list;
            is_participant = list_part compare_participant _origin list;
            match is_participant with
            | True =>
              list_filter = @list_filter ByStr20; remove_participant = fun( participant: ByStr20 )
                => let is_addr = builtin eq _origin participant in negb is_addr;
              list_updated = list_filter remove_participant list;
              free_list := list_updated
            | False =>
              txID = "UpdateNftDid";
              get_fee <- utility[id][txID]; match get_fee with
              | None => e = { _exception : "initi.tyron-FeeIsNull" }; throw e
              | Some fee =>
                  get_token_addr <- services[id]; token_addr = option_bystr20_value get_token_addr;
                  msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero;
                    from: did_;
                    to: _this_address;
                    amount: fee } in one_msg m; send msg end end;
            NftDidCallBack username dID
          | None => e = { _exception : "initi.tyron-DidIsNull" }; throw e end;
          Timestamp end
        
        transition TransferNftUsername(
          id: String,
          username: String,
          addr: ByStr20,
          dID: ByStr20 with contract
            field did: String,
            field nft_username: String,
            field controller: ByStr20,
            field version: String,
            field verification_methods: Map String ByStr33,
            field services: Map String ByStr20,
            field social_guardians: Map ByStr32 Bool,
            field did_domain_dns: Map String ByStr20,
            field deadline: Uint128 end
          )
          IsOperational; ThrowIfNotProxy; IsNotPaused; IsNotNull addr;
          get_did <-& init.did_dns[username]; match get_did with
          | Some did_ =>
            current_controller <-& did_.controller;
            verified = builtin eq _origin current_controller; match verified with
              | True => | False => e = { _exception : "initi.tyron-WrongCaller" }; throw e end;
            list_part = @list_mem ByStr20; list <- free_list;
            is_participant = list_part compare_participant _origin list;
            match is_participant with
            | True =>
              list_filter = @list_filter ByStr20;
              remove_participant = fun( participant: ByStr20 ) => let is_addr = builtin eq _origin participant in negb is_addr;
              list_updated = list_filter remove_participant list;
              free_list := list_updated
            | False =>
              txID = "TransferNftUsername";
              get_fee <- utility[id][txID]; match get_fee with
              | None => e = { _exception : "initi.tyron-FeeIsNull" }; throw e
              | Some fee =>
                get_token_addr <- services[id]; token_addr = option_bystr20_value get_token_addr;
                msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero;
                  from: did_;
                  to: _this_address;
                  amount: fee } in one_msg m; send msg end end;
            NftUsernameCallBack username addr; NftDidCallBack username dID
          | None =>
            IsBeta;
            get_addr <-& init.dns[username]; addr_ = option_bystr20_value get_addr;
            is_owner = builtin eq addr addr_; match is_owner with
              | False => e = { _exception : "initi.tyron-WrongCaller/Alpha" }; throw e
              | True => NftUsernameCallBack username dID; NftDidCallBack username dID end end;
          Timestamp end
      `
        ;

      let verification_methods: any = [];
      if (arConnect !== null) {
        const key_input = [
          {
            id: tyron.VerificationMethods.PublicKeyPurpose.Update,
          },
          {
            id: tyron.VerificationMethods.PublicKeyPurpose.SocialRecovery,
          },
          {
            id: tyron.VerificationMethods.PublicKeyPurpose.General,
          },
          {
            id: tyron.VerificationMethods.PublicKeyPurpose.Auth,
          },
          {
            id: tyron.VerificationMethods.PublicKeyPurpose.Assertion,
          },
          {
            id: tyron.VerificationMethods.PublicKeyPurpose.Agreement,
          },
          {
            id: tyron.VerificationMethods.PublicKeyPurpose.Invocation,
          },
          {
            id: tyron.VerificationMethods.PublicKeyPurpose.Delegation,
          },
        ];
        for (const input of key_input) {
          // Creates the cryptographic DID key pair
          const doc = await operationKeyPair({
            arConnect: arConnect,
            id: input.id,
            addr: address,
          });
          verification_methods.push(doc.element.key);
        }
      }

      const did_methods: Array<{ key: string; val: string }> = [];
      const did_dkms: Array<{ key: string; val: string }> = [];

      for (let i = 0; i < verification_methods.length; i += 1) {
        did_methods.push({
          key: verification_methods[i].id,
          val: verification_methods[i].key,
        });
        did_dkms.push({
          key: verification_methods[i].id,
          val: verification_methods[i].encrypted,
        });
      }

      // @todo
      const init_username = "tyronmapu";
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
          vname: 'init',
          type: 'ByStr20',
          value: `${proxy}`,
        },
        {
          vname: "did_methods",
          type: "Map String ByStr33",
          value: did_methods,
        },
        {
          vname: "did_dkms",
          type: "Map String String",
          value: did_dkms,
        },
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "45000",
        gasPrice: "2000000000",
      });
      toast.info('You successfully deployed a new Init implementation.', {
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
