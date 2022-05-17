import { createDomain } from 'effector'
import * as tyron from 'tyron'
export interface Contract {
    addr: string // contract address
    controller?: string // admin address
    status?: tyron.Sidetree.DIDStatus
}

const contractDomain = createDomain()
export const updateContract = contractDomain.createEvent<Contract | null>()
export const $contract = contractDomain
    .createStore<Contract | null>(null)
    .on(updateContract, (_, payload) => payload)
