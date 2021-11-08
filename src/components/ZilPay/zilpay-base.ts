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
    gaslimit: '20000'
};

//@todo migrate to env variable
const XWALLET = '0xa8FA5eB0e599277f048FC4AB019024b3dBEBF28A';
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
				vname: 'init',
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

    async deployDomain(domain: string, address: string) {
        const zilPay = await this.zilpay();
        const { contracts } = zilPay;
        let addr = ''; 
        switch (domain) {
            case 'dex':
                addr = '0x440a4d55455dE590fA8D7E9f29e17574069Ec05e'
                break;
            case 'stake':
                addr = '0xD06266c282d0FF006B9D3975C9ABbf23eEd6AB22'
                break;
        }
        const template = contracts.at(addr);
        const code = await template.getCode();
        
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
