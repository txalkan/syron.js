import { createDomain } from 'effector';

export interface Contract {
    addr: string; // contract address
    base16: string; // admin address
}

const contractDomain = createDomain();
export const updateContract = contractDomain.createEvent<Contract>();
export const $contract = contractDomain
    .createStore<Contract | null>(null)
    .on(updateContract, (_, payload) => payload);
