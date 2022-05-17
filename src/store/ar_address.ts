import { createDomain } from 'effector'

export let ar_address: string

const newArAddressDomain = createDomain()
export const updateArAddress = newArAddressDomain.createEvent<string>()
export const $ar_address = newArAddressDomain
    .createStore<string | null>(null)
    .on(updateArAddress, (_, payload) => payload)
