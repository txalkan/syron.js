import { createDomain } from 'effector';

export interface Contract {
    addr: string; // contract address
    controller: string; // admin address
}

const contractDomain = createDomain();
export const updateContract = contractDomain.createEvent<Contract | null>();
export const $contract = contractDomain
    .createStore<Contract | null>(null)
    .on(updateContract, (_, payload) => payload);
