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

  async deployDid(net: string, address: string) {
    try {
      const zilPay = await this.zilpay();
      const { contracts } = zilPay;

      //mainnet addresses
      let XWALLET = "0xea26f06e1a6be1d2fb80be5ba5d3fd17a6d584a9";
      let init_tyron = "0xe574a9e78f60812be7c544d55d270e75481d0e93";

      if (net === "testnet") {
        XWALLET = "zil1scsqp94hzxtwktnpu5ac6getqn9n73zyw5xf8e";
        init_tyron = "0x8b7e67164b7fba91e9727d553b327ca59b4083fc";
      }
      const xwallet = contracts.at(XWALLET);
      const code = await xwallet.getCode();

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
      ];
      const contract = contracts.new(code, init);
      const [tx, deployed_contract] = await contract.deploy({
        gasLimit: "30000",
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
}
