import * as tyron from 'tyron'
import { ZIlPayInject } from '../../src/types/zil-pay'
import { operationKeyPair } from '../../src/lib/dkms'

type Params = {
    contractAddress: string
    transition: string
    params: Record<string, unknown>[]
    amount: string
}

const zutil = tyron.Util.default.Zutil()
const window = global.window as any
const DEFAULT_GAS = {
    gasPrice: '2000',
    gaslimit: '10000',
}

export class ZilPayBase {
    public zilpay: () => Promise<ZIlPayInject>
    constructor() {
        this.zilpay = () =>
            new Promise((resolve, reject) => {
                if (!(process as any).browser) {
                    return resolve({} as any)
                }
                let k = 0
                const i = setInterval(() => {
                    if (k >= 10) {
                        clearInterval(i)
                        return reject(new Error('ZilPay is not installed.'))
                    }

                    if (typeof window['zilPay'] !== 'undefined') {
                        clearInterval(i)
                        return resolve(window['zilPay'])
                    }

                    k++
                }, 100)
            })
    }

    async getSubState(contract: string, field: string, params: string[] = []) {
        if (!(process as any).browser) {
            return null
        }

        const zilPay = await this.zilpay()
        const res = await zilPay.blockchain.getSmartContractSubState(
            contract,
            field,
            params
        )

        if (res.error) {
            throw new Error(res.error.message)
        }

        if (res.result && res.result[field] && params.length === 0) {
            return res.result[field]
        }

        if (res.result && res.result[field] && params.length === 1) {
            const [arg] = params
            return res.result[field][arg]
        }

        if (res.result && res.result[field] && params.length > 1) {
            return res.result[field]
        }

        return null
    }

    async getState(contract: string) {
        if (!(process as any).browser) {
            return null
        }
        const zilPay = await this.zilpay()
        const res = await zilPay.blockchain.getSmartContractState(contract)

        if (res.error) {
            throw new Error(res.error.message)
        }

        return res.result
    }

    async getBlockchainInfo() {
        if (!(process as any).browser) {
            return null
        }

        const zilPay = await this.zilpay()
        const { error, result } = await zilPay.blockchain.getBlockChainInfo()

        if (error) {
            throw new Error(error.message)
        }

        return result
    }

    async call(data: Params, gas?: any) {
        let this_gas = DEFAULT_GAS
        if (gas !== undefined) {
            this_gas = gas
        }
        const zilPay = await this.zilpay()
        const { contracts, utils } = zilPay
        const contract = contracts.at(data.contractAddress)
        const gasPrice = utils.units.toQa(
            this_gas.gasPrice,
            utils.units.Units.Li
        )
        const gasLimit = utils.Long.fromNumber(this_gas.gaslimit)
        const amount_ = zutil.units.toQa(data.amount, zutil.units.Units.Zil)

        const amount = amount_ || '0'

        return await contract.call(data.transition, data.params, {
            amount,
            gasPrice,
            gasLimit,
        })
    }

