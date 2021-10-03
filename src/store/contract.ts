import { createDomain } from 'effector';

export interface Contract {
    base16: string;
    addr: string;
    isAdmin: boolean
}

const contractDomain = createDomain();
export const updateContract = contractDomain.createEvent<Contract | null>();
export const $contract = contractDomain
    .createStore<Contract | null>(null)
    .on(updateContract, (_, payload) => payload);
