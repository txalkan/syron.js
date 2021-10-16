import { ZIlPayInject } from '../../types/zil-pay';
import { initTyron } from '../SearchBar/utils';
import * as zutil from '@zilliqa-js/util'

type Params = {
    contractAddress: string;
    transition: string;
    params: Record<string, unknown>[];
    amount: string;
};

const window = global.window as any;
const DEFAULT_GAS = {
    gasPrice: '2000',
    gaslimit: '10000'
};
const XWALLET = '0x05A668eA6667f365BC61450E2d5e0F80dc16f921'; //@todo migrate to env variable
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
                        return reject(new Error('ZilPay is not installed.'));
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

    async call(data: Params, gas = DEFAULT_GAS) {
        const zilPay = await this.zilpay();
        const { contracts, utils } = zilPay;
        const contract = contracts.at(data.contractAddress);
        const gasPrice = utils.units.toQa(gas.gasPrice, utils.units.Units.Li);
        const gasLimit = utils.Long.fromNumber(gas.gaslimit);
        const amount_ = zutil.units.toQa(data.amount, zutil.units.Units.Zil);

        const amount = amount_ || '0';

        return await contract.call(data.transition, data.params, {
            amount,
            gasPrice,
            gasLimit
        });
    }

    async deployDid(address: string) {
        const zilPay = await this.zilpay();
        const { contracts } = zilPay;
        const xwallet = contracts.at(XWALLET);
        const code = await xwallet.getCode();
        
        const init = [
            {
                vname: '_scilla_version',
                type: 'Uint32',
                value: '0'
            },
            {
                vname: 'init_controller', //@todo-net handle deployment error
                type: 'ByStr20',
                value: `${address}`
            },
            {
				vname: 'init_tyron',
				type: 'ByStr20',
				value: `${initTyron}`,
			}
        ];
        const contract = contracts.new(code.code, init);

        const [tx, deployed_contract] = await contract.deploy({
            gasLimit: '50000',
            gasPrice: '2000000000'
        });
        return [tx, deployed_contract]
    }
}
