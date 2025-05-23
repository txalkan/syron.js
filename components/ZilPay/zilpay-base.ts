import * as tyron from 'tyron'
import { ZIlPayInject } from '../../src/types/zil-pay'
import { operationKeyPair } from '../../src/lib/dkms'
import { toast } from 'react-toastify'
import { updateShowZilpay } from '../../src/store/modal'

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
                        // @review: zilpay modal to download app
                        toast(
                            'To connect, use ZilPay mobile or desktop wallet.',
                            {
                                position: 'top-right',
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: 'dark',
                                toastId: 5,
                            }
                        )
                        updateShowZilpay(false)
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

            //@xalkan
            let DIDxWALLET = 'zil10heawdw3a6a8zn28498wqm7rted6vp09wt0j4l' //'zil1u267scqjs6rrgfs5c326el23hh78g9j38ng58m'
            let xInit = '0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9'

            if (net === 'testnet') {
                DIDxWALLET = '0xC559823eB4D63AF3176Dd858E2386C2BF650A94d' //'v6.4 0x08Fa5445ce423084CE1442021f49a4fD1249299F'
                xInit = '0xec194d20eab90cfab70ead073d742830d3d2a91b'
            }
            const xwallet = contracts.at(DIDxWALLET)
            const code = await xwallet.getCode()

            let verification_methods: any = []
            const did_methods: Array<{ key: string; val: string }> = []
            const did_dkms: Array<{ key: string; val: string }> = []
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
            } else {
                did_methods.push({
                    key: `${'update'}`,
                    val: `${'0x000000000000000000000000000000000000000000000000000000000000000000'}`,
                })
                did_dkms.push({
                    key: `${'null'}`,
                    val: `${'null'}`,
                })
            }

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
                gasLimit: '50000',
                gasPrice: '2000000000',
            })
            return [tx, deployed_contract]
        } catch (error) {
            throw error
        }
    }

    async deployDomain(net: string, xwallet: string, username: string) {
        try {
            const zilPay = await this.zilpay()
            const { contracts } = zilPay

            const domainId =
                '0x' + (await tyron.Util.default.HashString(username))

            let addr = ''
            // @zil-mainnet
            let init_ = '0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9'
            switch (xwallet) {
                case 'ZIL Staking xWALLET':
                    addr = '0x6ae25f8df1f7f3fae9b8f9630e323b456c945e88'
                    break
                case 'Decentralised Finance xWALLET':
                    addr = 'zil1ke3msdrd9e6wrt5pl6g6jcxdh4akhtx5ar8q9k' //v1.1.1
                    //'zil1thy4g54km2fuued6ynnyrqelq9gprdru8p0w4p' //v1.1.0
                    //'zil18ypr6axla53wjnxhce50mqewedcl3cpzgav26y'
                    break
            }
            let init_community = '0x691dec1ac04f55abbbf5ebd3aaf3217400d5c689'
            if (net === 'testnet') {
                init_ = '0xec194d20eab90cfab70ead073d742830d3d2a91b'
                switch (xwallet) {
                    case 'ZIL Staking xWALLET':
                        addr = 'zil1tah8zu9zlz4m3hja90wp9sg8wwxezpp7rmkt0e'
                        break
                    case 'Decentralised Finance xWALLET':
                        addr = 'zil100rsx5664dx0j0hdhntxts2rdnet3z9y6g6nen'
                        break
                }
                init_community = '0x70cc1b277452c166964b5d50abd86451bea12056'
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
                    vname: 'init_nft',
                    type: 'ByStr32',
                    value: `${domainId}`,
                },
                {
                    vname: 'init',
                    type: 'ByStr20',
                    value: `${init_}`,
                },
                {
                    vname: 'init_community',
                    type: 'ByStr20',
                    value: `${init_community}`,
                },
            ]

            const contract = contracts.new(code, init)
            const [tx, deployed_contract] = await contract.deploy({
                gasLimit: '55000',
                gasPrice: '2000000000',
            })
            return [tx, deployed_contract]
        } catch (error) {
            throw error
        }
    }

    async deployDomainBeta(net: string, username: string) {
        try {
            //@xalkan
            let init_ = '0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9'
            let init_community = '0x691dec1ac04f55abbbf5ebd3aaf3217400d5c689'
            if (net === 'testnet') {
                init_ = '0xec194d20eab90cfab70ead073d742830d3d2a91b'
                init_community = '0x70cc1b277452c166964b5d50abd86451bea12056'
            }

            const zilPay = await this.zilpay()
            const { contracts } = zilPay

            const domainId =
                '0x' + (await tyron.Util.default.HashString(username))

            //@xalkan ZILx
            // const code =
            //   `
            //       (* v0.11
            //         ZILxWALLET: $ZIL Staking Smart Contract Wallet <> SSI Account
            //         Self-Sovereign Identity Protocol
            //         Copyright Tyron Mapu Community Interest Company 2023. All rights reserved.
            //         You acknowledge and agree that Tyron Mapu Community Interest Company (Tyron) own all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this repository (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
            //         Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this repository.
            //         You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
            //         1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of Tyron; and
            //         2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
            //         Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by Tyron in its sole discretion:
            //         1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
            //         2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
            //         3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
            //         You will not use any trade mark, service mark, trade name, logo of Tyron or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
            //         If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*)

            //         scilla_version 0

            //         import PairUtils BoolUtils

            //         library ZILxWALLET
            //           let one_msg =
            //             fun( msg: Message ) =>
            //             let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg

            //           let zero = Uint128 0
            //           let zeroByStr20 = 0x0000000000000000000000000000000000000000
            //           let zeroByStr32 = 0x0000000000000000000000000000000000000000000000000000000000000000
            //           let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

            //           let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
            //             match input with
            //             | Some v => v
            //             | None => default end
            //           let option_uint128_value = let f = @option_value Uint128 in f zero
            //           let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
            //           let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64

            //           let true = True
            //           let false = False
            //           let empty_string = ""
            //           let did = "did"

            //           type Beneficiary =
            //             | NftUsername of String String (* NFT Domain Name & Subdomain *)
            //             | Recipient of ByStr20

            //         contract ZILxWALLET(
            //           init_nft: ByStr32,
            //           init: ByStr20 with contract field dApp: ByStr20 with contract
            //             field dns: Map String ByStr20,
            //             field did_dns: Map String ByStr20 with contract
            //               field controller: ByStr20,
            //               field services: Map String ByStr20,
            //               field did_domain_dns: Map String ByStr20 end end end
            //           )
            //           field nft_domain: ByStr32 = init_nft
            //           field pending_domain: ByStr32 = zeroByStr32
            //           field paused: Bool = false

            //           (* The block number when the last transaction occurred @todo add to all txn *)
            //           field ledger_time: BNum = BNum 0

            //           (* A monotonically increasing number representing the amount of transactions that have taken place *)
            //           field tx_number: Uint128 = zero

            //           field services: Map String ByStr20 = Emp String ByStr20
            //           field version: String = "ZILxWALLET_0.11.0" (* @xalkan *)

            //         procedure SupportTyron( tyron: Option Uint128 )
            //           match tyron with
            //           | None => | Some donation =>
            //             current_init <-& init.dApp;
            //             donateDomain = "donate"; get_addr <-& current_init.dns[donateDomain]; addr = option_bystr20_value get_addr;
            //             accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donation } in one_msg m; send msg end end

            //         procedure VerifyOrigin( addr: ByStr20 )
            //           verified = builtin eq _origin addr; match verified with
            //             | True => | False => ver <- version; e = { _exception: "xWALLET-WrongCaller"; version: ver }; throw e end end

            //         procedure VerifyController( tyron: Option Uint128 )
            //           id <- nft_domain; current_init <-& init.dApp;
            //           domain = builtin to_string id;
            //           get_did <-& current_init.did_dns[domain]; match get_did with
            //           | None => ver <- version; e = { _exception: "xWALLET-DidIsNull"; version: ver }; throw e
            //           | Some did_ =>
            //               controller <-& did_.controller; VerifyOrigin controller;
            //               SupportTyron tyron end end

            //         procedure Timestamp()
            //           current_block <- &BLOCKNUMBER; ledger_time := current_block;
            //           latest_tx_number <- tx_number; new_tx_number = let incrementor = Uint128 1 in builtin add latest_tx_number incrementor;
            //           tx_number := new_tx_number end

            //         procedure IsNotPaused()
            //           is_paused <- paused; match is_paused with
            //             | False => | True => ver <- version; e = { _exception: "xWALLET-WrongStatus"; version: ver }; throw e end end

            //         procedure IsPaused()
            //           is_paused <- paused; match is_paused with
            //             | True => | False => ver <- version; e = { _exception: "xWALLET-WrongStatus"; version: ver }; throw e end end

            //         procedure ThrowIfSameAddr(
            //           a: ByStr20,
            //           b: ByStr20
            //           )
            //           is_self = builtin eq a b; match is_self with
            //             | False => | True => ver <- version; e = { _exception: "xWALLET-SameAddress"; version: ver }; throw e end end

            //         procedure ThrowIfSameDomain(
            //           a: ByStr32,
            //           b: ByStr32
            //           )
            //           is_same = builtin eq a b; match is_same with
            //             | False => | True => ver <- version; e = { _exception: "xWALLET-SameDomain"; version: ver }; throw e end end

            //         transition UpdateDomain(
            //           domain: ByStr32,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron; id <- nft_domain;
            //           ThrowIfSameDomain id domain;
            //           current_init <-& init.dApp; domain_ = builtin to_string domain;
            //           get_did <-& current_init.did_dns[domain_]; match get_did with
            //             | Some did_ => pending_domain := domain
            //             | None => ver <- version; e = { _exception: "xWALLET-DidIsNull"; version: ver }; throw e end;
            //           Timestamp end

            //         transition AcceptPendingDomain()
            //           IsNotPaused; domain <- pending_domain;
            //           current_init <-& init.dApp; domain_ = builtin to_string domain;
            //           get_did <-& current_init.did_dns[domain_]; match get_did with
            //             | None => ver <- version; e = { _exception: "xWALLET-DidIsNull"; version: ver }; throw e
            //             | Some did_ =>
            //               controller <-& did_.controller; VerifyOrigin controller;
            //               nft_domain := domain; pending_domain := zeroByStr32 end;
            //           Timestamp end

            //         transition Pause( tyron: Option Uint128 )
            //           IsNotPaused; VerifyController tyron; paused := true;
            //           ver <- version; e = { _eventname: "xWALLET-Paused";
            //             version: ver;
            //             pauser: _sender }; event e;
            //           Timestamp end

            //         transition Unpause( tyron: Option Uint128 )
            //           IsPaused; VerifyController tyron; paused := false;
            //           ver <- version; e = { _eventname: "xWALLET-Unpaused";
            //             version: ver;
            //             pauser: _sender }; event e;
            //           Timestamp end

            //         (* Receive $ZIL native funds *)
            //         transition AddFunds()
            //           IsNotPaused; accept; Timestamp end

            //         (* Send $ZIL to any recipient that implements the tag, e.g. "AddFunds", "", etc. *)
            //         transition SendFunds(
            //           tag: String,
            //           beneficiary: Beneficiary,
            //           amount: Uint128,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           match beneficiary with
            //           | NftUsername username_ domain_ =>
            //             current_init <-& init.dApp;
            //             is_ssi = builtin eq domain_ empty_string; match is_ssi with
            //               | True =>
            //                 get_addr <-& current_init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr addr _this_address;
            //                 msg = let m = { _tag: tag; _recipient: addr; _amount: amount } in one_msg m; send msg
            //               | False =>
            //                 get_did <-& current_init.did_dns[username_]; match get_did with
            //                   | None => ver <- version; e = { _exception: "xWALLET-DidIsNull"; version: ver }; throw e
            //                   | Some did_ =>
            //                     is_did = builtin eq domain_ did; match is_did with
            //                       | True => msg = let m = { _tag: tag; _recipient: did_; _amount: amount } in one_msg m; send msg
            //                       | False =>
            //                         get_domain_addr <-& did_.did_domain_dns[domain_]; domain_addr = option_bystr20_value get_domain_addr;
            //                         msg = let m = { _tag: tag; _recipient: domain_addr; _amount: amount } in one_msg m; send msg end end end
            //           | Recipient addr_ =>
            //             ThrowIfSameAddr addr_ _this_address;
            //             msg = let m = { _tag: tag; _recipient: addr_; _amount: amount } in one_msg m; send msg end;
            //           Timestamp end

            //         procedure FetchServiceAddr( id: String )
            //           current_init <-& init.dApp;
            //           initId = "init"; get_did <-& current_init.did_dns[initId]; match get_did with
            //             | None => ver <- version; e = { _exception: "xWALLET-NullInit"; version: ver }; throw e
            //             | Some did_ =>
            //               get_service <-& did_.services[id]; addr = option_bystr20_value get_service;
            //               services[id] := addr end end

            //         transition Transfer(
            //           addrName: String,
            //           beneficiary: Beneficiary,
            //           amount: Uint128,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron; FetchServiceAddr addrName;
            //           get_token_addr <- services[addrName]; token_addr = option_bystr20_value get_token_addr;
            //           match beneficiary with
            //           | NftUsername username_ domain_ =>
            //             current_init <-& init.dApp;
            //             is_ssi = builtin eq domain_ empty_string; match is_ssi with
            //               | True =>
            //                 get_addr <-& current_init.dns[username_]; addr = option_bystr20_value get_addr; ThrowIfSameAddr addr _this_address;
            //                 msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
            //                   to: addr;
            //                   amount: amount } in one_msg m ; send msg
            //               | False =>
            //                 get_did <-& current_init.did_dns[username_]; match get_did with
            //                   | None => ver <- version; e = { _exception: "xWALLET-DidIsNull"; version: ver }; throw e
            //                   | Some did_ =>
            //                     is_did = builtin eq domain_ did; match is_did with
            //                       | True =>
            //                         msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
            //                         to: did_;
            //                         amount: amount } in one_msg m ; send msg
            //                       | False =>
            //                         get_domain_addr <-& did_.did_domain_dns[domain_]; domain_addr = option_bystr20_value get_domain_addr;
            //                         msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
            //                           to: domain_addr;
            //                           amount: amount } in one_msg m ; send msg end end end
            //           | Recipient addr_ =>
            //             ThrowIfSameAddr addr_ _this_address;
            //             msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
            //               to: addr_;
            //               amount: amount } in one_msg m ; send msg end;
            //           Timestamp end

            //         transition DelegateStake(
            //           stakeID: String,
            //           ssnID: String,
            //           amount: Uint128,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           FetchServiceAddr ssnID; get_ssnaddr <- services[ssnID]; ssnaddr = option_bystr20_value get_ssnaddr;
            //           accept; msg = let m = { _tag: "DelegateStake"; _recipient: addr; _amount: amount;
            //             ssnaddr: ssnaddr } in one_msg m; send msg end

            //         transition DelegateStakeSuccessCallBack( ssnaddr: ByStr20, amount: Uint128 ) IsNotPaused end

            //         transition WithdrawStakeRewards(
            //           stakeID: String,
            //           ssnID: String,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           FetchServiceAddr ssnID; get_ssnaddr <- services[ssnID]; ssnaddr = option_bystr20_value get_ssnaddr;
            //           msg = let m = { _tag: "WithdrawStakeRewards"; _recipient: addr; _amount: zero;
            //             ssnaddr: ssnaddr } in one_msg m; send msg end

            //         transition WithdrawStakeRewardsSuccessCallBack( ssnaddr: ByStr20, rewards: Uint128 ) IsNotPaused end

            //         transition WithdrawStakeAmt(
            //           stakeID: String,
            //           ssnID: String,
            //           amount: Uint128,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           FetchServiceAddr ssnID; get_ssnaddr <- services[ssnID]; ssnaddr = option_bystr20_value get_ssnaddr;
            //           msg = let m = { _tag: "WithdrawStakeAmt"; _recipient: addr; _amount: zero;
            //             ssnaddr: ssnaddr;
            //             amt: amount } in one_msg m; send msg end

            //         transition WithdrawStakeAmtSuccessCallBack( ssnaddr: ByStr20, amount: Uint128 ) IsNotPaused end

            //         transition CompleteWithdrawal(
            //           stakeID: String,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           msg = let m = { _tag: "CompleteWithdrawal"; _recipient: addr; _amount: zero } in one_msg m; send msg end

            //         transition CompleteWithdrawalNoUnbondedStakeCallBack( amount: Uint128 ) IsNotPaused end

            //         transition CompleteWithdrawalSuccessCallBack( amount: Uint128 ) IsNotPaused end

            //         transition ReDelegateStake(
            //           stakeID: String,
            //           ssnID: String,
            //           tossnID: String,
            //           amount: Uint128,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           FetchServiceAddr ssnID; get_ssnaddr <- services[ssnID]; ssnaddr = option_bystr20_value get_ssnaddr;
            //           FetchServiceAddr tossnID; get_tossnaddr <- services[tossnID]; to_ssnaddr = option_bystr20_value get_tossnaddr;
            //           msg = let m = { _tag: "ReDelegateStake"; _recipient: addr; _amount: zero;
            //             ssnaddr: ssnaddr;
            //             to_ssn: to_ssnaddr;
            //             amount: amount } in one_msg m; send msg end

            //         transition ReDelegateStakeSuccessCallBack( ssnaddr: ByStr20, tossn: ByStr20, amount: Uint128 ) IsNotPaused end

            //         transition RequestDelegatorSwap(
            //           stakeID: String,
            //           newDelegAddr: ByStr20,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           msg = let m = { _tag: "RequestDelegatorSwap"; _recipient: addr; _amount: zero;
            //             new_deleg_addr: newDelegAddr } in one_msg m; send msg end

            //         (* Sent by the new delegator *)
            //         transition ConfirmDelegatorSwap(
            //           stakeID: String,
            //           requestor: ByStr20, (* The previous delegator *)
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           msg = let m = { _tag: "ConfirmDelegatorSwap"; _recipient: addr; _amount: zero;
            //             requestor: requestor } in one_msg m; send msg end

            //         transition RevokeDelegatorSwap(
            //           stakeID: String,
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           msg = let m = { _tag: "RevokeDelegatorSwap"; _recipient: addr; _amount: zero } in one_msg m; send msg end

            //         (* Sent by the new delegator *)
            //         transition RejectDelegatorSwap(
            //           stakeID: String,
            //           requestor: ByStr20, (* The previous delegator *)
            //           tyron: Option Uint128
            //           )
            //           IsNotPaused; VerifyController tyron;
            //           FetchServiceAddr stakeID; get_addr <- services[stakeID]; addr = option_bystr20_value get_addr;
            //           msg = let m = { _tag: "RejectDelegatorSwap"; _recipient: addr; _amount: zero;
            //             requestor: requestor } in one_msg m; send msg end
            //       `

            //@DEFIxWALLET
            const code = `
(* v1
DEFIxWALLET: Decentralised Finance Smart Contract Wallet <> SSI Account
Tyron SSI: Self-Sovereign Identity (SSI) Protocol
Copyright (c) 2023 Tyron SSI DAO: Tyron Mapu Community Interest Company (CIC) and its affiliates.
All rights reserved.
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

import BoolUtils PairUtils

library DEFIxWALLET
  type Error =
    | CodeWrongSender
    | CodeDidIsNull
    | CodeWrongStatus
    | CodeIsNull
    | CodeSameValue
    | CodeWrongRecipient
    | CodeWrongSignature
    | CodeNotValid

  type Beneficiary =
    | NftUsername of String String (* NFT Domain Name & Subdomain *)
    | Recipient of ByStr20

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
  let empty_string = ""
  let did = "did"
  let ssi_id = "s$i"
  let sgd_id = "xsgd"
  let defixwallet_ssi = "0x2293e4600a2ee55ae08121ccd4966c7ec695d36fc8c1aa1c7c5ba3dfdd475587" (* $defixwallet.ssi *)
  let comm_id = "_s$i" 
  let vault_id = "_vault"
  let none_addr = None{ ByStr20 }

  let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
    match input with
    | Some v => v
    | None => default end
  let option_uint128_value = let f = @option_value Uint128 in f zero
  let option_bystr20_value = let f = @option_value ByStr20 in f zero_addr
  let option_bystr33_value = let f = @option_value ByStr33 in f zeroByStr33
  let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64
  let option_string_value = let f = @option_value String in f empty_string

  let grow: Uint128 -> Uint256 =
    fun(var : Uint128) =>
      let get_big = builtin to_uint256 var in match get_big with
        | Some big => big
        | None => builtin sub zero_256 one_256 (* @error throws an integer underflow - should never happen *)
        end

  let compute_ssi: Uint128 -> Uint256 -> Uint256 -> Uint128 =
    fun(amount: Uint128) => fun(price: Uint256) => fun(d: Uint256) =>
      let amount_u256 = grow amount in
      let numerator = builtin mul amount_u256 price in
      let result = builtin div numerator d in
      let result_uint128 = builtin to_uint128 result in match result_uint128 with
        | None => builtin sub zero one (* @error throws an integer overflow by computing -1 in uint *)
        | Some r => r
        end
  
  let fee_denom = Uint256 10000
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

  let make_error =
    fun(error: Error) => fun(version: String) => fun(code: Int32) => fun(addr: ByStr20)  =>  
      let exception = match error with
      | CodeWrongSender    => "WrongSender"
      | CodeDidIsNull      => "DidIsNull"
      | CodeWrongStatus    => "WrongStatus"
      | CodeIsNull         => "ZeroValueOrNull"
      | CodeSameValue      => "SameValue"
      | CodeWrongRecipient => "WrongRecipientForTransfer"
      | CodeWrongSignature => "WrongDIDSignature"
      | CodeNotValid       => "InvalidValue"
      end in { _exception: exception; contractVersion: version; errorCode: code; contractAddress: addr }

contract DEFIxWALLET(
  init_nft: ByStr32,
  init: ByStr20 with contract field dApp: ByStr20 with contract
    field implementation: ByStr20 with contract
      field utility: Map String Map String Uint128 end,
    field dns: Map String ByStr20,
    field did_dns: Map String ByStr20 with contract
      field controller: ByStr20,
      field services: Map String ByStr20,
      field verification_methods: Map String ByStr33,
      field did_domain_dns: Map String ByStr20 end end end,
  init_community: ByStr20 with contract
    field reserves: Pair Uint128 Uint128,
    field price: Uint256,
    field dv: Uint256,
    field is_fairlaunch: Bool end
  )
  with (* Contract constraints *)
    (* @req: Initial domain name must not be the zero hash *)
    let is_invalid = builtin eq init_nft zero_hash in
    negb is_invalid
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

  (* Emergency stop mechanism. Defaults to False. *)
  field is_paused: Bool = false

  (* DID Services *)
  field services: Map String ByStr20 = Emp String ByStr20

  (* The block number when the last Transition occurred *)
  field ledger_time: BNum = BNum 0

  (* A monotonically increasing number representing the amount of transitions that have taken place *)
  field tx_number: Uint128 = zero

  field batch_beneficiary: ByStr20 = zero_addr

  field community: ByStr20 with contract
    field reserves: Pair Uint128 Uint128,
    field price: Uint256,
    field dv: Uint256,
    field is_fairlaunch: Bool end = init_community

  field public_encryption: String = "bYACKEqduFtw5iZQVra42h1UAINo4ujJRYNNGNxVlCL-Fs46bBdo_S4EJRrgMJRhiqeUPKHRuu_daZFRHBWCjILdC5cc5mjSkQVIu30jJiaA_7G9FCYqVQnnKa0ZKn52DsT2f8bYSNHpDLpcmqcKqdW4Z8tgCtd9zhzZ4TchO9_-xPQ7T7v4Y-AIB0-Al8HwU2cvA_N17f7VHps2ZfMG88qVxOUlBJTlb6n60vZX_4laKavvyLz3zvbOUVhnI4L0VURiM_Z_1rF5rna7QNK9wU-40FqK8VMNW3DJFAVCVMvsMCUwqXnVZo35gKcG1LW8A7TBdTPlJ7ICtTRaS45QZ7fIz1pLiEg0R4n0NPP5N12YJQCnrZyLfsRPPjUZXfHdaKSxsYDDsiDOhWxkBCx3ScvIKYJDLK1jh0YhmQiATiCMMrM0mBFZ6cfNifCXDGV97dpKxnFfLNUMlV1sIUiSoryf8cK2DV15fbBWw8UqO254yqO4Eczf1LvDd4sXIUR9x9DhRAi_MYb4owiY8xBdRmggrlHrH2cducqX8znKOfQ_o6u7H3wU_f7qjzVfOFUsKnZC4mPp6dPTKyqK9fCAXGKIgxzL3Cd22v6zxo54-eovWHbESaj9h6PZ64duumrq3HAzHdn20XtynFJxwo9bNxXx0WxgVkrc-Hak64iazWVjQbGK6J-NJ996qpPZt-71YIbFqMI-fgZvt3eZZxfOsvtE7R8sbeThrZmWC42j94pvbmik3jcYsaAoSD_ct2b9qKWzSKqj-o_ZQAPvblpT9YeKY7tgygJgll_p75eQe38A8fpKDAMtTW1rOagzBGA2I1lYe_wu_BB6SuT2Mdq_Hh5_C5zDQRXs6klKxft2NB3siM4C4B6VH0hE2bZXl7KdnNdCAEdyPuRpXP5_XkYmWGBI6ZJvf6iP1wpTjQfpz54dGK-GQGo0FEH0zDtzbUUHs7oq5a7KiUeQEPmrzluphfcUIv7vMROn-UYoMsz38nd3W5VPKVVofe756p_MsjGu"
  field ivms101: Map String String = Emp String String

  (* @field sbt (soulbound tokens).
      @param (String) issuer_id: Public .did domain of the SBT issuer.
      @param (ByStr64) token: A 64-byte string representing the DID signature of the SBT issuer. *)
  field sbt: Map String ByStr64 = Emp String ByStr64

  (* The smart contract @version *)
  field version: String = "DEFIxWALLET_1.1.1"

(***************************************************)
(*               Contract procedures               *)
(***************************************************)

(* Emits an error & cancels the transaction.
      @param err: The Error data type.
      @param code: A signed integer type of 32 bits. *)
procedure ThrowError(err: Error, code: Int32)
  ver <- version; e = make_error err ver code _this_address; throw e
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

procedure ThrowIfZero(val: Uint128)
  is_null = builtin eq zero val; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -3; ThrowError err code
    end
end

procedure ThrowIfNullAddr(addr: ByStr20)
  is_null = builtin eq addr zero_addr; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -4; ThrowError err code
    end
end

procedure ThrowIfNullHash(input: ByStr32)
  is_null = builtin eq input zero_hash; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -5; ThrowError err code
    end
end

procedure ThrowIfNullSig(input: ByStr64 )
  is_null = builtin eq input zeroByStr64; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -6; ThrowError err code
    end
end

procedure ThrowIfNullString(input: String)
  is_null = builtin eq input empty_string; match is_null with
    | False => | True => err = CodeIsNull; code = Int32 -7; ThrowError err code
    end
end

procedure SupportTyron(
  ssi_init: ByStr20 with contract field dns: Map String ByStr20 end,
  tyron: Option Uint128
  )
  match tyron with
  | None => | Some donation =>
    donateDomain = "donate"; get_addr <-& ssi_init.dns[donateDomain];
    addr = option_bystr20_value get_addr; ThrowIfNullAddr addr;
    accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donation } in one_msg m; send msg
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
  init_did <-& ssi_init.implementation; ver <- version;
  get_fee <-& init_did.utility[ver][id]; fee = option_uint128_value get_fee;

  is_zero = builtin eq fee zero; match is_zero with
    | True => | False =>
      get_did <-& ssi_init.did_dns[defixwallet_ssi]; match get_did with
        | Some did_ =>
          accept;
          msg = let m = { _tag: "AddFunds"; _recipient: did_; _amount: fee } in one_msg m; send msg
        | None => err = CodeDidIsNull; code = Int32 -8; ThrowError err code
        end
    end
end

procedure RequireContractOwner(
  tyron: Option Uint128,
  tx: String
  )
  ssi_init <-& init.dApp;
  id <- nft_domain; domain_ = builtin to_string id;

  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -3; ThrowError err code
    | Some did_ =>
        controller <-& did_.controller; VerifyOrigin controller;
        SupportTyron ssi_init tyron; TyronCommunityFund ssi_init tx
    end
end

procedure Timestamp()
  current_block <- &BLOCKNUMBER; ledger_time := current_block;
  latest_tx_number <- tx_number; new_tx_number = builtin add latest_tx_number one;
  tx_number := new_tx_number
end

procedure ThrowIfSameString(
  a: String,
  b: String
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -9; ThrowError err code end
end

procedure ThrowIfSameDomain(
  a: ByStr32,
  b: ByStr32
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -10; ThrowError err code
    end
end

procedure ThrowIfSameAddr(
  a: ByStr20,
  b: ByStr20
  )
  is_same = builtin eq a b; match is_same with
    | False => | True => err = CodeSameValue; code = Int32 -11; ThrowError err code
    end
end

procedure ThrowIfDifferentAddr(
  a: ByStr20,
  b: ByStr20
  )
  is_same = builtin eq a b; match is_same with
    | True => | False => err = CodeNotValid; code = Int32 -12; ThrowError err code
    end
end

(* Verifies that the recipient is this address.
      @param recipient: A 20-byte string. *) 
procedure VerifyRecipient(recipient: ByStr20)
  is_valid = builtin eq recipient _this_address; match is_valid with
    | True => | False => err = CodeWrongRecipient; code = Int32 -13; ThrowError err code
    end
end

procedure FetchServiceAddr_(
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract field
      services: Map String ByStr20 end end,
  id: String
  )
  ThrowIfNullString id;

  initId = "init"; get_did <-& ssi_init.did_dns[initId]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 -14; ThrowError err code
    | Some did_ =>
      get_service <-& did_.services[id]; addr = option_bystr20_value get_service;
      services[id] := addr
    end
end

procedure ZRC2_TransferTokens( input: Pair String Uint128 )
  addr_name = let fst_element = @fst String Uint128 in fst_element input; ThrowIfNullString addr_name;
  amount = let snd_element = @snd String Uint128 in snd_element input; ThrowIfZero amount;
  current_beneficiary <- batch_beneficiary; zil = "zil";
  is_zil = builtin eq addr_name zil; match is_zil with
    | True =>
      accept;
      msg = let m = { _tag: "AddFunds"; _recipient: current_beneficiary; _amount: amount } in
        one_msg m; send msg
    | False =>
      ssi_init <-& init.dApp; FetchServiceAddr_ ssi_init addr_name;
      get_token_addr <- services[addr_name]; token_addr = option_bystr20_value get_token_addr; ThrowIfNullAddr token_addr;
      
      msg = let m = { _tag: "Transfer"; _recipient: token_addr; _amount: zero;
        to: current_beneficiary;
        amount: amount } in one_msg m ; send msg
    end
end

procedure VerifyAllowanceData(
  addr: ByStr20,
  spender: ByStr20,
  amount: Uint128
  )
  ThrowIfNullAddr addr; ThrowIfNullAddr spender;
  ThrowIfSameAddr addr spender; ThrowIfSameAddr addr _this_address; ThrowIfSameAddr spender _this_address;
  ThrowIfZero amount
end

procedure IncreaseAllowance(
  addr: ByStr20,
  spender: ByStr20,
  amount: Uint128
  )
  VerifyAllowanceData addr spender amount;

  msg = let m = { _tag: "IncreaseAllowance"; _recipient: addr; _amount: zero;
    spender: spender;
    amount: amount } in one_msg m ; send msg
end

procedure DecreaseAllowance(
  addr: ByStr20,
  spender: ByStr20,
  amount: Uint128
  )
  VerifyAllowanceData addr spender amount;

  msg = let m = { _tag: "DecreaseAllowance"; _recipient: addr; _amount: zero;
    spender: spender;
    amount: amount } in one_msg m ; send msg
end

procedure SwapExactTokensForTokens_(
  dAppAddr: ByStr20,
  token0Addr: ByStr20,
  token1Addr: ByStr20,
  token0Amt: Uint128,
  minToken1Amt: Uint128,
  deadline: Uint128,
  beneficiary: Option ByStr20
  )
  ThrowIfNullAddr dAppAddr; ThrowIfNullAddr token0Addr; ThrowIfNullAddr token1Addr;
  ThrowIfSameAddr token0Addr token1Addr;
  ThrowIfZero token0Amt; ThrowIfZero minToken1Amt;
  
  ThrowIfZero deadline; current_block <- &BLOCKNUMBER;
  this_deadline = builtin badd current_block deadline;

  recipient_addr = match beneficiary with
  | None => _this_address
  | Some addr => addr
  end;
  ThrowIfNullAddr recipient_addr;

  msg = let m = { _tag: "SwapExactTokensForTokens"; _recipient: dAppAddr; _amount: zero;
    token0_address: token0Addr;
    token1_address: token1Addr;
    token0_amount: token0Amt;
    min_token1_amount: minToken1Amt;
    deadline_block: this_deadline;
    recipient_address: recipient_addr } in one_msg m ; send msg
end

procedure SwapExactZILForTokens_(
  dAppAddr: ByStr20,
  token1Addr: ByStr20,
  token0Amt: Uint128,
  minToken1Amt: Uint128,
  deadline: Uint128,
  beneficiary: Option ByStr20
  )
  ThrowIfNullAddr dAppAddr; ThrowIfNullAddr token1Addr;
  ThrowIfZero token0Amt; ThrowIfZero minToken1Amt;
  
  ThrowIfZero deadline; current_block <- &BLOCKNUMBER;
  this_deadline = builtin badd current_block deadline;

  recipient_addr = match beneficiary with
  | None => _this_address
  | Some addr => addr
  end;  
  ThrowIfNullAddr recipient_addr;

  accept; msg = let m = { _tag: "SwapExactZILForTokens"; _recipient: dAppAddr; _amount: token0Amt;
    token_address: token1Addr;
    min_token_amount: minToken1Amt;
    deadline_block: this_deadline;
    recipient_address: recipient_addr } in one_msg m; send msg
end

procedure Mint_(
  addr: ByStr20,
  beneficiary: ByStr20,
  amount: Uint128
  )
  msg = let m = { _tag: "Mint" ; _recipient: addr; _amount: zero;
  recipient: beneficiary;
  amount: amount } in one_msg m; send msg
end

procedure JoinCommunity_(
  dApp_addr: ByStr20,
  subdomain: Option String,
  amount: Uint128,
  deadline_block: BNum
  )
  id <- nft_domain;
  join_msg = let m = { _tag: "JoinCommunity"; _recipient: dApp_addr; _amount: zero;
    domain: id;
    subdomain: subdomain;
    amount: amount;
    deadline_block: deadline_block } in one_msg m ; send join_msg
end

procedure LeaveCommunity_(
  dApp_addr: ByStr20,
  amount: Uint128,
  deadline_block: BNum
  )
  msg = let m = { _tag: "LeaveCommunity"; _recipient: dApp_addr; _amount: zero;
    amount: amount;
    deadline_block: deadline_block } in one_msg m ; send msg
end

procedure CallVault(
  ssi_init: ByStr20 with contract
    field did_dns: Map String ByStr20 with contract field
      services: Map String ByStr20 end end,
  id: String,
  addr: ByStr20,
  allowance: Uint128,
  amount: Uint128
  )
  ThrowIfNullString id;

  vault_name = builtin concat id vault_id; (* It could be any vault *)
  FetchServiceAddr_ ssi_init vault_name; get_vaultAddr <- services[vault_name];
  vault_addr = option_bystr20_value get_vaultAddr;

  IncreaseAllowance addr vault_addr allowance;
  Mint_ vault_addr _this_address amount
end

(***************************************************)
(*              Contract transitions               *)
(***************************************************)

transition UpdateDomain(
  domain: ByStr32,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfNullHash domain;
  tag = "UpdateDomain"; RequireContractOwner tyron tag;
  ssi_init <-& init.dApp;
  id <- nft_domain; ThrowIfSameDomain id domain; domain_ = builtin to_string domain;
  
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | Some did_ => | None => err = CodeDidIsNull; code = Int32 1; ThrowError err code
    end;

  pending_domain := domain;
  ver <- version; e = { _eventname: "SSIDApp_PendingDomain_Updated"; version: ver;
    pendingDomain: domain }; event e;
  Timestamp
end

transition AcceptPendingDomain()
  RequireNotPaused; ssi_init <-& init.dApp;
  domain <- pending_domain; domain_ = builtin to_string domain;
  
  get_did <-& ssi_init.did_dns[domain_]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 2; ThrowError err code
    | Some did_ =>
      controller <-& did_.controller; VerifyOrigin controller
    end;
  
  nft_domain := domain; pending_domain := zero_hash;
  ver <- version; e = { _eventname: "SSIDApp_ControllerDomain_Updated"; version: ver;
    controllerDomain: domain }; event e;
  Timestamp
end

transition Pause(tyron: Option Uint128)
  RequireNotPaused;
  tag = "Pause"; RequireContractOwner tyron tag;

  is_paused := true;
  ver <- version; e = { _eventname: "SSIDApp-Paused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

transition Unpause(tyron: Option Uint128)
  paused <- is_paused; match paused with
    | True => | False => (* Not Paused Error *)
      err = CodeWrongStatus; code = Int32 3; ThrowError err code
    end;
  tag = "Unpause"; RequireContractOwner tyron tag;
  
  is_paused := false;
  ver <- version; e = { _eventname: "SSIDApp-Unpaused"; version: ver;
    pauser: _sender }; event e;
  Timestamp
end

(* Receives $ZIL native funds *)
transition AddFunds()
  RequireNotPaused; ThrowIfZero _amount; accept;
  Timestamp
end

(* Sends $ZIL to any recipient that implements the tag, e.g. "AddFunds", "", etc. *)
transition SendFunds(
  tag: String,
  beneficiary: Beneficiary,
  amount: Uint128,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  tag_ = "SendFunds"; RequireContractOwner tyron tag_;

  match beneficiary with
  | NftUsername domain_ subdomain_ =>
    ssi_init <-& init.dApp;
    is_ssi = builtin eq subdomain_ empty_string; match is_ssi with
      | True =>
        get_addr <-& ssi_init.dns[domain_];
        addr = option_bystr20_value get_addr; ThrowIfSameAddr addr _this_address;
        
        msg = let m = { _tag: tag; _recipient: addr; _amount: amount } in one_msg m; send msg
      | False =>
        get_did <-& ssi_init.did_dns[domain_]; match get_did with
          | None => err = CodeDidIsNull; code = Int32 4; ThrowError err code
          | Some did_ =>
            is_did = builtin eq subdomain_ did; match is_did with
              | True =>
                msg = let m = { _tag: tag; _recipient: did_; _amount: amount } in one_msg m; send msg
              | False =>
                get_subdomain_addr <-& did_.did_domain_dns[subdomain_];
                subdomain_addr = option_bystr20_value get_subdomain_addr; ThrowIfSameAddr subdomain_addr _this_address;
                
                msg = let m = { _tag: tag; _recipient: subdomain_addr; _amount: amount } in one_msg m; send msg
              end
          end
      end
  | Recipient addr_ =>
    ThrowIfSameAddr addr_ _this_address;

    msg = let m = { _tag: tag; _recipient: addr_; _amount: amount } in one_msg m; send msg
  end;
  Timestamp
end

transition RecipientAcceptTransfer(
  sender: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  ) 
  RequireNotPaused; ThrowIfZero amount;
  VerifyRecipient recipient;
  Timestamp
end 

transition RecipientAcceptTransferFrom(
  initiator: ByStr20,
  sender: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  VerifyRecipient recipient;
  ThrowIfZero amount;
  Timestamp
end

transition Transfer(
  addrName: String,
  beneficiary: Beneficiary,
  amount: Uint128,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  tag = "Transfer"; RequireContractOwner tyron tag;

  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init addrName; get_token_addr <- services[addrName];
  token_addr = option_bystr20_value get_token_addr; ThrowIfNullAddr token_addr;
  
  match beneficiary with
  | NftUsername domain_ subdomain_ =>
    is_ssi = builtin eq subdomain_ empty_string; match is_ssi with
      | True =>
        get_addr <-& ssi_init.dns[domain_];
        addr = option_bystr20_value get_addr; ThrowIfSameAddr addr _this_address;
        
        msg = let m = { _tag: tag; _recipient: token_addr; _amount: zero;
          to: addr;
          amount: amount } in one_msg m ; send msg
      | False =>
        get_did <-& ssi_init.did_dns[domain_]; match get_did with
          | None => err = CodeDidIsNull; code = Int32 5; ThrowError err code
          | Some did_ =>
            is_did = builtin eq subdomain_ did; match is_did with
              | True =>
                msg = let m = { _tag: tag; _recipient: token_addr; _amount: zero;
                to: did_;
                amount: amount } in one_msg m ; send msg
              | False =>
                get_subdomain_addr <-& did_.did_domain_dns[subdomain_];
                subdomain_addr = option_bystr20_value get_subdomain_addr;
                ThrowIfSameAddr subdomain_addr _this_address;
                
                msg = let m = { _tag: tag; _recipient: token_addr; _amount: zero;
                  to: subdomain_addr;
                  amount: amount } in one_msg m ; send msg
              end
          end
      end
  | Recipient addr_ =>
    ThrowIfSameAddr addr_ _this_address;
    
    msg = let m = { _tag: tag; _recipient: token_addr; _amount: zero;
      to: addr_;
      amount: amount } in one_msg m ; send msg
  end;
  Timestamp
end

transition ZRC2_BatchTransfer(
  addr: ByStr20,
  tokens: List( Pair String Uint128 ),
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "ZRC2_BatchTransfer"; RequireContractOwner tyron tag;

  ThrowIfSameAddr addr _this_address;
  batch_beneficiary := addr; forall tokens ZRC2_TransferTokens; batch_beneficiary := zero_addr;
  Timestamp
end

transition TransferSuccessCallBack(
  sender: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; ThrowIfZero amount;

  is_valid = builtin eq sender _this_address; match is_valid with
    | True => | False => err = CodeWrongSender; code = Int32 6; ThrowError err code
    end;
  Timestamp
end

transition UpdateAllowance(
  dApp: String,
  spender: ByStr20,
  add: Bool,
  amount: Uint128,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "UpdateAllowance"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp]; dApp_addr = option_bystr20_value get_dApp;
  
  match add with
    | True => IncreaseAllowance dApp_addr spender amount
    | False => DecreaseAllowance dApp_addr spender amount end;
  Timestamp
end

(***************************************************)
(*                 DEX transitions                 *)
(***************************************************)

transition AddLiquidity(
  dApp: String,
  isSSI: Bool,
  addrName: String,
  minContributionAmount: Uint128,
  maxTokenAmount: Uint128,
  deadline: Uint128,
  double_allowance: Bool,
  is_community: Bool,
  subdomain: Option String,
  tyron: Option Uint128
  )
  RequireNotPaused;
  ThrowIfZero minContributionAmount; ThrowIfZero maxTokenAmount; ThrowIfZero deadline;
  tag = "AddLiquidity"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp]; dApp_addr = option_bystr20_value get_dApp;
  FetchServiceAddr_ ssi_init addrName; get_addr <- services[addrName]; addr = option_bystr20_value get_addr;
  current_block <- &BLOCKNUMBER; this_deadline = builtin badd current_block deadline;

  two = Uint128 2; 
  match isSSI with
  | False => | True =>
    (* @dev: To join an S$I DEX *)
    double_ssi = builtin mul minContributionAmount two; (* @upgrade: consider computing from dex *)
    FetchServiceAddr_ ssi_init ssi_id; get_ssi <- services[ssi_id]; ssi_addr = option_bystr20_value get_ssi;
    IncreaseAllowance ssi_addr dApp_addr double_ssi
  end;

  match double_allowance with
  | True =>
    double = builtin mul maxTokenAmount two;
    IncreaseAllowance addr dApp_addr double
  | False => IncreaseAllowance addr dApp_addr maxTokenAmount
  end;
    
  accept; msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: _amount;
    token_address: addr;
    min_contribution_amount: minContributionAmount;
    max_token_amount: maxTokenAmount;
    deadline_block: this_deadline } in one_msg m ; send msg;

  match is_community with
  | False => | True =>
    (* @upgrade: calculate amount *)
    JoinCommunity_ dApp_addr subdomain minContributionAmount this_deadline
  end;
  Timestamp
end

transition RemoveLiquidity(
  dApp: String,
  addrName: String,
  amount: Uint128,
  minZilAmount: Uint128,
  minTokenAmount: Uint128,
  deadline: Uint128,
  is_community: Bool,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount; ThrowIfZero deadline;
  tag = "RemoveLiquidity"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  FetchServiceAddr_ ssi_init addrName; get_addr <- services[addrName];
  addr = option_bystr20_value get_addr; ThrowIfNullAddr addr;

  current_block <- &BLOCKNUMBER; this_deadline = builtin badd current_block deadline;
  
  match is_community with
  | False => | True =>
    LeaveCommunity_ dApp_addr amount this_deadline
  end;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero;
    token_address: addr;
    contribution_amount: amount;
    min_zil_amount: minZilAmount;
    min_token_amount: minTokenAmount;
    deadline_block: this_deadline } in one_msg m ; send msg;
  Timestamp
end

transition SwapExactZILForTokens(
  dApp: String,
  addrName: String,
  amount: Uint128,
  minTokenAmount: Uint128,
  deadline: Uint128,
  beneficiary: Option ByStr20,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "SwapExactZILForTokens"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp]; dApp_addr = option_bystr20_value get_dApp;
  FetchServiceAddr_ ssi_init addrName; get_addr <- services[addrName]; toAddr = option_bystr20_value get_addr;
  
  SwapExactZILForTokens_ dApp_addr toAddr amount minTokenAmount deadline beneficiary;
  Timestamp
end

transition SwapExactTokensForZIL(
  dApp: String,
  addrName: String,
  amount: Uint128,
  minZilAmount: Uint128,
  deadline: Uint128,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount; ThrowIfZero minZilAmount;
  tag = "SwapExactTokensForZIL"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp]; dApp_addr = option_bystr20_value get_dApp;
  FetchServiceAddr_ ssi_init addrName; get_addr <- services[addrName]; addr = option_bystr20_value get_addr;
  IncreaseAllowance addr dApp_addr amount;
  
  ThrowIfZero deadline;
  current_block <- &BLOCKNUMBER; this_deadline = builtin badd current_block deadline;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero;
    token_address: addr;
    token_amount: amount;
    min_zil_amount: minZilAmount;
    deadline_block: this_deadline;
    recipient_address: _this_address } in one_msg m ; send msg;
  Timestamp
end

transition SwapExactTokensForTokens(
  dApp: String,
  addrName: String,
  toAddrName: String,
  amount: Uint128,
  minTokenAmount: Uint128,
  deadline: Uint128,
  beneficiary: Option ByStr20,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "SwapExactTokensForTokens"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp]; dApp_addr = option_bystr20_value get_dApp;
  FetchServiceAddr_ ssi_init addrName; get_addr <- services[addrName]; addr = option_bystr20_value get_addr;
  IncreaseAllowance addr dApp_addr amount;

  FetchServiceAddr_ ssi_init toAddrName; get_toAddr <- services[toAddrName]; toAddr = option_bystr20_value get_toAddr;
  
  SwapExactTokensForTokens_ dApp_addr addr toAddr amount minTokenAmount deadline beneficiary;
  Timestamp
end

(***************************************************)
(*             ZIL staking transitions             *)
(***************************************************)

transition DelegateStake(
  dApp: String,
  ssnID: String,
  amount: Uint128,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  tag = "DelegateStake"; RequireContractOwner tyron tag;

  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  FetchServiceAddr_ ssi_init ssnID; get_ssnaddr <- services[ssnID];
  ssnaddr = option_bystr20_value get_ssnaddr; ThrowIfNullAddr ssnaddr;
  
  accept; msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: amount;
    ssnaddr: ssnaddr } in one_msg m; send msg;
  Timestamp
end

transition DelegateStakeSuccessCallBack(
  ssnaddr: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  Timestamp
end

transition WithdrawStakeRewards(
  dApp: String,
  ssnID: String,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "WithdrawStakeRewards"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  FetchServiceAddr_ ssi_init ssnID; get_ssnaddr <- services[ssnID];
  ssnaddr = option_bystr20_value get_ssnaddr; ThrowIfNullAddr ssnaddr;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero;
    ssnaddr: ssnaddr } in one_msg m; send msg;
  Timestamp
end

transition WithdrawStakeRewardsSuccessCallBack(
  ssnaddr: ByStr20,
  rewards: Uint128
  )
  RequireNotPaused; ThrowIfZero rewards;
  Timestamp
end  

transition WithdrawStakeAmt(
  dApp: String,
  ssnID: String,
  amount: Uint128,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  tag = "WithdrawStakeAmt"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  FetchServiceAddr_ ssi_init ssnID; get_ssnaddr <- services[ssnID];
  ssnaddr = option_bystr20_value get_ssnaddr; ThrowIfNullAddr ssnaddr;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero;
    ssnaddr: ssnaddr;
    amt: amount } in one_msg m; send msg;
  Timestamp
end

transition WithdrawStakeAmtSuccessCallBack(
  ssnaddr: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  Timestamp
end

transition CompleteWithdrawal(
  dApp: String,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "CompleteWithdrawal"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero } in one_msg m; send msg;
  Timestamp
end

transition CompleteWithdrawalSuccessCallBack(amount: Uint128)
  RequireNotPaused; ThrowIfZero amount;
  Timestamp
end

transition CompleteWithdrawalNoUnbondedStakeCallBack(
  amount: Uint128
  )
  RequireNotPaused;
  Timestamp
end

(* Change certain staking amount (amount) from current SSN (ssnID) to a different SSN (tossnID) *)
transition ReDelegateStake(
  dApp: String,
  ssnID: String,
  tossnID: String,
  amount: Uint128,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  tag = "ReDelegateStake"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  FetchServiceAddr_ ssi_init ssnID; get_ssnaddr <- services[ssnID];
  ssnaddr = option_bystr20_value get_ssnaddr; ThrowIfNullAddr ssnaddr;
  FetchServiceAddr_ ssi_init tossnID; get_tossnaddr <- services[tossnID];
  to_ssnaddr = option_bystr20_value get_tossnaddr; ThrowIfNullAddr to_ssnaddr;
  ThrowIfSameAddr ssnaddr to_ssnaddr;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero;
    ssnaddr: ssnaddr;
    to_ssn: to_ssnaddr;
    amount: amount } in one_msg m; send msg;
  Timestamp
end

transition ReDelegateStakeSuccessCallBack(
  ssnaddr: ByStr20,
  tossn: ByStr20,
  amount: Uint128
  )
  RequireNotPaused; ThrowIfZero amount;
  Timestamp
end

transition RequestDelegatorSwap(
  dApp: String,
  newDelegAddr: ByStr20,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "RequestDelegatorSwap"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  ThrowIfNullAddr newDelegAddr;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero;
    new_deleg_addr: newDelegAddr } in one_msg m; send msg;
  Timestamp 
end

(* Sent by the new delegator *)
transition ConfirmDelegatorSwap(
  dApp: String,
  requestor: ByStr20, (* The previous delegator *)
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "ConfirmDelegatorSwap"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  ThrowIfNullAddr requestor;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero;
    requestor: requestor } in one_msg m; send msg;
  Timestamp
end

transition RevokeDelegatorSwap(
  dApp: String,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "RevokeDelegatorSwap"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  
  msg = let m = { _tag: tag; _recipient: dApp_addr; _amount: zero } in one_msg m; send msg;
  Timestamp
end

(* Sent by the new delegator *)
transition RejectDelegatorSwap(
  dApp: String,
  requestor: ByStr20, (* The previous delegator *)
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "RejectDelegatorSwap"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  ThrowIfNullAddr requestor;
  
  msg = let m = { _tag: tag ; _recipient: dApp_addr; _amount: zero;
    requestor: requestor } in one_msg m; send msg;
  Timestamp
end

(***************************************************)
(*                 DeFi transitions                *)
(***************************************************)

transition JoinCommunity(
  dApp: String,
  addrName: String,
  amount: Uint128,
  deadline: Uint128,
  subdomain: Option String,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount; ThrowIfZero deadline;
  tag = "JoinCommunity"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp]; dApp_addr = option_bystr20_value get_dApp;
  FetchServiceAddr_ ssi_init addrName; get_addr <- services[addrName]; addr = option_bystr20_value get_addr;
  
  current_block <- &BLOCKNUMBER; this_deadline = builtin badd current_block deadline;

  JoinCommunity_ dApp_addr subdomain amount this_deadline;
  Timestamp
end

transition LeaveCommunity(
  dApp: String,
  amount: Uint128,
  deadline: Uint128,
  tyron: Option Uint128
  )
  RequireNotPaused; ThrowIfZero amount; ThrowIfZero deadline;
  tag = "LeaveCommunity"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  
  current_block <- &BLOCKNUMBER; this_deadline = builtin badd current_block deadline;
  
  LeaveCommunity_ dApp_addr amount this_deadline;
  Timestamp
end

transition MintAuth(
  dApp: String,
  beneficiary: Option ByStr20,
  amount: Uint128,
  auth: Bool,
  subdomain: Option String,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "Mint"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  ThrowIfZero amount;
  
  beneficiary_ = match beneficiary with
  | None => _this_address
  | Some addr => addr
  end;
  ThrowIfNullAddr beneficiary_;
  
  id <- nft_domain;
  match auth with
  | True =>
    msg = let m = { _tag: "MintSSI" ; _recipient: dApp_addr; _amount: zero;
      domain: id;
      subdomain: subdomain;
      recipient: beneficiary_;
      amount: amount } in one_msg m; send msg
  | False =>
    Mint_ dApp_addr beneficiary_ amount;
    Timestamp
  end
end

transition MintSuccessCallBack(
  minter: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  ThrowIfDifferentAddr minter _this_address;
  ThrowIfZero amount;
  Timestamp
end

transition RecipientAcceptMint(
  minter: ByStr20,
  recipient: ByStr20,
  amount: Uint128
  )
  RequireNotPaused;
  VerifyRecipient recipient;
  ThrowIfZero amount;
  Timestamp
end

transition BurnAuth(
  dApp: String,
  amount: Uint128,
  auth: Bool,
  subdomain: Option String,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "Burn"; RequireContractOwner tyron tag;
  
  ssi_init <-& init.dApp;
  FetchServiceAddr_ ssi_init dApp; get_dApp <- services[dApp];
  dApp_addr = option_bystr20_value get_dApp; ThrowIfNullAddr dApp_addr;
  ThrowIfZero amount;
  
  id <- nft_domain;
  match auth with
  | True =>
    msg = let m = { _tag: "BurnSSI" ; _recipient: dApp_addr; _amount: zero;
      domain: id;
      subdomain: subdomain;
      burn_account: _this_address;
      amount: amount } in one_msg m; send msg
  | False =>
    msg = let m = { _tag: tag ; _recipient: dApp_addr; _amount: zero;
      burn_account: _this_address;
      amount: amount } in one_msg m; send msg;
    Timestamp
  end
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

(* Includes fair launch *)
transition SwapTydraDEX(
  iDex: Option String, (* For the intermediate (int) token *)
  addrName: String, (* Input token ID *)
  iAddrName: Option String, (* Int token ID *)
  toAddrName: String, (* tyron *)
  amount: Uint128, (* Of input tokens *)
  allowance: Uint128, (* Of the input or int token *)
  minTokenAmount: Uint128, (* tyron *)
  minIntAmount: Uint128, (* Of the int token  *)
  deadline: Uint128,
  beneficiary: Option ByStr20,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "SwapTydraDEX"; RequireContractOwner tyron tag;
  ssi_init <-& init.dApp;
  
  (* Verify community token registration *)
  FetchServiceAddr_ ssi_init toAddrName; get_toAddr <- services[toAddrName];
  toAddr = option_bystr20_value get_toAddr; ThrowIfNullAddr toAddr;
  
  (* Fetch Community DEX *)
  dex = builtin concat toAddrName comm_id;
  FetchServiceAddr_ ssi_init dex; get_dex <- services[dex]; dex_addr = option_bystr20_value get_dex;
  get_comm <-& dex_addr as ByStr20 with contract
    field reserves: Pair Uint128 Uint128,
    field price: Uint256,
    field dv: Uint256,
    field is_fairlaunch: Bool end;
  
  match get_comm with
    | None => err = CodeIsNull; code = Int32 7; ThrowError err code
    | Some comm =>
      community := comm
    end;
  comm_addr <- community;
  
  (* Fetch S$I address *)
  FetchServiceAddr_ ssi_init ssi_id; get_ssiAddr <- services[ssi_id];
  ssi_addr = option_bystr20_value get_ssiAddr;
  
  (* S$I for the min token amount *)
  is_fl <-& comm_addr.is_fairlaunch;
  current_price <-& comm_addr.price; current_div <-& comm_addr.dv;
  current_reserves <-& comm_addr.reserves;
  ssi_reserve = let fst_element = @fst Uint128 Uint128 in fst_element current_reserves;
  token_reserve = let snd_element = @snd Uint128 Uint128 in snd_element current_reserves;
  
  ssi_amount = match is_fl with
  | True => compute_ssi minTokenAmount current_price current_div
  | False => get_output minTokenAmount token_reserve ssi_reserve fee_denom
  end;
  
  (* Address name null means ZIL as the input token *)
  is_null = builtin eq addrName empty_string; match is_null with
    | True => (* This means token0 = ZIL & amount in $ZIL *)
      iDex_ = option_string_value iDex; iAddrName_ = option_string_value iAddrName;
      FetchServiceAddr_ ssi_init iDex_; get_iDex <- services[iDex_]; idex_addr = option_bystr20_value get_iDex;
      FetchServiceAddr_ ssi_init iAddrName_; get_iAddr <- services[iAddrName_]; iAddr = option_bystr20_value get_iAddr;
  
      (* Get intermediate token *)
      SwapExactZILForTokens_ idex_addr iAddr amount minIntAmount deadline none_addr;

      match is_fl with
        | True => (* Send XSGD *)
          is_sgd = builtin eq iAddrName_ sgd_id; match is_sgd with
            | True => IncreaseAllowance iAddr dex_addr allowance
            | False => err = CodeNotValid; code = Int32 8; ThrowError err code
            end
        | False => (* Send S$I *)
          ThrowIfSameString iAddrName_ ssi_id;

          CallVault ssi_init iAddrName_ iAddr allowance ssi_amount;
          IncreaseAllowance ssi_addr dex_addr ssi_amount
        end
    | False =>
      (* Then from another token to the community token *)
      FetchServiceAddr_ ssi_init addrName; get_addr <- services[addrName]; addr = option_bystr20_value get_addr;

      match is_fl with
        | True => (* Send XSGD *)
          is_sgd = builtin eq addrName sgd_id; match is_sgd with
            | True => IncreaseAllowance addr dex_addr allowance
            | False => err = CodeNotValid; code = Int32 9; ThrowError err code
            end
        | False => (* Send S$I *)
          ThrowIfSameString addrName ssi_id;

          CallVault ssi_init addrName addr allowance ssi_amount;
          IncreaseAllowance ssi_addr dex_addr ssi_amount
        end
    end;
  SwapExactTokensForTokens_ dex_addr ssi_addr toAddr ssi_amount minTokenAmount deadline beneficiary;
  Timestamp
end

(***************************************************)
(*                 SBT transitions                 *)
(***************************************************)

(* Configures the public encryption for this xWALLET as the SBT issuer's data. *)
transition UpdatePublicEncryption(
  new: String,
  tyron: Option Uint128
  )
  RequireNotPaused;
  tag = "UpdatePublicEncryption"; RequireContractOwner tyron tag;
  
  public_encryption := new;
  ver <- version; e = { _eventname: "SSIDApp_PublicEncryption_Updated"; version: ver;
    newVal: new }; event e;
  Timestamp
end

transition Ivms101(
  issuerName: String,
  message: String,   (* encrypted IVMS101 message *)
  userSignature: Option ByStr64,
  tyron: Option Uint128
  )
  RequireNotPaused; ssi_init <-& init.dApp; 
  id <- nft_domain; domain = builtin to_string id;

  get_did <-& ssi_init.did_dns[domain]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 10; ThrowError err code
    | Some did_ =>
        controller <-& did_.controller;
        verified = builtin eq _origin controller; match verified with
        | True => SupportTyron ssi_init tyron
        | False =>
          get_didkey <-& did_.verification_methods[domain]; did_key = option_bystr33_value get_didkey;
          signed_data = let hash = builtin sha256hash message in builtin to_bystr hash;
          signature = option_bystr64_value userSignature; ThrowIfNullSig signature;
          is_right_signature = builtin schnorr_verify did_key signed_data signature; match is_right_signature with
            | True => | False => err = CodeWrongSignature; code = Int32 11; ThrowError err code
            end
        end
    end;
  
  ivms101[issuerName] := message;
  ver <- version; e = { _eventname: "SSIDApp_NewIvms101"; version: ver;
    issuerName: issuerName;
    ivms101: message }; event e;
  Timestamp
end

transition Verifiable_Credential(
  issuerName: String,
  issuerDomain: String,
  issuerSignature: ByStr64
  )
  RequireNotPaused; get_msg <- ivms101[issuerName];
  
  ssi_init <-& init.dApp; get_did <-& ssi_init.did_dns[issuerName]; match get_did with
    | None => err = CodeDidIsNull; code = Int32 12; ThrowError err code
    | Some did_ =>
        get_didkey <-& did_.verification_methods[issuerDomain]; did_key = option_bystr33_value get_didkey;
        match get_msg with
        | None => err = CodeIsNull; code = Int32 13; ThrowError err code
        | Some msg =>
            signed_data = let hash = builtin sha256hash msg in builtin to_bystr hash;
            is_right_signature = builtin schnorr_verify did_key signed_data issuerSignature; match is_right_signature with
              | True =>
                sbt[issuerName] := issuerSignature;
                ver <- version; e = { _eventname: "SSIDApp_NewSBT"; version: ver;
                  issuerDomainName: issuerName;
                  issuerSubDomain: issuerDomain;
                  issuerDIDKey: did_key;
                  issuerDIDSignature: issuerSignature;
                  ivms101: msg;
                  signedData: signed_data }; event e
              | False => err = CodeWrongSignature; code = Int32 14; ThrowError err code
              end
        end
    end;
  Timestamp
end
  
`

            const contract_init = [
                {
                    vname: '_scilla_version',
                    type: 'Uint32',
                    value: '0',
                },
                {
                    vname: 'init_nft',
                    type: 'ByStr32',
                    value: `${domainId}`,
                },
                {
                    vname: 'init',
                    type: 'ByStr20',
                    value: `${init_}`,
                },
                {
                    vname: 'init_community',
                    type: 'ByStr20',
                    value: `${init_community}`,
                },
            ]

            const contract = contracts.new(code, contract_init)
            const [tx, deployed_contract] = await contract.deploy({
                gasLimit: '55000',
                gasPrice: '2000000000',
            })
            return [tx, deployed_contract]
        } catch (error) {
            throw error
        }
    }

    async deployDomainBetaVC(net: string, username: string, domain: string) {
        try {
            //@xalkan
            let init_ = '0x2d7e1a96ac0592cd1ac2c58aa1662de6fe71c5b9'

            if (net === 'testnet') {
                init_ = '0xec194d20eab90cfab70ead073d742830d3d2a91b'
            }

            const zilPay = await this.zilpay()
            const { contracts } = zilPay

            //@review: update xwallets
            const code = `
            (* v1.4.1
              SBTxWALLET: Soulbound Smart Contract Wallet <> DID Domain Name System
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
              
              library SBT
                let one_msg =
                  fun( msg: Message ) =>
                  let nil_msg = Nil{ Message } in Cons{ Message } msg nil_msg
              
                let null = ""
                let zero = Uint128 0
                let zeroByStr20 = 0x0000000000000000000000000000000000000000
                let zeroByStr33 = 0x000000000000000000000000000000000000000000000000000000000000000000
                let zeroByStr64 = 0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
                
                let option_value = tfun 'A => fun( default: 'A ) => fun( input: Option 'A) =>
                  match input with
                  | Some v => v
                  | None => default end
                let option_bystr20_value = let f = @option_value ByStr20 in f zeroByStr20
                let option_bystr33_value = let f = @option_value ByStr33 in f zeroByStr33
                let option_bystr64_value = let f = @option_value ByStr64 in f zeroByStr64
              
                let true = True
                let false = False
              
              contract SBT(
                init_username: String,
                domain: String,
                init: ByStr20 with contract field dApp: ByStr20 with contract
                  field dns: Map String ByStr20,
                  field did_dns: Map String ByStr20 with contract
                    field controller: ByStr20, 
                    field verification_methods: Map String ByStr33 end end end
                )
                field nft_username: String = init_username
                field pending_username: String = null
                field paused: Bool = false
                
                field tx_number: Uint128 = zero
                field public_encryption: String = "bYACKEqduFtw5iZQVra42h1UAINo4ujJRYNNGNxVlCL-Fs46bBdo_S4EJRrgMJRhiqeUPKHRuu_daZFRHBWCjILdC5cc5mjSkQVIu30jJiaA_7G9FCYqVQnnKa0ZKn52DsT2f8bYSNHpDLpcmqcKqdW4Z8tgCtd9zhzZ4TchO9_-xPQ7T7v4Y-AIB0-Al8HwU2cvA_N17f7VHps2ZfMG88qVxOUlBJTlb6n60vZX_4laKavvyLz3zvbOUVhnI4L0VURiM_Z_1rF5rna7QNK9wU-40FqK8VMNW3DJFAVCVMvsMCUwqXnVZo35gKcG1LW8A7TBdTPlJ7ICtTRaS45QZ7fIz1pLiEg0R4n0NPP5N12YJQCnrZyLfsRPPjUZXfHdaKSxsYDDsiDOhWxkBCx3ScvIKYJDLK1jh0YhmQiATiCMMrM0mBFZ6cfNifCXDGV97dpKxnFfLNUMlV1sIUiSoryf8cK2DV15fbBWw8UqO254yqO4Eczf1LvDd4sXIUR9x9DhRAi_MYb4owiY8xBdRmggrlHrH2cducqX8znKOfQ_o6u7H3wU_f7qjzVfOFUsKnZC4mPp6dPTKyqK9fCAXGKIgxzL3Cd22v6zxo54-eovWHbESaj9h6PZ64duumrq3HAzHdn20XtynFJxwo9bNxXx0WxgVkrc-Hak64iazWVjQbGK6J-NJ996qpPZt-71YIbFqMI-fgZvt3eZZxfOsvtE7R8sbeThrZmWC42j94pvbmik3jcYsaAoSD_ct2b9qKWzSKqj-o_ZQAPvblpT9YeKY7tgygJgll_p75eQe38A8fpKDAMtTW1rOagzBGA2I1lYe_wu_BB6SuT2Mdq_Hh5_C5zDQRXs6klKxft2NB3siM4C4B6VH0hE2bZXl7KdnNdCAEdyPuRpXP5_XkYmWGBI6ZJvf6iP1wpTjQfpz54dGK-GQGo0FEH0zDtzbUUHs7oq5a7KiUeQEPmrzluphfcUIv7vMROn-UYoMsz38nd3W5VPKVVofe756p_MsjGu"
                field ivms101: Map String String = Emp String String
                field sbt: Map String ByStr64 = Emp String ByStr64
                field version: String = "SBTxWallet-1.4.1" (* @todo *)
              
              procedure SupportTyron( tyron: Option Uint128 )
                match tyron with
                | None => | Some donation =>
                    current_init <-& init.dApp; donateDApp = "donate";
                    get_addr <-& current_init.dns[donateDApp]; addr = option_bystr20_value get_addr;
                    accept; msg = let m = { _tag: "AddFunds"; _recipient: addr; _amount: donation } in one_msg m; send msg end end
              
              procedure VerifyController( tyron: Option Uint128 )
                current_username <- nft_username; current_init <-& init.dApp;
                get_did <-& current_init.did_dns[current_username]; match get_did with
                | None => e = { _exception : "SBTxWallet-DidIsNull" }; throw e
                | Some did_ =>
                    current_controller <-& did_.controller;
                    verified = builtin eq _origin current_controller; match verified with
                    | True => SupportTyron tyron
                    | False => e = { _exception : "SBTxWallet-WrongCaller" }; throw e end end end
              
              procedure Timestamp()
                latest_tx_number <- tx_number; new_tx_number = let incrementor = Uint128 1 in builtin add latest_tx_number incrementor;
                tx_number := new_tx_number end
              
              procedure IsNotPaused()
                is_paused <- paused; match is_paused with
                  | False => | True => e = { _exception: "SBTxWallet-WrongStatus" }; throw e end end
                
              procedure IsPaused()
                is_paused <- paused; match is_paused with
                  | True => | False => e = { _exception: "SBTxWallet-WrongStatus" }; throw e end end
              
              procedure ThrowIfSameName(
                a: String,
                b: String
                )
                is_same = builtin eq a b; match is_same with
                  | False => | True => e = { _exception: "SBTxWallet-SameUsername" }; throw e end end
              
              transition UpdateUsername(
                username: String,
                tyron: Option Uint128
                )
                IsNotPaused; VerifyController tyron;
                current_username <- nft_username; ThrowIfSameName current_username username;
                current_init <-& init.dApp;
                get_did <-& current_init.did_dns[username]; match get_did with
                  | Some did_ => pending_username := username
                  | None => e = { _exception: "SBTxWallet-DidIsNull" }; throw e end;
                Timestamp end
              
              transition AcceptPendingUsername()
                IsNotPaused; current_pending <- pending_username;
                current_init <-& init.dApp;
                get_did <-& current_init.did_dns[current_pending]; match get_did with
                  | None => e = { _exception: "SBTxWallet-DidIsNull" }; throw e
                  | Some did_ =>
                    current_controller <-& did_.controller;
                    verified = builtin eq _origin current_controller; match verified with
                      | True => | False => e = { _exception: "SBTxWallet-WrongCaller" }; throw e end;
                    nft_username := current_pending; pending_username := null end;
                Timestamp end
              
              transition Pause( tyron: Option Uint128 )
                IsNotPaused; VerifyController tyron; paused := true;
                e = { _eventname: "DidDomainPaused";
                  pauser: _sender }; event e;
                Timestamp end
              
              transition Unpause( tyron: Option Uint128 )
                IsPaused; VerifyController tyron; paused := false;
                e = { _eventname: "DidDomainUnpaused";
                  pauser: _sender }; event e;
                Timestamp end
              
              transition UpdatePublicEncryption(
                new: String,
                tyron: Option Uint128
                )
                VerifyController tyron;
                IsNotPaused; public_encryption := new end
              
              transition Ivms101(
                issuerName: String,
                message: String,   (* encrypted IVMS101 message *)
                userSignature: Option ByStr64,
                tyron: Option Uint128
                )
                IsNotPaused;
                current_username <- nft_username;
                current_init <-& init.dApp; get_did <-& current_init.did_dns[current_username]; match get_did with
                  | None => e = { _exception: "SBTxWallet-DidIsNull" }; throw e
                  | Some did_ =>
                      current_controller <-& did_.controller;
                      verified = builtin eq _origin current_controller; match verified with
                      | True => SupportTyron tyron
                      | False =>
                        get_didkey <-& did_.verification_methods[domain]; did_key = option_bystr33_value get_didkey;
                        signed_data = let hash = builtin sha256hash message in builtin to_bystr hash;
                        signature = option_bystr64_value userSignature;
                        is_right_signature = builtin schnorr_verify did_key signed_data signature; match is_right_signature with
                          | True => | False => e = { _exception: "SBTxWallet-WrongSignature" }; throw e end end end;
                ivms101[issuerName] := message;
                e = { _eventname: "NewIvms101";
                  issuerName: issuerName }; event e;
                Timestamp end
              
              transition Verifiable_Credential(
                issuerName: String,
                issuerDomain: String,
                issuerSignature: ByStr64
                )
                IsNotPaused; get_msg <- ivms101[issuerName];
                current_init <-& init.dApp; get_did <-& current_init.did_dns[issuerName]; match get_did with
                  | None => e = { _exception: "SBTxWallet-DidIsNull" }; throw e
                  | Some did_ =>
                      get_didkey <-& did_.verification_methods[issuerDomain]; did_key = option_bystr33_value get_didkey;
                      match get_msg with
                      | None => e = { _exception: "SBTxWallet-MsgIsNull" }; throw e
                      | Some msg =>
                          signed_data = let hash = builtin sha256hash msg in builtin to_bystr hash;
                          is_right_signature = builtin schnorr_verify did_key signed_data issuerSignature; match is_right_signature with
                          | False => e = { _exception: "SBTxWallet-WrongSignature" }; throw e
                          | True => sbt[issuerName] := issuerSignature end end end;
                Timestamp end
            `

            const contract_init = [
                {
                    vname: '_scilla_version',
                    type: 'Uint32',
                    value: '0',
                },
                {
                    vname: 'init_username',
                    type: 'String',
                    value: `${username}`,
                },
                {
                    vname: 'domain',
                    type: 'String',
                    value: `${domain}`,
                },
                {
                    vname: 'init',
                    type: 'ByStr20',
                    value: `${init_}`,
                },
            ]

            const contract = contracts.new(code, contract_init)
            const [tx, deployed_contract] = await contract.deploy({
                // gasLimit: '35000',
                gasLimit: '50000',
                gasPrice: '2000000000',
            })
            return [tx, deployed_contract]
        } catch (error) {
            throw error
        }
    }
}
