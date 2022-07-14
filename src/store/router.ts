import { createDomain } from 'effector'

const prevDomain = createDomain()
export const updatePrev = prevDomain.createEvent<any>()
export const $prev = prevDomain
    .createStore<any | null>(null)
    .on(updatePrev, (_, payload) => payload)
