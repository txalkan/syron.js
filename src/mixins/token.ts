/*
ZilPay.io
Copyright (c) 2023 by Rinat <https://github.com/hicaru>
All rights reserved.
You acknowledge and agree that ZilPay owns all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this file (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this software.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of ZilPay; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by ZilPay in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of ZilPay or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*/

//@review
import { addTransactions } from "../store/transactions";
import { Blockchain } from "./custom-fetch";
import { ZilPayBase } from "./zilpay-base";

export class TokensMixine {
  private _provider = new Blockchain();

  public zilpay = new ZilPayBase();

  public isAllow(value: string, allowances: string) {
    const bigValue = BigInt(value);
    const bigAllow = BigInt(allowances);

    return bigValue < bigAllow;
  }

  public async getAllowances(spender: string, contract: string): Promise<bigint> {
    const field = `allowances`;
    const zilpay = await this.zilpay.zilpay();
    if (!zilpay.wallet.isEnable) {
      await zilpay.wallet.connect();
    }
    const owner = String(zilpay.wallet.defaultAccount?.base16).toLowerCase();
    const address = spender.toLowerCase();
    const result = await this.zilpay.getSubState(contract, field, [
      owner,
      address
    ]);

    if (result && result[owner] && result[owner][address]) {
      return BigInt(result[owner][address]);
    }

    return BigInt(0);
  }

  public async increaseAllowance(spender: string, token: string, balance: string) {
    const params = [
      {
        vname: `spender`,
        type: `ByStr20`,
        value: String(spender),
      },
      {
        vname: `amount`,
        type: `Uint128`,
        value: String(balance),
      },
    ];
    const transition = `IncreaseAllowance`;
    const res = await this.zilpay.call({
      transition,
      params,
      amount: `0`,
      contractAddress: token
    });

    addTransactions({
      timestamp: new Date().getTime(),
      name: `Approve token`,
      confirmed: false,
      hash: res.ID,
      from: res.from
    });

    return res;
  }
}
