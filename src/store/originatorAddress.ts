import { createDomain } from 'effector'

export interface OriginatorAddress {
    value?: string
    username?: string
}

const originatorAddressDomain = createDomain()
export const updateOriginatorAddress =
    originatorAddressDomain.createEvent<OriginatorAddress | null>()
export const $originatorAddress = originatorAddressDomain
    .createStore<OriginatorAddress | null>(null)
    .on(updateOriginatorAddress, (_, payload) => payload)
