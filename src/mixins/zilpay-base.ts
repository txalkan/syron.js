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

type Params = {
  contractAddress: string;
  transition: string;
  params: object[];
  amount: string;
};

const window = global.window as any;
export const DEFAUL_GAS = {
  gasPrice: `2500`,
  gaslimit: `5000`,
};
export class ZilPayBase {
  public zilpay: () => Promise<any>;

  constructor() {
    this.zilpay = () => new Promise((resolve, reject) => {
      if (!process.browser) {
        return resolve({} as any);
      }
      let k = 0;
      const i = setInterval(() => {
        if (k >= 10) {
          clearInterval(i);
          return reject(new Error(`ZIlPay is not installed.`));
        }

        if (typeof window.zilPay !== `undefined`) {
          clearInterval(i);
          return resolve(window.zilPay);
        }

        k++;
      }, 100);
    });
  }

  async getSubState(contract: string, field: string, params: string[] = []) {
    if (!process.browser) {
      return null;
    }

    const zilPay = await this.zilpay();
    const res = await zilPay.blockchain.getSmartContractSubState(
      contract,
      field,
      params,
    );

    if (!res) {
      throw new Error('ZIlPay is not loaded yet');
    }

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
    if (!process.browser) {
      return null;
    }
    const zilPay = await this.zilpay();
    const res = await zilPay.blockchain.getSmartContractState(contract);

    if (!res) {
      throw new Error('ZIlPay is not loaded yet');
    }

    if (res.error) {
      throw new Error(res.error.message);
    }

    return res.result;
  }

  async getBlockchainInfo() {
    if (!process.browser) {
      return null;
    }

    const zilPay = await this.zilpay();
    const { error, result } = await zilPay.blockchain.getBlockChainInfo();

    if (error) {
      throw new Error(error.message);
    }

    return result;
  }

  async call(data: Params, gaslimit = DEFAUL_GAS.gaslimit) {
    const zilPay = await this.zilpay();
    const { contracts, utils } = zilPay;
    const contract = contracts.at(data.contractAddress);
    const gasPrice = utils.units.toQa(DEFAUL_GAS.gasPrice, utils.units.Units.Li);
    const gasLimit = utils.Long.fromNumber(gaslimit);
    const amount = data.amount || `0`;

    return await contract.call(data.transition, data.params, {
      amount,
      gasPrice,
      gasLimit,
    });
  }
}
