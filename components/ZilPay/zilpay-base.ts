import * as tyron from "tyron";
import { ZIlPayInject } from "../../src/types/zil-pay";
import * as zutil from "@zilliqa-js/util";
import { toast } from "react-toastify";
import { operationKeyPair } from "../../src/lib/dkms";
import { HashString } from "../../src/lib/util";
import * as zcrypto from "@zilliqa-js/crypto";

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
      //@xalkan
      const code =
        `
        (* v6.5
          DIDxWALLET: W3C Decentralized Identifier Smart Contract Wallet
          Self-Sovereign Identity Protocol
          Copyright Tyron Mapu Community Interest Company 2023. All rights reserved.
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
          
          library DIDxWALLET
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
            
            let did = "did"
            let update = "update"
            let recovery = "socialrecovery"
            let actionAdd = "add"
            let actionRemove = "remove"
            let free = "free"
            let zil = "zil"
            let empty_string = ""
            let empty_methods = Emp String ByStr33
            let empty_map = Emp String String
            let empty_services = Emp String ByStr20
            let empty_services_ = Emp String Endpoint
            let empty_domains = Emp String ByStr20
            let empty_guardians = Emp ByStr32 Bool
          
            let one_msg =
              fun( msg: Message ) =>
              let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
            
            let zero = Uint128 0
            let zeroByStr20 = 0x0000000000000000000000000000000000000000
            let zeroByStr32 = 0x0000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr33 = 0x000000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr = builtin to_bystr zeroByStr20
            let zero_ = Uint32 0
            let one = Uint32 1
            let two = Uint32 2
            let three = Uint32 3
          
            let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
              match input with
              | Some v => v
              | None => default end
            let option_uint128_value = let f = @option_value Uint128 in f zero
            let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
            let option_bystr33_value = let f = @option_value ByStr33 in f zeroByStr33
            let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64
          
            type Beneficiary =
              | NftUsername of String String (* Domain Name & Subdomain *)
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
              with
              (* init_controller must not be the zero address *)
              let is_controller_invalid = builtin eq init_controller zeroByStr20 in
              negb is_controller_invalid
            =>
            field did: String = let did_prefix = "did:tyron:zil:main:" in let did_suffix = builtin to_string _this_address in
              builtin concat did_prefix did_suffix   (* the tyronZIL W3C Decentralized Identifier *)
            field controller: ByStr20 = init_controller
            field pending_controller: ByStr20 = zeroByStr20
            field did_status: DidStatus = Created
            field version: String = "DIDxWALLET_6.5.0" (* @xalkan *)
            
            (* Verification methods @key: key purpose @value: public DID key *)
            field verification_methods: Map String ByStr33 = did_methods
            field dkms: Map String String = did_dkms
            
            (* Services @key: ID @value: endpoint *)
            field services: Map String ByStr20 = empty_services
            field services_: Map String Endpoint = empty_services_
            
            field did_hash: ByStr = zeroByStr
            
            (* The block number when the last transaction occurred @todo add to all txn *)
            field ledger_time: BNum = BNum 0
            
            (* A monotonically increasing number representing the amount of transactions that have taken place *)
            field tx_number: Uint128 = zero
            
            field social_guardians: Map ByStr32 Bool = empty_guardians
            (* The amount of guardians *)
            field gcounter: Uint32 = zero_
            field signed_addr: ByStr = zeroByStr
            
            field did_domain_dns: Map String ByStr20 = let emp = Emp String ByStr20 in
              builtin put emp did _this_address
            field nft_dns: Map String String = Emp String String
            field nft_username: String = empty_string
            field deadline: Uint128 = zero
            field batch_beneficiary: ByStr20 = zeroByStr20
          
          procedure SupportTyron( tyron: Option Uint128 )
            match tyron with
            | None => | Some donation =>
              current_init <-& init.dApp;
              donateDomain = "donate"; get_addr <-& current_init.dns[donateDomain]; addr = option_bystr20_value get_addr;
              accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donation } in one_msg m; send msg end end
          
          procedure IsOperational()
            current_status <- did_status; match current_status with
              | Deactivated => e = { _exception: "DIDxWALLET-WrongStatus" }; throw e
              | Locked => e = { _exception: "DIDxWALLET-DidLocked" }; throw e
              | _ => end end
          
          procedure VerifyController( tyron: Option Uint128 )
            current_controller <- controller;
            verified = builtin eq _origin current_controller; match verified with
              | True => SupportTyron tyron
              | False => e = { _exception: "DIDxWALLET-WrongCaller" }; throw e end end
          
          procedure Timestamp()
            current_block <- &BLOCKNUMBER; ledger_time := current_block;
            latest_tx_number <- tx_number; new_tx_number = let incrementor = Uint128 1 in builtin add latest_tx_number incrementor;
            tx_number := new_tx_number end
          
          procedure ThrowIfNullAddr( addr: ByStr20 )
            is_null = builtin eq addr zeroByStr20; match is_null with
              | False => | True => e = { _exception: "DIDxWALLET-NullAddress" }; throw e end end
          
          procedure ThrowIfNullString( input: String )
            is_null = builtin eq input empty_string; match is_null with
              | False => | True => e = { _exception: "DIDxWALLET-NullString" }; throw e end end
          
          procedure ThrowIfNullHash( input: ByStr32 )
            is_null = builtin eq input zeroByStr32; match is_null with
              | False => | True => e = { _exception: "DIDxWALLET-NullHash" }; throw e end end
          
          procedure ThrowIfSameAddr(
            a: ByStr20,
            b: ByStr20
            )
            ThrowIfNullAddr a;
            is_self = builtin eq a b; match is_self with
              | False => | True => e = { _exception: "DIDxWALLET-SameAddress" }; throw e end end
          
          procedure ThrowIfSameDomain(
            a: String,
            b: String
            )
            is_same = builtin eq a b; match is_same with
              | False => | True => e = { _exception: "DIDxWALLET-SameUsername" }; throw e end end
          
          transition UpdateController(
            addr: ByStr20,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            current_controller <- controller; ThrowIfSameAddr addr current_controller;
            pending_controller := addr;
            Timestamp end
          
          transition AcceptPendingController()
            IsOperational; current_pending <- pending_controller;
            verified = builtin eq _origin current_pending; match verified with
              | True => | False => e = { _exception: "DIDxWALLET-WrongCaller" }; throw e end;
            controller := current_pending; pending_controller := zeroByStr20;
            Timestamp end
          
          (* Verify Schnorr signature - signed data must correspond with a DID key *)
          procedure VerifySignature(
            id: String,
            signedData: ByStr,
            signature: ByStr64
            )
            get_did_key <- verification_methods[id]; did_key = option_bystr33_value get_did_key;
            is_right_signature = builtin schnorr_verify did_key signedData signature; match is_right_signature with
              | True => | False => e = { _exception: "DIDxWALLET-WrongSignature" }; throw e end end
          
          procedure SaveGuardians( id: ByStr32 )
            repeated <- exists social_guardians[id]; match repeated with
              | True => e = { _exception: "DIDxWALLET-SameGuardianId" }; throw e
              | False =>
                current_init <-& init.dApp; domain = builtin to_string id;
                get_did <-& current_init.did_dns[domain]; match get_did with
                  | Some did_ => | None => e = { _exception: "DIDxWALLET-DidIsNull" }; throw e end;
                counter <- gcounter; add_ = builtin add counter one; gcounter := add_;
                true = True; social_guardians[id] := true end end
          
          transition AddGuardians(
            guardians: List ByStr32,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; current_counter <- gcounter;
            is_set = uint32_ge current_counter three; match is_set with
              | True => (* enable individual addition *)
              | False => 
                length = let list_length = @list_length ByStr32 in list_length guardians;
                is_ok = uint32_ge length three; match is_ok with
                  | True => | False => e = { _exception: "DIDxWALLET-InsufficientAmount" }; throw e end end;
            forall guardians SaveGuardians; counter <- gcounter;
            is_ok = uint32_ge counter three; match is_ok with
              | True => | False => e = { _exception: "DIDxWALLET-InsufficientAmountOfGuardians" }; throw e end;
            Timestamp end
          
          procedure RemoveGuardian( id: ByStr32 )
            is_guardian <- exists social_guardians[id]; match is_guardian with
              | True =>
                  counter <- gcounter; sub_ = builtin sub counter one; gcounter := sub_;
                  delete social_guardians[id]
              | False => e = { _exception: "DIDxWALLET-RemoveNoGuardian" }; throw e end end
          
          transition RemoveGuardians(
            guardians: List ByStr32,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            forall guardians RemoveGuardian;
            counter <- gcounter;
            is_ok = uint32_ge counter three; match is_ok with
              | True => | False => e = { _exception: "DIDxWALLET-InsufficientAmountOfGuardians" }; throw e end;
            Timestamp end
          
          transition Lock(
            sig: ByStr64,
            tyron: Option Uint128
            )
            IsOperational; counter <- gcounter;
            is_ok = uint32_ge counter three; match is_ok with
              | True => | False => e = { _exception: "DIDxWALLET-InsufficientAmountOfGuardians" }; throw e end;
            this_did <- did; hash = let h = builtin sha256hash this_did in builtin to_bystr h;
            get_didkey <- verification_methods[recovery]; did_key = option_bystr33_value get_didkey;
            is_right_signature = builtin schnorr_verify did_key hash sig; match is_right_signature with
              | False => e = { _exception: "DIDxWALLET-WrongSignature" }; throw e
              | True => SupportTyron tyron; locked = Locked; did_status := locked end;
            Timestamp end
          
          procedure VerifySocialRecovery( proof: Pair ByStr32 ByStr64 )
            guardian_id = let fst_element = @fst ByStr32 ByStr64 in fst_element proof;
            guardian_sig = let snd_element = @snd ByStr32 ByStr64 in snd_element proof;
            is_valid <- exists social_guardians[guardian_id]; match is_valid with
              | False => e = { _exception: "DIDxWALLET-WrongCaller" }; throw e
              | True =>
                current_init <-& init.dApp; domain = builtin to_string guardian_id;
                get_did <-& current_init.did_dns[domain]; match get_did with
                  | None => e = { _exception: "DIDxWALLET-DidIsNull" }; throw e
                  | Some did_ =>
                    get_did_key <-& did_.verification_methods[recovery]; did_key = option_bystr33_value get_did_key; signed_data <- signed_addr;
                    is_right_signature = builtin schnorr_verify did_key signed_data guardian_sig; match is_right_signature with
                      | False => | True => counter <- gcounter; add_ = builtin add counter one; gcounter := add_ end end end end
          
          (* To reset the Zilliqa or/and Arweave external wallets *)
          transition DidSocialRecovery( 
            addr: ByStr20,
            signatures: List( Pair ByStr32 ByStr64 ),
            tyron: Option Uint128
            )
            ThrowIfNullAddr addr;
            current_status <- did_status; match current_status with
              | Deactivated => e = { _exception: "DIDxWALLET-WrongStatus" }; throw e | _ => end;
            signed_data = builtin to_bystr addr; signed_addr := signed_data;
            sig = let list_length = @list_length( Pair ByStr32 ByStr64 ) in list_length signatures;
            counter <- gcounter; is_three = builtin eq counter three;
            min = match is_three with
              | True => three
              | False => let div_ = builtin div counter two in builtin add div_ one end;
            is_ok = uint32_ge sig min; match is_ok with
              | False => e = { _exception: "DIDxWALLET-InsufficientAmountOfSignatures" }; throw e
              | True =>
                gcounter := zero_; forall signatures VerifySocialRecovery;
                sig_counter <- gcounter; is_ok_ = uint32_ge sig_counter min; match is_ok_ with
                  | False => e = { _exception: "DIDxWALLET-InsufficientAmountOfCorrectSignatures" }; throw e
                  | True => SupportTyron tyron; controller := addr; gcounter := counter end end;
            new_status = Recovered; did_status := new_status;
            Timestamp end
          
          procedure ThrowIfNoKey( optKey: Option ByStr33 )
            match optKey with
            | Some key => | None => e = { _exception: "DIDxWALLET-UndefinedKey" }; throw e end end
          
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
                | False => e = { _exception: "DIDxWALLET-RemoveNoKey" }; throw e end end
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
                | False => e = { _exception: "DIDxWALLET-RemoveNoService" }; throw e end end end end
          
          procedure VerifyDocument(
            document: List Document,
            signature: Option ByStr64,
            tyron: Option Uint128
            )
            SupportTyron tyron; current_controller <- controller;
            verified = builtin eq _origin current_controller; match verified with
              | True => forall document UpdateDocument
              | False =>
                  get_update_key <- verification_methods[update]; update_key = option_bystr33_value get_update_key;
                  forall document HashDocument; doc_hash <- did_hash;
                  sig = option_bystr64_value signature; VerifySignature update doc_hash sig; did_hash := zeroByStr;
                  forall document UpdateDocument;
                  get_new_update_key <- verification_methods[update]; new_update = option_bystr33_value get_new_update_key;
                  is_same_key = builtin eq update_key new_update; match is_same_key with
                  | False => | True => e = { _exception: "DIDxWALLET-SameUpdateKey" }; throw e end end end
          
          transition DidUpdate(
            document: List Document,
            signature: Option ByStr64,
            tyron: Option Uint128
            )
            current_status <- did_status; match current_status with
              | Created => VerifyDocument document signature tyron
              | Updated => VerifyDocument document signature tyron
              | Recovered => VerifyController tyron; forall document UpdateDocument
              | _ => e = { _exception: "DIDxWALLET-WrongStatus" }; throw e end;
            new_status = Updated; did_status := new_status;
            Timestamp end
          
          transition DidDeactivate(
            document: List Document,
            signature: Option ByStr64,
            tyron: Option Uint128
            ) 
            IsOperational; VerifyDocument document signature tyron;
            did := empty_string; controller := zeroByStr20; social_guardians := empty_guardians;
            verification_methods := empty_methods; dkms := empty_map;
            services := empty_services; services_ := empty_services_;
            did_domain_dns := empty_domains; nft_dns := empty_map;
            new_status = Deactivated; did_status := new_status;
            Timestamp end
          
          transition Dns(
            addr: ByStr20,
            domain: String,
            didKey: ByStr33,
            encrypted: String,
            nftID: String,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; ThrowIfSameAddr addr _this_address;
            verification_methods[domain] := didKey; dkms[domain] := encrypted; did_domain_dns[domain] := addr; 
            nft_dns[domain] := nftID;
            new_status = Updated; did_status := new_status;
            Timestamp end
          
          transition UpdateNftDns(
            domain: String,
            nftID: String,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            nft_dns[domain] := nftID;
            new_status = Updated; did_status := new_status;
            Timestamp end
          
          (* xWALLET backbone 476-927 *)
          
          (* -> Fungible tokens backbone 476-626 <- *)
          
          procedure FetchServiceAddr( id: String )
            current_init <-& init.dApp;
            initId = "init"; get_did <-& current_init.did_dns[initId]; match get_did with
              | None => e = { _exception: "DIDxWALLET-NullInit" }; throw e
              | Some did_ =>
                get_service <-& did_.services[id]; addr = option_bystr20_value get_service;
                services[id] := addr end end
          
          procedure IncreaseAllowance(
            coinAddr: ByStr20,
            spender: ByStr20,
            amount: Uint128
            )
            ThrowIfNullAddr coinAddr;
            msg = let m = { _tag: "IncreaseAllowance"; _recipient: coinAddr; _amount: zero;
              spender: spender;
              amount: amount } in one_msg m ; send msg end
          
          procedure DecreaseAllowance(
            coinAddr: ByStr20,
            spender: ByStr20,
            amount: Uint128
            )
            ThrowIfNullAddr coinAddr;
            msg = let m = { _tag: "DecreaseAllowance"; _recipient: coinAddr; _amount: zero;
              spender: spender;
              amount: amount } in one_msg m ; send msg end
          
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
                  get_addr <-& current_init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr addr _this_address;
                  msg = let m = { _tag: tag; _recipient: addr; _amount: amount } in one_msg m; send msg
                | False =>
                  get_did <-& current_init.did_dns[username_]; match get_did with
                    | None => e = { _exception: "DIDxWALLET-DidIsNull" }; throw e
                    | Some did_ =>
                      is_did = builtin eq domain_ did; match is_did with
                        | True => msg = let m = { _tag: tag; _recipient: did_; _amount: amount } in one_msg m; send msg
                        | False =>
                          get_domain_addr <-& did_.did_domain_dns[domain_]; domain_addr = option_bystr20_value get_domain_addr;
                          msg = let m = { _tag: tag; _recipient: domain_addr; _amount: amount } in one_msg m; send msg end end end
            | Recipient addr_ =>
              ThrowIfSameAddr addr_ _this_address;
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
                  get_addr <-& current_init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr addr _this_address;
                  msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                    to: addr;
                    amount: amount } in one_msg m ; send msg
                | False =>
                  get_did <-& current_init.did_dns[username_]; match get_did with
                    | None => e = { _exception: "DIDxWALLET-DidIsNull" }; throw e
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
              ThrowIfSameAddr addr_ _this_address;
              msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                to: addr_;
                amount: amount } in one_msg m ; send msg end;
            Timestamp end
          
          transition RecipientAcceptTransfer(
            sender: ByStr20,
            recipient: ByStr20,
            amount: Uint128
            ) 
            IsOperational;
            is_valid = builtin eq recipient _this_address; match is_valid with
              | True => | False => e = { _exception: "DIDxWALLET-WrongRecipientForAcceptTransfer" }; throw e end end 
          
          transition RecipientAcceptTransferFrom(
            initiator: ByStr20,
            sender: ByStr20,
            recipient: ByStr20,
            amount: Uint128
            )
            IsOperational;
            is_valid = builtin eq recipient _this_address; match is_valid with
              | True => | False => e = { _exception: "DIDxWALLET-WrongRecipientForAcceptTransferFrom" }; throw e end end
          
          transition TransferSuccessCallBack( sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational end
          
          transition TransferFromSuccessCallBack(
            initiator: ByStr20,
            sender: ByStr20,
            recipient: ByStr20,
            amount: Uint128
            )
            IsOperational;
            is_valid = builtin eq initiator _this_address; match is_valid with
              | True => | False => e = { _exception: "DIDxWALLET-WrongInitiator" }; throw e end end 
          
          procedure ZRC2_TransferTokens( input: Pair String Uint128 )
            addr_name = let fst_element = @fst String Uint128 in fst_element input;
            amount = let snd_element = @snd String Uint128 in snd_element input;
            current_beneficiary <- batch_beneficiary; FetchServiceAddr addr_name;
            is_zil = builtin eq addr_name zil; match is_zil with
              | True => accept; msg = let m = { _tag: "AddFunds"; _recipient: current_beneficiary; _amount: amount } in one_msg m; send msg
              | False =>
                get_token_addr <- services[addr_name]; token_addr = option_bystr20_value get_token_addr;
                msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
                  to: current_beneficiary;
                  amount: amount } in one_msg m ; send msg end end
          
          transition ZRC2_BatchTransfer(
            addr: ByStr20,
            tokens: List( Pair String Uint128 ),
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            ThrowIfSameAddr addr _this_address;
            batch_beneficiary := addr; forall tokens ZRC2_TransferTokens; batch_beneficiary := zeroByStr20;
            Timestamp end
          
          (* -> Non-fungible tokens backbone 632-927 <- *)
          
          (* -->> SSI DNS backbone 632-781 <<-- *)
          
          transition BuyNftUsername(
            id: String,
            username: String,
            addr: Option ByStr20,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; ThrowIfNullString id; ThrowIfNullString username;
            txID = "BuyNftUsername";
            current_init <-& init.dApp; init_did <-& current_init.implementation;
            get_fee <-& init_did.utility[id][txID]; fee = option_uint128_value get_fee;
            is_zil = builtin eq id zil; match is_zil with
              | True => accept
              | False =>
                  is_free = builtin eq id free; match is_free with
                    | True => | False =>
                        FetchServiceAddr id; get_addr <- services[id]; coin_addr = option_bystr20_value get_addr;
                        IncreaseAllowance coin_addr init_did fee end end;
            zil_amount = match is_zil with
              | True => fee
              | False => zero end;
            address = match addr with
              | Some addr_ => addr_
              | None => _this_address end;
            msg = let m = { _tag: txID; _recipient: current_init; _amount: zil_amount;
              id: id;
              username: username;
              addr: address;
              dID: _this_address } in one_msg m; send msg;
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
            IsOperational; VerifyController tyron; ThrowIfNullString id; ThrowIfNullString username;
            txID = "TransferNftUsername";
            current_init <-& init.dApp; init_did <-& current_init.implementation;
            get_fee <-& init_did.utility[id][txID]; fee = option_uint128_value get_fee;
            is_zil = builtin eq id zil; match is_zil with
              | True => accept
              | False =>
                  is_free = builtin eq id free; match is_free with
                    | True => | False =>
                        FetchServiceAddr id; get_addr <- services[id]; coin_addr = option_bystr20_value get_addr;
                        IncreaseAllowance coin_addr init_did fee end end;
            zil_amount = match is_zil with
              | True => fee
              | False => zero end;
            msg = let m = { _tag: txID; _recipient: current_init; _amount: zil_amount;
              id: id;
              username: username;
              addr: addr;
              dID: dID } in one_msg m; send msg;
            Timestamp end
          
          transition MintTydraNft(
            id: String,
            token_id: ByStr32,
            token_uri: String,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            ThrowIfNullString id; ThrowIfNullHash token_id; ThrowIfNullString token_uri;
            txID = "MintTydraNft";
            current_init <-& init.dApp; init_did <-& current_init.implementation;
            get_fee <-& init_did.utility[id][txID]; fee = option_uint128_value get_fee;
            is_zil = builtin eq id zil; match is_zil with
              | True => accept
              | False =>
                is_free = builtin eq id free; match is_free with
                  | True => | False =>
                    FetchServiceAddr id; get_addr <- services[id]; coin_addr = option_bystr20_value get_addr;
                    IncreaseAllowance coin_addr init_did fee end end;
            zil_amount = match is_zil with
              | True => fee
              | False => zero end;
            msg = let m = { _tag: txID; _recipient: init_did; _amount: zil_amount;
              id: id;
              token_id: token_id;
              token_uri: token_uri } in one_msg m; send msg;
            Timestamp end
            
          transition TransferTydraNft(
            id: String,
            tydra: String,
            token_id: ByStr32,
            to_token_id: ByStr32,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            ThrowIfNullString id; ThrowIfNullString tydra; ThrowIfNullHash token_id; ThrowIfNullHash to_token_id;
            txID = "TransferTydraNft";
            current_init <-& init.dApp; init_did <-& current_init.implementation;
            get_fee <-& init_did.utility[id][txID]; fee = option_uint128_value get_fee;
            is_zil = builtin eq id zil; match is_zil with
              | True => accept
              | False =>
                  is_free = builtin eq id free; match is_free with
                    | True => | False =>
                      FetchServiceAddr id; get_addr <- services[id]; coin_addr = option_bystr20_value get_addr;
                      IncreaseAllowance coin_addr init_did fee end end;
            zil_amount = match is_zil with
              | True => fee
              | False => zero end;
            msg = let m = { _tag: txID; _recipient: init_did; _amount: zil_amount;
              id: id;
              tydra: tydra;
              token_id: token_id;
              to_token_id: to_token_id } in one_msg m; send msg;
            Timestamp end
          
          transition UpdateTokenURI(
            addrName: String,
            token_id: Uint256,
            token_uri: String,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            FetchServiceAddr addrName; get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "UpdateTokenURI"; _recipient: token_addr; _amount: zero;
              token_id: token_id;
              token_uri: token_uri } in one_msg m ; send msg;
            Timestamp end
          
          transition UpdateDomainAddress(
            addrName: String,
            token_id: Uint256,
            new_addr: ByStr20,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            FetchServiceAddr addrName; get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "UpdateDomainAddress"; _recipient: token_addr; _amount: zero;
              token_id: token_id;
              new_addr: new_addr } in one_msg m ; send msg;
            Timestamp end
            
          transition SSIDNS_UpdateDomainCallback(
            token_owner: ByStr20,
            token_id: Uint256
            )
            IsOperational;
            is_valid = builtin eq token_owner _this_address; match is_valid with
              | True => | False => e = { _exception: "DIDxWALLET_UpdateDomainCallback-NotOwner" }; throw e end end
          
          (* -->> ZRC6 backbone 785-927 <<-- *)
          
          transition ZRC6_Mint(
            addrName: String,
            to: ByStr20,
            token_uri: String,
            domain_id: ByStr32,
            amount: Uint128,
            id: String,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron; ThrowIfNullAddr to;
            FetchServiceAddr addrName; get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr; ThrowIfNullAddr token_addr;
            is_null = builtin eq empty_string id; match is_null with
              | True =>
                accept; msg = let m = { _tag: "Mint"; _recipient: token_addr; _amount: amount;
                  to: to;
                  token_uri: token_uri } in one_msg m ; send msg
              | False =>
                txID = "BuyNftUsername";
                current_init <-& init.dApp; current_impl <-& current_init.implementation;
                get_fee <-& current_impl.utility[id][txID]; fee = option_uint128_value get_fee;
                is_zil = builtin eq id zil; match is_zil with
                  | True => accept
                  | False =>
                      is_free = builtin eq id free; match is_free with
                        | True => | False =>
                            FetchServiceAddr id; get_addr <- services[id]; coin_addr = option_bystr20_value get_addr;
                            IncreaseAllowance coin_addr token_addr fee end end;
                zil_amount = match is_zil with
                  | True => fee
                  | False => zero end;
                msg = let m = { _tag: "MintTyron"; _recipient: token_addr; _amount: zil_amount;
                  to: to;
                  token_uri: domain_id;
                  id: id } in one_msg m ; send msg end;
            Timestamp end
          
          transition ZRC6_MintCallback(to: ByStr20, token_id: Uint256, token_uri: String) IsOperational end (* We could verify that from is _this_address but there is no 'from' variable in this callback *)
          
          transition ZRC6_RecipientAcceptMint() IsOperational end
          
          transition ZRC6_BatchMint(
            addrName: String,
            to_token_uri_pair_list: List( Pair ByStr20 String ),
            amount: Uint128,
            id: String,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            FetchServiceAddr addrName; get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            is_null = builtin eq empty_string id; match is_null with
              | True =>
                accept; msg = let m = { _tag: "BatchMint"; _recipient: token_addr; _amount: amount;
                  to_token_uri_pair_list: to_token_uri_pair_list } in one_msg m ; send msg
              | False =>
                txID = "BuyNftUsername";
                current_init <-& init.dApp; current_impl <-& current_init.implementation;
                get_fee <-& current_impl.utility[id][txID]; fee_ = option_uint128_value get_fee;
                counter = let list_length = @list_length (Pair ByStr20 String) in list_length to_token_uri_pair_list;
                get_counter = builtin to_uint128 counter; counter_ = match get_counter with
                  | Some c => c
                  | None => zero end; (* should never happen *)
                fee = builtin mul fee_ counter_;
                is_zil = builtin eq id zil; match is_zil with
                  | True => accept
                  | False =>
                      is_free = builtin eq id free; match is_free with
                        | True => | False =>
                            FetchServiceAddr id; get_addr <- services[id]; coin_addr = option_bystr20_value get_addr;
                            IncreaseAllowance coin_addr token_addr fee end end;
                zil_amount = match is_zil with
                  | True => fee
                  | False => zero end;
                msg = let m = { _tag: "BatchMintTyron"; _recipient: token_addr; _amount: zil_amount;
                  to_token_uri_pair_list: to_token_uri_pair_list;
                  id: id } in one_msg m ; send msg end;
            Timestamp end
          
          transition ZRC6_BatchMintCallback() IsOperational end
          
          transition ZRC6_TransferFrom(
            addrName: String,
            to: ByStr20,
            token_id: Uint256,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            ThrowIfSameAddr to _this_address;
            FetchServiceAddr addrName; get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero;
              to: to;
              token_id: token_id } in one_msg m ; send msg; Timestamp end
          
          transition ZRC6_TransferFromCallback(
            from: ByStr20,
            to: ByStr20,
            token_id: Uint256
            )
            IsOperational;
            is_valid = builtin eq from _this_address; match is_valid with
              | True => | False => e = { _exception: "DIDxWALLET-WrongSender" }; throw e end end
          
          transition ZRC6_RecipientAcceptTransferFrom( from: ByStr20, to: ByStr20, token_id: Uint256 ) IsOperational end
          
          transition ZRC6_BatchTransferFrom(
            addrName: String,
            to_token_id_pair_list: List (Pair ByStr20 Uint256),
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            FetchServiceAddr addrName; get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "BatchTransferFrom"; _recipient: token_addr; _amount: zero;
              to_token_id_pair_list: to_token_id_pair_list } in one_msg m ; send msg; Timestamp end
          
          transition ZRC6_BatchTransferFromCallback() IsOperational end
          
          transition ZRC6_SetSpender(
            addrName: String,
            spender: ByStr20,
            token_id: Uint256,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            FetchServiceAddr addrName; get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "SetSpender"; _recipient: token_addr; _amount: zero;
              spender: spender;
              token_id: token_id } in one_msg m ; send msg;
            Timestamp end
          
          transition ZRC6_SetSpenderCallback( spender: ByStr20, token_id: Uint256 ) IsOperational end
          
          transition ZRC6_Burn(
            addrName: String,
            token_id: Uint256,
            tyron: Option Uint128
            )
            IsOperational; VerifyController tyron;
            FetchServiceAddr addrName; get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "Burn"; _recipient: token_addr; _amount: zero;
              token_id: token_id } in one_msg m ; send msg;
            Timestamp end
          
          transition ZRC6_BurnCallback( token_owner: ByStr20, token_id: Uint256 ) IsOperational end
        `;
      const did_methods: Array<{ key: string; val: string }> = [];
      did_methods.push({
        key: `${"update"}`,
        val: `${"0x000000000000000000000000000000000000000000000000000000000000000000"}`,
      });
      const did_dkms: Array<{ key: string; val: string }> = [];
      did_dkms.push({
        key: `${"null"}`,
        val: `${"null"}`,
      });
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
        gasLimit: "50000",
        gasPrice: "2000000000",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployAirdropWallet(net: string) {
    try {
      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      //mainnet addresses
      let init_tyron = "0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9";

      if (net === "testnet") {
        init_tyron = "0xec194d20eab90cfab70ead073d742830d3d2a91b";
      }
      //@xalkan
      const code =
        `
        (* v0.2.1
          AIRxWALLET: TYRON Airdrop DID Social-Recovery Wallet
          Self-Sovereign Identity Protocol
          Copyright Tyron Mapu Community Interest Company 2023. All rights reserved.
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
          import BoolUtils ListUtils
          
          library AIRxWALLET
            let empty_services = Emp String ByStr20
            let true = True
            let false = False
            let null = ""
          
            let one_msg =
              fun( msg: Message ) =>
              let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
          
            let zero = Uint128 0
            let zeroByStr20 = 0x0000000000000000000000000000000000000000
          
            let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
              match input with
              | Some v => v
              | None => default end
            let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
            let compare_participant = fun( addr: ByStr20 ) => fun( participant: ByStr20 ) => builtin eq addr participant
          
          contract AIRxWALLET(
            init_username: String,
            init: ByStr20 with contract field dApp: ByStr20 with contract
              field dns: Map String ByStr20,
              field did_dns: Map String ByStr20 with contract
                field controller: ByStr20,
                field services: Map String ByStr20 end end end,
            token_name: String,
            airdrop_amount: Uint128,
            init_list: List ByStr20
            )
            field nft_username: String = init_username
            field pending_username: String = ""
            field is_paused: Bool = false
            field airdrop_list: List ByStr20 = init_list
            
            field services: Map String ByStr20 = empty_services
            (* The block number when the last DID CRUD operation occurred *)
            field ledger_time: BNum = BNum 0
            (* A monotonically increasing number representing the amount of DID CRUD transactions that have taken place *)
            field tx_number: Uint128 = zero
            field version: String = "AIRxWALLET_0.2.1" (* @xalkan *)
          
          procedure RequireNotPaused()
            (* Reference: *)
            (* https://consensys.github.io/smart-contract-best-practices/general_philosophy/#prepare-for-failure *)
            paused <- is_paused; match paused with
            | False =>
            | True => (* Contract is paused *)
              e = { _exception: "AIRxWALLET_PausedError" }; throw e
            end
          end
          
          procedure VerifyController()
            current_username <- nft_username; current_init <-& init.dApp;
            get_did <-& current_init.did_dns[current_username]; match get_did with
            | None => e = { _exception : "AIRxWALLET_DidIsNull" }; throw e
            | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                | True =>
                | False => e = { _exception : "AIRxWALLET_WrongCaller" }; throw e end end end
          
          transition Pause()
            RequireNotPaused; VerifyController; is_paused := true;
            e = { _eventname: "SmartContractPaused";
              pauser: _origin }; event e end
          
          transition Unpause()
            VerifyController; is_paused := false;
            e = { _eventname: "SmartContractUnpaused";
              pauser: _origin }; event e end
          
          procedure Timestamp()
            current_block <- &BLOCKNUMBER; ledger_time := current_block;
            latest_tx_number <- tx_number;
            new_tx_number = let incrementor = Uint128 1 in builtin add latest_tx_number incrementor; tx_number := new_tx_number end
          
          procedure ThrowIfNullAddr( addr: ByStr20 )
            is_null = builtin eq addr zeroByStr20; match is_null with
              | False => | True => e = { _exception: "AIRxWALLET_NullAddress" }; throw e end end
          
          procedure ThrowIfSameAddr(
            a: ByStr20,
            b: ByStr20
            )
            ThrowIfNullAddr a;
            is_self = builtin eq a b; match is_self with
              | False => | True => e = { _exception: "AIRxWALLET_SameAddress" }; throw e end end
          
          procedure ThrowIfSameName(
            a: String,
            b: String
            )
            is_same = builtin eq a b; match is_same with
              | False => | True => e = { _exception: "AIRxWALLET_SameUsername" }; throw e end end
          
          transition UpdateUsername( username: String )
            RequireNotPaused; VerifyController;
            current_username <- nft_username; ThrowIfSameName current_username username;
            current_init <-& init.dApp;
            get_did <-& current_init.did_dns[username]; match get_did with
              | Some did_ => pending_username := username
              | None => e = { _exception: "AIRxWALLET_DidIsNull" }; throw e end;
            Timestamp end
          
          transition AcceptPendingUsername()
            RequireNotPaused; current_pending <- pending_username;
            current_init <-& init.dApp;
            get_did <-& current_init.did_dns[current_pending]; match get_did with
              | None => e = { _exception: "AIRxWALLET_DidIsNull" }; throw e
              | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                  | True => | False => e = { _exception: "AIRxWALLET_WrongCaller" }; throw e end;
                nft_username := current_pending; pending_username := null end;
            Timestamp end
          
          procedure FetchServiceAddr( id: String )
            current_init <-& init.dApp;
            initId = "init"; get_did <-& current_init.did_dns[initId]; match get_did with
              | None => e = { _exception: "AIRxWALLET_NullInit" }; throw e
              | Some did_ =>
                get_service <-& did_.services[id]; addr = option_bystr20_value get_service;
                services[id] := addr end end
          
          transition RecipientAcceptTransfer(
            sender: ByStr20,
            recipient: ByStr20,
            amount: Uint128
            ) 
            RequireNotPaused;
            is_valid = builtin eq recipient _this_address; match is_valid with
              | True => | False => e = { _exception: "AIRxWALLET_WrongRecipientForAcceptTransfer" }; throw e end end 
          
          transition RecipientAcceptTransferFrom(
            initiator: ByStr20,
            sender: ByStr20,
            recipient: ByStr20,
            amount: Uint128
            )
            RequireNotPaused;
            is_valid = builtin eq recipient _this_address; match is_valid with
              | True => | False => e = { _exception: "AIRxWALLET_WrongRecipientForAcceptTransferFrom" }; throw e end end
          
          transition Airdrop()
            RequireNotPaused;
            list_part = @list_mem ByStr20; list <- airdrop_list;
            is_participant = list_part compare_participant _sender list;
            match is_participant with
            | True =>
              list_filter = @list_filter ByStr20; remove_participant = fun( participant: ByStr20 )
                => let is_addr = builtin eq _sender participant in negb is_addr;
              list_updated = list_filter remove_participant list;
              airdrop_list := list_updated
            | False => e = { _exception: "AIRxWALLET_NotInTheList" }; throw e end;
            FetchServiceAddr token_name;
            get_token_addr <- services[token_name]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
              to: _sender;
              amount: airdrop_amount } in one_msg m ; send msg;
            Timestamp end
          
          transition Transfer(
              addr_: ByStr20,
              amount: Uint128
            )
            VerifyController; FetchServiceAddr token_name;
            get_token_addr <- services[token_name]; token_addr = option_bystr20_value get_token_addr;
            ThrowIfSameAddr addr_ _this_address;
            msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
              to: addr_;
              amount: amount } in one_msg m ; send msg end
            
          transition TransferSuccessCallBack( sender: ByStr20, recipient: ByStr20, amount: Uint128 ) RequireNotPaused end
        `;
      const airdrop_amount = 18000000000000;
      // const init_list = [
      //   "zil1hpw0d5307dlrrmcxyaq52837hg87ftz8d9de5e",
      //   "zil156fjpwk3ckc56uv2fcldtj9mq98jwa0e4473wf",
      //   "zil14nkglz8uszve0dt3y05knjpukssdmujrajtrkh",
      //   "zil1v2yt26xxh54hwdrsw6sm6ru7puta4cf9phalpy",
      //   "zil10wpnml9j5qk5rjsvfjy6v8ylch346l8a7z3ftu",
      //   "zil1pl2u2zvgw9vv7tdt9y8eeymkt90zke0dcvqn3f",
      //   "zil1ak0052afjjcku07yflx4wfpf3udetdl32efvpr",
      //   "zil13w2l3fpa7v3zluqc99077r3vpjck6sjtnf06e3",
      //   "zil1wx4p6rs9h5quswvsw34fu3paa3gjtuq7a0rs59",
      //   "zil1fqc4ntes9wpq69cj2aegvyhzwrrczr9r4fpm9q",
      //   "zil18fndr63k25cha4l6jv2efxkesrfd7l0cuk5r40",
      //   "zil1x5uqhrg3pxj4r4a832xpnhwzu2ruwradm7egwg",
      //   "zil1he4ew7df3jv09yf9dkjg79zuj6209cmx64u0kt",
      //   "zil1vqp5fue75j7g84n3pv8k68j02ayhs7h7p04mwp",
      //   "zil1j8fcp38gx8vykc5az99trh4d958r7ts9gjatxy",
      //   "zil187h0rz46dvqalx34k9e8lyhgxch8a37vs8t4st",
      //   "zil18dx838wxje4cupldnn4jkr0w3zv7m4txd6wkhv",
      //   "zil1th6xhdvmhmnq6f0eknrgqxrnxm9zzd3jyl40ss",
      //   "zil1lmsp72vjckxm5v5e67h2dctsflrdzmgvpnesls",
      //   "zil16k3fg0ehddvyqhfasmmn6466yqxxtwz5vvl94w",
      //   "zil1pkk5adawt37gqfnwtneewyp3j47cggnwauaaq7",
      //   "zil1nx603d9ys6z7lzxduwh56v9kym2jemydmh8vr4",
      //   "zil1ck5gt0r3kekjjpkzr4vt3na8j6rj04qqlqt5z8",
      //   "0x1aC3085F91A3b291bCB4AaE439Afc4401b9EbE4C",
      //   "zil1tpk9xzugdav4j22kuk46cukm54grm865t54zev",
      //   "zil123pvuzp4vwkaw8ftcrp5h2uwxct8hyr2ly5jve",
      //   "zil18saq640wlg548x39gajw8qt3kuzq4r4qlu0tqt",
      //   "zil14w88rpvsqyc3c5s3sv65gaxtzty4gdeh4ttp8p",
      //   "zil1a9z2g8h3pm94j3yphe2kudjwqtulquyc8j4e9w",
      //   "zil1k8qae4af8y97ksgaca8xrq4kupus3lmgmkzw3y",
      //   "zil1prpjy6tdwgtyejh6ezq3cx93mz6js69w6eyfy4",
      //   "zil17456wyvj28d7ew7g3s7767jcthrspn365jk36x",
      //   "zil17attm4utv9z8q6tk847xkj2l36fzwj7kt98pn7",
      //   "zil1l9h4hrw0dxhevc33w832rgusrqmn95a9k98dx6",
      //   "zil1hgn2qg8sxc23duf68ug98krn7yh6yc5jznqhy2",
      //   "zil12tctkz7zsyfszcr0udfgupqtukleq0v8c0eaf5",
      //   "zil1luzskszvgf8hjy6ftf0fh8n4nv2s23dyvsf8fd",
      //   "zil1x78rh0kawu3y585e0rdg7dv5fuzxjhtkg9m66v",
      //   "zil1t5ner64vfnh5l62lj79cdn5mw3gm6kheajafdj",
      //   "zil1fjey5676drgr8qjgfw089d797k4q5lqancaryc",
      //   "zil1ssuj3fy8tmydu74pcz4szu609rjffr5m8ser80",
      //   "zil1kacrr0q35h85mrfgk70t6f26f4prfx3swywwh7",
      //   "zil1sepd0mmqhkr2gzehlqswjpx2kr2n8faz6x3fcv",
      //   "zil1hssuz0zxcsmjzpkmt693rysykys4lye0fr3jz5",
      //   "zil1g5vjlpzv4wg6jsxakra6xg07t8zku63uvt0h0q",
      //   "zil1w67ae3hndl6x7rmtmaxps2x9j3430xjuw33kfd",
      //   "zil1h7axg5vkp5y703ghwm4etnpznmvw8wuv5544ha",
      //   "zil1m8vgzfg4u29t9p039nelstwtr04z0dlj03t0c9",
      //   "zil1tepmprpl6j7yl4ymwn8ke400ddmh3tlc4m629n",
      //   "zil1nmjh2fw82prcw00cnz9r47gvk03yynphkfnqp6",
      //   "zil1calcpcqsv0hvzq6pprkrsxzqhdx9wh3afp8lrg",
      //   "zil16rvrdvt5aumv776fcr5wyy5c90pa8fgennv38t",
      //   "zil1tsueaeat8a0v5w6zzt045xnzjqudf83v5a3znm",
      //   "zil1eqsf4l5ddz74kavyqwzgx32tn98qq4qd7rdep2",
      //   "zil13wtrjguuzza9hpcnkf7hqlnw8sfhdxrj6ksl9j",
      //   "zil1m336gfu06ume4jne5tf2fh7ae456r5j4h2ltnl",
      //   "zil10wd5hj7gdnzqfw85qlzy7nuvegated4aqhlmva",
      //   "zil1cupjuq92sg80haa8myzlemquxu92wjzteux68d",
      //   "zil1nj5twnrhcl7c6u2wtw7tf3a8rfpe7h6snefjew",
      //   "zil1ut8c44swk32x4295956fq9j6tzavzwpg442kft",
      //   "zil1aygcfxrn5tlprs8esm0e28jlsl4hv3dyt90nj4",
      //   "zil1j3qvd0zkv7rsm5xjk8tc9svp7fkz8v02xywy4q",
      //   "zil17ft5twm2z282lx3dr3rghm6fla9tk4zla3kyrm",
      //   "zil15huah8zsfs8837x4f3zg5g9vn52ep9rqw35mlz",
      //   "zil12klg0vpuva7zywjlmv5k4wdvhp80tvfwwmgdd0",
      //   "zil17qyu28khjpr3rtmrzat45xhlq9u5y8n4jcjc62",
      //   "zil1zfv5rdphwwuyx09l3qz4lzndtv2986d852ejkg",
      //   "zil125u7crehav7u9kdw3qkm694cd3uzpagcr6tvlh",
      //   "zil1mrkzpy8yhhc2a0xu8ytnw647ducg56nprq8rsr",
      //   "zil14kt3gydhjr0ktf6td40whd24xlgfh8lc5wc79s",
      //   "zil163zgjacza797jpkl902g3svpkstrlvx7g2880z",
      //   "zil10elyhffjm942zwz5neejyqtm5nhdtpu6zvx9sp",
      //   "zil1vwhz0cg9x72vvnx6kwny2ylpupj8mkze3ducae",
      //   "zil1z27q3qy3mjleags3ejgwg25h7wrx8h62xurmnr",
      //   "zil1fyvues4m3m37rekcaavxtvqn7y0dtvl7u52ea0",
      //   "zil144kmv0rsp6uls7jkesv3e0y2dmu47cfywf8es0",
      //   "zil1ng3k5asnvf4x9g5yxej2z6u2ffptezmn7gsv0p",
      //   "zil1g70crsjyhcj6z5q9sj6qv494udef99fd5l2vaf",
      //   "zil1jj523s39tcr7xeqsh9urx6sfpw3ngz94g478s0",
      //   "zil15f6nzf4edlch4z03ewz9g8n20ecu4x2ttpld33",
      //   "zil1gnxv9p3ey6xdq45elck86l0mn6ev6hermru3yx",
      //   "zil1ry3a5nz2l8ltn2yac526s7tpg77p5gjudjc7pk",
      //   "zil1kcl4j0usxgx6pfueq98l2sl3zeyv3k200eq55d",
      //   "zil1tf3v95dh8ntn5cjv92mwmqk6e0udv9heh8xltf",
      //   "zil1dmkclwy5kjp8t4afw085lfgzve0lcan439yqre",
      //   "zil1m7g24kryqry835y4098cgekg2h8uzv4rn4m5j9",
      //   "zil1qea832ne3amsx8rfdr3lfv9k9l0j8mq2s49s7q",
      //   "zil1exzl3ywa48lk0gwhez8tgw3wuezqlwva7kn5yv",
      //   "zil1tpu738jy5wj2ulzet2a9rmfvmc30ydy7rwdkep",
      //   "zil1j8r79uqns8d82uyxwj8j66g2r3ja3k8eg5tcuz",
      //   "zil1h000t4zju7xtt2rcf2d9ahx7kf2wzkf8f64kyt",
      //   "zil179hl0c25s3lu3lxzqtve7m7erzw45txzff2cwv",
      //   "zil1vda9gx0qnv9pej0szenm7d96z4xwfj4q0pmt4d",
      //   "zil125d3j3624q5c3xy29pfkex4s4dsh75y7w8hd8h",
      //   "zil12mks0hnu9j88haydk3vmc3hhu8307n3rkwvy0f",
      //   "zil1txdxlp0ng2u2sqlu34dt7cef70nl2su9m0mx6y",
      //   "zil1ugkjfa0ddu9m9d6u8ay5jd27g7j9hkls2w6c75",
      //   "zil1k5eh4dl3pqprzrvrt5t7l40qx87jazd9kgfw00",
      //   "zil1y6ah522ruf8z9rkuj5lhhx63xvtf2t6jn2tqse",
      //   "zil1l80hwwwe3dxd4plftg54ngd5dx9p783cw772y2",
      //   "zil1vj5shwys2rmfklnr3meeguegnfgmp7e8zzx38e",
      //   "zil1h797jens2urrqaaa02ha88lzvlj82cu3w3765c",
      //   "zil1u06mzznv0ckpfcfqpnqnnnn0n3j38f4g5aj7wg",
      //   "zil18r6apyp52m9wljprkhs8r43eyusldmdez8vgvs",
      //   "zil17gm8lj80jght6eczcumyha6ldm7pvdk044evhg",
      //   "zil1sdwv3vvsu5l7t5xx9s0qzw9ys2f8qsddzmpc0u",
      //   "zil1vr453l6pxx3l39cuxngtg6408y9ypqhy0qxxpg",
      //   "zil1365g5xlfjx8znfv4vzd2pry4eqnxpq9kjnpsuc",
      //   "zil19k76emngm8nyxelzwv9kyt53zgvcpa66urdj8e",
      //   "zil17vuxfxtgswap8hmqemknxn75jq9qy03zkprm0a",
      //   "zil1p53w42mhl2jrxevygurtnf8aw9kvw8h2hgjah2",
      //   "zil14f87saqhx73tdkyu3fqv23ykm0yr94rh3saks5",
      //   "zil1c05g3x2e8cgmkr9anq8nsxtsudssd75rrnykh6",
      //   "zil1s9gnpj886dwe8ysevt5p9vcdqvu7usy06kgpf2",
      //   "zil19varp20uu4m2wrgahszevzy0nw0mcjg49e9uas",
      //   "zil106yxqc00w5wures4xnrlcz6kul0rdlspcklknr",
      //   "zil1ppf5zu95lm0cuxgh3xqtawgsar5hh7yc2x0qv0",
      //   "zil1jgah8yy577x68fyzq64tm5x3cm6pcwuc24qynh",
      //   "zil194pl9sp94sjclznyzf6f3d68f3h7dtg757f09m",
      //   "zil1uhtslfelegjvt7z9wxw2kxwmp8nhlap9fjfhp0",
      //   "zil1sy0x4axdakhu0ltqafshqjxp7zdw4vmrmwh45m",
      //   "zil102684u7en0qwuq77skanlky2fexjjxxvsadkqu",
      //   "zil1254ghppz0rwn7ft6wslzmlquy8z0hpkfnvutta",
      //   "zil1r09vl92gh6j909ftv8r45l0rtw7ey3gzupjscy",
      //   "zil17j8p7z2jh00hlsy8zr6cgnm0sw9scv3m3uhj6z",
      //   "zil1ze80sy9q8jjd80hkaqdy30vf6yzxxdpgpmq5hr",
      //   "zil1qn6zz4ma8jhyw2qsutq9da9yu5acyevj5d2kxc",
      //   "zil1g94gws8uwsnw3lkqdp3xgjf9j0m6n0exx0atmr",
      //   "zil1whu33jpqdrpgxm6d393sehhle6qzwq927g4njs",
      //   "zil1q9yehht7pxmntvrfde8xld5as3rld8t94gfe24",
      //   "zil1lmmy2mlr760w3qdnnz5ekq6fudck3rq7svqahj",
      //   "zil1mznu9r0d3fwmzf5ujumefpe5vy4h9qa5dl0rrs",
      //   "zil1cm3e92dn6wej5fy89le6kaxzfxux6lpv04v6nm",
      //   "zil12e4rd4ewn7vawu5pq2hld7r3yvzwy00dw7ds6x",
      //   "zil1lnq48vmseyx6ej0t8mf6jh0x092s24a2cv3g7j",
      //   "zil1jtc7f77u2lr8yy4j47mujjuupzfjuptpqk9cve",
      //   "zil1xvxuezxaw2xutf3rl4krpf5raufzd7jegvv6s6",
      //   "zil1v8vhzdmt28j3rnrs6al7wyrj775trytejhr9gt",
      //   "zil1mmhn63judwn0vtjpmvwu3eu0q8s6agws8kggmq",
      //   "zil1h7lmcpppfhl55jpl2yjmhsyu57s8947dlttdfn",
      //   "zil1t3enqkg6gsr2tczawcg2k7q59few0p2lp6ka3e",
      //   "zil1xlzjh2hjt70tlkcg8gnt62hydg8cyslx45vv78",
      //   "zil1gd8xcsvapzexh3unyaffcvxhmpmazhgyauy87s",
      //   "zil1znlzvtz580x0v0rvvn4l5rp6u6l99s07qfdf73",
      //   "zil1jd7ujqe7nfcwsdrynu3r86qmfcuclr3c9d4hyk",
      //   "zil1xr08vwgqwxw9s6nae9ld2jnfnuvf6cz6v85z0x",
      //   "zil1cx3v5xw06vljzhvdjwvzzppysvpjwcd5ftl7fs",
      //   "zil1f9s8tzu2tv4387vrzx54efsnp7d9m5l52jv7j2",
      //   "zil1ca6ms5aq6zw6w0ed2jx9fc6wrqy700lls6zet8",
      //   "zil1xut0xhkwj3ypu57d6k96nlaw33eyeu7x0aw5c7",
      //   "zil1uhqvucnwgu274fhvwvzzaf45tvhe78d9vp3e7p"
      // ];

      const init_list = [
        // "zil1hdgvlqnr3qx7hevxe6qlwc432gkjc6e067wdyq",
        // "zil1lxm8m392rs4dvczgl3kku6pzvpklxhz5ardwsk",
        // "zil1va6mfw2jk6jds65fx6y8qyekhhn5uurq5ve0tz",
        // "zil1dq4m7cdhezv6uc4educk84w04pd89lyfhumhts",
        // "zil1r2d4pt54u3l4asrwxcfw8f3lssmclcd2xykqm9",
        // "zil1hssuz0zxcsmjzpkmt693rysykys4lye0fr3jz5",
        // "zil1hpw0d5307dlrrmcxyaq52837hg87ftz8d9de5e",
        "zil1t3enqkg6gsr2tczawcg2k7q59few0p2lp6ka3e",
        "zil1r2d4pt54u3l4asrwxcfw8f3lssmclcd2xykqm9",
        "zil1nz79e74mqyd6w6hwjsr83g2ey65yz2mgxh2dws",
        "zil1uawfpg7whcg39znryqf68j24r7ga95vknkk4yf",
        "zil1wyj03epll33sv3jlch6ywhuddhfvyrzrt9ky0e",
        "zil1va6mfw2jk6jds65fx6y8qyekhhn5uurq5ve0tz"
      ]
      let list: any = []
      for (let i = 0; i < init_list.length; i += 1) {
        list.push(zcrypto.normaliseAddress(init_list[i]))
      }
      const init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "init_username",
          type: "String",
          value: `0x29eee3e10b6c4138fc2cabac8581df59a491c05c49d72d107f90dbb7af022e64`, //tyronmapu.did
        },
        {
          vname: "init",
          type: "ByStr20",
          value: `${init_tyron}`,
        },
        {
          vname: "token_name",
          type: "String",
          value: `tyron`,
        },
        {
          vname: "airdrop_amount",
          type: "Uint128",
          value: `${airdrop_amount}`,
        },
        {
          vname: "init_list",
          type: "List ByStr20",
          value: list,
        },
      ];
      const contract = contracts.new(code, init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "60000",
        gasPrice: "2000000000",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployDomain(net: string, domain: string, address: string) {
    try {
      const zilPay = await this.zilpay();
      const { contracts } = zilPay;
      let addr = "";

      // mainnet
      switch (domain) {
        case "vc":
          addr = "0x6ae25f8df1f7f3fae9b8f9630e323b456c945e88";
          break;
        case "ssi":
          addr = "";
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
      toast.info("You successfully created a DID Domain!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployDApp(net: string) {
    try {
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;

      //@xalkan
      let previous_version = "0xdfc81a41a7a1ce6ed99e27f9aa1ede4f6d97c7d0";
      let init_ = "0x57ab899357ad95f5bf345f6575ad8c9a53e55cdc";
      let name_did = "0x696613a8e6f6c2a36b0fcc93e67eeb72d0b61e41";

      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
        previous_version = "0x26193045954ffdf23859c679c29ad164932adda1"; //'0x8b7e67164b7fba91e9727d553b327ca59b4083fc';
        init_ = "0xef497433bae6e66ca8a46039ca3bde1992b0eadd"; // contract owner/impl @xalkan update implementation once proxy is deployed
        name_did = "0x40093d08c6c18b05f5f58435a734533731c89580"; //'0x27748ef59a8a715ab325dd4b1198800eba8a9cb0'; // DIDxWallet
      }
      const init = new tyron.ZilliqaInit.default(network);

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      //@xalkan
      const code = `
        (* v3.6.0
          INIT DAPP: SSI Initialization & DNS <> Proxy smart contract
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
          
          library Init
            let one_msg =
            fun( msg: Message ) =>
            let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
          
            type Caller =
              | Controller
              | Implementation
            
            let controller_ = Controller
            let implementation_ = Implementation
            let donateId = "donate"
            let donateAddr = 0xc88ab766cdbe10e5961026633ad67c57f2e4aaf1   (* @xalkan *)
          
          contract Init(
            initial_contract_owner: String,
            initialContractOwnerDid: ByStr20 with contract
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
            field dns: Map String ByStr20 = builtin put initDns donateId donateAddr
            field did_dns: Map String ByStr20 with contract
              field did: String,
              field nft_username: String,
              field controller: ByStr20,
              field version: String,
              field verification_methods: Map String ByStr33,
              field services: Map String ByStr20,
              field social_guardians: Map ByStr32 Bool,
              field did_domain_dns: Map String ByStr20,
              field deadline: Uint128 end = builtin put initDidDns donateId initialContractOwnerDid
            field version: String = "INITDApp_v3.6.0" (* @xalkan *)
          
          procedure VerifyCaller( caller: Caller )
            current_impl <- implementation;
            is_paused <-& current_impl.paused; match is_paused with
              | False => | True => e = { _exception : "INITDApp-WrongStatus" }; throw e end;
            match caller with
            | Controller =>
              current_username <-& current_impl.nft_username;
              get_did <- did_dns[current_username]; match get_did with
              | None => e = { _exception : "INITDApp-DidIsNull" }; throw e
              | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                  | True => | False => e = { _exception : "INITDApp-WrongCaller/Controller" }; throw e end end
            | Implementation =>
              verified = builtin eq _sender current_impl; match verified with
                | True => | False => e = { _exception : "INITDApp-WrongCaller/Implementation" }; throw e end end end
          
          procedure ThrowIfSameAddr(
            a: ByStr20,
            b: ByStr20
            )
            is_self = builtin eq a b; match is_self with
              | False => | True => e = { _exception : "INITDApp-SameAddress" }; throw e end end
          
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
            implementation := addr; initId = "init"; dns[initId] := addr; did_dns[initId] := addr;
            initHash = let hash = builtin sha256hash initId in builtin to_string hash; dns[initHash] := addr; did_dns[initHash] := addr;
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
        `;
      const get_dns = await init.API.blockchain.getSmartContractSubState(
        previous_version,
        "dns" //"guardians"// "did_dns"
      );
      const get_did_dns = await init.API.blockchain.getSmartContractSubState(
        previous_version,
        "did_dns"
      );

      const init_dns_ = Object.entries(get_dns.result.dns);
      const init_did_dns_ = Object.entries(get_did_dns.result.did_dns);

      let init_dns: Array<{ key: string; val: string }> = [];
      for (let i = 0; i < init_dns_.length; i += 1) {
        init_dns.push(
          // {
          //   key: init_dns_[i][0],//init_did_dns_[i][0],
          //   val: init_dns_[i][1] as string//init_did_dns_[i][1] as string
          // },
          {
            key: "0x" + (await HashString(init_dns_[i][0])), //init_did_dns_[i][0],
            val: init_dns_[i][1] as string, //init_did_dns_[i][1] as string
          }
        );
      }

      const init_username = "tyronmapu";

      let init_did_dns: Array<{ key: string; val: string }> = [];
      // init_did_dns.push(
      //   {
      //     key: `${init_username}`,
      //     val: `${name_did}`
      //   },
      // );
      for (let i = 0; i < init_did_dns_.length; i += 1) {
        init_did_dns.push(
          {
            key: init_did_dns_[i][0],
            val: init_did_dns_[i][1] as string,
          },
          {
            key: "0x" + (await HashString(init_did_dns_[i][0])),
            val: init_did_dns_[i][1] as string,
          }
        );
      }

      const contract_init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "initial_contract_owner",
          type: "String",
          value: `${init_username}`,
        },
        {
          vname: "initialContractOwnerDid",
          type: "ByStr20",
          value: `${name_did}`,
        },
        {
          vname: "init_",
          type: "ByStr20",
          value: `${init_}`,
        },
        {
          vname: "initDns",
          type: "Map String ByStr20",
          value: init_dns,
        },
        {
          vname: "initDidDns",
          type: "Map String ByStr20",
          value: init_did_dns,
        },
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "80000",
        gasPrice: "2000000000",
      });
      toast.info("You successfully deployed a new DApp.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployImpl(net: string, address: string, arConnect: any) {
    try {
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;
      let proxy = "0xdfe5e46db3c01fd9a4a012c999d581f69fcacc61"; //'0xdfc81a41a7a1ce6ed99e27f9aa1ede4f6d97c7d0';
      let impl = '0xdf370b7b588e905d6047dfba1be85cbc65201c0b'//'0xa577e9aa8a52c7d2c6b024a5e897e97b6f56006a'//v3.6.1 "0x42b10bd38ffb75086db9c376b3fbc1a5a7e93d99"; // v3.5
      //"0x54eabb9766259dac5a57ae4f2aa48b2a0208177c"
      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
        proxy = "0xb36fbf7ec4f2ede66343f7e64914846024560595";
        impl = '0x58B5ac42cB3e09a044feb54C24dDf9a5101a6E9B'// v3.8 '0xbf938603ac3ca05ace71ff03ba573a9064c2de27'//"0x962f93bc5b005fb097750ec84fc8e29e78399076"; //3.7 'zil15evg8d69q5juaat5xgj5zx38409rqr3dav6q48'//3.6 '0x39c50dc95fd79dfe6fb38ece8766145aefb9502e'//"0xa60aa11ba93a4e2e36a8647f8ec1b4a402ec0d5d"
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
        (* v3.10
          INIT DAPP: SSI Initialization & DNS <> Implementation smart contract
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
          import BoolUtils ListUtils IntUtils
          
          library InitI
            type DidStatus =
              | Created
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
            
            let ssi = "ssi" 
            let did = "did"
            let empty_string = ""
            let empty_map = Emp String String
            
            let update = "update"
            let recovery = "socialrecovery"
            let actionAdd = "add"
            let actionRemove = "remove"
            let add_ = Add
            let remove_ = Remove
            let empty_methods = Emp String ByStr33
            let empty_dkms = Emp String String
            let empty_services = Emp String ByStr20
            let empty_services_ = Emp String Endpoint
            let empty_guardians = Emp ByStr32 Bool
            let empty_domains = Emp String ByStr20
          
            let one_msg = fun( msg: Message ) =>
              let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
            
            let two_msgs =
              fun( msg1: Message ) => fun( msg2: Message ) =>
              let msgs_tmp = one_msg msg2 in Cons{ Message } msg1 msgs_tmp
          
            let zero_128 = Uint128 0
            let zero_256 = Uint256 0
            let one_256 = Uint256 1
            let zeroByStr20 = 0x0000000000000000000000000000000000000000
            let zeroByStr32 = 0x0000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr33 = 0x000000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
            let zeroByStr = builtin to_bystr zeroByStr20
          
            let option_value = 
              tfun 'A => fun( default: 'A ) => fun( input: Option 'A) => match input with
              | Some v => v
              | None => default end
            let option_uint256 = let f = @option_value Uint256 in f zero_256
            let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
            let option_bystr33_value = let f = @option_value ByStr33 in f zeroByStr33
            let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64
          
            type Beneficiary =
              | NftUsername of String String (* Domain Name & Subdomain *)
              | Recipient of ByStr20
          
            let true = True
            let false = False
            let zilID = "zil"
            
            let compare_participant = fun( addr: ByStr20 ) => fun( participant: ByStr20 ) => builtin eq addr participant
            let get_bal = fun ( maybe_bal: Option Uint256 ) =>
              match maybe_bal with
              | None => zero_256
              | Some bal => bal end
          
          contract InitI(
            symbol: String,
            initial_base_uri: String,
            init_username: String, 
            init: ByStr20 with contract
              field dns: Map String ByStr20,
              field did_dns: Map String ByStr20 with contract
                field did: String,
                field nft_username: String,
                field controller: ByStr20,
                field version: String,
                field verification_methods: Map String ByStr33,
                field services: Map String ByStr20,
                field social_guardians: Map ByStr32 Bool,
                field did_domain_dns: Map String ByStr20,
                field deadline: Uint128 end end,
            did_methods: Map String ByStr33,
            did_dkms: Map String String,
            did_services: Map String ByStr20,
            init_free_list: List ByStr20,
            init_tydra_free_list: List ByStr20,
            init_token_uris: Map String Map ByStr32 String,
            init_tydras: Map String Map String String,
            init_token_id_count: Map String Uint256,
            init_balances: Map String Map ByStr20 Uint256,
            init_utility: Map String Map String Uint128
            )
            field token_symbol: String = symbol
            field base_uri: String = initial_base_uri
            field tydra_id: String = "nessy"
            field token_uris: Map String Map ByStr32 String = init_token_uris
            field tydras: Map String Map String String = init_tydras
            field token_id_count: Map String Uint256 = init_token_id_count
            
            (* Mapping from token owner to the number of existing tokens *)
            field balances: Map String Map ByStr20 Uint256 = init_balances
          
            (* tyronZIL W3C Decentralized Identifier *)
            field did: String = let did_prefix = "did:tyron:zil:main:" in let did_suffix = builtin to_string _this_address in
              builtin concat did_prefix did_suffix   (* the tyronZIL W3C decentralized identifier *)
            field nft_username: String = init_username
            field pending_username: String = empty_string
            field controller: ByStr20 = zeroByStr20
            field did_status: DidStatus = Created
            field version: String = "INITDAppImpl_v3.10.0"   (* @xalkan *)
            
            (* Verification methods @key: key purpose @value: public DID key *)
            field verification_methods: Map String ByStr33 = did_methods
            
            (* Decentralized Key Management System *)
            field dkms: Map String String = did_dkms
            
            (* Services @key: ID @value: endpoint *)
            field services: Map String ByStr20 = did_services
            field services_: Map String Endpoint = empty_services_
          
            field social_guardians: Map ByStr32 Bool = empty_guardians
            
            field did_domain_dns: Map String ByStr20 = let emp = Emp String ByStr20 in
              builtin put emp did _this_address
            field deadline: Uint128 = Uint128 10
          
            field did_hash: ByStr = zeroByStr
            
            (* The block number when the last DID CRUD operation occurred *)  
            field ledger_time: BNum = BNum 0
            
            (* A monotonically increasing number representing the amount of DID CRUD transactions that have taken place *)
            field tx_number: Uint128 = zero_128
            
            field paused: Bool = False
            field closed: Bool = False
          
            field utility: Map String Map String Uint128 = init_utility
          
            field free_list: List ByStr20 = init_free_list
            field tydra_free_list: List ByStr20 = init_tydra_free_list
          
          procedure IsPaused()
            current_status <- did_status; match current_status with
              | Deactivated => e = { _exception : "INITDAppImpl-WrongStatus" }; throw e
              | _ =>
                is_paused <- paused; match is_paused with
                  | True => | False => e = { _exception : "INITDAppImpl-IsNotPaused" }; throw e end end end
          
          procedure IsOperational()
            current_status <- did_status; match current_status with
              | Deactivated => e = { _exception : "INITDAppImpl-WrongStatus" }; throw e
              | _ =>
                is_paused <- paused; match is_paused with
                  | False => | True => e = { _exception : "INITDAppImpl-IsPaused" }; throw e end end end
          
          procedure VerifyController()
            dao_username <- nft_username; dao_domain = let hash = builtin sha256hash dao_username in builtin to_string hash;
            get_did <-& init.did_dns[dao_domain]; match get_did with
              | None => e = { _exception : "INITDAppImpl-DidIsNull" }; throw e
              | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                  | True => | False => e = { _exception : "INITDAppImpl-WrongCaller" }; throw e end;
                controller := current_controller end end
          
          procedure Timestamp()
            current_block <- &BLOCKNUMBER; ledger_time := current_block;
            latest_tx_number <- tx_number;
            new_tx_number = let incrementor = Uint128 1 in builtin add latest_tx_number incrementor; tx_number := new_tx_number end
          
          procedure RequireValidDestination( to: ByStr20 )
            (* Reference: https://github.com/ConsenSys/smart-contract-best-practices/blob/master/docs/tokens.md *)
            is_zeroByStr20 = builtin eq to zeroByStr20; match is_zeroByStr20 with
              | False => | True => e = { _exception : "INITDAppImpl-ZeroAddressDestinationError" }; throw e end;
            is_this_address = builtin eq to _this_address; match is_this_address with
              | False => | True => e = { _exception : "INITDAppImpl-ThisAddressDestinationError" }; throw e end end
          
          procedure ThrowIfSameName(
            a: String,
            b: String
            )
            is_same = builtin eq a b; match is_same with
              | False => | True => e = { _exception : "INITDAppImpl-SameUsername" }; throw e end end
          
          transition Pause()
            IsOperational; VerifyController; paused := true;
            e = { _eventname: "SmartContractPaused";
              pauser: _origin }; event e;
            Timestamp end
          
          transition Unpause()
            IsPaused; VerifyController; paused := false;
            e = { _eventname: "SmartContractUnpaused";
              pauser: _origin }; event e;
            Timestamp end
          
          transition UpdateUsername(
            username: String,
            tyron: Option Uint128
            )
            IsOperational; VerifyController;
            current_username <- nft_username; ThrowIfSameName current_username username;
            get_did <-& init.did_dns[username]; match get_did with
              | None => e = { _exception : "INITDAppImpl-DidIsNull" }; throw e
              | Some did_ => pending_username := username end;
            Timestamp end
          
          transition AcceptPendingUsername()
            IsOperational; current_pending <- pending_username;
            get_did <-& init.did_dns[current_pending]; match get_did with
              | None => e = { _exception : "INITDAppImpl-DidIsNull" }; throw e
              | Some did_ =>
                new_controller <-& did_.controller;
                verified = builtin eq _origin new_controller; match verified with
                  | True => | False => e = { _exception : "INITDAppImpl-WrongCaller" }; throw e end;
                nft_username := current_pending; pending_username := empty_string;
                controller := new_controller end;
            Timestamp end
          
          (* Verify Schnorr signature - signed data must correspond with a DID key *)
          procedure VerifySignature(
            id: String,
            signedData: ByStr,
            signature: ByStr64
            )
            get_did_key <- verification_methods[id]; did_key = option_bystr33_value get_did_key;
            is_right_signature = builtin schnorr_verify did_key signedData signature; match is_right_signature with
              | True => | False => e = { _exception : "INITDAppImpl-WrongSignature" }; throw e end end
          
          procedure ThrowIfNoKey( optKey: Option ByStr33 )
            match optKey with
            | Some key => | None => e = { _exception: "DIDxWALLET-UndefinedKey" }; throw e end end
          
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
                | False => e = { _exception: "DIDxWALLET-RemoveNoKey" }; throw e end end
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
                | False => e = { _exception: "DIDxWALLET-RemoveNoService" }; throw e end end end end
          
          procedure VerifyDocument(
            document: List Document,
            signature: Option ByStr64,
            tyron: Option Uint128
            )
            (*SupportTyron tyron;*) current_controller <- controller;
            verified = builtin eq _origin current_controller; match verified with
              | True => forall document UpdateDocument
              | False =>
                  get_update_key <- verification_methods[update]; update_key = option_bystr33_value get_update_key;
                  forall document HashDocument; doc_hash <- did_hash;
                  sig = option_bystr64_value signature; VerifySignature update doc_hash sig; did_hash := zeroByStr;
                  forall document UpdateDocument;
                  get_new_update_key <- verification_methods[update]; new_update = option_bystr33_value get_new_update_key;
                  is_same_key = builtin eq update_key new_update; match is_same_key with
                  | False => | True => e = { _exception: "DIDxWALLET-SameUpdateKey" }; throw e end end end
          
          transition DidUpdate(
            document: List Document,
            signature: Option ByStr64,
            tyron: Option Uint128
            )
            current_status <- did_status; match current_status with
              | Created => VerifyDocument document signature tyron
              | Updated => VerifyDocument document signature tyron
              (*| Recovered => VerifyController tyron; forall document UpdateDocument*)
              | _ => e = { _exception: "DIDxWALLET-WrongStatus" }; throw e end;
            new_status = Updated; did_status := new_status;
            Timestamp end
          
          transition DidDeactivate(
            document: List Document,
            signature: Option ByStr64,
            tyron: Option Uint128
            ) 
            IsOperational; VerifyDocument document signature tyron;
            did := empty_string; controller := zeroByStr20; social_guardians := empty_guardians;
            verification_methods := empty_methods; dkms := empty_map;
            services := empty_services; services_ := empty_services_;
            did_domain_dns := empty_domains; (*nft_dns := empty_map;*) deadline := zero_128;
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
              | Created => | Updated =>
              | _ => e = { _exception : "INITDAppImpl-WrongStatus" }; throw e end;
            VerifyController;
            verification_methods[domain] := didKey; dkms[domain] := encrypted; did_domain_dns[domain] := addr; 
            new_status = Updated; did_status := new_status;
            Timestamp end
          
          transition UpdateDeadline(
            val: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController; deadline := val;
            Timestamp end
          
          transition IncreaseAllowance(
            addrName: String,
            spender: ByStr20,
            amount: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController;
            get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "IncreaseAllowance"; _recipient: token_addr; _amount: zero_128;
              spender: spender;
              amount: amount } in one_msg m ; send msg;
            Timestamp end
          
          transition DecreaseAllowance(
            addrName: String,
            spender: ByStr20,
            amount: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController;
            get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            msg = let m = { _tag: "DecreaseAllowance"; _recipient: token_addr; _amount: zero_128;
              spender: spender;
              amount: amount } in one_msg m ; send msg;
            Timestamp end
          
          transition Transfer(
            addrName: String,
            beneficiary: Beneficiary,
            amount: Uint128,
            tyron: Option Uint128
            )
            IsOperational; VerifyController;
            get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            match beneficiary with
            | NftUsername username_ domain_ =>
              is_ssi = builtin eq domain_ empty_string; match is_ssi with
                | True =>
                  get_addr <-& init.dns[username_]; addr = option_bystr20_value get_addr; RequireValidDestination addr;
                  msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero_128;
                    to: addr;
                    amount: amount } in one_msg m ; send msg
                | False =>
                  get_did <-& init.did_dns[username_]; match get_did with
                    | None => e = { _exception : "INITDAppImpl-DidIsNull" }; throw e
                    | Some did_ =>
                      is_did = builtin eq domain_ did; match is_did with
                        | True =>
                          msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero_128;
                          to: did_;
                          amount: amount } in one_msg m ; send msg
                        | False =>
                          get_domain_addr <-& did_.did_domain_dns[domain_]; domain_addr = option_bystr20_value get_domain_addr;
                          msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero_128;
                            to: domain_addr;
                            amount: amount } in one_msg m ; send msg end end end
            | Recipient addr_ =>
              RequireValidDestination addr_;
              msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero_128;
                to: addr_;
                amount: amount } in one_msg m ; send msg end;
            Timestamp end
          
          transition RecipientAcceptTransfer( sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational; Timestamp end
          
          transition RecipientAcceptTransferFrom( initiator: ByStr20, sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational; Timestamp end
          
          transition TransferSuccessCallBack( sender: ByStr20, recipient: ByStr20, amount : Uint128 ) IsOperational end
          
          transition TransferFromSuccessCallBack( initiator: ByStr20, sender: ByStr20, recipient: ByStr20, amount: Uint128 ) IsOperational end
          
          procedure ThrowIfNotProxy()
            verified = builtin eq init _sender; match verified with
              | True => | False => e = { _exception : "INITDAppImpl-NotProxy" }; throw e end end
          
          procedure IsNotNull( addr: ByStr20 )
            is_null = builtin eq addr zeroByStr20; match is_null with
              | False => | True => e = { _exception : "INITDAppImpl-AddressIsNull" }; throw e end end
          
          transition Close()
            IsOperational; VerifyController;
            closed := true;
            Timestamp end
          
          transition Open()
            IsOperational; VerifyController;
            closed := false;
            Timestamp end
          
          procedure IsClosed()
            is_closed <- closed; match is_closed with
              | False => | True => e = { _exception : "INITDAppImpl-IsClosed" }; throw e end end
          
          transition AddUtility(
            id: String,
            txID: String,
            fee: Uint128
            )
            IsOperational; VerifyController;
            utility[id][txID] := fee;
            Timestamp end
            
          transition RemoveUtility(
            id: String,
            txID: String
            )
            IsOperational; VerifyController;
            delete utility[id][txID];
            Timestamp end
          
          procedure UpdateFreeList_( addr: ByStr20 )
            list <- free_list;
            list_updated = Cons{ ByStr20 } addr list;
            free_list := list_updated end
          
          transition UpdateFreeList( val: List ByStr20 )
            IsOperational; VerifyController;
            forall val UpdateFreeList_;
            Timestamp end
          
          procedure UpdateTydraFreeList_( addr: ByStr20 )
            list <- tydra_free_list;
            list_updated = Cons{ ByStr20 } addr list;
            tydra_free_list := list_updated end
          
          transition UpdateTydraFreeList( val: List ByStr20 )
            IsOperational; VerifyController;
            forall val UpdateTydraFreeList_;
            Timestamp end
          
          transition SetTydra( id: String )
            VerifyController; tydra_id := id;
            e = { _eventname: "SetTydra";
              tydra_id: id }; event e;
            msg = let m = { _tag: "SetTydraCallback"; _recipient: _origin; _amount: zero_128;
              tydra_id: id } in one_msg m; send msg end
          
          procedure SetTokenURI(
            tydra: String,
            token_id: ByStr32,
            token_uri: String
            )
            is_empty_string = builtin eq token_uri empty_string; match is_empty_string with 
              | True => | False => token_uris[tydra][token_id] := token_uri end end
          
          (* Sets "uri" as the base URI. *)
          (* @Requirements:
            * "_origin" must be the contract owner. Otherwise, it must throw "NotContractOwnerError" *)
          transition SetBaseURI(uri: String)
            VerifyController; base_uri := uri;
            e = { _eventname: "SetBaseURI";
              base_uri: uri }; event e;
            msg = let m = { _tag: "ZRC6_SetBaseURICallback"; _recipient: _origin; _amount: zero_128;
              base_uri: uri } in one_msg m; send msg end
          
          procedure UpdateBalance(
            tydra: String,
            operation: Action,
            address: ByStr20
            )
            match operation with
            | Add =>
              maybe_count <- balances[tydra][address];
              new_count = 
                let cur_count = get_bal maybe_count in
                (* if overflow occurs, it throws CALL_CONTRACT_FAILED *)
                builtin add cur_count one_256; balances[tydra][address] := new_count
            | Remove =>
              maybe_count <- balances[tydra][address];
              new_count = 
                let cur_count = get_bal maybe_count in
                (* if underflow occurs, it throws CALL_CONTRACT_FAILED *)
                builtin sub cur_count one_256; balances[tydra][address] := new_count end end
          
          (* @Requirements:
            * - "to" must not be the zero address. Otherwise, it must throw "ZeroAddressDestinationError"
            * - "to" must not be "_this_address". Otherwise, it must throw "ThisAddressDestinationError" *)
          procedure MintTydraToken(
            tydra: String,
            token_id: ByStr32,
            dID: ByStr20
            )
            get_current_token_id_count <- token_id_count[tydra]; current_token_id_count = option_uint256 get_current_token_id_count;
            new_token_id_count = builtin add current_token_id_count one_256;
            token_id_count[tydra] := new_token_id_count;
            
            (* add one to the token owner balance *)
            UpdateBalance tydra add_ dID;
            token_id_ = builtin to_string token_id; tydras[token_id_][tydra] := ssi
            end
          
          transition MintTydraNft(
            id: String,
            token_id: ByStr32,
            token_uri: String
            )
            IsOperational; token_id_ = builtin to_string token_id;
            get_did <-& init.did_dns[token_id_]; match get_did with
              | None => e = { _exception : "INITDAppImpl-DidIsNull" }; throw e
              | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                  | True => | False => e = { _exception : "INITDAppImpl-WrongCaller" }; throw e end;
                list_part = @list_mem ByStr20; list <- tydra_free_list;
                is_participant = list_part compare_participant _origin list;
                match is_participant with
                | True =>
                  list_filter = @list_filter ByStr20; remove_participant = fun( participant: ByStr20 )
                    => let is_addr = builtin eq _origin participant in negb is_addr;
                  list_updated = list_filter remove_participant list;
                  tydra_free_list := list_updated
                | False =>
                    txID = "MintTydraNft";
                    get_fee <- utility[id][txID]; match get_fee with
                    | None => e = { _exception : "INITDAppImpl-FeeIsNull" }; throw e
                    | Some fee =>
                      (* the sender can be an EOA or smart contract wallet *)
                      dao_username <- nft_username; dao_domain = let hash = builtin sha256hash dao_username in builtin to_string hash;
                      get_addr <-& init.dns[dao_domain]; dao_xwallet = option_bystr20_value get_addr;    
                      is_zil = builtin eq id zilID; match is_zil with
                        | True =>
                          not_enough = builtin lt _amount fee; match not_enough with
                            | True => e = { _exception : "INITDAppImpl-InsufficientZIL" }; throw e
                            | False =>
                              accept; msg = let m = { _tag: "AddFunds"; _recipient: dao_xwallet; _amount: fee } in one_msg m; send msg;
                              refund = builtin sub _amount fee; is_zero = builtin eq refund zero_128; match is_zero with
                              | True => | False => msgr = let m = { _tag: "AddFunds"; _recipient: _sender; _amount: refund } in one_msg m; send msgr end end
                        | False =>
                          get_token_addr <- services[id]; token_addr = option_bystr20_value get_token_addr;
                          msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero_128;
                            from: _sender;
                            to: dao_xwallet;
                            amount: fee } in one_msg m; send msg end end end;
              (* An NFT Domain Name cannot mint the same Tydra twice *)
              tydra <- tydra_id;
              get_uri <- token_uris[tydra][token_id]; match get_uri with
                | Some uri => e = { _exception : "INITDAppImpl-UriIsNotsNull" }; throw e
                | None =>
                  MintTydraToken tydra token_id did_; SetTokenURI tydra token_id token_uri end end;
            e = { _eventname: "MintTydra";
              to: _origin;
              token_id: token_id;
              token_uri: token_uri
            }; event e;
            msg_to_recipient = {
              _tag: "ZRC6_RecipientAcceptMint";
              _recipient: _sender;
              _amount: zero_128
            };
            msg_to_sender = {
              _tag: "MintCallback";
              _recipient: _origin;
              _amount: zero_128;
              to: _sender;
              token_id: token_id;
              token_uri: token_uri
            }; msgs = two_msgs msg_to_recipient msg_to_sender; send msgs;
            Timestamp end
          
          procedure TransferTydraToken(
            tydra: String,
            token_id: ByStr32,
            to_token_id: ByStr32
            )
            get_to_uri <- token_uris[tydra][to_token_id]; match get_to_uri with
              | None => | Some uri => e = { _exception : "INITDAppImpl-ToUriIsNotNull" }; throw e end;
            token_id_ = builtin to_string token_id;
            to_token_id_ = builtin to_string to_token_id;
            get_did <-& init.did_dns[token_id_]; match get_did with
              | None => e = { _exception : "INITDAppImpl-DidIsNull" }; throw e
              | Some did_ =>
                get_to_did <-& init.did_dns[to_token_id_]; match get_to_did with
                  | None => e = { _exception : "INITDAppImpl-ToDidIsNull" }; throw e
                  | Some to_did =>
                    new_controller <-& to_did.controller;
                    get_uri <- token_uris[tydra][token_id]; match get_uri with
                      | None => e = { _exception : "INITDAppImpl-FromUriIsNull" }; throw e
                      | Some uri =>
                        delete token_uris[tydra][token_id]; UpdateBalance tydra remove_ did_; delete tydras[token_id_][tydra];
                        SetTokenURI tydra to_token_id uri; UpdateBalance tydra add_ to_did; tydras[to_token_id_][tydra] := ssi end end end end
          
          transition TransferTydraNft(
            id: String,
            tydra: String,
            token_id: ByStr32,
            to_token_id: ByStr32
            )
            IsOperational; token_id_ = builtin to_string token_id;
            get_did <-& init.did_dns[token_id_]; match get_did with
              | None => e = { _exception : "INITDAppImpl-DidIsNull" }; throw e
              | Some did_ =>
                current_controller <-& did_.controller;
                verified = builtin eq _origin current_controller; match verified with
                  | True => | False => e = { _exception : "INITDAppImpl-WrongCaller" }; throw e end;
                list_part = @list_mem ByStr20; list <- tydra_free_list;
                is_participant = list_part compare_participant _origin list;
                match is_participant with
                | True =>
                  list_filter = @list_filter ByStr20; remove_participant = fun( participant: ByStr20 )
                    => let is_addr = builtin eq _origin participant in negb is_addr;
                  list_updated = list_filter remove_participant list;
                  tydra_free_list := list_updated
                | False =>
                    txID = "TransferTydraNft";
                    get_fee <- utility[id][txID]; match get_fee with
                    | None => e = { _exception : "INITDAppImpl-FeeIsNull" }; throw e
                    | Some fee =>
                      dao_username <- nft_username; dao_domain = let hash = builtin sha256hash dao_username in builtin to_string hash;
                      get_addr <-& init.dns[dao_domain]; dao_xwallet = option_bystr20_value get_addr;
                      is_zil = builtin eq id zilID; match is_zil with
                        | True =>
                          not_enough = builtin lt _amount fee; match not_enough with
                            | True => e = { _exception : "INITDAppImpl-InsufficientZIL" }; throw e
                            | False =>
                              accept; msg = let m = { _tag: "AddFunds"; _recipient: dao_xwallet; _amount: fee } in one_msg m; send msg;
                              refund = builtin sub _amount fee; is_zero = builtin eq refund zero_128; match is_zero with
                              | True => | False => msgr = let m = { _tag: "AddFunds"; _recipient: _sender; _amount: refund } in one_msg m; send msgr end end
                        | False =>
                          get_token_addr <- services[id]; token_addr = option_bystr20_value get_token_addr;
                          msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero_128;
                            from: _sender;
                            to: dao_xwallet;
                            amount: fee } in one_msg m; send msg end end end end;
            TransferTydraToken tydra token_id to_token_id;
            e = { _eventname: "TransferTydra"; 
              from: _sender;
              to: to_token_id;
              token_id: token_id
            }; event e;
            Timestamp end
          
          procedure NftUsernameCallBack(
            username: String,
            addr: ByStr20
            )
            msg = let m = { _tag: "NftUsernameCallBack"; _recipient: init; _amount: zero_128;
            username: username;
            addr: addr } in one_msg m; send msg end
          
          procedure NftDidCallBack(
            username: String,
            dID: ByStr20
            )
            msg = let m = { _tag: "NftDidCallBack"; _recipient: init; _amount: zero_128;
              username: username;
              dID: dID } in one_msg m; send msg end
           
          procedure PremiumNftUsername_( premium: String )
            current_controller <- controller;
            get_addr <-& init.dns[premium]; match get_addr with
              | Some addr => e = { _exception : "INITDAppImpl-UsernameHasOwner" }; throw e
              | None =>
                NftUsernameCallBack premium current_controller;
                NftDidCallBack premium _this_address end end
          
          transition PremiumNftUsername( premium: List String )
            IsOperational; VerifyController;
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
            IsOperational; ThrowIfNotProxy; IsNotNull addr;
            get_ssi_addr <-& init.dns[username]; match get_ssi_addr with
              | Some addr_ => e = { _exception : "INITDAppImpl-TokenHasOwner" }; throw e
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
                  | None => e = { _exception : "INITDAppImpl-FeeIsNull" }; throw e
                  | Some fee =>
                    dao_username <- nft_username; dao_domain = let hash = builtin sha256hash dao_username in builtin to_string hash;
                    get_addr <-& init.dns[dao_domain]; dao_xwallet = option_bystr20_value get_addr;
                    is_zil = builtin eq id zilID; match is_zil with
                      | True =>
                        not_enough = builtin lt _amount fee; match not_enough with
                          | True => e = { _exception : "INITDAppImpl-InsufficientZIL" }; throw e
                          | False =>
                            accept; msg = let m = { _tag: "AddFunds"; _recipient: dao_xwallet; _amount: fee } in one_msg m; send msg;
                            refund = builtin sub _amount fee; is_zero = builtin eq refund zero_128; match is_zero with
                            | True => | False => msgr = let m = { _tag: "AddFunds"; _recipient: dID; _amount: refund } in one_msg m; send msgr end end
                      | False =>
                        get_token_addr <- services[id]; token_addr = option_bystr20_value get_token_addr;
                        msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero_128;
                          from: dID;
                          to: dao_xwallet;
                          amount: fee } in one_msg m; send msg end end end end;
            NftUsernameCallBack username addr; NftDidCallBack username dID;
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
            IsOperational; ThrowIfNotProxy; IsNotNull addr;
            get_did <-& init.did_dns[username]; match get_did with
            | Some did_ =>
              current_controller <-& did_.controller;
              verified = builtin eq _origin current_controller; match verified with
                | True => | False => e = { _exception : "INITDAppImpl-WrongCaller" }; throw e end;
              is_tydra <- exists tydras[username]; match is_tydra with
                | True => | False =>
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
                      | None => e = { _exception : "INITDAppImpl-FeeIsNull" }; throw e
                      | Some fee =>
                        dao_username <- nft_username; dao_domain = let hash = builtin sha256hash dao_username in builtin to_string hash;
                        get_addr <-& init.dns[dao_domain]; dao_xwallet = option_bystr20_value get_addr;
                        is_zil = builtin eq id zilID; match is_zil with
                          | True =>
                            not_enough = builtin lt _amount fee; match not_enough with
                              | True => e = { _exception : "INITDAppImpl-InsufficientZIL" }; throw e
                              | False =>
                                accept; msg = let m = { _tag: "AddFunds"; _recipient: dao_xwallet; _amount: fee } in one_msg m; send msg;
                                refund = builtin sub _amount fee; is_zero = builtin eq refund zero_128; match is_zero with
                                | True => | False => msgr = let m = { _tag: "AddFunds"; _recipient: did_; _amount: refund } in one_msg m; send msg end end
                          | False =>
                            get_token_addr <- services[id]; token_addr = option_bystr20_value get_token_addr;
                            msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero_128;
                              from: did_;
                              to: dao_xwallet;
                              amount: fee } in one_msg m; send msg end end end end;
              NftUsernameCallBack username addr; NftDidCallBack username dID
            | None =>
              IsClosed;
              get_addr <-& init.dns[username]; xwallet = option_bystr20_value get_addr;
              is_wallet = builtin eq xwallet addr; match is_wallet with
                | False => e = { _exception : "INITDAppImpl-WrongUpgrade" }; throw e
                | True =>
                  username_ = let hash = builtin sha256hash username in builtin to_string hash; 
                  NftUsernameCallBack username_ dID; NftDidCallBack username_ dID end end;
            Timestamp end
        `;
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

      const init = new tyron.ZilliqaInit.default(network);
      const get_services = await init.API.blockchain.getSmartContractSubState(
        impl,
        "services"
      );
      const init_services = Object.entries(get_services.result.services);
      let did_services: Array<{ key: string; val: string }> = [];
      for (let i = 0; i < init_services.length; i += 1) {
        did_services.push({
          key: init_services[i][0],
          val: init_services[i][1] as string,
        });
      }
      const get_free_list = await init.API.blockchain.getSmartContractSubState(
        impl,
        "free_list"
      );
      let init_free_list = get_free_list.result.free_list;

      const get_tydra_free_list =
        await init.API.blockchain.getSmartContractSubState(
          impl,
          "tydra_free_list"
        );
      let init_tydra_free_list = get_tydra_free_list.result.tydra_free_list;
      console.log(init_free_list);
      console.log(init_tydra_free_list);
      const get_token_uris = await init.API.blockchain.getSmartContractSubState(
        impl,
        "token_uris"
      );
      const token_uris = Object.entries(get_token_uris.result.token_uris);
      let init_token_uris: Array<{ key: string; val: any }> = [];
      let init_ty: Array<{ key: string; val: any }> = [];
      for (let i = 0; i < token_uris.length; i += 1) {
        const tot = token_uris[i][0]
        const inner = Object.entries(token_uris[i][1] as any);
        let inner_n: any = [];
        // let init_ty: any = [];
        for (let i = 0; i < inner.length; i += 1) {
          inner_n.push({
            key: inner[i][0],
            val: inner[i][1],
          });
          init_ty.push({
            key: inner[i][0],
            val: tot
          });
        }
        init_token_uris.push({
          key: token_uris[i][0],
          val: inner_n,
        });
      }
      let init_tydras: Array<{ key: string; val: any }> = [];
      const uniqueKeys = Array.from(new Set(init_ty.map((kv) => kv.key)));
      uniqueKeys.forEach((key) => {
        const values: any = [];

        init_ty.forEach((kv) => {
          if (kv.key === key) {
            values.push({
              key: kv.val,
              val: "ssi",
            },);
          }
        });

        init_tydras.push({ key, val: values });
      })
      console.log("tydras", JSON.stringify(init_tydras))

      const get_token_id_count =
        await init.API.blockchain.getSmartContractSubState(
          impl,
          "token_id_count"
        );
      const token_id_count = Object.entries(
        get_token_id_count.result.token_id_count
      );
      let init_token_id_count: Array<{ key: string; val: string }> = [];
      for (let i = 0; i < token_id_count.length; i += 1) {
        init_token_id_count.push({
          key: token_id_count[i][0],
          val: token_id_count[i][1] as string,
        });
      }
      // console.log(JSON.stringify(init_token_id_count));

      const get_balances = await init.API.blockchain.getSmartContractSubState(
        impl,
        "balances"
      );
      const balances = Object.entries(get_balances.result.balances);

      let init_balances: Array<{ key: string; val: any }> = [];
      for (let i = 0; i < balances.length; i += 1) {
        const inner = Object.entries(balances[i][1] as any);
        let inner_n: any = [];
        for (let i = 0; i < inner.length; i += 1) {
          inner_n.push({
            key: inner[i][0],
            val: inner[i][1],
          });
        }
        init_balances.push({
          key: balances[i][0],
          val: inner_n,
        });
      }
      // console.log(JSON.stringify(init_balances));

      const get_utility = await init.API.blockchain.getSmartContractSubState(
        impl,
        "utility"
      );
      const utility = Object.entries(get_utility.result.utility);

      let init_utility: Array<{ key: string; val: any }> = [];
      for (let i = 0; i < utility.length; i += 1) {
        const inner = Object.entries(utility[i][1] as any);
        let inner_n: any = [];
        for (let i = 0; i < inner.length; i += 1) {
          inner_n.push({
            key: inner[i][0],
            val: inner[i][1],
          });
        }
        init_utility.push({
          key: utility[i][0],
          val: inner_n,
        });
      }
      //console.log(JSON.stringify(init_utility));

      // @xalkan
      const init_username = "tyronmapu";
      const contract_init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "symbol",
          type: "String",
          value: `TYDRA`,
        },
        {
          vname: "initial_base_uri",
          type: "String",
          value: `https://arweave.net/`,
        },
        {
          vname: "init_username",
          type: "String",
          value: `${init_username}`,
        },
        {
          vname: "init",
          type: "ByStr20",
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
        {
          vname: "did_services",
          type: "Map String ByStr20",
          value: did_services,
        },
        {
          vname: "init_free_list",
          type: "List ByStr20",
          value: init_free_list,
        },
        {
          vname: "init_tydra_free_list",
          type: "List ByStr20",
          value: init_tydra_free_list,
        },
        {
          vname: "init_token_uris",
          type: "Map String Map ByStr32 String",
          value: init_token_uris,
        },
        {
          vname: "init_tydras",
          type: "Map String Map String String",
          value: init_tydras,
        },
        {
          vname: "init_token_id_count",
          type: "Map String Uint256",
          value: init_token_id_count,
        },
        {
          vname: "init_balances",
          type: "Map String Map ByStr20 Uint256",
          value: init_balances,
        },
        {
          vname: "init_utility",
          type: "Map String Map String Uint128",
          value: init_utility,
        },
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "65000",
        gasPrice: "2000000000",
      });
      toast.info("You successfully deployed a new Init implementation.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployDollar(net: string, address: string) {
    try {
      const init_nft = "0x29eee3e10b6c4138fc2cabac8581df59a491c05c49d72d107f90dbb7af022e64" //tyronmapu.ssi
      const init_fund = "0x3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0" //token.ssi
      let init_tyron = "0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9";

      if (net === "testnet") {
        init_tyron = "0xec194d20eab90cfab70ead073d742830d3d2a91b";
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
(* dollar.ssi DApp v1
Self-Sovereign Identity Dollar (Fungible Decentralised Token)
Tyron Self-Sovereign Identity (SSI) Protocol
Copyright Tyron Mapu Community Interest Company, Tyron SSI DAO 2023. All rights reserved.
You acknowledge and agree that Tyron Mapu Community Interest Company (Tyron SSI) own all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this repository (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this repository.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of Tyron SSI; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by Tyron SSI in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of Tyron SSI or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*)

scilla_version 0

(***************************************************)
(*               Associated library                *)
(***************************************************)

import BoolUtils IntUtils

library Dollar
  type Error =
    | CodeWrongSender
    | CodeDidIsNull
    | CodeWrongStatus
    | CodeIsNull
    | CodeSameValue
    | CodeIsInsufficient

  let true = True
  let false = False
  let zero = Uint128 0
  let one = Uint128 1
  let zero_addr = 0x0000000000000000000000000000000000000000
  let zero_hash = 0x0000000000000000000000000000000000000000000000000000000000000000

  let option_value = tfun 'A => fun(default: 'A) => fun(input: Option 'A) =>
    match input with
    | Some v => v
    | None => default
    end
  let option_uint128_value = let f = @option_value Uint128 in f zero
  let option_bystr20_value = let f = @option_value ByStr20 in f zero_addr

  let string_is_not_empty: String -> Bool =
    fun(s: String ) =>
      let zero = Uint32 0 in
      let s_length = builtin strlen s in
      let is_empty = builtin eq s_length zero in
      negb is_empty

  let one_msg = fun(msg: Message) => let nil_msg = Nil{Message} in Cons{Message} msg nil_msg

  let two_msgs = fun(msg1: Message) => fun(msg2: Message) =>
    let msgs_tmp = one_msg msg2 in Cons{Message} msg1 msgs_tmp

  let make_error = fun (error: Error) => fun (version: String) => fun (code: Int32) =>
    let exception = match error with
    | CodeWrongSender    => "WrongSender"
    | CodeDidIsNull      => "DidIsNull"
    | CodeWrongStatus    => "WrongStatus"
    | CodeIsNull         => "ZeroValueOrNull"
    | CodeSameValue      => "SameValue"
    | CodeIsInsufficient => "InsufficientAmount"
    end in { _exception: exception; contractVersion: version; errorCode: code }

contract Dollar(
  contract_owner: ByStr20,
  init_nft: ByStr32,
  init: ByStr20 with contract field dApp: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field dns: Map String ByStr20,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20,
      field services: Map String ByStr20 end end end,
  name: String,
  symbol: String,
  decimals: Uint32,
  init_fund: String, (* @review move to library *)
  init_supply: Uint128,
  init_balances: Map ByStr20 Uint128
  )
  with (* Contract constraints *)
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
  
(***************************************************)
(*               Mutable parameters                *)
(***************************************************)

  field nft_domain: ByStr32 = init_nft
  field pending_domain: ByStr32 = zero_hash
  
  field pauser: ByStr32 = init_nft
  field is_paused: Bool = False

  field total_supply: Uint128 = init_supply
  field balances: Map ByStr20 Uint128 = init_balances
  field allowances: Map ByStr20 Map ByStr20 Uint128 = Emp ByStr20 Map ByStr20 Uint128
  field minters: Map ByStr20 Bool = let emp_map = Emp ByStr20 Bool in
    builtin put emp_map contract_owner true

  (* DID Services *)
  field services: Map String ByStr20 = Emp String ByStr20
  field profit_fund: String = init_fund

  (* The block number when the last transition occurred *)
  field ledger_time: BNum = BNum 0
  
  (* A monotonically increasing number representing the amount of transitions that have taken place *)
  field tx_number: Uint128 = zero

  (* The smart contract @version *)
  field version: String = "DollarDApp_1.2.0"

(***************************************************)
(*               Contract procedures               *)
(***************************************************)

(* Emits an error & cancels the transaction.
     @param err: The Error data type.
     @param code: A signed integer type of 32 bits. *)
procedure ThrowError(err: Error, code: Int32)
  ver <- version; e = make_error err ver code; throw e
end

(* Verifies that the contract is active (unpaused). *) 
procedure RequireNotPaused()
  paused <- is_paused; match paused with
    | False => | True => err = CodeWrongStatus; code = Int32 -1; ThrowError err code
    end
end

(* Verifies the origin of the call.
   It must match the input address.
     @param addr: A 20-byte string. *)
procedure VerifyOrigin(addr: ByStr20)
  verified = builtin eq _origin addr; match verified with
    | True => | False => err = CodeWrongSender; code = Int32 -2; ThrowError err code
    end
end

(* Verifies that the transaction comes from the contract owner.
     @param ssi_init: A 20-byte string representing the address of the SSI INIT DApp. *)
procedure VerifyOwner(
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20 end end
  )
  id <- nft_domain; domain_ = builtin to_string id;
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -3; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller
    end
end

procedure ThrowIfZero(val: Uint128)
  is_null = builtin eq zero val; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -4; ThrowError err code
    end
end

procedure ThrowIfNullAddr(addr: ByStr20)
  is_null = builtin eq addr zero_addr; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -5; ThrowError err code
    end
end

procedure ThrowIfNullHash(input: ByStr32)
  is_null = builtin eq input zero_hash; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -6; ThrowError err code
    end
end

procedure ThrowIfNullString(input: String)
  not_null = string_is_not_empty input; match not_null with
    | True => | False => err = CodeIsNull; code = Int32 -7; ThrowError err code
    end
end

procedure Donate(
  ssi_init: ByStr20 with contract field dns: Map String ByStr20 end,
  donate: Uint128
  )
  is_zero = builtin eq zero donate; match is_zero with
    | True => | False =>
      donateDomain = "donate"; get_addr <-& ssi_init.dns[donateDomain];
      addr = option_bystr20_value get_addr; ThrowIfNullAddr addr;
      accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donate } in one_msg m; send msg
    end
end

procedure TyronCommunityFund(
  ssi_init: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20 end end,
  id: String
  )
  fund <- profit_fund;
  txID = builtin concat fund id;
  init_did <-& ssi_init.implementation; ver <- version;
  get_fee <-& init_did.utility[ver][txID]; fee = option_uint128_value get_fee;
  is_zero = builtin eq fee zero; match is_zero with
    | True => | False =>
      get_did <-& ssi_init.did_dns[fund]; match get_did with
        | Some did_ => msg = let m = { _tag: "AddFunds"; _recipient: did_; _amount: fee } in one_msg m; send msg
        | None => err = CodeDidIsNull; code = Int32 -8; ThrowError err code
        end
    end
end

procedure RequireContractOwner(
  donate: Uint128,
  tx: String
  )
  ssi_init <-& init.dApp; VerifyOwner ssi_init;
  Donate ssi_init donate; TyronCommunityFund ssi_init tx
end

procedure Timestamp()
  current_block <- &BLOCKNUMBER; ledger_time := current_block;
  latest_tx_number <- tx_number; new_tx_number = builtin add latest_tx_number one;
  tx_number := new_tx_number
end

procedure ThrowIfSameDomain(
  a: ByStr32,
  b: ByStr32
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -8; ThrowError err code
    end
end

(* Verifies that the given addresses are not equal.
     @params a & b: 20-byte strings. *) 
procedure ThrowIfSameAddr(
  a: ByStr20,
  b: ByStr20
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -10; ThrowError err code
    end
end

procedure IsSender(id: String)
  ThrowIfNullString id; ssi_init <-& init.dApp;

  get_addr <-& ssi_init.dns[id]; match get_addr with
    | None => err = CodeIsNull; code = Int32 -11; ThrowError err code
    | Some addr =>
      is_sender = builtin eq addr _sender; match is_sender with
        | True =>
        | False =>
          err = CodeWrongSender; code = Int32 -12; ThrowError err code
        end
    end
end

procedure IsSufficient(
  value: Uint128,
  amount: Uint128
  )
  is_sufficient = uint128_ge value amount; match is_sufficient with
    | True => | False => err = CodeIsInsufficient; code = Int32 -13; ThrowError err code
    end
end

procedure UpdateMinter_(addr: ByStr20)
  ThrowIfNullAddr addr;

  is_minter <- exists minters[addr]; match is_minter with
    | True => delete minters[addr]
    | False => minters[addr] := true
    end
end

procedure IsMinter()
  is_minter <- exists minters[_sender]; match is_minter with
    | True => | False =>
      err = CodeWrongSender; code = Int32 -14; ThrowError err code
    end
end

procedure Mint_(
  beneficiary: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr beneficiary; ThrowIfSameAddr beneficiary _this_address;
  ThrowIfZero amount;

  get_balance <- balances[beneficiary]; balance = option_uint128_value get_balance;
  new_balance = builtin add balance amount;
  balances[beneficiary] := new_balance;

  supply <- total_supply;
  new_supply = builtin add supply amount;
  total_supply := new_supply
end

procedure Burn_(
  originator: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr originator; ThrowIfSameAddr originator _this_address;
  ThrowIfZero amount;

  get_balance <- balances[originator]; balance = option_uint128_value get_balance;
  IsSufficient balance amount;
  new_balance = builtin sub balance amount;
  balances[originator] := new_balance;

  supply <- total_supply;
  new_supply = builtin sub supply amount;
  total_supply := new_supply
end

procedure TransferIfSufficientBalance(
  originator: ByStr20,
  beneficiary: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr originator; ThrowIfNullAddr beneficiary;
  ThrowIfSameAddr originator beneficiary; ThrowIfSameAddr beneficiary _this_address;
  ThrowIfZero amount;
  
  get_balance <- balances[originator]; balance = option_uint128_value get_balance;
  IsSufficient balance amount;
  new_balance = builtin sub balance amount;
  balances[originator] := new_balance;

  get_bal <- balances[beneficiary]; bal = option_uint128_value get_bal;
  new_bal = builtin add bal amount;
  balances[beneficiary] := new_bal
end

(***************************************************)
(*              Contract transitions               *)
(***************************************************)

transition UpdateDomain(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfNullHash domain;
  tag = "UpdateDomain"; RequireContractOwner donate tag;
  id <- nft_domain; ThrowIfSameDomain id domain;
  ssi_init <-& init.dApp; domain_ = builtin to_string domain;

  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 1; ThrowError err code
    | Some did_ => pending_domain := domain
    end;
  Timestamp
end

transition AcceptPendingDomain()
  RequireNotPaused; ssi_init <-& init.dApp;
  domain <- pending_domain; domain_ = builtin to_string domain;
  
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 2; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller;
      nft_domain := domain; pending_domain := zero_hash
    end;
  Timestamp
end

transition UpdatePauser(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused;
  tag = "UpdatePauser"; RequireContractOwner donate tag;
  current_pauser <- pauser; ThrowIfSameDomain current_pauser domain;
  
  pauser := domain;
  ver <- version; e = { _eventname: "SSIDApp_PauserUpdated"; version: ver;
    newPauser: domain }; event e;
  Timestamp
end

(* Pauses the whole dApp *)
transition Pause()
  RequireNotPaused;
  
  domain <- pauser; id = builtin to_string domain; IsSender id;
  
  is_paused := true;
  ver <- version; e = { _eventname: "SSIDApp_Paused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

(* Unpauses the whole dApp *)
transition Unpause()
  paused <- is_paused; match paused with
    | True => | False => (* Not Paused Error *)
      err = CodeWrongStatus; code = Int32 3; ThrowError err code
    end;
      
  domain <- pauser; id = builtin to_string domain; IsSender id;
  
  is_paused := false;
  ver <- version; e = { _eventname: "SSIDApp_Unpaused";
    version: ver;
    pauser: _sender }; event e;
  Timestamp
end

transition UpdateProfitFund(
  val: String,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfNullString val;
  tag = "UpdateProfitFund"; RequireContractOwner donate tag;
  
  profit_fund := val;
  ver <- version; e = { _eventname: "ProfitFundUpdated"; version: ver;
    newValue: val }; event e;
  Timestamp
end

(* Updates the current minters. *)
transition UpdateMinters(
  addresses: List ByStr20,
  donate: Uint128
  )
  RequireNotPaused;
  tag = "UpdateMinters"; RequireContractOwner donate tag;

  forall addresses UpdateMinter_;
  ver <- version; e = { _eventname: "SSIDApp_MintersUpdated";
    version: ver;
    minters: addresses }; event e;
  (* Prevent accepting a contract that does not support this callback *)
  msg = let m = { _tag: "UpdateMintersCallBack"; _recipient: _sender; _amount: zero;
    minters: addresses } in one_msg m; send msg;
  Timestamp
end

(* Mints new dollars. The caller (_sender) must be a minter.
     @param recipient: Address of the beneficiary whose balance increases.
     @param amount: Number of dollars minted. *)
transition Mint(
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; IsMinter;
  
  Mint_ recipient amount;
  ver <- version; e = { _eventname: "SSIDApp_Minted"; version: ver;
    minter: _sender;
    recipient: recipient;
    amount: amount }; event e;
  
  (* Prevent using contracts that do not support this transition *)
  msg_to_beneficiary = { _tag: "RecipientAcceptMint"; _recipient: recipient; _amount: zero; 
    minter: _sender;
    recipient: recipient;
    amount: amount };
  msg_to_sender = { _tag: "MintSuccessCallBack"; _recipient: _sender; _amount: zero; 
    minter: _sender;
    recipient: recipient;
    amount: amount };
  msgs = two_msgs msg_to_beneficiary msg_to_sender; send msgs;
  Timestamp
end

(* Burns existing dollars. The caller (_sender) must be a minter.
     @param burn_account: Address of the originator whose balance decreases.
     @param amount: Number of dollars burned. *)
transition Burn(
  burn_account: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; IsMinter;
  
  Burn_ burn_account amount;
  ver <- version; e = { _eventname: "SSIDApp_Burned"; version: ver;
    burner: _sender;
    burnAccount: burn_account;
    amount: amount }; event e;

  (* Prevent accepting a contract that does not support this callback *)
  msg = let m = { _tag: "BurnSuccessCallBack"; _recipient: _sender; _amount: zero;
    burner: _sender;
    burn_account: burn_account;
    amount: amount } in one_msg m; send msg;
  Timestamp
end

(* Moves an amount of dollars from the caller to the beneficiary.
   The caller (_sender) must be the token owner.
   Balance of _sender (originator) decreases & balance of the beneficiary increases.
     @param to: Address of the beneficiary.
     @param amount: Number of dollars sent. *)
transition Transfer(
  to: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;

  TransferIfSufficientBalance _sender to amount;
  ver <- version; e = { _eventname: "TransferSuccess"; version: ver;
    sender: _sender;
    recipient: to;
    amount: amount }; event e;
  
  (* Prevent using contracts that do not support Transfer of tokens *)
  msg_to_beneficiary = { _tag: "RecipientAcceptTransfer"; _recipient: to; _amount: zero;
    sender: _sender;
    recipient: to;
    amount: amount
  };
  msg_to_originator = { _tag: "TransferSuccessCallBack"; _recipient: _sender; _amount: zero;
    sender: _sender;
    recipient: to;
    amount: amount
  };
  msgs = two_msgs msg_to_beneficiary msg_to_originator; send msgs;
  Timestamp
end

(* Increases the allowance of the spender over the dollars of the caller.
   The caller (_sender) must be the token owner.
     @param spender: Address of the approved spender.
     @param amount: Number of dollars increased as allowance for the spender. *)
transition IncreaseAllowance(
  spender: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  ThrowIfNullAddr spender;
  ThrowIfSameAddr spender _sender; ThrowIfSameAddr spender _this_address;

  get_allowance <- allowances[_sender][spender]; allowance = option_uint128_value get_allowance;
  new_allowance = builtin add allowance amount; allowances[_sender][spender] := new_allowance;
  
  ver <- version; e = { _eventname: "SSIDApp_IncreasedAllowance"; version: ver;
    token_owner: _sender;
    spender: spender;
    new_allowance: new_allowance }; event e;
  Timestamp
end

(* Decreases the allowance of the spender over the dollars of the caller.
   The caller (_sender) must be the token owner.
     @param spender: Address of the approved spender.
     @param amount: Number of LP tokens decreased for the spender allowance. *)
transition DecreaseAllowance(
  spender: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  ThrowIfNullAddr spender;
  ThrowIfSameAddr spender _sender; ThrowIfSameAddr spender _this_address;

  get_allowance <- allowances[_sender][spender]; allowance = option_uint128_value get_allowance;
  is_valid = uint128_le amount allowance; match is_valid with
    | True =>
      new_allowance = builtin sub allowance amount;
      
      allowances[_sender][spender] := new_allowance;
      ver <- version; e = { _eventname: "SSIDApp_DecreasedAllowance"; version: ver;
        token_owner: _sender;
        spender: spender;
        new_allowance: new_allowance }; event e
    | False =>
      (* Interpret it as a request to delete the spender data *)
      delete allowances[_sender][spender]
    end;
  Timestamp
end

(* Moves a given amount of dollars from one address to another using the allowance mechanism.
   Caller must be an approved spender & their allowance decreases.
   Balance of the token owner (originator) decreases & balance of the recipient (beneficiary) increases.
     @param from: Address of the originator.
     @param to: Address of the beneficiary.
     @param amount: Number of dollars transferred. *)
transition TransferFrom(
  from: ByStr20,
  to: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;

  get_allowance <- allowances[from][_sender]; allowance = option_uint128_value get_allowance;
  IsSufficient allowance amount;
  
  TransferIfSufficientBalance from to amount;
  ver <- version; e = { _eventname: "SSIDApp_TransferFromSuccess"; version: ver;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount }; event e;
  new_allowance = builtin sub allowance amount; allowances[from][_sender] := new_allowance;
  
  (* Prevent using contracts that do not support TransferFrom of dollars *)
  msg_to_spender = { _tag: "TransferFromSuccessCallBack"; _recipient: _sender; _amount: zero;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount
  };
  msg_to_beneficiary = { _tag: "RecipientAcceptTransferFrom"; _recipient: to; _amount: zero;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount
  }; msgs = two_msgs msg_to_spender msg_to_beneficiary; send msgs;
  Timestamp
end
        `;

      const empty = []
      const contract_init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "contract_owner",
          type: "ByStr20",
          value: `${address}`,
        },
        {
          vname: "init_nft",
          type: "ByStr32",
          value: `${init_nft}`,
        },
        {
          vname: "init",
          type: "ByStr20",
          value: `${init_tyron}`,
        },
        {
          vname: "name", //@xalkan_dollars
          type: "String",
          value: "Self-Sovereign Identity Dollar",
        },
        {
          vname: "symbol",
          type: "String",
          value: "S$I",//@xalkan_dollars
        },
        {
          vname: "decimals",
          type: "Uint32",
          value: "18",//@xalkan_dollars
        },
        {
          vname: "init_fund",
          type: "String",
          value: `${init_fund}`,//@xalkan_dollars
        },
        {
          vname: "init_supply",
          type: "Uint128",
          value: "0",//@xalkan_dollars
        },
        {
          vname: "init_balances",
          type: "Map ByStr20 Uint128",
          value: empty,//@xalkan_dollars
        },
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "100000",
        gasPrice: "2000000000",
      });
      toast.info("Contract successfully deployed.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployTyron(net: string, address: string) {
    try {
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;

      const init_nft = "0x29eee3e10b6c4138fc2cabac8581df59a491c05c49d72d107f90dbb7af022e64" //tyronmapu.ssi
      const init_fund = "0x3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0" //token.ssi
      let init_tyron = "0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9";
      let previous_version = "0x7c8e77441667ce1e223c1a5bd658287ab1ebd5cc";

      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
        init_tyron = "0xec194d20eab90cfab70ead073d742830d3d2a91b";
        previous_version = "0x38e7670000523e81eebac1f0912b280f968e5fb0"
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
(* dollar.ssi DApp v1
Self-Sovereign Identity Dollar (Fungible Decentralised Token)
Tyron Self-Sovereign Identity (SSI) Protocol
Copyright Tyron Mapu Community Interest Company, Tyron SSI DAO 2023. All rights reserved.
You acknowledge and agree that Tyron Mapu Community Interest Company (Tyron SSI) own all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this repository (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this repository.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of Tyron SSI; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by Tyron SSI in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of Tyron SSI or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*)

scilla_version 0

(***************************************************)
(*               Associated library                *)
(***************************************************)

import BoolUtils IntUtils

library Dollar
  type Error =
    | CodeWrongSender
    | CodeDidIsNull
    | CodeWrongStatus
    | CodeIsNull
    | CodeSameValue
    | CodeIsInsufficient

  let true = True
  let false = False
  let zero = Uint128 0
  let one = Uint128 1
  let zero_addr = 0x0000000000000000000000000000000000000000
  let zero_hash = 0x0000000000000000000000000000000000000000000000000000000000000000

  let option_value = tfun 'A => fun(default: 'A) => fun(input: Option 'A) =>
    match input with
    | Some v => v
    | None => default
    end
  let option_uint128_value = let f = @option_value Uint128 in f zero
  let option_bystr20_value = let f = @option_value ByStr20 in f zero_addr

  let string_is_not_empty: String -> Bool =
    fun(s: String ) =>
      let zero = Uint32 0 in
      let s_length = builtin strlen s in
      let is_empty = builtin eq s_length zero in
      negb is_empty

  let one_msg = fun(msg: Message) => let nil_msg = Nil{Message} in Cons{Message} msg nil_msg

  let two_msgs = fun(msg1: Message) => fun(msg2: Message) =>
    let msgs_tmp = one_msg msg2 in Cons{Message} msg1 msgs_tmp

  let make_error = fun (error: Error) => fun (version: String) => fun (code: Int32) =>
    let exception = match error with
    | CodeWrongSender    => "WrongSender"
    | CodeDidIsNull      => "DidIsNull"
    | CodeWrongStatus    => "WrongStatus"
    | CodeIsNull         => "ZeroValueOrNull"
    | CodeSameValue      => "SameValue"
    | CodeIsInsufficient => "InsufficientAmount"
    end in { _exception: exception; contractVersion: version; errorCode: code }

contract Dollar(
  contract_owner: ByStr20,
  init_nft: ByStr32,
  init: ByStr20 with contract field dApp: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field dns: Map String ByStr20,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20,
      field services: Map String ByStr20 end end end,
  name: String,
  symbol: String,
  decimals: Uint32,
  init_fund: String, (* @review move to library *)
  init_supply: Uint128,
  init_balances: Map ByStr20 Uint128
  )
  with (* Contract constraints *)
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
  
(***************************************************)
(*               Mutable parameters                *)
(***************************************************)

  field nft_domain: ByStr32 = init_nft
  field pending_domain: ByStr32 = zero_hash
  
  field pauser: ByStr32 = init_nft
  field is_paused: Bool = False

  field total_supply: Uint128 = init_supply
  field balances: Map ByStr20 Uint128 = init_balances
  field allowances: Map ByStr20 Map ByStr20 Uint128 = Emp ByStr20 Map ByStr20 Uint128
  field minters: Map ByStr20 Bool = let emp_map = Emp ByStr20 Bool in
    builtin put emp_map contract_owner true

  (* DID Services *)
  field services: Map String ByStr20 = Emp String ByStr20
  field profit_fund: String = init_fund

  (* The block number when the last transition occurred *)
  field ledger_time: BNum = BNum 0
  
  (* A monotonically increasing number representing the amount of transitions that have taken place *)
  field tx_number: Uint128 = zero

  (* The smart contract @version *)
  field version: String = "DollarDApp_1.2.0"

(***************************************************)
(*               Contract procedures               *)
(***************************************************)

(* Emits an error & cancels the transaction.
     @param err: The Error data type.
     @param code: A signed integer type of 32 bits. *)
procedure ThrowError(err: Error, code: Int32)
  ver <- version; e = make_error err ver code; throw e
end

(* Verifies that the contract is active (unpaused). *) 
procedure RequireNotPaused()
  paused <- is_paused; match paused with
    | False => | True => err = CodeWrongStatus; code = Int32 -1; ThrowError err code
    end
end

(* Verifies the origin of the call.
   It must match the input address.
     @param addr: A 20-byte string. *)
procedure VerifyOrigin(addr: ByStr20)
  verified = builtin eq _origin addr; match verified with
    | True => | False => err = CodeWrongSender; code = Int32 -2; ThrowError err code
    end
end

(* Verifies that the transaction comes from the contract owner.
     @param ssi_init: A 20-byte string representing the address of the SSI INIT DApp. *)
procedure VerifyOwner(
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20 end end
  )
  id <- nft_domain; domain_ = builtin to_string id;
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -3; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller
    end
end

procedure ThrowIfZero(val: Uint128)
  is_null = builtin eq zero val; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -4; ThrowError err code
    end
end

procedure ThrowIfNullAddr(addr: ByStr20)
  is_null = builtin eq addr zero_addr; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -5; ThrowError err code
    end
end

procedure ThrowIfNullHash(input: ByStr32)
  is_null = builtin eq input zero_hash; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -6; ThrowError err code
    end
end

procedure ThrowIfNullString(input: String)
  not_null = string_is_not_empty input; match not_null with
    | True => | False => err = CodeIsNull; code = Int32 -7; ThrowError err code
    end
end

procedure Donate(
  ssi_init: ByStr20 with contract field dns: Map String ByStr20 end,
  donate: Uint128
  )
  is_zero = builtin eq zero donate; match is_zero with
    | True => | False =>
      donateDomain = "donate"; get_addr <-& ssi_init.dns[donateDomain];
      addr = option_bystr20_value get_addr; ThrowIfNullAddr addr;
      accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donate } in one_msg m; send msg
    end
end

procedure TyronCommunityFund(
  ssi_init: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20 end end,
  id: String
  )
  fund <- profit_fund;
  txID = builtin concat fund id;
  init_did <-& ssi_init.implementation; ver <- version;
  get_fee <-& init_did.utility[ver][txID]; fee = option_uint128_value get_fee;
  is_zero = builtin eq fee zero; match is_zero with
    | True => | False =>
      get_did <-& ssi_init.did_dns[fund]; match get_did with
        | Some did_ => msg = let m = { _tag: "AddFunds"; _recipient: did_; _amount: fee } in one_msg m; send msg
        | None => err = CodeDidIsNull; code = Int32 -8; ThrowError err code
        end
    end
end

procedure RequireContractOwner(
  donate: Uint128,
  tx: String
  )
  ssi_init <-& init.dApp; VerifyOwner ssi_init;
  Donate ssi_init donate; TyronCommunityFund ssi_init tx
end

procedure Timestamp()
  current_block <- &BLOCKNUMBER; ledger_time := current_block;
  latest_tx_number <- tx_number; new_tx_number = builtin add latest_tx_number one;
  tx_number := new_tx_number
end

procedure ThrowIfSameDomain(
  a: ByStr32,
  b: ByStr32
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -8; ThrowError err code
    end
end

(* Verifies that the given addresses are not equal.
     @params a & b: 20-byte strings. *) 
procedure ThrowIfSameAddr(
  a: ByStr20,
  b: ByStr20
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -10; ThrowError err code
    end
end

procedure IsSender(id: String)
  ThrowIfNullString id; ssi_init <-& init.dApp;

  get_addr <-& ssi_init.dns[id]; match get_addr with
    | None => err = CodeIsNull; code = Int32 -11; ThrowError err code
    | Some addr =>
      is_sender = builtin eq addr _sender; match is_sender with
        | True =>
        | False =>
          err = CodeWrongSender; code = Int32 -12; ThrowError err code
        end
    end
end

procedure IsSufficient(
  value: Uint128,
  amount: Uint128
  )
  is_sufficient = uint128_ge value amount; match is_sufficient with
    | True => | False => err = CodeIsInsufficient; code = Int32 -13; ThrowError err code
    end
end

procedure UpdateMinter_(addr: ByStr20)
  ThrowIfNullAddr addr;

  is_minter <- exists minters[addr]; match is_minter with
    | True => delete minters[addr]
    | False => minters[addr] := true
    end
end

procedure IsMinter()
  is_minter <- exists minters[_sender]; match is_minter with
    | True => | False =>
      err = CodeWrongSender; code = Int32 -14; ThrowError err code
    end
end

procedure Mint_(
  beneficiary: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr beneficiary; ThrowIfSameAddr beneficiary _this_address;
  ThrowIfZero amount;

  get_balance <- balances[beneficiary]; balance = option_uint128_value get_balance;
  new_balance = builtin add balance amount;
  balances[beneficiary] := new_balance;

  supply <- total_supply;
  new_supply = builtin add supply amount;
  total_supply := new_supply
end

procedure Burn_(
  originator: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr originator; ThrowIfSameAddr originator _this_address;
  ThrowIfZero amount;

  get_balance <- balances[originator]; balance = option_uint128_value get_balance;
  IsSufficient balance amount;
  new_balance = builtin sub balance amount;
  balances[originator] := new_balance;

  supply <- total_supply;
  new_supply = builtin sub supply amount;
  total_supply := new_supply
end

procedure TransferIfSufficientBalance(
  originator: ByStr20,
  beneficiary: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr originator; ThrowIfNullAddr beneficiary;
  ThrowIfSameAddr originator beneficiary; ThrowIfSameAddr beneficiary _this_address;
  ThrowIfZero amount;
  
  get_balance <- balances[originator]; balance = option_uint128_value get_balance;
  IsSufficient balance amount;
  new_balance = builtin sub balance amount;
  balances[originator] := new_balance;

  get_bal <- balances[beneficiary]; bal = option_uint128_value get_bal;
  new_bal = builtin add bal amount;
  balances[beneficiary] := new_bal
end

(***************************************************)
(*              Contract transitions               *)
(***************************************************)

transition UpdateDomain(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfNullHash domain;
  tag = "UpdateDomain"; RequireContractOwner donate tag;
  id <- nft_domain; ThrowIfSameDomain id domain;
  ssi_init <-& init.dApp; domain_ = builtin to_string domain;

  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 1; ThrowError err code
    | Some did_ => pending_domain := domain
    end;
  Timestamp
end

transition AcceptPendingDomain()
  RequireNotPaused; ssi_init <-& init.dApp;
  domain <- pending_domain; domain_ = builtin to_string domain;
  
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 2; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller;
      nft_domain := domain; pending_domain := zero_hash
    end;
  Timestamp
end

transition UpdatePauser(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused;
  tag = "UpdatePauser"; RequireContractOwner donate tag;
  current_pauser <- pauser; ThrowIfSameDomain current_pauser domain;
  
  pauser := domain;
  ver <- version; e = { _eventname: "SSIDApp_PauserUpdated"; version: ver;
    newPauser: domain }; event e;
  Timestamp
end

(* Pauses the whole dApp *)
transition Pause()
  RequireNotPaused;
  
  domain <- pauser; id = builtin to_string domain; IsSender id;
  
  is_paused := true;
  ver <- version; e = { _eventname: "SSIDApp_Paused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

(* Unpauses the whole dApp *)
transition Unpause()
  paused <- is_paused; match paused with
    | True => | False => (* Not Paused Error *)
      err = CodeWrongStatus; code = Int32 3; ThrowError err code
    end;
      
  domain <- pauser; id = builtin to_string domain; IsSender id;
  
  is_paused := false;
  ver <- version; e = { _eventname: "SSIDApp_Unpaused";
    version: ver;
    pauser: _sender }; event e;
  Timestamp
end

transition UpdateProfitFund(
  val: String,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfNullString val;
  tag = "UpdateProfitFund"; RequireContractOwner donate tag;
  
  profit_fund := val;
  ver <- version; e = { _eventname: "ProfitFundUpdated"; version: ver;
    newValue: val }; event e;
  Timestamp
end

(* Updates the current minters. *)
transition UpdateMinters(
  addresses: List ByStr20,
  donate: Uint128
  )
  RequireNotPaused;
  tag = "UpdateMinters"; RequireContractOwner donate tag;

  forall addresses UpdateMinter_;
  ver <- version; e = { _eventname: "SSIDApp_MintersUpdated";
    version: ver;
    minters: addresses }; event e;
  (* Prevent accepting a contract that does not support this callback *)
  msg = let m = { _tag: "UpdateMintersCallBack"; _recipient: _sender; _amount: zero;
    minters: addresses } in one_msg m; send msg;
  Timestamp
end

(* Mints new dollars. The caller (_sender) must be a minter.
     @param recipient: Address of the beneficiary whose balance increases.
     @param amount: Number of dollars minted. *)
transition Mint(
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; IsMinter;
  
  Mint_ recipient amount;
  ver <- version; e = { _eventname: "SSIDApp_Minted"; version: ver;
    minter: _sender;
    recipient: recipient;
    amount: amount }; event e;
  
  (* Prevent using contracts that do not support this transition *)
  msg_to_beneficiary = { _tag: "RecipientAcceptMint"; _recipient: recipient; _amount: zero; 
    minter: _sender;
    recipient: recipient;
    amount: amount };
  msg_to_sender = { _tag: "MintSuccessCallBack"; _recipient: _sender; _amount: zero; 
    minter: _sender;
    recipient: recipient;
    amount: amount };
  msgs = two_msgs msg_to_beneficiary msg_to_sender; send msgs;
  Timestamp
end

(* Burns existing dollars. The caller (_sender) must be a minter.
     @param burn_account: Address of the originator whose balance decreases.
     @param amount: Number of dollars burned. *)
transition Burn(
  burn_account: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; IsMinter;
  
  Burn_ burn_account amount;
  ver <- version; e = { _eventname: "SSIDApp_Burned"; version: ver;
    burner: _sender;
    burnAccount: burn_account;
    amount: amount }; event e;

  (* Prevent accepting a contract that does not support this callback *)
  msg = let m = { _tag: "BurnSuccessCallBack"; _recipient: _sender; _amount: zero;
    burner: _sender;
    burn_account: burn_account;
    amount: amount } in one_msg m; send msg;
  Timestamp
end

(* Moves an amount of dollars from the caller to the beneficiary.
   The caller (_sender) must be the token owner.
   Balance of _sender (originator) decreases & balance of the beneficiary increases.
     @param to: Address of the beneficiary.
     @param amount: Number of dollars sent. *)
transition Transfer(
  to: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;

  TransferIfSufficientBalance _sender to amount;
  ver <- version; e = { _eventname: "TransferSuccess"; version: ver;
    sender: _sender;
    recipient: to;
    amount: amount }; event e;
  
  (* Prevent using contracts that do not support Transfer of tokens *)
  msg_to_beneficiary = { _tag: "RecipientAcceptTransfer"; _recipient: to; _amount: zero;
    sender: _sender;
    recipient: to;
    amount: amount
  };
  msg_to_originator = { _tag: "TransferSuccessCallBack"; _recipient: _sender; _amount: zero;
    sender: _sender;
    recipient: to;
    amount: amount
  };
  msgs = two_msgs msg_to_beneficiary msg_to_originator; send msgs;
  Timestamp
end

(* Increases the allowance of the spender over the dollars of the caller.
   The caller (_sender) must be the token owner.
     @param spender: Address of the approved spender.
     @param amount: Number of dollars increased as allowance for the spender. *)
transition IncreaseAllowance(
  spender: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  ThrowIfNullAddr spender;
  ThrowIfSameAddr spender _sender; ThrowIfSameAddr spender _this_address;

  get_allowance <- allowances[_sender][spender]; allowance = option_uint128_value get_allowance;
  new_allowance = builtin add allowance amount; allowances[_sender][spender] := new_allowance;
  
  ver <- version; e = { _eventname: "SSIDApp_IncreasedAllowance"; version: ver;
    token_owner: _sender;
    spender: spender;
    new_allowance: new_allowance }; event e;
  Timestamp
end

(* Decreases the allowance of the spender over the dollars of the caller.
   The caller (_sender) must be the token owner.
     @param spender: Address of the approved spender.
     @param amount: Number of LP tokens decreased for the spender allowance. *)
transition DecreaseAllowance(
  spender: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  ThrowIfNullAddr spender;
  ThrowIfSameAddr spender _sender; ThrowIfSameAddr spender _this_address;

  get_allowance <- allowances[_sender][spender]; allowance = option_uint128_value get_allowance;
  is_valid = uint128_le amount allowance; match is_valid with
    | True =>
      new_allowance = builtin sub allowance amount;
      
      allowances[_sender][spender] := new_allowance;
      ver <- version; e = { _eventname: "SSIDApp_DecreasedAllowance"; version: ver;
        token_owner: _sender;
        spender: spender;
        new_allowance: new_allowance }; event e
    | False =>
      (* Interpret it as a request to delete the spender data *)
      delete allowances[_sender][spender]
    end;
  Timestamp
end

(* Moves a given amount of dollars from one address to another using the allowance mechanism.
   Caller must be an approved spender & their allowance decreases.
   Balance of the token owner (originator) decreases & balance of the recipient (beneficiary) increases.
     @param from: Address of the originator.
     @param to: Address of the beneficiary.
     @param amount: Number of dollars transferred. *)
transition TransferFrom(
  from: ByStr20,
  to: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;

  get_allowance <- allowances[from][_sender]; allowance = option_uint128_value get_allowance;
  IsSufficient allowance amount;
  
  TransferIfSufficientBalance from to amount;
  ver <- version; e = { _eventname: "SSIDApp_TransferFromSuccess"; version: ver;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount }; event e;
  new_allowance = builtin sub allowance amount; allowances[from][_sender] := new_allowance;
  
  (* Prevent using contracts that do not support TransferFrom of dollars *)
  msg_to_spender = { _tag: "TransferFromSuccessCallBack"; _recipient: _sender; _amount: zero;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount
  };
  msg_to_beneficiary = { _tag: "RecipientAcceptTransferFrom"; _recipient: to; _amount: zero;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount
  }; msgs = two_msgs msg_to_spender msg_to_beneficiary; send msgs;
  Timestamp
end
        `;

      const init = new tyron.ZilliqaInit.default(network);
      const get_state = await init.API.blockchain.getSmartContractSubState(
        previous_version,
        "balances"
      );
      const previous_balances = Object.entries(get_state.result.balances);

      let empty: Array<{ key: string; val: string }> = [];
      for (let i = 0; i < previous_balances.length; i += 1) {
        empty.push(
          {
            key: previous_balances[i][0],
            val: previous_balances[i][1] as string,
          }
        );
      }

      const contract_init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "contract_owner",
          type: "ByStr20",
          value: `${address}`,
        },
        {
          vname: "init_nft",
          type: "ByStr32",
          value: `${init_nft}`,
        },
        {
          vname: "init",
          type: "ByStr20",
          value: `${init_tyron}`,
        },
        {
          vname: "name", //@xalkan_dollars
          type: "String",
          value: "Tyron Self-Sovereign Identity (SSI) Token",
        },
        {
          vname: "symbol",
          type: "String",
          value: "TYRON",//@xalkan_dollars
        },
        {
          vname: "decimals",
          type: "Uint32",
          value: "12",//@xalkan_dollars
        },
        {
          vname: "init_fund",
          type: "String",
          value: `${init_fund}`,//@xalkan_dollars
        },
        {
          vname: "init_supply",
          type: "Uint128",
          value: "10000000000000000000",//@xalkan_dollars
        },
        {
          vname: "init_balances",
          type: "Map ByStr20 Uint128",
          value: empty,//@xalkan_dollars
        },
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "100000",
        gasPrice: "2000000000",
      });
      toast.info("Contract successfully deployed.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployStablecoin(net: string) {
    try {
      let network = tyron.DidScheme.NetworkNamespace.Mainnet;
      let init_controller = "0xe2d15d86d7c3674f1aadf4f9d7d559f375b8b156"; //@xalkan
      //@xalkan UpdateImplementation

      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
        init_controller = "0xe2d15d86d7c3674f1aadf4f9d7d559f375b8b156";
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code = `
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
              `;
      const contract_init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "symbol",
          type: "String",
          value: "S$I",
        },
        {
          vname: "decimals",
          type: "Uint32",
          value: "12",
        },
        {
          vname: "init_supply",
          type: "Uint128",
          value: "0",
        },
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
        gasPrice: "2000000000",
      });
      toast.info("You successfully deployed a new token.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployDollarTransmuter(net: string, address: string) {
    try {
      const init_nft = "0x29eee3e10b6c4138fc2cabac8581df59a491c05c49d72d107f90dbb7af022e64" //tyronmapu.ssi
      const init_fund = "0x3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0" //token.ssi
      let init_tyron = "0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9";

      if (net === "testnet") {
        init_tyron = "0xec194d20eab90cfab70ead073d742830d3d2a91b";
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
(* transmuter.ssi DApp v0.3
Self-Sovereign Identity Dollar Transmuter
TTyron Self-Sovereign Identity (SSI) Protocol
Copyright Tyron Mapu Community Interest Company, Tyron SSI DAO 2023. All rights reserved.
You acknowledge and agree that Tyron Mapu Community Interest Company (Tyron SSI) own all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this repository (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this repository.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of Tyron SSI; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by Tyron SSI in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of Tyron SSI or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*)

scilla_version 0

(***************************************************)
(*               Associated library                *)
(***************************************************)

import BoolUtils IntUtils PairUtils

library Transmuter
  type Error =
    | CodeWrongSender
    | CodeDidIsNull
    | CodeWrongStatus
    | CodeIsNull
    | CodeSameValue
    | CodeNotValid

  let true = True
  let false = False
  let zero = Uint128 0
  let zero_256 = Uint256 0
  let zero_addr = 0x0000000000000000000000000000000000000000
  let zero_hash = 0x0000000000000000000000000000000000000000000000000000000000000000
  let zeroByStr33 = 0x000000000000000000000000000000000000000000000000000000000000000000
  let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
  let one = Uint128 1
  let one_256 = Uint256 1
  let fee_denom = Uint256 10000 (* Fee denominated in basis points: 1 b.p. = 0.01% *)
  let empty_string = ""
  let did = "did"
  let ssi_id = "s$i"
  let none_byStr20 = None{ ByStr20 with contract field did_domain_dns: Map String ByStr20 end }

  let option_value = tfun 'A => fun(default: 'A) => fun(input: Option 'A) =>
    match input with
    | Some v => v
    | None => default
    end
  let option_uint128_value = let f = @option_value Uint128 in f zero
  let option_bystr20_value = let f = @option_value ByStr20 in f zero_addr
  let option_bystr32_value = let f = @option_value ByStr32 in f zero_hash
  let option_bystr33_value = let f = @option_value ByStr33 in f zeroByStr33
  let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64
  let option_string_value = let f = @option_value String in f empty_string

  let grow: Uint128 -> Uint256 =
    fun(var : Uint128) =>
      let get_big = builtin to_uint256 var in match get_big with
        | Some big => big
        | None => builtin sub zero_256 one_256 (* @error throws an integer underflow - should never happen *)
        end

  let get_output: Uint128 -> Uint128 -> Uint128 -> Uint256 -> Uint128 =
    fun(input_amount: Uint128) => fun(input_reserve: Uint128) => fun(output_reserve: Uint128) => fun (after_fee: Uint256) =>
      let input_amount_u256 = grow input_amount in
      let input_reserve_u256 = grow input_reserve in
      let output_reserve_u256 = grow output_reserve in
      let input_amount_after_fee = builtin mul input_amount_u256 after_fee in
      let numerator = builtin mul input_amount_after_fee output_reserve_u256 in
      let input_reserve_denom = builtin mul input_reserve_u256 fee_denom in
      let denominator = builtin add input_reserve_denom input_amount_after_fee in
      let result = builtin div numerator denominator in
      let result_uint128 = builtin to_uint128 result in match result_uint128 with
        | None => builtin sub zero one (* @error throws an integer overflow by computing -1 in uint *)
        | Some r => r
        end

  let one_msg = fun(msg: Message) => let nil_msg = Nil{Message} in Cons{Message} msg nil_msg

  let make_error = fun (error: Error) => fun (version: String) => fun (code: Int32) =>
    let exception = match error with
    | CodeWrongSender    => "WrongSender"
    | CodeDidIsNull      => "DidIsNull"
    | CodeWrongStatus    => "WrongStatus"
    | CodeIsNull         => "ZeroValueOrNull"
    | CodeSameValue      => "SameValue"
    | CodeNotValid       => "InvalidValue"
    end in { _exception: exception; contractVersion: version; errorCode: code }

contract Trasmuter(
  token_id: String,
  init_community: String,
  user_subdomain: String,
  sbt_issuer: String, (* @review: update sbt issuer data *)
  issuer_subdomain: String,
  init_nft: ByStr32,
  init: ByStr20 with contract field dApp: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field dns: Map String ByStr20,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20,
      field verification_methods: Map String ByStr33,
      field services: Map String ByStr20,
      field did_domain_dns: Map String ByStr20 end end end,
  init_fund: String
  )
  with (* Contract constraints *)
    let string_is_not_empty = fun(s : String ) =>
      let zero = Uint32 0 in
      let s_length = builtin strlen s in
      let is_empty = builtin eq s_length zero in
      negb is_empty in
    let token_ok = string_is_not_empty token_id in
    let comm_ok = string_is_not_empty init_community in
    let fund_ok = string_is_not_empty init_fund in
    let valid_token_comm = andb token_ok comm_ok in
    let valid_str = andb valid_token_comm fund_ok in
    let valid_dom =
      (* The initial domain name must not be null *)
      let null = builtin eq init_nft zero_hash in
      negb null in
    andb valid_str valid_dom
  =>
  
  (***************************************************)
  (*               Mutable parameters                *)
  (***************************************************)

  field nft_domain: ByStr32 = init_nft
  field pending_domain: ByStr32 = zero_hash
  
  field pauser: ByStr32 = init_nft
  field is_paused: Bool = False

  field community: String = init_community
  field token_amount: Uint128 = zero
  field sbt: Map ByStr32 ByStr64 = Emp ByStr32 ByStr64
  field didxwallet: Option ByStr20 with contract
    field did_domain_dns: Map String ByStr20 end = none_byStr20
  field xwallet: ByStr20 = zero_addr

  (* DID Services *)
  field services: Map String ByStr20 = Emp String ByStr20
  field profit_fund: String = init_fund

  (* The block number when the last transition occurred *)
  field ledger_time: BNum = BNum 0
  
  (* A monotonically increasing number representing the amount of transitions that have taken place *)
  field tx_number: Uint128 = zero

  (* The smart contract @version *)
  field version: String = "S$ITransmuterDApp_0.3.0"

(***************************************************)
(*               Contract procedures               *)
(***************************************************)

(* Emits an error & cancels the transaction.
      @param err: The Error data type.
      @param code: A signed integer type of 32 bits. *)
procedure ThrowError(err: Error, code: Int32)
  ver <- version; e = make_error err ver code; throw e
end

(* Verifies that the contract is active (unpaused). *) 
procedure RequireNotPaused()
  paused <- is_paused; match paused with
    | False => | True => err = CodeWrongStatus; code = Int32 -1; ThrowError err code
    end
end

(* Verifies the origin of the call.
    It must match the input address.
      @param addr: A 20-byte string. *)
procedure VerifyOrigin(addr: ByStr20)
  verified = builtin eq _origin addr; match verified with
    | True => | False => err = CodeWrongSender; code = Int32 -2; ThrowError err code
    end
end

(* Verifies that the transaction comes from the contract owner.
      @param ssi_init: A 20-byte string representing the address of the SSI INIT DApp. *)
procedure VerifyOwner(
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20 end end
  )
  id <- nft_domain; domain_ = builtin to_string id;
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -3; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller
    end
end

procedure ThrowIfZero(val: Uint128)
  is_null = builtin eq zero val; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -4; ThrowError err code
    end
end

procedure ThrowIfNullAddr(addr: ByStr20)
  is_null = builtin eq addr zero_addr; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -5; ThrowError err code
    end
end

procedure ThrowIfNullHash(input: ByStr32)
  is_null = builtin eq input zero_hash; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -6; ThrowError err code
    end
end

procedure ThrowIfNullString(input: String)
  is_null = builtin eq input empty_string; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -7; ThrowError err code
    end
end

procedure Donate(
  ssi_init: ByStr20 with contract field dns: Map String ByStr20 end,
  donate: Uint128
  )
  is_zero = builtin eq zero donate; match is_zero with
    | True => | False =>
      donateDomain = "donate"; get_addr <-& ssi_init.dns[donateDomain];
      addr = option_bystr20_value get_addr; ThrowIfNullAddr addr;
      accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donate } in one_msg m; send msg
    end
end

procedure TyronCommunityFund(
  ssi_init: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20 end end,
  id: String
  )
  fund <- profit_fund;
  txID = builtin concat fund id;
  init_did <-& ssi_init.implementation; ver <- version;
  get_fee <-& init_did.utility[ver][txID]; fee = option_uint128_value get_fee;
  is_zero = builtin eq fee zero; match is_zero with
    | True => | False =>
      get_did <-& ssi_init.did_dns[fund]; match get_did with
        | Some did_ => msg = let m = { _tag: "AddFunds"; _recipient: did_; _amount: fee } in one_msg m; send msg
        | None => err = CodeDidIsNull; code = Int32 -3; ThrowError err code
        end
    end
end

procedure RequireContractOwner(
  donate: Uint128,
  tx: String
  )
  ssi_init <-& init.dApp; VerifyOwner ssi_init;
  Donate ssi_init donate; TyronCommunityFund ssi_init tx
end

procedure Timestamp()
  current_block <- &BLOCKNUMBER; ledger_time := current_block;
  latest_tx_number <- tx_number; new_tx_number = builtin add latest_tx_number one;
  tx_number := new_tx_number
end

procedure ThrowIfSameDomain(
  a: ByStr32,
  b: ByStr32
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -8; ThrowError err code
    end
end

(* Verifies that the given addresses are not equal.
      @params a & b: 20-byte strings. *) 
procedure ThrowIfSameAddr(
  a: ByStr20,
  b: ByStr20
  )
  is_self = builtin eq a b; match is_self with
    | False => | True => err = CodeSameValue; code = Int32 -9; ThrowError err code
    end
end

procedure ThrowIfDifferentAddr(
  a: ByStr20,
  b: ByStr20
  )
  is_self = builtin eq a b; match is_self with
    | True => | False => err = CodeNotValid; code = Int32 -10; ThrowError err code
    end
end

procedure FetchServiceAddr(id: String)
  ssi_init <-& init.dApp;
  initId = "init"; get_did <-& ssi_init.did_dns[initId]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -11; ThrowError err code
    | Some did_ =>
      get_service <-& did_.services[id]; addr = option_bystr20_value get_service;
      ThrowIfNullAddr addr; services[id] := addr;
      ssi_service <-& did_.services[ssi_id]; ssi_addr = option_bystr20_value ssi_service;
      ThrowIfNullAddr ssi_addr; services[ssi_id] := ssi_addr;
      token_service <-& did_.services[token_id]; token_addr = option_bystr20_value token_service;
      ThrowIfNullAddr token_addr; services[token_id] := token_addr
    end
end

procedure IsSender(id: String)
  ThrowIfNullString id; ssi_init <-& init.dApp;
  get_addr <-& ssi_init.dns[id]; match get_addr with
    | None => err = CodeIsNull; code = Int32 -12; ThrowError err code
    | Some addr =>
      is_sender = builtin eq addr _sender; match is_sender with
        | True => | False =>
          err = CodeWrongSender; code = Int32 -13; ThrowError err code
        end
    end
end

procedure VerifyController(
  domain: ByStr32,
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20,
      field did_domain_dns: Map String ByStr20 end end
  )
  ThrowIfNullHash domain; domain_ = builtin to_string domain;
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -14; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller;

      xwallet := did_;
      some_did = Some{ ByStr20 with contract field did_domain_dns: Map String ByStr20 end } did_;
      didxwallet := some_did
    end
end

procedure VerifySBT(
  domain: ByStr32,
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract
      field verification_methods: Map String ByStr33 end end,
  get_xwallet: Option ByStr20 with contract
    field ivms101: Map String String,
    field sbt: Map String ByStr64 end
  )
  match get_xwallet with
  | None => err = CodeNotValid; code = Int32 -15; ThrowError err code
  | Some xwallet_ => (* Access the caller's SBT *)
    (* The user's IVMS101 Message *)
    get_ivms101 <-& xwallet_.ivms101[sbt_issuer]; msg = option_string_value get_ivms101; ThrowIfNullString msg;
    
    get_did <-& ssi_init.did_dns[sbt_issuer]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -16; ThrowError err code
    | Some did_ =>
      get_didkey <-& did_.verification_methods[issuer_subdomain]; did_key = option_bystr33_value get_didkey;
      signed_data = let hash = builtin sha256hash msg in builtin to_bystr hash;
      (* The issuer's signature *)
      get_sig <-& xwallet_.sbt[sbt_issuer]; sig = option_bystr64_value get_sig;
      is_right_signature = builtin schnorr_verify did_key signed_data sig; match is_right_signature with
      | False => err = CodeNotValid; code = Int32 -17; ThrowError err code
      | True => sbt[domain] := sig
      end
    end
  end
end

procedure Auth(
  domain: ByStr32,
  subdomain: Option String
  )
  ssi_init <-& init.dApp;
  VerifyController domain ssi_init;
  subdomain_ = match subdomain with
  | Some subd => subd
  | None => user_subdomain (* @review *)
  end;
  
  (* Get SBT *)
  is_did = builtin eq subdomain_ did; match is_did with (* Defaults to true in VerifyController *)
  | True => | False =>
    ssi_did <- didxwallet; match ssi_did with
    | None => err = CodeDidIsNull; code = Int32 -18; ThrowError err code
    | Some did_ =>
      get_addr <-& did_.did_domain_dns[subdomain_];
      addr = option_bystr20_value get_addr; ThrowIfNullAddr addr;
      xwallet := addr
    end
  end;
  
  xwallet_ <- xwallet;
  get_xwallet <-& xwallet_ as ByStr20 with contract
    field ivms101: Map String String,
    field sbt: Map String ByStr64 end;
  VerifySBT domain ssi_init get_xwallet;
  xwallet := zero_addr; didxwallet := none_byStr20
  end

procedure FetchCommunity(amount: Uint128)
  ssi_community <- community;
  FetchServiceAddr ssi_community;
  get_comm_addr <- services[ssi_community]; comm_address = option_bystr20_value get_comm_addr; ThrowIfNullAddr comm_address;
  
  get_community <-& comm_address as ByStr20 with contract
    field reserves: Pair Uint128 Uint128 end;
  
  match get_community with
  | None => err = CodeNotValid; code = Int32 -19; ThrowError err code
  | Some comm => 
      reserves <-& comm.reserves;
      ssi_reserve = let fst_element = @fst Uint128 Uint128 in fst_element reserves; ThrowIfZero ssi_reserve;
      token_reserve = let snd_element = @snd Uint128 Uint128 in snd_element reserves; ThrowIfZero token_reserve;

      token_amt = get_output amount ssi_reserve token_reserve fee_denom; (* after_fee = fee_denom means 0% fee *)
      token_amount := token_amt
  end
end

procedure BurnOrder(
  is_token: Bool,
  amount: Uint128,
  ssi_addr: ByStr20,
  token_addr: ByStr20
  )
  recipient = match is_token with
  | True => (* Burn tokens *)
    token_addr
  | False => (* Burn dollars *)
    ssi_addr
  end;
  
  msg = let m = { _tag: "Burn"; _recipient: recipient; _amount: zero;
    burn_account: _sender;
    amount: amount } in one_msg m; send msg
end

procedure MintOrder(
  is_token: Bool,
  amount: Uint128,
  ssi_addr: ByStr20,
  token_addr: ByStr20,
  beneficiary: ByStr20
  )
  recipient = match is_token with
  | True => (* Mint tokens *)
    token_addr
  | False => (* Mint dollars *)
    ssi_addr
  end;
  
  msg = let m = { _tag: "Mint"; _recipient: recipient; _amount: zero;
    recipient: beneficiary;
    amount: amount } in one_msg m; send msg
end

procedure Mint_(
  beneficiary: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr beneficiary; ThrowIfSameAddr beneficiary _this_address;
  ThrowIfZero amount;

  FetchCommunity amount; token_amt <- token_amount; ThrowIfZero token_amt;
  
  get_ssi_addr <- services[ssi_id]; ssi_addr = option_bystr20_value get_ssi_addr;
  get_token_addr <- services[token_id]; token_addr = option_bystr20_value get_token_addr;
  (* Burn tokens *)
  BurnOrder true token_amt ssi_addr token_addr;
  (* Mint S$I dollars *)
  MintOrder false amount ssi_addr token_addr beneficiary
end

procedure Burn_(
  originator: ByStr20,
  amount: Uint128
  )
  ThrowIfDifferentAddr _sender originator;
  ThrowIfZero amount;

  FetchCommunity amount; token_amt <- token_amount; ThrowIfZero token_amt;

  get_ssi_addr <- services[ssi_id]; ssi_addr = option_bystr20_value get_ssi_addr; ThrowIfNullAddr ssi_addr;
  get_token_addr <- services[token_id]; token_addr = option_bystr20_value get_token_addr; ThrowIfNullAddr token_addr;
  BurnOrder false amount ssi_addr token_addr;
  MintOrder true token_amt ssi_addr token_addr originator
end

(***************************************************)
(*              Contract transitions               *)
(***************************************************)

transition UpdateDomain(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfNullHash domain;
  tag = "UpdateDomain"; RequireContractOwner donate tag;
  id <- nft_domain; ThrowIfSameDomain id domain;
  ssi_init <-& init.dApp; domain_ = builtin to_string domain;

  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 1; ThrowError err code
    | Some did_ => pending_domain := domain
    end;
  Timestamp
end

transition AcceptPendingDomain()
  RequireNotPaused; ssi_init <-& init.dApp;
  domain <- pending_domain; domain_ = builtin to_string domain;
  
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 2; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller;
      nft_domain := domain; pending_domain := zero_hash
    end;
  Timestamp
end

transition UpdatePauser(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused;
  tag = "UpdatePauser"; RequireContractOwner donate tag;
  current_pauser <- pauser; ThrowIfSameDomain current_pauser domain;
  
  pauser := domain;
  ver <- version; e = { _eventname: "SSIDApp_PauserUpdated"; version: ver;
    newPauser: domain }; event e;
  Timestamp
end

(* Pauses the whole dApp *)
transition Pause()
  RequireNotPaused;
  
  domain <- pauser; id = builtin to_string domain; IsSender id;
  
  is_paused := true;
  ver <- version; e = { _eventname: "SSIDApp_Paused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

(* Unpauses the whole dApp *)
transition Unpause()
  paused <- is_paused; match paused with
    | True => | False => (* Not Paused Error *)
      err = CodeWrongStatus; code = Int32 3; ThrowError err code
    end;
      
  domain <- pauser; id = builtin to_string domain; IsSender id;
  
  is_paused := false;
  ver <- version; e = { _eventname: "SSIDApp_Unpaused";
    version: ver;
    pauser: _sender }; event e;
  Timestamp
end

transition UpdateProfitFund(
  val: String,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfNullString val;
  tag = "UpdateProfitFund"; RequireContractOwner donate tag;
  
  profit_fund := val;
  ver <- version; e = { _eventname: "ProfitFundUpdated"; version: ver;
    newValue: val }; event e;
  Timestamp
end

(* Mints new dollars.
  The caller (_sender) must have enough token balance.
    @param recipient: Address of the beneficiary whose balance increases.
    @param amount: Number of dollars minted. *)
transition MintSSI(
  domain: ByStr32,
  subdomain: Option String,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; Auth domain subdomain;

  Mint_ recipient amount;
  ver <- version; e = { _eventname: "SSIDApp_DollarsMinted"; version: ver;
    minter: _sender;
    beneficiary: recipient;
    amount: amount }; event e;
  Timestamp
end

(* Burns existing dollars.
  The caller (_sender) must have enough dollar balance.
    @param burn_account: Address of the originator whose balance decreases.
    @param amount: Number of dollars burned. *)
transition BurnSSI(
  domain: ByStr32,
  subdomain: Option String,
  burn_account: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; Auth domain subdomain;

  Burn_ burn_account amount;
  ver <- version; e = { _eventname: "SSIDApp_DollarsBurned"; version: ver;
    burner: _sender;
    amount: amount }; event e;
  Timestamp
end

transition BurnSuccessCallBack(
  burner: ByStr20,
  burn_account: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  ThrowIfDifferentAddr burner _this_address; ThrowIfZero amount;
  Timestamp
end

transition MintSuccessCallBack(
  minter: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  ThrowIfDifferentAddr minter _this_address; ThrowIfZero amount;
  Timestamp
end
        `;

      const contract_init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "token_id", //@xalkan_transmuter
          type: "String",
          value: "tyron",
        },
        {
          vname: "init_community", //@xalkan_transmuter
          type: "String",
          value: "tyrons$i_community",
        },
        {
          vname: "user_subdomain", //@xalkan_transmuter
          type: "String",
          value: "defi",
        },
        {
          vname: "sbt_issuer", //@xalkan_transmuter
          type: "String",
          value: "tyron",
        },
        {
          vname: "issuer_subdomain", //@xalkan_transmuter
          type: "String",
          value: "soul",
        },
        {
          vname: "init_nft",
          type: "ByStr32",
          value: `${init_nft}`,
        },
        {
          vname: "init",
          type: "ByStr20",
          value: `${init_tyron}`,
        },
        {
          vname: "init_fund",
          type: "String",
          value: `${init_fund}`,//@xalkan_transmuter
        }
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "100000",
        gasPrice: "2000000000",
      });
      toast.info("Contract successfully deployed.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployTyronS$ICommunity(net: string, address: string) {
    try {
      const init_nft = "0x29eee3e10b6c4138fc2cabac8581df59a491c05c49d72d107f90dbb7af022e64" //tyronmapu.ssi
      const init_fund = "0x3c469e9d6c5875d37a43f353d4f88e61fcf812c66eee3457465a40b0da4153e0" //token.ssi
      let init_tyron = "0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9";

      if (net === "testnet") {
        init_tyron = "0xec194d20eab90cfab70ead073d742830d3d2a91b";
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code =
        `
(* community.ssi DApp v0.6
S$I - Self-Sovereign Identity Dollar - Decentralised Exchange & Liquidity Pool Token
Tyron Self-Sovereign Identity (SSI) Protocol
Copyright Tyron Mapu Community Interest Company, Tyron SSI DAO 2023. All rights reserved.
You acknowledge and agree that Tyron Mapu Community Interest Company (Tyron SSI) own all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this repository (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this repository.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of Tyron SSI; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by Tyron SSI in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of Tyron SSI or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*)

scilla_version 0

(***************************************************)
(*               Associated library                *)
(***************************************************)

import IntUtils BoolUtils PairUtils

library Community
  type Error =
    | CodeWrongSender
    | CodeDidIsNull
    | CodeWrongStatus
    | CodeIsNull
    | CodeSameValue
    | CodeIsInsufficient
    | CodeNotValid
  
  type Action =
    | Add
    | Remove
  
  let add = Add
  let remove = Remove
  let true = True
  let false = False
  let zero = Uint128 0
  let zero_256 = Uint256 0
  let zero_addr = 0x0000000000000000000000000000000000000000
  let zero_hash = 0x0000000000000000000000000000000000000000000000000000000000000000
  let zeroByStr33 = 0x000000000000000000000000000000000000000000000000000000000000000000
  let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
  let one = Uint128 1
  let one_256 = Uint256 1
  let fee_denom = Uint256 10000 (* Fee denominated in basis points: 1 b.p. = 0.01% *)
  let empty_string = ""
  let did = "did"
  let ssi_id = "s$i"
  let sgd_id = "xsgd"
  let none_byStr20 = None{ ByStr20 with contract field did_domain_dns: Map String ByStr20 end }
  
  let option_value = tfun 'A => fun(default: 'A) => fun(input: Option 'A) =>
    match input with
    | Some v => v
    | None => default end
  let option_uint128_value = let f = @option_value Uint128 in f zero
  let option_bystr20_value = let f = @option_value ByStr20 in f zero_addr
  let option_string_value = let f = @option_value String in f empty_string
  let option_bystr32_value = let f = @option_value ByStr32 in f zero_hash
  let option_bystr33_value = let f = @option_value ByStr33 in f zeroByStr33
  let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64

  let grow: Uint128 -> Uint256 =
    fun(var : Uint128) =>
      let get_big = builtin to_uint256 var in match get_big with
        | Some big => big
        | None => builtin sub zero_256 one_256 end (* @error throws an integer underflow - should never happen *)

  let get_output: Uint128 -> Uint128 -> Uint128 -> Uint256 -> Uint128 =
    fun(input_amount: Uint128) => fun(input_reserve: Uint128) => fun(output_reserve: Uint128) => fun (after_fee: Uint256) =>
      let input_amount_u256 = grow input_amount in
      let input_reserve_u256 = grow input_reserve in
      let output_reserve_u256 = grow output_reserve in
      let input_amount_after_fee = builtin mul input_amount_u256 after_fee in
      let numerator = builtin mul input_amount_after_fee output_reserve_u256 in
      let input_reserve_denom = builtin mul input_reserve_u256 fee_denom in
      let denominator = builtin add input_reserve_denom input_amount_after_fee in
      let result = builtin div numerator denominator in
      let result_uint128 = builtin to_uint128 result in match result_uint128 with
        | None => builtin sub zero one (* @error throws an integer overflow by computing -1 in uint *)
        | Some r => r
        end

  let fraction: Uint128 -> Uint128 -> Uint128 -> Uint128 =
    fun(dX: Uint128) => fun(x: Uint128) => fun(y: Uint128) =>
      let dX_u256 = grow dX in
      let x_u256 = grow x in
      let y_u256 = grow y in
      let numerator = builtin mul dX_u256 y_u256 in
      let result = builtin div numerator x_u256 in
      let result_uint128 = builtin to_uint128 result in match result_uint128 with
        | None => builtin sub zero one (* @error throws an integer overflow by computing -1 in uint *)
        | Some r => builtin add r one
        end

  let is_input_output: ByStr20 -> ByStr20 -> ByStr20 -> ByStr20 -> Bool =
    fun(token0_address: ByStr20) => fun(input: ByStr20) => fun(token1_address: ByStr20)=> fun(output: ByStr20) =>
    let is_input = builtin eq token0_address input in
    let is_output = builtin eq token1_address output in
    andb is_input is_output

  let compute_ssi: Uint128 -> Uint256 -> Uint256 -> Uint128 =
    fun(amount: Uint128) => fun(price: Uint256) => fun(d: Uint256) =>
      let amount_u256 = grow amount in
      let numerator = builtin mul amount_u256 price in
      let result = builtin div numerator d in
      let result_uint128 = builtin to_uint128 result in match result_uint128 with
        | None => builtin sub zero one (* @error throws an integer overflow by computing -1 in uint *)
        | Some r => r
        end
  
  let compute_token: Uint128 -> Uint256 -> Uint256 -> Uint128 =
    fun(amount: Uint128) => fun(price: Uint256) => fun(m: Uint256) =>
      let amount_u256 = grow amount in
      let numerator = builtin mul amount_u256 m in
      let result = builtin div numerator price in
      let result_uint128 = builtin to_uint128 result in match result_uint128 with
        | None => builtin sub zero one (* @error throws an integer overflow by computing -1 in uint *)
        | Some r => r
        end

  let one_msg = fun(msg: Message) => let nil_msg = Nil{Message} in Cons{Message} msg nil_msg

  let two_msgs = fun(msg1: Message) => fun(msg2: Message) =>
    let msgs_tmp = one_msg msg2 in Cons{Message} msg1 msgs_tmp

  let make_error = fun (error: Error) => fun (version: String) => fun (code: Int32) =>
    let exception = match error with
    | CodeWrongSender    => "WrongSender"
    | CodeDidIsNull      => "DidIsNull"
    | CodeWrongStatus    => "WrongStatus"
    | CodeIsNull         => "ZeroValueOrNull"
    | CodeSameValue      => "SameValue"
    | CodeIsInsufficient => "InsufficientAmount"
    | CodeNotValid       => "NotValid"
    end in { _exception: exception; contractVersion: version; errorCode: code }

contract Community(
  contract_owner: ByStr20,
  init_nft: ByStr32,
  init: ByStr20 with contract field dApp: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field dns: Map String ByStr20,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20,
      field verification_methods: Map String ByStr33,
      field services: Map String ByStr20,
      field did_domain_dns: Map String ByStr20 end end end,
  token_id: String, (* 'tyron' for the tyronS$I Community *)
  init_fee: Uint256, (* 1% fee => 9900 *)
  init_fladdr: ByStr20,
  init_fund: String,
  (* S$I LP token *)
  init_supply: Uint128,
  name : String,
  symbol: String,
  decimals: Uint32,
  sbt_issuer: String, (* @review: update sbt issuer data *)
  issuer_subdomain: String
  )
  with (* Contract constraints @review: update *)
    let is_valid =
      let is_invalid = 
        (* The initial domain name must not be null *)
        let null = builtin eq init_nft zero_hash in
        let insufficient = uint256_le fee_denom init_fee in
        orb null insufficient in
      negb is_invalid in
    let is_zero = builtin eq init_supply zero in
    andb is_valid is_zero
  =>

(***************************************************)
(*               Mutable parameters                *)
(***************************************************)
  
  (* Contract owner.
        @field nft_domain:
        Contract owner's .did domain.
        @field pending_domain:
        New owner's .did domain for ownership transfer. *)
  field nft_domain: ByStr32 = init_nft
  field pending_domain: ByStr32 = zero_hash
  
  field pauser: ByStr32 = init_nft
  field is_paused: Bool = False
  
  field min_affiliation: Uint128 = Uint128 10000000000000000000 (* 10 S$I dollars *)
  field reserves: Pair Uint128 Uint128 = Pair{ Uint128 Uint128 } zero zero (* S$I reserve & Token reserve *)
  field profit_denom: Uint256 = init_fee
  field contributions: Uint128 = zero
  field balances: Map ByStr20 Uint128 = Emp ByStr20 Uint128
  field price: Uint256 = Uint256 1350000 (* 1 $TYRON = 1.35 S$I = 1.35 XSGD *)
  field dv: Uint256 = Uint256 1 (* divider *)
  
  field is_fairlaunch: Bool = true
  field fl_addr: ByStr20 = init_fladdr (* @review: enable updates *)
  field fl_amount: Uint128 = zero
  field fl_limit: Uint128 = Uint128 135000000000000000000000 (* S$ 135k *)
  field ml: Uint256 = Uint256 1 (* multiplier *)
  field x: Uint128 = Uint128 1000000000000 (* 1 S$S div 10^12 = 1 XSGD *)

  (* Liquidity Pool Token *)
  field total_supply: Uint128 = init_supply
  field lp_pauser: ByStr32 = init_nft
  field lp_paused: Bool = False
  field shares: Map ByStr20 Uint128 = Emp ByStr20 Uint128
  field allowances: Map ByStr20 Map ByStr20 Uint128 = Emp ByStr20 Map ByStr20 Uint128

  field sbt: Map ByStr32 ByStr64 = Emp ByStr32 ByStr64
  field registry: Map ByStr20 ByStr32 = Emp ByStr20 ByStr32
  field community_balances: Map ByStr32 Uint128 = Emp ByStr32 Uint128 (* NFT Domain Name & amount of dollars *)
  field limit: Uint128 = Uint128 1000000000000000000000 (* 1,000 S$I dollars *)
  field didxwallet: Option ByStr20 with contract
    field did_domain_dns: Map String ByStr20 end = none_byStr20
  field xwallet: ByStr20 = zero_addr

  (* DID Services *)
  field services: Map String ByStr20 = Emp String ByStr20
  field profit_fund: String = init_fund

  (* The block number when the last transition occurred *)
  field ledger_time: BNum = BNum 0
  
  (* A monotonically increasing number representing the amount of transitions that have taken place *)
  field tx_number: Uint128 = zero

  (* The smart contract @version *)
  field version: String = "Community.ssiDApp_0.5.0"

(***************************************************)
(*               Contract procedures               *)
(***************************************************)

(* Emits an error & cancels the transaction.
      @param err: The Error data type.
      @param code: A signed integer type of 32 bits. *)
procedure ThrowError(err: Error, code: Int32)
  ver <- version; e = make_error err ver code; throw e
end

(* Verifies that the contract is active (unpaused). *) 
procedure RequireNotPaused()
  paused <- is_paused; match paused with
    | False => | True => err = CodeWrongStatus; code = Int32 -1; ThrowError err code
    end
end

procedure RequireNotLPTokenPaused()
  paused <- lp_paused; match paused with
    | False => | True => err = CodeWrongStatus; code = Int32 -2; ThrowError err code
    end
end

(* Verifies the origin of the call.
    It must match the input address.
      @param addr: A 20-byte string. *) 
procedure VerifyOrigin(addr: ByStr20)
  verified = builtin eq _origin addr; match verified with
    | True => | False => err = CodeWrongSender; code = Int32 -3; ThrowError err code
    end
end

(* Verifies that the transaction comes from the contract owner.
      @param ssi_init: A 20-byte string representing the address of the SSI INIT DApp. *)
procedure VerifyOwner(
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20 end end
  )
  id <- nft_domain; domain_ = builtin to_string id;
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -4; ThrowError err code
    | Some did_ =>
        controller <-& did_.controller; VerifyOrigin controller
    end
end

procedure ThrowIfZero(val: Uint128)
  is_null = builtin eq zero val; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -5; ThrowError err code
    end
end

procedure ThrowIfNullAddr(addr: ByStr20)
  is_null = builtin eq addr zero_addr; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -6; ThrowError err code
    end
end

procedure ThrowIfNullHash(input: ByStr32)
  is_null = builtin eq input zero_hash; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -7; ThrowError err code
    end
end

procedure ThrowIfNullSig(input: ByStr64)
  is_null = builtin eq input zeroByStr64; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -8; ThrowError err code
    end
end

procedure ThrowIfNullString(input: String)
  is_null = builtin eq input empty_string; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -9; ThrowError err code
    end
end

procedure Donate(
  ssi_init: ByStr20 with contract field dns: Map String ByStr20 end,
  donate: Uint128
  )
  is_zero = builtin eq zero donate; match is_zero with
    | True => | False =>
      donateDomain = "donate"; get_addr <-& ssi_init.dns[donateDomain];
      addr = option_bystr20_value get_addr; ThrowIfNullAddr addr;
      accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donate } in one_msg m; send msg
    end
end

procedure TyronCommunityFund(
  ssi_init: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20 end end,
  id: String
  )
  fund <- profit_fund;
  txID = builtin concat fund id;
  init_did <-& ssi_init.implementation; ver <- version;
  get_fee <-& init_did.utility[ver][txID]; fee = option_uint128_value get_fee;
  is_zero = builtin eq fee zero; match is_zero with
    | True => | False =>
      get_did <-& ssi_init.did_dns[fund]; match get_did with
        | Some did_ => msg = let m = { _tag: "AddFunds"; _recipient: did_; _amount: fee } in one_msg m; send msg
        | None => err = CodeDidIsNull; code = Int32 -10; ThrowError err code
        end
    end
end

procedure RequireContractOwner(
  donate: Uint128,
  tx: String
  )
  ssi_init <-& init.dApp; VerifyOwner ssi_init;
  Donate ssi_init donate; TyronCommunityFund ssi_init tx
end

procedure ThrowIfSameVal(
  a: Uint128,
  b: Uint128
  )
  is_self = builtin eq a b; match is_self with
    | False => | True => err = CodeSameValue; code = Int32 -11; ThrowError err code
    end
end

procedure ThrowIfSameDomain(
  a: ByStr32,
  b: ByStr32
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -12; ThrowError err code
    end
end

(* Verifies that the given addresses are not equal.
      @params a & b: 20-byte strings. *)
procedure ThrowIfSameAddr(
  a: ByStr20,
  b: ByStr20
  )
  is_self = builtin eq a b; match is_self with
    | False => | True => err = CodeSameValue; code = Int32 -13; ThrowError err code
    end
end

procedure ThrowIfDifferentAddr(
  a: ByStr20,
  b: ByStr20
  )
  is_self = builtin eq a b; match is_self with
    | True => | False => err = CodeNotValid; code = Int32 -14; ThrowError err code
    end
end

procedure ThrowIfExpired(deadline_block: BNum)
  current_block <- & BLOCKNUMBER;
  verified = builtin blt current_block deadline_block; match verified with
  | True => | False => err = CodeNotValid; code = Int32 -15; ThrowError err code
  end
end

(* @review ssi_init as input *)
procedure FetchServiceAddr(id: String)
  ssi_init <-& init.dApp;
  initId = "init"; get_did <-& ssi_init.did_dns[initId]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -16; ThrowError err code
    | Some did_ =>
      get_service <-& did_.services[id]; addr = option_bystr20_value get_service;
      ThrowIfNullAddr addr; services[id] := addr;

      ssi_service <-& did_.services[ssi_id]; ssi_addr = option_bystr20_value ssi_service;
      ThrowIfNullAddr ssi_addr; services[ssi_id] := ssi_addr
    end
end

procedure IsSender(id: String)
  ThrowIfNullString id; ssi_init <-& init.dApp;
  get_addr <-& ssi_init.dns[id]; match get_addr with
    | None => err = CodeIsNull; code = Int32 -17; ThrowError err code
    | Some addr =>
      is_sender = builtin eq addr _sender; match is_sender with
        | True => | False =>
          err = CodeWrongSender; code = Int32 -18; ThrowError err code
        end
    end
end

procedure VerifyController(
  domain: ByStr32,
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20,
      field did_domain_dns: Map String ByStr20 end end
  )
  ThrowIfNullHash domain; domain_ = builtin to_string domain;

  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -19; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller;

      xwallet := did_;
      some_did = Some{ ByStr20 with contract field did_domain_dns: Map String ByStr20 end } did_;
      didxwallet := some_did
    end
end

procedure IsSufficient(
  value: Uint128,
  amount: Uint128
  )
  is_sufficient = uint128_ge value amount; match is_sufficient with
    | True => | False => err = CodeIsInsufficient; code = Int32 -20; ThrowError err code
    end
end

procedure IsAffiliationSufficient(amount: Uint128)
  current_min <- min_affiliation; IsSufficient amount current_min
end

(* Orders a deposit into this dapp. *)
procedure TransferFundsFrom(
  addr: ByStr20,
  amount: Uint128
  )
  msg = let m = { _tag: "TransferFrom"; _recipient: addr; _amount: zero;
    from: _sender;
    to: _this_address;
    amount: amount } in one_msg m; send msg
end

(* To withdraw funds from this dapp *)
procedure TransferFunds(
  addr: ByStr20,
  beneficiary: ByStr20,
  amount: Uint128
  )
  ThrowIfZero amount; ThrowIfNullAddr addr; ThrowIfNullAddr beneficiary;
  ThrowIfSameAddr beneficiary _this_address;
  msg = let m = { _tag: "Transfer"; _recipient: addr; _amount: zero;
    to: beneficiary;
    amount: amount } in one_msg m; send msg
end

(* Updates the caller's balances & LP token total supply.
      @param action: Add or Remove shares.
      @param domain: The NFT Domain Name of the caller (_sender).
      @param amount: Number of S$I dollars. *)
procedure UpdateShares(
  action: Action,
  addr: ByStr20,
  amount: Uint128
  )
  (* Get contributions *)
  current_contributions <- contributions;
  
  (* Get current supply & compute shares *)
  supply <- total_supply;
  is_null = builtin eq supply zero;
  computed_shares = match is_null with
  | True => amount
  | False => fraction amount current_contributions supply end;

  (* Get balances *)
  get_bal <- shares[addr]; bal = option_uint128_value get_bal;
  get_domain <- registry[addr]; domain = option_bystr32_value get_domain; ThrowIfNullHash domain;
  get_community_balance <- community_balances[domain]; community_balance = option_uint128_value get_community_balance;

  match action with
  | Add =>
    new_bal = builtin add bal computed_shares; shares[addr] := new_bal;
    new_supply = builtin add supply computed_shares; total_supply := new_supply;
    new_community_balance = builtin add community_balance amount; community_balances[domain] := new_community_balance
  | Remove =>
    new_bal = builtin sub bal computed_shares; (* @error: Throw integer underflow if trying to withdraw more shares than the balance. *)
    new_supply = builtin sub supply computed_shares; total_supply := new_supply;

    is_zero = builtin eq new_bal zero; match is_zero with
      | True =>
        (* Clean space *)
        delete shares[addr];
        delete community_balances[domain]    
      | False =>
        shares[addr] := new_bal;
        new_community_balance = builtin sub community_balance amount;
        community_balances[domain] := new_community_balance
      end
  end
end

(* @dev: Sends update order depending on the new balance. If above limit, requests DID signature.
    @param addr: Beneficiary.
    @param domain: The caller (_sender) must control the NFT domain name.
    @param amount: Number of S$I dollars. *)
procedure AddShares(
  addr: ByStr20,
  domain: ByStr32,
  amount: Uint128
  )
  get_bal <- shares[addr]; bal = option_uint128_value get_bal;
  get_community_balance <- community_balances[domain]; community_balance = option_uint128_value get_community_balance;
  new_community_balance = builtin add community_balance amount;

  current_limit <- limit;
  is_below = uint128_le new_community_balance current_limit; match is_below with
    | True => | False =>
      get_sig <- sbt[domain]; sig = option_bystr64_value get_sig;
      ThrowIfNullSig sig end;
  UpdateShares add addr amount
end

procedure VerifySBT(
  domain: ByStr32,
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract
      field verification_methods: Map String ByStr33 end end,
  get_xwallet: Option ByStr20 with contract
    field ivms101: Map String String,
    field sbt: Map String ByStr64 end
  )
  match get_xwallet with
  | None => err = CodeNotValid; code = Int32 -21; ThrowError err code
  | Some xwallet_ => (* Access the caller's SBT *)
    (* The user's IVMS101 Message *)
    get_ivms101 <-& xwallet_.ivms101[sbt_issuer]; msg = option_string_value get_ivms101; ThrowIfNullString msg;

    get_did <-& ssi_init.did_dns[sbt_issuer]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -22; ThrowError err code
    | Some did_ =>
      get_didkey <-& did_.verification_methods[issuer_subdomain]; did_key = option_bystr33_value get_didkey;
      signed_data = let hash = builtin sha256hash msg in builtin to_bystr hash;
      (* The issuer's signature *)
      get_sig <-& xwallet_.sbt[sbt_issuer]; sig = option_bystr64_value get_sig;

      is_right_signature = builtin schnorr_verify did_key signed_data sig; match is_right_signature with
      | False => err = CodeNotValid; code = Int32 -23; ThrowError err code
      | True => sbt[domain] := sig
      end
    end
  end
end

procedure TransferIfSufficientBalance(
  originator: ByStr20,
  beneficiary: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr originator; ThrowIfSameAddr originator beneficiary;
  ThrowIfSameAddr beneficiary _this_address;
  ThrowIfZero amount;
  
  UpdateShares remove originator amount;
  
  get_domain <- registry[beneficiary]; domain = option_bystr32_value get_domain; ThrowIfNullHash domain;
  AddShares beneficiary domain amount
end

procedure Timestamp()
  current_block <- &BLOCKNUMBER; ledger_time := current_block;
  latest_tx_number <- tx_number; new_tx_number = builtin add latest_tx_number one;
  tx_number := new_tx_number
end

(***************************************************)
(*              Contract transitions               *)
(***************************************************)

transition UpdateDomain(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfNullHash domain;
  tag = "UpdateDomain"; RequireContractOwner donate tag;
  ssi_init <-& init.dApp;
  id <- nft_domain; ThrowIfSameDomain id domain; domain_ = builtin to_string domain;
  
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 1; ThrowError err code
    | Some did_ => pending_domain := domain
    end;
  Timestamp
end

transition AcceptPendingDomain()
  RequireNotPaused; domain <- pending_domain;
  ssi_init <-& init.dApp; domain_ = builtin to_string domain;
  
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 2; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller;
      nft_domain := domain; pending_domain := zero_hash
    end;
  Timestamp
end

transition UpdatePauser(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused;
  tag = "UpdatePauser"; RequireContractOwner donate tag;
  current_pauser <- pauser; ThrowIfSameDomain current_pauser domain;

  pauser := domain;
  ver <- version; e = { _eventname: "SSIDApp_PauserUpdated"; version: ver;
    newPauser: domain }; event e;
  Timestamp
end

(* Pauses the whole dApp *)
transition Pause()
  RequireNotPaused;
  domain <- pauser; id = builtin to_string domain; IsSender id;

  is_paused := true;
  ver <- version; e = { _eventname: "SSIDApp_Paused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

(* Unpauses the whole dApp *)
transition Unpause()
  paused <- is_paused; match paused with
    | True => | False => (* Not Paused Error *)
      err = CodeWrongStatus; code = Int32 3; ThrowError err code
    end;

  domain <- pauser; id = builtin to_string domain; IsSender id;
  
  is_paused := false;
  ver <- version; e = { _eventname: "SSIDApp_Unpaused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

transition UpdateLPTokenPauser(
  domain: ByStr32,
  donate: Uint128
  )
  RequireNotPaused;
  tag = "UpdateLPTokenPauser"; RequireContractOwner donate tag;
  current_pauser <- lp_pauser; ThrowIfSameDomain current_pauser domain;
  
  pauser := domain;
  ver <- version; e = { _eventname: "SSIDApp_LPTokenPauserUpdated"; version: ver;
    newPauser: domain }; event e;
  Timestamp
end

(* Pauses the LP token *)
transition LPTokenPause()
  RequireNotPaused; RequireNotLPTokenPaused;
  
  domain <- lp_pauser; id = builtin to_string domain; IsSender id;
  
  lp_paused := true;
  ver <- version; e = { _eventname: "SSIDApp_LPTokenPaused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

transition LPTokenUnpause()
  RequireNotPaused;

  paused <- lp_paused; match paused with
    | True => | False => (* Not Paused Error *)
      err = CodeWrongStatus; code = Int32 4; ThrowError err code
    end;
  
  domain <- lp_pauser; id = builtin to_string domain; IsSender id;
  
  lp_paused := false;
  ver <- version; e = { _eventname: "SSIDApp_LPTokenUnpaused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

transition UpdateMinAffiliation(
  val: Uint128,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfZero val;
  tag = "UpdateMinAffiliation"; RequireContractOwner donate tag;
  current <- min_affiliation; ThrowIfSameVal current val;
  
  min_affiliation := val;
  ver <- version; e = { _eventname: "SSIDApp_MinAffiliationUpdated"; version: ver;
    value: val;
    sender: _sender }; event e;
  Timestamp
end

transition UpdateProfitDenom(
  val: Uint256,
  donate: Uint128
  )
  RequireNotPaused;
  tag = "UpdateProfitDenom"; RequireContractOwner donate tag;
  verified = uint256_le val fee_denom; match verified with
    | True => | False => err = CodeNotValid; code = Int32 5; ThrowError err code
    end;
  new_denom = builtin sub fee_denom val;
  
  profit_denom := new_denom;
  ver <- version; e = { _eventname: "SSIDApp_ProfitDenomUpdated"; version: ver;
    newValue: new_denom;
    sender: _sender }; event e;
  Timestamp
end

transition UpdateProfitFund(
  val: String,
  donate: Uint128
  )
  RequireNotPaused; ThrowIfNullString val;
  tag = "UpdateProfitFund"; RequireContractOwner donate tag;
  
  profit_fund := val;
  ver <- version; e = { _eventname: "ProfitFundUpdated"; version: ver;
    newValue: val }; event e;
  Timestamp
end

transition TransferFromSuccessCallBack(
  initiator: ByStr20,
  sender: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  ThrowIfDifferentAddr initiator _this_address;
  Timestamp
end

transition RecipientAcceptTransferFrom(
  initiator: ByStr20,
  sender: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  ThrowIfDifferentAddr initiator _this_address; ThrowIfDifferentAddr recipient _this_address;
  Timestamp
end

transition TransferSuccessCallBack(
  sender: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  is_valid = builtin eq sender _this_address; match is_valid with
    | True => | False => err = CodeNotValid; code = Int32 6; ThrowError err code
    end;
  Timestamp
end

transition AddLiquidity(
  token_address: ByStr20, (* It must be the $TYRON token address *)
  min_contribution_amount: Uint128, (* Of S$I *)
  max_token_amount: Uint128,
  deadline_block: BNum
  )
  RequireNotPaused; ThrowIfZero min_contribution_amount; ThrowIfZero max_token_amount;
  FetchServiceAddr token_id;
  get_ssi_addr <- services[ssi_id]; ssi_address = option_bystr20_value get_ssi_addr; ThrowIfNullAddr ssi_address;
  get_token_addr <- services[token_id]; token_addr = option_bystr20_value get_token_addr; ThrowIfNullAddr token_addr;
  ThrowIfDifferentAddr token_address token_addr;  
  ThrowIfExpired deadline_block;

  current_reserves <- reserves;
  ssi_reserve = let fst_element = @fst Uint128 Uint128 in fst_element current_reserves;
  
  ver <- version;
  is_empty = builtin eq ssi_reserve zero; match is_empty with
    | True =>
      current_price <- price; current_div <- dv;
      ssi_amount = compute_ssi max_token_amount current_price current_div;
      IsAffiliationSufficient ssi_amount;

      (* Check limits *)
      is_valid = uint128_ge ssi_amount min_contribution_amount; match is_valid with
        | True => | False => err = CodeNotValid; code = Int32 7; ThrowError err code
        end;

      (* Make transfers & update balance *)
      TransferFundsFrom ssi_address ssi_amount;
      TransferFundsFrom token_addr max_token_amount;
      contributions := ssi_amount;
      balances[_sender] := ssi_amount;

      (* Update reserves *)
      init_reserves = Pair{ Uint128 Uint128 } ssi_amount max_token_amount;
      reserves := init_reserves;

      e = { _eventname: "SSIDApp_CommunityInitialised"; version: ver;
        sender: _sender;
        tokenAddr: token_addr }; event e;
      e = { _eventname: "SSIDApp_AddLiquidity"; version: ver;
        sender: _sender;
        contribution: ssi_amount;
        dollars: ssi_amount;
        tokens: max_token_amount;
        tokenAddr: token_addr;
        ssiReserve: ssi_amount;
        tokenReserve: max_token_amount;
        totalContributions: ssi_amount }; event e
    | False =>
      token_reserve = let snd_element = @snd Uint128 Uint128 in snd_element current_reserves;
      ssi_amount = get_output max_token_amount token_reserve ssi_reserve fee_denom; (* after_fee = fee_denom means 0% fee *)
      IsAffiliationSufficient ssi_amount;

      token_amount = fraction ssi_amount ssi_reserve token_reserve;

      current_contributions <- contributions; ThrowIfZero current_contributions;
      contribution_amount = fraction ssi_amount ssi_reserve current_contributions;

      (* Check limits *)
      is_valid =
        let valid_ssi = uint128_ge contribution_amount min_contribution_amount in
        let valid_token = uint128_le token_amount max_token_amount in
        andb valid_ssi valid_token;

      match is_valid with
      | True => | False => err = CodeNotValid; code = Int32 8; ThrowError err code
      end;

      (* Make transfers & update balance *)
      TransferFundsFrom ssi_address ssi_amount;
      TransferFundsFrom token_addr token_amount;
      get_balance <- balances[_sender]; balance = option_uint128_value get_balance;
      new_balance = builtin add balance contribution_amount; balances[_sender] := new_balance;

      new_contributions = builtin add current_contributions contribution_amount;
      contributions := new_contributions;

      (* Update reserves *)
      new_ssi_reserve = builtin add ssi_reserve ssi_amount;
      new_token_reserve = builtin add token_reserve token_amount;
      new_reserves = Pair{ Uint128 Uint128 } new_ssi_reserve new_token_reserve;
      reserves := new_reserves;

      e = { _eventname: "SSIDApp_AddLiquidity"; version: ver;
        sender: _sender;
        contribution: contribution_amount;
        dollars: ssi_amount;
        tokens: token_amount;
        tokenAddr: token_addr;
        ssiReserve: new_ssi_reserve;
        tokenReserve: new_token_reserve;
        totalContributions: new_contributions }; event e
    end;
  Timestamp
end

(* Takes liquidity out of the dApp and sends the funds to the caller (_sender).
      @param contribution_amount: The amount of dollars provided for liquidity.
      @param min_zil_amount: Treated as the minimum amount of S$I dollars requested for withdrawal. *)
transition RemoveLiquidity(
  token_address: ByStr20,
  contribution_amount: Uint128,
  min_zil_amount: Uint128,
  min_token_amount: Uint128,
  deadline_block: BNum
  )
  RequireNotPaused;
  ThrowIfZero contribution_amount; ThrowIfZero min_zil_amount; ThrowIfZero min_token_amount;
  FetchServiceAddr token_id;
  get_ssi_addr <- services[ssi_id]; ssi_address = option_bystr20_value get_ssi_addr; ThrowIfNullAddr ssi_address;
  get_token_addr <- services[token_id]; token_addr = option_bystr20_value get_token_addr; ThrowIfNullAddr token_addr;
  ThrowIfDifferentAddr token_address token_addr;  
  ThrowIfExpired deadline_block;

  (* Get reserves *)
  current_reserves <- reserves;
  ssi_reserve = let fst_element = @fst Uint128 Uint128 in fst_element current_reserves;
  token_reserve = let snd_element = @snd Uint128 Uint128 in snd_element current_reserves;

  ThrowIfZero ssi_reserve;

  current_contributions <- contributions; ThrowIfZero current_contributions;
  ssi_amount = fraction contribution_amount current_contributions ssi_reserve;
  token_amount = fraction contribution_amount current_contributions token_reserve;

  (* Check limits *)
  is_valid =
    let valid_ssi = uint128_ge ssi_amount min_zil_amount in
    let valid_token = uint128_ge token_amount min_token_amount in
    andb valid_ssi valid_token;

  match is_valid with
  | True => | False => err = CodeNotValid; code = Int32 9; ThrowError err code
  end;

  (* Update balance *)
  get_balance <- balances[_sender]; balance = option_uint128_value get_balance;
  new_balance = builtin sub balance contribution_amount; (* @error: Integer underflow. *)
  new_contributions = builtin sub current_contributions contribution_amount;
  
  is_zero = builtin eq new_balance zero; match is_zero with
    | True => delete balances[_sender]
    | False => balances[_sender] := new_balance
    end;

  (* Compute new S$I reserve *)
  new_ssi_reserve = builtin sub ssi_reserve ssi_amount;
  
  ver <- version;
  is_empty = builtin eq new_ssi_reserve zero; match is_empty with
    | True =>
      (* Make transfers *)
      TransferFunds ssi_address _sender ssi_reserve;
      TransferFunds token_addr _sender token_reserve;
      
      (* Update reserves *)
      zero_reserves = Pair{ Uint128 Uint128 } zero zero; reserves := zero_reserves;
      contributions := zero;
      total_supply := zero;
      delete balances[_sender];

      e = { _eventname: "SSIDApp_RemoveLiquidity"; version: ver;
        sender: _sender;
        contribution: contribution_amount;
        dollars: ssi_reserve;
        tokens: token_reserve;
        tokenAddr: token_addr;
        ssiReserve: zero;
        tokenReserve: zero;
        totalContributions: zero }; event e
    | False =>
      (* Make transfers & update shares *)
      TransferFunds ssi_address _sender ssi_amount;
      TransferFunds token_address _sender token_amount;

      (* Update reserves *)
      new_token_reserve = builtin sub token_reserve token_amount;
      new_reserves = Pair{ Uint128 Uint128 } new_ssi_reserve new_token_reserve;
      reserves := new_reserves;
      contributions := new_contributions;

      e = { _eventname: "SSIDApp_RemoveLiquidity"; version: ver;
        sender: _sender;
        contribution: contribution_amount;
        dollars: ssi_amount;
        tokens: token_amount;
        tokenAddr: token_addr;
        ssiReserve: new_ssi_reserve;
        tokenReserve: new_token_reserve;
        totalContributions: new_contributions }; event e
    end;
  Timestamp
end

(* Swaps between the S$I dollar & the community token.
      @param token0_address: Address of the input token.
      @param token1_address: Address of the output token. *)
transition SwapExactTokensForTokens(
  token0_address: ByStr20,
  token1_address: ByStr20,
  token0_amount: Uint128,
  min_token1_amount: Uint128,
  deadline_block: BNum,
  recipient_address: ByStr20
  )
  RequireNotPaused; ThrowIfZero token0_amount; ThrowIfZero min_token1_amount;
  ThrowIfExpired deadline_block; ThrowIfNullAddr recipient_address;
  FetchServiceAddr token_id;
  get_ssi_addr <- services[ssi_id]; ssi_address = option_bystr20_value get_ssi_addr; ThrowIfNullAddr ssi_address;
  get_token_addr <- services[token_id]; token_address = option_bystr20_value get_token_addr; ThrowIfNullAddr token_address;
  
  is_ssi_to_token = is_input_output token0_address ssi_address token1_address token_address;
  is_token_to_ssi = is_input_output token0_address token_address token1_address ssi_address;
  is_valid = orb is_ssi_to_token is_token_to_ssi; match is_valid with
    | True => | False => err = CodeNotValid; code = Int32 10; ThrowError err code
    end;

  after_fee <- profit_denom;
  current_reserves <- reserves;
  ssi_reserve = let fst_element = @fst Uint128 Uint128 in fst_element current_reserves;
  token_reserve = let snd_element = @snd Uint128 Uint128 in snd_element current_reserves;

  ver <- version;
  match is_ssi_to_token with
    | True => (* Swap S$I for tokens *)
      ssi_amount = token0_amount;
      
      (* Check fair launch *)
      is_fl <- is_fairlaunch;
      match is_fl with
      | True =>
        IsAffiliationSufficient ssi_amount; (* At least 10 S$ *)
        current_flamount <- fl_amount; current_fllimit <- fl_limit;
        available = builtin sub current_fllimit current_flamount;
        IsSufficient available ssi_amount;

        FetchServiceAddr sgd_id; get_sgd_addr <- services[sgd_id];
        sgd_addr = option_bystr20_value get_sgd_addr; ThrowIfNullAddr sgd_addr;

        current_fladdr <- fl_addr;
        (* Make transfers *)
        current_x <- x;
        sgd_amt = builtin div ssi_amount current_x;
        msg_to_sgd = { _tag: "TransferFrom"; _recipient: sgd_addr; _amount: zero;
          from: _sender;
          to: current_fladdr;
          amount: sgd_amt };

        current_price <- price; current_mul <- ml;
        token_amt = compute_token ssi_amount current_price current_mul;
        msg_to_token = { _tag: "TransferFrom"; _recipient: token_address; _amount: zero;
          from: current_fladdr;
          to: recipient_address;
          amount: token_amt
        }; msgs = two_msgs msg_to_sgd msg_to_token; send msgs;

        new_flamount = builtin add current_flamount ssi_amount; fl_amount := new_flamount;
        is_fl_on = builtin lt new_flamount current_fllimit;
        match is_fl_on with (* @review add txn to turn off fl*)
        | True => | False => is_fairlaunch := false
        end;
        
        e = { _eventname: "SwapSGDForToken"; version: ver;
          originator: _sender;
          beneficiary: recipient_address;
          tokenAddr: token_address;
          sgdAddr: sgd_addr;
          tokens: token_amt;
          sgdollars: sgd_amt }; event e
      | False =>
        token_amount = get_output ssi_amount ssi_reserve token_reserve after_fee;

        (* Check limits *)
        is_valid_token = uint128_ge token_amount min_token1_amount; match is_valid with
          | True => | False => err = CodeNotValid; code = Int32 11; ThrowError err code
          end;

        (* Make transfers *)
        TransferFundsFrom ssi_address ssi_amount; (* The fee goes into the S$I reserve *)
        TransferFunds token_address recipient_address token_amount;

        (* Update reserves *)
        new_ssi_reserve = builtin add ssi_reserve ssi_amount;
        new_token_reserve = builtin sub token_reserve token_amount;
        new_reserves = Pair{ Uint128 Uint128 } new_ssi_reserve new_token_reserve;
        reserves := new_reserves;

        e = { _eventname: "SwapSSIForToken"; version: ver;
          originator: _sender;
          beneficiary: recipient_address;
          tokenAddr: token_address;
          tokens: token_amount;
          dollars: ssi_amount;
          ssiReserve: new_ssi_reserve;
          tokenReserve: new_token_reserve }; event e
      end
    | False => (* Swap tokens for S$I *)
      token_amount = token0_amount;
      ssi_amount = get_output token_amount token_reserve ssi_reserve after_fee;

      (* Check limits *)
      is_valid_ssi = uint128_ge ssi_amount min_token1_amount; match is_valid with
        | True => | False => err = CodeNotValid; code = Int32 12; ThrowError err code
        end;

      (* Make transfers *)
      TransferFundsFrom token_address token0_amount; (* The fee goes into the Token reserve *)
      TransferFunds ssi_address recipient_address ssi_amount;

      (* Update reserves *)
      new_ssi_reserve = builtin sub ssi_reserve ssi_amount;
      new_token_reserve = builtin add token_reserve token_amount;
      new_reserves = Pair{ Uint128 Uint128 } new_ssi_reserve new_token_reserve;
      reserves := new_reserves;

      e = { _eventname: "SwapTokenForSSI"; version: ver;
        originator: _sender;
        beneficiary: recipient_address;
        tokenAddr: token_address;
        tokens: token_amount;
        dollars: ssi_amount;
        ssiReserve: new_ssi_reserve;
        tokenReserve: new_token_reserve }; event e
    end;
  Timestamp
end

transition JoinCommunity(
  domain: ByStr32,
  subdomain: Option String,
  amount: Uint128
  )
  RequireNotPaused;
  
  (* Verify & register NFT domain *)
  ssi_init <-& init.dApp;
  VerifyController domain ssi_init;
  registry[_sender] := domain;
  
  (* Get balance *)
  get_balance <- balances[_sender]; balance = option_uint128_value get_balance;
  IsSufficient balance amount;
  
  get_community_balance <- community_balances[domain]; community_balance = option_uint128_value get_community_balance;
  new_community_balance = builtin add community_balance amount;

  current_limit <- limit;
  is_below = uint128_le new_community_balance current_limit; match is_below with
    | True => | False =>
      subdomain_ = option_string_value subdomain; ThrowIfNullString subdomain_;

      (* Get SBT *)
      is_did = builtin eq subdomain_ did; match is_did with (* Defaults to true in VerifyController *)
      | True => | False =>
        ssi_did <- didxwallet; match ssi_did with
        | None => err = CodeDidIsNull; code = Int32 13; ThrowError err code
        | Some did_ =>
          get_addr <-& did_.did_domain_dns[subdomain_];
          addr = option_bystr20_value get_addr; ThrowIfNullAddr addr;
          xwallet := addr
        end
      end;

      xwallet_ <- xwallet;
      get_xwallet <-& xwallet_ as ByStr20 with contract
        field ivms101: Map String String,
        field sbt: Map String ByStr64 end;
      VerifySBT domain ssi_init get_xwallet;
      xwallet := zero_addr; didxwallet := none_byStr20
    end;

  UpdateShares add _sender amount; 

  (* Update balance *)
  new_balance = builtin sub balance amount;
  is_zero = builtin eq new_balance zero; match is_zero with
    | True => (* Clean space *)
      delete balances[_sender]
    | False =>
      balances[_sender] := new_balance
    end;
  Timestamp
end

(* @review events and error codes *)
(* The caller (_sender) must control the NFT domain name *)
transition LeaveCommunity(amount: Uint128 )
  RequireNotPaused;
  UpdateShares remove _sender amount;

  (* Update balance *)
  get_balance <- balances[_sender]; balance = option_uint128_value get_balance;
  new_balance = builtin add balance amount; balances[_sender] := new_balance;
  Timestamp
end

transition RevokeSBT(
  domain: ByStr32
  )
  RequireNotPaused;
  IsSender sbt_issuer;
  delete sbt[domain];
  Timestamp
end

(* Adds rewards. *)
transition RecipientAcceptTransfer(
  sender : ByStr20,
  recipient : ByStr20,
  amount : Uint128
  )
  RequireNotPaused;
  ssi_init <-& init.dApp; VerifyOwner ssi_init;
  ThrowIfDifferentAddr recipient _this_address;
  FetchServiceAddr token_id;
  get_ssi_addr <- services[ssi_id]; ssi_address = option_bystr20_value get_ssi_addr; ThrowIfNullAddr ssi_address;
  
  is_ssi = builtin eq ssi_address _sender; match is_ssi with
    | True =>
      get_token_addr <- services[token_id]; token_address = option_bystr20_value get_token_addr; ThrowIfNullAddr token_address;
      
      current_reserves <- reserves;
      ssi_reserve = let fst_element = @fst Uint128 Uint128 in fst_element current_reserves;
      token_reserve = let snd_element = @snd Uint128 Uint128 in snd_element current_reserves;

      (* Update reserves *)
      new_ssi_reserve = builtin add ssi_reserve amount;
      new_reserves = Pair{ Uint128 Uint128 } new_ssi_reserve token_reserve;
      reserves := new_reserves;

      current_contributions <- contributions; ThrowIfZero current_contributions;
      contribution_amount =
        let contribution = let two = Uint128 2 in builtin div amount two in
        fraction contribution ssi_reserve current_contributions;
      new_contributions = builtin add current_contributions contribution_amount;

      contributions := new_contributions;
      ver <- version; e = { _eventname: "SSIDApp_AddRewards"; version: ver;
        contribution: contribution_amount;
        dollars: amount;
        tokenAddr: token_address;
        ssiReserve: new_ssi_reserve;
        tokenReserve: token_reserve;
        totalContributions: new_contributions }; event e
    | False =>
      err = CodeNotValid; code = Int32 14; ThrowError err code
    end;
  Timestamp
end

(* Moves an amount of LP tokens from the caller to the beneficiary.
    Caller (_sender) must be the token owner.
    Balance of the _sender (originator) decreases & balance of the beneficiary increases.
      @param to: Address of the beneficiary.
      @param amount: Number of LP tokens sent. *)
transition Transfer(
  to: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; RequireNotLPTokenPaused;
  
  TransferIfSufficientBalance _sender to amount;
  ver <- version; e = { _eventname: "TransferSuccess"; version: ver;
    sender: _sender;
    recipient: to;
    amount: amount }; event e;
  
  (* Prevent using contracts that do not support Transfer of tokens *)
  msg_to_beneficiary = { _tag: "RecipientAcceptTransfer"; _recipient: to; _amount: zero;
    sender: _sender;
    recipient: to;
    amount: amount };
  msg_to_originator = { _tag: "TransferSuccessCallBack"; _recipient: _sender; _amount: zero;
    sender: _sender;
    recipient: to;
    amount: amount
  }; msgs = two_msgs msg_to_beneficiary msg_to_originator; send msgs;
  Timestamp
end

(* Increases the allowance of the spender over the LP tokens of the caller.
    The caller (_sender) must be the token owner.
      @param spender: Address of the approved spender.
      @param amount: Number of LP tokens increased as allowance for the spender. *)
transition IncreaseAllowance(
  spender: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; RequireNotLPTokenPaused;
  ThrowIfSameAddr spender _sender; ThrowIfNullAddr spender; ThrowIfSameAddr spender _this_address;
  
  get_allowance <- allowances[_sender][spender]; allowance = option_uint128_value get_allowance;
  new_allowance = builtin add allowance amount; allowances[_sender][spender] := new_allowance;
  
  ver <- version; e = { _eventname: "SSIDApp_IncreasedAllowance"; version: ver;
    token_owner: _sender;
    spender: spender;
    new_allowance: new_allowance }; event e;
  Timestamp
end

(* Decreases the allowance of the spender over the LP tokens of the caller.
    The caller (_sender) must be the token owner.
      @param spender: Address of the approved spender.
      @param amount: Number of LP tokens decreased for the spender allowance. *)
transition DecreaseAllowance(
  spender: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; RequireNotLPTokenPaused;
  ThrowIfSameAddr spender _sender; ThrowIfNullAddr spender; ThrowIfSameAddr spender _this_address;

  get_allowance <- allowances[_sender][spender]; allowance = option_uint128_value get_allowance;
  
  is_valid = uint128_le amount allowance; match is_valid with
    | True =>
      new_allowance = builtin sub allowance amount; allowances[_sender][spender] := new_allowance;
      ver <- version; e = { _eventname: "SSIDApp_DecreasedAllowance"; version: ver;
        token_owner: _sender;
        spender: spender;
        new_allowance: new_allowance }; event e
    | False =>
      (* Interpret it as a request to delete the spender data *)
      delete allowances[_sender][spender]
    end;
  Timestamp
end

(* Moves a given amount of LP tokens from one address to another using the allowance mechanism.
    Caller must be an approved spender & their allowance decreases.
    Balance of the token owner (originator) decreases & balance of the recipient (beneficiary) increases.
      @param from: Address of the originator.
      @param to: Address of the beneficiary.
      @param amount: Number of LP tokens transferred. *)
transition TransferFrom(
  from: ByStr20,
  to: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; RequireNotLPTokenPaused;

  get_allowance <- allowances[from][_sender]; allowance = option_uint128_value get_allowance;
  IsSufficient allowance amount;
  
  TransferIfSufficientBalance from to amount;
  ver <- version; e = { _eventname: "SSIDApp_TransferFromSuccess"; version: ver;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount }; event e;
  new_allowance = builtin sub allowance amount; allowances[from][_sender] := new_allowance;
  
  (* Prevent using contracts that do not support TransferFrom of tokens *)
  msg_to_spender = { _tag: "TransferFromSuccessCallBack"; _recipient: _sender; _amount: zero;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount };
  msg_to_beneficiary = { _tag: "RecipientAcceptTransferFrom"; _recipient: to; _amount: zero;
    initiator: _sender;
    sender: from;
    recipient: to;
    amount: amount
  }; msgs = two_msgs msg_to_spender msg_to_beneficiary; send msgs;
  Timestamp
end
`;

      const init_fladdr = "0x510B5c7cAb4412A7Be40fc53023717dF0cb756a0" //token.ssi @todo
      const contract_init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "contract_owner",
          type: "ByStr20",
          value: `${address}`,
        },
        {
          vname: "init_nft",
          type: "ByStr32",
          value: `${init_nft}`,
        },
        {
          vname: "init",
          type: "ByStr20",
          value: `${init_tyron}`,
        },
        {
          vname: "token_id", //@xalkan_comm
          type: "String",
          value: "tyron",
        },
        {
          vname: "init_fee", //@xalkan_comm
          type: "Uint256",
          value: "9900",
        },
        {
          vname: "init_fladdr",
          type: "ByStr20",
          value: `${init_fladdr}`,//@xalkan_comm
        },
        {
          vname: "init_fund",
          type: "String",
          value: `${init_fund}`,//@xalkan_comm
        },
        {
          vname: "init_supply",
          type: "Uint128",
          value: "0",//@xalkan_comm
        },
        {
          vname: "name", //@xalkan_comm
          type: "String",
          value: "Tyron-S$I Liquidity Pool Token",
        },
        {
          vname: "symbol",
          type: "String",
          value: "tyronS$I",//@xalkan_comm
        },
        {
          vname: "decimals",
          type: "Uint32",
          value: "18",//@xalkan_comm
        },
        {
          vname: "sbt_issuer", //@xalkan_comm
          type: "String",
          value: "tyron",
        },
        {
          vname: "issuer_subdomain", //@xalkan_comm
          type: "String",
          value: "soul",
        },
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "100000",
        gasPrice: "2000000000",
      });
      toast.info("Contract successfully deployed.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  async deployStableImpl(net: string, init_controller: string) {
    try {
      let proxy = "";
      let init_token = "";
      let init_community = "";
      if (net === "testnet") {
        proxy = "0xb8dc094ad8e34d4bec3076afa8bd52a3e73f8221";
        init_token = "zil1r054sd9p4s5pdg9l8pywshj4f3rqnmk0k4va8u";
        init_community = "zil16wfanev6gpvx3yeuncc8mcld38nuvu6pu2uqg9";
      }

      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      const code = `
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
        `;
      const contract_init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "init_controller",
          type: "ByStr20",
          value: `${init_controller}`,
        },
        {
          vname: "proxy",
          type: "ByStr20",
          value: `${proxy}`,
        },
        {
          vname: "init_token",
          type: "ByStr20",
          value: `${init_token}`,
        },
        {
          vname: "init_community",
          type: "ByStr20",
          value: `${init_community}`,
        },
      ];

      const contract = contracts.new(code, contract_init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
        gasPrice: "2000000000",
      });
      toast.info("You successfully deployed a new stablecoin implementation.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  // SSI DNS v0.8
  async deploySsiDapp(net: string, address: string) {
    try {
      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      let network = tyron.DidScheme.NetworkNamespace.Mainnet;

      //mainnet addresses
      let init_tyron = "0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9";
      let ud = '0x9611c53be6d1b32058b2747bdececed7e1216793'//"zil1jcgu2wlx6xejqk9jw3aaankw6lsjzeunx2j0jz";

      if (net === "testnet") {
        network = tyron.DidScheme.NetworkNamespace.Testnet;
        init_tyron = "0xec194d20eab90cfab70ead073d742830d3d2a91b";
        ud = '0xb925add1d5eaf13f40efd43451bf97a22ab3d727'//"zil1hyj6m5w4atcn7s806s69r0uh5g4t84e8gp6nps";
      }
      //@xalkan
      const code =
        `
        (* SSI DNS v0.8
          SSI Domain Name System that includes the Zilliqa-Reference-Contract #6 standard (which has an SPDX-License-Identifier: MIT)
          Self-Sovereign Identity Protocol
          Copyright Tyron Mapu Community Interest Company 2023. All rights reserved.
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
          If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at tyron@ssiprotocol.com.*)
          
          scilla_version 0
          
          (***************************************************)
          (*               Associated library                *)
          (***************************************************)
          import RegistryLib as Registry BoolUtils ListUtils IntUtils PairUtils
          library NonfungibleToken
          
          type Operation =
          | Add
          | Sub
          
          (* Global variables *)
          let zero_address = 0x0000000000000000000000000000000000000000
          let zero_bystr32 = 0x0000000000000000000000000000000000000000000000000000000000000000
          let false = False
          let true = True
          let zero = Uint256 0
          let zero_128 = Uint128 0
          let one = Uint256 1
          let empty_string = ""
          let zilID = "zil"
          
          let add_operation = Add
          let sub_operation = Sub
          let min_fee_bps = Uint128 1
          let max_fee_bps = Uint128 10000
          
          (* Library functions *)
          let one_msg = 
            fun (msg: Message) => 
              let nil_msg = Nil {Message} in
              Cons {Message} msg nil_msg
          
          let two_msgs =
            fun (msg1: Message) =>
            fun (msg2: Message) =>
              let msgs_tmp = one_msg msg2 in
              Cons {Message} msg1 msgs_tmp
          
          let get_bal =
            fun (maybe_bal: Option Uint256) =>
              match maybe_bal with
              | None => zero
              | Some bal => bal
              end
          
          (* Error exception *)
          type Error =
            | NotPausedError
            | PausedError
            | SelfError
            | NotContractOwnerError
            | NotTokenOwnerError
            | NotOwnerOrOperatorError
            | SpenderFoundError
            | OperatorNotFoundError
            | OperatorFoundError
            | NotAllowedToTransferError
            | TokenNotFoundError
            | InvalidFeeBPSError
            | ZeroAddressDestinationError
            | ThisAddressDestinationError
            | DomainNotValidError
            | DomainTakenError
          
          let make_error =
            fun (result: Error) =>
              let result_code = 
                match result with
                | NotPausedError                     => Int32 -1
                | PausedError                        => Int32 -2
                | SelfError                          => Int32 -3
                | NotContractOwnerError              => Int32 -4
                | NotTokenOwnerError                 => Int32 -5
                | NotOwnerOrOperatorError            => Int32 -7
                | SpenderFoundError                  => Int32 -10
                | OperatorNotFoundError              => Int32 -11
                | OperatorFoundError                 => Int32 -12
                | NotAllowedToTransferError          => Int32 -13
                | TokenNotFoundError                 => Int32 -14
                | InvalidFeeBPSError                 => Int32 -15
                | ZeroAddressDestinationError        => Int32 -16
                | ThisAddressDestinationError        => Int32 -17
                | DomainNotValidError                => Int32 -19
                | DomainTakenError                   => Int32 -20
                end
              in
              { _exception: "Error"; code: result_code }
          
            let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
              match input with
              | Some v => v
              | None => default end
            let option_bystr20_value = let f = @option_value ByStr20 in f zero_address
            let option_bystr32_value = let f = @option_value ByStr32 in f zero_bystr32
            
          (***************************************************)
          (*             The contract definition             *)
          (***************************************************)
          
          contract NonfungibleToken
          (
            init_nft: ByStr32,
            init: ByStr20 with contract field dApp: ByStr20 with contract
              field implementation: ByStr20 with contract
                field utility: Map String Map String Uint128 end,
              field did_dns: Map String ByStr20 with contract
                field controller: ByStr20,
                field services: Map String ByStr20 end end end,
            initial_contract_owner: ByStr20,
            (* Initial Base URI. e.g. 'https://creatures-api.zilliqa.com/api/creature/' *)
            initial_base_uri: String,
            name: String,
            symbol: String,
            init_dns: Map ByStr32 ByStr20
          )
          
          (* Contract constraints *)
          with
            (* 'initial_contract_owner' must not be the zero address *)
            let is_contract_owner_invalid = builtin eq initial_contract_owner zero_address in 
            (* 'init_nft' must not be the zero ByStr32 *)
            let is_nft_invalid = builtin eq init_nft zero_bystr32 in 
            let is_owner_or_nft_invalid = orb is_contract_owner_invalid is_nft_invalid in
            (* 'name' must not be an empty string *)
            let is_name_invalid = builtin eq name empty_string in
            (* 'symbol' must not be an empty string *)
            let is_symbol_invalid = builtin eq symbol empty_string in
            (* Check if any parameter is invalid *)
            let is_name_or_symbol_invalid = orb is_name_invalid is_symbol_invalid in
          
            let is_invalid = orb is_contract_owner_invalid is_name_or_symbol_invalid in
            negb is_invalid
          =>
          
          (* Mutable fields *)
          field nft_domain: ByStr32 = init_nft
          field pending_domain: ByStr32 = zero_bystr32
          
          (* Emergency stop mechanism *)
          (* Defaults to False *)
          field is_paused: Bool = false
          field is_paused_migration: Bool = false (* Whether the migration is paused or not. *)
          
          (* Token Name *)
          (* Defaults to 'name' *)
          (* No need to mutate this field since this is for remote fetch to retrieve the immutable parameter. *)
          field token_name: String = name
          
          (* Token Symbol *)
          (* Defaults to 'symbol' *)
          (* No need to mutate this field since this is for remote fetch to retrieve the immutable parameter. *)
          field token_symbol: String = symbol
          
          (* Contract Owner *)
          (* Defaults to 'initial_contract_owner' *) 
          field contract_owner: ByStr20 = initial_contract_owner
          
          (* Contract ownership recipient *)
          (* Defaults to 'zero_address'*)
          field contract_ownership_recipient: ByStr20 = zero_address
          
          (* Address to send royalties to *)
          (* Defaults to 'initial_contract_owner' *)
          field royalty_recipient: ByStr20 = initial_contract_owner
          
          (* Royalty fee BPS *)
          (* e.g. 1 = 0.01%, 10000 = 100% *)
          (* Defaults to 1000 *)
          field royalty_fee_bps: Uint128 = Uint128 1000
          
          (* Base URI *)
          (* Defaults to 'initial_base_uri' *)
          field base_uri: String = initial_base_uri
          
          (* Token URIs *)
          field token_uris: Map Uint256 String = Emp Uint256 String
          
          (* NFT domains per token ID *)
          field token_domains: Map Uint256 ByStr32 = Emp Uint256 ByStr32
          
          (* Mapping from token ID to its owner *)
          field token_owners: Map Uint256 ByStr20 = Emp Uint256 ByStr20
          field nft_domain_names: Map ByStr32 Uint256 = Emp ByStr32 Uint256
          field nft_dns: Map ByStr32 ByStr20 = init_dns (* Emp ByStr32 ByStr20 *)
          
          (* The total number of tokens minted *)
          field token_id_count: Uint256 = Uint256 0
          
          (* The total number of existing tokens *)
          field total_supply: Uint256 = Uint256 0
          
          (* Mapping from token owner to the number of existing tokens *)
          field balances: Map ByStr20 Uint256 = Emp ByStr20 Uint256
          
          (* Set for minters *)
          (* 'initial_contract_owner' is a minter by default *)
          field minters: Map ByStr20 Bool =
              let emp_map = Emp ByStr20 Bool in
              builtin put emp_map initial_contract_owner true
          
          (* Mapping from token ID to a spender *)
          field spenders: Map Uint256 ByStr20 = Emp Uint256 ByStr20
          
          (* Mapping from token owner to operators authorized by the token owner *)
          field operators: Map ByStr20 (Map ByStr20 Bool) = Emp ByStr20 (Map ByStr20 Bool)
          
          (* The smart contract @version *)
          field version: String = "SSIDNS_0.8.0"
          
          (* Emit Errors *)
          procedure Throw(error: Error)
            e = make_error error;
            throw e
          end
          
          procedure RequireNotPaused()
            (* Reference: *)
            (* https://consensys.github.io/smart-contract-best-practices/general_philosophy/#prepare-for-failure *)
            paused <- is_paused;
            match paused with
            | False =>
            | True =>
              (* Contract is paused *)
              error = PausedError;
              Throw error
            end
          end
          
          procedure ThrowIfNullHash( input: ByStr32 )
            is_null = builtin eq input zero_bystr32; match is_null with
              | False => | True => e = DomainNotValidError; Throw e end end
          
          procedure RequireNotTaken(domain_id: ByStr32)
            ThrowIfNullHash domain_id;
            is_taken <- exists nft_dns[domain_id];
            match is_taken with
            | True => (* The NFT Domain Name is in the NFT DNS *)
              error = DomainTakenError;
              Throw error
            | False =>
            end
          end
          
          procedure RequireNotRegistered(domain_id: ByStr32)
            ThrowIfNullHash domain_id;
            is_registered <- exists nft_domain_names[domain_id];
            match is_registered with
            | True => (* The NFT Domain Name is in the registry *)
              error = DomainTakenError;
              Throw error
            | False =>
            end
          end
          
          procedure RequireValidRoyaltyFee(fee_bps: Uint128)
            is_gte_min = uint128_ge fee_bps min_fee_bps;
            is_lte_max = uint128_le fee_bps max_fee_bps;
            
            is_valid = andb is_gte_min is_lte_max;
            match is_valid with 
              | True => 
              | False =>
                error = InvalidFeeBPSError;
                Throw error
            end
          end
          
          procedure VerifyOrigin( addr: ByStr20 )
            verified = builtin eq _origin addr; match verified with
              | True => | False => ver <- version; e = { _exception: "SSIDApp-WrongCaller"; version: ver }; throw e end end
          
          procedure RequireContractOwner()
            id <- nft_domain; current_init <-& init.dApp;
            domain = builtin to_string id;
            get_did <-& current_init.did_dns[domain]; match get_did with
            | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e
            | Some did_ =>
                controller <-& did_.controller; VerifyOrigin controller end end
          
          procedure RequireNotSelf(address_a: ByStr20, address_b: ByStr20)
            is_self = builtin eq address_a address_b;
            match is_self with
            | False =>
            | True =>
              error = SelfError;
              Throw error
            end
          end
          
          (* ZRC6 'RequireExistingToken' is declared but never used
          procedure RequireExistingToken(token_id: Uint256)
            has_token <- exists token_owners[token_id];
            match has_token with
            | True =>
            | False =>
              error = TokenNotFoundError;
              Throw error
            end
          end
          *)
          
          procedure RequireValidDestination(to: ByStr20)
            (* Reference: https://github.com/ConsenSys/smart-contract-best-practices/blob/master/docs/tokens.md *)
            is_zero_address = builtin eq to zero_address;
            match is_zero_address with
            | False =>
            | True =>
              error = ZeroAddressDestinationError;
              Throw error
            end;
          
            is_this_address = builtin eq to _this_address;
            match is_this_address with
            | False =>
            | True =>
              error = ThisAddressDestinationError;
              Throw error
            end
          end
          
          procedure RequireOwnerOrOperator(address: ByStr20)
            is_owner = builtin eq _sender address;
            has_operator <- exists operators[address][_sender];
            is_allowed = orb is_owner has_operator;
            match is_allowed with
            | True =>
            | False =>
              error = NotOwnerOrOperatorError;
              Throw error
            end
          end
          
          procedure RequireAccessToTransfer(token_owner: ByStr20, token_id: Uint256)  
            (* check if _sender is token owner *)
            is_token_owner = builtin eq token_owner _sender;
            
            (* check if _sender is spender *)
            maybe_spender <- spenders[token_id];
            is_spender = match maybe_spender with
              | None => False
              | Some spender => 
                builtin eq spender _sender
              end;
          
            (* check if _sender is operator *)
            is_operator <- exists operators[token_owner][_sender];
            
            is_spender_or_operator = orb is_spender is_operator;
            is_allowed = orb is_spender_or_operator is_token_owner;
            match is_allowed with
            | True =>
            | False =>
              error = NotAllowedToTransferError;
              Throw error
            end
          end
          
          procedure UpdateBalance(operation: Operation, address: ByStr20)
            match operation with
            | Add =>
              maybe_count <- balances[address];
              new_count = 
                let cur_count = get_bal maybe_count in
                (* if overflow occurs, it throws CALL_CONTRACT_FAILED *)
                builtin add cur_count one;
              balances[address] := new_count
            | Sub =>
              maybe_count <- balances[address];
              new_count = 
                let cur_count = get_bal maybe_count in
                (* if underflow occurs, it throws CALL_CONTRACT_FAILED *)
                builtin sub cur_count one;
              balances[address] := new_count
            end
          end
          
          procedure HandlePayment(id_: Pair String String)
            payment_id = let fst_element = @fst String String in fst_element id_;
            txID = let snd_element = @snd String String in snd_element id_;
            current_init <-& init.dApp; current_impl <-& current_init.implementation;
            get_fee <-& current_impl.utility[payment_id][txID]; match get_fee with
            | None => ver <- version; e = { _exception : "SSIDApp-FeeIsNull"; version: ver }; throw e
            | Some fee =>
              is_zero = builtin eq zero_128 fee; match is_zero with
              | True =>
              | False => 
                id <- nft_domain; domain = builtin to_string id;
                get_did <-& current_init.did_dns[domain]; match get_did with
                  | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e
                  | Some didx =>
                    is_zil = builtin eq payment_id zilID; match is_zil with
                      | True =>
                        not_enough = builtin lt _amount fee; match not_enough with
                          | True => ver <- version; e = { _exception : "SSIDApp-InsufficientZIL"; version: ver }; throw e
                          | False =>
                            accept; msg = let m = { _tag: "AddFunds"; _recipient: didx; _amount: fee } in one_msg m; send msg;
                            refund = builtin sub _amount fee; zero_refund = builtin eq refund zero_128; match zero_refund with
                            | True => | False => rmsg = let m = { _tag: "AddFunds"; _recipient: _sender; _amount: refund } in one_msg m; send rmsg end end
                      | False =>
                        initId = "init"; get_impl_did <-& current_init.did_dns[initId]; match get_impl_did with
                          | None => ver <- version; e = { _exception: "SSIDApp-InitDidIsNull"; version: ver }; throw e
                          | Some did_ =>
                            get_token_addr <-& did_.services[payment_id]; token_addr = option_bystr20_value get_token_addr;
                            msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero_128;
                              from: _sender;
                              to: didx;
                              amount: fee } in one_msg m; send msg end end end end end end
          
          transition TransferFromSuccessCallBack(
            initiator: ByStr20,
            sender: ByStr20,
            recipient: ByStr20,
            amount: Uint128
            )
            RequireNotPaused;
            is_valid = builtin eq initiator _this_address; match is_valid with
              | True => | False => ver <- version; e = { _exception : "SSIDApp-WrongInitiator"; version: ver }; throw e end end
          
          procedure HandleBatchPayment(payment_id: String, txID: String, counter: Uint32 )
            current_init <-& init.dApp; current_impl <-& current_init.implementation;
            get_fee <-& current_impl.utility[payment_id][txID]; match get_fee with
            | None => e = { _exception : "SSIDNS-FeeIsNull" }; throw e
            | Some fee_ =>
              get_counter = builtin to_uint128 counter; counter_ = match get_counter with
              | Some c => c
              | None => Uint128 0 (* should never happen *)
              end;
              fee = builtin mul fee_ counter_;
              id <- nft_domain; domain = builtin to_string id;
              get_did <-& current_init.did_dns[domain]; match get_did with
                | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e
                | Some didx =>
                  is_zil = builtin eq payment_id zilID; match is_zil with
                    | True =>
                      not_enough = builtin lt _amount fee; match not_enough with
                        | True => ver <- version; e = { _exception : "SSIDApp-InsufficientZIL"; version: ver }; throw e
                        | False =>
                          accept; msg = let m = { _tag: "AddFunds"; _recipient: didx; _amount: fee } in one_msg m; send msg;
                          refund = builtin sub _amount fee; is_zero = builtin eq refund zero_128; match is_zero with
                          | True => | False => rmsg = let m = { _tag: "AddFunds"; _recipient: _sender; _amount: refund } in one_msg m; send rmsg end end
                    | False =>
                      initId = "init"; get_impl_did <-& current_init.did_dns[initId]; match get_impl_did with
                        | None => ver <- version; e = { _exception: "SSIDApp-InitDidIsNull"; version: ver }; throw e
                        | Some did_ =>
                          get_token_addr <-& did_.services[payment_id]; token_addr = option_bystr20_value get_token_addr;
                          msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero_128;
                            from: _sender;
                            to: didx;
                            amount: fee } in one_msg m; send msg end end end end end
          
          (* @Requirements: *)
          (* - 'to' must not be the zero address. Otherwise, it must throw 'ZeroAddressDestinationError' *)
          (* - 'to' must not be '_this_address'. Otherwise, it must throw 'ThisAddressDestinationError' *)
          (* - '_sender' must be a minter. Otherwise, it must throw 'NotMinterError' *)
          procedure MintToken(to: ByStr20)
            RequireValidDestination to;
          
            (*IsMinter _sender;*)
          
            (* generate ID *)
            current_token_id_count <- token_id_count;
            new_token_id_count = builtin add current_token_id_count one;
            token_id_count := new_token_id_count;
            
            (* mint a new token *)
            token_owners[new_token_id_count] := to;
          
            (* add one to the token owner balance *)
            UpdateBalance add_operation to;
            
            (* add one to the total supply *)
            current_supply <- total_supply;
            new_supply = builtin add current_supply one;
            total_supply := new_supply
          end
          
          procedure SetTokenURI(token_id: Uint256, token_uri: String)
            is_empty_string = builtin eq token_uri empty_string;
            match is_empty_string with 
            | True => 
              (* noop *)
            | False =>
              token_uris[token_id] := token_uri
            end
          end
          
          procedure HandleMint(info: Pair ByStr20 String)
            match info with
            | Pair to token_uri =>
              domain_id = builtin sha256hash token_uri;
              RequireNotTaken domain_id;
              MintToken to;
              token_id <- token_id_count;
              token_domains[token_id] := domain_id; 
              SetTokenURI token_id token_uri;
              nft_domain_names[domain_id] := token_id;
              nft_dns[domain_id] := to
            end
          end
          
          (* @Requirements: *)
          (* - 'token_id' must exist. Otherwise, it must throw 'TokenNotFoundError' *)
          (* - '_sender' must be a token owner or an operator. Otherwise, it must throw 'NotOwnerOrOperatorError' *)
          procedure BurnToken(token_id: Uint256)
            (* Check if token exists *)
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              RequireOwnerOrOperator token_owner;
              (* Destroy existing token *)
              delete token_owners[token_id];
              delete token_uris[token_id];
              delete spenders[token_id];
          
              get_domain_id <- token_domains[token_id]; domain_id = option_bystr32_value get_domain_id;
              delete nft_domain_names[domain_id];
              delete nft_dns[domain_id];
              delete token_domains[token_id];
          
              (* subtract one from the balance *)
              UpdateBalance sub_operation token_owner;
              (* subtract one from the total supply *)
              current_supply <- total_supply;
              new_supply = builtin sub current_supply one;
              total_supply := new_supply;
          
              e = {
                _eventname: "Burn";
                token_owner: token_owner;
                token_id: token_id
              };
              event e
            end
          end
          
          (* @Requirements: *)
          (* - 'to' must not be the zero address. Otherwise, it must throw 'ZeroAddressDestinationError' *)
          (* - 'to' must not be '_this_address'. Otherwise, it must throw 'ThisAddressDestinationError' *)
          (* - 'token_id' must exist. Otherwise, it must throw 'TokenNotFoundError' *)
          (* - '_sender' must be a token owner, spender, or operator. Otherwise, it must throw 'NotAllowedToTransferError' *)
          (* - '_sender' must not be 'to'. Otherwise, it must throw 'SelfError' *)
          procedure TransferToken(to: ByStr20, token_id: Uint256)
            RequireValidDestination to;
          
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              RequireAccessToTransfer token_owner token_id;
              RequireNotSelf token_owner to;
              
              (* change token_owner for that token_id *)
              token_owners[token_id] := to;
          
              delete spenders[token_id];
          
              (* subtract one from previous token owner balance *)
              UpdateBalance sub_operation token_owner;
              (* add one to the new token owner balance *)
              UpdateBalance add_operation to;
          
              e = {
                _eventname: "TransferFrom"; 
                from: token_owner;
                to: to;
                token_id: token_id
              };
              event e
            end
          end
          
          procedure HandleTransfer(info: Pair ByStr20 Uint256)
            match info with
            | Pair to token_id =>
              TransferToken to token_id
            end
          end
          
          (* Pauses the contract. Use this when things are going wrong ('circuit breaker'). *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          transition Pause()
            RequireNotPaused;
            RequireContractOwner;
          
            is_paused := true;
            e = {
              _eventname: "Pause";
              is_paused: true
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_PauseCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              is_paused: true
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          transition PauseMigration()
            RequireNotPaused;
            RequireContractOwner;
          
            is_paused_migration := true;
            e = {
              _eventname: "PauseMigration";
              is_paused_migration: true
            };
            event e
          end
          
          (* Unpauses the contract. *)
          (* @Requirements: *)
          (* - The contract must be paused. Otherwise, it must throw 'NotPausedError' *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          transition Unpause()
            paused <- is_paused;
            match paused with
            | True =>
            | False =>
              error = NotPausedError;
              Throw error
            end;
            RequireContractOwner;
          
            is_paused := false;
            e = {
              _eventname: "Unpause";
              is_paused: false
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_UnpauseCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              is_paused: false
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          transition UnpauseMigration()
            paused <- is_paused_migration;
            match paused with
            | True =>
            | False =>
              error = NotPausedError;
              Throw error
            end;
            RequireContractOwner;
          
            is_paused_migration := false;
            e = {
              _eventname: "UnpauseMigration";
              is_paused_migration: false
            };
            event e
          end
          
          (* Sets 'to' as the royalty recipient. *)
          (* @param: to - Royalty recipient address  *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          (* - 'to' must not be the zero address. Otherwise, it must throw 'ZeroAddressDestinationError' *)
          (* - 'to' must not be '_this_address'. Otherwise, it must throw 'ThisAddressDestinationError' *)
          transition SetRoyaltyRecipient(to: ByStr20)
            RequireContractOwner;
            RequireValidDestination to;
            royalty_recipient := to;
            e = { 
              _eventname: "SetRoyaltyRecipient";
              to: to
            }; event e;
            msg_to_sender = {
              _tag: "ZRC6_SetRoyaltyRecipientCallback"; 
              _recipient: _sender;
              _amount: Uint128 0;
              to: to
            }; msgs = one_msg msg_to_sender; send msgs end
          
          (* Sets 'fee_bps' as royalty fee bps. *)
          (* @param: fee_bps - Royalty fee BPS *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          (* - 'fee_bps' must be in the range of 1 and 10000. Otherwise, it must throw 'InvalidFeeBPSError' *)
          transition SetRoyaltyFeeBPS(fee_bps: Uint128)
            RequireContractOwner;
            RequireValidRoyaltyFee fee_bps;
            royalty_fee_bps := fee_bps;
            
            e = { 
              _eventname: "SetRoyaltyFeeBPS";
              royalty_fee_bps: fee_bps
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_SetRoyaltyFeeBPSCallback"; 
              _recipient: _sender;
              _amount: Uint128 0;
              royalty_fee_bps: fee_bps
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Sets 'uri' as the base URI. *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          transition SetBaseURI(uri: String)
            RequireContractOwner;
            base_uri := uri;
          
            e = { 
              _eventname: "SetBaseURI";
              base_uri: uri
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_SetBaseURICallback"; 
              _recipient: _sender;
              _amount: Uint128 0;
              base_uri: uri
            };
            msgs = one_msg msg_to_sender;
            send msgs  
          end
          
          (* When the migration is active, owners of the domains in the NFT DNS can get their domains registered for free. *)
          procedure VerifyMigration(domain_id: ByStr32, address: ByStr20, id_: Pair String String)
            RequireNotRegistered domain_id; (* The domain cannot get registered twice. *)
            paused <- is_paused_migration; match paused with
              | True =>
                (* When is_paused_migration is True, then anyone can claim an unregistered domain. *)
                HandlePayment id_
              | False =>
                (* The _origin must match the NFT DNS for the given domain. *)
                VerifyOrigin address end end
          
          (* Mints a token with a specific 'token_uri' and transfers it to 'to'. *)
          (* Pass empty string to 'token_uri' to use the concatenated token URI. i.e. '<base_uri><token_id>'. *)
          (* @param: to - Address of the token recipient *)
          (* @param: token_uri - URI of a token *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition Mint(to: ByStr20, token_uri: String)
            RequireNotPaused;
            domain_id = builtin sha256hash token_uri;
            id_ = let txID = "BuyNftUsername" in Pair {String String} zilID txID;
            maybe_dns <- nft_dns[domain_id]; match maybe_dns with
              | None => HandlePayment id_
              | Some address => VerifyMigration domain_id address id_ end;
            MintToken to;
            token_id <- token_id_count;
            token_domains[token_id] := domain_id;
            SetTokenURI token_id token_uri;
            nft_domain_names[domain_id] := token_id;
            nft_dns[domain_id] := to;
          
            e = {
              _eventname: "Mint";
              to: to;
              token_id: token_id;
              token_uri: token_uri
            };
            event e;
            msg_to_recipient = {
              _tag: "ZRC6_RecipientAcceptMint";
              _recipient: to;
              _amount: Uint128 0
            };
            msg_to_sender = {
              _tag: "ZRC6_MintCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              to: to;
              token_id: token_id;
              token_uri: token_uri
            };
            msgs = two_msgs msg_to_recipient msg_to_sender;
            send msgs
          end
          
          (* Mints a token with a specific 'token_uri' and transfers it to 'to'. *)
          (* Pass empty string to 'token_uri' to use the concatenated token URI. i.e. '<base_uri><token_id>'. *)
          (* @param: to - Address of the token recipient *)
          (* @param: token_uri - URI of a token *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition MintTyron(to: ByStr20, token_uri: ByStr32, id: String)
            RequireNotPaused; ThrowIfNullHash token_uri; domain_id = token_uri;
            id_ = let txID = "BuyNftUsername" in Pair {String String} id txID;
            maybe_dns <- nft_dns[domain_id]; match maybe_dns with
              | None => HandlePayment id_
              | Some address => VerifyMigration domain_id address id_ end;
            MintToken to;
            token_id <- token_id_count;
            token_domains[token_id] := domain_id;
            nft_domain_names[domain_id] := token_id;
            nft_dns[domain_id] := to;
          
            e = {
              _eventname: "MintTyron";
              to: to;
              token_id: token_id;
              token_uri: token_uri
            };
            event e;
            msg_to_recipient = {
              _tag: "ZRC6_RecipientAcceptMint";
              _recipient: to;
              _amount: Uint128 0
            };
            msg_to_sender = {
              _tag: "ZRC6_MintCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              to: to;
              token_id: token_id;
              token_uri: empty_string
            };
            msgs = two_msgs msg_to_recipient msg_to_sender;
            send msgs
          end
          
          (* Mints multiple tokens with 'token_uri's and transfers them to multiple 'to's. *)
          (* Pass empty string to 'token_uri' to use the concatenated token URI. i.e. '<base_uri><token_id>'. *)
          (* @param: to_token_uri_pair_list - List of Pair (to, token_uri). *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition BatchMint(to_token_uri_pair_list: List (Pair ByStr20 String))
            RequireNotPaused;
            cur_id <- token_id_count;
            start_id = builtin add cur_id one;
            txID = "BuyNftUsername";
            counter = let list_length = @list_length (Pair ByStr20 String) in list_length to_token_uri_pair_list;
            HandleBatchPayment zilID txID counter;
            forall to_token_uri_pair_list HandleMint;
            end_id <- token_id_count;
            e = {
              _eventname: "BatchMint";
              to_token_uri_pair_list: to_token_uri_pair_list;
              start_id: start_id;
              end_id: end_id
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_BatchMintCallback";
              _recipient: _sender;
              _amount: Uint128 0
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Mints multiple tokens with 'token_uri's and transfers them to multiple 'to's. *)
          (* Pass empty string to 'token_uri' to use the concatenated token URI. i.e. '<base_uri><token_id>'. *)
          (* @param: to_token_uri_pair_list - List of Pair (to, token_uri). *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition BatchMintTyron(to_token_uri_pair_list: List (Pair ByStr20 String), id: String)
            RequireNotPaused;
            cur_id <- token_id_count;
            start_id = builtin add cur_id one;
            txID = "BuyNftUsername";
            counter = let list_length = @list_length (Pair ByStr20 String) in list_length to_token_uri_pair_list;
            HandleBatchPayment id txID counter;
            forall to_token_uri_pair_list HandleMint;
            end_id <- token_id_count;
            e = {
              _eventname: "BatchMint";
              to_token_uri_pair_list: to_token_uri_pair_list;
              start_id: start_id;
              end_id: end_id
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_BatchMintCallback";
              _recipient: _sender;
              _amount: Uint128 0
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Destroys 'token_id'. *)
          (* @param: token_id - Unique ID of the NFT to be destroyed *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition Burn(token_id: Uint256)
            RequireNotPaused;
            (* Check if token exists *)
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              BurnToken token_id;
              msg_to_sender = {
                _tag: "ZRC6_BurnCallback";
                _recipient: _sender;
                _amount: Uint128 0;
                token_owner: token_owner;
                token_id: token_id
              };
              msgs = one_msg msg_to_sender;
              send msgs
            end
          end
          
          (* Destroys 'token_id_list'. *)
          (* @param: token_id_list - List of unique IDs of the NFT to be destroyed *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition BatchBurn(token_id_list: List Uint256)
            RequireNotPaused;
            forall token_id_list BurnToken;
            msg_to_sender = {
              _tag: "ZRC6_BatchBurnCallback";
              _recipient: _sender;
              _amount: Uint128 0
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Sets 'spender' for 'token_id'. *)
          (* To remove 'spender' for a token, use 'zero_address'. *)
          (* i.e., '0x0000000000000000000000000000000000000000' *)
          (* @Requirements: *)
          (* - 'token_id' must exist. Otherwise, it must throw 'TokenNotFoundError' *)
          (* - '_sender' must be a token owner or an operator. Otherwise, it must throw 'NotOwnerOrOperatorError' *)
          (* - '_sender' must not be 'spender'. Otherwise, it must throw 'SelfError' *)
          (* - 'spender' must not be already a spender. Otherwise, it must throw 'SpenderFoundError' *)
          transition SetSpender(spender: ByStr20, token_id: Uint256)
            RequireNotSelf spender _sender;
            
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              RequireOwnerOrOperator token_owner;
              
              (* Check if the spender exists *)
              maybe_spender <- spenders[token_id];
              match maybe_spender with
                | None =>
                | Some cur_spender =>
                  has_spender = builtin eq cur_spender spender;
                  match has_spender with 
                  | False =>
                  | True => 
                    error = SpenderFoundError;
                    Throw error
                  end
              end;
                
              spenders[token_id] := spender;
          
              e = {
                _eventname: "SetSpender";
                token_owner: token_owner;
                spender: spender;
                token_id: token_id
              };
              event e;
              msg_to_sender = {
                _tag: "ZRC6_SetSpenderCallback";
                _recipient: _sender;
                _amount: Uint128 0;
                spender: spender;
                token_id: token_id
              };
              msgs = one_msg msg_to_sender;
              send msgs
            end
          end
          
          (* Adds 'operator' for '_sender'. *)
          (* @Requirements: *)
          (* - '_sender' must be the token owner. Otherwise, it must throw 'NotTokenOwnerError' *)
          (* - '_sender' must not be 'operator'. Otherwise, it must throw 'SelfError' *)
          (* - 'operator' must not be already an operator. Otherwise, it must throw 'OperatorFoundError' *)
          transition AddOperator(operator: ByStr20)
            RequireNotSelf operator _sender;
            
            maybe_bal <- balances[_sender];
            balance = get_bal maybe_bal;
            
            is_balance_zero = builtin eq zero balance;
            (* _sender must have at least 1 token *)
            match is_balance_zero with 
            | True =>    
              error = NotTokenOwnerError;
              Throw error
            | False =>
              has_operator <- exists operators[_sender][operator];
              match has_operator with
              | False =>
                (* Add operator *)
                operators[_sender][operator] := true
              | True =>
                error = OperatorFoundError;
                Throw error
              end;
              e = {
                _eventname: "AddOperator";
                token_owner: _sender;
                operator: operator
              };
              event e;
              msg_to_sender = {
                _tag: "ZRC6_AddOperatorCallback";
                _recipient: _sender;
                _amount: Uint128 0;
                operator: operator
              };
              msgs = one_msg msg_to_sender;
              send msgs
            end
          end
          
          (* Removes 'operator' for '_sender'. *)
          (* @Requirements:  *)
          (* - 'operator' must be already an operator of '_sender'. Otherwise, it must throw 'OperatorNotFoundError' *)
          transition RemoveOperator(operator: ByStr20)
            has_operator <- exists operators[_sender][operator];
            match has_operator with
            | False =>
              error = OperatorNotFoundError;
              Throw error
            | True =>
              (* Remove operator *)
              delete operators[_sender][operator]
            end;
            e = {
              _eventname: "RemoveOperator";
              token_owner: _sender;
              operator: operator
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_RemoveOperatorCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              operator: operator
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Transfers 'token_id' from the token owner to 'to'.  *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition TransferFrom(to: ByStr20, token_id: Uint256)
            RequireNotPaused;
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              TransferToken to token_id;
              msg_to_recipient = {
                _tag: "ZRC6_RecipientAcceptTransferFrom";
                _recipient: to;
                _amount: Uint128 0;
                from: token_owner;
                to: to;
                token_id: token_id
              };
              msg_to_sender = {
                _tag: "ZRC6_TransferFromCallback";
                _recipient: _sender;
                _amount: Uint128 0;
                from: token_owner;
                to: to;
                token_id: token_id
              };
              msgs = two_msgs msg_to_recipient msg_to_sender;
              send msgs
            end
          end
          
          (* Transfers multiple 'token_id' to multiple 'to'. *)
          (* @param: to_token_id_pair_list - List of Pair (to, token_id). *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition BatchTransferFrom(to_token_id_pair_list: List (Pair ByStr20 Uint256))
            RequireNotPaused;
            forall to_token_id_pair_list HandleTransfer;
            msg_to_sender = {
              _tag: "ZRC6_BatchTransferFromCallback";
              _recipient: _sender;
              _amount: Uint128 0
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          procedure ThrowIfSameDomain(
            a: ByStr32,
            b: ByStr32
            )
            is_same = builtin eq a b; match is_same with
              | False => | True => ver <- version; e = { _exception: "SSIDApp-SameDomain"; version: ver }; throw e end end
          
          transition UpdateDomain( domain: ByStr32 )
            RequireNotPaused; RequireContractOwner; id <- nft_domain;
            ThrowIfSameDomain id domain;
            current_init <-& init.dApp; domain_ = builtin to_string domain;
            get_did <-& current_init.did_dns[domain_]; match get_did with
              | Some did_ =>
                pending_domain := domain;
                e = { _eventname: "SetContractOwnershipRecipient";
                  to: domain }; event e;
                msg_to_sender = { _tag: "ZRC6_SetContractOwnershipRecipientCallback";
                  _recipient: _sender;
                  _amount: Uint128 0;
                  to: did_ }; msgs = one_msg msg_to_sender; send msgs
              | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e end end
          
          transition AcceptPendingDomain()
            RequireNotPaused; domain <- pending_domain;
            current_init <-& init.dApp; domain_ = builtin to_string domain;
            get_did <-& current_init.did_dns[domain_]; match get_did with
              | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e
              | Some did_ =>
                controller <-& did_.controller; VerifyOrigin controller;
                nft_domain := domain; pending_domain := zero_bystr32;
                e = {
                  _eventname: "AcceptContractOwnership";
                  contract_owner: _sender }; event e;
                msg_to_sender = { _tag: "ZRC6_AcceptContractOwnershipCallback";
                  _recipient: _sender;
                  _amount: Uint128 0;
                  contract_owner: _sender }; msgs = one_msg msg_to_sender; send msgs end end
          
          (* Shall change the current permalink for a new one. *)
          transition UpdateTokenURI(token_id: Uint256, token_uri: String)
            RequireNotPaused;
            (* Check if token exists *)
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
                RequireOwnerOrOperator token_owner;
                SetTokenURI token_id token_uri;
                msg_to_sender = {
                  _tag: "SSIDNS_UpdateDomainCallback";
                  _recipient: _sender;
                  _amount: Uint128 0;
                  token_owner: token_owner;
                  token_id: token_id
                };
                msgs = one_msg msg_to_sender;
                send msgs;
                e = {
                  _eventname: "TokenURIUpdated";
                  token_id: token_id
                }
            end
          end
          
          (* Sets the domain address for a certain token. *)
          transition UpdateDomainAddress(token_id: Uint256, new_addr: ByStr20)
            RequireNotPaused;
            (* Check if token exists *)
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
                RequireOwnerOrOperator token_owner;
                get_token_domain <- token_domains[token_id]; token_domain = option_bystr32_value get_token_domain;
                nft_dns[token_domain] := new_addr;
                msg_to_sender = {
                  _tag: "SSIDNS_UpdateDomainCallback";
                  _recipient: _sender;
                  _amount: Uint128 0;
                  token_owner: token_owner;
                  token_id: token_id
                };
                msgs = one_msg msg_to_sender;
                send msgs;
                e = {
                  _eventname: "DomainAddressUpdated";
                  token_id: token_id
                }
            end
          end
          
          (* Adds 'minter'. *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          (* - 'minter' must not be already a minter. Otherwise, it must throw 'MinterFoundError' *)
          (*
          transition AddMinter(minter: ByStr20)
            RequireContractOwner;
            has_minter <- exists minters[minter];
            match has_minter with
            | True => 
              error = MinterFoundError;
              Throw error
            | False =>
              (* Add minter *)
              minters[minter] := true
            end;
            e = { 
              _eventname: "AddMinter";
              minter: minter
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_AddMinterCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              minter: minter
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          *)
                  
          (* Removes 'minter'. *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          (* - 'minter' must be already a minter. Otherwise, it must throw 'MinterNotFoundError' *)
          (*
          transition RemoveMinter(minter: ByStr20)
            RequireContractOwner;
            has_minter <- exists minters[minter];
            match has_minter with
            | False =>
              error = MinterNotFoundError;
              Throw error
            | True => 
              delete minters[minter]
            end;
            e = { 
              _eventname: "RemoveMinter";
              minter: minter
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_RemoveMinterCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              minter: minter
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          *)
        `;
      const init_zil = new tyron.ZilliqaInit.default(network);
      const get_state = await init_zil.API.blockchain.getSmartContractSubState(
        ud,
        "records"
      );
      // console.log(JSON.stringify(get_state))
      const init_domains = Object.entries(get_state.result.records);
      console.log(init_domains.length)

      let zil_domains: Array<{ key: string; val: string }> = [];
      for (let i = 0; i < init_domains.length; i += 1) {
        let owner = (init_domains[i][1] as any).arguments;
        owner = owner[0];
        if (owner !== "0x0000000000000000000000000000000000000000") {
          zil_domains.push({
            key: init_domains[i][0],
            val: owner,
          });
        }
      }
      console.log(zil_domains.length)
      // console.log(JSON.stringify(zil_domains));
      const init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "init",
          type: "ByStr20",
          value: `${init_tyron}`,
        },
        {
          vname: "initial_contract_owner",
          type: "ByStr20",
          value: `${address}`,
        },
        {
          vname: "initial_base_uri",
          type: "String",
          value: "https://arweave.net/",
        },
        {
          vname: "name",
          type: "String",
          value: "$gZIL.ssi dApp: .gzil NFT domain names",
        },
        {
          vname: "symbol",
          type: "String",
          value: ".gzil",
        },
        {
          vname: "init_dns",
          type: "Map ByStr32 ByStr20",
          value: zil_domains,
        },
        {
          "vname": "_library",
          "type": "Bool",
          "value": { "constructor": "True", "argtypes": [], "arguments": [] }
        },
        {
          "vname": "_extlibs",
          "type": "List(Pair String ByStr20)",
          "value": [
            {
              "constructor": "Pair",
              "argtypes": ["String", "ByStr20"],
              "arguments": ["RegistryLib", `${ud}`]
            }
          ]
        }
      ];
      const contract = contracts.new(code, init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "100000",
        gasPrice: "2000000000",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }

  //SSI DNS v0.7
  async deploySsiDns(net: string, address: string) {
    try {
      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      //mainnet addresses
      let init_tyron = "0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9";

      if (net === "testnet") {
        init_tyron = "0xec194d20eab90cfab70ead073d742830d3d2a91b";
      }
      //@xalkan
      const code =
        `
        (* SSI DNS v0.7
          SSI Domain Name System that includes the Zilliqa-Reference-Contract #6 standard (which has an SPDX-License-Identifier: MIT)
          Self-Sovereign Identity Protocol
          Copyright Tyron Mapu Community Interest Company 2023. All rights reserved.
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
          If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at tyron@ssiprotocol.com.*)
          
          scilla_version 0
          
          (***************************************************)
          (*               Associated library                *)
          (***************************************************)
          import BoolUtils ListUtils IntUtils PairUtils
          library NonfungibleToken
          
          type Operation =
          | Add
          | Sub
          
          (* Global variables *)
          let zero_address = 0x0000000000000000000000000000000000000000
          let zero_bystr32 = 0x0000000000000000000000000000000000000000000000000000000000000000
          let false = False
          let true = True
          let zero = Uint256 0
          let zero_128 = Uint128 0
          let one = Uint256 1
          let empty_string = ""
          let zilID = "zil"
          
          let add_operation = Add
          let sub_operation = Sub
          let min_fee_bps = Uint128 1
          let max_fee_bps = Uint128 10000
          
          (* Library functions *)
          let one_msg = 
            fun (msg: Message) => 
              let nil_msg = Nil {Message} in
              Cons {Message} msg nil_msg
          
          let two_msgs =
            fun (msg1: Message) =>
            fun (msg2: Message) =>
              let msgs_tmp = one_msg msg2 in
              Cons {Message} msg1 msgs_tmp
          
          let get_bal =
            fun (maybe_bal: Option Uint256) =>
              match maybe_bal with
              | None => zero
              | Some bal => bal
              end
          
          (* Error exception *)
          type Error =
            | NotPausedError
            | PausedError
            | SelfError
            | NotContractOwnerError
            | NotTokenOwnerError
            | NotOwnerOrOperatorError
            | SpenderFoundError
            | OperatorNotFoundError
            | OperatorFoundError
            | NotAllowedToTransferError
            | TokenNotFoundError
            | InvalidFeeBPSError
            | ZeroAddressDestinationError
            | ThisAddressDestinationError
            | DomainNotValidError
            | DomainTakenError
          
          let make_error =
            fun (result: Error) =>
              let result_code = 
                match result with
                | NotPausedError                     => Int32 -1
                | PausedError                        => Int32 -2
                | SelfError                          => Int32 -3
                | NotContractOwnerError              => Int32 -4
                | NotTokenOwnerError                 => Int32 -5
                | NotOwnerOrOperatorError            => Int32 -7
                | SpenderFoundError                  => Int32 -10
                | OperatorNotFoundError              => Int32 -11
                | OperatorFoundError                 => Int32 -12
                | NotAllowedToTransferError          => Int32 -13
                | TokenNotFoundError                 => Int32 -14
                | InvalidFeeBPSError                 => Int32 -15
                | ZeroAddressDestinationError        => Int32 -16
                | ThisAddressDestinationError        => Int32 -17
                | DomainNotValidError                => Int32 -19
                | DomainTakenError                   => Int32 -20
                end
              in
              { _exception: "Error"; code: result_code }
          
            let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
              match input with
              | Some v => v
              | None => default end
            let option_bystr20_value = let f = @option_value ByStr20 in f zero_address
            let option_bystr32_value = let f = @option_value ByStr32 in f zero_bystr32
            
          (***************************************************)
          (*             The contract definition             *)
          (***************************************************)
          
          contract NonfungibleToken
          (
            init_nft: ByStr32,
            init: ByStr20 with contract field dApp: ByStr20 with contract
              field implementation: ByStr20 with contract
                field utility: Map String Map String Uint128 end,
              field did_dns: Map String ByStr20 with contract
                field controller: ByStr20,
                field services: Map String ByStr20 end end end,
            initial_contract_owner: ByStr20,
            (* Initial Base URI. e.g. 'https://creatures-api.zilliqa.com/api/creature/' *)
            initial_base_uri: String,
            name: String,
            symbol: String,
            init_dns: Map ByStr32 ByStr20
          )
          
          (* Contract constraints *)
          with
            (* 'initial_contract_owner' must not be the zero address *)
            let is_contract_owner_invalid = builtin eq initial_contract_owner zero_address in 
            (* 'init_nft' must not be the zero ByStr32 *)
            let is_nft_invalid = builtin eq init_nft zero_bystr32 in 
            let is_owner_or_nft_invalid = orb is_contract_owner_invalid is_nft_invalid in
            (* 'name' must not be an empty string *)
            let is_name_invalid = builtin eq name empty_string in
            (* 'symbol' must not be an empty string *)
            let is_symbol_invalid = builtin eq symbol empty_string in
            (* Check if any parameter is invalid *)
            let is_name_or_symbol_invalid = orb is_name_invalid is_symbol_invalid in
          
            let is_invalid = orb is_contract_owner_invalid is_name_or_symbol_invalid in
            negb is_invalid
          =>
          
          (* Mutable fields *)
          field nft_domain: ByStr32 = init_nft
          field pending_domain: ByStr32 = zero_bystr32
          
          (* Emergency stop mechanism *)
          (* Defaults to False *)
          field is_paused: Bool = false
          field is_paused_zil: Bool = false
          
          (* Token Name *)
          (* Defaults to 'name' *)
          (* No need to mutate this field since this is for remote fetch to retrieve the immutable parameter. *)
          field token_name: String = name
          
          (* Token Symbol *)
          (* Defaults to 'symbol' *)
          (* No need to mutate this field since this is for remote fetch to retrieve the immutable parameter. *)
          field token_symbol: String = symbol
          
          (* Contract Owner *)
          (* Defaults to 'initial_contract_owner' *) 
          field contract_owner: ByStr20 = initial_contract_owner
          
          (* Contract ownership recipient *)
          (* Defaults to 'zero_address'*)
          field contract_ownership_recipient: ByStr20 = zero_address
          
          (* Address to send royalties to *)
          (* Defaults to 'initial_contract_owner' *)
          field royalty_recipient: ByStr20 = initial_contract_owner
          
          (* Royalty fee BPS *)
          (* e.g. 1 = 0.01%, 10000 = 100% *)
          (* Defaults to 1000 *)
          field royalty_fee_bps: Uint128 = Uint128 1000
          
          (* Base URI *)
          (* Defaults to 'initial_base_uri' *)
          field base_uri: String = initial_base_uri
          
          (* Token URIs *)
          field token_uris: Map Uint256 String = Emp Uint256 String
          
          (* NFT domains per token ID *)
          field token_domains: Map Uint256 ByStr32 = Emp Uint256 ByStr32
          
          (* Mapping from token ID to its owner *)
          field token_owners: Map Uint256 ByStr20 = Emp Uint256 ByStr20
          field nft_domain_names: Map ByStr32 Uint256 = Emp ByStr32 Uint256
          field nft_dns: Map ByStr32 ByStr20 = init_dns (* Emp ByStr32 ByStr20 *)
          
          (* The total number of tokens minted *)
          field token_id_count: Uint256 = Uint256 0
          
          (* The total number of existing tokens *)
          field total_supply: Uint256 = Uint256 0
          
          (* Mapping from token owner to the number of existing tokens *)
          field balances: Map ByStr20 Uint256 = Emp ByStr20 Uint256
          
          (* Set for minters *)
          (* 'initial_contract_owner' is a minter by default *)
          field minters: Map ByStr20 Bool =
              let emp_map = Emp ByStr20 Bool in
              builtin put emp_map initial_contract_owner true
          
          (* Mapping from token ID to a spender *)
          field spenders: Map Uint256 ByStr20 = Emp Uint256 ByStr20
          
          (* Mapping from token owner to operators authorized by the token owner *)
          field operators: Map ByStr20 (Map ByStr20 Bool) = Emp ByStr20 (Map ByStr20 Bool)
          
          field version: String = "SSIDNS_0.7.0" (* @xalkan *)
          
          (* Emit Errors *)
          procedure Throw(error: Error)
            e = make_error error;
            throw e
          end
          
          procedure RequireNotPaused()
            (* Reference: *)
            (* https://consensys.github.io/smart-contract-best-practices/general_philosophy/#prepare-for-failure *)
            paused <- is_paused;
            match paused with
            | False =>
            | True =>
              (* Contract is paused *)
              error = PausedError;
              Throw error
            end
          end
          
          procedure RequireNotPausedZil()
            paused <- is_paused_zil; match paused with
              | False => | True => e = { _exception : "SSIDNS-ZilDomainIsPaused" }; throw e
            end
          end
          
          procedure RequireNotTaken(domain_id: ByStr32)
            is_empty = 
              let null = 0x0000000000000000000000000000000000000000000000000000000000000000 in 
              builtin eq domain_id null;
            match is_empty with 
            | True => 
              error = DomainNotValidError;
              Throw error
            | False => end;
            is_taken <- exists nft_domain_names[domain_id];
            match is_taken with
            | True => (* The NFT Domain Name has an owner *)
              error = DomainTakenError;
              Throw error
            | False =>
            end
          end
          
          procedure RequireValidRoyaltyFee(fee_bps: Uint128)
            is_gte_min = uint128_ge fee_bps min_fee_bps;
            is_lte_max = uint128_le fee_bps max_fee_bps;
            
            is_valid = andb is_gte_min is_lte_max;
            match is_valid with 
              | True => 
              | False =>
                error = InvalidFeeBPSError;
                Throw error
            end
          end
          
          procedure VerifyOrigin( addr: ByStr20 )
            verified = builtin eq _origin addr; match verified with
              | True => | False => ver <- version; e = { _exception: "SSIDApp-WrongCaller"; version: ver }; throw e end end
          
          procedure RequireContractOwner()
            id <- nft_domain; current_init <-& init.dApp;
            domain = builtin to_string id;
            get_did <-& current_init.did_dns[domain]; match get_did with
            | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e
            | Some did_ =>
                controller <-& did_.controller; VerifyOrigin controller end end
          
          procedure RequireNotSelf(address_a: ByStr20, address_b: ByStr20)
            is_self = builtin eq address_a address_b;
            match is_self with
            | False =>
            | True =>
              error = SelfError;
              Throw error
            end
          end
          
          procedure RequireExistingToken(token_id: Uint256)
            has_token <- exists token_owners[token_id];
            match has_token with
            | True =>
            | False =>
              error = TokenNotFoundError;
              Throw error
            end
          end
          
          procedure RequireValidDestination(to: ByStr20)
            (* Reference: https://github.com/ConsenSys/smart-contract-best-practices/blob/master/docs/tokens.md *)
            is_zero_address = builtin eq to zero_address;
            match is_zero_address with
            | False =>
            | True =>
              error = ZeroAddressDestinationError;
              Throw error
            end;
          
            is_this_address = builtin eq to _this_address;
            match is_this_address with
            | False =>
            | True =>
              error = ThisAddressDestinationError;
              Throw error
            end
          end
          
          procedure RequireOwnerOrOperator(address: ByStr20)
            is_owner = builtin eq _sender address;
            has_operator <- exists operators[address][_sender];
            is_allowed = orb is_owner has_operator;
            match is_allowed with
            | True =>
            | False =>
              error = NotOwnerOrOperatorError;
              Throw error
            end
          end
          
          procedure RequireAccessToTransfer(token_owner: ByStr20, token_id: Uint256)  
            (* check if _sender is token owner *)
            is_token_owner = builtin eq token_owner _sender;
            
            (* check if _sender is spender *)
            maybe_spender <- spenders[token_id];
            is_spender = match maybe_spender with
              | None => False
              | Some spender => 
                builtin eq spender _sender
              end;
          
            (* check if _sender is operator *)
            is_operator <- exists operators[token_owner][_sender];
            
            is_spender_or_operator = orb is_spender is_operator;
            is_allowed = orb is_spender_or_operator is_token_owner;
            match is_allowed with
            | True =>
            | False =>
              error = NotAllowedToTransferError;
              Throw error
            end
          end
          
          procedure UpdateBalance(operation: Operation, address: ByStr20)
            match operation with
            | Add =>
              maybe_count <- balances[address];
              new_count = 
                let cur_count = get_bal maybe_count in
                (* if overflow occurs, it throws CALL_CONTRACT_FAILED *)
                builtin add cur_count one;
              balances[address] := new_count
            | Sub =>
              maybe_count <- balances[address];
              new_count = 
                let cur_count = get_bal maybe_count in
                (* if underflow occurs, it throws CALL_CONTRACT_FAILED *)
                builtin sub cur_count one;
              balances[address] := new_count
            end
          end
          
          procedure HandlePayment(id_: Pair String String)
            payment_id = let fst_element = @fst String String in fst_element id_;
            txID = let snd_element = @snd String String in snd_element id_;
            current_init <-& init.dApp; current_impl <-& current_init.implementation;
            get_fee <-& current_impl.utility[payment_id][txID]; match get_fee with
            | None => ver <- version; e = { _exception : "SSIDApp-FeeIsNull"; version: ver }; throw e
            | Some fee =>
              is_zero = builtin eq zero_128 fee; match is_zero with
              | True =>
              | False => 
                id <- nft_domain; domain = builtin to_string id;
                get_did <-& current_init.did_dns[domain]; match get_did with
                  | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e
                  | Some didx =>
                    is_zil = builtin eq payment_id zilID; match is_zil with
                      | True =>
                        not_enough = builtin lt _amount fee; match not_enough with
                          | True => ver <- version; e = { _exception : "SSIDApp-InsufficientZIL"; version: ver }; throw e
                          | False =>
                            accept; msg = let m = { _tag: "AddFunds"; _recipient: didx; _amount: fee } in one_msg m; send msg;
                            refund = builtin sub _amount fee; zero_refund = builtin eq refund zero_128; match zero_refund with
                            | True => | False => rmsg = let m = { _tag: "AddFunds"; _recipient: _sender; _amount: refund } in one_msg m; send rmsg end end
                      | False =>
                        initId = "init"; get_impl_did <-& current_init.did_dns[initId]; match get_impl_did with
                          | None => ver <- version; e = { _exception: "SSIDApp-InitDidIsNull"; version: ver }; throw e
                          | Some did_ =>
                            get_token_addr <-& did_.services[payment_id]; token_addr = option_bystr20_value get_token_addr;
                            msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero_128;
                              from: _sender;
                              to: didx;
                              amount: fee } in one_msg m; send msg end end end end end end
          
          transition TransferFromSuccessCallBack(
            initiator: ByStr20,
            sender: ByStr20,
            recipient: ByStr20,
            amount: Uint128
            )
            RequireNotPaused;
            is_valid = builtin eq initiator _this_address; match is_valid with
              | True => | False => ver <- version; e = { _exception : "SSIDApp-WrongInitiator"; version: ver }; throw e end end
          
          procedure HandleBatchPayment(payment_id: String, txID: String, counter: Uint32 )
            current_init <-& init.dApp; current_impl <-& current_init.implementation;
            get_fee <-& current_impl.utility[payment_id][txID]; match get_fee with
            | None => e = { _exception : "SSIDNS-FeeIsNull" }; throw e
            | Some fee_ =>
              get_counter = builtin to_uint128 counter; counter_ = match get_counter with
              | Some c => c
              | None => Uint128 0 (* should never happen *)
              end;
              fee = builtin mul fee_ counter_;
              id <- nft_domain; domain = builtin to_string id;
              get_did <-& current_init.did_dns[domain]; match get_did with
                | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e
                | Some didx =>
                  is_zil = builtin eq payment_id zilID; match is_zil with
                    | True =>
                      not_enough = builtin lt _amount fee; match not_enough with
                        | True => ver <- version; e = { _exception : "SSIDApp-InsufficientZIL"; version: ver }; throw e
                        | False =>
                          accept; msg = let m = { _tag: "AddFunds"; _recipient: didx; _amount: fee } in one_msg m; send msg;
                          refund = builtin sub _amount fee; is_zero = builtin eq refund zero_128; match is_zero with
                          | True => | False => rmsg = let m = { _tag: "AddFunds"; _recipient: _sender; _amount: refund } in one_msg m; send rmsg end end
                    | False =>
                      initId = "init"; get_impl_did <-& current_init.did_dns[initId]; match get_impl_did with
                        | None => ver <- version; e = { _exception: "SSIDApp-InitDidIsNull"; version: ver }; throw e
                        | Some did_ =>
                          get_token_addr <-& did_.services[payment_id]; token_addr = option_bystr20_value get_token_addr;
                          msg = let m = { _tag: "TransferFrom"; _recipient: token_addr; _amount: zero_128;
                            from: _sender;
                            to: didx;
                            amount: fee } in one_msg m; send msg end end end end end
          
          (* @Requirements: *)
          (* - 'to' must not be the zero address. Otherwise, it must throw 'ZeroAddressDestinationError' *)
          (* - 'to' must not be '_this_address'. Otherwise, it must throw 'ThisAddressDestinationError' *)
          (* - '_sender' must be a minter. Otherwise, it must throw 'NotMinterError' *)
          procedure MintToken(to: ByStr20)
            RequireValidDestination to;
          
            (*IsMinter _sender;*)
          
            (* generate ID *)
            current_token_id_count <- token_id_count;
            new_token_id_count = builtin add current_token_id_count one;
            token_id_count := new_token_id_count;
            
            (* mint a new token *)
            token_owners[new_token_id_count] := to;
          
            (* add one to the token owner balance *)
            UpdateBalance add_operation to;
            
            (* add one to the total supply *)
            current_supply <- total_supply;
            new_supply = builtin add current_supply one;
            total_supply := new_supply
          end
          
          procedure SetTokenURI(token_id: Uint256, token_uri: String)
            is_empty_string = builtin eq token_uri empty_string;
            match is_empty_string with 
            | True => 
              (* noop *)
            | False =>
              token_uris[token_id] := token_uri
            end
          end
          
          procedure HandleMint(info: Pair ByStr20 String)
            match info with
            | Pair to token_uri =>
              domain_id = builtin sha256hash token_uri;
              RequireNotTaken domain_id;
              MintToken to;
              token_id <- token_id_count;
              token_domains[token_id] := domain_id; 
              SetTokenURI token_id token_uri;
              nft_domain_names[domain_id] := token_id;
              nft_dns[domain_id] := to
            end
          end
          
          (* @Requirements: *)
          (* - 'token_id' must exist. Otherwise, it must throw 'TokenNotFoundError' *)
          (* - '_sender' must be a token owner or an operator. Otherwise, it must throw 'NotOwnerOrOperatorError' *)
          procedure BurnToken(token_id: Uint256)
            (* Check if token exists *)
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              RequireOwnerOrOperator token_owner;
              (* Destroy existing token *)
              delete token_owners[token_id];
              delete token_uris[token_id];
              delete spenders[token_id];
          
              get_token_domain <- token_domains[token_id]; token_domain = option_bystr32_value get_token_domain;
              delete nft_domain_names[token_domain];
              delete nft_dns[token_domain];
              delete token_domains[token_id];
          
              (* subtract one from the balance *)
              UpdateBalance sub_operation token_owner;
              (* subtract one from the total supply *)
              current_supply <- total_supply;
              new_supply = builtin sub current_supply one;
              total_supply := new_supply;
          
              e = {
                _eventname: "Burn";
                token_owner: token_owner;
                token_id: token_id
              };
              event e
            end
          end
          
          (* @Requirements: *)
          (* - 'to' must not be the zero address. Otherwise, it must throw 'ZeroAddressDestinationError' *)
          (* - 'to' must not be '_this_address'. Otherwise, it must throw 'ThisAddressDestinationError' *)
          (* - 'token_id' must exist. Otherwise, it must throw 'TokenNotFoundError' *)
          (* - '_sender' must be a token owner, spender, or operator. Otherwise, it must throw 'NotAllowedToTransferError' *)
          (* - '_sender' must not be 'to'. Otherwise, it must throw 'SelfError' *)
          procedure TransferToken(to: ByStr20, token_id: Uint256)
            RequireValidDestination to;
          
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              RequireAccessToTransfer token_owner token_id;
              RequireNotSelf token_owner to;
              
              (* change token_owner for that token_id *)
              token_owners[token_id] := to;
          
              delete spenders[token_id];
          
              (* subtract one from previous token owner balance *)
              UpdateBalance sub_operation token_owner;
              (* add one to the new token owner balance *)
              UpdateBalance add_operation to;
          
              e = {
                _eventname: "TransferFrom"; 
                from: token_owner;
                to: to;
                token_id: token_id
              };
              event e
            end
          end
          
          procedure HandleTransfer(info: Pair ByStr20 Uint256)
            match info with
            | Pair to token_id =>
              TransferToken to token_id
            end
          end
          
          (* Pauses the contract. Use this when things are going wrong ('circuit breaker'). *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          transition Pause()
            RequireNotPaused;
            RequireContractOwner;
          
            is_paused := true;
            e = {
              _eventname: "Pause";
              is_paused: true
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_PauseCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              is_paused: true
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          transition PauseZil()
            RequireNotPaused;
            RequireContractOwner;
          
            is_paused_zil := true;
            e = {
              _eventname: "PauseZil";
              is_paused_zil: true
            };
            event e
          end
          
          (* Unpauses the contract. *)
          (* @Requirements: *)
          (* - The contract must be paused. Otherwise, it must throw 'NotPausedError' *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          transition Unpause()
            paused <- is_paused;
            match paused with
            | True =>
            | False =>
              error = NotPausedError;
              Throw error
            end;
            RequireContractOwner;
          
            is_paused := false;
            e = {
              _eventname: "Unpause";
              is_paused: false
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_UnpauseCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              is_paused: false
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          transition UnpauseZil()
            paused <- is_paused_zil;
            match paused with
            | True =>
            | False =>
              error = NotPausedError;
              Throw error
            end;
            RequireContractOwner;
          
            is_paused_zil := false;
            e = {
              _eventname: "UnpauseZil";
              is_paused_zil: false
            };
            event e
          end
          
          (* Sets 'to' as the royalty recipient. *)
          (* @param: to - Royalty recipient address  *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          (* - 'to' must not be the zero address. Otherwise, it must throw 'ZeroAddressDestinationError' *)
          (* - 'to' must not be '_this_address'. Otherwise, it must throw 'ThisAddressDestinationError' *)
          transition SetRoyaltyRecipient(to: ByStr20)
            RequireContractOwner;
            RequireValidDestination to;
            royalty_recipient := to;
            e = { 
              _eventname: "SetRoyaltyRecipient";
              to: to
            }; event e;
            msg_to_sender = {
              _tag: "ZRC6_SetRoyaltyRecipientCallback"; 
              _recipient: _sender;
              _amount: Uint128 0;
              to: to
            }; msgs = one_msg msg_to_sender; send msgs end
          
          (* Sets 'fee_bps' as royalty fee bps. *)
          (* @param: fee_bps - Royalty fee BPS *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          (* - 'fee_bps' must be in the range of 1 and 10000. Otherwise, it must throw 'InvalidFeeBPSError' *)
          transition SetRoyaltyFeeBPS(fee_bps: Uint128)
            RequireContractOwner;
            RequireValidRoyaltyFee fee_bps;
            royalty_fee_bps := fee_bps;
            
            e = { 
              _eventname: "SetRoyaltyFeeBPS";
              royalty_fee_bps: fee_bps
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_SetRoyaltyFeeBPSCallback"; 
              _recipient: _sender;
              _amount: Uint128 0;
              royalty_fee_bps: fee_bps
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Sets 'uri' as the base URI. *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          transition SetBaseURI(uri: String)
            RequireContractOwner;
            base_uri := uri;
          
            e = { 
              _eventname: "SetBaseURI";
              base_uri: uri
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_SetBaseURICallback"; 
              _recipient: _sender;
              _amount: Uint128 0;
              base_uri: uri
            };
            msgs = one_msg msg_to_sender;
            send msgs  
          end
          
          (* Mints a token with a specific 'token_uri' and transfers it to 'to'. *)
          (* Pass empty string to 'token_uri' to use the concatenated token URI. i.e. '<base_uri><token_id>'. *)
          (* @param: to - Address of the token recipient *)
          (* @param: token_uri - URI of a token *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition Mint(to: ByStr20, token_uri: String)
            RequireNotPaused;
            domain_id = builtin sha256hash token_uri;
            maybe_dns <- nft_dns[domain_id]; match maybe_dns with
              | None =>
                id_ = let txID = "BuyNftUsername" in Pair {String String} zilID txID;
                HandlePayment id_
              | Some address =>
                RequireNotPausedZil;
                is_owner = builtin eq _sender address; match is_owner with 
                  | True => | False => e = { _exception : "SSIDNS-ZilDomainIsTaken" }; throw e end end;
            MintToken to;
            token_id <- token_id_count;
            token_domains[token_id] := domain_id;
            SetTokenURI token_id token_uri;
            nft_domain_names[domain_id] := token_id;
            nft_dns[domain_id] := to;
          
            e = {
              _eventname: "Mint";
              to: to;
              token_id: token_id;
              token_uri: token_uri
            };
            event e;
            msg_to_recipient = {
              _tag: "ZRC6_RecipientAcceptMint";
              _recipient: to;
              _amount: Uint128 0
            };
            msg_to_sender = {
              _tag: "ZRC6_MintCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              to: to;
              token_id: token_id;
              token_uri: token_uri
            };
            msgs = two_msgs msg_to_recipient msg_to_sender;
            send msgs
          end
          
          (* Mints a token with a specific 'token_uri' and transfers it to 'to'. *)
          (* Pass empty string to 'token_uri' to use the concatenated token URI. i.e. '<base_uri><token_id>'. *)
          (* @param: to - Address of the token recipient *)
          (* @param: token_uri - URI of a token *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition MintTyron(to: ByStr20, token_uri: ByStr32, id: String)
            RequireNotPaused; domain_id = token_uri;
            maybe_dns <- nft_dns[domain_id]; match maybe_dns with
              | None =>
                id_ = let txID = "BuyNftUsername" in Pair {String String} id txID;
                HandlePayment id_
              | Some address =>
                RequireNotPausedZil;
                is_owner = builtin eq _sender address; match is_owner with 
                  | True => | False => e = { _exception : "SSIDNS-ZilDomainIsTaken" }; throw e end end;
            MintToken to;
            token_id <- token_id_count;
            token_domains[token_id] := domain_id;
            nft_domain_names[domain_id] := token_id;
            nft_dns[domain_id] := to;
          
            e = {
              _eventname: "MintTyron";
              to: to;
              token_id: token_id;
              token_uri: token_uri
            };
            event e;
            msg_to_recipient = {
              _tag: "ZRC6_RecipientAcceptMint";
              _recipient: to;
              _amount: Uint128 0
            };
            msg_to_sender = {
              _tag: "ZRC6_MintCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              to: to;
              token_id: token_id;
              token_uri: empty_string
            };
            msgs = two_msgs msg_to_recipient msg_to_sender;
            send msgs
          end
          
          (* Mints multiple tokens with 'token_uri's and transfers them to multiple 'to's. *)
          (* Pass empty string to 'token_uri' to use the concatenated token URI. i.e. '<base_uri><token_id>'. *)
          (* @param: to_token_uri_pair_list - List of Pair (to, token_uri). *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition BatchMint(to_token_uri_pair_list: List (Pair ByStr20 String))
            RequireNotPaused;
            cur_id <- token_id_count;
            start_id = builtin add cur_id one;
            txID = "BuyNftUsername";
            counter = let list_length = @list_length (Pair ByStr20 String) in list_length to_token_uri_pair_list;
            HandleBatchPayment zilID txID counter;
            forall to_token_uri_pair_list HandleMint;
            end_id <- token_id_count;
            e = {
              _eventname: "BatchMint";
              to_token_uri_pair_list: to_token_uri_pair_list;
              start_id: start_id;
              end_id: end_id
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_BatchMintCallback";
              _recipient: _sender;
              _amount: Uint128 0
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Mints multiple tokens with 'token_uri's and transfers them to multiple 'to's. *)
          (* Pass empty string to 'token_uri' to use the concatenated token URI. i.e. '<base_uri><token_id>'. *)
          (* @param: to_token_uri_pair_list - List of Pair (to, token_uri). *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition BatchMintTyron(to_token_uri_pair_list: List (Pair ByStr20 String), id: String)
            RequireNotPaused;
            cur_id <- token_id_count;
            start_id = builtin add cur_id one;
            txID = "BuyNftUsername";
            counter = let list_length = @list_length (Pair ByStr20 String) in list_length to_token_uri_pair_list;
            HandleBatchPayment id txID counter;
            forall to_token_uri_pair_list HandleMint;
            end_id <- token_id_count;
            e = {
              _eventname: "BatchMint";
              to_token_uri_pair_list: to_token_uri_pair_list;
              start_id: start_id;
              end_id: end_id
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_BatchMintCallback";
              _recipient: _sender;
              _amount: Uint128 0
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Destroys 'token_id'. *)
          (* @param: token_id - Unique ID of the NFT to be destroyed *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition Burn(token_id: Uint256)
            RequireNotPaused;
            (* Check if token exists *)
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              BurnToken token_id;
              msg_to_sender = {
                _tag: "ZRC6_BurnCallback";
                _recipient: _sender;
                _amount: Uint128 0;
                token_owner: token_owner;
                token_id: token_id
              };
              msgs = one_msg msg_to_sender;
              send msgs
            end
          end
          
          (* Destroys 'token_id_list'. *)
          (* @param: token_id_list - List of unique IDs of the NFT to be destroyed *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition BatchBurn(token_id_list: List Uint256)
            RequireNotPaused;
            forall token_id_list BurnToken;
            msg_to_sender = {
              _tag: "ZRC6_BatchBurnCallback";
              _recipient: _sender;
              _amount: Uint128 0
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Sets 'spender' for 'token_id'. *)
          (* To remove 'spender' for a token, use 'zero_address'. *)
          (* i.e., '0x0000000000000000000000000000000000000000' *)
          (* @Requirements: *)
          (* - 'token_id' must exist. Otherwise, it must throw 'TokenNotFoundError' *)
          (* - '_sender' must be a token owner or an operator. Otherwise, it must throw 'NotOwnerOrOperatorError' *)
          (* - '_sender' must not be 'spender'. Otherwise, it must throw 'SelfError' *)
          (* - 'spender' must not be already a spender. Otherwise, it must throw 'SpenderFoundError' *)
          transition SetSpender(spender: ByStr20, token_id: Uint256)
            RequireNotSelf spender _sender;
            
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              RequireOwnerOrOperator token_owner;
              
              (* Check if the spender exists *)
              maybe_spender <- spenders[token_id];
              match maybe_spender with
                | None =>
                | Some cur_spender =>
                  has_spender = builtin eq cur_spender spender;
                  match has_spender with 
                  | False =>
                  | True => 
                    error = SpenderFoundError;
                    Throw error
                  end
              end;
                
              spenders[token_id] := spender;
          
              e = {
                _eventname: "SetSpender";
                token_owner: token_owner;
                spender: spender;
                token_id: token_id
              };
              event e;
              msg_to_sender = {
                _tag: "ZRC6_SetSpenderCallback";
                _recipient: _sender;
                _amount: Uint128 0;
                spender: spender;
                token_id: token_id
              };
              msgs = one_msg msg_to_sender;
              send msgs
            end
          end
          
          (* Adds 'operator' for '_sender'. *)
          (* @Requirements: *)
          (* - '_sender' must be the token owner. Otherwise, it must throw 'NotTokenOwnerError' *)
          (* - '_sender' must not be 'operator'. Otherwise, it must throw 'SelfError' *)
          (* - 'operator' must not be already an operator. Otherwise, it must throw 'OperatorFoundError' *)
          transition AddOperator(operator: ByStr20)
            RequireNotSelf operator _sender;
            
            maybe_bal <- balances[_sender];
            balance = get_bal maybe_bal;
            
            is_balance_zero = builtin eq zero balance;
            (* _sender must have at least 1 token *)
            match is_balance_zero with 
            | True =>    
              error = NotTokenOwnerError;
              Throw error
            | False =>
              has_operator <- exists operators[_sender][operator];
              match has_operator with
              | False =>
                (* Add operator *)
                operators[_sender][operator] := true
              | True =>
                error = OperatorFoundError;
                Throw error
              end;
              e = {
                _eventname: "AddOperator";
                token_owner: _sender;
                operator: operator
              };
              event e;
              msg_to_sender = {
                _tag: "ZRC6_AddOperatorCallback";
                _recipient: _sender;
                _amount: Uint128 0;
                operator: operator
              };
              msgs = one_msg msg_to_sender;
              send msgs
            end
          end
          
          (* Removes 'operator' for '_sender'. *)
          (* @Requirements:  *)
          (* - 'operator' must be already an operator of '_sender'. Otherwise, it must throw 'OperatorNotFoundError' *)
          transition RemoveOperator(operator: ByStr20)
            has_operator <- exists operators[_sender][operator];
            match has_operator with
            | False =>
              error = OperatorNotFoundError;
              Throw error
            | True =>
              (* Remove operator *)
              delete operators[_sender][operator]
            end;
            e = {
              _eventname: "RemoveOperator";
              token_owner: _sender;
              operator: operator
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_RemoveOperatorCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              operator: operator
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          (* Transfers 'token_id' from the token owner to 'to'.  *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition TransferFrom(to: ByStr20, token_id: Uint256)
            RequireNotPaused;
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
              TransferToken to token_id;
              msg_to_recipient = {
                _tag: "ZRC6_RecipientAcceptTransferFrom";
                _recipient: to;
                _amount: Uint128 0;
                from: token_owner;
                to: to;
                token_id: token_id
              };
              msg_to_sender = {
                _tag: "ZRC6_TransferFromCallback";
                _recipient: _sender;
                _amount: Uint128 0;
                from: token_owner;
                to: to;
                token_id: token_id
              };
              msgs = two_msgs msg_to_recipient msg_to_sender;
              send msgs
            end
          end
          
          (* Transfers multiple 'token_id' to multiple 'to'. *)
          (* @param: to_token_id_pair_list - List of Pair (to, token_id). *)
          (* @Requirements: *)
          (* - The contract must not be paused. Otherwise, it must throw 'PausedError' *)
          transition BatchTransferFrom(to_token_id_pair_list: List (Pair ByStr20 Uint256))
            RequireNotPaused;
            forall to_token_id_pair_list HandleTransfer;
            msg_to_sender = {
              _tag: "ZRC6_BatchTransferFromCallback";
              _recipient: _sender;
              _amount: Uint128 0
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          
          procedure ThrowIfSameDomain(
            a: ByStr32,
            b: ByStr32
            )
            is_same = builtin eq a b; match is_same with
              | False => | True => ver <- version; e = { _exception: "SSIDApp-SameDomain"; version: ver }; throw e end end
          
          transition UpdateDomain( domain: ByStr32 )
            RequireNotPaused; RequireContractOwner; id <- nft_domain;
            ThrowIfSameDomain id domain;
            current_init <-& init.dApp; domain_ = builtin to_string domain;
            get_did <-& current_init.did_dns[domain_]; match get_did with
              | Some did_ =>
                pending_domain := domain;
                e = { _eventname: "SetContractOwnershipRecipient";
                  to: domain }; event e;
                msg_to_sender = { _tag: "ZRC6_SetContractOwnershipRecipientCallback";
                  _recipient: _sender;
                  _amount: Uint128 0;
                  to: did_ }; msgs = one_msg msg_to_sender; send msgs
              | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e end end
          
          transition AcceptPendingDomain()
            RequireNotPaused; domain <- pending_domain;
            current_init <-& init.dApp; domain_ = builtin to_string domain;
            get_did <-& current_init.did_dns[domain_]; match get_did with
              | None => ver <- version; e = { _exception: "SSIDApp-DidIsNull"; version: ver }; throw e
              | Some did_ =>
                controller <-& did_.controller; VerifyOrigin controller;
                nft_domain := domain; pending_domain := zero_bystr32;
                e = {
                  _eventname: "AcceptContractOwnership";
                  contract_owner: _sender }; event e;
                msg_to_sender = { _tag: "ZRC6_AcceptContractOwnershipCallback";
                  _recipient: _sender;
                  _amount: Uint128 0;
                  contract_owner: _sender }; msgs = one_msg msg_to_sender; send msgs end end
          
          (* Shall change the current permalink for a new one. *)
          transition UpdateTokenURI(token_id: Uint256, token_uri: String)
            RequireNotPaused;
            (* Check if token exists *)
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
                RequireOwnerOrOperator token_owner;
                SetTokenURI token_id token_uri;
                msg_to_sender = {
                  _tag: "SSIDNS_UpdateDomainCallback";
                  _recipient: _sender;
                  _amount: Uint128 0;
                  token_owner: token_owner;
                  token_id: token_id
                };
                msgs = one_msg msg_to_sender;
                send msgs;
                e = {
                  _eventname: "TokenURIUpdated";
                  token_id: token_id
                }
            end
          end
          
          (* Sets the domain address for a certain token. *)
          transition UpdateDomainAddress(token_id: Uint256, new_addr: ByStr20)
            RequireNotPaused;
            (* Check if token exists *)
            maybe_token_owner <- token_owners[token_id];
            match maybe_token_owner with
            | None =>
              error = TokenNotFoundError;
              Throw error
            | Some token_owner =>
                RequireOwnerOrOperator token_owner;
                get_token_domain <- token_domains[token_id]; token_domain = option_bystr32_value get_token_domain;
                nft_dns[token_domain] := new_addr;
                msg_to_sender = {
                  _tag: "SSIDNS_UpdateDomainCallback";
                  _recipient: _sender;
                  _amount: Uint128 0;
                  token_owner: token_owner;
                  token_id: token_id
                };
                msgs = one_msg msg_to_sender;
                send msgs;
                e = {
                  _eventname: "DomainAddressUpdated";
                  token_id: token_id
                }
            end
          end
          
          (* Adds 'minter'. *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          (* - 'minter' must not be already a minter. Otherwise, it must throw 'MinterFoundError' *)
          (*
          transition AddMinter(minter: ByStr20)
            RequireContractOwner;
            has_minter <- exists minters[minter];
            match has_minter with
            | True => 
              error = MinterFoundError;
              Throw error
            | False =>
              (* Add minter *)
              minters[minter] := true
            end;
            e = { 
              _eventname: "AddMinter";
              minter: minter
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_AddMinterCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              minter: minter
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          *)
                  
          (* Removes 'minter'. *)
          (* @Requirements: *)
          (* - '_sender' must be the contract owner. Otherwise, it must throw 'NotContractOwnerError' *)
          (* - 'minter' must be already a minter. Otherwise, it must throw 'MinterNotFoundError' *)
          (*
          transition RemoveMinter(minter: ByStr20)
            RequireContractOwner;
            has_minter <- exists minters[minter];
            match has_minter with
            | False =>
              error = MinterNotFoundError;
              Throw error
            | True => 
              delete minters[minter]
            end;
            e = { 
              _eventname: "RemoveMinter";
              minter: minter
            };
            event e;
            msg_to_sender = {
              _tag: "ZRC6_RemoveMinterCallback";
              _recipient: _sender;
              _amount: Uint128 0;
              minter: minter
            };
            msgs = one_msg msg_to_sender;
            send msgs
          end
          *)
        `;
      const init_nft = '0xa6839868185028d3a0fdb1990de911403189e7747decd872f3916a09b97b7285' // $tyronzlp.did hash
      const init_dns = []
      const init = [
        {
          vname: "_scilla_version",
          type: "Uint32",
          value: "0",
        },
        {
          vname: "init_nft",
          type: "ByStr32",
          value: `${init_nft}`,
        },
        {
          vname: "init",
          type: "ByStr20",
          value: `${init_tyron}`,
        },
        {
          vname: "initial_contract_owner",
          type: "ByStr20",
          value: `${address}`,
        },
        {
          vname: "initial_base_uri",
          type: "String",
          value: "https://arweave.net/",
        },
        {
          vname: "name",
          type: "String", //@xalkan
          value: "$tyronzlp.ssi dApp: .zlp NFT domain names",
        },
        {
          vname: "symbol",
          type: "String",
          value: ".zlp",
        },
        {
          vname: "init_dns",
          type: "Map ByStr32 ByStr20",
          value: init_dns,
        },
      ];
      const contract = contracts.new(code, init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "100000",
        gasPrice: "2000000000",
      });
      return [tx, deployed_contract];
    } catch (error) {
      throw error;
    }
  }
}
