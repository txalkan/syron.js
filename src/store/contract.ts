import { createDomain } from 'effector';

export interface Contract {
    addr: string; // contract address
    base16: string; // admin address
    isAdmin: boolean // is the ZilPay address the admin of the contract
}

const contractDomain = createDomain();
export const updateContract = contractDomain.createEvent<Contract | null>();
export const $contract = contractDomain
    .createStore<Contract | null>(null)
    .on(updateContract, (_, payload) => payload);