    async deployDid(net: string, address: string, arConnect: any) {
        try {
            const zilPay = await this.zilpay()
            const { contracts } = zilPay

            //mainnet addresses
            let XWALLET = '0x4f64daa860b19d5ac7b3552917c385ca0b6075c7'
            let xInit = '0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9'

            if (net === 'testnet') {
                XWALLET = '0xadd4b95f32f3aa4d23f19746ebf9fb87d20c82fb'
                xInit = '0xec194d20eab90cfab70ead073d742830d3d2a91b' //@todo-x
            }
            const xwallet = contracts.at(XWALLET)
            const code = await xwallet.getCode()

            let verification_methods: any = []
            if (arConnect !== null) {
                const key_input = [
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose.Update,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .SocialRecovery,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose.General,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose.Auth,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .Assertion,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .Agreement,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .Invocation,
                    },
                    {
                        id: tyron.VerificationMethods.PublicKeyPurpose
                            .Delegation,
                    },
                ]
                for (const input of key_input) {
                    // Creates the cryptographic DID key pair
                    const doc = await operationKeyPair({
                        arConnect: arConnect,
                        id: input.id,
                        addr: address,
                    })
                    verification_methods.push(doc.element.key)
                }
            } else {
                throw new Error('Connect your Arweave wallet to continue.')
            }

            const did_methods: Array<{ key: string; val: string }> = []
            const did_dkms: Array<{ key: string; val: string }> = []

            for (let i = 0; i < verification_methods.length; i += 1) {
                did_methods.push({
                    key: verification_methods[i].id,
                    val: verification_methods[i].key,
                })
                did_dkms.push({
                    key: verification_methods[i].id,
                    val: verification_methods[i].encrypted,
                })
            }
            // did_methods.push(
            //   {
            //     key: `${"null"}`,
            //     val: `${"0x000000000000000000000000000000000000000000000000000000000000000000"}`,
            //   }
            // );
            // did_dkms.push(
            //   {
            //     key: `${"null"}`,
            //     val: `${"null"}`,
            //   }
            // );

            const init = [
                {
                    vname: '_scilla_version',
                    type: 'Uint32',
                    value: '0',
                },
                {
                    vname: 'init_controller',
                    type: 'ByStr20',
                    value: `${address}`,
                },
                {
                    vname: 'init',
                    type: 'ByStr20',
                    value: `${xInit}`,
                },
                {
                    vname: 'did_methods',
                    type: 'Map String ByStr33',
                    value: did_methods,
                },
                {
                    vname: 'did_dkms',
                    type: 'Map String String',
                    value: did_dkms,
                },
            ]
            const contract = contracts.new(code, init)
            const [tx, deployed_contract] = await contract.deploy({
                gasLimit: '45000',
                gasPrice: '2000000000',
            })
            return [tx, deployed_contract]
        } catch (error) {
            throw error
        }
    }

    async deployDomain(net: string, domain: string, address: string) {
        try {
            const zilPay = await this.zilpay()
            const { contracts } = zilPay
            let addr = ''

            // mainnet
            switch (domain) {
                case 'stake':
                    addr = '0x6ae25f8df1f7f3fae9b8f9630e323b456c945e88'
                    break
                case 'vc':
                    addr = '0x6ae25f8df1f7f3fae9b8f9630e323b456c945e88'
                    break
                case 'ssi':
                    addr = ''
                    break
            }
            if (net === 'testnet') {
                switch (domain) {
                    case 'vc':
                        addr = '0x25B4B343ba84D53c2f9Db964Fd966BB1a579EF25'
                        break
                    case 'ssi':
                        addr = 'zil1jnc7wsynp4q9cvtmrkeea9eu2qmyvwdy8dxl53'
                        break
                }
            }

            const template = contracts.at(addr)
            const code = await template.getCode()

            const init = [
                {
                    vname: '_scilla_version',
                    type: 'Uint32',
                    value: '0',
                },
                {
                    vname: 'init_controller',
                    type: 'ByStr20',
                    value: `${address}`,
                },
            ]

            const contract = contracts.new(code, init)
            const [tx, deployed_contract] = await contract.deploy({
                gasLimit: '35000',
                gasPrice: '2000000000',
            })
            return [tx, deployed_contract]
        } catch (error) {
            throw error
        }
    }

    async deployDomainBeta(net: string, username: string) {
        try {
            let network = tyron.DidScheme.NetworkNamespace.Mainnet

            //@todo-x
            let init_ = '0x57ab899357ad95f5bf345f6575ad8c9a53e55cdc'

            if (net === 'testnet') {
                network = tyron.DidScheme.NetworkNamespace.Testnet
                init_ = '0xec194d20eab90cfab70ead073d742830d3d2a91b'
            }

            const zilPay = await this.zilpay()
            const { contracts } = zilPay

            //@todo-x
            const code = `
            (* v0.8.0
                zilstake.tyron: $ZIL Staking Wallet, DID Domain DApp <> NFT Username DNS
                Self-Sovereign Identity Protocol
                Copyright (C) Tyron Mapu Community Interest Company and its affiliates.
                tyron.network
                
                This program is free software: you can redistribute it and/or modify
                it under the terms of the GNU General Public License as published by
                the Free Software Foundation, either version 3 of the License, or
                (at your option) any later version.
                
                This program is distributed in the hope that it will be useful,
                but WITHOUT ANY WARRANTY; without even the implied warranty of
                MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                GNU General Public License for more details.*)
                
                scilla_version 0
                
                import PairUtils BoolUtils
                
                library ZilStakingWallet
                   let one_msg =
                    fun( msg: Message ) =>
                    let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
                  
                  let zero = Uint128 0
                  let zeroByStr20 = 0x0000000000000000000000000000000000000000
                  let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
                  
                  let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
                    match input with
                    | Some v => v
                    | None => default end
                  let option_uint128_value = let f = @option_value Uint128 in f zero
                  let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
                  let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64
                 
                  let true = True
                  let false = False
                  let null = ""
                  let did = "did"
                
                  type Beneficiary =
                    | NftUsername of String String (* username & domain *)
                    | Recipient of ByStr20
                
                contract ZilStakingWallet(
                  init_usernameHash: ByStr32,
                  init: ByStr20 with contract field dApp: ByStr20 with contract
                    field dns: Map String ByStr20,
                    field did_dns: Map String ByStr20 with contract
                      field controller: ByStr20,
                      field services: Map String ByStr20,
                      field did_domain_dns: Map String ByStr20 end end end
                  )
                  field username_hash: ByStr32 = init_usernameHash
                  field paused: Bool = false
                
                  (* A monotonically increasing number representing the amount of transactions that have taken place *)
                  field tx_number: Uint128 = zero
                  field services: Map String ByStr20 = Emp String ByStr20
                  field version: String = "zilstake.tyron-0.8.0" (* @todo *)
                
                procedure SupportTyron( tyron: Option Uint128 )
                  match tyron with
                  | None => | Some donation =>
                      current_init <-& init.dApp; donateDApp = "donate";
                      get_addr <-& current_init.dns[donateDApp]; addr = option_bystr20_value get_addr;
                      accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donation } in one_msg m; send msg end end
                
                procedure VerifyController(
                  username: String,
                  tyron: Option Uint128
                  )
                  usernameHash = builtin sha256hash username; current_usernameHash <- username_hash;
                  verified_name = builtin eq usernameHash current_usernameHash; match verified_name with
                  | True => | False => e = { _exception : "zilstake.tyron-WrongUsername" }; throw e end;
                  current_init <-& init.dApp;
                  get_did <-& current_init.did_dns[username]; match get_did with
                  | None => e = { _exception : "zilstake.tyron-DidIsNull" }; throw e
                  | Some did_ =>
                      current_controller <-& did_.controller;
                      verified = builtin eq _origin current_controller; match verified with
                      | True => SupportTyron tyron
                      | False => e = { _exception : "zilstake.tyron-WrongCaller" }; throw e end end end
                
                procedure Timestamp()
                  latest_tx_number <- tx_number; new_tx_number = let incrementor = Uint128 1 in builtin add latest_tx_number incrementor;
                  tx_number := new_tx_number end
                
                procedure ThrowIfSameAddr(
                  a: ByStr20,
                  b: ByStr20
                  )
                  is_self = builtin eq a b; match is_self with
                    | False => | True => e = { _exception : "zilstake.tyron-SameAddress" }; throw e end end
                
                procedure IsNotPaused()
                  is_paused <- paused; match is_paused with
                    | False => | True => e = { _exception : "zilstake.tyron-WrongStatus" }; throw e end end
                  
                procedure IsPaused()
                  is_paused <- paused; match is_paused with
                    | True => | False => e = { _exception : "zilstake.tyron-WrongStatus" }; throw e end end
                
                transition UpdateUsername(
                  username: String,
                  newUsername: ByStr32,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  current_usernameHash <- username_hash;
                  verified = builtin eq current_usernameHash newUsername; match verified with
                    | True => e = { _exception : "zilstake.tyron-SameUsername" }; throw e
                    | False => SupportTyron tyron end;
                  username_hash := newUsername;
                  Timestamp end
                
                transition Pause(
                  username: String,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron; paused := true;
                  e = { _eventname: "DidDomainPaused";
                    pauser: _sender }; event e;
                  Timestamp end
                
                transition Unpause(
                  username: String,
                  tyron: Option Uint128
                  )
                  IsPaused; VerifyController username tyron; paused := false;
                  e = { _eventname: "DidDomainUnpaused";
                    pauser: _sender }; event e;
                  Timestamp end
                
                (* Receive $ZIL native funds *)
                transition AddFunds()
                  IsNotPaused; accept; Timestamp end
                
                (* Send $ZIL to any recipient that implements the tag, e.g. "AddFunds", "", etc. *)
                transition SendFunds(
                  username: String,
                  tag: String,
                  beneficiary: Beneficiary,
                  amount: Uint128,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  match beneficiary with
                  | NftUsername username_ domain_ =>
                    current_init <-& init.dApp;
                    is_null = builtin eq domain_ null; match is_null with
                      | True =>
                        get_addr <-& current_init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr _this_address addr;
                        msg = let m = { _tag: tag; _recipient: addr; _amount: amount } in one_msg m; send msg
                      | False =>
                        get_did <-& current_init.did_dns[username_]; match get_did with
                          | None => e = { _exception : "zilstake.tyron-DidIsNull" }; throw e
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
                
                procedure FetchServiceAddr( id: String )
                  current_init <-& init.dApp; initDApp = "init";
                  get_did <-& current_init.did_dns[initDApp]; match get_did with
                    | None => e = { _exception : "zilstake.tyron-DidIsNull" }; throw e
                    | Some did_ =>
                      get_service <-& did_.services[id]; addr = option_bystr20_value get_service;
                      services[id] := addr end end
                
                transition DelegateStake(
                  username: String,
                  stakeID: String,
                  ssnID: String,
                  amount: Uint128,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  FetchServiceAddr ssnID; get_ssnaddr <- services[ssnID]; ssnaddr = option_bystr20_value get_ssnaddr;
                  accept; msg = let m = { _tag: "DelegateStake"; _recipient: addr; _amount: amount;
                    ssnaddr: ssnaddr } in one_msg m; send msg end
                
                transition DelegateStakeSuccessCallBack( ssnaddr: ByStr20, amount: Uint128 ) IsNotPaused end
                
                transition WithdrawStakeRewards(
                  username: String,
                  stakeID: String,
                  ssnID: String,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  FetchServiceAddr ssnID; get_ssnaddr <- services[ssnID]; ssnaddr = option_bystr20_value get_ssnaddr;
                  msg = let m = { _tag: "WithdrawStakeRewards"; _recipient: addr; _amount: zero;
                    ssnaddr: ssnaddr } in one_msg m; send msg end
                
                transition WithdrawStakeRewardsSuccessCallBack( ssnaddr: ByStr20, rewards: Uint128 ) IsNotPaused end  
                
                transition WithdrawStakeAmt(
                  username: String,
                  stakeID: String,
                  ssnID: String,
                  amount: Uint128,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  FetchServiceAddr ssnID; get_ssnaddr <- services[ssnID]; ssnaddr = option_bystr20_value get_ssnaddr;
                  msg = let m = { _tag: "WithdrawStakeAmt"; _recipient: addr; _amount: zero;
                    ssnaddr: ssnaddr;
                    amt: amount } in one_msg m; send msg end
                
                transition WithdrawStakeAmtSuccessCallBack( ssnaddr: ByStr20, amount: Uint128 ) IsNotPaused end
                
                transition CompleteWithdrawal(
                  username: String,
                  stakeID: String,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  msg = let m = { _tag: "CompleteWithdrawal"; _recipient: addr; _amount: zero } in one_msg m; send msg end
                
                transition CompleteWithdrawalNoUnbondedStakeCallBack( amount: Uint128 ) IsNotPaused end
                
                transition CompleteWithdrawalSuccessCallBack( amount: Uint128 ) IsNotPaused end
                
                transition ReDelegateStake(
                  username: String,
                  stakeID: String,
                  ssnID: String,
                  tossnID: String,
                  amount: Uint128,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  FetchServiceAddr ssnID; get_ssnaddr <- services[ssnID]; ssnaddr = option_bystr20_value get_ssnaddr;
                  FetchServiceAddr tossnID; get_tossnaddr <- services[tossnID]; to_ssnaddr = option_bystr20_value get_tossnaddr;
                  msg = let m = { _tag: "ReDelegateStake"; _recipient: addr; _amount: zero;
                    ssnaddr: ssnaddr;
                    to_ssn: to_ssnaddr;
                    amount: amount } in one_msg m; send msg end
                
                transition ReDelegateStakeSuccessCallBack( ssnaddr: ByStr20, tossn: ByStr20, amount: Uint128 ) IsNotPaused end
                
                transition RequestDelegatorSwap(
                  username: String,
                  stakeID: String,
                  newDelegAddr: ByStr20,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  msg = let m = { _tag: "RequestDelegatorSwap"; _recipient: addr; _amount: zero;
                    new_deleg_addr: newDelegAddr } in one_msg m; send msg end
                
                (* Sent by the new delegator *)
                transition ConfirmDelegatorSwap(
                  username: String,
                  stakeID: String,
                  requestor: ByStr20, (* The previous delegator *)
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  msg = let m = { _tag: "ConfirmDelegatorSwap"; _recipient: addr; _amount: zero;
                    requestor: requestor } in one_msg m; send msg end
                
                transition RevokeDelegatorSwap(
                  username: String,
                  stakeID: String,
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  msg = let m = { _tag: "RevokeDelegatorSwap"; _recipient: addr; _amount: zero } in one_msg m; send msg end
                
                (* Sent by the new delegator *)
                transition RejectDelegatorSwap(
                  username: String,
                  stakeID: String,
                  requestor: ByStr20, (* The previous delegator *)
                  tyron: Option Uint128
                  )
                  IsNotPaused; VerifyController username tyron;
                  FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
                  msg = let m = { _tag: "RejectDelegatorSwap"; _recipient: addr; _amount: zero;
                    requestor: requestor } in one_msg m; send msg end
            `
            const usernameHash = await tyron.Util.default.HashString(username)

            const contract_init = [
                {
                    vname: '_scilla_version',
                    type: 'Uint32',
                    value: '0',
                },
                {
                    vname: 'init_usernameHash',
                    type: 'ByStr32',
                    value: `${'0x' + usernameHash}`,
                },
                {
                    vname: 'init',
                    type: 'ByStr20',
                    value: `${init_}`,
                },
            ]

            const contract = contracts.new(code, contract_init)
            const [tx, deployed_contract] = await contract.deploy({
                gasLimit: '30000',
                gasPrice: '2000000000',
            })
            return [tx, deployed_contract]
        } catch (error) {
            throw error
        }
    }
}
