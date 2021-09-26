import { ZIlPayInject } from '../../types/zil-pay';

type Params = {
  contractAddress: string;
  transition: string;
  params: Record<string, unknown>[];
  amount: string;
};

const window = global.window as any;
const DEFAUL_GAS = {
  gasPrice: '2000',
  gaslimit: '5000'
};
export class ZilPayBase {
  public zilpay: () => Promise<ZIlPayInject>;

  constructor() {
    this.zilpay = () => new Promise((resolve, reject) => {
      if (!(process as any).browser) {
        return resolve({} as any);
      }
      let k = 0;
      const i = setInterval(() => {
        if (k >= 10) {
          clearInterval(i);
          return reject(new Error('ZIlPay is not installed.'));
        }

        if (typeof window['zilPay'] !== 'undefined') {
          clearInterval(i);
          return resolve(window['zilPay']);
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
    const res = await zilPay
      .blockchain
      .getSmartContractSubState(
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
    const res = await zilPay
      .blockchain
      .getSmartContractState(
        contract
      );

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
    const { error, result } = await zilPay
      .blockchain
      .getBlockChainInfo();

    if (error) {
      throw new Error(error.message);
    }

    return result;
  }

  async call(data: Params, gas = DEFAUL_GAS) {
    const zilPay = await this.zilpay();
    const { contracts, utils } = zilPay;
    const contract = contracts.at(data.contractAddress);
    const gasPrice = utils.units.toQa(gas.gasPrice, utils.units.Units.Li);
    const gasLimit = utils.Long.fromNumber(gas.gaslimit);
    const amount = data.amount || '0';

    return await contract.call(
      data.transition,
      data.params,
      {
        amount,
        gasPrice,
        gasLimit
      }
    );
  }
}
